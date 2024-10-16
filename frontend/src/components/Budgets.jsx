// src/components/Budgets.jsx
import React from 'react';
import { Progress } from "@/components/ui/progress";

const Budgets = ({ icon, title, amount, total, currency }) => (
  <div className="flex items-center space-x-4 bg-white rounded-lg p-4">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <Progress value={(parseInt(amount) / parseInt(total)) * 100} className="h-1 mt-1" />
    </div>
    <div className="text-sm text-gray-500">
        {currency}{amount} of {currency}{total}
    </div>
  </div>
);

export default Budgets;
