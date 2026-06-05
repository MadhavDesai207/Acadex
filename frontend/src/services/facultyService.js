import apiClient from './apiClient';

let MOCK_FACULTY = [
  { id: 'f1', employeeCode: 'FAC001', user: { name: 'Dr. Alan Turing', email: 'alan@eduerp.com', phone: '555-1001' }, designation: 'Professor', department: 'Computer Science', dateOfJoining: '2022-09-01', qualification: 'Ph.D. in Computer Science', bankAccount: '••••••••1234', baseSalary: 8500.00, isActive: true },
  { id: 'f2', employeeCode: 'FAC002', user: { name: 'Prof. Grace Hopper', email: 'grace@eduerp.com', phone: '555-1002' }, designation: 'Associate Professor', department: 'Information Technology', dateOfJoining: '2023-01-15', qualification: 'Ph.D. in Mathematics', bankAccount: '••••••••5678', baseSalary: 7200.00, isActive: true },
  { id: 'f3', employeeCode: 'FAC003', user: { name: 'Dr. Claude Shannon', email: 'claude@eduerp.com', phone: '555-1003' }, designation: 'Professor', department: 'Computer Science', dateOfJoining: '2023-08-01', qualification: 'Ph.D. in Electrical Eng', bankAccount: '••••••••9012', baseSalary: 9000.00, isActive: false },
  { id: 'f4', employeeCode: 'FAC004', user: { name: 'Prof. Ada Lovelace', email: 'ada@eduerp.com', phone: '555-1004' }, designation: 'Senior Lecturer', department: 'Mathematics', dateOfJoining: '2024-03-01', qualification: 'M.Sc. in Mathematics', bankAccount: '••••••••3456', baseSalary: 6000.00, isActive: true },
];

const facultyService = {
  getFaculty: async (filters = {}) => {
    try {
      const response = await apiClient.get('/faculty', { params: filters });
      return response.data.faculty || response.data;
    } catch (e) {
      console.warn('API error fetching faculty, returning mock data', e);
      let filtered = [...MOCK_FACULTY];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(f => 
          f.user.name.toLowerCase().includes(q) || 
          f.employeeCode.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q)
        );
      }

      return filtered;
    }
  },

  getFacultyById: async (id) => {
    try {
      const response = await apiClient.get(`/faculty/${id}`);
      return response.data.faculty || response.data;
    } catch (e) {
      console.warn(`API error fetching faculty ${id}, returning mock object`, e);
      return MOCK_FACULTY.find(f => f.id === id);
    }
  },

  createFaculty: async (data) => {
    try {
      const response = await apiClient.post('/faculty', data);
      return response.data;
    } catch (e) {
      console.warn('API error creating faculty, updating mock local state', e);
      const newEmpCode = 'FAC' + String(MOCK_FACULTY.length + 1).padStart(3, '0');
      const newFac = {
        id: 'f_' + Math.random().toString(36).substr(2, 9),
        employeeCode: newEmpCode,
        user: {
          name: data.name,
          email: data.email,
          phone: data.phone || null
        },
        designation: data.designation,
        department: data.department || null,
        dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
        qualification: data.qualification || null,
        bankAccount: data.bankAccount ? `••••••••${data.bankAccount.slice(-4)}` : 'N/A',
        baseSalary: parseFloat(data.baseSalary) || 0.00,
        isActive: true
      };
      MOCK_FACULTY.unshift(newFac);
      return { success: true, message: 'Faculty profile logged successfully', faculty: newFac };
    }
  },

  updateFaculty: async (id, data) => {
    try {
      const response = await apiClient.put(`/faculty/${id}`, data);
      return response.data;
    } catch (e) {
      console.warn(`API error updating faculty ${id}, updating mock local state`, e);
      MOCK_FACULTY = MOCK_FACULTY.map(f => 
        f.id === id ? { 
          ...f, 
          designation: data.designation || f.designation,
          department: data.department || f.department,
          qualification: data.qualification || f.qualification,
          baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : f.baseSalary,
          user: {
            ...f.user,
            name: data.name || f.user.name,
            phone: data.phone || f.user.phone,
          }
        } : f
      );
      return { success: true, message: 'Faculty updated successfully' };
    }
  },

  toggleFacultyStatus: async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/faculty/${id}/toggle-status`, { isActive });
      return response.data;
    } catch (e) {
      console.warn(`API error toggling faculty status ${id}, updating mock state`, e);
      MOCK_FACULTY = MOCK_FACULTY.map(f => 
        f.id === id ? { ...f, isActive } : f
      );
      return { success: true, message: 'Faculty status updated successfully' };
    }
  }
};

export default facultyService;
