import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3.5 text-base font-bold rounded-xl',
  };

  const baseStyles = 'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-purple-700 text-white hover:from-brand-500 hover:to-purple-600 shadow-glow-purple border border-purple-400/30 font-display',
    editorial: 'bg-[#522ba7] text-white hover:bg-[#6344d4] shadow-md border border-purple-300/40 uppercase tracking-wider text-xs font-mono',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
    danger: 'bg-gradient-to-r from-rose-600 to-red-700 text-white hover:from-rose-500 hover:to-red-600 shadow-lg shadow-rose-900/30 border border-rose-400/30',
    outline: 'border border-purple-600/50 text-purple-300 hover:bg-purple-900/20 hover:border-purple-400',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
