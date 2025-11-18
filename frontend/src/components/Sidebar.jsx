// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
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

const Sidebar = () => (
  <div className="flex flex-col h-full bg-customBlue text-white rounded-tr-3xl">
    <div className="p-4 flex items-center space-x-2">
      <div className="rounded-full p-2">
        <img src={LogoWhite} alt="White Logo" className="w-8 h-8" />
      </div>
      <span className="text-xl font-bold">Chekam</span>
    </div>
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-2 p-4">
        {[
          { icon: Home, label: 'Dashboard', route: '/console' },
          { icon: TrendingUp, label: 'Analytics', route: '/analytics' },
          { icon: Layers, label: 'Categories', route: '/categories' },
          { icon: Wallet, label: 'Budgets', route: '/budgets' },
          { icon: FileText, label: 'Transactions', route: '/transactions' },
          { icon: BarChart3, label: 'Reports', route: '/reports' },
          { icon: Calculator, label: 'Tax Calculator', route: '/tax-calculator' },
          { icon: Bell, label: 'Notifications', route: '/notifications' },
          { icon: Settings, label: 'Settings', route: '/settings' },
        ].map(({ icon: Icon, label, route }) => (
          <li key={label}>
            <Link to={route}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white py-2 hover:bg-customCyan transition-colors ${
                  route === window.location.pathname ? 'bg-customCyan' : ''
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="text-sm">{label}</span>
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

export default Sidebar;