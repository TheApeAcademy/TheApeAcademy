// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  region: string;
  country: string;
  educationLevel: string;
  departmentOrCourse?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  region: string;
  country: string;
  educationLevel: string;
  departmentOrCourse?: string;
}

// Assignment types
export interface Assignment {
  id: string;
  userId: string;
  subject: string;
  description: string;
  educationLevel: string;
  departmentOrCourse?: string;
  deadline: string;
  fileUrl: string;
  fileName: string;
  deliveryPlatform: 'whatsapp' | 'email' | 'google_messages' | 'imessage';
  paymentId?: string;
  status: 'pending' | 'in_progress' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentData {
  subject: string;
  description: string;
  educationLevel: string;
  departmentOrCourse?: string;
  deadline: string;
  deliveryPlatform: 'whatsapp' | 'email' | 'google_messages' | 'imessage';
}

export interface AssignmentWithFile extends CreateAssignmentData {
  file: File;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  assignmentId?: string;
  amount: number;
  currency: string;
  transactionReference: string;
  flutterwaveTransactionId?: string;
  paymentStatus: 'pending' | 'successful' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiation {
  amount: number;
  currency: string;
  email: string;
  fullName: string;
  assignmentId?: string;
  phoneNumber?: string;
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card: {
      card_pan: string;
      card_type: string;
      card_token: string;
      issuer: string;
      country: string;
      card_checks: {
        avs_check: string;
        cvv_check: string;
      };
      expiry: string;
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
