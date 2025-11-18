// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Home,
  Layers,
  Wallet,
  FileText,
  Bell,
  TrendingUp,
  BarChart3,
  Calculator,
  Settings
} from 'lucide-react';
import LogoWhite from "@/images/Favicon_white@2x.png";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', route: '/console' },
    { icon: TrendingUp, label: 'Analytics', route: '/analytics' },
    { icon: Layers, label: 'Categories', route: '/categories' },
    { icon: Wallet, label: 'Budgets', route: '/budgets' },
    { icon: FileText, label: 'Transactions', route: '/transactions' },
    { icon: BarChart3, label: 'Reports', route: '/reports' },
    { icon: Calculator, label: 'Tax Calculator', route: '/tax-calculator' },
    { icon: Bell, label: 'Notifications', route: '/notifications' },
    { icon: Settings, label: 'Settings', route: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-customBlue text-white shadow-lg">
      {/* Logo Section */}
      <div className="p-6 flex items-center space-x-3 border-b border-white/10">
        <div className="bg-white/10 rounded-full p-2 backdrop-blur-sm">
          <img src={LogoWhite} alt="Chekam Logo" className="w-8 h-8" />
        </div>
        <span className="text-2xl font-bold text-white">Chekam</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map(({ icon: Icon, label, route }) => {
            const isActive = location.pathname === route;

            return (
              <li key={label}>
                <Link to={route}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-white/90'}`}>
                      {label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1 h-6 bg-white rounded-full" />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center text-white/60 text-xs">
          <p>© 2024 Chekam</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;