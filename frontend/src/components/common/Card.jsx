import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  ribbon = null,
  rightHeader = null,
  className = '',
  variant = 'default',
}) => {
  // Styles based on variant
  const cardThemes = {
    default: 'bg-[#151726]/90 border-slate-800/80 shadow-xl',
    editorial: 'bg-white text-slate-900 border-purple-200 shadow-2xl',
    highlight: 'bg-gradient-to-br from-[#1e1738] to-[#121424] border-purple-800/50 shadow-elevated',
    glass: 'bg-slate-900/60 backdrop-blur-md border-slate-800/60 shadow-lg',
  };

  const isLight = variant === 'editorial';

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardThemes[variant] || cardThemes.default} ${className}`}
    >
      {/* Top Editorial Purple Ribbon Header (Exact match to reference photo 'MARCH 20, 2023 EDITION' bar) */}
      {ribbon && (
        <div className="bg-[#522ba7] text-white px-6 py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-between font-mono">
          <span>{ribbon}</span>
          <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></span>
        </div>
      )}

      {/* Header section if title is provided */}
      {(title || subtitle || rightHeader) && (
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-purple-900/30 bg-[#19182d]/50'
          }`}
        >
          <div>
            {title && (
              <h3
                className={`text-base sm:text-lg font-bold font-display ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {rightHeader && <div>{rightHeader}</div>}
        </div>
      )}

      {/* Card Content */}
      <div className={`p-6 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
