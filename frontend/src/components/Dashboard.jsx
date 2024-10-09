import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faWallet, faMoneyCheckAlt, faBell, faCog } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LogoWhite from '../images/Favicon_white@2x.png'

const Dashboard = () => {
  const [user, setUser] = useState({ firstName: 'Alexander', lastName: 'Smith' });
  const [timeOfDay, setTimeOfDay] = useState('Good Morning');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch user profile from backend (optional)
    // axios.get('/api/user-profile').then(response => setUser(response.data));
    
    // Get time of day for greeting
    const hours = new Date().getHours();
    if (hours >= 12 && hours < 18) setTimeOfDay('Good Afternoon');
    else if (hours >= 18) setTimeOfDay('Good Evening');

    // Get current date
    setDate(new Date().toLocaleDateString());

    // Fetch user profile information if needed (mock)
    const token = localStorage.getItem('accessToken');
    axios.get('/api/user-profile', {
      headers: { Authorization: token },
    }).then((response) => {
      setUser(response.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <nav className="w-64 bg-blue-700 text-white flex flex-col p-5 space-y-4">
        <div className="font-bold text-2xl">
            <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
        </div>
        <ul className="space-y-4">
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faHome} /> <span>Dashboard</span>
          </li>
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faList} /> <span>Categories</span>
          </li>
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faWallet} /> <span>Budget</span>
          </li>
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faMoneyCheckAlt} /> <span>Transactions</span>
          </li>
          <li className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faBell} /> <span>Notifications</span>
          </li>
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
            <p>{timeOfDay}, {user.firstName}!</p>
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
              <span>{user.firstName} {user.lastName}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-gray-700 rounded-md shadow-lg w-48">
                <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</a>
                <a href="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
                <a href="/help-center" className="block px-4 py-2 hover:bg-gray-100">Help Center</a>
                <a href="/logout" className="block px-4 py-2 hover:bg-gray-100">Logout</a>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-2 text-gray-500">06 October, Sunday</p>

          <div className="flex mt-6 space-x-6">
            {/* Total Balance Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg w-64">
              <h3 className="text-gray-700 text-sm">Total Balance</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">₦0.00</p>
              <p className="text-sm text-gray-500">30% from last month</p>
            </div>

            {/* Progress bar */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-700 text-sm">Completed</h3>
                <p className="text-sm">Remaining 09 Days</p>
              </div>
              <div className="mt-4 bg-gray-200 h-4 rounded-full">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
