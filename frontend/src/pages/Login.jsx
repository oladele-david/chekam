import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import LoginImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/ChekamLogo_color@2x.png';
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
        <div className="min-h-screen flex items-center justify-center bg-blue-100">
            <img src={LoginImage} alt="Background" className="absolute inset-0 object-contain w-full h-full z-0" />
            <div className="w-1/3 max-w-80 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md px-8 pt-32 pb-8 rounded-lg shadow-md z-10 relative ml-[-92px] mb-12 h-96">
                <div className="absolute top-0 left-0 w-full flex justify-center text-center mb-32 mt-8">
                    <img src={LogoColored} alt="Logo" className="h-12" />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
                        <span className="ml-3 mr-3 border-r border-gray-500 pr-3">
                            <FontAwesomeIcon icon={faUser} className="text-gray-700" />
                        </span>
                        <input
                            type="email"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full p-1 focus:outline-none rounded-r-lg"
                            required
                        />
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-lg mb-2">
                        <span className="ml-3 mr-3 border-r border-gray-500 pr-3">
                            <FontAwesomeIcon icon={faLock} className="text-gray-700" />
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
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 border-none transition duration-200"
                    >
                        Log In
                    </button>

                    <p className="mt-4 text-sm text-center text-gray-600">
                        Don't have an account? <Link to="/signup" className="text-gray-700 hover:text-gray-500">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;