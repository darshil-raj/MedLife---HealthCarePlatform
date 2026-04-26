import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorSearch from './pages/DoctorSearch';
import NearbyDoctors from './pages/NearbyDoctors';
import HospitalFinder from './pages/HospitalFinder';
import Consultations from './pages/Consultation';
import AIAssistant from './pages/AIAssistant';
import Emergency from './pages/Emergency';
import HealthProfile from './pages/HealthProfile';
import OfflineHealthKit from './pages/OfflineHealthKit';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Offline Kit — accessible WITHOUT login */}
          <Route path="/offline-health-kit" element={<OfflineHealthKit />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><DoctorSearch /></ProtectedRoute>} />
          <Route path="/nearby-doctors" element={<ProtectedRoute><NearbyDoctors /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute><HospitalFinder /></ProtectedRoute>} />
          <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/health-profile" element={<ProtectedRoute><HealthProfile /></ProtectedRoute>} />
          
          {/* Redirect old routes */}
          <Route path="/find" element={<Navigate to="/doctors" />} />
          
          {/* 404 catch */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
