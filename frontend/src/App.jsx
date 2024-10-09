import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login'
import Dashboard from './components/Dashboard';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
      
    </Router>
  )
}

export default App
