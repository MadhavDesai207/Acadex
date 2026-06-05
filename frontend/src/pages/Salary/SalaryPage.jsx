import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, ShieldAlert, Sparkles, CreditCard, Edit, HelpCircle, FileText } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import salaryService from '../../services/salaryService';
import facultyService from '../../services/facultyService';
import authService from '../../services/authService';

const SalaryPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || { id: 'f1', role: 'FACULTY', name: 'User' };
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Date Selection States (default to current month/year)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  // Data States
  const [salaryRecords, setSalaryRecords] = useState([]); // for Admin
  const [personalHistory, setPersonalHistory] = useState([]); // for Faculty
  const [loading, setLoading] = useState(false);

  // Modals States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustRecord, setAdjustRecord] = useState(null);
  const [adjustDeductions, setAdjustDeductions] = useState(0);
  const [adjustBonus, setAdjustBonus] = useState(0);
  const [adjustRemarks, setAdjustRemarks] = useState('');

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payRecord, setPayRecord] = useState(null);

  // UI Toast State
  const [alert, setAlert] = useState(null);

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const years = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' }
  ];

  // Fetch salaries data
  const loadSalaries = async () => {
    setLoading(true);
    if (isAdmin) {
      const records = await salaryService.getSalaryRecords({
        month: selectedMonth,
        year: selectedYear
      });
      setSalaryRecords(records);
    } else {
      // Find own faculty profile matching email, then fetch history
      const facList = await facultyService.getFaculty();
      const facObj = facList.find(f => f.user?.email === currentUser.email) || facList[0];
      
      if (facObj) {
        const history = await salaryService.getFacultySalaryHistory(facObj.id);
        setPersonalHistory(history);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSalaries();
  }, [selectedMonth, selectedYear]);

  // Bulk Generation Wizard Submit
  const handleBulkGenerate = async () => {
    setWizardLoading(true);
    const res = await salaryService.generateBulkSalary(selectedMonth, selectedYear);
    setWizardLoading(false);
    setIsWizardOpen(false);
    
    if (res.success) {
      setAlert({
        type: 'success',
        message: `${res.message} Generated: ${res.generatedCount}, Skipped: ${res.skippedCount}.`
      });
      loadSalaries();
      setTimeout(() => setAlert(null), 4000);
    }
  };

  // Adjustments Form Submit (Realtime previews update on input changes)
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustRecord) return;

    const res = await salaryService.updateSalaryRecord(adjustRecord.id, {
      deductions: adjustDeductions,
      bonus: adjustBonus,
      remarks: adjustRemarks
    });

    if (res.success) {
      setAlert({ type: 'success', message: 'Salary adjustments saved successfully.' });
      setIsAdjustOpen(false);
      setAdjustRecord(null);
      loadSalaries();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Mark as Paid Submit
  const handleMarkPaidSubmit = async () => {
    if (!payRecord) return;

    const res = await salaryService.markSalaryPaid(payRecord.id);
    if (res.success) {
      setAlert({ type: 'success', message: 'Salary payout logged successfully.' });
      setIsPayOpen(false);
      setPayRecord(null);
      loadSalaries();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Define Admin Payroll Table Headers
  const adminHeaders = [
    { 
      key: 'employeeCode', 
      label: 'Faculty Code', 
      sortable: true,
      render: (row) => row.faculty?.employeeCode || 'N/A'
    },
    { 
      key: 'facultyName', 
      label: 'Full Name', 
      sortable: true,
      render: (row) => row.faculty?.user?.name || 'N/A'
    },
    { 
      key: 'baseSalary', 
      label: 'Base Salary',
      render: (row) => `$${row.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'deductions', 
      label: 'Deductions',
      render: (row) => `$${row.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'bonus', 
      label: 'Bonus',
      render: (row) => `$${row.bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'netSalary', 
      label: 'Net Salary',
      render: (row) => (
        <span className="font-bold text-white">
          ${row.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { 
      key: 'paidAt', 
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border ${
          row.paidAt 
            ? 'bg-status-success/15 border-status-success/30 text-status-success' 
            : 'bg-status-warning/15 border-status-warning/30 text-status-warning'
        }`}>
          {row.paidAt ? 'Paid' : 'Unpaid'}
        </span>
      )
    }
  ];

  // Define Faculty Personal History Table Headers
  const facultyHeaders = [
    { 
      key: 'monthYear', 
      label: 'Pay Period',
      render: (row) => `${months.find(m => Number(m.value) === row.month)?.label} ${row.year}`
    },
    { 
      key: 'baseSalary', 
      label: 'Base Salary',
      render: (row) => `$${row.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'deductions', 
      label: 'Deductions',
      render: (row) => `$${row.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'bonus', 
      label: 'Bonus',
      render: (row) => `$${row.bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'netSalary', 
      label: 'Net Salary',
      render: (row) => (
        <span className="font-bold text-brand-light">
          ${row.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { 
      key: 'paidAt', 
      label: 'Pay Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
          row.paidAt 
            ? 'bg-status-success/15 text-status-success' 
            : 'bg-status-warning/15 text-status-warning'
        }`}>
          {row.paidAt ? 'Paid' : 'Processing'}
        </span>
      )
    },
    { 
      key: 'paidAtDate', 
      label: 'Paid Date',
      render: (row) => row.paidAt ? new Date(row.paidAt).toLocaleDateString() : '—'
    }
  ];

  // Admin Actions Row Cell Renders
  const adminActions = (row) => {
    const isPaid = !!row.paidAt;
    return (
      <div className="flex gap-2 justify-end">
        {!isPaid ? (
          <>
            <button
              onClick={() => {
                setAdjustRecord(row);
                setAdjustDeductions(row.deductions);
                setAdjustBonus(row.bonus);
                setAdjustRemarks(row.remarks || '');
                setIsAdjustOpen(true);
              }}
              className="px-2 py-1 rounded bg-bg-surfaceLight hover:bg-slate-600 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1 border border-slate-700/50"
              title="Configure Adjustments"
            >
              <Edit size={13} />
              <span>Adjust</span>
            </button>
            <button
              onClick={() => {
                setPayRecord(row);
                setIsPayOpen(true);
              }}
              className="px-2 py-1 rounded bg-brand/10 hover:bg-brand text-xs text-brand-light hover:text-white transition-all flex items-center gap-1 border border-brand/20"
              title="Mark Paid"
            >
              <CreditCard size={13} />
              <span>Pay</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500 font-medium italic pr-2">Locked</span>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Payroll Ledger
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              {isAdmin 
                ? 'Generate monthly faculty salaries, apply deduction/bonus adjustments, and authorize payouts.' 
                : 'Review your payroll histories details, bonuses, deductions, and salary disbursement logs.'
              }
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2"
            >
              <DollarSign size={16} />
              <span>Bulk Generation Wizard</span>
            </Button>
          )}
        </div>

        {/* Alerts toast */}
        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* VIEWPORT: ADMIN PAYROLL CONTROLS */}
        {/* ------------------------------------------------ */}
        {isAdmin && (
          <>
            {/* Filters Box */}
            <div className="glass-card flex flex-wrap gap-4 items-end max-w-lg">
              <Select
                label="Select Month"
                name="salMonth"
                options={months}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder={null}
                className="w-40"
              />

              <Select
                label="Select Year"
                name="salYear"
                options={years}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder={null}
                className="w-32"
              />
            </div>

            {/* Payroll Table */}
            <Table
              headers={adminHeaders}
              data={salaryRecords}
              loading={loading}
              actions={adminActions}
              emptyMessage="No salary records generated for this pay period. Use the Wizard above to compute records."
            />
          </>
        )}

        {/* ------------------------------------------------ */}
        {/* VIEWPORT: FACULTY PERSONAL HISTORY */}
        {/* ------------------------------------------------ */}
        {!isAdmin && (
          <Table
            headers={facultyHeaders}
            data={personalHistory}
            loading={loading}
            emptyMessage="No salary history records logged for your profile."
          />
        )}

        {/* Wizard Confirmation Modal */}
        <Modal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          title="Payroll Generation Wizard"
        >
          <div className="flex flex-col gap-4 text-slate-300 text-sm">
            <div className="flex gap-2.5 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-status-warning text-xs">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Confirm Bulk Run</p>
                <p className="opacity-90 mt-0.5">This action initiates salary calculations for all active faculty members for the selected pay period.</p>
              </div>
            </div>

            <p>
              Are you sure you want to generate salary records for <strong className="text-white">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</strong>?
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
              <li>Queries faculty calendar attendance logs automatically.</li>
              <li>Calculates monthly deductions based on duty aggregates.</li>
              <li>Preserves existing custom adjustments notes where records already exist.</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
              <Button variant="outline" onClick={() => setIsWizardOpen(false)} disabled={wizardLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBulkGenerate} loading={wizardLoading}>
                Initiate Run
              </Button>
            </div>
          </div>
        </Modal>

        {/* Adjustments Configurations Modal */}
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => {
            setIsAdjustOpen(false);
            setAdjustRecord(null);
          }}
          title={adjustRecord ? `Payroll Adjustments — ${adjustRecord.faculty?.user?.name}` : ''}
        >
          {adjustRecord && (
            <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-bg-deep/40 border border-slate-700/30 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Base Salary</span>
                  <span className="font-semibold text-slate-300">${adjustRecord.baseSalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Realtime Net Salary Preview</span>
                  <span className="font-bold text-white text-sm">
                    ${(adjustRecord.baseSalary - parseFloat(adjustDeductions || 0) + parseFloat(adjustBonus || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Deductions ($)"
                  name="adjustDeductions"
                  type="number"
                  placeholder="0.00"
                  value={adjustDeductions}
                  onChange={(e) => setAdjustDeductions(e.target.value)}
                  required
                />
                <Input
                  label="Bonus ($)"
                  name="adjustBonus"
                  type="number"
                  placeholder="0.00"
                  value={adjustBonus}
                  onChange={(e) => setAdjustBonus(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="adjustRemarks" className="text-sm font-medium text-slate-300">
                  Adjustment Remarks / Reasons
                </label>
                <textarea
                  id="adjustRemarks"
                  rows={2}
                  placeholder="E.g., Attendance deduction override, performance bonus logged."
                  value={adjustRemarks}
                  onChange={(e) => setAdjustRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsAdjustOpen(false);
                    setAdjustRecord(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Adjustments
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Payout Confirmation Modal */}
        <Modal
          isOpen={isPayOpen}
          onClose={() => {
            setIsPayOpen(false);
            setPayRecord(null);
          }}
          title="Confirm Payout Transaction"
        >
          {payRecord && (
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <div className="p-3.5 rounded-lg bg-brand/10 border border-brand/20 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Payout Amount</span>
                <span className="text-2xl font-black text-white font-heading">${payRecord.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-slate-400 mt-1">Beneficiary: {payRecord.faculty?.user?.name} ({payRecord.faculty?.employeeCode})</span>
              </div>

              <p>
                Confirming this logs the payout transaction under your Administrator profile ID, signs the voucher with a server timestamp, and locks the payroll line.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPayOpen(false);
                    setPayRecord(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleMarkPaidSubmit} className="flex items-center gap-1.5">
                  <CheckCircle size={15} />
                  <span>Confirm Payout</span>
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default SalaryPage;
