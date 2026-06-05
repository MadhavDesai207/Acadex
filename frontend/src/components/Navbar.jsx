import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, User, Settings, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import authService from '../services/authService';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = authService.getLocalUser() || { name: 'User', email: 'user@eduerp.com', role: 'STUDENT' };

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Dynamically resolve page title based on active path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Overview Dashboard';
    if (path.startsWith('/inquiries')) return 'Inquiry Pipeline';
    if (path.startsWith('/admissions')) return 'Admissions Registry';
    if (path.startsWith('/students')) return 'Students Registry';
    if (path.startsWith('/faculty')) return 'Faculty Registry';
    if (path.startsWith('/attendance')) return 'Attendance Logs';
    if (path.startsWith('/salary')) return 'Payroll Ledger';
    if (path.startsWith('/exams')) return 'Examinations Ledger';
    return 'EduERP Panel';
  };

  // Mock Notifications
  const notifications = [
    { id: 1, text: 'New admission application submitted', time: '10 mins ago', unread: true },
    { id: 2, text: 'Exam marks due for Grade 12 Chemistry', time: '2 hours ago', unread: true },
    { id: 3, text: 'Salary voucher generated for May 2026', time: '1 day ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="fixed top-0 z-50 w-full bg-bg-surface/80 border-b border-slate-700/50 backdrop-blur-md">
      <div className="px-4 py-3 md:px-6 flex items-center justify-between">
        
        {/* Left Section: Brand & Sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden focus:outline-none"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-heading bg-gradient-to-r from-brand-light to-white bg-clip-text text-transparent hidden md:inline-block">
              EduERP
            </span>
          </div>
          
          <div className="h-5 w-px bg-slate-700 hidden md:block mx-2" />
          <h2 className="text-sm font-semibold text-slate-300 md:text-base">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Section: Notifications & User profile */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus:outline-none"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-status-danger"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-slate-700/60 shadow-xl py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-slate-700/50 flex justify-between items-center">
                  <span className="font-bold text-white">Notifications</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-brand/20 text-brand-light font-medium">
                    {unreadCount} New
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-brand/5' : ''
                      }`}
                    >
                      <p className={`text-xs ${notif.unread ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                        {notif.text}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-1.5 text-center border-t border-slate-800">
                  <a href="#notifications" className="text-xs text-brand-light hover:underline font-medium">
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-brand/30 border border-brand/50 flex items-center justify-center text-brand-light font-bold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl border border-slate-700/60 shadow-xl py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-slate-700/50">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={() => navigate('/dashboard')} // Placeholder Settings redirect
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition-colors"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')} // Redirects to same path or handles password modal
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition-colors"
                  >
                    <Settings size={16} />
                    <span>Quick Settings</span>
                  </button>
                </div>
                
                <div className="border-t border-slate-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-status-danger hover:bg-status-danger/10 text-left transition-colors font-medium"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
