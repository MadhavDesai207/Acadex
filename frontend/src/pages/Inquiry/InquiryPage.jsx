import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit, 
  Sparkles, 
  UserCheck, 
  History, 
  ShieldAlert, 
  CheckCircle,
  FileText
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import Input from '../../components/Input';
import InquiryForm from './InquiryForm';
import inquiryService from '../../services/inquiryService';

const InquiryPage = () => {
  const navigate = useNavigate();

  // Filters State
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, NEW, CONTACTED, INTERESTED, CONVERTED, DROPPED
  const [search, setSearch] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('');

  // Data State
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  
  // Follow-up Notes Modal State
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpInquiry, setFollowUpInquiry] = useState(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // UI Alerts
  const [alert, setAlert] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const tabs = ['ALL', 'NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'DROPPED'];

  const loadInquiries = async () => {
    setLoading(true);
    const data = await inquiryService.getInquiries({
      status: activeTab,
      search,
      followUpDate: followUpFilter
    });
    setInquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
    setCurrentPage(1);
  }, [activeTab, search, followUpFilter]);

  // Form Submissions (Create / Edit)
  const handleFormSubmit = async (formData) => {
    let res;
    if (editingInquiry) {
      res = await inquiryService.updateInquiry(editingInquiry.id, formData);
    } else {
      res = await inquiryService.createInquiry(formData);
    }

    if (res.success) {
      setAlert({
        type: 'success',
        message: res.message
      });
      setIsFormOpen(false);
      setEditingInquiry(null);
      loadInquiries();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Follow-up Notes Submission
  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpInquiry) return;

    const res = await inquiryService.updateInquiry(followUpInquiry.id, {
      followUpDate,
      notes: `${followUpInquiry.notes}\n[Follow-up ${new Date().toLocaleDateString()}]: ${followUpNotes}`,
      status: 'CONTACTED' // automatically bump status to contacted
    });

    if (res.success) {
      setAlert({ type: 'success', message: 'Follow-up log created successfully.' });
      setIsFollowUpOpen(false);
      setFollowUpInquiry(null);
      setFollowUpNotes('');
      setFollowUpDate('');
      loadInquiries();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Status Conversion to Admissions
  const handleConvert = async (id, name) => {
    const confirm = window.confirm(`Convert ${name} to an active admission file? This updates their status to CONVERTED.`);
    if (confirm) {
      const res = await inquiryService.updateInquiry(id, { status: 'CONVERTED' });
      if (res.success) {
        setAlert({ type: 'success', message: `${name} has been converted. You can now process their enrollment details in Admissions.` });
        loadInquiries();
        setTimeout(() => setAlert(null), 4000);
      }
    }
  };

  // Quick Status Dropdown Changes
  const handleQuickStatusChange = async (id, status) => {
    const res = await inquiryService.updateInquiry(id, { status });
    if (res.success) {
      setAlert({ type: 'success', message: 'Lead status updated successfully.' });
      loadInquiries();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Set Filter to Today Shortcut
  const handleDueTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setFollowUpFilter(today);
  };

  // Define Table Headers
  const tableHeaders = [
    { key: 'name', label: 'Prospect Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'courseInterest', label: 'Course Interest' },
    { 
      key: 'followUpDate', 
      label: 'Follow-up Date',
      render: (row) => row.followUpDate ? new Date(row.followUpDate).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border ${
          row.status === 'NEW' ? 'bg-brand/10 text-brand-light border-brand/20' :
          row.status === 'CONTACTED' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' :
          row.status === 'INTERESTED' ? 'bg-status-success/10 text-status-success border-status-success/20' :
          row.status === 'CONVERTED' ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/30' :
          'bg-status-danger/10 text-status-danger border-status-danger/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned Staff',
      render: (row) => row.assignedTo === 'st1' ? 'Alice Smith' : 'Bob Jones'
    }
  ];

  // Action Buttons Cell Render
  const tableActions = (row) => {
    return (
      <div className="flex gap-1.5 justify-end">
        {/* Quick change status dropdown */}
        <select
          value={row.status}
          onChange={(e) => handleQuickStatusChange(row.id, e.target.value)}
          className="bg-bg-surfaceLight border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-brand cursor-pointer"
        >
          {tabs.filter(t => t !== 'ALL').map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Log follow-up */}
        {row.status !== 'CONVERTED' && row.status !== 'DROPPED' && (
          <button
            onClick={() => {
              setFollowUpInquiry(row);
              setFollowUpDate(row.followUpDate || '');
              setIsFollowUpOpen(true);
            }}
            className="p-1.5 rounded bg-bg-surfaceLight hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            title="Log Follow-up Notes"
          >
            <History size={14} />
          </button>
        )}

        {/* Convert to admission */}
        {row.status !== 'CONVERTED' && (
          <button
            onClick={() => handleConvert(row.id, row.name)}
            className="p-1.5 rounded bg-brand/10 hover:bg-brand text-brand-light hover:text-white transition-colors"
            title="Convert to Admission"
          >
            <UserCheck size={14} />
          </button>
        )}

        {/* Edit details */}
        <button
          onClick={() => {
            setEditingInquiry(row);
            setIsFormOpen(true);
          }}
          className="p-1.5 rounded bg-bg-surfaceLight hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          title="Edit Details"
        >
          <Edit size={14} />
        </button>
      </div>
    );
  };

  // Pagination Math
  const totalPages = Math.ceil(inquiries.length / limit) || 1;
  const paginatedData = inquiries.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Inquiry Pipeline
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage prospective student inquiries, schedule follow-ups, and convert leads to admissions.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setEditingInquiry(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Inquiry</span>
          </Button>
        </div>

        {/* Alerts Banner */}
        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 pb-px gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-brand text-brand-light bg-brand/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Toolbar Search/Calendar filters */}
        <div className="glass-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 font-heading">Search Leads</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-500 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by Name or Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 font-heading">Follow-up Date</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-500 pointer-events-none">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDueTodayClick}
              className="w-full flex items-center justify-center gap-1.5"
            >
              <Calendar size={16} className="text-brand-light" />
              <span>Due Today</span>
            </Button>
            {followUpFilter && (
              <Button
                variant="secondary"
                onClick={() => setFollowUpFilter('')}
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Data Grid Table */}
        <Table
          headers={tableHeaders}
          data={paginatedData}
          loading={loading}
          actions={tableActions}
          emptyMessage="No prospective student leads found matching these filters."
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

        {/* Create/Edit Modal Form */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingInquiry(null);
          }}
          title={editingInquiry ? 'Update CRM Inquiry Details' : 'Log Prospective Student Inquiry'}
        >
          <InquiryForm
            onSubmit={handleFormSubmit}
            initialData={editingInquiry}
            onClose={() => {
              setIsFormOpen(false);
              setEditingInquiry(null);
            }}
          />
        </Modal>

        {/* Follow Up Log Notes Modal */}
        <Modal
          isOpen={isFollowUpOpen}
          onClose={() => {
            setIsFollowUpOpen(false);
            setFollowUpInquiry(null);
          }}
          title="Log Follow-up Activity Notes"
        >
          {followUpInquiry && (
            <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-bg-deep/40 border border-slate-700/30 text-xs text-slate-400">
                <span className="font-bold text-slate-300">Previous Notes History:</span>
                <p className="mt-1 whitespace-pre-line font-mono max-h-24 overflow-y-auto">{followUpInquiry.notes || 'No previous logs.'}</p>
              </div>

              <Input
                label="Reschedule Next Contact Date"
                name="followUpReschedule"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="followUpNotes" className="text-sm font-medium text-slate-300">
                  Follow-up Activity Details
                </label>
                <textarea
                  id="followUpNotes"
                  rows={3}
                  placeholder="Summarize the outcome of the phone call or campus visit here..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsFollowUpOpen(false);
                    setFollowUpInquiry(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Follow-up Notes
                </Button>
              </div>
            </form>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default InquiryPage;
