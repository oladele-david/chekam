import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import SignUpImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/Favicon_color@2x.png';
import LogoWhite from '../images/Favicon_white@2x.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../store/authSlice';
import ApiClient from '../api/ApiClient';
import AuthEndpoint from '../api/AuthEndpoint';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, '');
  const authEndpoint = new AuthEndpoint(apiClient);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (signupError) setSignupError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      setSignupError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setSignupError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    const { confirmPassword, agreeToTerms, ...dataToSend } = formData;

    const apiData = {
      email: dataToSend.email,
      first_name: dataToSend.firstName,
      last_name: dataToSend.lastName,
      phone_number: dataToSend.phone,
      is_active: true,
      password: dataToSend.password
    };

    try {
      const response = await authEndpoint.register(apiData);

      if (response) {
        const { access_token, token_type, user } = response;

        dispatch(register({
          token: `${token_type} ${access_token}`,
          user,
        }));

        localStorage.setItem('authToken', `${token_type} ${access_token}`);
        localStorage.setItem('user', JSON.stringify(user));

        setSignupSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/console');
        }, 1500);
      }
    } catch (error) {
      if (error.status === 400 || error.status === 401) {
        setSignupError(error.data?.detail || 'Registration failed. Please check your information.');
      } else {
        setSignupError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-customLiteBlue p-8 md:p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url(${LogoWhite})`,
            backgroundSize: '600px',
            backgroundPosition: '-100px -100px',
          }}
        />
        <div className="max-w-md w-full relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src={LogoColored} alt="Chekam Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-customBlue">Chekam</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-customDark mb-4">
            Calculate Smarter,
            <br />
            Spend Wiser
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Join thousands of users managing their finances with intelligent budgeting and Nigerian tax calculations.
          </p>
          <img
            src={SignUpImage}
            alt="Sign Up Illustration"
            className="w-full h-auto max-w-lg mx-auto"
          />
        </div>
      </div>

      <div className="md:w-1/2 flex justify-center items-center p-6 md:p-12 bg-white overflow-y-auto">
        <Card className="w-full max-w-md border-0 shadow-none md:shadow-lg md:border my-8">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-customDark">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="pl-9 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="pl-9 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className="pl-9 h-9 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 xxx xxx xxxx"
                    className="pl-9 h-9 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 6 characters"
                    className="pl-9 h-9 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="pl-9 h-9 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-customBlue focus:ring-customBlue"
                  required
                  disabled={isLoading}
                />
                <label className="text-xs text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-customBlue hover:text-blue-700 font-medium">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              {signupError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{signupError}</AlertDescription>
                </Alert>
              )}

              {signupSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">{signupSuccess}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-customBlue hover:bg-blue-700 text-white font-medium text-sm"
                disabled={!formData.agreeToTerms || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-xs text-gray-600 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-customBlue hover:text-blue-700 font-semibold">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
