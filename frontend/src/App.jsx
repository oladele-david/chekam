import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login'
import Console from './pages/Console';
import PrivateRoute from './components/PrivateRoute.jsx'; // Import the PrivateRoute component
function App() {


  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/console" element={
            <PrivateRoute>
              <Console />
            </PrivateRoute>
          }
        />
      </Routes>

    </Router>
  )
}

export default App

