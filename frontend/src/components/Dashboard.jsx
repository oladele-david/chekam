import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faWallet, faMoneyCheckAlt, faBell, faCog } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../api/ApiClient'; // Adjust the path as needed
import { logout } from '../store/authSlice'; // Logout action
import LogoWhite from '../images/Favicon_white@2x.png';
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
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

    setDate(new Date().toLocaleDateString());

  }, [dispatch]);

   const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <nav className="w-64 bg-blue-700 text-white flex flex-col p-5 space-y-4">
        <div className="font-bold text-2xl">
            <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
        </div>
        <ul className="space-y-4">
          {/* ... */}
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faCog} /> <span>Settings</span>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-md">
          <div>
            <h1 className="text-xl">{date}</h1>
            <p>{timeOfDay}, {user?.firstName} {user?.last_name}!</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
              <img
                src="/path/to/profile.jpg"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span>{user?.firstName} {user?.last_name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-gray-700 rounded-md shadow-lg w-48">
                <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</a>
                <a href="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
                <a href="/help-center" className="block px-4 py-2 hover:bg-gray-100">Help Center</a>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Welcome Dashboard</h2>
          {/* Content... */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;