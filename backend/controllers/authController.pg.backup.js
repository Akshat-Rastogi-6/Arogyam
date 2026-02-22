import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';
import { generateVerificationToken } from '../utils/generateVerificationToken.js';
import { generateJWTToken } from '../utils/generateJWTToken.js';
import { sendConfirmationEmail, sendResetPasswordEmail, sendResetPasswordSuccessEmail, sendVerificationEmail } from '../resend/email.js';

// Google OAuth2 Client
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/google/callback`
);


export const signup = async (req, res) => {
  const { firstName, lastName, email, password, address, city, state, pincode, phoneNumber } = req.body;
  try {
    if (!firstName || !lastName || !email || !password || !address || !city || !state || !pincode || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Enter all fields' });
    }

    // Check if patient already exists
    const patientAlreadyExists = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    if (patientAlreadyExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Patient already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const verificationToken = generateVerificationToken();

    // Insert patient record into database
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, email, password, address, city, state, pincode, phone_number, verification_token, verification_token_expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [firstName, lastName, email, hashedPassword, address, city, state, pincode, phoneNumber, verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    const patient = result.rows[0];

    // Send verification email
    await sendVerificationEmail(patient.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully!',
      patient: {
        ...patient,
        password: undefined, 
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find patient by email
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const verifyPassword = await bcrypt.compare(password, patient.password);
    if (!verifyPassword) {
      return res.status(400).json({ success: false, message: 'Invalid Password' });
    }

    if (!patient.is_verified) {
      return res.status(400).json({ success: false, message: 'Please verify your email' });
    }

    generateJWTToken(res, patient.id, patient.email);

    return res.status(200).json({ success: true, message: 'Login successful!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',

      // Google Fit Scopes
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/fitness.activity.read',  // Steps, distance, workouts
      'https://www.googleapis.com/auth/fitness.body.read',      // Weight, BMI, body fat %
      'https://www.googleapis.com/auth/fitness.sleep.read',     // Sleep data
      'https://www.googleapis.com/auth/fitness.heart_rate.read',  // Heart Rate (BPM)
      'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',  // SpO2 (Blood Oxygen)
      'https://www.googleapis.com/auth/fitness.body_temperature.read',  // Body Temperature
      'https://www.googleapis.com/auth/fitness.blood_pressure.read',  // Blood Pressure (Systolic/Diastolic)
      'https://www.googleapis.com/auth/fitness.nutrition.read',  // Calories burned, hydration
    ],
    prompt: 'consent',
  });
  res.redirect(url);
};

export const googleAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user already exists
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    let patient = result.rows[0];

    if (!patient) {
      // Create new patient
      const newPatient = await pool.query(
        `INSERT INTO patients (first_name, last_name, email, is_verified, google_fit_token, google_refresh_token)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          name.split(' ')[0], 
          name.split(' ')[1] || '', 
          email, 
          true, 
          tokens.access_token || null, 
          tokens.refresh_token || null
        ]
      );
      patient = newPatient.rows[0];
    } else {
      // Update the patient's Google tokens
      await pool.query(
        `UPDATE patients 
         SET google_fit_token = $1, 
             google_refresh_token = $2 
         WHERE email = $3`,
        [
          tokens.access_token || patient.google_fit_token, 
          tokens.refresh_token || patient.google_refresh_token, 
          email
        ]
      );
    }

    // Generate JWT token for the session
    generateJWTToken(res, patient.id, patient.email);

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token').status(200).json({ success: true, message: 'Logout Successful' });
};

export const deleteData = async (req, res) => { 
  try { 
    // Find patient by ID
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    // Delete patient data from the database
    await pool.query('DELETE FROM patient_info WHERE patient_id = $1', [req.patientId]);
    await pool.query('DELETE FROM google_fit_hourly_data WHERE patient_id = $1', [req.patientId]);

    return res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error) { 
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const deleteAccount = async (req, res) => {
  try {
    // Find patient by ID
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    // Delete patient from the database
    await pool.query('DELETE FROM patients WHERE id = $1', [req.patientId]);
    await pool.query('DELETE FROM patient_info WHERE patient_id = $1', [req.patientId]);
    await pool.query('DELETE FROM google_fit_hourly_data WHERE patient_id = $1', [req.patientId]);

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } 
}

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  try {
    // Find patient by verification token
    const result = await pool.query('SELECT * FROM patients WHERE verification_token = $1 AND verification_token_expires_at > $2', [otp, new Date(Math.floor(Date.now() / 1000) + 24 * 60 * 60)]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Mark patient as verified
    await pool.query('UPDATE patients SET is_verified = true, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1', [patient.id]);

    // Send confirmation email
    await sendConfirmationEmail(patient.email, patient.first_name);

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Find patient by email
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    // Generate a new reset password token using uuid
    const resetPasswordToken = uuidv4();  

    // Set reset password expiry to 1 hour from current time
    const resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);  // 1 hour in the future

    // Update reset password token and expiration time in the database
    await pool.query(
      'UPDATE patients SET reset_password_token = $1, reset_password_expires_at = $2 WHERE id = $3',
      [resetPasswordToken, resetPasswordExpiresAt, patient.id]
    );

    // Send reset password email with the reset link
    await sendResetPasswordEmail(patient.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);

    return res.status(200).json({ success: true, message: 'Reset password link sent to your email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Handler for resetting the password
export const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;
  try {
    // Create Date object for current time
    const currentDate = new Date(); // Current Date object
    const currentTimeInSeconds = Math.floor(currentDate.getTime() / 1000);  // Convert milliseconds to seconds

    // Query to get the patient based on the token and valid expiration time
    const result = await pool.query(
      'SELECT * FROM patients WHERE reset_password_token = $1 AND reset_password_expires_at > to_timestamp($2)',
      [token, currentTimeInSeconds]  // Compare against seconds stored in DB
    );

    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset password link' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token and expiration time
    await pool.query(
      'UPDATE patients SET password = $1, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = $2',
      [hashedPassword, patient.id]
    );

    // Send success email after password reset
    await sendResetPasswordSuccessEmail(patient.email);

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerificationToken = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    if (patient.is_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const newVerificationToken = generateVerificationToken();

    // Get current time in seconds and add 24 hours for expiration
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);  // Convert milliseconds to seconds
    const expirationTimeInSeconds = currentTimeInSeconds + 24 * 60 * 60; // Add 24 hours (in seconds)

    // Update the verification token and expiration time in the database
    await pool.query(
      'UPDATE patients SET verification_token = $1, verification_token_expires_at = to_timestamp($2) WHERE id = $3', 
      [newVerificationToken, expirationTimeInSeconds, patient.id]
    );

    // Send the verification email
    await sendVerificationEmail(patient.email, newVerificationToken);

    return res.status(200).json({ success: true, message: 'New verification token sent to your email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Find patient by ID
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.patientId]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, patient: { ...patient, password: undefined } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
