import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope, faLock, faPhone, faUser} from '@fortawesome/free-solid-svg-icons';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {Alert} from "@/components/ui/alert";
import SignUpImage from '../images/man-home-Illustrator.png';
import LogoColored from '../images/Favicon_color@2x.png';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {register} from '../store/authSlice';
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
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSignupError(null);
        setSignupSuccess(null);

        if (formData.password !== formData.confirmPassword) {
            setSignupError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        const {confirmPassword, agreeToTerms, ...dataToSend} = formData;

        // Map formData to the expected API fields
        const apiData = {
            email: formData.email,
            'first_name': formData.firstName,
            'last_name': formData.lastName,
            'phone_number': formData.phone,
            is_active: true, // Assuming true unless specified otherwise
            password: formData.password
        };

        try {
            const response = await authEndpoint.register(apiData);

            if (response) {
                const {access_token, token_type, user} = response;

                dispatch(register({
                    token: `${token_type} ${access_token}`,
                    user,
                }));

                localStorage.setItem('authToken', `${token_type} ${access_token}`);
                localStorage.setItem('user', JSON.stringify(user));

                setSignupSuccess('Signup successful!');
                setTimeout(() => {
                    navigate('/console');
                }, 2000);
            }
        } catch (error) {
            if (error.status === 400 || error.status === 401) {
                setSignupError(error.data.detail || 'Bad request.');
            } else {
                setSignupError('Signup failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-blue-100">
            <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-100 relative">
                <h2 className="text-3xl font-bold text-gray-700 pt-40 text-center">
                    Calculate Smarter,<br/>Spend Wiser ...
                </h2>
                <img src={SignUpImage} alt="Sign Up Illustration" className="w-full h-auto pt-24"/>
            </div>
            <div className="md:w-1/2 flex justify-center items-center p-6 relative">
                <div className="absolute top-60 right-36">
                    <img src={LogoColored} alt="Logo" className="w-8 h-8"/>
                </div>
                <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg pt-16" onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

                    {signupError && <Alert type="error" variant="destructive">{signupError}</Alert>}
                    {signupSuccess && <Alert type="success">{signupSuccess}</Alert>}

                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faUser} className="text-gray-300"/>
            </span>
                        <Input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                            className="w-full"
                            required
                        />
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faUser} className="text-gray-300"/>
            </span>
                        <Input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            className="w-full"
                            required
                        />
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-300"/>
            </span>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full"
                            required
                        />
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faPhone} className="text-gray-300"/>
            </span>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
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

                    <div className="flex items-center border border-gray-300 rounded-lg mb-4">
            <span className="ml-3 mr-3 border-r border-gray-300 pr-3">
              <FontAwesomeIcon icon={faLock} className="text-gray-300"/>
            </span>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm Password"
                            className="w-full"
                            required
                        />
                    </div>

                    <div className="mb-6 flex items-center">
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
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-400 hover:bg-green-500"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner/> : 'Sign Up'}
                    </Button>

                    <p className="mt-4 text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-500">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;