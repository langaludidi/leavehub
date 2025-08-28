import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  leave_request_updates: boolean;
  approval_reminders: boolean;
  balance_warnings: boolean;
  policy_updates: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  user_id: '',
  email_enabled: true,
  leave_request_updates: true,
  approval_reminders: true,
  balance_warnings: true,
  policy_updates: true,
  digest_frequency: 'immediate',
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  return data || { ...DEFAULT_PREFERENCES, user_id: user.user.id };
}

async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      ...preferences,
      user_id: user.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

interface NotificationPreferencesProps {
  compact?: boolean;
}

export default function NotificationPreferences({ compact = false }: NotificationPreferencesProps) {
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchNotificationPreferences
  });

  const updateMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setIsDirty(false);
    }
  });

  const [formData, setFormData] = useState<NotificationPreferences>(
    preferences || DEFAULT_PREFERENCES
  );

  // Update form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleChange = (field: keyof NotificationPreferences, value: boolean | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (preferences) {
      setFormData(preferences);
      setIsDirty(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-48"></div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-6 w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium">Email Notifications</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formData.email_enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.email_enabled}
              onChange={(e) => handleChange('email_enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {isDirty && (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary text-sm">
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleReset} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Master Email Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div>
            <div className="font-semibold text-blue-900 dark:text-blue-100">Email Notifications</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Master switch for all email notifications
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.email_enabled}
              onChange={(e) => handleChange('email_enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Individual Notification Types */}
        <div className={`space-y-4 ${!formData.email_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Notification Types</h4>
          
          <div className="space-y-4">
            <NotificationToggle
              title="Leave Request Updates"
              description="Get notified when your leave requests are approved, denied, or need action"
              checked={formData.leave_request_updates}
              onChange={(checked) => handleChange('leave_request_updates', checked)}
            />

            <NotificationToggle
              title="Approval Reminders"
              description="Receive reminders about pending approvals if you're a manager"
              checked={formData.approval_reminders}
              onChange={(checked) => handleChange('approval_reminders', checked)}
            />

            <NotificationToggle
              title="Balance Warnings"
              description="Get notified when your leave balance is running low"
              checked={formData.balance_warnings}
              onChange={(checked) => handleChange('balance_warnings', checked)}
            />

            <NotificationToggle
              title="Policy Updates"
              description="Stay informed about changes to leave policies and procedures"
              checked={formData.policy_updates}
              onChange={(checked) => handleChange('policy_updates', checked)}
            />
          </div>
        </div>

        {/* Digest Frequency */}
        <div className={`space-y-3 ${!formData.email_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Frequency</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['immediate', 'daily', 'weekly', 'never'] as const).map((frequency) => (
              <label key={frequency} className="relative">
                <input
                  type="radio"
                  name="digest_frequency"
                  value={frequency}
                  checked={formData.digest_frequency === frequency}
                  onChange={(e) => handleChange('digest_frequency', e.target.value)}
                  className="sr-only peer"
                />
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer text-center transition peer-checked:border-teal-500 peer-checked:bg-teal-50 dark:peer-checked:bg-teal-900/20 peer-checked:text-teal-700 dark:peer-checked:text-teal-300">
                  <div className="font-medium text-sm capitalize">{frequency}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {frequency === 'immediate' && 'Send right away'}
                    {frequency === 'daily' && 'Once per day'}
                    {frequency === 'weekly' && 'Weekly summary'}
                    {frequency === 'never' && 'No emails'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className={`space-y-3 ${!formData.email_enabled || formData.digest_frequency === 'never' ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Quiet Hours</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No notifications will be sent during these hours
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                value={formData.quiet_hours_start || '22:00'}
                onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                value={formData.quiet_hours_end || '08:00'}
                onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className={`space-y-3 ${!formData.email_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Timezone</h4>
          <select
            value={formData.timezone || DEFAULT_PREFERENCES.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="select w-full"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Central European Time</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Australia/Sydney">Sydney</option>
            <option value="Africa/Johannesburg">South African Time</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isDirty ? 'You have unsaved changes' : 'All changes saved'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={!isDirty}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || updateMutation.isPending}
              className="btn-primary"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
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
  );
}

interface NotificationToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationToggle({ title, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
      </label>
    </div>
  );
}