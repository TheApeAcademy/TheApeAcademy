import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../hooks/useAssignments';
import { useNavigate } from 'react-router-dom';
import { AssignmentCard } from '../components/Assignments/AssignmentCard';
import { Button } from '../components/Common/Button';
import { Loading } from '../components/Common/Loading';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { assignments, isLoading, error, deleteAssignment } = useAssignments();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setDeletingId(id);
      try {
        await deleteAssignment(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.fullName}</p>
          </div>
          <div className="space-x-4">
            <Button
              variant="primary"
              onClick={() => navigate('/submit-assignment')}
              className="inline-block"
            >
              Submit Assignment
            </Button>
            <Button variant="secondary" onClick={handleLogout} className="inline-block">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">{error}</div>}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Assignments</h2>

          {isLoading ? (
            <Loading message="Loading assignments..." />
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No assignments yet.</p>
              <Button variant="primary" onClick={() => navigate('/submit-assignment')}>
                Submit Your First Assignment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onViewDetails={() => navigate(`/assignment/${assignment.id}`)}
                  onDelete={() => handleDelete(assignment.id)}
                  isDeleting={deletingId === assignment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
