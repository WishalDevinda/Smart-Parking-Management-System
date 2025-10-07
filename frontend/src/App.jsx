import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
// import Sidebar from './components/Sidebar.jsx';

// Auth Pages
import SignIn from './pages/auth/SignIn.jsx';
import SignUp from './pages/auth/SignUp.jsx';

// User Pages
import ReservationPortal from './pages/user/ReservationPortal.jsx';
import TrackingStatus from './pages/user/TrackingStatus.jsx';

// Admin Pages
import DriverAccountManagement from './pages/admin/DriverAccountManagement.jsx';
import ReservationManagement from './pages/admin/ReservationManagement.jsx';
import AdminTrackingStatus from './pages/admin/AdminTrackingStatus.jsx';

function App() {
  const [userType, setUserType] = useState('admin'); // 'user' or 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/signin" replace />;
  };

  // Auth Route Component (redirect to dashboard if already authenticated)
  const AuthRoute = ({ children }) => {
    // For testing purposes, allow access to auth pages even when authenticated
    return children;
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated ? (
          // Show main app with navbar when authenticated
          <>
            <Navbar 
              userType={userType} 
              setIsAuthenticated={setIsAuthenticated}
            />
            <div style={{ display: 'block' }}>
              <div className="content" style={{ width: '100%' }}>
                <Routes>
                  {/* Protected Routes - User Pages */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <ReservationPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/reservations" element={
                    <ProtectedRoute>
                      <ReservationPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/tracking" element={
                    <ProtectedRoute>
                      <TrackingStatus />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected Routes - Admin Pages */}
                  <Route path="/admin/drivers" element={
                    <ProtectedRoute>
                      <DriverAccountManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/reservations" element={
                    <ProtectedRoute>
                      <ReservationManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/tracking" element={
                    <ProtectedRoute>
                      <AdminTrackingStatus />
                    </ProtectedRoute>
                  } />
                  
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/tracking" element={
                    <ProtectedRoute>
                      <TrackingStatus />
                    </ProtectedRoute>
                  } />
                  <Route path="/driver-management" element={
                    <ProtectedRoute>
                      <DriverAccountManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/reservation-management" element={
                    <ProtectedRoute>
                      <ReservationManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin-tracking" element={
                    <ProtectedRoute>
                      <AdminTrackingStatus />
                    </ProtectedRoute>
                  } />
                  
                  {/* Redirect to appropriate dashboard based on user type */}
                  <Route path="*" element={
                    <Navigate 
                      to={userType === 'admin' ? '/admin/drivers' : '/user/reservations'} 
                      replace 
                    />
                  } />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          // Show only auth pages when not authenticated
          <Routes>
            {/* Auth Routes */}
            <Route path="/signin" element={
              <AuthRoute>
                <SignIn 
                  setIsAuthenticated={setIsAuthenticated} 
                  setUserType={setUserType}
                />
              </AuthRoute>
            } />
            <Route path="/signup" element={
              <AuthRoute>
                <SignUp />
              </AuthRoute>
            } />
            {/* Redirect to signin for unauthenticated users */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
