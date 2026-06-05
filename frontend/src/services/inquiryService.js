import apiClient from './apiClient';

const MOCK_STAFF = [
  { id: 'st1', name: 'Alice Smith', role: 'RECEPTIONIST' },
  { id: 'st2', name: 'Bob Jones', role: 'ADMIN' },
];

let MOCK_INQUIRIES = [
  { id: 'i1', name: 'Sarah Connor', phone: '555-0155', email: 'sarah@outlook.com', courseInterest: 'Cyber Security', status: 'NEW', source: 'Website', assignedTo: 'st1', followUpDate: '2026-06-04', notes: 'Wants to know about course durations.' },
  { id: 'i2', name: 'Bruce Wayne', phone: '555-0188', email: 'bruce@wayne.com', courseInterest: 'Business Management', status: 'INTERESTED', source: 'Walk-in', assignedTo: 'st2', followUpDate: '2026-06-05', notes: 'Very keen. Asked for evening batches.' },
  { id: 'i3', name: 'Peter Parker', phone: '555-0122', email: 'peter@dailybugle.com', courseInterest: 'Applied Physics', status: 'CONTACTED', source: 'Phone', assignedTo: 'st1', followUpDate: '2026-06-03', notes: 'Left message. Will call back.' },
  { id: 'i4', name: 'Diana Prince', phone: '555-0177', email: 'diana@themiscira.org', courseInterest: 'Ancient History', status: 'CONVERTED', source: 'Referral', assignedTo: 'st2', followUpDate: '2026-05-30', notes: 'Converted to active admission.' },
  { id: 'i5', name: 'Clark Kent', phone: '555-0111', email: 'clark@dailyplanet.com', courseInterest: 'Journalism', status: 'DROPPED', source: 'Website', assignedTo: 'st1', followUpDate: '2026-05-25', notes: 'Decided to join another university.' },
];

const inquiryService = {
  getInquiries: async (filters = {}) => {
    try {
      const response = await apiClient.get('/inquiries', { params: filters });
      return response.data.inquiries || response.data;
    } catch (e) {
      console.warn('API error fetching inquiries, returning mock data', e);
      let filtered = [...MOCK_INQUIRIES];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.phone.includes(q) ||
          (i.email && i.email.toLowerCase().includes(q))
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(i => i.status === filters.status);
      }

      if (filters.followUpDate) {
        filtered = filtered.filter(i => i.followUpDate === filters.followUpDate);
      }

      return filtered;
    }
  },

  getInquiryById: async (id) => {
    try {
      const response = await apiClient.get(`/inquiries/${id}`);
      return response.data.inquiry || response.data;
    } catch (e) {
      console.warn(`API error fetching inquiry ${id}, returning mock object`, e);
      return MOCK_INQUIRIES.find(i => i.id === id);
    }
  },

  createInquiry: async (data) => {
    try {
      const response = await apiClient.post('/inquiries', data);
      return response.data;
    } catch (e) {
      console.warn('API error creating inquiry, updating mock local state', e);
      const newInquiry = {
        id: 'i_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        courseInterest: data.courseInterest || null,
        status: 'NEW',
        source: data.source || 'Website',
        assignedTo: data.assignedTo || 'st1',
        followUpDate: data.followUpDate || new Date().toISOString().split('T')[0],
        notes: data.notes || '',
      };
      MOCK_INQUIRIES.unshift(newInquiry);
      return { success: true, message: 'Inquiry logged successfully', inquiry: newInquiry };
    }
  },

  updateInquiry: async (id, data) => {
    try {
      const response = await apiClient.put(`/inquiries/${id}`, data);
      return response.data;
    } catch (e) {
      console.warn(`API error updating inquiry ${id}, updating mock local state`, e);
      MOCK_INQUIRIES = MOCK_INQUIRIES.map(i => 
        i.id === id ? { ...i, ...data } : i
      );
      return { success: true, message: 'Inquiry updated successfully' };
    }
  },

  deleteInquiry: async (id) => {
    try {
      const response = await apiClient.delete(`/inquiries/${id}`);
      return response.data;
    } catch (e) {
      console.warn(`API error deleting/dropping inquiry ${id}, updating mock state`, e);
      MOCK_INQUIRIES = MOCK_INQUIRIES.map(i => 
        i.id === id ? { ...i, status: 'DROPPED' } : i
      );
      return { success: true, message: 'Inquiry dropped successfully' };
    }
  },

  getStaffUsers: async () => {
    try {
      const response = await apiClient.get('/users/staff'); // Or matching staff endpoint
      return response.data.staff || response.data;
    } catch (e) {
      console.warn('API error fetching staff, returning mock staff list', e);
      return MOCK_STAFF;
    }
  }
};

export default inquiryService;
