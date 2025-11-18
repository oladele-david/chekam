import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NotificationCard Component
 * Displays a notification alert with priority and icon
 *
 * @param {Object} notification - Notification object
 * @param {string} className - Additional CSS classes
 */
export default function NotificationCard({ notification, className }) {
  const getPriorityVariant = (priority) => {
    const variants = {
      urgent: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    return variants[priority] || 'default';
  };

  const getIcon = (type, priority) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (priority === 'high') {
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
    if (type === 'budget_exceeded' || type === 'low_savings') {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
    return <Info className="h-5 w-5 text-blue-600" />;
  };

  const getBorderColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-600',
      high: 'border-l-orange-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-gray-400'
    };
    return colors[priority] || 'border-l-gray-300';
  };

  return (
    <Card className={cn(
      "border-l-4 hover:shadow-md transition-shadow",
      getBorderColor(notification.priority),
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type, notification.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-customGray4 text-sm">
                {notification.title}
              </h3>
              <Badge variant={getPriorityVariant(notification.priority)} className="flex-shrink-0">
                {notification.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.message}
            </p>
            {notification.created_at && (
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
