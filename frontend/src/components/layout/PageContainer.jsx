import React from 'react';

const PageContainer = ({ children, title, subtitle }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
