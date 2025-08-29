import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';
import NotificationCenter from '../../components/notifications/NotificationCenter';

interface NotificationStats {
  totalSent: number;
  totalReceived: number;
  successRate: number;
  lastNotification: string | null;
  mostCommonType: string;
}

async function fetchNotificationStats(): Promise<NotificationStats> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get user's notification history
  const { data: notifications } = await supabase
    .from('email_notifications')
    .select('status, notification_type, created_at')
    .eq('to_email', user.user.email)
    .order('created_at', { ascending: false });

  if (!notifications) {
    return {
      totalSent: 0,
      totalReceived: 0,
      successRate: 0,
      lastNotification: null,
      mostCommonType: 'None'
    };
  }

  const totalReceived = notifications.length;
  const totalSent = notifications.filter(n => n.status === 'sent').length;
  const successRate = totalReceived > 0 ? (totalSent / totalReceived) * 100 : 0;
  const lastNotification = notifications.length > 0 ? notifications[0].created_at : null;

  // Find most common notification type
  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  return {
    totalSent,
    totalReceived,
    successRate: Math.round(successRate * 10) / 10,
    lastNotification,
    mostCommonType
  };
}

export default function NotificationSettings() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'stats'>('preferences');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: fetchNotificationStats
  });

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'leave_request_submitted': 'Leave Requests',
      'leave_request_approved': 'Approvals',
      'leave_request_denied': 'Denials',
      'manager_approval_required': 'Manager Approvals',
      'welcome_employee': 'Welcome Messages',
      'balance_low_warning': 'Balance Warnings',
      'policy_update': 'Policy Updates',
      'leave_reminder': 'Reminders'
    };
    return labels[type] || type;
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your notification preferences and view your notification history
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="card-header border-b-0 pb-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('preferences')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'preferences'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                ⚙️ Preferences
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'history'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                📬 History
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'stats'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                📊 Statistics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-body">
                <NotificationPreferences />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <div className="card-body">
                <NotificationCenter limit={50} />
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statsLoading ? (
                  <>
                    <div className="skeleton h-24 rounded-lg"></div>
                    <div className="skeleton h-24 rounded-lg"></div>
                    <div className="skeleton h-24 rounded-lg"></div>
                    <div className="skeleton h-24 rounded-lg"></div>
                  </>
                ) : stats ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalReceived}
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Total Received</div>
                        </div>
                        <div className="text-2xl">📬</div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.totalSent}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">Successfully Sent</div>
                        </div>
                        <div className="text-2xl">✅</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.successRate}%
                          </div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Success Rate</div>
                        </div>
                        <div className="text-2xl">📊</div>
                      </div>
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-teal-600 dark:text-teal-400 truncate">
                            {getNotificationTypeLabel(stats.mostCommonType)}
                          </div>
                          <div className="text-sm text-teal-700 dark:text-teal-300">Most Common</div>
                        </div>
                        <div className="text-2xl">🏆</div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Additional Stats */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Notification Analytics</h3>
                  <p className="card-subtle">Your notification activity overview</p>
                </div>
                <div className="card-body">
                  {statsLoading ? (
                    <div className="space-y-4">
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                      <div className="skeleton h-4 w-2/3"></div>
                    </div>
                  ) : stats ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">Last Notification</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {stats.lastNotification 
                            ? new Date(stats.lastNotification).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">Delivery Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${stats.successRate}%` }}
                            />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {stats.successRate}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <span className="font-medium">Failed Deliveries</span>
                        <span className="text-red-600 dark:text-red-400">
                          {stats.totalReceived - stats.totalSent}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No notification data available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  About Notifications
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• <strong>Immediate:</strong> Get notified right away when events happen</p>
                  <p>• <strong>Daily Digest:</strong> Receive a summary of all notifications once per day</p>
                  <p>• <strong>Weekly Digest:</strong> Get a weekly summary every Monday morning</p>
                  <p>• <strong>Quiet Hours:</strong> No notifications will be sent during your specified quiet hours</p>
                  <p>• <strong>Email Delivery:</strong> All notifications are sent to your registered email address</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}