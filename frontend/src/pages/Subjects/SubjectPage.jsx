import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import SubjectForm from './SubjectForm';
import subjectService from '../../services/subjectService';
import authService from '../../services/authService';
import apiClient from '../../services/apiClient';

const SubjectPage = () => {
  const currentUser = authService.getLocalUser() || {};
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    apiClient.get('/courses').then((r) => {
      const list = r.data.courses || r.data || [];
      setCourses(list.filter((c) => c.isActive));
    });
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const params = {};
    if (filterCourse) params.courseId = filterCourse;
    if (search) params.search = search;
    const data = await subjectService.getSubjects(params);
    const list = Array.isArray(data) ? data : [];
    setSubjects(list);
    setLoading(false);
  };

  useEffect(() => {
    loadSubjects();
    setCurrentPage(1);
  }, [search, filterCourse]);

  const handleFormSubmit = async (formData) => {
    const res = editingSubject
      ? await subjectService.updateSubject(editingSubject.id, formData)
      : await subjectService.createSubject(formData);

    if (res.success) {
      setAlert({ message: res.message || (editingSubject ? 'Subject updated' : 'Subject created') });
      setIsFormOpen(false);
      setEditingSubject(null);
      loadSubjects();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Deactivate subject "${subject.name}"?`)) return;
    const res = await subjectService.deleteSubject(subject.id);
    if (res.success) {
      setAlert({ message: 'Subject deactivated' });
      loadSubjects();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const headers = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Subject Name', sortable: true },
    {
      key: 'course',
      label: 'Course',
      render: (row) => row.course ? `${row.course.name} (${row.course.code})` : '—'
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
            onClick={() => { setEditingSubject(row); setIsFormOpen(true); }}
            className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          {row.isActive && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white transition-colors"
              title="Deactivate"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    : null;

  const totalPages = Math.ceil(subjects.length / limit) || 1;
  const paginatedData = subjects.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Subjects
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage subjects per course. Subjects are used in timetables, syllabus, materials, and assignments.
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => { setEditingSubject(null); setIsFormOpen(true); }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>New Subject</span>
            </Button>
          )}
        </div>

        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        <div className="glass-card flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
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
          <div className="flex flex-col gap-1.5 w-full md:w-56">
            <label className="text-sm font-medium text-slate-300">Filter by Course</label>
            <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          headers={headers}
          data={paginatedData}
          loading={loading}
          actions={tableActions}
          emptyMessage="No subjects found. Create a course first, then add subjects."
          pagination={{
            currentPage,
            totalPages,
            limit,
            onPageChange: setCurrentPage,
            onLimitChange: () => {}
          }}
        />

        <Modal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingSubject(null); }}
          title={editingSubject ? 'Edit Subject' : 'Create New Subject'}
        >
          <SubjectForm
            onSubmit={handleFormSubmit}
            initialData={editingSubject}
            onClose={() => { setIsFormOpen(false); setEditingSubject(null); }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SubjectPage;
