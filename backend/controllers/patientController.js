import { google } from "googleapis";
import pool from "../config/db.js";
import cron from 'node-cron'

const getGoogleFitData = async (googleFitToken, googleRefreshToken) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleFitToken,
      refresh_token: googleRefreshToken,
    });

    // Refresh access token if expired
    if (!googleFitToken && googleRefreshToken) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        googleFitToken = credentials.access_token;
      } catch (refreshError) {
        return null;
      }
    }

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });

    // Define Time Range (Start of Today to Now)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTimeNs = startOfDay.getTime() * 1e6; // Nanoseconds
    const endTimeNs = now.getTime() * 1e6;

    // Function to fetch data from Google Fit
    const fetchDataset = async (dataSourceId) => {
      try {
        const response = await fitness.users.dataSources.datasets.get({
          userId: "me",
          dataSourceId,
          datasetId: `${startTimeNs}-${endTimeNs}`,
        });

        return response.data.point || [];
      } catch (error) {
        return [];
      }
    };

    // Helper to round numbers to at most 2 decimals
    const round2 = (val) => (typeof val === "number" ? Math.round(val * 100) / 100 : val);

    // Fetch metrics
    const stepsData = await fetchDataset("derived:com.google.step_count.delta:com.google.android.gms:estimated_steps");
    const caloriesData = await fetchDataset("derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended");
    const distanceData = await fetchDataset("derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta");
    const heartRateData = await fetchDataset("derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm");
    const spO2Data = await fetchDataset("derived:com.google.oxygen_saturation:com.google.android.gms:merge_oxygen_saturation");
    const bloodPressureData = await fetchDataset("derived:com.google.blood_pressure:com.google.android.gms:merge_blood_pressure");
    const activeMinutesData = await fetchDataset("derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes");
    const floorsClimbedData = await fetchDataset("derived:com.google.floor_count.delta:com.google.android.gms:merge_floors_climbed");
    const sleepDurationData = await fetchDataset("derived:com.google.sleep.duration:com.google.android.gms:merge_sleep_duration");
    const bodyFatData = await fetchDataset("derived:com.google.body.fat.percentage:com.google.android.gms:merge_body_fat_percentage");
    const bmiData = await fetchDataset("derived:com.google.bmi:com.google.android.gms:merge_bmi");
    const waterIntakeData = await fetchDataset("derived:com.google.water:com.google.android.gms:merge_water");
    const activeEnergyData = await fetchDataset("derived:com.google.active_energy_burned:com.google.android.gms:merge_active_energy");
    const exerciseMinutesData = await fetchDataset("derived:com.google.exercise_minutes:com.google.android.gms:merge_exercise_minutes");
    

    // Extract data (including respiratory rate)
    const stepsWalked = stepsData.reduce((total, point) => total + (point.value?.[0]?.intVal || 0), 0);
    const caloriesBurned = caloriesData.reduce((total, point) => total + (point.value?.[0]?.fpVal || 0), 0);
    const distanceWalked = distanceData.reduce((total, point) => total + (point.value?.[0]?.fpVal || 0), 0);
    const recentHeartRate = heartRateData.length
      ? heartRateData[heartRateData.length - 1].value?.[0]?.fpVal || 0
      : null;
    // const recentPulseRate = pulseRateData.length
    //   ? pulseRateData[pulseRateData.length - 1].value?.[0]?.fpVal || 0
    //   : 0;
    const recentSpO2 = spO2Data.length
      ? spO2Data[spO2Data.length - 1].value?.[0]?.fpVal || 0
      : null;

    let systolic = null,
      diastolic = null;
    if (bloodPressureData.length) {
      const latestBP = bloodPressureData[bloodPressureData.length - 1];
      systolic = latestBP.value?.[0]?.fpVal || null;
      diastolic = latestBP.value?.[1]?.fpVal || null;
    }

    const activeMinutes = activeMinutesData.reduce((total, point) => total + (point.value?.[0]?.intVal || 0), 0);
    const floorsClimbed = floorsClimbedData.reduce((total, point) => total + (point.value?.[0]?.intVal || 0), 0);
    const sleepDuration = sleepDurationData.reduce((total, point) => total + (point.value?.[0]?.fpVal || 0), 0);
    const bodyFatPercentage = bodyFatData.length
      ? bodyFatData[bodyFatData.length - 1].value?.[0]?.fpVal || 0
      : null;
    const bodyMassIndex = bmiData.length
      ? bmiData[bmiData.length - 1].value?.[0]?.fpVal || 0
      : null;
    const waterIntake = waterIntakeData.reduce((total, point) => total + (point.value?.[0]?.fpVal || 0), 0);
    const activeEnergy = activeEnergyData.reduce((total, point) => total + (point.value?.[0]?.fpVal || 0), 0);
    const exerciseMinutes = exerciseMinutesData.reduce((total, point) => total + (point.value?.[0]?.intVal || 0), 0);

    return {
      stepsWalked,
      caloriesBurned: round2(caloriesBurned),
      distanceWalked: round2(distanceWalked),
      recentHeartRate: round2(recentHeartRate),
      // pulseRate: round2(recentPulseRate || 0),
      recentSpO2: round2(recentSpO2 || 0),
      systolic: round2(systolic),
      diastolic: round2(diastolic),
      activeMinutes,
      floorsClimbed,
      sleepDuration: round2(sleepDuration / 3600), // in hours
      bodyFatPercentage: round2(bodyFatPercentage || 0),
      bodyMassIndex: round2(bodyMassIndex || 0),
      waterIntake: round2(waterIntake),
      activeEnergy: round2(activeEnergy),
      exerciseMinutes,
    };
  } catch (error) {
    return null;
  }
};
const updateGoogleFitHourlyData = async (patientId, googleFitToken, googleRefreshToken) => {
  try {
    const { rows } = await pool.query("SELECT * FROM patients WHERE id = $1", [patientId]);
    if (!rows.length) {
      console.error(`Patient ${patientId} not found`);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    // Fetch Google Fit data
    const googleFitData = await getGoogleFitData(googleFitToken, googleRefreshToken);
    if (!googleFitData) {
      console.error(`Failed to fetch Google Fit data for patient ${patientId}`);
      return;
    }

    // Handle missing data with defaults
    const {
      stepsWalked = 0,
      caloriesBurned = 0,
      distanceWalked = 0,
      recentHeartRate = null,
      recentSpO2 = null,
      systolic = null,
      diastolic = null,
      activeMinutes = 0,
      floorsClimbed = 0,
      sleepDuration = null,
      bodyFatPercentage = null,
      bodyMassIndex = null,
      waterIntake = null,
      activeEnergy = 0,
      exerciseMinutes = 0,
    } = googleFitData;

    // Update database
    await pool.query(
      `INSERT INTO google_fit_hourly_data (
        patient_id, hour, steps_walked, calories_burned, distance_walked, recent_heart_rate, 
        recent_spo2, systolic, diastolic, active_minutes, floors_climbed, sleep_duration, 
        body_fat_percentage, body_mass_index, water_intake, active_energy, exercise_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (patient_id, hour) DO UPDATE SET
        steps_walked = EXCLUDED.steps_walked,
        calories_burned = EXCLUDED.calories_burned,
        distance_walked = EXCLUDED.distance_walked,
        recent_heart_rate = EXCLUDED.recent_heart_rate,
        recent_spo2 = EXCLUDED.recent_spo2,
        systolic = EXCLUDED.systolic,
        diastolic = EXCLUDED.diastolic,
        active_minutes = EXCLUDED.active_minutes,
        floors_climbed = EXCLUDED.floors_climbed,
        sleep_duration = EXCLUDED.sleep_duration,
        body_fat_percentage = EXCLUDED.body_fat_percentage,
        body_mass_index = EXCLUDED.body_mass_index,
        water_intake = EXCLUDED.water_intake,
        active_energy = EXCLUDED.active_energy,
        exercise_minutes = EXCLUDED.exercise_minutes,
        updated_at = CURRENT_TIMESTAMP`,
      [
        patientId,
        currentHour,
        stepsWalked,
        caloriesBurned,
        distanceWalked,
        recentHeartRate,
        recentSpO2,
        systolic,
        diastolic,
        activeMinutes,
        floorsClimbed,
        sleepDuration,
        bodyFatPercentage,
        bodyMassIndex,
        waterIntake,
        activeEnergy,
        exerciseMinutes,
      ]
    );

    console.log(`Updated Google Fit data for patient ${patientId} at hour ${currentHour}`);
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error.message);
  }
};

// Scheduled job to run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Initiating hourly Google Fit sync...");
  try {
    const { rows } = await pool.query(
      "SELECT id, google_fit_token, google_refresh_token FROM patients WHERE google_fit_token IS NOT NULL"
    );

    if (rows.length === 0) {
      console.log("No patients with Google Fit tokens found");
      return;
    }

    console.log(`Processing ${rows.length} patients...`);
    for (const patient of rows) {
      await updateGoogleFitHourlyData(
        patient.id,
        patient.google_fit_token,
        patient.google_refresh_token
      );
    }
    console.log("Hourly sync completed");
  } catch (error) {
    console.error("Cron job failed:", error.message);
  }
});

export const getGoogleFit = async (req, res) => {
  try {
    // Fetch patient details
    const { rows } = await pool.query("SELECT * FROM patients WHERE id = $1", [req.patientId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const patient = rows[0];
    const { google_fit_token, google_refresh_token } = patient;

    // Fetch Google Fit data
    const googleFitData = await getGoogleFitData(google_fit_token, google_refresh_token);
    if (!googleFitData) {
      return res.status(500).json({ success: false, message: "Error fetching Google Fit data" });
    }
    return res.status(200).json({ success: true, googleFitData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const getPatientDetails = async (req, res) => {
  try {

    // Fetch patient details
    const { rows } = await pool.query("SELECT * FROM patients WHERE id = $1", [req.patientId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const patient = rows[0];
    const { google_fit_token, google_refresh_token, ...patientDetails } = patient;

    // Fetch health info
    const healthInfo = (
      await pool.query("SELECT * FROM patient_info WHERE patient_id = $1", [req.patientId])
    ).rows[0] || {};
    
    // Extract age, height, weight, and blood type
    const { age, height, weight, blood_type } = healthInfo;

    // Initialize Google Fit Data with default values
    let googleFitData = {
      stepsWalked: 0,
      caloriesBurned: 0,
      distanceWalked: 0,
      recentHeartRate: "N/A",
      sleepDuration: "N/A",
      recentSpO2: "N/A",
      systolic: "N/A",
      diastolic: "N/A",
    };

    try {
      // Fetch Google Fit data if token is available
      if (google_fit_token) {
        googleFitData = await getGoogleFitData(google_fit_token, google_refresh_token);
      }
    } catch (error) {
      console.error('❌ Error fetching Google Fit Data:', error.message);
    }

    // console.log("GoogeFit", googleFitData);

    // Return final response
    return res.status(200).json({
      success: true,
      patient: {
        ...patientDetails,
        age,
        height,
        weight,
        blood_type,
        googleFitData: {
          stepsWalked: googleFitData.stepsWalked || 0,
          caloriesBurned: googleFitData.caloriesBurned || 0,
          distanceWalked: googleFitData.distanceWalked || 0,
          heartRate: googleFitData.recentHeartRate,
          sleepDuration: googleFitData.sleepDuration,
          spo2: googleFitData.recentSpO2,
          bloodPressure: {
            systolic: googleFitData.systolic,
            diastolic: googleFitData.diastolic,
          },
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserInfoDetails = async (req, res) => {
  try {

    // Fetch patient details
    const { rows } = await pool.query("SELECT * FROM patients WHERE id = $1", [req.patientId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const patient = rows[0];
    const { ...patientDetails } = patient;

    // Fetch health info
    const healthInfo = (
      await pool.query("SELECT * FROM patient_info WHERE patient_id = $1", [req.patientId])
    ).rows[0] || {};

    //Fetch summary info
    const summaryInfo = (
      await pool.query("SELECT * FROM patient_summary WHERE patient_id = $1", [req.patientId])  
    ).rows[0] || {};
    

    // console.log("✅ Retrieved Health Info:", healthInfo);


    // Return final response
    return res.status(200).json({
      success: true,
      patient: {
        ...patientDetails,
        healthInfo,
        summaryInfo,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


export const updatePatientDetails = async (req, res) => {
  const { firstName, lastName, address, city, state, pincode, phoneNumber,summary,  ...healthInfo } = req.body;

  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Update patients table
    await pool.query(
      `UPDATE patients
       SET first_name = $1, last_name = $2, address = $3, city = $4, state = $5, pincode = $6, phone_number = $7, updated_at = NOW()
       WHERE id = $8`,
      [
        firstName || patient.first_name,
        lastName || patient.last_name,
        address || patient.address,
        city || patient.city,
        state || patient.state,
        pincode || patient.pincode,
        phoneNumber || patient.phone_number,
        req.patientId,
      ]
    );

    const summaryResult = await pool.query('SELECT * FROM patient_summary WHERE patient_id = $1', [req.patientId]);
    if (summaryResult.rows.length > 0) {
      // Update existing health record
      await pool.query(
        `UPDATE patient_info
         SET summary_data = $1
         WHERE patient_id = $2`,
        [summary, req.patientId]
      );
    } else {
      await pool.query(
        `INSERT INTO patient_summary (
          patient_id, summary_data
        ) VALUES (
          $1, $2
        )`,
        [
          req.patientId,
          summary
        ]
      );
    }

    // Check if patient_info exists
    const healthResult = await pool.query('SELECT * FROM patient_info WHERE patient_id = $1', [req.patientId]);
    if (healthResult.rows.length > 0) {
      // Update existing health record
      await pool.query(
        `UPDATE patient_info
        SET age = $1, gender_identity = $2, height = $3, weight = $4, blood_type = $5,
            smokes = $6, alcohol = $7, recreational_drugs = $8,
            drug_details = $9, exercise_frequency = $10, diet_description = $11, sleep_hours = $12,
            chronic_conditions = $13, medications = $14, allergies = $15, surgeries = $16, family_history = $17,
            mental_health_conditions = $18, last_checkup = $19, vaccinations_up_to_date = $20, dental_checkups = $21,
            sexual_performance_issues = $22, libido_concerns = $23, testicular_pain_lumps = $24, urination_issues = $25,
            prostate_exam = $26, weight_changes = $27, hair_loss_concerns = $28, menstrual_start_age = $29,
            menstrual_regular = $30, severe_cramps = $31, heavy_bleeding = $32, pregnancy_status = $33,
            pregnancy_count = $34, pregnancy_complications = $35, menopause_symptoms = $36, menopause_start_age = $37,
            breast_self_exam = $38, last_mammogram = $39, breast_changes = $40, last_pap_smear = $41,
            gynecological_conditions = $42
        WHERE patient_id = $43`,
        [
          healthInfo.age ? parseInt(healthInfo.age, 10) : null,
          healthInfo.gender_identity || healthResult.rows[0].gender_identity,
          healthInfo.height || healthResult.rows[0].height,
          healthInfo.weight || healthResult.rows[0].weight,
          healthInfo.blood_type || healthResult.rows[0].blood_type,
          healthInfo.smokes ?? healthResult.rows[0].smokes,
          healthInfo.alcohol ?? healthResult.rows[0].alcohol,
          healthInfo.recreational_drugs ?? healthResult.rows[0].recreational_drugs,
          healthInfo.drug_details ?? healthResult.rows[0].drug_details,
          healthInfo.exercise_frequency ?? healthResult.rows[0].exercise_frequency,
          healthInfo.diet_description ?? healthResult.rows[0].diet_description,
          healthInfo.sleep_hours ?? healthResult.rows[0].sleep_hours,
          healthInfo.chronic_conditions ?? healthResult.rows[0].chronic_conditions,
          healthInfo.medications ?? healthResult.rows[0].medications,
          healthInfo.allergies ?? healthResult.rows[0].allergies,
          healthInfo.surgeries ?? healthResult.rows[0].surgeries,
          healthInfo.family_history ?? healthResult.rows[0].family_history,
          healthInfo.mental_health_conditions ?? healthResult.rows[0].mental_health_conditions,
          healthInfo.last_checkup ?? healthResult.rows[0].last_checkup,
          healthInfo.vaccinations_up_to_date ?? healthResult.rows[0].vaccinations_up_to_date,
          healthInfo.dental_checkups ?? healthResult.rows[0].dental_checkups,
          healthInfo.sexual_performance_issues ?? healthResult.rows[0].sexual_performance_issues,
          healthInfo.libido_concerns ?? healthResult.rows[0].libido_concerns,
          healthInfo.testicular_pain_lumps ?? healthResult.rows[0].testicular_pain_lumps,
          healthInfo.urination_issues ?? healthResult.rows[0].urination_issues,
          healthInfo.prostate_exam ?? healthResult.rows[0].prostate_exam,
          healthInfo.weight_changes ?? healthResult.rows[0].weight_changes,
          healthInfo.hair_loss_concerns ?? healthResult.rows[0].hair_loss_concerns,
          healthInfo.menstrual_start_age ?? healthResult.rows[0].menstrual_start_age,
          healthInfo.menstrual_regular ?? healthResult.rows[0].menstrual_regular,
          healthInfo.severe_cramps ?? healthResult.rows[0].severe_cramps,
          healthInfo.heavy_bleeding ?? healthResult.rows[0].heavy_bleeding,
          healthInfo.pregnancy_status ?? healthResult.rows[0].pregnancy_status,
          healthInfo.pregnancy_count ?? healthResult.rows[0].pregnancy_count,
          healthInfo.pregnancy_complications ?? healthResult.rows[0].pregnancy_complications,
          healthInfo.menopause_symptoms ?? healthResult.rows[0].menopause_symptoms,
          healthInfo.menopause_start_age ?? healthResult.rows[0].menopause_start_age,
          healthInfo.breast_self_exam ?? healthResult.rows[0].breast_self_exam,
          healthInfo.last_mammogram ?? healthResult.rows[0].last_mammogram,
          healthInfo.breast_changes ?? healthResult.rows[0].breast_changes,
          healthInfo.last_pap_smear ?? healthResult.rows[0].last_pap_smear,
          healthInfo.gynecological_conditions ?? healthResult.rows[0].gynecological_conditions,
          req.patientId,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO patient_info (
          patient_id, age, gender_identity, height, weight, blood_type,
          smokes, alcohol, recreational_drugs, drug_details, exercise_frequency,
          diet_description, sleep_hours, chronic_conditions, medications, allergies, surgeries,
          family_history, mental_health_conditions, last_checkup, vaccinations_up_to_date, dental_checkups,
          sexual_performance_issues, libido_concerns, testicular_pain_lumps, urination_issues, prostate_exam,
          weight_changes, hair_loss_concerns, menstrual_start_age, menstrual_regular, severe_cramps, heavy_bleeding,
          pregnancy_status, pregnancy_count, pregnancy_complications, menopause_symptoms, menopause_start_age,
          breast_self_exam, last_mammogram, breast_changes, last_pap_smear, gynecological_conditions
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43
        )`,
        [
          req.patientId,
          healthInfo.age ? parseInt(healthInfo.age) || null : null,
          healthInfo.gender_identity || null,
          healthInfo.height ? parseFloat(healthInfo.height) || null : null,
          healthInfo.weight ? parseFloat(healthInfo.weight) || null : null,
          healthInfo.blood_type || null,
          healthInfo.smokes === "" ? null : healthInfo.smokes, 
          healthInfo.alcohol === "" ? null : healthInfo.alcohol, 
          healthInfo.recreational_drugs === "" ? null : healthInfo.recreational_drugs, 
          healthInfo.drug_details || null,
          healthInfo.exercise_frequency || null,
          healthInfo.diet_description || null,
          healthInfo.sleep_hours ? parseInt(healthInfo.sleep_hours) || null : null,
          healthInfo.chronic_conditions || null,
          healthInfo.medications || null,
          healthInfo.allergies || null,
          healthInfo.surgeries || null,
          healthInfo.family_history || null,
          healthInfo.mental_health_conditions || null,
          healthInfo.last_checkup || null,
          healthInfo.vaccinations_up_to_date === "" ? null : healthInfo.vaccinations_up_to_date,  
          healthInfo.dental_checkups === "" ? null : healthInfo.dental_checkups,  
          healthInfo.sexual_performance_issues === "" ? null : healthInfo.sexual_performance_issues,  
          healthInfo.libido_concerns === "" ? null : healthInfo.libido_concerns,  
          healthInfo.testicular_pain_lumps === "" ? null : healthInfo.testicular_pain_lumps,  
          healthInfo.urination_issues === "" ? null : healthInfo.urination_issues,  
          healthInfo.prostate_exam === "" ? null : healthInfo.prostate_exam,  
          healthInfo.weight_changes === "" ? null : healthInfo.weight_changes,  
          healthInfo.hair_loss_concerns === "" ? null : healthInfo.hair_loss_concerns,  
          healthInfo.menstrual_start_age ? parseInt(healthInfo.menstrual_start_age) || null : null,
          healthInfo.menstrual_regular === "" ? null : healthInfo.menstrual_regular,  
          healthInfo.severe_cramps === "" ? null : healthInfo.severe_cramps, 
          healthInfo.heavy_bleeding === "" ? null : healthInfo.heavy_bleeding, 
          healthInfo.pregnancy_status === "" ? null : healthInfo.pregnancy_status,
          healthInfo.pregnancy_count ? parseInt(healthInfo.pregnancy_count) || null : null,
          healthInfo.pregnancy_complications || null,
          healthInfo.menopause_symptoms === "" ? null : healthInfo.menopause_symptoms, 
          healthInfo.menopause_start_age ? parseInt(healthInfo.menopause_start_age) || null : null,
          healthInfo.breast_self_exam === "" ? null : healthInfo.breast_self_exam, 
          healthInfo.last_mammogram || null,
          healthInfo.breast_changes || null,
          healthInfo.last_pap_smear || null,
          healthInfo.gynecological_conditions || null
        ]
      );
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};