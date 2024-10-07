import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import LoginImage from '../images/man-home-Illustrator.png'
import LogoWhite from '../images/Favicon_white@2x.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login form submission
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-blue-100">
      {/* Left Side with Image and Slogan */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-100 relative">
        <h2 className="text-3xl font-bold text-gray-700 pt-40">
          Welcome Back,
          <br /> Log In to Continue
        </h2>
        <img src={LoginImage} alt="Login Illustration" className="w-full h-auto pt-32" />
        
        {/* Logo as background */}
        <div
          className="absolute inset-0 opacity-15 bg-left bg-no-repeat"
          style={{ backgroundImage: `url(${LogoWhite})`, backgroundSize: '600px', backgroundPosition: '-90px -80px' }}
        ></div>
      </div>

      {/* Right Side with Form */}
      <div className="md:w-1/2 flex justify-center items-center p-6 relative">
        <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faUser} className="text-gray-300" />
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-1 focus:outline-none rounded-r-lg"
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faLock} className="text-gray-300" />
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full p-1 focus:outline-none rounded-r-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Login
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <a href="/signup" className="text-blue-500">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
