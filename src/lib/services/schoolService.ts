import api from '../api';

export interface School {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  isActive: boolean;
  logo?: string;
  website?: string;
}

export const schoolService = {
  async getAll() {
    const response = await api.get('/schools');
    return response.data.schools;
  },

  async getById(id: string) {
    const response = await api.get(`/schools/${id}`);
    return response.data.school;
  },

  async create(data: Partial<School>) {
    const response = await api.post('/schools', data);
    return response.data.school;
  },

  async update(id: string, data: Partial<School>) {
    const response = await api.put(`/schools/${id}`, data);
    return response.data.school;
  },

  async delete(id: string) {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },
};
