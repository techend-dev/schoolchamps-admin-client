import api from '../api';

export interface AdminOverview {
  totalSchools: number;
  totalSubmissions: number;
  totalPublished: number;
  draftsPending: number;
  blogsInReview: number;
}

export const adminService = {
  async getOverview() {
    const response = await api.get('/admin/overview');
    return response;
  },

  async getAllBlogs() {
    const response = await api.get('/admin/blogs');
    return response;
  },

  async updateBlogStatus(blogId: string, status: string) {
    const response = await api.put(`/admin/blogs/${blogId}/status`, { status });
    return response;
  },

  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data.users;
  },

  async toggleUserActive(userId: string) {
    const response = await api.put(`/admin/users/${userId}/toggle-active`);
    return response.data.user;
  },
};
