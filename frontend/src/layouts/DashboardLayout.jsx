import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-bg-deep text-slate-200">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex pt-14">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-slate-950/60 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 min-h-[calc(100vh-3.5rem)] md:ml-64 overflow-y-auto">
          {/* Subtle gradient overlay */}
          <div className="absolute top-14 right-0 w-[40%] h-[40%] rounded-full bg-brand/5 blur-[100px] pointer-events-none z-0" />
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
