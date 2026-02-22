-- Arogyam Database Schema
-- MySQL/TiDB Compatible Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS google_fit_hourly_data;
DROP TABLE IF EXISTS patient_info;
DROP TABLE IF EXISTS patients;

-- Patients table (main user table)
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  phone_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(10),
  verification_token_expires_at TIMESTAMP NULL,
  reset_password_token VARCHAR(255),
  reset_password_expires_at TIMESTAMP NULL,
  google_fit_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patient health information table
CREATE TABLE patient_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  age INT,
  gender_identity VARCHAR(50),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  blood_type VARCHAR(10),
  
  -- Lifestyle Information
  smokes BOOLEAN,
  alcohol BOOLEAN,
  recreational_drugs BOOLEAN,
  drug_details TEXT,
  exercise_frequency VARCHAR(100),
  diet_description TEXT,
  sleep_hours INT,
  
  -- Medical History
  chronic_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  surgeries TEXT,
  family_history TEXT,
  mental_health_conditions TEXT,
  last_checkup DATE,
  vaccinations_up_to_date BOOLEAN,
  dental_checkups BOOLEAN,
  
  -- Male-specific fields
  sexual_performance_issues BOOLEAN,
  libido_concerns BOOLEAN,
  testicular_pain_lumps BOOLEAN,
  urination_issues BOOLEAN,
  prostate_exam BOOLEAN,
  weight_changes BOOLEAN,
  hair_loss_concerns BOOLEAN,
  
  -- Female-specific fields
  menstrual_start_age INT,
  menstrual_regular BOOLEAN,
  severe_cramps BOOLEAN,
  heavy_bleeding BOOLEAN,
  pregnancy_status BOOLEAN,
  pregnancy_count INT,
  pregnancy_complications TEXT,
  menopause_symptoms BOOLEAN,
  menopause_start_age INT,
  breast_self_exam BOOLEAN,
  last_mammogram DATE,
  breast_changes TEXT,
  last_pap_smear DATE,
  gynecological_conditions TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_patient (patient_id)
);

-- Google Fit hourly data table
CREATE TABLE google_fit_hourly_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
  steps_walked INT DEFAULT 0,
  calories_burned DECIMAL(10,2) DEFAULT 0,
  distance_walked DECIMAL(10,2) DEFAULT 0,
  recent_heart_rate DECIMAL(5,2),
  recent_spo2 DECIMAL(5,2),
  systolic DECIMAL(5,2),
  diastolic DECIMAL(5,2),
  active_minutes INT DEFAULT 0,
  floors_climbed INT DEFAULT 0,
  sleep_duration DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  body_mass_index DECIMAL(5,2),
  water_intake DECIMAL(10,2),
  active_energy DECIMAL(10,2) DEFAULT 0,
  exercise_minutes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_patient_hour (patient_id, hour)
);

-- Create indexes for better query performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_verification_token ON patients(verification_token);
CREATE INDEX idx_patients_reset_password_token ON patients(reset_password_token);
CREATE INDEX idx_patient_info_patient_id ON patient_info(patient_id);
CREATE INDEX idx_google_fit_hourly_data_patient_id ON google_fit_hourly_data(patient_id);
CREATE INDEX idx_google_fit_hourly_data_hour ON google_fit_hourly_data(hour);
