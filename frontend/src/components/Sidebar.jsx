// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Layers, Wallet, FileText, Bell, Settings } from 'lucide-react';
import LogoWhite from "@/images/Favicon_white@2x.png";

const Sidebar = () => (
  <div className="flex flex-col h-full bg-customBlue text-white rounded-tr-3xl">
    <div className="p-4 flex items-center space-x-2">
      <div className="rounded-full p-2">
        <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
      </div>
      <span className="text-xl font-bold">Chekam</span>
    </div>
    <nav className="flex-1">
      <ul className="space-y-4 p-4">
        {[
          { icon: Home, label: 'Home', route: '/console' },
          { icon: Layers, label: 'Categories', route: '/categories' },
          { icon: Wallet, label: 'Budgets', route: '/budgets' },
          { icon: FileText, label: 'Transactions', route: '/transactions' },
          { icon: Bell, label: 'Notifications', route: '/notifications' },
          { icon: Settings, label: 'Settings', route: '/settings' },
        ].map(({ icon: Icon, label, route }) => (
          <li key={label}>
            <Link to={route}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white text-lg py-3 hover:bg-customCyan ${
                  route === window.location.pathname ? 'bg-customBlue' : 'bg-customBlue'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

export default Sidebar;