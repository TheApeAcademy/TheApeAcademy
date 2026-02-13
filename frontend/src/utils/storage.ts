import { User, Assignment, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  USER: 'apeacademy_user',
  PREFERENCES: 'apeacademy_preferences',
  ASSIGNMENTS: 'apeacademy_assignments',
  AUTH_TOKEN: 'apeacademy_token',
};

// User Authentication
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${user.id}`);
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// User Preferences
export const savePreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  
  // Update user object if logged in
  const user = getUser();
  if (user) {
    const updatedUser = { ...user, ...preferences };
    saveUser(updatedUser);
  }
};

export const getPreferences = (): UserPreferences | null => {
  const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return prefs ? JSON.parse(prefs) : null;
};

// Assignments
export const saveAssignment = (assignment: Assignment): void => {
  const assignments = getAssignments();
  assignments.push(assignment);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
};

export const getAssignments = (): Assignment[] => {
  const assignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return assignments ? JSON.parse(assignments) : [];
};

export const updateAssignment = (id: string, updates: Partial<Assignment>): void => {
  const assignments = getAssignments();
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }
};

export const getUserAssignments = (userId: string): Assignment[] => {
  return getAssignments().filter(a => a.userId === userId);
};
