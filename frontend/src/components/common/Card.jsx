import React from 'react';

const Card = ({ children, title, subtitle, className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-800">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
