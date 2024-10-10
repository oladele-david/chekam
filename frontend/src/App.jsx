import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login'
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute.jsx'; // Import the PrivateRoute component
function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      
    </Router>
  )
}

export default App
