import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, GraduationCap, Calendar, Mail, Phone, MapPin, Activity, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import studentService from '../../services/studentService';
import authService from '../../services/authService';

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || { role: 'FACULTY' };
  const isReadOnly = currentUser.role === 'FACULTY';

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const studentData = await studentService.getStudentById(id);
      setStudent(studentData);
      
      const resultsData = await studentService.getStudentResults(id);
      setResults(resultsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!student) return;
    const confirmation = window.confirm(
      student.isActive
        ? 'Are you sure you want to deactivate this student profile? Login access will be revoked.'
        : 'Are you sure you want to activate this student profile?'
    );

    if (confirmation) {
      try {
        const nextStatus = !student.isActive;
        const res = await studentService.toggleStudentStatus(student.id, nextStatus);
        if (res.success) {
          setAlert({
            type: 'success',
            message: `Student successfully ${nextStatus ? 'activated' : 'deactivated'}.`
          });
          loadStudentDetails();
          setTimeout(() => setAlert(null), 3000);
        }
      } catch (err) {
        setAlert({
          type: 'danger',
          message: err.response?.data?.message || 'Failed to update student status.'
        });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-danger/15 border border-status-danger/30 text-status-danger text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error || 'Student not found.'}</span>
          </div>
          <Button variant="secondary" onClick={() => navigate('/students')} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to Registry</span>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/students')}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
                Student Profile Detail
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Detailed profile auditing, program mapping, and gradebook histories.
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                className={student.isActive ? 'text-status-danger border-status-danger/30 hover:bg-status-danger/10' : 'text-status-success border-status-success/30 hover:bg-status-success/10'}
              >
                {student.isActive ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/students/edit/${student.id}`)}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alert && (
          <div className={`flex gap-2.5 p-3 rounded-lg border text-sm animate-fadeIn ${
            alert.type === 'success' ? 'bg-status-success/15 border-status-success/30 text-status-success' : 'bg-status-danger/15 border-status-danger/30 text-status-danger'
          }`}>
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand/35 flex items-center justify-center text-brand-light font-bold text-xl border border-brand/50">
              {student.user?.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">{student.user?.name}</h2>
              <p className="text-sm text-slate-400 mt-1 font-mono">{student.rollNumber} • {student.course?.name}</p>
              <span className={`inline-block px-2.5 py-0.5 mt-2 text-[10px] font-bold rounded-full ${
                student.isActive 
                  ? 'bg-status-success/15 text-status-success border border-status-success/20' 
                  : 'bg-status-danger/15 text-status-danger border border-status-danger/20'
              }`}>
                {student.isActive ? 'Active Learner' : 'Inactive / Suspended'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-slate-400">
            <div>
              <span className="text-slate-500 block">Current Batch</span>
              <strong className="text-slate-200 text-sm mt-0.5 block">{student.batch?.name || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Enrolled Date</span>
              <strong className="text-slate-200 text-sm mt-0.5 block">{new Date(student.enrolledAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* Profile Details Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Details Sidebar Columns */}
          <div className="flex flex-col gap-6">
            {/* Contact Parameters */}
            <div className="glass-card flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Mail size={16} className="text-brand-light" />
                <span>Contact Details</span>
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Portal Email</span>
                  <span className="text-slate-200 break-all">{student.user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone</span>
                  <span className="text-slate-200">{student.user?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Residential Address</span>
                  <span className="text-slate-200 leading-normal">{student.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="glass-card flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Phone size={16} className="text-brand-light" />
                <span>Guardian details</span>
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Parent / Guardian Name</span>
                  <span className="text-slate-200 font-semibold">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Guardian Phone</span>
                  <span className="text-slate-200 font-mono">{student.parentPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Personal bio data parameters */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2.5">
                Personal Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Date of Birth</span>
                  <span className="text-slate-200 mt-1 block font-medium">
                    {new Date(student.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender</span>
                  <span className="text-slate-200 mt-1 block font-medium capitalize">{student.gender.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {/* Academic Evaluation Transcript */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <Award size={18} className="text-status-success" />
                <span>Examination Transcript & Grades</span>
              </h3>

              {results.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-medium bg-bg-deep/10 rounded-xl border border-slate-800/40">
                  No completed examination records logged for this student.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2">Exam Title</th>
                        <th className="py-2">Exam Type</th>
                        <th className="py-2 text-center">Score</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {results.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-800/15">
                          <td className="py-3 font-semibold text-white">
                            {res.exam?.title}
                            <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
                              {new Date(res.exam?.examDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 capitalize text-slate-400">{res.exam?.examType.toLowerCase()}</td>
                          <td className="py-3 text-center font-bold text-slate-200">
                            {res.marksObtained} <span className="text-slate-500 font-normal">/ {res.exam?.totalMarks}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-block px-2 py-0.5 font-bold rounded text-[10px] ${
                              res.status === 'PASS' 
                                ? 'bg-status-success/10 text-status-success border border-status-success/15' 
                                : 'bg-status-danger/10 text-status-danger border border-status-danger/15'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDetailPage;
