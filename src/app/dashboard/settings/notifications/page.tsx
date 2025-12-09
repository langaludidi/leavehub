'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  Mail,
  MessageSquare,
  Calendar,
  AlertCircle,
  FileText,
  Save,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface NotificationPreference {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export default function NotificationSettingsPage() {
  const userId = 'demo-user-123';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'leave_request_submitted',
      type: 'leave_request_submitted',
      name: 'New Leave Request',
      description: 'When a team member submits a leave request that requires your approval',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'leave_request_approved',
      type: 'leave_request_approved',
      name: 'Leave Request Approved',
      description: 'When your leave request has been approved',
      icon: <Check className="w-5 h-5 text-green-500" />,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'leave_request_rejected',
      type: 'leave_request_rejected',
      name: 'Leave Request Rejected',
      description: 'When your leave request has been rejected',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'leave_balance_low',
      type: 'leave_balance_low',
      name: 'Low Leave Balance',
      description: 'When your leave balance is running low',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      email: false,
      push: false,
      inApp: true,
    },
    {
      id: 'leave_reminder',
      type: 'leave_reminder',
      name: 'Upcoming Leave Reminder',
      description: 'Reminder for upcoming leave days',
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
      email: true,
      push: true,
      inApp: true,
    },
  ]);

  function togglePreference(id: string, channel: 'email' | 'push' | 'inApp') {
    setPreferences(
      preferences.map(pref =>
        pref.id === id ? { ...pref, [channel]: !pref[channel] } : pref
      )
    );
    setSaved(false);
  }

  function toggleAll(channel: 'email' | 'push' | 'inApp', value: boolean) {
    setPreferences(preferences.map(pref => ({ ...pref, [channel]: value })));
    setSaved(false);
  }

  async function savePreferences() {
    setSaving(true);
    try {
      // In a real app, you would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  }

  const allEmailEnabled = preferences.every(p => p.email);
  const allPushEnabled = preferences.every(p => p.push);
  const allInAppEnabled = preferences.every(p => p.inApp);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo User" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notification Settings
          </h1>
          <p className="text-gray-600">
            Choose how you want to receive notifications about leave activity
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">In-App Notifications</h3>
                <p className="text-sm text-gray-600">
                  {preferences.filter(p => p.inApp).length} enabled
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  {preferences.filter(p => p.email).length} enabled
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  {preferences.filter(p => p.push).length} enabled
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Table */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b px-6 py-4">
            <div className="grid grid-cols-[1fr,120px,120px,120px] gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Notification Type</h3>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">In-App</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleAll('inApp', !allInAppEnabled)}
                >
                  {allInAppEnabled ? 'Disable All' : 'Enable All'}
                </Button>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Email</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleAll('email', !allEmailEnabled)}
                >
                  {allEmailEnabled ? 'Disable All' : 'Enable All'}
                </Button>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Push</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleAll('push', !allPushEnabled)}
                >
                  {allPushEnabled ? 'Disable All' : 'Enable All'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preferences Rows */}
          <div className="divide-y">
            {preferences.map((pref) => (
              <div
                key={pref.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-[1fr,120px,120px,120px] gap-4 items-center">
                  {/* Type Info */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{pref.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {pref.name}
                      </h4>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                  </div>

                  {/* In-App Toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => togglePreference(pref.id, 'inApp')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pref.inApp ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pref.inApp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Email Toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => togglePreference(pref.id, 'email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pref.email ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pref.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => togglePreference(pref.id, 'push')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pref.push ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pref.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Changes will take effect immediately after saving
              </p>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-sm text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
                <Button onClick={savePreferences} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Settings */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-lg mb-4">Additional Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Notification Sound
                </h4>
                <p className="text-sm text-gray-600">
                  Play a sound when receiving notifications
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
              >
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Desktop Notifications
                </h4>
                <p className="text-sm text-gray-600">
                  Show notifications on your desktop
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
              >
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Notification Badge
                </h4>
                <p className="text-sm text-gray-600">
                  Show unread count badge on the notification icon
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
              >
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
