// src/pages/404.jsx
import React from 'react';
import {Link} from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-lg">Page Not Found</p>
            <Link to="/console" className="block px-4 py-2 bg-gray-100 my-5  hover:bg-gray-300 ">Return Home</Link>
        </div>
    );
};

export default NotFound;