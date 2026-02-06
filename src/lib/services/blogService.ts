import api from '../api';

export interface Blog {
  _id: string;
  submissionId: string | {
    _id: string;
    title: string;
    description: string;
    attachments: string[];
  };
  title: string;
  content: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  seoKeywords: string[];
  readingTime: number;
  status: 'draft_created' | 'review' | 'approved_school' | 'published_wp';
  assignedSchool?: string | { _id: string; name: string; city: string };
  createdBy: string;
  wordpressPostId?: number;
  wordpressUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const blogService = {
  async getAll(params?: { status?: string; schoolId?: string }) {
    const response = await api.get('/blogs', { params });
    return response;
  },

  async getById(id: string) {
    const response = await api.get(`/blogs/${id}`);
    return response;
  },

  async update(id: string, data: Partial<Blog>) {
    const response = await api.put(`/blogs/${id}`, data);
    return response;
  },

  async assignToSchool(blogId: string, schoolId: string) {
    const response = await api.post(`/blogs/assign/${schoolId}/${blogId}`);
    return response;
  },

  async review(id: string, data: Partial<Blog>) {
    const response = await api.put(`/blogs/review/${id}`, data);
    return response;
  },

  async delete(id: string) {
    const response = await api.delete(`/blogs/${id}`);
    return response;
  },

  async uploadImage(id: string, formData: FormData) {
    const response = await api.post(`/blogs/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
};
