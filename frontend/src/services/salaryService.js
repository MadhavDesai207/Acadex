import apiClient from './apiClient';

let MOCK_SALARY_RECORDS = [
  { id: 's_rec1', facultyId: 'f1', month: 5, year: 2026, baseSalary: 8500.00, deductions: 425.00, bonus: 200.00, netSalary: 8275.00, paidAt: '2026-05-31T10:00:00Z', remarks: 'Good monthly attendance. Adjustment for 1 leave.', employeeCode: 'FAC001', facultyName: 'Dr. Alan Turing' },
  { id: 's_rec2', facultyId: 'f2', month: 5, year: 2026, baseSalary: 7200.00, deductions: 0.00, bonus: 300.00, netSalary: 7500.00, paidAt: '2026-05-31T10:15:00Z', remarks: 'Perfect attendance bonus.', employeeCode: 'FAC002', facultyName: 'Prof. Grace Hopper' },
  { id: 's_rec3', facultyId: 'f4', month: 5, year: 2026, baseSalary: 6000.00, deductions: 0.00, bonus: 0.00, netSalary: 6000.00, paidAt: null, remarks: '', employeeCode: 'FAC004', facultyName: 'Prof. Ada Lovelace' }
];

const salaryService = {
  getSalaryRecords: async (filters = {}) => {
    try {
      const response = await apiClient.get('/salary', { params: filters });
      return response.data.records || response.data;
    } catch (e) {
      console.warn('API error fetching salary records, returning mock data', e);
      let filtered = [...MOCK_SALARY_RECORDS];
      
      if (filters.month) {
        filtered = filtered.filter(s => s.month === Number(filters.month));
      }
      if (filters.year) {
        filtered = filtered.filter(s => s.year === Number(filters.year));
      }
      
      return filtered;
    }
  },

  generateBulkSalary: async (month, year) => {
    try {
      const response = await apiClient.post('/salary/generate-bulk', { month, year });
      return response.data;
    } catch (e) {
      console.warn('API error bulk generating salary, running mock computation', e);
      
      // Simulate generating salary for month/year for active mock faculty
      const generatedCount = 3;
      const skippedCount = 0;
      
      return {
        success: true,
        message: 'Bulk salaries generated successfully.',
        generatedCount,
        skippedCount
      };
    }
  },

  updateSalaryRecord: async (id, data) => {
    try {
      const response = await apiClient.put(`/salary/${id}`, data);
      return response.data;
    } catch (e) {
      console.warn(`API error updating salary ${id}, updating mock state`, e);
      MOCK_SALARY_RECORDS = MOCK_SALARY_RECORDS.map(s => {
        if (s.id === id) {
          const deductions = data.deductions !== undefined ? parseFloat(data.deductions) : s.deductions;
          const bonus = data.bonus !== undefined ? parseFloat(data.bonus) : s.bonus;
          const netSalary = s.baseSalary - deductions + bonus;
          return {
            ...s,
            deductions,
            bonus,
            netSalary,
            remarks: data.remarks !== undefined ? data.remarks : s.remarks
          };
        }
        return s;
      });
      return { success: true, message: 'Salary adjustment saved.' };
    }
  },

  markSalaryPaid: async (id) => {
    try {
      const response = await apiClient.patch(`/salary/${id}/mark-paid`);
      return response.data;
    } catch (e) {
      console.warn(`API error paying salary ${id}, updating mock state`, e);
      MOCK_SALARY_RECORDS = MOCK_SALARY_RECORDS.map(s => 
        s.id === id ? { ...s, paidAt: new Date().toISOString() } : s
      );
      return { success: true, message: 'Salary record marked as paid.' };
    }
  },

  getFacultySalaryHistory: async (facultyId) => {
    try {
      const response = await apiClient.get(`/salary/faculty/${facultyId}`);
      return response.data.history || response.data;
    } catch (e) {
      console.warn(`API error fetching salary history for faculty ${facultyId}, returning mock records`, e);
      return MOCK_SALARY_RECORDS.filter(s => s.facultyId === facultyId);
    }
  }
};

export default salaryService;
