import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import CourseForm from './CourseForm';
import courseService from '../../services/courseService';
import authService from '../../services/authService';

const CoursePage = () => {
  const currentUser = authService.getLocalUser() || {};
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const loadCourses = async () => {
    setLoading(true);
    const data = await courseService.getCourses();
    const list = Array.isArray(data) ? data : [];
    const filtered = search
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
        )
      : list;
    setCourses(filtered);
    setLoading(false);
  };

  useEffect(() => {
    loadCourses();
    setCurrentPage(1);
  }, [search]);

  const handleFormSubmit = async (formData) => {
    const res = editingCourse
      ? await courseService.updateCourse(editingCourse.id, formData)
      : await courseService.createCourse(formData);

    if (res.success) {
      setAlert({ message: res.message });
      setIsFormOpen(false);
      setEditingCourse(null);
      loadCourses();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleToggle = async (course) => {
    if (
      !window.confirm(
        `${course.isActive ? 'Deactivate' : 'Activate'} course "${course.name}"?`
      )
    )
      return;
    const res = await courseService.toggleCourseStatus(course.id);
    if (res.success) {
      setAlert({ message: res.message });
      loadCourses();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const headers = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Course Name', sortable: true },
    {
      key: 'durationMonths',
      label: 'Duration',
      render: (row) => `${row.durationMonths} month${row.durationMonths !== 1 ? 's' : ''}`
    },
    {
      key: 'fees',
      label: 'Fees',
      render: (row) =>
        `₹${Number(row.fees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
            row.isActive
              ? 'bg-status-success/15 text-status-success'
              : 'bg-status-danger/15 text-status-danger'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const tableActions = isAdmin
    ? (row) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              setEditingCourse(row);
              setIsFormOpen(true);
            }}
            className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleToggle(row)}
            className={`p-1.5 rounded transition-colors ${
              row.isActive
                ? 'bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white'
                : 'bg-status-success/10 hover:bg-status-success text-status-success hover:text-white'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            {row.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
          </button>
        </div>
      )
    : null;

  const totalPages = Math.ceil(courses.length / limit) || 1;
  const paginatedData = courses.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Courses
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage all course offerings. Courses are required before creating batches or subjects.
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingCourse(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>New Course</span>
            </Button>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* Search */}
        <div className="glass-card max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Search</label>
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          headers={headers}
          data={paginatedData}
          loading={loading}
          actions={tableActions}
          emptyMessage="No courses found. Add one to get started."
          pagination={{
            currentPage,
            totalPages,
            limit,
            onPageChange: setCurrentPage,
            onLimitChange: () => {}
          }}
        />

        {/* Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCourse(null);
          }}
          title={editingCourse ? 'Edit Course' : 'Create New Course'}
        >
          <CourseForm
            onSubmit={handleFormSubmit}
            initialData={editingCourse}
            onClose={() => {
              setIsFormOpen(false);
              setEditingCourse(null);
            }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CoursePage;
