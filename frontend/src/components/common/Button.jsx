import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30',
    secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/30',
    outline: 'border border-slate-600 text-slate-300 hover:bg-slate-800',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
