import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });

  // Sync with sidebar's localStorage changes
  useEffect(() => {
    const observer = () => {
      try {
        setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
      } catch {}
    };
    window.addEventListener('storage', observer);
    // Also poll for local changes (same tab)
    const interval = setInterval(() => {
      try {
        const val = localStorage.getItem('sidebar-collapsed') === 'true';
        setSidebarCollapsed(prev => prev !== val ? val : prev);
      } catch {}
    }, 200);
    return () => {
      window.removeEventListener('storage', observer);
      clearInterval(interval);
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen(s => !s);

  return (
    <div className="min-h-screen bg-bg-deep text-slate-200">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex pt-14">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-slate-950/60 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content Area — offset by sidebar width */}
        <main
          className={`flex-1 min-h-[calc(100vh-3.5rem)] overflow-y-auto transition-all duration-300
            p-5 md:p-8
            ${sidebarCollapsed ? 'md:ml-[60px]' : 'md:ml-64'}
          `}
        >
          {/* Ambient glow */}
          <div className="fixed top-14 right-0 w-[50%] h-[50%] rounded-full bg-brand/4 blur-[120px] pointer-events-none z-0" />

          <div className="relative z-10 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
