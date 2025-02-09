import React from "react";

import { useNavigate } from "react-router-dom";

import "./Dashboard.css";
import chatbotIcon from "../public/images/dashboard/chatbot.png";
import crossBandIcon from "../public/images/dashboard/cross-on-cross band-aid.png";
import alert1Icon from "../public/images/dashboard/alert.png";
import alert2Icon from "../public/images/dashboard/alert2.png";
import fitnessWatchIcon from "../public/images/dashboard/fitness watch.png";
import naturalIcon from "../public/images/dashboard/Protecting your health with natural remedies.png";
// import helpIcon from '../public/images/dashboard/help.png'
// import menuIcon from '../public/images/dashboard/Menu.png'
// import userIcon from '../public/images/dashboard/user.png'
import homeRemediesIcon from "../public/images/dashboard/Home Solutions and Home Improvement.png";
// import appointmentIcon from '../public/images/dashboard/Online doctor appointment in health app.png'
// import cloudIcon from '../public/images/dashboard/Mental health support with cloud characters.png'
// import naturalIcon from '../public/images/dashboard/Protecting your health with natural remedies.png'
import Navbar from "../components/Navbar.jsx";

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate
  return (
    <>
      <Navbar />

      <div className="dashboard">
        <div className="grid-container">
          {/* Patient Summary: spans cells 1,2,7,8 */}
          <div className="card yellow patient">
            <h3>Patient Summary</h3>
            <button className="edit-btn">View Profile</button>

          </div>

          {/* Seasonal Tips: occupies cells 3,4,5 */}
          <div className="card blue seasonal">
            <h3>Seasonal Tips</h3>
          </div>

          {/* Actions: occupies cell 6 */}
          <div className="card actions action">
            <h3>Actions</h3>
            <div className="button-grid">

            <button onClick={() => navigate('/chatbot')}>
              <img src={chatbotIcon} alt="Chatbot" />
            </button>

              <button>
                <img src={alert1Icon} alt="Alert" />
              </button>
              <button>
                <img src={alert2Icon} alt="Alert 2" />
              </button>
              <button>
                <img src={crossBandIcon} alt="Close" />
              </button>
            </div>
          </div>

          {/* Appointment Deadlines: occupies cell 9 */}
          <div className="card teal appointment">
            <h3>Appointment Deadlines</h3>
          </div>

          {/* Google Fit Integration: occupies cells 10,11,12 */}
          <div className="card white google">
            <img
              className="fitness-watch"
              src={fitnessWatchIcon}
              alt="Fitness Watch"
            />
            <h3>Google Fit</h3>
          </div>

          {/* Natural Therapy: occupies cells 13,14 */}

          <div
            className="card green natural"
            onClick={() => navigate("/natural-therapy")} // Add onClick handler
            style={{ cursor: "pointer" }} // Change cursor to pointer
          >

            <h3>Natural Therapy</h3>
            <img
              className="natural-icon"
              src={naturalIcon}
              alt="Natural Icon"
            />
          </div>

          {/* Home Remedies: occupies cells 15,16,17,18 */}
          <div className="card pink home">
            <img
              className="home-remedies-icon"
              src={homeRemediesIcon}
              alt="Home Remedies Icon"
            />
            <h3>Home Remedies</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
