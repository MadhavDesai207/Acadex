import React, { useState } from 'react';
import { Download, Printer } from 'lucide-react';

const ExportButton = ({ data = [], columns = [], filename = 'report', fetchAllForExport }) => {
  const [exporting, setExporting] = useState(false);

  const buildAndDownloadCSV = (rows) => {
    if (!rows.length || !columns.length) {
      alert('No data available to export.');
      return;
    }
    const header = columns.map(c => `"${c.label}"`).join(',');
    const csvRows = rows.map(row =>
      columns.map(c => {
        const val = c.key.split('.').reduce((obj, k) => obj?.[k], row) ?? '';
        const str = String(val);
        // Neutralise CSV formula injection (=, +, -, @)
        const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
        return `"${safe.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    if (exporting) return;
    if (fetchAllForExport) {
      setExporting(true);
      try {
        const allData = await fetchAllForExport();
        buildAndDownloadCSV(allData);
      } catch {
        buildAndDownloadCSV(data);
      } finally {
        setExporting(false);
      }
    } else {
      buildAndDownloadCSV(data);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50 disabled:opacity-50 disabled:cursor-wait"
      >
        <Download size={13} />
        {exporting ? 'Exporting…' : 'Export CSV'}
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50 no-print"
      >
        <Printer size={13} />
        Print
      </button>
    </div>
  );
};

export default ExportButton;
