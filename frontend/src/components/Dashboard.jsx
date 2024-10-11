import React from 'react';
import DashboardLayout from './reusable/DashboardLayout'; // Import the new layout

const Dashboard = () => {
  return (
    <DashboardLayout>
      {/* Dashboard-specific content */}
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="flex mt-6 space-x-6">
        {/* Total Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-64">
          <h3 className="text-gray-700 text-sm">Total Balance</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">₦0.00</p>
          <p className="text-sm text-gray-500">0% from last month</p>
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
    </DashboardLayout>
  );
};

export default Dashboard;
