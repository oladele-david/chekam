// src/components/Dashboard.jsx
import React from 'react';
import Layout from '@/components/Layout.jsx';
import FinancialCard from '@/components/FinancialCard';
import Budgets from '@/components/Budgets.jsx';
import RecentTransactions from '@/components/RecentTransactions';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";

const Console = () => {
    const transactions = [
        {date: 'Oct 07', icon: '🥕', title: 'Vegetables', category: 'Food', amount: 'NGN360'},
        {date: 'Oct 08', icon: '💰', title: 'Savings', category: 'Personal', amount: 'NGN660'},
        {date: 'Oct 09', icon: '💊', title: 'Drugs', category: 'Health', amount: 'NGN660'},
        {date: 'Oct 10', icon: '🎨', title: 'Hobbie', category: 'Personal', amount: 'NGN660'},
    ];

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-UK', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Layout>
            <div className="mb-8 bg">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                        <p className="text-gray-500">{formattedDate}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-500">70%</div>
                            <div className="text-sm text-gray-500">Completed</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Remaining</div>
                            <div className="text-2xl font-bold text-gray-800">09 Days</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <FinancialCard title="Total Balance" amount="10,345.89" change={30} currency="₦"/>
                <FinancialCard title="Monthly Income" amount="10,345.89" change={30} currency="₦"/>
                <FinancialCard title="Monthly Expense" amount="10,345.89" change={30} currency="₦"/>
                <Card className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Budget Alert</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                             className="h-4 w-4 text-yellow-500">
                            <path
                                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold">Dinning out</div>
                        <p className="text-xs text-gray-500">75% of budget used</p>
                        <Progress value={75} className="h-1 mt-2"/>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Budget Expenses</h3>
                        <Button variant="outline" className="text-blue-600 border-blue-600">Create Budget</Button>
                    </div>
                    <Budgets
                        icon={<div className="bg-blue-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>}
                        title="Food"
                        amount="2,000"
                        total="4,500"
                        currency="₦"
                    />
                    {/* Add more Budgets components as needed */}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                        <Button variant="outline" className="text-blue-600 border-blue-600">Add Transaction</Button>
                    </div>
                    <RecentTransactions transactions={transactions}/>
                </div>
            </div>
        </Layout>
    );
};

export default Console;
