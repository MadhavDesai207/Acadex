import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, CheckSquare, Users, UserSquare2,
  CalendarCheck, DollarSign, BookOpen, LogOut, GraduationCap, Layers,
  Clock, UserCheck, Library, FolderOpen, FileText, ChevronDown,
  ChevronRight, BookMarked, BookCopy, Wallet, CreditCard, Receipt,
  AlertCircle, Tag, FlaskConical, HelpCircle, ClipboardCheck,
  BarChart2, ScrollText, Star, FileBarChart2, PieChart, TrendingUp,
  GanttChart, Briefcase, Building2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import authService from '../services/authService';

/* ─── Nav Item ─────────────────────────────────── */
const NavItem = ({ item, role, onNavigate, collapsed }) => {
  const Icon = item.icon;
  if (!item.roles.includes(role)) return null;

  return (
    <li>
      <NavLink
        to={item.path}
        end={item.end}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 group relative
           ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5'}
           ${isActive
             ? 'bg-brand/15 text-white border-l-[3px] border-brand-light'
             : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border-l-[3px] border-transparent'
           }`
        }
        onClick={onNavigate}
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`shrink-0 transition-colors ${isActive ? 'text-brand-light' : 'text-slate-500 group-hover:text-slate-300'}`}
              size={17}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
};

/* ─── Nav Group ────────────────────────────────── */
const NavGroup = ({ group, role, onNavigate, collapsed }) => {
  const location = useLocation();
  const Icon = group.icon;

  const visibleChildren = group.children.filter(c => c.roles.includes(role));
  if (visibleChildren.length === 0) return null;

  const isAnyChildActive = visibleChildren.some(c => location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(isAnyChildActive);

  // Auto-open when child route becomes active
  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [location.pathname]);

  if (collapsed) {
    // In collapsed mode, show only the group icon (no children)
    return (
      <li>
        <button
          title={group.label}
          className={`flex items-center justify-center w-full px-2.5 py-2.5 rounded-lg transition-all duration-150 border-l-[3px]
            ${isAnyChildActive
              ? 'bg-brand/15 text-brand-light border-brand-light'
              : 'text-slate-500 hover:bg-slate-800/70 hover:text-slate-300 border-transparent'
            }`}
          onClick={() => setOpen(o => !o)}
        >
          <Icon size={17} />
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group border-l-[3px]
          ${isAnyChildActive
            ? 'text-slate-300 border-brand/50'
            : 'text-slate-500 hover:bg-slate-800/70 hover:text-slate-300 border-transparent'
          }`}
      >
        <Icon
          className={`shrink-0 transition-colors ${isAnyChildActive ? 'text-brand-light' : 'text-slate-500 group-hover:text-slate-400'}`}
          size={17}
        />
        <span className="flex-1 text-left">{group.label}</span>
        <span className="text-slate-600 transition-transform duration-200" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown size={13} />
        </span>
      </button>

      {open && (
        <ul className="mt-0.5 ml-8 pl-3 border-l border-slate-700/50 space-y-0.5 animate-fadeIn">
          {visibleChildren.map(child => {
            const ChildIcon = child.icon;
            return (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  end={!!child.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                     ${isActive
                       ? 'bg-brand text-white shadow-sm shadow-brand/20'
                       : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                     }`
                  }
                  onClick={onNavigate}
                >
                  {({ isActive }) => (
                    <>
                      <ChildIcon
                        className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`}
                        size={13}
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

/* ─── Section Label ────────────────────────────── */
const SectionLabel = ({ label, collapsed }) => {
  if (collapsed) return <div className="h-px bg-slate-800/60 mx-2 my-1" />;
  return (
    <li className="pt-3 pb-0.5">
      <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
    </li>
  );
};

/* ─── Sidebar ──────────────────────────────────── */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const user = authService.getLocalUser() || { role: 'STUDENT', name: 'User' };
  const role = user.role;

  // Desktop collapse state
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const onNavigate = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  /* ─── Nav Config ─── */
  const navConfig = [
    {
      type: 'item',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'RECEPTIONIST'],
    },
    { type: 'section', label: 'Enrollment' },
    {
      type: 'item',
      label: 'Inquiries',
      path: '/inquiries',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
    },
    {
      type: 'item',
      label: 'Admissions',
      path: '/admissions',
      icon: CheckSquare,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
    },
    {
      type: 'item',
      label: 'Students',
      path: '/students',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'],
    },
    { type: 'section', label: 'People' },
    {
      type: 'group',
      label: 'Faculty',
      icon: UserSquare2,
      roles: ['SUPER_ADMIN', 'ADMIN'],
      children: [
        { label: 'Faculty Registry', path: '/faculty', icon: UserSquare2, roles: ['SUPER_ADMIN', 'ADMIN'], end: true },
        { label: 'Designations',     path: '/faculty/designations', icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Departments',      path: '/faculty/departments',  icon: Building2,  roles: ['SUPER_ADMIN', 'ADMIN'] },
      ],
    },
    {
      type: 'item',
      label: 'Faculty Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'],
    },
    {
      type: 'item',
      label: 'Payroll / Salary',
      path: '/salary',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'],
    },
    { type: 'section', label: 'Academics' },
    {
      type: 'group',
      label: 'Academic',
      icon: GraduationCap,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'],
      children: [
        { label: 'Courses',     path: '/courses',            icon: BookMarked, roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Subjects',    path: '/subjects',           icon: BookCopy,   roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Batches',     path: '/batches',            icon: Layers,     roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Timetable',   path: '/timetable',          icon: Clock,      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Attendance',  path: '/student-attendance', icon: UserCheck,  roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Syllabus',    path: '/syllabus',           icon: Library,    roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Materials',   path: '/materials',          icon: FolderOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Assignments', path: '/assignments',        icon: FileText,   roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
      ],
    },
    { type: 'section', label: 'Finance' },
    {
      type: 'group',
      label: 'Finance',
      icon: Wallet,
      roles: ['SUPER_ADMIN', 'ADMIN', 'STUDENT'],
      children: [
        { label: 'Fee Structures', path: '/fees/structures', icon: CreditCard,   roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Fee Collection', path: '/fees/collect',    icon: Receipt,      roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Student Fees',   path: '/fees/students',   icon: Users,        roles: ['SUPER_ADMIN', 'ADMIN', 'STUDENT'] },
        { label: 'Due Fees',       path: '/fees/due',        icon: AlertCircle,  roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Discounts',      path: '/fees/discounts',  icon: Tag,          roles: ['SUPER_ADMIN', 'ADMIN'] },
      ],
    },
    { type: 'section', label: 'Examinations' },
    {
      type: 'group',
      label: 'Examination',
      icon: FlaskConical,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'],
      children: [
        { label: 'Question Bank', path: '/question-bank',   icon: HelpCircle,    roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Exams',         path: '/exams',            icon: BookOpen,      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'My Results',    path: '/results',          icon: Star,          roles: ['STUDENT'] },
        { label: 'Analytics',     path: '/analytics/exams',  icon: BarChart2,     roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
      ],
    },
    { type: 'section', label: 'Reports' },
    {
      type: 'group',
      label: 'Reports',
      icon: FileBarChart2,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'],
      children: [
        { label: 'Revenue',     path: '/reports/revenue',     icon: TrendingUp,  roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Attendance',  path: '/reports/attendance',  icon: UserCheck,   roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Academic',    path: '/reports/academic',    icon: GanttChart,  roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Examination', path: '/reports/examination', icon: FlaskConical,roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'] },
        { label: 'Performance', path: '/reports/performance', icon: ScrollText,  roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'] },
        { label: 'Conversion',  path: '/reports/conversion',  icon: PieChart,    roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Due Fees',    path: '/reports/due-fees',    icon: AlertCircle, roles: ['SUPER_ADMIN', 'ADMIN'] },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen pt-14 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-[60px]' : 'w-64'}
        bg-bg-surface border-r border-slate-700/40 md:translate-x-0`}
    >
      <div className="h-full flex flex-col bg-bg-surface">

        {/* User Card */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-deep/50 border border-slate-800/60">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-xs border border-brand/40">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-success rounded-full border-2 border-bg-surface" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="text-[10px] font-semibold text-brand-light">{role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="px-2 py-3 border-b border-slate-800/60 flex justify-center">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-xs border border-brand/40">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-success rounded-full border-2 border-bg-surface" />
            </div>
          </div>
        )}

        {/* Nav List */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul className="space-y-0.5">
            {navConfig.map((entry, idx) => {
              // Filter sections: only show if there's at least one visible item/group below
              if (entry.type === 'section') {
                return <SectionLabel key={`sec-${idx}`} label={entry.label} collapsed={collapsed} />;
              }
              if (entry.type === 'group') {
                const visible = entry.children?.some(c => c.roles.includes(role));
                if (!visible) return null;
                return (
                  <NavGroup
                    key={`grp-${idx}`}
                    group={entry}
                    role={role}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                  />
                );
              }
              return (
                <NavItem
                  key={entry.path}
                  item={entry}
                  role={role}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              );
            })}
          </ul>
        </nav>

        {/* Bottom: Collapse toggle + Logout */}
        <div className="border-t border-slate-800/60 p-2 flex flex-col gap-1">
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors text-sm font-medium"
          >
            {collapsed
              ? <PanelLeftOpen size={16} />
              : <><PanelLeftClose size={16} /><span>Collapse</span></>
            }
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500
              hover:bg-status-danger/10 hover:text-status-danger transition-all duration-150
              ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
