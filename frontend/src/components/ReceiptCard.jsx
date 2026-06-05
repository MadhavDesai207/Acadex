import React from 'react';

const fmt = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const ReceiptCard = ({ receipt }) => {
  if (!receipt) return null;
  const { receiptNumber, student, payment, installment, feeStructure, collectedBy, remarks, issuedAt } = receipt;

  return (
    <div className="bg-white text-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-auto print:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-indigo-700 tracking-tight">Acadex ERP</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fee Payment Receipt</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Receipt No.</p>
          <p className="text-base font-bold text-indigo-700">{receiptNumber}</p>
        </div>
      </div>

      {/* Student Info */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Student</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">{student?.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Roll No.</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">{student?.rollNumber}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Course</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{student?.course}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Fee Structure</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{feeStructure}</p>
        </div>
      </div>

      {/* Installment Info */}
      {installment && (
        <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Installment</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">{installment.label}</span>
            <span className="text-sm font-bold text-slate-800">{fmt(installment.amount)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Due: {new Date(installment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Payment Details */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-slate-600 font-semibold">Amount Paid</span>
          <span className="text-xl font-extrabold text-indigo-700">{fmt(payment?.amountPaid)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Method: </span>
            <span className="font-semibold text-slate-700">{payment?.paymentMethod?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400">Date: </span>
            <span className="font-semibold text-slate-700">
              {payment?.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
            </span>
          </div>
          {payment?.transactionRef && (
            <div className="col-span-2">
              <span className="text-slate-400">Ref: </span>
              <span className="font-semibold text-slate-700">{payment.transactionRef}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div>
          <p>Collected by: <span className="font-semibold text-slate-700">{collectedBy}</span></p>
          {remarks && <p className="mt-1">Remarks: {remarks}</p>}
        </div>
        <div className="text-right">
          <p>Issued: {issuedAt ? new Date(issuedAt).toLocaleString('en-IN') : '—'}</p>
          <p className="mt-2 text-slate-300">— Authorised Signatory —</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;
