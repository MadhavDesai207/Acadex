import apiClient from './apiClient';

let MOCK_ADMISSIONS = [
  { id: 'ad1', studentName: 'Diana Prince', phone: '555-0177', email: 'diana@themiscira.org', courseId: 'c1', status: 'UNDER_REVIEW', reviewer: 'Bob Jones', appliedAt: '2026-06-03T10:00:00Z', inquiryId: 'i4', remarks: '' },
  { id: 'ad2', studentName: 'Tony Stark', phone: '555-0199', email: 'tony@stark.com', courseId: 'c2', status: 'APPLIED', reviewer: null, appliedAt: '2026-06-02T11:30:00Z', inquiryId: null, remarks: '' },
  { id: 'ad3', studentName: 'Clark Kent', phone: '555-0111', email: 'clark@dailyplanet.com', courseId: 'c3', status: 'APPROVED', reviewer: 'Bob Jones', appliedAt: '2026-05-31T09:15:00Z', inquiryId: 'i5', remarks: 'Academic criteria met.' },
  { id: 'ad4', studentName: 'Bruce Wayne', phone: '555-0188', email: 'bruce@wayne.com', courseId: 'c1', status: 'ENROLLED', reviewer: 'Bob Jones', appliedAt: '2026-05-20T14:20:00Z', inquiryId: 'i2', remarks: 'Enrolled under roll number STUD002.' },
  { id: 'ad5', studentName: 'Lex Luthor', phone: '555-0100', email: 'lex@lexcorp.com', courseId: 'c1', status: 'REJECTED', reviewer: 'Bob Jones', appliedAt: '2026-05-18T16:45:00Z', inquiryId: null, remarks: 'Background verification failed.' }
];

const admissionService = {
  getAdmissions: async (filters = {}) => {
    try {
      const response = await apiClient.get('/admissions', { params: filters });
      return response.data.admissions || response.data;
    } catch (e) {
      console.warn('API error fetching admissions, returning mock data', e);
      let filtered = [...MOCK_ADMISSIONS];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(a => 
          a.studentName.toLowerCase().includes(q) || 
          a.phone.includes(q) ||
          (a.email && a.email.toLowerCase().includes(q))
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(a => a.status === filters.status);
      }

      return filtered;
    }
  },

  getAdmissionById: async (id) => {
    try {
      const response = await apiClient.get(`/admissions/${id}`);
      return response.data.admission || response.data;
    } catch (e) {
      console.warn(`API error fetching admission ${id}, returning mock object`, e);
      return MOCK_ADMISSIONS.find(a => a.id === id);
    }
  },

  createAdmission: async (data) => {
    try {
      const response = await apiClient.post('/admissions', data);
      return response.data;
    } catch (e) {
      console.warn('API error creating admission, updating mock local state', e);
      const newApp = {
        id: 'ad_' + Math.random().toString(36).substr(2, 9),
        studentName: data.studentName,
        phone: data.phone,
        email: data.email || null,
        courseId: data.courseId,
        status: 'APPLIED',
        reviewer: null,
        appliedAt: new Date().toISOString(),
        inquiryId: data.inquiryId || null,
        remarks: ''
      };
      MOCK_ADMISSIONS.unshift(newApp);
      return { success: true, message: 'Admission application logged successfully', admission: newApp };
    }
  },

  updateAdmissionStatus: async (id, status, remarks) => {
    try {
      const response = await apiClient.patch(`/admissions/${id}/status`, { status, remarks });
      return response.data;
    } catch (e) {
      console.warn(`API error updating admission status ${id}, updating mock state`, e);
      MOCK_ADMISSIONS = MOCK_ADMISSIONS.map(a => 
        a.id === id ? { ...a, status, remarks, reviewer: 'Active Administrator' } : a
      );
      return { success: true, message: `Application ${status.toLowerCase()} successfully.` };
    }
  },

  enrollAdmission: async (id, batchId) => {
    try {
      const response = await apiClient.post(`/admissions/${id}/enroll`, { batchId });
      return response.data;
    } catch (e) {
      console.warn(`API error enrolling admission ${id}, updating mock state`, e);
      MOCK_ADMISSIONS = MOCK_ADMISSIONS.map(a => 
        a.id === id ? { ...a, status: 'ENROLLED', remarks: `Enrolled to batch ${batchId}` } : a
      );
      return { success: true, message: 'Applicant enrolled as student successfully.' };
    }
  }
};

export default admissionService;
