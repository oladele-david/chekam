import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout'; // Use the new layout
import BackgroundImage from '../../images/man-home-Illustrator.png';

const Expense = () => {
    const navigate = useNavigate();

    const handleAddExpense = () => {
        // Redirect user to the expense form page or open a modal
        navigate('/add-expense');
    };

    return (
        <DashboardLayout>
            <div className="relative flex flex-col justify-center items-center h-screen bg-gray-100">
                {/* Main content for expenses */}
                <div className="absolute top-1/3 z-10 flex flex-col justify-center items-center">
                    {/* Main content for expenses */}
                    <h2 className="onest-bold text-2xl font-bold text-gray-800 mb-4 text-center">
                        Looks Like You Haven't <br /> Added Any <span className="text-green-500">Expenses</span> Yet.
                    </h2>
                    <button
                        onClick={handleAddExpense}
                        className="bg-yellow-400 text-white onest-regular px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300 border-none"
                    >
                        Add New
                    </button>
                </div>

                {/* Background Image */}
                <div className="absolute bottom-0 right-0">
                    <img src={BackgroundImage} alt="Illustration" className="h-64 w-auto" />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Expense;
