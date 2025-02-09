import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail'; // Import VerifyEmail
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/user-profile';
import Chatbot from './components/Chatbot';
import NaturalTherapy from './pages/NaturalTherapy'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Add this route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-profile" element={<UserProfile/>} />
        <Route path="/chatbot" element={<Chatbot />} /> {/* Add Chatbot route */}
        <Route path="/natural-therapy" element={<NaturalTherapy />} />
      </Routes>
    </Router>
  );
};

export default App;