import React from 'react';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  required = false,
  className = '',
  helperText = '',
  icon: Icon = null,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-brand-400 text-[10px] font-mono">REQUIRED</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[#111322] border border-purple-900/40 text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-400 transition-all font-sans shadow-inner ${
            Icon ? 'pl-10' : ''
          }`}
        />
      </div>
      {helperText && (
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
