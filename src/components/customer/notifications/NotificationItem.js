'use client';

import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationItem = ({ notification, onMarkRead, onDelete, getIcon, formatDate }) => {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
        !notification.read ? 'bg-accent/30 border-primary/20' : 'border-transparent hover:bg-accent/10'
      }`}
    >
      <div className="mt-1">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => onMarkRead(notification._id)}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-destructive hover:text-destructive"
              onClick={() => onDelete(notification._id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
