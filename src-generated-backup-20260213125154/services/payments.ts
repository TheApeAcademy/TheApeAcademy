import api from './api';
import { Payment, PaymentInitiation, ApiResponse, FlutterwaveResponse } from '../types';

export const paymentService = {
  async initiatePayment(data: PaymentInitiation): Promise<ApiResponse<{ authorization_url: string; access_code: string; reference: string }>> {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },

  async verifyPayment(transactionRef: string): Promise<ApiResponse<Payment>> {
    const response = await api.post('/payments/verify', { transactionRef });
    return response.data;
  },

  async completePayment(transactionRef: string, flutterwaveTransactionId: string): Promise<ApiResponse<Payment>> {
    const response = await api.post('/payments/complete', {
      transactionRef,
      flutterwaveTransactionId,
    });
    return response.data;
  },

  async getPaymentHistory(): Promise<ApiResponse<Payment[]>> {
    const response = await api.get('/payments/my');
    return response.data;
  },

  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async retryPayment(paymentId: string): Promise<ApiResponse<{ authorization_url: string; access_code: string; reference: string }>> {
    const response = await api.post(`/payments/${paymentId}/retry`, {});
    return response.data;
  },
};
