import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Users,
  UserSquare2,
  CalendarCheck,
  DollarSign,
  BookOpen,
  LogOut,
  GraduationCap,
  Layers,
  Clock,
  UserCheck,
  Library,
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import authService from '../services/authService';

const NavItem = ({ item, role, onNavigate }) => {
  const Icon = item.icon;
  if (!item.roles.includes(role)) return null;

  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
            isActive
              ? 'bg-brand text-white shadow-lg shadow-brand/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`
        }
        onClick={onNavigate}
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
};

const NavGroup = ({ group, role, onNavigate }) => {
  const location = useLocation();
  const Icon = group.icon;

  const visibleChildren = group.children.filter((c) => c.roles.includes(role));
  if (visibleChildren.length === 0) return null;

  const isAnyChildActive = visibleChildren.some((c) => location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(isAnyChildActive);

  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          isAnyChildActive
            ? 'bg-brand/10 text-brand-light'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon
          className={`transition-colors shrink-0 ${isAnyChildActive ? 'text-brand-light' : 'text-slate-500 group-hover:text-slate-300'}`}
          size={18}
        />
        <span className="flex-1 text-left">{group.label}</span>
        {open
          ? <ChevronDown size={14} className="text-slate-500" />
          : <ChevronRight size={14} className="text-slate-500" />
        }
      </button>

      {open && (
        <ul className="mt-1 ml-4 pl-3 border-l border-slate-700/60 space-y-0.5">
          {visibleChildren.map((child) => {
            const ChildIcon = child.icon;
            return (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand text-white shadow shadow-brand/20'
                        : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  onClick={onNavigate}
                >
                  {({ isActive }) => (
                    <>
                      <ChildIcon
                        className={`transition-colors shrink-0 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'}`}
                        size={14}
                      />
                      <span>{child.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const user = authService.getLocalUser() || { role: 'STUDENT', name: 'User' };
  const role = user.role;

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const onNavigate = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const navConfig = [
    {
      type: 'item',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'RECEPTIONIST']
    },
    {
      type: 'item',
      label: 'Inquiries',
      path: '/inquiries',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']
    },
    {
      type: 'item',
      label: 'Admissions',
      path: '/admissions',
      icon: CheckSquare,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']
    },
    {
      type: 'item',
      label: 'Students',
      path: '/students',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      type: 'item',
      label: 'Faculty',
      path: '/faculty',
      icon: UserSquare2,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      type: 'group',
      label: 'Academic',
      icon: GraduationCap,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'],
      children: [
        { label: 'Batches', path: '/batches', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Timetable', path: '/timetable', icon: Clock, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Attendance', path: '/student-attendance', icon: UserCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Syllabus', path: '/syllabus', icon: Library, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Materials', path: '/materials', icon: FolderOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Assignments', path: '/assignments', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] }
      ]
    },
    {
      type: 'item',
      label: 'Faculty Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      type: 'item',
      label: 'Payroll / Salary',
      path: '/salary',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
    },
    {
      type: 'item',
      label: 'Examinations',
      path: '/exams',
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']
    }
  ];

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
        <ul className="space-y-1 flex-1">
          {navConfig.map((entry, idx) =>
            entry.type === 'group' ? (
              <NavGroup key={idx} group={entry} role={role} onNavigate={onNavigate} />
            ) : (
              <NavItem key={entry.path} item={entry} role={role} onNavigate={onNavigate} />
            )
          )}
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
