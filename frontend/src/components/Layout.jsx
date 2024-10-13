// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from "@/components/DashboardHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Layout = ({ children }) => (
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar for larger screens */}
    <aside className="w-64 hidden lg:block">
      <Sidebar />
    </aside>

    {/* Main content */}
    <div className="flex-1 flex flex-col  overflow-hidden">
      {/* Header */}
      <DashboardHeader />
      {/* Page-specific content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  </div>
);

export default Layout;
