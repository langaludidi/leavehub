import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface Notification {
  id: string;
  subject: string;
  notification_type: string;
  status: 'sent' | 'pending' | 'failed';
  sent_at: string | null;
  created_at: string;
  variables: Record<string, any>;
  read: boolean;
}

interface NotificationCenterProps {
  compact?: boolean;
  limit?: number;
}

async function fetchUserNotifications(limit: number = 20): Promise<Notification[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('to_email', user.user.email)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Add read status (simplified - in practice you'd track this in a separate table)
  return (data || []).map(notification => ({
    ...notification,
    read: notification.status === 'sent' && notification.sent_at !== null
  }));
}

async function markNotificationAsRead(notificationId: string): Promise<void> {
  // In a real implementation, you'd update a user_notification_read table
  // For now, we'll just simulate this
  console.log('Marking notification as read:', notificationId);
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    'leave_request_submitted': '📋',
    'leave_request_approved': '✅',
    'leave_request_denied': '❌',
    'manager_approval_required': '⏳',
    'welcome_employee': '👋',
    'welcome_manager': '🎯',
    'balance_low_warning': '⚠️',
    'policy_update': '📢',
    'leave_reminder': '🔔'
  };
  return icons[type] || '📬';
};

const getNotificationColor = (type: string, read: boolean) => {
  const baseColors: Record<string, string> = {
    'leave_request_approved': 'border-l-green-400 bg-green-50 dark:bg-green-900/10',
    'leave_request_denied': 'border-l-red-400 bg-red-50 dark:bg-red-900/10',
    'leave_request_submitted': 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10',
    'manager_approval_required': 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    'welcome_employee': 'border-l-purple-400 bg-purple-50 dark:bg-purple-900/10',
    'welcome_manager': 'border-l-indigo-400 bg-indigo-50 dark:bg-indigo-900/10',
    'balance_low_warning': 'border-l-orange-400 bg-orange-50 dark:bg-orange-900/10',
    'policy_update': 'border-l-teal-400 bg-teal-50 dark:bg-teal-900/10'
  };

  const color = baseColors[type] || 'border-l-gray-400 bg-gray-50 dark:bg-gray-900/10';
  
  if (read) {
    return color + ' opacity-75';
  }
  
  return color;
};

const getNotificationTitle = (notification: Notification) => {
  const { notification_type, variables = {} } = notification;
  
  const titles: Record<string, string> = {
    'leave_request_submitted': `Leave request submitted`,
    'leave_request_approved': `Leave request approved`,
    'leave_request_denied': `Leave request denied`,
    'manager_approval_required': `Approval required for ${variables.employee_name}`,
    'welcome_employee': `Welcome to LeaveHub`,
    'welcome_manager': `Welcome, Manager`,
    'balance_low_warning': `Leave balance running low`,
    'policy_update': `Leave policy updated`,
    'leave_reminder': `Leave reminder`
  };

  return titles[notification_type] || notification.subject;
};

const getNotificationDescription = (notification: Notification) => {
  const { notification_type, variables = {} } = notification;
  
  switch (notification_type) {
    case 'leave_request_submitted':
      return `Your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} is pending approval`;
    case 'leave_request_approved':
      return `Your ${variables.leave_type} leave request has been approved for ${variables.start_date} - ${variables.end_date}`;
    case 'leave_request_denied':
      return `Your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} was not approved`;
    case 'manager_approval_required':
      return `${variables.employee_name} has requested ${variables.total_days} days of ${variables.leave_type} leave`;
    case 'welcome_employee':
      return `You've been added to ${variables.organization_name}'s LeaveHub`;
    case 'balance_low_warning':
      return `You have ${variables.remaining_days} days remaining this year`;
    default:
      return notification.subject;
  }
};

export default function NotificationCenter({ compact = false, limit = 10 }: NotificationCenterProps) {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['user-notifications', limit],
    queryFn: () => fetchUserNotifications(limit)
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const displayNotifications = showAll ? notifications : notifications?.slice(0, compact ? 5 : 10);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
            <div className="skeleton w-8 h-8 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-3 w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">📬</div>
        <p>No notifications yet</p>
        <p className="text-sm">You'll see your notifications here</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {unreadCount > 0 && (
          <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
        
        {displayNotifications?.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={[
              'flex items-start gap-2 p-2 rounded-lg border-l-4 cursor-pointer transition-colors',
              getNotificationColor(notification.notification_type, notification.read),
              'hover:shadow-sm'
            ].join(' ')}
          >
            <div className="text-lg mt-0.5">
              {getNotificationIcon(notification.notification_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={[
                'text-sm truncate',
                notification.read ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-gray-100'
              ].join(' ')}>
                {getNotificationTitle(notification)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {format(new Date(notification.created_at), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 py-2"
          >
            {showAll ? 'Show less' : `View ${notifications.length - 3} more`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-teal-600 dark:text-teal-400">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={() => {
              notifications.filter(n => !n.read).forEach(n => {
                markAsReadMutation.mutate(n.id);
              });
            }}
            disabled={unreadCount === 0}
            className="text-sm text-teal-600 hover:text-teal-700 disabled:text-gray-400"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayNotifications?.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={[
              'flex items-start gap-3 p-4 rounded-lg border-l-4 cursor-pointer transition-all',
              getNotificationColor(notification.notification_type, notification.read),
              'hover:shadow-md border border-gray-200 dark:border-gray-700'
            ].join(' ')}
          >
            <div className="text-2xl">
              {getNotificationIcon(notification.notification_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={[
                    'font-medium',
                    notification.read 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-900 dark:text-gray-100'
                  ].join(' ')}>
                    {getNotificationTitle(notification)}
                  </div>
                  
                  <p className={[
                    'text-sm mt-1',
                    notification.read 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  ].join(' ')}>
                    {getNotificationDescription(notification)}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(notification.created_at), 'MMM d')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(notification.created_at), 'h:mm a')}
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className={[
                  'px-2 py-1 text-xs rounded-full',
                  notification.status === 'sent' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : notification.status === 'failed'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                ].join(' ')}>
                  {notification.status === 'sent' && notification.sent_at ? 'Delivered' : 
                   notification.status === 'failed' ? 'Failed' : 'Pending'}
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {notifications.length > limit && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-center text-teal-600 hover:text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg transition"
        >
          Show all {notifications.length} notifications
        </button>
      )}
    </div>
  );
}