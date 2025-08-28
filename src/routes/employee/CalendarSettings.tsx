import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import CalendarSync from '../../components/calendar/CalendarSync';
import { useAutoLeaveSync } from '../../hooks/useLeaveCalendarSync';

interface CalendarPreferences {
  auto_sync_enabled: boolean;
  sync_all_day_events: boolean;
  include_leave_type_in_title: boolean;
  include_reason_in_description: boolean;
  notification_before_leave: boolean;
  notification_days_before: number;
}

const DEFAULT_PREFERENCES: CalendarPreferences = {
  auto_sync_enabled: true,
  sync_all_day_events: true,
  include_leave_type_in_title: true,
  include_reason_in_description: false,
  notification_before_leave: true,
  notification_days_before: 1
};

async function fetchCalendarPreferences() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('employee_profiles')
    .select('calendar_preferences')
    .eq('user_id', user.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  return data?.calendar_preferences || DEFAULT_PREFERENCES;
}

async function updateCalendarPreferences(preferences: CalendarPreferences) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('employee_profiles')
    .upsert({
      user_id: user.user.id,
      calendar_preferences: preferences
    });

  if (error) throw error;
  return preferences;
}

export default function CalendarSettings() {
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);

  // Get current user for auto sync
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  // Enable automatic leave sync for current user
  useAutoLeaveSync(user?.id || '');

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['calendar-preferences'],
    queryFn: fetchCalendarPreferences
  });

  const updateMutation = useMutation({
    mutationFn: updateCalendarPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-preferences'] });
      setIsDirty(false);
    }
  });

  const [formData, setFormData] = useState<CalendarPreferences>(
    preferences || DEFAULT_PREFERENCES
  );

  // Update form data when preferences load
  useState(() => {
    if (preferences) {
      setFormData(preferences);
    }
  });

  const handleInputChange = (field: keyof CalendarPreferences, value: boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCalendarSync = (provider: 'google' | 'outlook', success: boolean) => {
    if (success) {
      console.log(`Successfully connected to ${provider}`);
    } else {
      console.log(`Failed to connect to ${provider}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="skeleton h-8 w-64 mb-4"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Calendar Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configure how your leave requests sync with your calendars
          </p>
        </div>

        {/* Calendar Connections */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Calendar Connections</h2>
            <p className="card-subtle">Connect your calendar accounts to sync leave requests</p>
          </div>
          <div className="card-body">
            <CalendarSync onSync={handleCalendarSync} />
          </div>
        </div>

        {/* Sync Preferences */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sync Preferences</h2>
            <p className="card-subtle">Customize how leave requests appear in your calendar</p>
          </div>
          <div className="card-body space-y-6">
            {/* Auto Sync */}
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Automatic Sync</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically sync approved leave requests to your connected calendars
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.auto_sync_enabled}
                  onChange={(e) => handleInputChange('auto_sync_enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* All Day Events */}
            <div className="flex items-center justify-between">
              <div>
                <label className="label">All-Day Events</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create leave requests as all-day calendar events
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.sync_all_day_events}
                  onChange={(e) => handleInputChange('sync_all_day_events', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Include Leave Type */}
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Include Leave Type in Title</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show leave type (vacation, sick, etc.) in the calendar event title
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.include_leave_type_in_title}
                  onChange={(e) => handleInputChange('include_leave_type_in_title', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Include Reason */}
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Include Reason in Description</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add the leave request reason to the calendar event description
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.include_reason_in_description}
                  onChange={(e) => handleInputChange('include_reason_in_description', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">Notifications</h3>
              
              {/* Enable Notifications */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="label">Leave Reminders</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified before your leave starts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.notification_before_leave}
                    onChange={(e) => handleInputChange('notification_before_leave', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Notification Days */}
              {formData.notification_before_leave && (
                <div>
                  <label className="label">Remind me this many days before leave starts:</label>
                  <select
                    className="select w-full mt-1"
                    value={formData.notification_days_before}
                    onChange={(e) => handleInputChange('notification_days_before', parseInt(e.target.value))}
                  >
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>1 week before</option>
                  </select>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={!isDirty || updateMutation.isPending}
                className="btn-primary"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {updateMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  Failed to save preferences. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Calendar Integration Help
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <p>
                    <strong>Automatic Sync:</strong> When enabled, approved leave requests are automatically 
                    added to your connected calendars and removed if denied or cancelled.
                  </p>
                  <p>
                    <strong>Privacy:</strong> Only you can see your calendar events. Your leave information 
                    is not shared with your calendar provider beyond what's necessary for the event.
                  </p>
                  <p>
                    <strong>Troubleshooting:</strong> If events aren't syncing, try disconnecting and 
                    reconnecting your calendar. Make sure you have the necessary permissions enabled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}