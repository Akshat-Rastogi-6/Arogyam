-- Additional tables for health tracking and chatbot integration

-- Chatbot conversation history with health insights
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  conversation_type ENUM('therapy', 'remedies', 'aromatherapy', 'natural_therapy') DEFAULT 'remedies',
  health_insights TEXT, -- Extracted symptoms, conditions, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_patient_conversations (patient_id, created_at)
);

-- Medical summary extracted from conversations and Fitbit
CREATE TABLE IF NOT EXISTS medical_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  summary_type ENUM('symptom', 'condition', 'concern', 'insight') NOT NULL,
  content TEXT NOT NULL,
  source ENUM('chatbot', 'fitbit', 'manual', 'inferred') NOT NULL,
  severity ENUM('low', 'medium', 'high') DEFAULT 'low',
  first_mentioned DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_patient_summary (patient_id, is_active),
  INDEX idx_summary_type (summary_type, severity)
);

-- User onboarding status
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE;
