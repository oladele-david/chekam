import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from '@/components/Sidebar';
import { logout } from '@/store/authSlice';

const DashboardHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const user = useSelector((state) => state.auth.user);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeDropdown);
    return () => {
      document.removeEventListener('mousedown', closeDropdown);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const initials = user ? getInitials(user.first_name, user.last_name) : 'G';

  return (
    <header className="bg-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-15 h-12 bg-transparent lg:hidden mr-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-2xl font-bold text-blue-600">Welcome!</h1>
      </div>
      <div className="flex items-center space-x-4 relative">
        <span className="text-gray-700">{user ? `${user.first_name} ${user.last_name}` : 'Guest'}</span>
        <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={initials} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
        </div>
        {dropdownOpen && (
          <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul>
              <li>
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
              </li>
              <li>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
              </li>
              <li onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;