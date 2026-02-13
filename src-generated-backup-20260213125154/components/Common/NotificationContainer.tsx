import React from 'react';
import { useNotification } from '../../context/NotificationContext';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const bgColors = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-blue-500',
          warning: 'bg-yellow-500',
        };

        return (
          <div
            key={notification.id}
            className={`${bgColors[notification.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-slide-in`}
          >
            <p>{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-xl leading-none hover:opacity-75"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
