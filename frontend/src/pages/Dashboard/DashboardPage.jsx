import React from 'react';
import { 
  Users, 
  UserSquare2, 
  ClipboardList, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  FileText, 
  Activity, 
  AlertCircle, 
  ArrowRight, 
  GraduationCap, 
  ExternalLink 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatsCard from './StatsCard';
import authService from '../../services/authService';

const DashboardPage = () => {
  const user = authService.getLocalUser() || { name: 'Demo Administrator', role: 'ADMIN', email: 'admin@eduerp.com' };
  const role = user.role;

  // ----------------------------------------------------
  // RENDER: SUPER_ADMIN / ADMIN VIEW
  // ----------------------------------------------------
  const renderAdminDashboard = () => {
    return (
      <div className="flex flex-col gap-6">
        {/* Row 1: KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Net Inquiries (Month)" 
            value="48" 
            icon={ClipboardList} 
            change="+12.5%" 
            isPositive={true} 
            description="vs previous month"
            variant="indigo"
          />
          <StatsCard 
            title="Active Students" 
            value="1,240" 
            icon={Users} 
            change="+4.2%" 
            isPositive={true} 
            description="registered learners"
            variant="emerald"
          />
          <StatsCard 
            title="Active Faculty" 
            value="85" 
            icon={UserSquare2} 
            change="0.0%" 
            isPositive={true} 
            description="onboarded professors"
            variant="amber"
          />
          <StatsCard 
            title="Pending Admissions" 
            value="14" 
            icon={CheckSquare} 
            change="-2" 
            isPositive={false} 
            description="waiting review"
            variant="rose"
          />
        </div>

        {/* Row 2: Charts (CSS Grid Flex Graphs) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Admissions Conversion */}
          <div className="glass-card">
            <h4 className="text-base font-bold text-white mb-6">Monthly Admission Conversions</h4>
            <div className="flex items-end justify-between h-48 pt-4 px-2">
              {[
                { month: 'Jan', val: 30, pct: 'h-[30%]' },
                { month: 'Feb', val: 45, pct: 'h-[45%]' },
                { month: 'Mar', val: 65, pct: 'h-[65%]' },
                { month: 'Apr', val: 55, pct: 'h-[55%]' },
                { month: 'May', val: 85, pct: 'h-[85%]' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                  <div className="text-[10px] font-bold text-brand-light opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.val}
                  </div>
                  <div className="w-8 bg-gradient-to-t from-brand to-brand-light rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-lg shadow-brand/10 hover:shadow-brand/20 relative" style={{ height: `${item.val * 1.5}px` }}>
                    <div className="absolute inset-0 bg-white/10 rounded-t-lg" />
                  </div>
                  <span className="text-xs text-slate-400 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Salary Disbursement */}
          <div className="glass-card">
            <h4 className="text-base font-bold text-white mb-6">Salary Payments (Disbursements)</h4>
            <div className="flex items-end justify-between h-48 pt-4 px-2">
              {[
                { month: 'Jan', amount: '22k', pct: 40 },
                { month: 'Feb', amount: '24k', pct: 45 },
                { month: 'Mar', amount: '25k', pct: 50 },
                { month: 'Apr', amount: '28k', pct: 60 },
                { month: 'May', amount: '34k', pct: 80 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                  <div className="text-[10px] font-bold text-status-success opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.amount}
                  </div>
                  <div className="w-8 bg-gradient-to-t from-status-success to-emerald-400 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-lg shadow-status-success/10 relative" style={{ height: `${item.pct * 1.8}px` }}>
                    <div className="absolute inset-0 bg-white/10 rounded-t-lg" />
                  </div>
                  <span className="text-xs text-slate-400 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inquiries List */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white">Recent CRM Inquiries</h4>
              <button className="text-xs text-brand-light hover:underline flex items-center gap-1">
                View pipeline <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                { name: 'Sarah Connor', course: 'Cyber Security', date: 'Today, 2:30 PM', status: 'NEW' },
                { name: 'Bruce Wayne', course: 'Business Management', date: 'Today, 11:15 AM', status: 'INTERESTED' },
                { name: 'Peter Parker', course: 'Applied Physics', date: 'Yesterday', status: 'CONTACTED' },
              ].map((inq, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{inq.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{inq.course} • {inq.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    inq.status === 'NEW' ? 'bg-brand/10 text-brand-light border border-brand/20' :
                    inq.status === 'INTERESTED' ? 'bg-status-success/10 text-status-success border border-status-success/20' :
                    'bg-status-warning/10 text-status-warning border border-status-warning/20'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Admission Review Queue */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white">Pending Admission Review</h4>
              <button className="text-xs text-brand-light hover:underline flex items-center gap-1">
                Open queue <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                { name: 'Diana Prince', course: 'Ancient History', date: 'Jun 03', status: 'UNDER_REVIEW' },
                { name: 'Tony Stark', course: 'Aerospace Engineering', date: 'Jun 02', status: 'APPLIED' },
                { name: 'Clark Kent', course: 'Journalism & Media', date: 'May 31', status: 'UNDER_REVIEW' },
              ].map((adm, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{adm.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{adm.course} • Submitted {adm.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    adm.status === 'UNDER_REVIEW' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' :
                    'bg-brand/10 text-brand-light border border-brand/20'
                  }`}>
                    {adm.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER: RECEPTIONIST VIEW
  // ----------------------------------------------------
  const renderReceptionistDashboard = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Today's Inquiries" 
            value="12" 
            icon={ClipboardList} 
            change="+4" 
            isPositive={true} 
            description="walk-ins & site leads"
            variant="indigo"
          />
          <StatsCard 
            title="Pending Admissions" 
            value="5" 
            icon={CheckSquare} 
            change="0" 
            isPositive={true} 
            description="files under review"
            variant="amber"
          />
          <StatsCard 
            title="Follow-ups Due Today" 
            value="8" 
            icon={Calendar} 
            change="-3 tasks done" 
            isPositive={true} 
            description="leads schedule"
            variant="rose"
          />
        </div>

        {/* Reminders List */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-status-warning" />
            <span>Inquiry Follow-up Reminders</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Prospect</th>
                  <th className="py-2.5">Contact</th>
                  <th className="py-2.5">Course</th>
                  <th className="py-2.5">Follow-up Notes</th>
                  <th className="py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {[
                  { name: 'Barry Allen', phone: '555-0199', course: 'B.Sc Computer Science', note: 'Call to confirm fee structures details', time: '11:00 AM' },
                  { name: 'Arthur Curry', phone: '555-0176', course: 'Marine Biology', note: 'Send program catalog via Email', time: '2:30 PM' },
                  { name: 'Hal Jordan', phone: '555-0123', course: 'Aeronautics', note: 'Wants campus tour schedule', time: '4:00 PM' }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3">{item.phone}</td>
                    <td className="py-3">{item.course}</td>
                    <td className="py-3 text-xs text-slate-400">{item.note}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-brand/10 text-brand-light border border-brand/20">
                        {item.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER: FACULTY VIEW
  // ----------------------------------------------------
  const renderFacultyDashboard = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Assigned Batches" 
            value="3" 
            icon={Users} 
            change="0" 
            isPositive={true} 
            description="Active teaching batches"
            variant="indigo"
          />
          <StatsCard 
            title="Attendance (This Month)" 
            value="21 / 22" 
            icon={Calendar} 
            change="95.4%" 
            isPositive={true} 
            description="Effective duty days"
            variant="emerald"
          />
          <StatsCard 
            title="Upcoming Examinations" 
            value="2" 
            icon={BookOpen} 
            change="This week" 
            isPositive={true} 
            description="Pending result evaluations"
            variant="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Schedule */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-light" />
              <span>Exam Schedule</span>
            </h4>
            <div className="divide-y divide-slate-800">
              {[
                { title: 'Midterm Algebra II', batch: 'Batch 2026-A', date: 'Jun 10, 10:00 AM', status: 'SCHEDULED' },
                { title: 'Physics Lab Viva', batch: 'Batch 2026-B', date: 'Jun 12, 1:00 PM', status: 'SCHEDULED' },
                { title: 'Computer Networks Test', batch: 'Batch 2026-A', date: 'Jun 02, Completed', status: 'COMPLETED' },
              ].map((exam, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{exam.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{exam.batch} • {exam.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    exam.status === 'COMPLETED' ? 'bg-status-success/15 text-status-success' : 'bg-brand/10 text-brand-light border border-brand/20'
                  }`}>
                    {exam.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mark Entries shortcuts */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-status-success" />
              <span>Quick Evaluation Entries</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">Click to open bulk grade worksheets for recently completed tests.</p>
            <div className="space-y-3">
              {[
                { exam: 'Computer Networks Practical', batch: 'Batch 2026-A', course: 'Information Tech', examId: '123' },
                { exam: 'Chemistry Written Exam', batch: 'Batch 2026-C', course: 'Bio-Science', examId: '456' },
              ].map((shortcut, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-bg-deep/40 border border-slate-700/30 flex items-center justify-between hover:border-brand/40 transition-colors group cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">{shortcut.exam}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{shortcut.course} ({shortcut.batch})</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-500 group-hover:text-brand-light transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER: STUDENT VIEW
  // ----------------------------------------------------
  const renderStudentDashboard = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Enrolled Batch" 
            value="Batch 2026-A" 
            icon={GraduationCap} 
            description="B.Sc Computer Science"
            variant="indigo"
          />
          <StatsCard 
            title="Attendance Rate" 
            value="94.5%" 
            icon={Activity} 
            change="+1.2%" 
            isPositive={true} 
            description="Present: 38, Absent: 2"
            variant="emerald"
          />
          <StatsCard 
            title="Completed Examinations" 
            value="8" 
            icon={BookOpen} 
            description="CGPA: 3.8 / 4.0"
            variant="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Courses */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 lg:col-span-2">
            <h4 className="text-base font-bold text-white mb-4">Active Course Modules</h4>
            <div className="space-y-4">
              {[
                { name: 'Introduction to Algorithms', code: 'CS-201', progress: 75, faculty: 'Dr. Alan Turing' },
                { name: 'Database Management Systems', code: 'CS-204', progress: 45, faculty: 'Prof. Grace Hopper' },
                { name: 'Digital Logic & Design', code: 'CS-206', progress: 90, faculty: 'Dr. Claude Shannon' },
              ].map((module, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-bg-deep/40 border border-slate-700/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-brand-light px-2 py-0.5 rounded bg-brand/10 border border-brand/20 uppercase">
                        {module.code}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-1.5">{module.name}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">Faculty: {module.faculty}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-light">{module.progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand h-full rounded-full transition-all duration-500" style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript/Grades list */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4">Latest Results</h4>
            <div className="space-y-3">
              {[
                { exam: 'Data Structures Mid', marks: '88/100', grade: 'A', status: 'PASS' },
                { exam: 'Discrete Math Quiz 2', marks: '42/50', grade: 'B+', status: 'PASS' },
                { exam: 'Web Programming Project', marks: '95/100', grade: 'A+', status: 'PASS' },
                { exam: 'Stats Lab Test', marks: '32/100', grade: 'F', status: 'FAIL' },
              ].map((res, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-bg-deep/20 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{res.exam}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Score: {res.marks}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 font-bold rounded text-[9px] ${
                      res.status === 'PASS' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'
                    }`}>
                      {res.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Here is your overview for today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {role === 'SUPER_ADMIN' || role === 'ADMIN' ? renderAdminDashboard() : null}
      {role === 'RECEPTIONIST' ? renderReceptionistDashboard() : null}
      {role === 'FACULTY' ? renderFacultyDashboard() : null}
      {role === 'STUDENT' ? renderStudentDashboard() : null}
    </DashboardLayout>
  );
};

export default DashboardPage;
