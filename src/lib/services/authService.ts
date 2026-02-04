import api from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'writer' | 'school' | 'marketer';
  schoolId?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'writer' | 'school' | 'marketer';
  schoolId?: string;
  schoolName?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterData) {
    // Remove undefined schoolId to avoid validation errors
    const payload: Partial<RegisterData> & { name: string; email: string; password: string; role: string } = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    };
    
    // Include schoolName for new schools or schoolId for existing schools
    if (data.role === 'school') {
      if (data.schoolName) {
        payload.schoolName = data.schoolName;
      } else if (data.schoolId) {
        payload.schoolId = data.schoolId;
      }
    }
    
    const response = await api.post('/auth/register', payload);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
