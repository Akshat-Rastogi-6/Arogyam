import pool from '../config/db.js';

// Get user's complete health context (for chatbot)
export const getUserHealthContext = async (req, res) => {
  try {
    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.patientId]);
    const patient = patients[0];

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Get patient info
    const [patientInfoRows] = await pool.query('SELECT * FROM patient_info WHERE patient_id = ?', [req.patientId]);
    const patientInfo = patientInfoRows[0] || {};

    // Get recent Google Fit data
    const [googleFitRows] = await pool.query(
      'SELECT * FROM google_fit_hourly_data WHERE patient_id = ? ORDER BY created_at DESC LIMIT 24',
      [req.patientId]
    );

    // Get active medical summary
    const [medicalSummary] = await pool.query(
      'SELECT * FROM medical_summary WHERE patient_id = ? AND is_active = TRUE ORDER BY last_updated DESC',
      [req.patientId]
    );

    // Get recent conversation history
    const [conversationHistory] = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.patientId]
    );

    return res.status(200).json({
      success: true,
      context: {
        personalInfo: {
          age: patientInfo.age,
          gender: patientInfo.gender_identity,
          height: patientInfo.height,
          weight: patientInfo.weight,
          blood_type: patientInfo.blood_type,
        },
        lifestyle: {
          smokes: patientInfo.smokes,
          alcohol: patientInfo.alcohol,
          exercise_frequency: patientInfo.exercise_frequency,
          sleep_hours: patientInfo.sleep_hours,
        },
        medicalHistory: {
          chronic_conditions: patientInfo.chronic_conditions,
          medications: patientInfo.medications,
          allergies: patientInfo.allergies,
          family_history: patientInfo.family_history,
        },
        recentFitbitData: googleFitRows.length > 0 ? {
          averageSteps: Math.round(googleFitRows.reduce((sum, r) => sum + (r.steps_walked || 0), 0) / googleFitRows.length),
          averageHeartRate: Math.round(googleFitRows.filter(r => r.recent_heart_rate).reduce((sum, r, _, arr) => sum + r.recent_heart_rate / arr.length, 0)),
          averageSleep: googleFitRows.filter(r => r.sleep_duration).length > 0 
            ? (googleFitRows.filter(r => r.sleep_duration).reduce((sum, r) => sum + r.sleep_duration, 0) / googleFitRows.filter(r => r.sleep_duration).length).toFixed(1)
            : null,
        } : null,
        medicalSummary: medicalSummary,
        recentConversations: conversationHistory.slice(0, 5).map(c => ({
          message: c.message,
          insights: c.health_insights,
          date: c.created_at
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Save chatbot conversation
export const saveChatbotConversation = async (req, res) => {
  try {
    const { message, response, conversation_type, health_insights } = req.body;

    await pool.query(
      'INSERT INTO chatbot_conversations (patient_id, message, response, conversation_type, health_insights) VALUES (?, ?, ?, ?, ?)',
      [req.patientId, message, response, conversation_type || 'remedies', health_insights || null]
    );

    // If health insights exist, save to medical summary
    if (health_insights) {
      const insights = JSON.parse(health_insights);
      for (const insight of insights) {
        await pool.query(
          'INSERT INTO medical_summary (patient_id, summary_type, content, source, severity, first_mentioned) VALUES (?, ?, ?, ?, ?, CURDATE()) ON DUPLICATE KEY UPDATE last_updated = NOW()',
          [req.patientId, insight.type || 'symptom', insight.content, 'chatbot', insight.severity || 'low']
        );
      }
    }

    return res.status(201).json({ success: true, message: 'Conversation saved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get medical summary for user profile
export const getMedicalSummary = async (req, res) => {
  try {
    const [summary] = await pool.query(
      `SELECT summary_type, content, source, severity, first_mentioned, last_updated 
       FROM medical_summary 
       WHERE patient_id = ? AND is_active = TRUE 
       ORDER BY severity DESC, last_updated DESC`,
      [req.patientId]
    );

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update onboarding status
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { completed, skipped } = req.body;

    await pool.query(
      'UPDATE patients SET onboarding_completed = ?, onboarding_skipped = ? WHERE id = ?',
      [completed || false, skipped || false, req.patientId]
    );

    return res.status(200).json({ success: true, message: 'Onboarding status updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Check onboarding status
export const checkOnboardingStatus = async (req, res) => {
  try {
    const [patients] = await pool.query(
      'SELECT onboarding_completed, onboarding_skipped FROM patients WHERE id = ?',
      [req.patientId]
    );

    if (!patients[0]) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({
      success: true,
      onboarding: {
        completed: patients[0].onboarding_completed,
        skipped: patients[0].onboarding_skipped,
        needsOnboarding: !patients[0].onboarding_completed && !patients[0].onboarding_skipped
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
