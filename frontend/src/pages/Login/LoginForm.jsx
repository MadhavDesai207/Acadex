import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LoginForm = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@eduerp.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        error={errors.password}
        required
      />

      <div className="flex items-center justify-between text-xs mt-1">
        <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-700 bg-slate-900 text-brand focus:ring-brand focus:ring-offset-bg-deep cursor-pointer"
          />
          <span>Remember me</span>
        </label>
        <a href="#forgot" className="text-brand-light hover:underline font-medium">
          Forgot Password?
        </a>
      </div>

      <Button type="submit" loading={loading} className="w-full mt-2">
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
