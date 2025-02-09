import React from "react";
import "./AccountOverlay.css";

const AccountOverlay = ({ closeOverlay }) => {
  return (
    <div className="account-overlay">
      <div className="account-container">
        <div className="account-header">
          <span className="account-title">Account</span>
          <button className="account-close" onClick={closeOverlay}>
            ×
          </button>
        </div>
        <ul className="account-options">
          <li>General</li>
          <li>Logout</li>
          <li>Delete Data</li>
          <li>Delete Account</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountOverlay;
