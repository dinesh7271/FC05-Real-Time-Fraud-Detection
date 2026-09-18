import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, History, Send, Menu, X, Activity, Cpu } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Fraud Assessment', path: '/', icon: Send },
    { name: 'Audit Trail', path: '/history', icon: History },
    { name: 'Security Command', path: '/admin', icon: LayoutDashboard },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Top Editorial Ribbon Bar (Like reference photo top header) */}
      <div className="bg-black text-slate-300 text-xs px-4 sm:px-8 py-2 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <span className="bg-brand-600 text-white font-extrabold px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
            SENTINEL
          </span>
          <span className="font-semibold text-white tracking-wide font-display">
            Real-Time AI Fraud Intelligence & Adaptive Account Shield
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Model Active: XGBoost 2.0 + LLaMA-3 RAG
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-purple-300">FC-05 PROD</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#161226] border-b border-purple-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-800 p-0.5 shadow-glow-purple flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#1b1433] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-brand-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white font-display flex items-center gap-1.5">
                  Sentinel<span className="text-brand-400">Fraud</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Automated Defense Layer
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}

              <div className="ml-4 pl-4 border-l border-slate-700/60">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <Activity className="w-3 h-3" /> Live Shield
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#130f21] border-b border-purple-900/50 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
