import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import LoginImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/Favicon_color@2x.png';
import LogoWhite from '../images/Favicon_white@2x.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import ApiClient from '../api/ApiClient';
import AuthEndpoint from '../api/AuthEndpoint';


const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loginError, setLoginError] = useState(null);
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

        try {
            const response = await authEndpoint.authenticate(formData);

            if (response) {
                const { access_token, token_type, user } = response;

                dispatch(login({
                    token: `${token_type} ${access_token}`,
                    user,
                }));

                navigate('/dashboard');
            }
        } catch (error) {
            console.log('Login failed:', error);
            setLoginError('Login failed. Please check your email and password.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-blue-100">
            {/* Left Side with Image and Slogan */}
            <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-100 relative">
                <h2 className="text-3xl font-bold text-gray-700 pt-40">
                    Welcome Back,
                    <br /> Log In to Continue
                </h2>
                <img src={LoginImage} alt="Login Illustration" className="w-full h-auto pt-24" />

                {/* Logo as background */}
                <div
                    className="absolute inset-0 opacity-15 bg-left bg-no-repeat"
                    style={{ backgroundImage: `url(${LogoWhite})`, backgroundSize: '600px', backgroundPosition: '-90px -80px' }}
                ></div>
            </div>
            {/* Right Side with Form */}
            <div className="md:w-1/2 flex justify-center items-center p-6 relative">
                <div className="absolute top-60 right-36">
                    <img src={LogoColored} alt="Logo" className="w-8 h-8" />
                </div>
                <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg pt-16" onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
                        <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
                            <FontAwesomeIcon icon={faUser} className="text-gray-300" />
                        </span>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
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
                    {loginError && <p className="text-red-600">{loginError}</p>}
                    <div className="text-right mb-4">
                        <a href="/forgot-password" className="text-gray-600 text-sm hover:text-gray-500">Forgot password?</a>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
                    >
                        Login
                    </button>
                    <p className="text-center text-gray-600 mt-4">
                        Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;