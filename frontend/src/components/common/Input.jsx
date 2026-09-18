import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required = false, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
      />
    </div>
  );
};

export default Input;
