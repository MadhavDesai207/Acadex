import apiClient from './apiClient';

// Mock datasets for fallbacks during development
const MOCK_COURSES = [
  { id: 'c1', name: 'Computer Science', code: 'CS' },
  { id: 'c2', name: 'Information Technology', code: 'IT' },
  { id: 'c3', name: 'Bio-Science', code: 'BS' },
];

const MOCK_BATCHES = [
  { id: 'b1', name: 'Batch 2026-A', courseId: 'c1' },
  { id: 'b2', name: 'Batch 2026-B', courseId: 'c1' },
  { id: 'b3', name: 'Batch 2026-C', courseId: 'c2' },
  { id: 'b4', name: 'Batch 2026-D', courseId: 'c3' },
];

let MOCK_STUDENTS = [
  { id: 's1', rollNumber: 'STUD001', user: { name: 'Sarah Connor', email: 'sarah@eduerp.com' }, course: { name: 'Computer Science' }, batch: { name: 'Batch 2026-A' }, enrolledAt: '2026-01-15', isActive: true },
  { id: 's2', rollNumber: 'STUD002', user: { name: 'Bruce Wayne', email: 'bruce@eduerp.com' }, course: { name: 'Computer Science' }, batch: { name: 'Batch 2026-A' }, enrolledAt: '2026-01-20', isActive: true },
  { id: 's3', rollNumber: 'STUD003', user: { name: 'Peter Parker', email: 'peter@eduerp.com' }, course: { name: 'Information Technology' }, batch: { name: 'Batch 2026-C' }, enrolledAt: '2026-02-10', isActive: false },
  { id: 's4', rollNumber: 'STUD004', user: { name: 'Clark Kent', email: 'clark@eduerp.com' }, course: { name: 'Bio-Science' }, batch: { name: 'Batch 2026-D' }, enrolledAt: '2026-02-15', isActive: true },
];

const studentService = {
  getStudents: async (filters = {}) => {
    try {
      const response = await apiClient.get('/students', { params: filters });
      return response.data.students || response.data;
    } catch (e) {
      console.warn('API error fetching students, returning mock data', e);
      let filtered = [...MOCK_STUDENTS];
      
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.user.name.toLowerCase().includes(q) || 
          s.rollNumber.toLowerCase().includes(q) ||
          s.user.email.toLowerCase().includes(q)
        );
      }
      
      if (filters.courseId) {
        const course = MOCK_COURSES.find(c => c.id === filters.courseId);
        if (course) {
          filtered = filtered.filter(s => s.course.name === course.name);
        }
      }
      
      if (filters.batchId) {
        const batch = MOCK_BATCHES.find(b => b.id === filters.batchId);
        if (batch) {
          filtered = filtered.filter(s => s.batch.name === batch.name);
        }
      }
      
      if (filters.status !== undefined && filters.status !== '') {
        const active = filters.status === 'active';
        filtered = filtered.filter(s => s.isActive === active);
      }
      
      return filtered;
    }
  },

  getCourses: async () => {
    try {
      const response = await apiClient.get('/courses');
      return response.data.courses || response.data;
    } catch (e) {
      console.warn('API error fetching courses, returning mock data', e);
      return MOCK_COURSES;
    }
  },

  getBatches: async (courseId = null) => {
    try {
      const response = await apiClient.get('/batches', { params: { courseId } });
      return response.data.batches || response.data;
    } catch (e) {
      console.warn('API error fetching batches, returning mock data', e);
      if (courseId) {
        return MOCK_BATCHES.filter(b => b.courseId === courseId);
      }
      return MOCK_BATCHES;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (e) {
      console.warn(`API error deleting student ${id}, updating mock local state`, e);
      MOCK_STUDENTS = MOCK_STUDENTS.map(s => s.id === id ? { ...s, isActive: false } : s);
      return { success: true, message: 'Student deactivated successfully' };
    }
  },

  toggleStudentStatus: async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/students/${id}/toggle-status`, { isActive });
      return response.data;
    } catch (e) {
      console.warn(`API error toggling student status ${id}, updating mock state`, e);
      MOCK_STUDENTS = MOCK_STUDENTS.map(s => s.id === id ? { ...s, isActive } : s);
      return { success: true, message: 'Student status updated successfully' };
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data;
    } catch (e) {
      console.warn('API error creating student, adding to local mock data', e);
      const newId = 's_' + Math.random().toString(36).substr(2, 9);
      const newRoll = 'STUD' + String(MOCK_STUDENTS.length + 1).padStart(3, '0');
      
      const course = MOCK_COURSES.find(c => c.id === studentData.courseId) || { name: 'Computer Science' };
      const batch = MOCK_BATCHES.find(b => b.id === studentData.batchId) || { name: 'Batch 2026-A' };
      
      const newStudent = {
        id: newId,
        rollNumber: newRoll,
        user: {
          name: studentData.name,
          email: studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, '')}@eduerp.com`,
        },
        course: { name: course.name },
        batch: { name: batch.name },
        enrolledAt: new Date().toISOString().split('T')[0],
        isActive: true
      };
      
      MOCK_STUDENTS.push(newStudent);
      return { success: true, message: 'Student registered successfully', student: newStudent };
    }
  }
};

export default studentService;
