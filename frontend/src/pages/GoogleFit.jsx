import React, { useState, useEffect } from "react";
import "./GoogleFit.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const GoogleFit = () => {
  // Check for cached data immediately to avoid showing loading state
  const cachedGoogleFit = localStorage.getItem('googleFitData');
  const [data, setData] = useState(cachedGoogleFit ? JSON.parse(cachedGoogleFit) : null);
  const [loading, setLoading] = useState(!cachedGoogleFit); // Only show loading if no cache
  const [error, setError] = useState(null);

  const metrics = [
    { key: "stepsWalked", label: "Steps Walked", unit: "" },
    { key: "caloriesBurned", label: "Calories Burned", unit: "kcal" },
    { key: "distanceWalked", label: "Distance Walked", unit: "meters" },
    { key: "heartRate", label: "Heart Rate", unit: "BPM" },
    { key: "pulseRate", label: "Pulse Rate", unit: "BPM" },
    { key: "spo2", label: "Blood Oxygen (SpO2)", unit: "%" },
    { key: "bloodPressure", label: "Blood Pressure", unit: "mmHg", isBP: true },
    { key: "activeMinutes", label: "Active Minutes", unit: "min" },
    { key: "floorsClimbed", label: "Floors Climbed", unit: "" },
    { key: "sleepDuration", label: "Sleep Duration", unit: "hrs" },
    { key: "bodyFatPercentage", label: "Body Fat", unit: "%" },
    { key: "bodyMassIndex", label: "BMI", unit: "" },
    { key: "waterIntake", label: "Water Intake", unit: "L" },
    { key: "activeEnergy", label: "Active Energy Burned", unit: "kcal" },
    { key: "exerciseMinutes", label: "Exercise Minutes", unit: "min" },
  ];

  useEffect(() => {
    // Load cached data immediately
    const cachedGoogleFit = localStorage.getItem('googleFitData');
    if (cachedGoogleFit) {
      try {
        setData(JSON.parse(cachedGoogleFit));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached Google Fit data', e);
      }
    }

    const fetchGoogleFitData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/patients/googlefit",
          { withCredentials: true }
        );
        const freshData = response.data.googleFitData;
        setData(freshData);
        localStorage.setItem('googleFitData', JSON.stringify(freshData));
      } catch (err) {
        setError("Failed to load Google Fit data");
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleFitData();
  }, []);

  if (loading) return <p>Loading Google Fit data...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No Google Fit data available.</p>;

  return (
    <>
      <Navbar />
      <div className="google-fit-page">
        <header className="google-fit-header">
          <h1>Google Fit Dashboard</h1>
          <p className="subtitle">Track your health and fitness metrics</p>
        </header>

        <div className="metrics-container">
          <div className="metrics-section">
            <h2>Activity Metrics</h2>
            <div className="metrics-grid">
              {metrics.slice(0, 5).map(({ key, label, unit, isBP }) => {
                let value;
                if (isBP) {
                  const systolic = data?.bloodPressure?.systolic;
                  const diastolic = data?.bloodPressure?.diastolic;
                  value =
                    systolic && diastolic ? `${systolic}/${diastolic}` : "-";
                } else {
                  value = data?.[key] || "-";
                }
                return (
                  <div className="metric-card" key={key}>
                    <p>{label}</p>
                    <h2>
                      {value} {value !== "-" && unit && <small>{unit}</small>}
                    </h2>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional sections (Vital Signs and Body Measurements) */}
          <div className="metrics-section">
            <h2>Vital Signs</h2>
            <div className="metrics-grid">
              {metrics.slice(5, 10).map(({ key, label, unit, isBP }) => {
                let value;
                if (isBP) {
                  const systolic = data?.bloodPressure?.systolic;
                  const diastolic = data?.bloodPressure?.diastolic;
                  value =
                    systolic && diastolic ? `${systolic}/${diastolic}` : "-";
                } else {
                  value = data?.[key] || "-";
                }
                return (
                  <div className="metric-card" key={key}>
                    <p>{label}</p>
                    <h2>
                      {value} {value !== "-" && unit && <small>{unit}</small>}
                    </h2>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="metrics-section">
            <h2>Body Measurements</h2>
            <div className="metrics-grid">
              {metrics.slice(10).map(({ key, label, unit, isBP }) => {
                let value;
                if (isBP) {
                  const systolic = data?.bloodPressure?.systolic;
                  const diastolic = data?.bloodPressure?.diastolic;
                  value =
                    systolic && diastolic ? `${systolic}/${diastolic}` : "-";
                } else {
                  value = data?.[key] || "-";
                }
                return (
                  <div className="metric-card" key={key}>
                    <p>{label}</p>
                    <h2>
                      {value} {value !== "-" && unit && <small>{unit}</small>}
                    </h2>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoogleFit;
