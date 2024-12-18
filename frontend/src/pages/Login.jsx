import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert"; // Assuming this exists
import LoginImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/Favicon_color@2x.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import ApiClient from '../api/ApiClient';
import AuthEndpoint from '../api/AuthEndpoint';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, '');
  const authEndpoint = new AuthEndpoint(apiClient);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setLoginError(null);
  setLoginSuccess(null);

  try {
    const response = await authEndpoint.authenticate(formData);

    if (response) {
      const { access_token, token_type, user } = response;

      dispatch(login({ token: `${token_type} ${access_token}`, user }));
      localStorage.setItem('authToken', `${token_type} ${access_token}`);
      localStorage.setItem('user', JSON.stringify(user));

      setLoginSuccess('Login successful!');
      setTimeout(() => {
        navigate('/console');
      }, 2000);
    }
  } catch (error) {
    if (error.status === 401) {
      setLoginError(error.data.detail || 'Unauthorized access.');
    } else {
      setLoginError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-customLiteBlue">
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-customLiteBlue relative">
        <h2 className="text-3xl font-bold text-customDark pt-20">
          Welcome Back,
          <br /> Log In to Continue
        </h2>
        <img src={LoginImage} alt="Login Illustration" className="w-full h-auto relative" />
      </div>
      <div className="md:w-1/2 flex justify-center items-center p-6 relative">

        <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg pt-16" onSubmit={handleSubmit}>
          <div className="relative flex flex-row justify-between items-center">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <img src={LogoColored} alt="Logo" className="w-8 h-8 mb-6"/>
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faUser} className="text-gray-300"/>
            </span>
            <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full"
                required
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faLock} className="text-gray-300"/>
            </span>
            <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full"
                required
            />
          </div>
          {loginError && <Alert type="error" variant="destructive">{loginError}</Alert>}
          {loginSuccess && <Alert type="success">{loginSuccess}</Alert>}
          <div className="text-right mb-4">
            <Link to="/request-email" className="text-gray-600 text-sm hover:text-gray-500">Forgot password?</Link>
          </div>
          <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-600"
              disabled={isLoading}
          >
            {isLoading ? <Spinner/> : 'Login'}
          </Button>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;