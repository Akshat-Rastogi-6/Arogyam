import { useState, useEffect } from "react";
import "./User-profile.css";
import VerticalNav from "../components/VerticalNav.jsx";
import HumanBodyViewer from "../components/HumanBodyViewer.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import axios from "axios";

const UserProfile = () => {
  // Check for cached data immediately to avoid showing loading state
  const cachedProfile = localStorage.getItem('userProfile');
  const [userData, setUserData] = useState(cachedProfile ? JSON.parse(cachedProfile) : null);
  const [loading, setLoading] = useState(!cachedProfile); // Only show loading if no cache
  const [error, setError] = useState(null);
  const [medicalSummary, setMedicalSummary] = useState([]);

  useEffect(() => {
    // Load cached data immediately
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      try {
        setUserData(JSON.parse(cachedProfile));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached profile', e);
      }
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/patients/profile",
          { withCredentials: true }
        );
        const freshData = response.data.patient;
        setUserData(freshData);
        localStorage.setItem('userProfile', JSON.stringify(freshData));
      } catch {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch medical summary
  useEffect(() => {
    const fetchMedicalSummary = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/health/summary",
          { withCredentials: true }
        );
        setMedicalSummary(response.data.summary || []);
      } catch (err) {
        console.error("Error fetching medical summary:", err);
      }
    };

    fetchMedicalSummary();
  }, []);

  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 18) greeting = "Good Afternoon";
  else if (currentHour >= 18) greeting = "Good Evening";

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>{error}</p>;
  if (!userData) return <p>No user data available.</p>;

  return (
    <div className="user-profile-container">
      <VerticalNav />
      <div className="user-main">
        <header className="user-header">
          <div className="greeting-info">
            <h2>{greeting},</h2>
            <strong>
              {userData.first_name} {userData.last_name}
            </strong>
          </div>
        </header>

        <div className="user-details">
          <div className="info-item">
            <span>{userData.age || "-"}</span>
            <p>Years Old</p>
          </div>
          <div className="info-item">
            <span>{userData.height || "-"}</span>
            <p>Height, cm</p>
          </div>
          <div className="info-item">
            <span>{userData.weight || "-"}</span>
            <p>Weight, kg</p>
          </div>
          <div className="info-item">
            <span>{userData.blood_type || "-"}</span>
            <p>Blood Type</p>
          </div>
        </div>

        {/* Google Fit Data Section */}
        <section className="google-fit-section">
          <div className="health-metrics-grid">
            <div className="grid-row">
              <div className="metric-card">
                <p>Steps Walked</p>
                <h2>{userData.googleFitData?.stepsWalked || "-"}</h2>
              </div>
              <div className="metric-card">
                <p>Calories Burned</p>
                <h2>
                  {userData.googleFitData?.caloriesBurned || "-"}{" "}
                  <small>kcal</small>
                </h2>
              </div>
              <div className="metric-card">
                <p>Distance Walked</p>
                <h2>
                  {userData.googleFitData?.distanceWalked || "-"}{" "}
                  <small>meters</small>
                </h2>
              </div>
            </div>
            <div className="grid-row">
              <div className="metric-card">
                <p>Heart Rate</p>
                <h2>
                  {userData.googleFitData?.heartRate || "-"} <small>BPM</small>
                </h2>
              </div>
              <div className="metric-card">
                <p>Sleep Duration</p>
                <h2>
                  {userData.googleFitData?.sleepDuration || "-"} <small>Hours</small>
                </h2>
              </div>
              <div className="metric-card">
                <p>Blood Oxygen (SpO2)</p>
                <h2>
                  {userData.googleFitData?.spo2 || "-"} <small>%</small>
                </h2>
              </div>
              <div className="metric-card">
                <p>Blood Pressure</p>
                <h2>
                  {userData.googleFitData?.bloodPressure?.systolic || "-"} /
                  {userData.googleFitData?.bloodPressure?.diastolic || "-"}{" "}
                  <small>mmHg</small>
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Summary Section */}
        {medicalSummary.length > 0 && (
          <section className="medical-summary-section">
            <h3>Medical Summary</h3>
            <p className="section-subtitle">Health insights from your consultations and activity data</p>
            <div className="summary-grid">
              {medicalSummary.map((item, index) => (
                <div key={index} className={`summary-card severity-${item.severity}`}>
                  <div className="summary-header">
                    <span className="summary-type">{item.summary_type}</span>
                    <span className="summary-source">{item.source}</span>
                  </div>
                  <p className="summary-content">{item.content}</p>
                  <div className="summary-footer">
                    <small>First mentioned: {new Date(item.first_mentioned).toLocaleDateString()}</small>
                    <small>Last updated: {new Date(item.last_updated).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="body-card">
        <ErrorBoundary>
          <HumanBodyViewer googleFitData={userData.googleFitData} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default UserProfile;
