import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>

      </Routes>
      
    </Router>
  )
}

export default App
