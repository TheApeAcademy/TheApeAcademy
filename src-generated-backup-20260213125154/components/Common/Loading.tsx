import React from 'react';

export const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>;
};

export const ErrorBoundary: React.FC<{ error?: string; children: React.ReactNode }> = ({
  error,
  children,
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }
  return <>{children}</>;
};
