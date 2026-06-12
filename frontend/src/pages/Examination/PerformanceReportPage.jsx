import React, { useState, useEffect } from 'react';
import { Printer, Filter } from 'lucide-react';
import Button from '../../components/Button';
import Select from '../../components/Select';
import ResultStatusBadge from '../../components/ResultStatusBadge';
import ExamTypeBadge from '../../components/ExamTypeBadge';
import analyticsService from '../../services/analyticsService';
import apiClient from '../../services/apiClient';

const PerformanceReportPage = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [exams, setExams] = useState([]);
  // enriched results: flat result + .exam attached
  const [results, setResults] = useState([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    apiClient.get('/courses').then((r) => {
      const list = r.data.data || r.data.courses || r.data || [];
      setCourses(Array.isArray(list) ? list.filter((c) => c.isActive !== false) : []);
    });
  }, []);

  useEffect(() => {
    if (!filterCourse) {
      setBatches([]);
      setExams([]);
      setFilterBatch('');
      setFilterExam('');
      setGenerated(false);
      return;
    }

    Promise.all([
      apiClient.get('/batches', { params: { courseId: filterCourse } }),
      analyticsService.getExams({ courseId: filterCourse })
    ]).then(([bRes, eData]) => {
      const bList = bRes.data.data || bRes.data || [];
      const eList = Array.isArray(eData) ? eData : [];
      setBatches(Array.isArray(bList) ? bList.filter((b) => b.isActive !== false) : []);
      setExams(eList);
    });

    setFilterBatch('');
    setFilterExam('');
    setGenerated(false);
  }, [filterCourse]);

  const handleGenerate = async () => {
    if (!filterCourse) return;
    setLoading(true);

    // Determine which exams to pull results for
    let targetExams = exams;
    if (filterExam) {
      targetExams = exams.filter((e) => e.id === filterExam);
    }
    if (filterBatch) {
      targetExams = targetExams.filter((e) => !e.batchId || e.batchId === filterBatch);
    }

    const resultsPerExam = await analyticsService.getResultsForExams(targetExams.map((e) => e.id));

    const enriched = targetExams.flatMap((exam, i) =>
      (resultsPerExam[i] || []).map((r) => ({ ...r, exam }))
    );

    setResults(enriched);
    setLoading(false);
    setGenerated(true);
  };

  const selectedCourse = courses.find((c) => c.id === filterCourse);
  const selectedBatch = batches.find((b) => b.id === filterBatch);
  const selectedExam = exams.find((e) => e.id === filterExam);

  const totalPassed = results.filter((r) => r.status === 'PASS').length;
  const avgScore = results.length > 0
    ? Math.round(
        results.reduce((sum, r) => {
          const pct = r.exam?.totalMarks ? (Number(r.marksObtained) / r.exam.totalMarks) * 100 : 0;
          return sum + pct;
        }, 0) / results.length
      )
    : 0;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm 15mm; }
          *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; font-size: 11px; }
          aside, nav, header, .print\\:hidden { display: none !important; }
          main, [class*="ml-"], [class*="pl-"] { margin-left: 0 !important; padding-left: 0 !important; }
          .overflow-x-auto { overflow: visible !important; }
          table { page-break-inside: auto; width: 100% !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `}</style>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">Performance Report</h1>
            <p className="text-xs text-slate-400">Generate and print student exam performance reports.</p>
          </div>
          {generated && results.length > 0 && (
            <Button variant="secondary" onClick={() => window.print()} className="flex items-center gap-2 print:hidden">
              <Printer size={16} /> Print Report
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="glass-card flex flex-col md:flex-row gap-4 items-end print:hidden">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-sm font-medium text-slate-300">Course *</label>
            <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-sm font-medium text-slate-300">Batch</label>
            <Select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} disabled={!filterCourse}>
              <option value="">All Batches</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-sm font-medium text-slate-300">Exam</label>
            <Select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} disabled={!filterCourse}>
              <option value="">All Exams</option>
              {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </Select>
          </div>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!filterCourse}
            loading={loading}
            className="flex items-center gap-2 shrink-0"
          >
            <Filter size={15} /> Generate
          </Button>
        </div>

        {generated && (
          <div className="glass-card flex flex-col gap-6 print:shadow-none print:bg-white">
            {/* Report Header */}
            <div className="flex flex-col gap-1 border-b border-slate-700 pb-4 print:border-gray-300">
              <p className="text-lg font-extrabold text-white print:text-black">Performance Report</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 print:text-gray-600">
                {selectedCourse && (
                  <span>Course: <strong className="text-slate-200 print:text-black">{selectedCourse.name}</strong></span>
                )}
                {selectedBatch && (
                  <span>Batch: <strong className="text-slate-200 print:text-black">{selectedBatch.name}</strong></span>
                )}
                {selectedExam && (
                  <span>Exam: <strong className="text-slate-200 print:text-black">{selectedExam.title}</strong></span>
                )}
                <span>Generated: <strong className="text-slate-200 print:text-black">{new Date().toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Students', value: results.length },
                { label: 'Passed', value: totalPassed },
                { label: 'Avg Score', value: `${avgScore}%` }
              ].map(({ label, value }) => (
                <div key={label} className="bg-bg-deep/40 rounded-lg px-4 py-3 text-center print:border print:border-gray-200">
                  <p className="text-xl font-extrabold text-white print:text-black">{value}</p>
                  <p className="text-xs text-slate-400 print:text-gray-600">{label}</p>
                </div>
              ))}
            </div>

            {/* Results Table */}
            {results.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No results found for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60 print:border-gray-300">
                      {['#', 'Student', 'Roll No', 'Exam', 'Type', 'Date', 'Marks', 'Total', '%', 'Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider print:text-gray-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                    {results.map((r, idx) => {
                      const pct = r.exam?.totalMarks
                        ? Math.round((Number(r.marksObtained) / r.exam.totalMarks) * 100)
                        : '—';
                      return (
                        <tr key={`${r.examId}-${r.studentId}`} className="hover:bg-bg-surfaceLight/20 transition-colors print:hover:bg-transparent">
                          <td className="px-3 py-2 text-slate-500 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 text-white font-medium print:text-black">{r.studentName || '—'}</td>
                          <td className="px-3 py-2 text-slate-400 text-xs font-mono">{r.rollNumber || '—'}</td>
                          <td className="px-3 py-2 text-slate-300 max-w-[160px] truncate print:text-gray-700 print:max-w-none print:whitespace-normal">{r.exam?.title || '—'}</td>
                          <td className="px-3 py-2"><ExamTypeBadge type={r.exam?.examType} /></td>
                          <td className="px-3 py-2 text-slate-400 text-xs whitespace-nowrap">
                            {r.exam?.examDate ? new Date(r.exam.examDate).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-3 py-2 text-white font-bold print:text-black">{Number(r.marksObtained)}</td>
                          <td className="px-3 py-2 text-slate-400">{r.exam?.totalMarks ?? '—'}</td>
                          <td className="px-3 py-2 text-slate-300 print:text-gray-700">{pct !== '—' ? `${pct}%` : '—'}</td>
                          <td className="px-3 py-2"><ResultStatusBadge status={r.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PerformanceReportPage;
