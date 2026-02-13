# 🎨 Frontend Implementation Guide - React with TypeScript

## Overview

Since your project has pre-built `dist/` but no `src/` (frontend source), you have 3 options:

### Option 1: Use Pre-built Frontend (⚠️ Limited)
- Pros: Works immediately, already built
- Cons: Can't modify UI, add features, or fix bugs

### Option 2: Build New Frontend (Recommended) ✅
- Pros: Customizable, modern stack (React + TypeScript + Tailwind)
- Cons: Takes 6-8 hours for complete build
- Time: 3-4 hours for MVP

### Option 3: Request Original Source
- Contact original developer for React source files
- Merge with your current setup

---

## Option 2: Building the Frontend from Scratch

### Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Assignments/
│   │   ├── AssignmentList.tsx
│   │   ├── SubmitAssignmentForm.tsx
│   │   ├── AssignmentCard.tsx
│   │   └── AssignmentDetails.tsx
│   ├── Payments/
│   │   ├── PaymentModal.tsx
│   │   ├── PaymentCallback.tsx
│   │   └── PaymentStatus.tsx
│   └── Common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Loading.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── SubmitAssignmentPage.tsx
│   ├── PaymentCallbackPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── api.ts          // Axios instance
│   ├── auth.ts         // Auth API calls
│   ├── assignments.ts  // Assignment API calls
│   └── payments.ts     // Payment API calls
├── hooks/
│   ├── useAuth.ts
│   ├── useAssignments.ts
│   └── usePayment.ts
├── context/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── assignment.ts
├── utils/
│   ├── storage.ts      // LocalStorage helpers
│   ├── validators.ts
│   └── formatters.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

---

## Step-by-Step Implementation

### 1. Setup the Frontend Project

The project already has Vite configured. Just create the src/ directory structure:

```bash
# Navigate to project root
cd "Premium Student Assignment Platform"

# Create directory structure
mkdir -p src/components/{Layout,Auth,Assignments,Payments,Common}
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/context
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/styles
```

### 2. Create Type Definitions (src/types/index.ts)

```typescript
// src/types/api.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  region: string;
  country: string;
  educationLevel: string;
  departmentOrCourse?: string;
}

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

export interface Region {
  name: string;
  countries: string[];
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  [key: string]: any;
}

// src/types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  region: string;
  country: string;
  educationLevel: string;
  departmentOrCourse?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// src/types/assignment.ts
export interface SubmitAssignmentRequest {
  subject: string;
  description: string;
  educationLevel: string;
  departmentOrCourse?: string;
  deadline: string;
  deliveryPlatform: string;
  paymentId?: string;
  file: File;
}
```

### 3. Create API Service (src/services/api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error.response?.data || error.message;
  }
);

export default api;
```

Create [src/services/auth.ts](src/services/auth.ts):

```typescript
import api from './api';
import { LoginRequest, SignupRequest, AuthResponse, User } from '../types';

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
  },
};
```

Create [src/services/assignments.ts](src/services/assignments.ts):

```typescript
import api from './api';
import { Assignment, SubmitAssignmentRequest } from '../types';

export const assignmentService = {
  async submitAssignment(data: SubmitAssignmentRequest): Promise<{ assignment: Assignment }> {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('educationLevel', data.educationLevel);
    formData.append('departmentOrCourse', data.departmentOrCourse || '');
    formData.append('deadline', data.deadline);
    formData.append('deliveryPlatform', data.deliveryPlatform);
    formData.append('paymentId', data.paymentId || '');
    formData.append('file', data.file);

    return api.post('/assignments/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getUserAssignments(): Promise<{ assignments: Assignment[] }> {
    return api.get('/assignments/my');
  },

  async getAssignment(id: string): Promise<{ assignment: Assignment }> {
    return api.get(`/assignments/${id}`);
  },
};
```

Create [src/services/payments.ts](src/services/payments.ts):

```typescript
import api from './api';
import { Payment } from '../types';

export const paymentService = {
  async initiatePayment(amount: number, currency = 'NGN'): Promise<{ payment: Payment }> {
    return api.post('/payments/initiate', { amount, currency });
  },

  async verifyPayment(tx_ref: string): Promise<{ payment: Payment }> {
    return api.get(`/payments/verify/${tx_ref}`);
  },

  async completePayment(tx_ref: string, transaction_id: string): Promise<{ payment: Payment }> {
    return api.post('/payments/complete', { tx_ref, transaction_id });
  },
};
```

### 4. Create Auth Context (src/context/AuthContext.tsx)

```typescript
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Try to get current user
      authService
        .getCurrentUser()
        .then((response) => setUser(response.user))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const signup = useCallback(async (data: any) => {
    try {
      setError(null);
      const response = await authService.signup(data);
      setUser(response.user);
      setToken(response.token);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 5. Create Login Form (src/components/Auth/LoginForm.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to ApeAcademy
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 6. Create Main App Component (src/App.tsx)

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SubmitAssignmentPage } from './pages/SubmitAssignmentPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-assignment"
            element={
              <ProtectedRoute>
                <SubmitAssignmentPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 7. Create Entry Point (src/main.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 8. Install Required Dependencies

```bash
npm install react react-dom react-router-dom axios
npm install -D @types/react @types/react-dom typescript
```

### 9. Add Global Styles (src/styles/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Source Sans Pro',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### 10. Create Environment File (.env)

```
VITE_API_URL=http://localhost:3000/api
```

### 11. Build Frontend

```bash
npm run build

# Output: dist/
```

---

## Total Implementation Time

- Types & Services: 30 mins
- Auth Context: 20 mins
- Forms & Pages: 3 hours (Login, Signup, Dashboard, Submit)
- Styling & Polish: 1 hour

**Total: 5-6 hours for complete frontend**

---

## After Frontend is Complete

```bash
# 1. Build
npm run build

# 2. Test with backend
npm run server:dev  # Terminal 1
npm run dev         # Terminal 2 (Vite dev server)

# 3. When ready for production
npm run serve  # Serves built frontend with backend
```

---

## Simplified MVP Frontend (Fastest Option: 2 hours)

If you want to get running ASAP, create minimal pages:

```
src/
├── pages/
│   ├── LoginPage.tsx          (copy LoginForm.tsx)
│   ├── DashboardPage.tsx       (list assignments)
│   └── SubmitAssignmentPage.tsx (form)
├── App.tsx                      (routing)
└── main.tsx
```

This gets you functional for testing, then polish later.

---

## Next: Database Deployment

Once frontend is done and API is stable, deploy:

1. **Local Testing** ✓
2. **Docker Testing** (with docker-compose)
3. **Cloud Deployment** (Railway, Heroku, AWS)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides.

