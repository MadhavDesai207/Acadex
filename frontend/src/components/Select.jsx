import React from 'react';

const Select = ({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-300">
          {label} {required && <span className="text-status-danger">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 rounded-lg text-sm outline-none glass-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] pr-10 ${
          error ? 'border-status-danger/70 focus:border-status-danger/80 focus:ring-status-danger/20' : ''
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-surface text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-status-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Select;
