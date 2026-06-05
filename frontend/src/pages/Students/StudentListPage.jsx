import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Edit2, ShieldX, UserCheck, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Button from '../../components/Button';
import studentService from '../../services/studentService';
import authService from '../../services/authService';

const StudentListPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || { role: 'FACULTY' };
  const isReadOnly = currentUser.role === 'FACULTY';

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Dropdown Options
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // Table Data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Alert State
  const [alert, setAlert] = useState(null);

  // 1. Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const data = await studentService.getCourses();
      setCourses(data.map(c => ({ value: c.id, label: c.name })));
    };
    fetchCourses();
  }, []);

  // 2. Fetch batches whenever selected course changes (Cascading Filter)
  useEffect(() => {
    const fetchBatches = async () => {
      const data = await studentService.getBatches(selectedCourse || null);
      setBatches(data.map(b => ({ value: b.id, label: b.name })));
      setSelectedBatch(''); // Reset batch select
    };
    fetchBatches();
  }, [selectedCourse]);

  // 3. Fetch students whenever filters change
  const loadStudents = async () => {
    setLoading(true);
    const data = await studentService.getStudents({
      search,
      courseId: selectedCourse,
      batchId: selectedBatch,
      status: selectedStatus
    });
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
    setCurrentPage(1); // Reset to page 1 on filter
  }, [search, selectedCourse, selectedBatch, selectedStatus]);

  // Handle Soft Delete / Status Toggle
  const handleToggleStatus = async (id, currentStatus) => {
    const confirmation = window.confirm(
      currentStatus 
        ? 'Are you sure you want to deactivate this student profile?' 
        : 'Are you sure you want to activate this student profile?'
    );
    
    if (confirmation) {
      const nextStatus = !currentStatus;
      const res = await studentService.toggleStudentStatus(id, nextStatus);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Student successfully ${nextStatus ? 'activated' : 'deactivated'}.`
        });
        loadStudents(); // reload
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  // Define Table Headers
  const tableHeaders = [
    { key: 'rollNumber', label: 'Roll Number', sortable: true },
    { 
      key: 'name', 
      label: 'Full Name', 
      sortable: true,
      render: (row) => row.user?.name || 'N/A'
    },
    { 
      key: 'course', 
      label: 'Course',
      render: (row) => row.course?.name || 'N/A'
    },
    { 
      key: 'batch', 
      label: 'Batch',
      render: (row) => row.batch?.name || 'N/A' 
    },
    { 
      key: 'enrolledAt', 
      label: 'Enrolled Date',
      render: (row) => new Date(row.enrolledAt).toLocaleDateString()
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
          row.isActive 
            ? 'bg-status-success/15 text-status-success' 
            : 'bg-status-danger/15 text-status-danger'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Action Buttons Cell Render
  const tableActions = (row) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/students/${row.id}`)}
          className="p-1.5 rounded bg-bg-surfaceLight hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          title="View Details"
        >
          <Eye size={15} />
        </button>
        
        {!isReadOnly && (
          <>
            <button
              onClick={() => navigate(`/students/edit/${row.id}`)}
              className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
              title="Edit Profile"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => handleToggleStatus(row.id, row.isActive)}
              className={`p-1.5 rounded transition-colors ${
                row.isActive 
                  ? 'bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white' 
                  : 'bg-status-success/10 hover:bg-status-success text-status-success hover:text-white'
              }`}
              title={row.isActive ? 'Deactivate Student' : 'Activate Student'}
            >
              {row.isActive ? <ShieldX size={15} /> : <UserCheck size={15} />}
            </button>
          </>
        )}
      </div>
    );
  };

  // Pagination Math
  const totalPages = Math.ceil(students.length / limit) || 1;
  const paginatedData = students.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Learner Registry
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage student enrollment details, academic records, and batch status assignments.
            </p>
          </div>

          {!isReadOnly && (
            <Button
              variant="primary"
              onClick={() => navigate('/students/add')}
              className="flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>Add Student</span>
            </Button>
          )}
        </div>

        {/* Alert Dialog */}
        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm animate-fadeIn">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* Filter Toolbar Cards */}
        <div className="glass-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Search</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-500 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by Name, Roll, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
          </div>

          {/* Course filter */}
          <Select
            label="Filter Course"
            name="courseFilter"
            options={courses}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            placeholder="All Courses"
          />

          {/* Batch filter */}
          <Select
            label="Filter Batch"
            name="batchFilter"
            options={batches}
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            placeholder="All Batches"
            disabled={!selectedCourse}
          />

          {/* Status filter */}
          <Select
            label="Status"
            name="statusFilter"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            placeholder="All Statuses"
          />
        </div>

        {/* Data Grid Table */}
        <Table
          headers={tableHeaders}
          data={paginatedData}
          loading={loading}
          actions={tableActions}
          emptyMessage="No students found matching the filter constraints."
          pagination={{
            currentPage,
            totalPages,
            limit,
            onPageChange: (page) => setCurrentPage(page),
            onLimitChange: (size) => {
              setLimit(size);
              setCurrentPage(1);
            }
          }}
        />

      </div>
    </DashboardLayout>
  );
};

export default StudentListPage;
