import api from './api';
import { LoginCredentials, SignupData, ApiResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async signup(data: SignupData): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
