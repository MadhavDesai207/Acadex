import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-300">
          {label} {required && <span className="text-status-danger">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          required={required}
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none glass-input ${
            Icon ? 'pl-10' : ''
          } ${
            isPassword ? 'pr-10' : ''
          } ${
            error ? 'border-status-danger/70 focus:border-status-danger/80 focus:ring-status-danger/20' : ''
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-status-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
