import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login'
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute.jsx'; // Import the PrivateRoute component
import Expense from './components/reusable/Expense.jsx';
import Budget from './components/reusable/Budget.jsx';
function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/expense" element={<Expense />}/>
        <Route path="/budget" element={<Budget />}/>
        <Route path="/dashboard" element={ <Dashboard />} />
            {/* <PrivateRoute>
              
            </PrivateRoute>
          }
        /> */}
      </Routes>
      
    </Router>
  )
}

export default App
