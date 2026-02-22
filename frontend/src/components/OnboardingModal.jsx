import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './OnboardingModal.css';

const OnboardingModal = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender_identity: '',
    height: '',
    weight: '',
    blood_type: '',
    smokes: false,
    alcohol: false,
    exercise_frequency: '',
    sleep_hours: '',
    chronic_conditions: '',
    medications: '',
    allergies: '',
    family_history: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Save health info
      await axios.put('http://localhost:5001/api/patients/info', formData, {
        withCredentials: true
      });

      // Mark onboarding as completed
      await axios.put('http://localhost:5001/api/health/onboarding', 
        { completed: true, skipped: false },
        { withCredentials: true }
      );

      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save your information. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      await axios.put('http://localhost:5001/api/health/onboarding', 
        { completed: false, skipped: true },
        { withCredentials: true }
      );
      onSkip();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  return (
    <div className="onboarding-modal-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h2>Welcome to Arogyam! 🌿</h2>
          <p>Help us personalize your health experience</p>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1</span>
            <span className={step >= 2 ? 'active' : ''}>2</span>
            <span className={step >= 3 ? 'active' : ''}>3</span>
          </div>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step-content">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Your age" />
              </div>
              <div className="form-group">
                <label>Gender Identity</label>
                <select name="gender_identity" value={formData.gender_identity} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="170" />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" />
                </div>
              </div>
              <div className="form-group">
                <label>Blood Type</label>
                <select name="blood_type" value={formData.blood_type} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Lifestyle</h3>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="smokes" checked={formData.smokes} onChange={handleChange} />
                  Do you smoke?
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="alcohol" checked={formData.alcohol} onChange={handleChange} />
                  Do you consume alcohol?
                </label>
              </div>
              <div className="form-group">
                <label>Exercise Frequency</label>
                <select name="exercise_frequency" value={formData.exercise_frequency} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Never">Never</option>
                  <option value="1-2 times/week">1-2 times/week</option>
                  <option value="3-4 times/week">3-4 times/week</option>
                  <option value="5+ times/week">5+ times/week</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div className="form-group">
                <label>Average Sleep Hours</label>
                <input type="number" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} placeholder="7-8" min="1" max="24" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Medical History</h3>
              <div className="form-group">
                <label>Chronic Conditions (if any)</label>
                <textarea name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} placeholder="e.g., Diabetes, Hypertension..." rows="3" />
              </div>
              <div className="form-group">
                <label>Current Medications</label>
                <textarea name="medications" value={formData.medications} onChange={handleChange} placeholder="List any medications you're taking..." rows="3" />
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Food, drug, or environmental allergies..." rows="3" />
              </div>
              <div className="form-group">
                <label>Family Medical History</label>
                <textarea name="family_history" value={formData.family_history} onChange={handleChange} placeholder="Any hereditary conditions in your family..." rows="3" />
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          <button className="btn-skip" onClick={handleSkip}>Skip for now</button>
          <div className="btn-group">
            {step > 1 && <button className="btn-secondary" onClick={handlePrevious}>Previous</button>}
            {step < 3 ? (
              <button className="btn-primary" onClick={handleNext}>Next</button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit}>Complete</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OnboardingModal.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default OnboardingModal;
