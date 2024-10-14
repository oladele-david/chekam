// src/components/Sidebar.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Layers, Wallet, FileText, Bell, Settings } from 'lucide-react';
import LogoWhite from "@/images/Favicon_white@2x.png";

const Sidebar = () => (
  <div className="flex flex-col h-full bg-blue-600 text-white rounded-tr-3xl">
    <div className="p-4 flex items-center space-x-2">
      <div className="rounded-full p-2">
        <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
      </div>
      <span className="text-xl font-bold">Chekam</span>
    </div>
    <nav className="flex-1">
      <ul className="space-y-4 p-4">
        {[
          { icon: Home, label: 'Home', active: true },
          { icon: Layers, label: 'Categories' },
          { icon: Wallet, label: 'Budgets' },
          { icon: FileText, label: 'Transactions' },
          { icon: Bell, label: 'Notifications' },
          { icon: Settings, label: 'Settings' },
        ].map(({ icon: Icon, label, active }) => (
          <li key={label}>
            <Button
              variant="ghost"
              className={`w-full justify-start text-white text-lg py-3 hover:bg-blue-500 ${
                active ? 'bg-blue-500' : 'bg-blue-600'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

export default Sidebar;