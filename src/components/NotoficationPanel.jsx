import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FiCheck, FiTrash2, FiSettings, FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

// Notification types with their icons and colors
const notificationTypes = {
  info: { icon: FiInfo, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  success: { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  warning: { icon: FiAlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  error: { icon: FiXCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const NotifIcon = notificationTypes[notification.type]?.icon || FiInfo;
  const iconColor = notificationTypes[notification.type]?.color || 'text-gray-500';
  const bgColor = notificationTypes[notification.type]?.bgColor || 'bg-gray-50';

  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon or Avatar */}
        {notification.avatar ? (
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={notification.avatar} alt={notification.title} />
            <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <NotifIcon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            </div>

            {/* Read indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 mt-2">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiCheck className="w-3 h-3 mr-1" />
                Mark as read
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center"
            >
              <FiTrash2 className="w-3 h-3 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New observation added',
      message: 'Pipeline inspection #3421 has been completed and uploaded.',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Report generated',
      message: 'Your monthly maintenance report is ready to download.',
      time: '1 hour ago',
      read: false,
      avatar: null,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Maintenance required',
      message: 'Device #847 requires scheduled maintenance within 7 days.',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 4,
      type: 'info',
      title: 'New team member',
      message: 'John Doe has joined your project team.',
      time: '1 day ago',
      read: true,
      avatar: '/avatar_default.png',
    },
    {
      id: 5,
      type: 'success',
      title: 'Upload complete',
      message: 'Video file "inspection_042.mp4" has been processed successfully.',
      time: '2 days ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <FiSettings className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2 mt-3">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-2"
              >
                <FiCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <FiCheckCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;