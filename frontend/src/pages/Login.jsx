import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    if (loginError) setLoginError(null);
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

        setLoginSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/console');
        }, 1500);
      }
    } catch (error) {
      if (error.status === 401) {
        setLoginError(error.data?.detail || 'Invalid email or password');
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-customLiteBlue p-8 md:p-12">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-8">
            <img src={LogoColored} alt="Chekam Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-customBlue">Chekam</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-customDark mb-4">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Log in to manage your finances, track spending, and achieve your financial goals.
          </p>
          <img
            src={LoginImage}
            alt="Login Illustration"
            className="w-full h-auto max-w-lg mx-auto"
          />
        </div>
      </div>

      <div className="md:w-1/2 flex justify-center items-center p-6 md:p-12 bg-white">
        <Card className="w-full max-w-md border-0 shadow-none md:shadow-lg md:border">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-customDark">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-10 h-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 h-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/request-email"
                  className="text-sm text-customBlue hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {loginSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{loginSuccess}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-customBlue hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 pt-4">
                Don't have an account?{' '}
                <Link to="/signup" className="text-customBlue hover:text-blue-700 font-semibold">
                  Sign Up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
