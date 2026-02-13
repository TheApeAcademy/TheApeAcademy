import api from './api';
import { Assignment, CreateAssignmentData, ApiResponse, AssignmentWithFile } from '../types';

export const assignmentService = {
  async createAssignment(formData: FormData): Promise<ApiResponse<Assignment>> {
    const response = await api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyAssignments(status?: string): Promise<ApiResponse<Assignment[]>> {
    const params = status ? { status } : {};
    const response = await api.get('/assignments/my', { params });
    return response.data;
  },

  async getAssignmentById(id: string): Promise<ApiResponse<Assignment>> {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  async updateAssignmentStatus(id: string, status: string): Promise<ApiResponse<Assignment>> {
    const response = await api.patch(`/assignments/${id}`, { status });
    return response.data;
  },

  async deleteAssignment(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  async downloadAssignment(id: string): Promise<void> {
    const response = await api.get(`/assignments/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assignment-${id}.zip`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};
