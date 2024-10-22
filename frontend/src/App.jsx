import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import Console from './pages/Console';
import Categories from '@/pages/Categories';
import Budgets from '@/pages/Budgets';
import Transactions from './pages/Transactions.jsx';
import NotFound from './pages/404'; // Import the 404 component
import PrivateRoute from './components/PrivateRoute.jsx';
import RequestEmail from './pages/forgotPassword/RequestEmail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-email" element={<RequestEmail />} />
        <Route path="/console" element={
          <PrivateRoute>
            <Console />
          </PrivateRoute>
        }/>
        <Route path="/categories" element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }/>
        <Route path="/budgets" element={
          <PrivateRoute>
            <Budgets />
          </PrivateRoute>
        }/>
        <Route path="/transactions" element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }/>
        <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
      </Routes>
    </Router>
  );
}

export default App;
