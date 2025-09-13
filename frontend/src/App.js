import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import QRScanner from './components/QRScanner';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/scan" element={<QRScanner />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;