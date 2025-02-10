import pool from '../config/db.js';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';

// Initialize Google OAuth2Client
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.CLIENT_URL}/api/auth/google/callback`
);

// Helper function to refresh Google token
const refreshGoogleToken = async (refreshToken) => {
  try {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
};

// Helper function to fetch Google Fit data
const fetchGoogleFitData = async (accessToken, refreshToken) => {
  try {
    let token = accessToken;

    // Validate Token
    try {
      const tokenInfo = await oAuth2Client.getTokenInfo(token);
      if (oAuth2Client.credentials.expiry_date < Date.now()) {
        token = await refreshGoogleToken(refreshToken);
      }
    } catch (err) {
      token = await refreshGoogleToken(refreshToken);  // Refresh if invalid
    }

    if (!token) throw new Error('Failed to refresh Google token');

    const headers = { Authorization: `Bearer ${token}` };

    const endpoints = [
      { name: 'steps', dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps' },
      { name: 'heartRate', dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm' },
      { name: 'calories', dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended' },
      { name: 'bloodPressure', dataSourceId: 'derived:com.google.blood_pressure:com.google.android.gms:merged' },
      { name: 'spo2', dataSourceId: 'derived:com.google.oxygen_saturation:com.google.android.gms:merged' },
    ];

    const today = new Date();
    const startTime = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endTime = Date.now();

    const data = {};

    for (const endpoint of endpoints) {
      const response = await axios.post(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
        {
          aggregateBy: [{ dataSourceId: endpoint.dataSourceId }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
        { headers }
      );

      const bucket = response.data.bucket[0];
      const dataset = bucket?.dataset[0]?.point[0]?.value[0];
      data[endpoint.name] = dataset?.intVal || dataset?.fpVal || 0;
    }

    return data;
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    return {};
  }
};

// Get patient details including health info
export const getPatientDetails = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Fetch patient_info
    const healthResult = await pool.query('SELECT * FROM patient_info WHERE patient_id = $1', [req.patientId]);
    const healthInfo = healthResult.rows[0] || {};

    const { password, google_fit_token, google_refresh_token, ...patientDetails } = patient;

    let googleFitData = {};
    if (google_fit_token && google_refresh_token) {
      googleFitData = await fetchGoogleFitData(google_fit_token, google_refresh_token);
    }

    return res.status(200).json({
      success: true,
      patient: { ...patientDetails, googleFitData, healthInfo },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient details including health info
export const updatePatientDetails = async (req, res) => {
  const { firstName, lastName, address, city, state, pincode, phoneNumber, googleFitToken, googleRefreshToken, ...healthInfo } = req.body;

  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Update patients table
    await pool.query(
      `UPDATE patients
       SET first_name = $1, last_name = $2, address = $3, city = $4, state = $5, pincode = $6, phone_number = $7, google_fit_token = $8, google_refresh_token = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        firstName || patient.first_name,
        lastName || patient.last_name,
        address || patient.address,
        city || patient.city,
        state || patient.state,
        pincode || patient.pincode,
        phoneNumber || patient.phone_number,
        googleFitToken || patient.google_fit_token,
        googleRefreshToken || patient.google_refresh_token,
        req.patientId,
      ]
    );

    // Check if patient_info exists
    const healthResult = await pool.query('SELECT * FROM patient_info WHERE patient_id = $1', [req.patientId]);
    if (healthResult.rows.length > 0) {
      // Update existing health record
      await pool.query(
        `UPDATE patient_info
         SET date_of_birth = $1, gender_identity = $2, height = $3, weight = $4, blood_type = $5,
             smokes = $6, cigarettes_per_day = $7, alcohol = $8, drinks_per_week = $9, recreational_drugs = $10,
             drug_details = $11, exercise_frequency = $12, diet_description = $13, sleep_hours = $14, stress_level = $15
         WHERE patient_id = $16`,
        [
          healthInfo.date_of_birth || healthResult.rows[0].date_of_birth,
          healthInfo.gender_identity || healthResult.rows[0].gender_identity,
          healthInfo.height || healthResult.rows[0].height,
          healthInfo.weight || healthResult.rows[0].weight,
          healthInfo.blood_type || healthResult.rows[0].blood_type,
          healthInfo.smokes,
          healthInfo.cigarettes_per_day,
          healthInfo.alcohol,
          healthInfo.drinks_per_week,
          healthInfo.recreational_drugs,
          healthInfo.drug_details,
          healthInfo.exercise_frequency,
          healthInfo.diet_description,
          healthInfo.sleep_hours,
          healthInfo.stress_level,
          req.patientId,
        ]
      );
    } else {
      // Insert new health record
      await pool.query(
        `INSERT INTO patient_info (patient_id, date_of_birth, gender_identity, height, weight, blood_type,
          smokes, cigarettes_per_day, alcohol, drinks_per_week, recreational_drugs, drug_details, exercise_frequency,
          diet_description, sleep_hours, stress_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [req.patientId, healthInfo.date_of_birth, healthInfo.gender_identity, healthInfo.height, healthInfo.weight, healthInfo.blood_type,
          healthInfo.smokes, healthInfo.cigarettes_per_day, healthInfo.alcohol, healthInfo.drinks_per_week, healthInfo.recreational_drugs,
          healthInfo.drug_details, healthInfo.exercise_frequency, healthInfo.diet_description, healthInfo.sleep_hours, healthInfo.stress_level]
      );
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
