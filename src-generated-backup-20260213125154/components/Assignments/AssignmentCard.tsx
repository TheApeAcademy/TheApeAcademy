import React from 'react';
import { Assignment } from '../../types';
import { Button } from '../Common/Button';

interface AssignmentCardProps {
  assignment: Assignment;
  onViewDetails: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onViewDetails,
  onDelete,
  isDeleting = false,
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{assignment.subject}</h3>
          <p className="text-sm text-gray-500">{assignment.educationLevel}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[assignment.status]}`}>
          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Deadline: {formatDate(assignment.deadline)}</span>
        {assignment.paymentId && <span className="text-green-600">✓ Paid</span>}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            isLoading={isDeleting}
            className="flex-1"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
