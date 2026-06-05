import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import Input from '../../components/Input';
import DifficultyBadge from '../../components/DifficultyBadge';
import QuestionForm from './QuestionForm';
import questionService from '../../services/questionService';
import apiClient from '../../services/apiClient';

const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'];

const QuestionBankPage = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    apiClient.get('/subjects').then((r) => {
      const list = r.data.subjects || r.data.data || r.data || [];
      setSubjects(list.filter((s) => s.isActive !== false));
    });
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const params = {};
    if (filterSubject) params.subjectId = filterSubject;
    if (filterDifficulty) params.difficulty = filterDifficulty;
    if (search.trim()) params.search = search.trim();
    const data = await questionService.getQuestions(params);
    const list = data.data || data.questions || data || [];
    setQuestions(Array.isArray(list) ? list : []);
    setLoading(false);
  };

  useEffect(() => { loadQuestions(); }, [filterSubject, filterDifficulty, search]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (formData) => {
    let res;
    if (editing) {
      res = await questionService.updateQuestion(editing.id, formData);
    } else {
      res = await questionService.createQuestion(formData);
    }
    if (res.success) {
      showAlert(res.message || (editing ? 'Question updated.' : 'Question added.'));
      setIsFormOpen(false);
      setEditing(null);
      loadQuestions();
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete this question? This action cannot be undone.`)) return;
    const res = await questionService.deleteQuestion(row.id);
    if (res.success) {
      showAlert('Question deleted.');
      loadQuestions();
    }
  };

  const headers = [
    {
      key: 'questionText',
      label: 'Question',
      sortable: true,
      render: (row) => (
        <span className="block max-w-xs truncate" title={row.questionText}>{row.questionText}</span>
      )
    },
    { key: 'subject', label: 'Subject', render: (row) => row.subject?.name || '—' },
    { key: 'difficulty', label: 'Difficulty', render: (row) => <DifficultyBadge difficulty={row.difficulty} /> },
    { key: 'marks', label: 'Marks' },
    { key: 'createdBy', label: 'Created By', render: (row) => row.createdBy?.name || '—' }
  ];

  const tableActions = (row) => (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => { setEditing(row); setIsFormOpen(true); }}
        className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
        title="Edit"
      >
        <Edit2 size={14} />
      </button>
      <button
        onClick={() => handleDelete(row)}
        className="p-1.5 rounded bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white transition-colors"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">Question Bank</h1>
            <p className="text-xs text-slate-400">Manage all MCQ questions used in exams.</p>
          </div>
          <Button variant="primary" onClick={() => { setEditing(null); setIsFormOpen(true); }} className="flex items-center gap-2">
            <Plus size={16} /> <span>Add Question</span>
          </Button>
        </div>

        {alert && (
          <div className={`flex gap-2.5 p-3 rounded-lg text-sm border ${
            alert.type === 'success'
              ? 'bg-status-success/15 border-status-success/30 text-status-success'
              : 'bg-status-danger/15 border-status-danger/30 text-status-danger'
          }`}>
            {alert.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <span>{alert.message}</span>
          </div>
        )}

        <div className="glass-card flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-slate-300">Search</label>
            <Input
              placeholder="Search question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-sm font-medium text-slate-300">Subject</label>
            <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-sm font-medium text-slate-300">Difficulty</label>
            <Select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              <option value="">All Difficulties</option>
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          headers={headers}
          data={questions}
          loading={loading}
          actions={tableActions}
          emptyMessage="No questions found. Add your first question."
        />

        <Modal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditing(null); }}
          title={editing ? 'Edit Question' : 'Add Question'}
          maxWidth="max-w-2xl"
        >
          <QuestionForm
            onSubmit={handleSubmit}
            initialData={editing}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default QuestionBankPage;
