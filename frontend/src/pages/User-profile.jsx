import React, { useState } from "react";
import "./User-profile.css";
import VerticalNav from "../components/VerticalNav.jsx"; /* new import */

const UserProfile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 18) greeting = "Good Afternoon";
  else if (currentHour >= 18) greeting = "Good Evening";

  return (
    <div className="user-profile-container">
      {/* Render the vertical nav component */}
      <VerticalNav />
      <div className="user-main">
        <header className="user-header">
          <div className="greeting-info">
            <h2>{greeting},</h2>
            <strong>Shubh Gupta</strong>
          </div>
        </header>

        <div className="user-details">
          {/* Row for age, height, weight and blood type */}
          <div className="info-item">
            <span>34</span>
            <p>Years Old</p>
          </div>
          <div className="info-item">
            <span>180</span>
            <p>Height, cm</p>
          </div>
          <div className="info-item">
            <span>78</span>
            <p>Weight, kg</p>
          </div>
          <div className="info-item">
            <span>A+</span>
            <p>Blood Type</p>
          </div>
        </div>

        <div className="health-metrics-row">
          {/* Three square metric boxes */}
          <div className="metric-card">
            <p>Blood Sugar</p>
            <h2>120 / 160</h2>
          </div>
          <div className="metric-card">
            <p>Temperature</p>
            <h2>36.6°</h2>
          </div>
          <div className="metric-card">
            <p>Blood Pressure</p>
            <h2>80 / 120</h2>
          </div>
        </div>

        <div className="heart-rate">
          <h3>Heart Rate Over Time</h3>
          <div className="heart-rate-chart">
            {/* Placeholder for heart rate graph */}
          </div>
        </div>
      </div>

      <div className="body-card">{/* Fixed body card on right side */}</div>
    </div>
  );
};

export default UserProfile;
