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

  async generateUnifiedSocialPost(blogId: string) {
    const response = await api.post(`/ai/generate-unified-social/${blogId}`);
    return response;
  },

  async postToSocial(data: { blogId: string; caption: string; hashtags: string[]; platforms: string[] }) {
    const response = await api.post('/ai/post-to-social', data);
    return response;
  },

  // Social Accounts Management
  async getSocialAccountsStatus() {
    const response = await api.get('/ai/social-accounts/status');
    return response;
  },

  async saveFacebookCredentials(accessToken: string, pageId: string) {
    const response = await api.post('/ai/social-accounts/facebook', { accessToken, pageId });
    return response;
  },

  async disconnectSocialAccount(platform: string) {
    const response = await api.delete(`/ai/social-accounts/${platform}`);
    return response;
  },

  async triggerTokenRefresh() {
    const response = await api.post('/ai/token-refresh');
    return response;
  },

  getLinkedInAuthUrl() {
    // This returns the backend URL that redirects to LinkedIn OAuth
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.schoolchamps.in';
    return `${baseUrl}/api/ai/linkedin/auth`;
  },

  async getLinkedInPages() {
    const response = await api.get('/ai/social-accounts/linkedin/pages');
    return response;
  },

  async selectLinkedInPage(orgUrn: string, orgName: string) {
    const response = await api.post('/ai/social-accounts/linkedin/select-page', { orgUrn, orgName });
    return response;
  },
};
