import React, { useEffect, useState } from "react";
import { getPatientDetails, updatePatientDetails } from "../api/patient";
import "./UserDetailsForm.css";

const UserDetailsForm = () => {
  const [formData, setFormData] = useState({
    // ... your existing formData state ...
    // Basic Information
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
    
    // Health Information
    age: '',
    gender_identity: '',
    height: '',
    weight: '',
    blood_type: '',
      // Lifestyle Habits
      smokes: false,
      cigarettes_per_day: '',
      alcohol: false,
      drinks_per_week: '',
      recreational_drugs: false,
      drug_details: '',
      exercise_frequency: '',
      diet_description: '',
      sleep_hours: '',
      stress_level: '',
      
      // Medical History
      chronic_conditions: '',
      medications: '',
      allergies: '',
      surgeries: '',
      family_history: '',
      mental_health_conditions: '',
      
      // Regular Checkups
      last_checkup: '',
      vaccinations_up_to_date: false,
      dental_checkups: '',
     // Male-Specific Health
     sexual_performance_issues: false,
     libido_concerns: false,
     testicular_pain_lumps: false,
     urination_issues: false,
     prostate_exam: '',
     hair_loss_concerns: false,
     
     // Female-Specific Health
     menstrual_start_age: '',
     menstrual_regular: false,
     severe_cramps: false,
     heavy_bleeding: false,
     pregnancy_status: false,
     pregnancy_count: '',
     pregnancy_complications: '',
     menopause_symptoms: false,
     menopause_start_age: '',
     breast_self_exam: false,
     last_mammogram: '',
     breast_changes: false,
     last_pap_smear: '',
     gynecological_conditions: ''
   });

   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
 
   useEffect(() => {
     const fetchPatientDetails = async () => {
       setLoading(true);
       try {
         const response = await getPatientDetails();
         console.log("API Response:", response); // Debug log
         
         if (response.data?.patient) {
           // Map backend data to form fields
           const patientData = response.data.patient;
           const healthInfo = patientData.healthInfo || {};
           
           setFormData(prevData => ({
             ...prevData,
             firstName: patientData.first_name || '',
             lastName: patientData.last_name || '',
             address: patientData.address || '',
             city: patientData.city || '',
             state: patientData.state || '',
             pincode: patientData.pincode || '',
             phoneNumber: patientData.phone_number || '',
             ...healthInfo
           }));
        }
    } catch (error) {
      console.error("Error fetching patient details:", error.response || error);
      setMessage(error.response?.data?.message || "Error fetching patient details");
    }
    setLoading(false);
  };

  fetchPatientDetails();
}, []);

const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'select-one' && (value === 'true' || value === 'false')) {
      setFormData(prevData => ({
        ...prevData,
        [name]: value === 'true'
      }));
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Submitting form data:", formData); // Debug log
      
      const response = await updatePatientDetails(formData);
      console.log("Update response:", response); // Debug log
      
      if (response.data?.success) {
        setMessage("Details updated successfully!");
      } else {
        setMessage(response.data?.message || "Failed to update details");
      }
    } catch (error) {
      console.error("Error updating details:", error.response || error);
      setMessage(error.response?.data?.message || "Error updating details");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <form className="user-details-form" onSubmit={handleSubmit}>
      <h2>Basic Information</h2>
      <div>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Pincode</label>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
          pattern="[0-9]{6}"
        />
      </div>
      <div>
        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          pattern="[0-9]{10}"
        />
      </div>

      <h2>Health Information</h2>
      <div>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Gender Identity</label>
        <select
          name="gender_identity"
          value={formData.gender_identity}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label>Height (cm)</label>
        <input
          type="number"
          name="height"
          value={formData.height}
          onChange={handleChange}
          min="0"
          max="300"
        />
      </div>
      <div>
        <label>Weight (kg)</label>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          min="0"
          max="500"
        />
      </div>
      <div>
        <label>Blood Type</label>
        <select
          name="blood_type"
          value={formData.blood_type}
          onChange={handleChange}
        >
          <option value="">Select Blood Type</option>
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

      <h2>Lifestyle Habits</h2>
      <div>
        <label>Do you smoke?</label>
        <select name="smokes" value={formData.smokes} onChange={handleChange}>
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </select>
      </div>
      {formData.smokes && (
        <div>
          <label>Cigarettes per day</label>
          <input
            type="number"
            name="cigarettes_per_day"
            value={formData.cigarettes_per_day}
            onChange={handleChange}
            min="0"
          />
        </div>
      )}
      <div>
        <label>Do you consume alcohol?</label>
        <select name="alcohol" value={formData.alcohol} onChange={handleChange}>
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </select>
      </div>
      {formData.alcohol && (
        <div>
          <label>Drinks per week</label>
          <input
            type="number"
            name="drinks_per_week"
            value={formData.drinks_per_week}
            onChange={handleChange}
            min="0"
          />
        </div>
      )}
      <div>
        <label>Recreational Drugs?</label>
        <select name="recreational_drugs" value={formData.recreational_drugs} onChange={handleChange}>
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </select>
      </div>
      {formData.recreational_drugs && (
        <div>
          <label>Drug Details</label>
          <textarea
            name="drug_details"
            value={formData.drug_details}
            onChange={handleChange}
            placeholder="Please specify..."
          />
        </div>
      )}
      <div>
        <label>Exercise Frequency</label>
        <select name="exercise_frequency" value={formData.exercise_frequency} onChange={handleChange}>
          <option value="">Select</option>
          <option value="never">Never</option>
          <option value="rarely">Rarely</option>
          <option value="sometimes">Sometimes</option>
          <option value="regularly">Regularly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      <div>
        <label>Diet Description</label>
        <textarea
          name="diet_description"
          value={formData.diet_description}
          onChange={handleChange}
          placeholder="Describe your typical diet..."
        />
      </div>
      <div>
        <label>Sleep Hours (per night)</label>
        <input
          type="number"
          name="sleep_hours"
          value={formData.sleep_hours}
          onChange={handleChange}
          min="0"
          max="24"
        />
      </div>
      <div>
        <label>Stress Level</label>
        <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
          <option value="">Select</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      <h2>Medical History</h2>
      <div>
        <label>Chronic Conditions</label>
        <textarea
          name="chronic_conditions"
          value={formData.chronic_conditions}
          onChange={handleChange}
          placeholder="List any chronic conditions..."
        />
      </div>
      <div>
        <label>Current Medications</label>
        <textarea
          name="medications"
          value={formData.medications}
          onChange={handleChange}
          placeholder="List current medications..."
        />
      </div>
      <div>
        <label>Allergies</label>
        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="List any allergies..."
        />
      </div>
      <div>
        <label>Past Surgeries</label>
        <textarea
          name="surgeries"
          value={formData.surgeries}
          onChange={handleChange}
          placeholder="List past surgeries..."
        />
      </div>
      <div>
        <label>Family Medical History</label>
        <textarea
          name="family_history"
          value={formData.family_history}
          onChange={handleChange}
          placeholder="Describe significant family medical history..."
        />
      </div>
      <div>
        <label>Mental Health Conditions</label>
        <textarea
          name="mental_health_conditions"
          value={formData.mental_health_conditions}
          onChange={handleChange}
          placeholder="List any mental health conditions..."
        />
      </div>

      <h2>Regular Checkups</h2>
      <div>
        <label>Last Checkup Date</label>
        <input
          type="date"
          name="last_checkup"
          value={formData.last_checkup}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Vaccinations Up to Date?</label>
        <select name="vaccinations_up_to_date" value={formData.vaccinations_up_to_date} onChange={handleChange}>
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </select>
      </div>
      <div>
        <label>Last Dental Checkup</label>
        <input
          type="date"
          name="dental_checkups"
          value={formData.dental_checkups}
          onChange={handleChange}
        />
      </div>

      {formData.gender_identity === 'male' && (
        <>
          <h2>Male-Specific Health</h2>
          <div>
            <label>Sexual Performance Issues?</label>
            <select name="sexual_performance_issues" value={formData.sexual_performance_issues} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Libido Concerns?</label>
            <select name="libido_concerns" value={formData.libido_concerns} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Testicular Pain/Lumps?</label>
            <select name="testicular_pain_lumps" value={formData.testicular_pain_lumps} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Urination Issues?</label>
            <select name="urination_issues" value={formData.urination_issues} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Last Prostate Exam</label>
            <input
              type="date"
              name="prostate_exam"
              value={formData.prostate_exam}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Hair Loss Concerns?</label>
            <select name="hair_loss_concerns" value={formData.hair_loss_concerns} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
        </>
      )}

      {formData.gender_identity === 'female' && (
        <>
          <h2>Female-Specific Health</h2>
          <div>
            <label>Menstrual Start Age</label>
            <input
              type="number"
              name="menstrual_start_age"
              value={formData.menstrual_start_age}
              onChange={handleChange}
              min="0"
              max="30"
            />
          </div>
          <div>
            <label>Regular Menstrual Cycle?</label>
            <select name="menstrual_regular" value={formData.menstrual_regular} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Severe Menstrual Cramps?</label>
            <select name="severe_cramps" value={formData.severe_cramps} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Heavy Menstrual Bleeding?</label>
            <select name="heavy_bleeding" value={formData.heavy_bleeding} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Currently Pregnant?</label>
            <select name="pregnancy_status" value={formData.pregnancy_status} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Number of Previous Pregnancies</label>
            <input
              type="number"
              name="pregnancy_count"
              value={formData.pregnancy_count}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div>
            <label>Pregnancy Complications</label>
            <textarea
              name="pregnancy_complications"
              value={formData.pregnancy_complications}
              onChange={handleChange}
              placeholder="List any pregnancy complications..."
            />
          </div>
          <div>
            <label>Menopause Symptoms?</label>
            <select name="menopause_symptoms" value={formData.menopause_symptoms} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          {formData.menopause_symptoms && (
            <div>
              <label>Menopause Start Age</label>
              <input
                type="number"
                name="menopause_start_age"
                value={formData.menopause_start_age}
                onChange={handleChange}
                min="30"
                max="65"
              />
            </div>
          )}
          <div>
            <label>Regular Breast Self-Exam?</label>
            <select name="breast_self_exam" value={formData.breast_self_exam} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Last Mammogram</label>
            <input
              type="date"
              name="last_mammogram"
              value={formData.last_mammogram}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Breast Changes?</label>
            <select name="breast_changes" value={formData.breast_changes} onChange={handleChange}>
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
          <div>
            <label>Last Pap Smear</label>
            <input
              type="date"
              name="last_pap_smear"
              value={formData.last_pap_smear}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Gynecological Conditions</label>
            <textarea
              name="gynecological_conditions"
              value={formData.gynecological_conditions}
              onChange={handleChange}
              placeholder="List any gynecological conditions..."
            />
          </div>
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Details"}
      </button>
      {message && <p className={message.includes("success") ? "success" : "error"}>{message}</p>}
    </form>
  );
};

export default UserDetailsForm;