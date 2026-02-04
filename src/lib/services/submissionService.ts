import api from '../api';

export interface Submission {
  _id: string;
  schoolId: string;
  title: string;
  description: string;
  category: 'news' | 'achievement' | 'event' | 'announcement' | 'other';
  attachments: string[];
  status: 'submitted_school' | 'draft_created' | 'review' | 'published_wp';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const submissionService = {
  async getAll(params?: { status?: string; schoolId?: string }) {
    const response = await api.get('/submissions', { params });
    return response;
  },

  async getById(id: string) {
    const response = await api.get(`/submissions/${id}`);
    return response;
  },

  async create(formData: FormData) {
    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async update(id: string, data: { status?: string; assignedTo?: string }) {
    const response = await api.put(`/submissions/${id}`, data);
    return response;
  },

  async delete(id: string) {
    const response = await api.delete(`/submissions/${id}`);
    return response;
  },
};
