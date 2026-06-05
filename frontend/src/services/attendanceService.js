import apiClient from './apiClient';

// Simulated database records for development fallbacks
let MOCK_ATTENDANCE = [
  // Dr. Alan Turing (f1) - May 2026
  { id: 'at1', facultyId: 'f1', date: '2026-05-01', status: 'PRESENT', note: '' },
  { id: 'at2', facultyId: 'f1', date: '2026-05-04', status: 'PRESENT', note: '' },
  { id: 'at3', facultyId: 'f1', date: '2026-05-05', status: 'PRESENT', note: '' },
  { id: 'at4', facultyId: 'f1', date: '2026-05-06', status: 'HALF_DAY', note: 'Doctor visit' },
  { id: 'at5', facultyId: 'f1', date: '2026-05-07', status: 'PRESENT', note: '' },
  { id: 'at6', facultyId: 'f1', date: '2026-05-08', status: 'ABSENT', note: 'Car breakdown' },
  { id: 'at7', facultyId: 'f1', date: '2026-05-11', status: 'PRESENT', note: '' },
  { id: 'at8', facultyId: 'f1', date: '2026-05-12', status: 'PRESENT', note: '' },
  { id: 'at9', facultyId: 'f1', date: '2026-05-13', status: 'PRESENT', note: '' },
  { id: 'at10', facultyId: 'f1', date: '2026-05-14', status: 'ON_LEAVE', note: 'Medical leave' },
  
  // Prof. Grace Hopper (f2) - May 2026
  { id: 'at11', facultyId: 'f2', date: '2026-05-01', status: 'PRESENT', note: '' },
  { id: 'at12', facultyId: 'f2', date: '2026-05-04', status: 'PRESENT', note: '' },
  { id: 'at13', facultyId: 'f2', date: '2026-05-05', status: 'PRESENT', note: '' },
  { id: 'at14', facultyId: 'f2', date: '2026-05-06', status: 'PRESENT', note: '' },
  { id: 'at15', facultyId: 'f2', date: '2026-05-07', status: 'PRESENT', note: '' },
  { id: 'at16', facultyId: 'f2', date: '2026-05-08', status: 'PRESENT', note: '' },
];

const attendanceService = {
  markAttendance: async (attendanceData) => {
    // attendanceData: { date, records: [{ facultyId, status, note }] }
    try {
      const response = await apiClient.post('/attendance/faculty', attendanceData);
      return response.data;
    } catch (e) {
      console.warn('API error marking attendance, updating mock local state', e);
      const { date, records } = attendanceData;
      
      // Update or insert records in mock database
      records.forEach(rec => {
        const existingIdx = MOCK_ATTENDANCE.findIndex(a => a.facultyId === rec.facultyId && a.date === date);
        if (existingIdx !== -1) {
          MOCK_ATTENDANCE[existingIdx] = {
            ...MOCK_ATTENDANCE[existingIdx],
            status: rec.status,
            note: rec.note || ''
          };
        } else {
          MOCK_ATTENDANCE.push({
            id: 'at_' + Math.random().toString(36).substr(2, 9),
            facultyId: rec.facultyId,
            date,
            status: rec.status,
            note: rec.note || ''
          });
        }
      });

      return { success: true, message: 'Daily attendance logs updated successfully.' };
    }
  },

  getAttendanceList: async (filters = {}) => {
    try {
      const response = await apiClient.get('/attendance/faculty', { params: filters });
      return response.data.records || response.data;
    } catch (e) {
      console.warn('API error fetching attendance, returning mock data', e);
      let filtered = [...MOCK_ATTENDANCE];
      if (filters.facultyId) {
        filtered = filtered.filter(a => a.facultyId === filters.facultyId);
      }
      if (filters.date) {
        filtered = filtered.filter(a => a.date === filters.date);
      }
      return filtered;
    }
  },

  getFacultySummary: async (facultyId, month, year) => {
    try {
      const response = await apiClient.get(`/attendance/faculty/${facultyId}/summary`, { params: { month, year } });
      return response.data;
    } catch (e) {
      console.warn(`API error fetching summary for faculty ${facultyId}, calculating from mock database`, e);
      
      // Filter mock records matching facultyId, month, and year
      const records = MOCK_ATTENDANCE.filter(a => {
        const recordDate = new Date(a.date);
        return a.facultyId === facultyId && 
               (recordDate.getMonth() + 1) === Number(month) && 
               recordDate.getFullYear() === Number(year);
      });

      const totals = {
        PRESENT: 0,
        ABSENT: 0,
        HALF_DAY: 0,
        ON_LEAVE: 0
      };

      records.forEach(rec => {
        if (totals[rec.status] !== undefined) {
          totals[rec.status]++;
        }
      });

      const totalCalendarDays = records.length;
      const effectiveDays = totals.PRESENT + (0.5 * totals.HALF_DAY);

      return {
        facultyId,
        month,
        year,
        totalCalendarDays,
        daysPresent: totals.PRESENT,
        daysAbsent: totals.ABSENT,
        halfDays: totals.HALF_DAY,
        leaves: totals.ON_LEAVE,
        effectiveDays,
        records
      };
    }
  }
};

export default attendanceService;
