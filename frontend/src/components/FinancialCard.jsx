// src/components/FinancialCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FinancialCard = ({ title, amount, change }) => (
  <Card className="bg-white">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {change > 0 ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-green-500">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-red-500">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{amount}</div>
      <p className="text-xs text-gray-500">
        {Math.abs(change)}% from last month
      </p>
    </CardContent>
  </Card>
);

export default FinancialCard;