import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../store/authSlice'; // Logout action
import { useSelector, useDispatch } from 'react-redux';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

function UserProfile() {

    const [timeOfDay, setTimeOfDay] = useState('Good Morning');
    const [date, setDate] = useState(new Date().toLocaleDateString());
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);


    const dispatch = useDispatch();
   const navigate = useNavigate();

   useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 12 && hours < 18) setTimeOfDay('Good Afternoon');
    else if (hours >= 18) setTimeOfDay('Good Evening');
    else setTimeOfDay('Good Morning');

   // Get current date
   const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
   const formattedDate = new Date().toLocaleDateString('en-GB', options).replace(',', '');
   setDate(formattedDate);

   // Fetch user profile information if needed (mock)
   const token = localStorage.getItem('accessToken');
   axios.get('/api/user-profile', {
     headers: { Authorization: token },
   }).then((response) => {
     setUser(response.data);
   });

  }, [dispatch]);

   const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };


  return (
        
    <div className="flex justify-between items-center p-6 border-b">
        <div>
            <h1 className="text-lg">{date}</h1>
            {/* <p>{timeOfDay}, {user?.firstName} {user?.lastName}</p> */}
        </div>

        <div className="relative flex justify-evenly items-center rounded-lg">
      {/* Left side: Time of day greeting and user name */}
      <div className="flex flex-col">
        <span className="text-gray-500">{timeOfDay},</span>
        <span className="text-customBlue font-bold text-md">Alexander Smith</span>
      </div>

      {/* Center: Profile image */}
      <div className="flex items-center space-x-2">
        <img
          src="/path/to/profile.jpg" // replace with actual profile image path
          alt="Profile"
          className="w-12 h-12 rounded-full"
        />
      </div>

      {/* Right side: Dropdown menu */}
      <div className="relative">
        <FontAwesomeIcon
          icon={dropdownOpen ? faChevronUp : faChevronDown}
          className="cursor-pointer text-gray-600"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white text-gray-700 rounded-md shadow-lg w-60">
            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
            <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
            <Link to="/help-center" className="block px-4 py-2 hover:bg-gray-100">Help Center</Link>
            <Link to="/logout" onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100">Logout</Link>
          </div>
        )}
      </div>
    </div>
    </div>
    );
}

export default UserProfile