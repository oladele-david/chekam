import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import Console from './pages/Console';
import Categories from '@/pages/Categories';
import Budgets from '@/pages/Budgets';
import Transactions from './pages/Transactions.jsx';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import TaxCalculator from './pages/TaxCalculator';
import NotFound from './pages/404';
import PrivateRoute from './components/PrivateRoute.jsx';
import RequestEmail from './pages/forgotPassword/RequestEmail';
import OfflineIndicator from './components/OfflineIndicator.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-email" element={<RequestEmail />} />
        <Route path="/console" element={
          <PrivateRoute>
            <Console />
          </PrivateRoute>
        }/>
        <Route path="/analytics" element={
          <PrivateRoute>
            <Analytics />
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
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }/>
        <Route path="/tax-calculator" element={
          <PrivateRoute>
            <TaxCalculator />
          </PrivateRoute>
        }/>
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <OfflineIndicator />
    </Router>
  );
}

export default App;
