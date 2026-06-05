import React, { useState, useEffect } from 'react';
import { Search, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FeePaymentBadge from '../../components/FeePaymentBadge';
import feeService from '../../services/feeService';
import apiClient from '../../services/apiClient';

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'UPI'];

const CollectForm = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: search student, 2: select fee, 3: enter payment
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [form, setForm] = useState({ installmentId: '', amountPaid: '', paymentMethod: 'CASH', transactionRef: '', remarks: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchStudents = async () => {
    if (!studentSearch.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient.get('/students', { params: { search: studentSearch } });
      const list = res.data.students || res.data.data || res.data || [];
      setStudents(Array.isArray(list) ? list.slice(0, 10) : []);
    } catch {
      setStudents([]);
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const res = await feeService.getStudentFee(student.id);
      setStudentFees(res.data || []);
      setStep(2);
    } catch {
      setStudentFees([]);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const selectFee = (fee) => {
    setSelectedFee(fee);
    setForm((f) => ({ ...f, installmentId: '', amountPaid: '' }));
    setStep(3);
  };

  const validate = () => {
    const e = {};
    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0) e.amountPaid = 'Enter a valid amount.';
    if (!form.paymentMethod) e.paymentMethod = 'Select a payment method.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await feeService.collectFee({
        studentFeeId: selectedFee.id,
        installmentId: form.installmentId || undefined,
        amountPaid: parseFloat(form.amountPaid),
        paymentMethod: form.paymentMethod,
        transactionRef: form.transactionRef || undefined,
        remarks: form.remarks || undefined
      });
      onSuccess('Payment recorded successfully.', res.data?.id);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Payment failed.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedInstallment = selectedFee?.feeStructure?.installments?.find((i) => i.id === form.installmentId);

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        {['Find Student', 'Select Fee', 'Record Payment'].map((label, i) => (
          <React.Fragment key={label}>
            <span className={`font-semibold ${step === i + 1 ? 'text-brand-light' : step > i + 1 ? 'text-status-success' : ''}`}>
              {i + 1}. {label}
            </span>
            {i < 2 && <span className="text-slate-600">›</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Search student */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
            <Button variant="primary" onClick={searchStudents} loading={searching}>Search</Button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStudent(s)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-bg-deep/40 border border-slate-700/40 hover:border-brand/50 hover:bg-brand/5 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{s.user?.name}</p>
                  <p className="text-xs text-slate-400">{s.rollNumber} · {s.course?.name}</p>
                </div>
              </button>
            ))}
            {students.length === 0 && studentSearch && !searching && (
              <p className="text-sm text-slate-500 text-center py-3">No students found.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select fee record */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-brand/10 border border-brand/30">
            <div>
              <p className="text-sm font-bold text-white">{selectedStudent?.user?.name}</p>
              <p className="text-xs text-slate-400">{selectedStudent?.rollNumber} · {selectedStudent?.course?.name}</p>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-3">Loading fee records...</p>
          ) : studentFees.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-3">No fee records assigned to this student.</p>
          ) : (
            studentFees.map((sf) => (
              <button
                key={sf.id}
                type="button"
                onClick={() => selectFee(sf)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-deep/40 border border-slate-700/40 hover:border-brand/50 hover:bg-brand/5 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{sf.feeStructure?.name}</p>
                  <p className="text-xs text-slate-400">{sf.feeStructure?.installments?.length || 0} installments</p>
                </div>
                <p className="text-sm font-bold text-brand-light">{fmt(sf.netPayable)}</p>
              </button>
            ))
          )}
          <Button variant="outline" onClick={() => { setStep(1); setStudents([]); }}>Back</Button>
        </div>
      )}

      {/* Step 3: Enter payment */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {errors.submit && (
            <p className="text-xs text-status-danger bg-status-danger/10 p-2 rounded-lg">{errors.submit}</p>
          )}

          <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 text-sm">
            <p className="font-bold text-white">{selectedStudent?.user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{selectedFee?.feeStructure?.name} · Net Payable: {fmt(selectedFee?.netPayable)}</p>
          </div>

          {/* Installment picker */}
          {selectedFee?.feeStructure?.installments?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Installment (optional)</label>
              <select
                value={form.installmentId}
                onChange={(e) => {
                  const inst = selectedFee.feeStructure.installments.find((i) => i.id === e.target.value);
                  setForm((f) => ({ ...f, installmentId: e.target.value, amountPaid: inst ? String(inst.amount) : f.amountPaid }));
                }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input"
              >
                <option value="">Select installment (or pay open amount)</option>
                {selectedFee.feeStructure.installments.map((i) => (
                  <option key={i.id} value={i.id}>{i.label} — {fmt(i.amount)} (due {new Date(i.dueDate).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Amount Paid (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.amountPaid}
                onChange={(e) => setForm((f) => ({ ...f, amountPaid: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
              {errors.amountPaid && <p className="text-xs text-status-danger">{errors.amountPaid}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Payment Method *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input"
              >
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {['BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'UPI'].includes(form.paymentMethod) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Transaction Reference</label>
              <input
                type="text"
                placeholder="UTR / Cheque no. / Ref."
                value={form.transactionRef}
                onChange={(e) => setForm((f) => ({ ...f, transactionRef: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" type="submit" loading={loading}>Record Payment</Button>
          </div>
        </form>
      )}
    </div>
  );
};

const FeeCollectionPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', method: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;

  const showAlert = (type, message, paymentId = null) => {
    setAlert({ type, message, paymentId });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.method) params.method = filters.method;
      const res = await feeService.getPayments(params);
      setPayments(res.data || []);
    } catch {
      showAlert('error', 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, [currentPage, filters]);

  const headers = [
    { key: 'receiptNumber', label: 'Receipt No.', render: (row) => <span className="font-mono text-brand-light text-xs">{row.receiptNumber}</span> },
    { key: 'student', label: 'Student', render: (row) => row.studentFee?.student?.user?.name || '—' },
    { key: 'course', label: 'Course', render: (row) => row.studentFee?.student?.course?.name || '—' },
    { key: 'installment', label: 'Installment', render: (row) => row.installment?.label || 'Open' },
    { key: 'amountPaid', label: 'Amount', render: (row) => <span className="font-bold text-status-success">{fmt(row.amountPaid)}</span> },
    { key: 'paymentMethod', label: 'Method', render: (row) => row.paymentMethod?.replace('_', ' ') },
    { key: 'status', label: 'Status', render: (row) => <FeePaymentBadge status={row.status} /> },
    { key: 'paymentDate', label: 'Date', render: (row) => new Date(row.paymentDate).toLocaleDateString() },
    { key: 'collectedBy', label: 'Collected By', render: (row) => row.collector?.name || '—' }
  ];

  const tableActions = (row) => (
    <button
      onClick={() => navigate(`/fees/receipt/${row.id}`)}
      className="p-1.5 rounded bg-bg-surfaceLight hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
      title="View Receipt"
    >
      <Receipt size={14} />
    </button>
  );

  const totalPages = Math.ceil(payments.length / limit) || 1;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">Fee Collection</h1>
            <p className="text-xs md:text-sm text-slate-400">Record payments and view transaction history.</p>
          </div>
          <Button variant="primary" onClick={() => setIsCollectOpen(true)} className="flex items-center gap-2">
            <Receipt size={16} /> Collect Payment
          </Button>
        </div>

        {alert && (
          <div className={`flex items-center gap-2.5 p-3 rounded-lg text-sm border ${alert.type === 'success' ? 'bg-status-success/15 border-status-success/30 text-status-success' : 'bg-status-danger/15 border-status-danger/30 text-status-danger'}`}>
            {alert.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            <span className="flex-1">{alert.message}</span>
            {alert.paymentId && (
              <button
                onClick={() => navigate(`/fees/receipt/${alert.paymentId}`)}
                className="ml-2 px-3 py-1 text-xs font-semibold rounded-lg bg-status-success/20 hover:bg-status-success/30 border border-status-success/40 transition-colors shrink-0"
              >
                View Receipt
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-slate-300">From Date</label>
            <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-slate-300">To Date</label>
            <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input" />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-sm font-medium text-slate-300">Method</label>
            <select value={filters.method} onChange={(e) => setFilters((f) => ({ ...f, method: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input">
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => setFilters({ from: '', to: '', method: '' })}>Clear</Button>
          </div>
        </div>

        <Table
          headers={headers}
          data={payments}
          loading={loading}
          actions={tableActions}
          emptyMessage="No payments recorded yet."
          pagination={{ currentPage, totalPages, limit, onPageChange: setCurrentPage, onLimitChange: () => {} }}
        />

        <Modal
          isOpen={isCollectOpen}
          onClose={() => setIsCollectOpen(false)}
          title="Collect Fee Payment"
          maxWidth="max-w-lg"
        >
          <CollectForm
            onClose={() => setIsCollectOpen(false)}
            onSuccess={(msg, paymentId) => {
              setIsCollectOpen(false);
              showAlert('success', msg, paymentId);
              loadPayments();
            }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default FeeCollectionPage;
