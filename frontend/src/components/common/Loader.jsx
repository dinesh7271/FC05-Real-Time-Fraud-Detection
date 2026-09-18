import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-t-indigo-500 border-slate-700 ${sizes[size]} ${className}`} />
  );
};

export default Loader;
