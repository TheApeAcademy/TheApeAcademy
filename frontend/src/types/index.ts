export interface User {
  id: string;
  name: string;
  email: string;
  region?: string;
  country?: string;
  schoolLevel?: string;
  department?: string;
}

export interface Assignment {
  id: string;
  userId: string;
  courseName: string;
  className: string;
  teacherName: string;
  dueDate: string;
  platform: string;
  files: FileInfo[];
  status: 'pending' | 'paid' | 'submitted' | 'completed';
  createdAt: string;
  paymentId?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface RegionData {
  region: string;
  countries: string[];
}

export interface UserPreferences {
  region: string;
  country: string;
  schoolLevel: string;
  department: string;
}
