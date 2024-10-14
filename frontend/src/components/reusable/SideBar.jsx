import React from 'react';
import { Link } from 'react-router-dom';
import LogoWhite from '../../images/Favicon_white@2x.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faWallet, faMoneyCheckAlt, faBell, faCog } from '@fortawesome/free-solid-svg-icons';

export default function SideNavBar() {
  return (
    <nav className="w-56 bg-customBlue text-white flex flex-col p-5 space-y-4">
      <div className="font-bold text-2xl">
        <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
      </div>
      <ul className="space-y-4">
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faHome} />
          <Link to="/dashboard" className="hover:bg-customCyan p-2 rounded text-white">Dashboard</Link>
        </li>
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faList} />
          <Link to="/categories" className="hover:bg-customCyan p-2 rounded text-white">Categories</Link>
        </li>
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faWallet} />
          <Link to="/budget" className="hover:bg-customCyan p-2 rounded text-white">Budget</Link>
        </li>
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faMoneyCheckAlt} />
          <Link to="/expense" className="hover:bg-customCyan p-2 rounded text-white">Expenses</Link>
        </li>
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faBell} />
          <Link to="/notifications" className="hover:bg-customCyan p-2 rounded text-white">Notifications</Link>
        </li>
        <li className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCog} />
          <Link to="/settings" className="hover:bg-customCyan p-2 rounded text-white">Settings</Link>
        </li>
      </ul>
    </nav>
  );
}
