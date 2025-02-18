import React, { useState, useEffect } from "react"; // modified import
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // added import
import "./Dashboard.css";

// Image Imports
import naturalIcon from "../public/images/dashboard/Protecting your health with natural remedies.png";
import homeRemediesIcon from "../public/images/dashboard/Home Solutions and Home Improvement.png";

// Component Imports
import Navbar from "../components/Navbar.jsx";
import WeatherTip from "../components/WeatherTip.jsx"; // new import

// Lottie Animation Imports
import Lottie from "lottie-react";
import UserProfile from "../public/images/UserProfile.json";
import GoogleFit from "../public/images/GoogleFit.json";
import Disease from "../public/images/Disease.json";
import Chatbot from "../public/images/Chatbot.json";

const Dashboard = () => {
  const navigate = useNavigate();
  // added state for Google Fit data
  const [googleFitData, setGoogleFitData] = useState(null);
  const [loadingGoogleFit, setLoadingGoogleFit] = useState(true);

  // added state for user profile to get appointment dates
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchGoogleFit() {
      try {
        const response = await axios.get("http://localhost:5001/api/patients/googlefit", {
          withCredentials: true,
        });
        setGoogleFitData(response.data.googleFitData);
      } catch (error) {
        console.error("Error fetching Google Fit data", error);
      } finally {
        setLoadingGoogleFit(false);
      }
    }
    fetchGoogleFit();
  }, []);

  // new useEffect to fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get("http://localhost:5001/api/patients/profile", {
          withCredentials: true,
        });
        setProfile(response.data.patient);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    }
    fetchProfile();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="grid-container">
          {/* Row 1 */}
          <div
            className="card yellow patient"
            onClick={() => navigate("/user-profile")}
            tyle={{ cursor: "pointer" }}
          >
            <h3>Patient Summary</h3>
            <div className="Dashboard-Profile-lottieAnimation">
              <Lottie animationData={UserProfile} />
            </div>
          </div>

          {/* Updated Notifications Card */}
          <div className="card blue notifications">
            <h3>Notifications</h3>
            {profile && (profile.last_checkup || profile.dental_checkups) ? (
              <p>
                {profile.last_checkup && `Next doctor appointment: ${profile.last_checkup}`}
                {profile.last_checkup && profile.dental_checkups && <br />}
                {profile.dental_checkups && `Next dental appointment: ${profile.dental_checkups}`}
              </p>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </div>

          <div
            className="card chatbot action"
            onClick={() => navigate("/chatbot")}
            style={{ cursor: "pointer" }}
          >
            <h3>Rantbot</h3>
            <div className="Dashboard-Chatbot-lottieAnimation">
              <Lottie animationData={Chatbot} />
            </div>
          </div>

          {/* Row 2: Updated Google Fit Connect card */}
          <div
            className="card teal seasonal"
            onClick={() => navigate("/google-fit")}
            style={{ cursor: "pointer" }}
          >
            <div className="seasonal-content">
              <div className="seasonal-text">
                <h3>Google Fit</h3>

                <div className="google-text">
                  {/* <h3>Google Fit</h3> */}
                  <p>Heart Rate: {googleFitData?.heartRate || "-"}</p>
                  <p>Steps Walked: {googleFitData?.stepsWalked || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Updated Google Fit Card */}
          <div
            className="google"
            onClick={() => navigate("/google-fit")}
            style={{ cursor: "pointer" }}
          >
            <h3 style={{ fontSize: "1.8rem", marginTop: "-0.5rem" }}>
              Disease Prediction
            </h3>
          </div>

          {/* Row 3 */}
          <div
            className="card green natural"
            onClick={() => navigate("/natural-therapy")}
            style={{ cursor: "pointer" }}
          >
            <h3>Natural Therapy</h3>
            <img
              className="natural-icon"
              src={naturalIcon}
              alt="Natural Icon"
            />
          </div>


          {/* <div
        className="card pink home"
        onClick={() => navigate("/google-fit")}
        style={{ cursor: "pointer" }}
      >
        <h3>Google Fit Connect</h3>
      </div> */}


          <div className="card red disease">
            <div className="disease-text">
              <h3>Seasonal Tips</h3>
              <WeatherTip /> {/* Added weather tips display */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
