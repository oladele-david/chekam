import React from 'react';
import SideNavBar from './SideBar';
import UserProfile from './UserProfile';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideNavBar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* User Profile at the top */}
        <div className="p-4">
          <UserProfile />
        </div>

        {/* Page-specific content */}
        <div className="p-6 flex-grow">
          {children} {/* This will render the content of each specific page */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
