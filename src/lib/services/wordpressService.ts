import api from '../api';

export const wordpressService = {
  async publishBlog(blogId: string) {
    const response = await api.post(`/wordpress/publish/${blogId}`);
    return response.data;
  },

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/wordpress/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.media;
  },

  async getPost(id: number) {
    const response = await api.get(`/wordpress/posts/${id}`);
    return response.data.post;
  },

  async getAllPosts() {
    const response = await api.get('/wordpress/posts');
    return response.data;
  },
};
