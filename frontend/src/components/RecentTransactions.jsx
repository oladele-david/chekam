// src/components/RecentTransactions.jsx
import React from 'react';

const RecentTransactions = ({ transactions }) => (
  <div className="space-y-4">
    {transactions.map((transaction, index) => (
      <div key={index} className="flex items-center space-x-4 bg-white rounded-lg p-4">
        <div className="flex-shrink-0 w-12 text-center">
          <div className="font-medium text-gray-900">{transaction.date.split(' ')[1]}</div>
          <div className="text-gray-500 text-sm">{transaction.date.split(' ')[0]}</div>
        </div>
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          {transaction.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
          <p className="text-sm text-gray-500">{transaction.category}</p>
        </div>
        <div className="text-sm font-medium text-gray-900">
          {transaction.amount}
        </div>
      </div>
    ))}
  </div>
);

export default RecentTransactions;