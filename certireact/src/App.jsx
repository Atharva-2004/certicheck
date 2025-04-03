import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LandingPage from './pages/LandingPage';
import RecruiterDashboard from './pages/recruiterdashboard';
import ApplicantPage from './pages/applicantpage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        } />
        <Route path="/applicantpage" element={
          <ProtectedRoute>
            <ApplicantPage />
          </ProtectedRoute>
        } />
            <Route path="/apply-job/:jobId" element={<LandingPage />} />

          <Route path="/recruiter-dashboard" element={
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
};

export default App;