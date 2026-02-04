import api from '../api';

export interface BlogDraft {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  content: string;
  readingTime: number;
}

export interface SocialPost {
  caption: string;
  hashtags: string[];
}

export const aiService = {
  async generateDraft(submissionId: string) {
    const response = await api.post(`/ai/generate-draft/${submissionId}`);
    return response;
  },

  async generateSocialPost(blogId: string, platform: 'instagram' | 'linkedin' | 'twitter' | 'facebook') {
    const response = await api.post(`/ai/generate-social/${blogId}`, { platform });
    return response;
  },

  async improveContent(content: string, instruction: string) {
    const response = await api.post('/ai/improve-content', { content, instruction });
    return response;
  },
};
