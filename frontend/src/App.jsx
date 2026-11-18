import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAvailability from './pages/DoctorAvailability';
import BookAppointment from './pages/BookAppointment';

import PatientHistory from './pages/PatientHistory';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Routes>
                  <Route path="/" element={<PatientDashboard />} />
                  <Route path="book" element={<BookAppointment />} />
                  <Route path="history" element={<PatientHistory />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Routes>
                  <Route path="/" element={<DoctorDashboard />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="availability" element={<DoctorAvailability />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
