import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Send, CheckCircle, AlertCircle, Lock, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import AssignmentStatusBadge from '../../components/AssignmentStatusBadge';
import AssignmentForm from './AssignmentForm';
import assignmentService from '../../services/assignmentService';
import authService from '../../services/authService';
import apiClient from '../../services/apiClient';

const AssignmentPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || {};
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);
  const canManage = isAdmin || currentUser.role === 'FACULTY';
  const isStudent = currentUser.role === 'STUDENT';

  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    apiClient.get('/batches').then((r) => {
      const list = r.data.data || r.data || [];
      setBatches(list.filter((b) => b.isActive));
    });
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    const params = {};
    if (filterBatch) params.batchId = filterBatch;
    if (filterStatus) params.status = filterStatus;
    const data = await assignmentService.getAssignments(params);
    setAssignments(data || []);
    setLoading(false);
  };

  useEffect(() => { loadAssignments(); }, [filterBatch, filterStatus]);

  const handleFormSubmit = async (formData) => {
    let res;
    if (editingAssignment) {
      res = await assignmentService.updateAssignment(editingAssignment.id, formData);
    } else {
      res = await assignmentService.createAssignment(formData);
    }
    if (res.success) {
      setAlert({ message: res.message });
      setIsFormOpen(false);
      setEditingAssignment(null);
      loadAssignments();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handlePublish = async (assignment) => {
    if (!window.confirm(`Publish "${assignment.title}" to all batch students?`)) return;
    const res = await assignmentService.publishAssignment(assignment.id);
    if (res.success) {
      setAlert({ message: res.message });
      loadAssignments();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleClose = async (assignment) => {
    if (!window.confirm(`Close "${assignment.title}"? Students can no longer submit, and grading becomes available.`)) return;
    try {
      const res = await assignmentService.closeAssignment(assignment.id);
      setAlert({ message: res.message || 'Assignment closed.' });
      loadAssignments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to close assignment.' });
    }
    setTimeout(() => setAlert(null), 4000);
  };

  const handleStudentSubmit = async (assignmentId) => {
    if (!window.confirm('Mark this assignment as submitted?')) return;
    const res = await assignmentService.submitAssignment(assignmentId);
    if (res.success) {
      setAlert({ message: 'Assignment submitted' });
      loadAssignments();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const headers = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'batch', label: 'Batch', render: (row) => row.batch?.name || '—' },
    { key: 'subject', label: 'Subject', render: (row) => row.subject?.name || '—' },
    { key: 'dueDate', label: 'Due Date', render: (row) => new Date(row.dueDate).toLocaleDateString() },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'status', label: 'Status', render: (row) => <AssignmentStatusBadge status={row.status} /> },
    { key: '_count', label: 'Submissions', render: (row) => row._count?.submissions ?? '—' }
  ];

  const tableActions = (row) => (
    <div className="flex gap-2 justify-end">
      {canManage && (
        <>
          <button
            onClick={() => navigate(`/assignments/${row.id}/submissions`)}
            className="p-1.5 rounded bg-bg-surfaceLight hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            title="View Submissions"
          >
            <Eye size={14} />
          </button>
          {row.status === 'DRAFT' && (
            <>
              <button
                onClick={() => { setEditingAssignment(row); setIsFormOpen(true); }}
                className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handlePublish(row)}
                className="p-1.5 rounded bg-status-success/10 hover:bg-status-success text-status-success hover:text-white transition-colors"
                title="Publish"
              >
                <Send size={14} />
              </button>
            </>
          )}
          {row.status === 'PUBLISHED' && (
            <button
              onClick={() => handleClose(row)}
              className="p-1.5 rounded bg-status-warning/10 hover:bg-status-warning text-status-warning hover:text-white transition-colors"
              title="Close submissions & enable grading"
            >
              <Lock size={14} />
            </button>
          )}
        </>
      )}
      {isStudent && row.status === 'PUBLISHED' && (
        <button
          onClick={() => handleStudentSubmit(row.id)}
          className="px-3 py-1 rounded bg-brand text-white text-xs font-bold hover:bg-brand/80 transition-colors"
        >
          Submit
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">Assignments</h1>
            <p className="text-xs text-slate-400">Create, distribute, and grade assignments.</p>
          </div>
          {canManage && (
            <Button variant="primary" onClick={() => { setEditingAssignment(null); setIsFormOpen(true); }} className="flex items-center gap-2">
              <Plus size={16} /> <span>New Assignment</span>
            </Button>
          )}
        </div>

        {alert && (
          <div className={`flex gap-2.5 p-3 rounded-lg text-sm border ${
            alert.type === 'error'
              ? 'bg-status-danger/15 border-status-danger/30 text-status-danger'
              : 'bg-status-success/15 border-status-success/30 text-status-success'
          }`}>
            {alert.type === 'error'
              ? <AlertCircle size={18} className="shrink-0 mt-0.5" />
              : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
            <span>{alert.message}</span>
          </div>
        )}

        <div className="glass-card flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-slate-300">Batch</label>
            <Select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
              <option value="">All Batches</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          {canManage && (
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
          )}
        </div>

        <Table
          headers={headers}
          data={assignments}
          loading={loading}
          actions={tableActions}
          emptyMessage="No assignments found."
        />

        <Modal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingAssignment(null); }}
          title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        >
          <AssignmentForm
            onSubmit={handleFormSubmit}
            initialData={editingAssignment}
            onClose={() => { setIsFormOpen(false); setEditingAssignment(null); }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentPage;
