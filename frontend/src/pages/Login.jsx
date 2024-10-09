import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import LoginImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/ChekamLogo_color@2x.png';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loginError, setLoginError] = useState(null); // To track login errors
    const navigate = useNavigate(); // To redirect to another route after successful login

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send the login data (email and password) to the backend
            // const response = await axios.post('YOUR_API_ENDPOINT/login', formData);
            const response = await axios.post(`${import.meta.env.VITE_DEVELOPMENT_URL}/auth/login`, formData);

            // Check if the response is successful (status code 200)
            if (response.status === 200) {
                // Extract the new access token from the response
                const { access_token, token_type } = response.data;

                // Save the new access token in localStorage
                localStorage.setItem('accessToken', `${token_type} ${access_token}`);

                // Redirect the user to the dashboard (protected route)
                navigate('/dashboard');
            }
        } catch (error) {
            // If there's an error, handle it (e.g., incorrect credentials or network error)
            console.error('Login failed:', error);
            setLoginError('Login failed. Please check your email and password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">
            {/* Background Image */}
            <img src={LoginImage} alt="Background" className="absolute inset-0 object-contain w-full h-full z-0" />



            {/* Login Form */}
            <div className="w-1/3 max-w-80 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md px-8 pt-32 pb-8 rounded-lg shadow-md z-10 relative ml-[-92px] mb-12 h-96">
                {/* Logo in top center */}
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
                            name="email"
                            value={formData.email}
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
                    {loginError && <p>{loginError}</p>} {/* Show login error if present */}

                    {/* Forgot Password */}
                    <div className="text-right mb-4">
                        <a href="/forgot-password" className="text-gray-600 text-sm hover:text-gray-500">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 border-none transition duration-200"
                    >
                        Log In
                    </button>

                    {/* New user */}
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Don't have an account? <Link to="/signup" className="text-gray-700 hover:text-gray-500">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
