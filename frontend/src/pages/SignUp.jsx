import React, { useState } from 'react';
import axios from 'axios';
import SuccessSignup from './SuccessSignup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock } from '@fortawesome/free-solid-svg-icons';
import SignUpImage from '../images/man-home-Illustrator.png'
import Logo from '../images/Favicon_color@2x.png'
import LogoWhite from '../images/Favicon_white@2x.png'
import { Link, useNavigate } from 'react-router-dom';


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
    const navigate = useNavigate();
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [termsError, setTermsError] = useState(false); // State to track terms error
    const [submissionError, setSubmissionError] = useState(null); // To track submission errors
    const [showSuccess, setShowSuccess] = useState(false);
    // const localUrl = import.meta.env.VITE_DEVELOPMENT_URL

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setPasswordMatchError(true);
            return;
        }
        setPasswordMatchError(false);

        // Check if terms and conditions are agreed
        if (!formData.agreeToTerms) {
            setTermsError(true); // Set terms error state to true
            return;
        }
        setTermsError(false); // Reset terms error state if user agrees
        // exclude confirmPassword when submitting to backend
        const { confirmPassword, agreeToTerms, ...dataToSend } = formData;
        console.log('Data submitted: ', dataToSend);


        try {
            // Send the user data to the backend
            // const response = await axios.post(`${process.env.REACT_APP_LOCAL}/auth/register`, dataToSend);
            // const response = await axios.post(`${localUrl}/auth/register`, dataToSend);
            const response = await axios.post(`${import.meta.env.VITE_DEVELOPMENT_URL}/auth/register`, dataToSend);
    
            // Check if the response status is 200
            if (response.status === 200) {
                const { access_token, token_type } = response.data;
    
                // Save the token in localStorage for session management
                localStorage.setItem('accessToken', `${token_type} ${access_token}`);
                console.log(access_token);
                
    
                // Show the success notification
                setShowSuccess(true); // Show success notification
                setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
    
                // Navigate to the dashboard after successful signup
                navigate('/dashboard');
            } else {
                // Handle cases where the status is not 200
                setSubmissionError('Signup was not successful. Please try again.');
            }
    
        } catch (error) {
            // Handle any errors that occur during the signup process
            console.error('Signup failed:', error);
            setSubmissionError('Signup failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
            {/* Left Side with Image and Slogan */}
            <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-100 relative">
                {/* Background logo image */}
                <div
                    className="absolute inset-0 opacity-15 bg-no-repeat"
                    style={{
                        backgroundImage: `url(${LogoWhite})`,
                        backgroundSize: '580px', // Adjust size as needed
                        backgroundPosition: '-90px -80px',  // Shift it leftwards
                    }}
                ></div>

                {/* Slogan text */}
                <h2 className="text-3xl font-bold text-gray-700 relative z-10 pt-40 text-center">
                    Calculate Smarter,<br />Spend Wiser ...
                </h2>

                {/* Image */}
                <img src={SignUpImage} alt="Financial Illustration" className="w-full h-auto pt-32 relative z-10" />
            </div>


            {/* Right Side with Signup Form */}
            <div className=" md:w-1/3 h-3/5 bg-white relative flex justify-center items-center px-8 pt-20 pb-8 sm:rounded-lg sm:ml-8 sm:mt-12 sm:mb-12">

                <div className="absolute top-8 right-8">
                    <img src={Logo} alt="Logo" className="w-8 h-8" />
                </div>

                {/* Render success notification */}
                {showSuccess && (
                    <SuccessSignup
                        message="Sign up successful!"
                        onClose={() => setShowSuccess(false)}
                    />
                )}

                <form className="w-full max-w-md" onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Signup</h2>

                    {submissionError && (
                        <p className="text-red-500 mb-4">{submissionError}</p> // Place at top if you want general errors
                    )}

                    {/* First Name */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faUser} className="ml-3 mr-3 text-gray-300" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faUser} className="ml-3 mr-3 text-gray-300" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faEnvelope} className="ml-3 mr-3 text-gray-300" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faPhone} className="ml-3 mr-3 text-gray-300" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <FontAwesomeIcon icon={faLock} className="ml-3 mr-3 text-gray-300" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-2">
                        <label className="block text-gray-700">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <span className="ml-3 mr-3 border-gray-300">
                                <FontAwesomeIcon icon={faLock} className="text-gray-300" />
                            </span>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full p-1 focus:outline-none rounded-r-lg"
                                required
                            />
                        </div>
                        {passwordMatchError && <p className="text-red-500 text-sm">Passwords do not match.</p>}
                    </div>

                    {/* Agree to Terms */}
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="ml-2 text-gray-600">
                                I agree to all <a href="/terms" className="text-gray-700 hover:text-gray-500">terms and conditions</a>
                            </span>
                        </label>

                        {termsError && (
                            <p className="text-red-500 mt-2">You must agree to the terms and conditions.</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 border-none">
                        Signup
                    </button>

                    {/* Already have an account */}
                    <p className="mt-4 text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-gray-700 hover:text-gray-500">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
