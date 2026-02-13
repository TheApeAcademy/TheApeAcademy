import { useState, useCallback, useEffect } from 'react';
import { Assignment } from '../types';
import { assignmentService } from '../services/assignments';
import { useNotification } from '../context/NotificationContext';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const fetchAssignments = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assignmentService.getMyAssignments(status);
      if (response.data) {
        setAssignments(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch assignments';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const createAssignment = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await assignmentService.createAssignment(formData);
        if (response.data) {
          setAssignments((prev) => [response.data, ...prev]);
          addNotification('Assignment created successfully', 'success');
          return response.data;
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to create assignment';
        setError(errorMessage);
        addNotification(errorMessage, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const response = await assignmentService.updateAssignmentStatus(id, status);
        if (response.data) {
          setAssignments((prev) =>
            prev.map((a) => (a.id === id ? response.data : a))
          );
          addNotification('Assignment status updated', 'success');
          return response.data;
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to update assignment';
        addNotification(errorMessage, 'error');
        throw err;
      }
    },
    [addNotification]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      try {
        await assignmentService.deleteAssignment(id);
        setAssignments((prev) => prev.filter((a) => a.id !== id));
        addNotification('Assignment deleted', 'success');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to delete assignment';
        addNotification(errorMessage, 'error');
        throw err;
      }
    },
    [addNotification]
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    isLoading,
    error,
    fetchAssignments,
    createAssignment,
    updateStatus,
    deleteAssignment,
  };
};
