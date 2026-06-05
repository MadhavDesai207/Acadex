import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatsCard from './StatsCard';
import BarChart from '../../components/BarChart';
import HorizontalBarChart from '../../components/HorizontalBarChart';
import DonutChart from '../../components/DonutChart';
import authService from '../../services/authService';
import dashboardService from '../../services/dashboardService';

const StatusBadge = ({ status }) => {
  const map = {
    NEW:          'bg-brand/10 text-brand-light border border-brand/20',
    CONTACTED:    'bg-status-warning/10 text-status-warning border border-status-warning/20',
    INTERESTED:   'bg-status-success/10 text-status-success border border-status-success/20',
    CONVERTED:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    DROPPED:      'bg-slate-700/50 text-slate-400 border border-slate-700',
    APPLIED:      'bg-brand/10 text-brand-light border border-brand/20',
    UNDER_REVIEW: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${map[status] || 'bg-slate-700/50 text-slate-400'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/40 rounded-lg ${className}`} />
);

const DashboardPage = () => {
  const user = authService.getLocalUser() || { name: 'User', role: 'ADMIN', email: '' };
  const role = user.role;

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    dashboardService.getDashboard()
      .then(res => {
        setDashData(res.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load dashboard data.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = dashData?.kpis || {};
  const charts = dashData?.charts || {};
  const activity = dashData?.recentActivity || {};

  // ----------------------------------------------------
  // RENDER: SUPER_ADMIN / ADMIN VIEW
  // ----------------------------------------------------
  const renderAdminDashboard = () => (
    <div className="flex flex-col gap-6">
      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatsCard
              title="Net Inquiries (Month)"
              value={kpis.newInquiriesThisMonth ?? 0}
              icon={ClipboardList}
              description="New leads this month"
              variant="indigo"
            />
            <StatsCard
              title="Active Students"
              value={(kpis.activeStudents ?? 0).toLocaleString()}
              icon={Users}
              description="Registered learners"
              variant="emerald"
            />
            <StatsCard
              title="Active Faculty"
              value={kpis.totalFaculty ?? 0}
              icon={UserSquare2}
              description="Onboarded staff"
              variant="amber"
            />
            <StatsCard
              title="Pending Admissions"
              value={kpis.pendingAdmissions ?? 0}
              icon={CheckSquare}
              description="Awaiting review"
              variant="rose"
            />
          </>
        )}
      </div>

      {/* Row 1b: Revenue + Overdue */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Revenue This Month"
            value={`₹${(kpis.revenueThisMonth ?? 0).toLocaleString()}`}
            icon={DollarSign}
            description="Fee collections"
            variant="emerald"
          />
          <StatsCard
            title="Overdue Fee Students"
            value={kpis.overdueFeesCount ?? 0}
            icon={AlertCircle}
            description="Students with overdue installments"
            variant="rose"
          />
        </div>
      )}

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h4 className="text-base font-bold text-white mb-6">Monthly Admission Conversions</h4>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <BarChart
              data={charts.admissionsByMonth || []}
              valueKey="count"
              labelKey="month"
              color="indigo"
              maxHeight={160}
            />
          )}
        </div>

        <div className="glass-card">
          <h4 className="text-base font-bold text-white mb-6">Revenue by Month</h4>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <BarChart
              data={charts.revenueByMonth || []}
              valueKey="amount"
              labelKey="month"
              color="emerald"
              maxHeight={160}
              valueFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
            />
          )}
        </div>
      </div>

      {/* Row 3: Batch Attendance + Pass/Fail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <h4 className="text-base font-bold text-white mb-5">Batch Attendance Rate</h4>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (charts.attendanceRate || []).length > 0 ? (
            <HorizontalBarChart
              data={charts.attendanceRate || []}
              valueKey="rate"
              labelKey="batch"
              color="sky"
              max={100}
            />
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No batch attendance data</p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center justify-center">
          <h4 className="text-base font-bold text-white mb-5 self-start">Pass / Fail Ratio</h4>
          {loading ? (
            <Skeleton className="h-32 w-32 rounded-full" />
          ) : (
            <DonutChart
              pass={charts.passFailRatio?.pass || 0}
              fail={charts.passFailRatio?.fail || 0}
            />
          )}
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white">Recent CRM Inquiries</h4>
            <a href="/inquiries" className="text-xs text-brand-light hover:underline flex items-center gap-1">
              View pipeline <ArrowRight size={14} />
            </a>
          </div>
          <div className="divide-y divide-slate-800">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 my-2" />)
            ) : (activity.recentInquiries || []).length > 0 ? (
              (activity.recentInquiries || []).map((inq) => (
                <div key={inq.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{inq.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inq.courseInterest || 'N/A'} • {new Date(inq.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No inquiries today</p>
            )}
          </div>
        </div>

        {/* Pending Admission Review */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white">Pending Admission Review</h4>
            <a href="/admissions" className="text-xs text-brand-light hover:underline flex items-center gap-1">
              Open queue <ArrowRight size={14} />
            </a>
          </div>
          <div className="divide-y divide-slate-800">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 my-2" />)
            ) : (activity.pendingAdmissions || []).length > 0 ? (
              (activity.pendingAdmissions || []).map((adm) => (
                <div key={adm.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{adm.studentName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {adm.course?.name || 'N/A'} • Applied {new Date(adm.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={adm.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No pending admissions</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      {!loading && (activity.upcomingExams || []).length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-light" />
            Upcoming Examinations
          </h4>
          <div className="divide-y divide-slate-800">
            {(activity.upcomingExams || []).map((exam) => (
              <div key={exam.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-white">{exam.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exam.course?.name} {exam.batch ? `• ${exam.batch.name}` : ''} • {new Date(exam.examDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand/10 text-brand-light border border-brand/20 uppercase">
                  {exam.examType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ----------------------------------------------------
  // RENDER: RECEPTIONIST VIEW
  // ----------------------------------------------------
  const renderReceptionistDashboard = () => {
    const rKpis = dashData?.kpis || {};
    const rActivity = dashData?.recentActivity || {};

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <StatsCard title="Today's Inquiries" value={rKpis.todayInquiries ?? 0} icon={ClipboardList} description="Walk-ins & site leads" variant="indigo" />
              <StatsCard title="Pending Admissions" value={rKpis.pendingAdmissions ?? 0} icon={CheckSquare} description="Files under review" variant="amber" />
              <StatsCard title="Follow-ups Due Today" value={rKpis.followUpsDueToday ?? 0} icon={Calendar} description="Leads scheduled" variant="rose" />
            </>
          )}
        </div>

        {/* Follow-up Reminders */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-status-warning" />
            Inquiry Follow-up Reminders
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Prospect</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5">Course Interest</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr><td colSpan={4}><Skeleton className="h-8 my-2" /></td></tr>
                ) : (rActivity.followUps || []).length > 0 ? (
                  (rActivity.followUps || []).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20">
                      <td className="py-3 font-semibold text-white">{item.name}</td>
                      <td className="py-3">{item.phone}</td>
                      <td className="py-3 text-xs text-slate-400">{item.courseInterest || '—'}</td>
                      <td className="py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-500">No follow-ups due today</td>
                  </tr>
                )}
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
    const fKpis = dashData?.kpis || {};
    const batches = dashData?.batches || [];
    const upcomingExams = dashData?.upcomingExams || [];
    const assignments = dashData?.recentAssignments || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <StatsCard title="Assigned Batches" value={fKpis.assignedBatches ?? 0} icon={Users} description="Active teaching batches" variant="indigo" />
              <StatsCard
                title="Attendance (This Month)"
                value={fKpis.attendanceTotal ? `${fKpis.attendancePresent} / ${fKpis.attendanceTotal}` : '—'}
                icon={Calendar}
                description="Duty days present"
                variant="emerald"
              />
              <StatsCard title="Upcoming Examinations" value={fKpis.upcomingExamsCount ?? 0} icon={BookOpen} description="Scheduled ahead" variant="amber" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Schedule */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-light" />
              Upcoming Exam Schedule
            </h4>
            <div className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 my-2" />)
              ) : upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-white">{exam.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {exam.batch?.name} • {new Date(exam.examDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand/10 text-brand-light border border-brand/20 uppercase">
                      {exam.examType}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No upcoming exams</p>
              )}
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-status-success" />
              Recent Assignments
            </h4>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 my-2" />)
            ) : assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((asgn) => (
                  <a key={asgn.id} href={`/assignments/${asgn.id}/submissions`}
                    className="p-3 rounded-xl bg-bg-deep/40 border border-slate-700/30 flex items-center justify-between hover:border-brand/40 transition-colors group cursor-pointer block">
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">{asgn.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{asgn.batch?.name} • {asgn.subject?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-light">{asgn._count?.submissions || 0}</span>
                      <p className="text-[10px] text-slate-500">submissions</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent assignments</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER: STUDENT VIEW
  // ----------------------------------------------------
  const renderStudentDashboard = () => {
    const sKpis = dashData?.kpis || {};
    const results = dashData?.latestResults || [];
    const pending = dashData?.pendingAssignments || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <StatsCard title="Enrolled Batch" value={sKpis.enrolledBatch || '—'} icon={GraduationCap} description={sKpis.course || ''} variant="indigo" />
              <StatsCard
                title="Attendance Rate"
                value={`${sKpis.attendanceRate ?? 0}%`}
                icon={Activity}
                description={`Present: ${sKpis.attendancePresent ?? 0}, Absent: ${(sKpis.attendanceTotal ?? 0) - (sKpis.attendancePresent ?? 0)}`}
                variant="emerald"
              />
              <StatsCard title="Completed Exams" value={sKpis.completedExams ?? 0} icon={BookOpen} description="Examination records" variant="amber" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Assignments */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
            <h4 className="text-base font-bold text-white mb-4">Pending Assignments</h4>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 my-2" />)
            ) : pending.length > 0 ? (
              <div className="space-y-3">
                {pending.map((asgn) => (
                  <div key={asgn.id} className="p-3 rounded-xl bg-bg-deep/40 border border-slate-700/30">
                    <p className="text-sm font-semibold text-white">{asgn.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{asgn.subject?.name}</p>
                    <p className="text-[10px] text-status-warning mt-1">
                      Due: {new Date(asgn.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No pending assignments</p>
            )}
          </div>

          {/* Latest Results */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 lg:col-span-2">
            <h4 className="text-base font-bold text-white mb-4">Latest Results</h4>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 my-1" />)
              ) : results.length > 0 ? (
                results.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-bg-deep/20 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{r.exam?.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Score: {parseFloat(r.marksObtained)} / {r.exam?.totalMarks}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 font-bold rounded text-[9px] ${
                      r.status === 'PASS'
                        ? 'bg-status-success/10 text-status-success'
                        : 'bg-status-danger/10 text-status-danger'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No exam results yet</p>
              )}
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
          Here is your overview for today:{' '}
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {error && (
          <p className="text-xs text-status-danger mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>

      {(role === 'SUPER_ADMIN' || role === 'ADMIN') && renderAdminDashboard()}
      {role === 'RECEPTIONIST' && renderReceptionistDashboard()}
      {role === 'FACULTY' && renderFacultyDashboard()}
      {role === 'STUDENT' && renderStudentDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;
