import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, History, Send, Menu } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Check Transaction', path: '/', icon: Send },
    { name: 'History', path: '/history', icon: History },
    { name: 'Admin Panel', path: '/admin', icon: LayoutDashboard },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FraudGuard AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-600/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <Menu className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
