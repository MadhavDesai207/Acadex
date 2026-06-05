import React from 'react';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-bg-deep overflow-hidden">
      {/* Dynamic backdrop glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-light/10 blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-8 border border-slate-700/50 shadow-2xl transition-all duration-300">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-brand to-brand-light shadow-lg mb-3">
            <GraduationCap className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">EduERP</h1>
          <p className="text-slate-400 text-xs mt-1">Unified Education Resources Planning</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
