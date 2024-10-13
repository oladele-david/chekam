import React, { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from './Sidebar';

const DashboardHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Hamburger menu for smaller screens */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden mr-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-2xl font-bold text-blue-600">Welcome!</h1>
      </div>
      <div className="relative flex items-center space-x-4">
        <span className="text-gray-700">Alexander Smith</span>
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AS" />
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <button onClick={toggleDropdown} className="focus:outline-none">
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;