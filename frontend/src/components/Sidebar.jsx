import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  ClipboardList, 
  CheckSquare, 
  Users, 
  UserSquare2, 
  CalendarCheck, 
  DollarSign, 
  BookOpen, 
  LogOut 
} from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const user = authService.getLocalUser() || { role: 'STUDENT', name: 'User' };
  const role = user.role;

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Define navigation items with their permissions
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'RECEPTIONIST']
    },
    {
      label: 'Inquiries',
      path: '/inquiries',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']
    },
    {
      label: 'Admissions',
      path: '/admissions',
      icon: CheckSquare,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']
    },
    {
      label: 'Students',
      path: '/students',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      label: 'Faculty',
      path: '/faculty',
      icon: UserSquare2,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      label: 'Payroll / Salary',
      path: '/salary',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      label: 'Examinations',
      path: '/exams',
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']
    }
  ];

  // Filter menu items by user role
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-bg-surface border-r border-slate-700/50 md:translate-x-0`}
    >
      <div className="h-full px-4 py-4 overflow-y-auto flex flex-col justify-between bg-bg-surface">
        {/* User Quick Info */}
        <div className="mb-6 p-4 rounded-xl bg-bg-deep/40 border border-slate-700/30">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-bold text-white truncate mt-0.5">{user.name}</p>
          <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-bold rounded-full bg-brand/20 text-brand-light border border-brand/30 uppercase">
            {role.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation Menu */}
        <ul className="space-y-1.5 flex-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  onClick={() => {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} size={18} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Logout Trigger */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-status-danger hover:bg-status-danger/10 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
