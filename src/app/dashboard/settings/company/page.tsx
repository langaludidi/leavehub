'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  Clock,
  Globe,
  Save,
  Check,
  Bell,
  Users,
  Settings,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface CompanySettings {
  id?: string;
  company_id: string;
  fiscal_year_start_month: number;
  working_days: number[];
  working_hours_per_day: number;
  timezone: string;
  auto_approve_after_days: number | null;
  allow_overlapping_requests: boolean;
  require_handover_notes: boolean;
  notify_managers: boolean;
  notify_hr: boolean;
  reminder_days_before: number;
  approval_levels: number;
  require_hr_approval: boolean;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

export default function CompanySettingsPage() {
  const userId = 'demo-user-123';
  const companyId = '12345678-1234-1234-1234-123456789012'; // Demo company ID

  const [settings, setSettings] = useState<CompanySettings>({
    company_id: companyId,
    fiscal_year_start_month: 1,
    working_days: [1, 2, 3, 4, 5],
    working_hours_per_day: 8.0,
    timezone: 'Africa/Johannesburg',
    auto_approve_after_days: null,
    allow_overlapping_requests: false,
    require_handover_notes: false,
    notify_managers: true,
    notify_hr: true,
    reminder_days_before: 3,
    approval_levels: 1,
    require_hr_approval: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [companyId]);

  async function fetchSettings() {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/company?companyId=${companyId}`);
      const data = await response.json();

      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: settings.company_id,
          fiscal_year_start_month: settings.fiscal_year_start_month,
          working_days: settings.working_days,
          working_hours_per_day: settings.working_hours_per_day,
          timezone: settings.timezone,
          auto_approve_after_days: settings.auto_approve_after_days,
          allow_overlapping_requests: settings.allow_overlapping_requests,
          require_handover_notes: settings.require_handover_notes,
          notify_managers: settings.notify_managers,
          notify_hr: settings.notify_hr,
          reminder_days_before: settings.reminder_days_before,
          approval_levels: settings.approval_levels,
          require_hr_approval: settings.require_hr_approval,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving company settings:', error);
    } finally {
      setSaving(false);
    }
  }

  function toggleWorkingDay(day: number) {
    if (settings.working_days.includes(day)) {
      setSettings({
        ...settings,
        working_days: settings.working_days.filter(d => d !== day),
      });
    } else {
      setSettings({
        ...settings,
        working_days: [...settings.working_days, day].sort(),
      });
    }
    setSaved(false);
  }

  function updateSetting(key: keyof CompanySettings, value: any) {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo User" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo User" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Settings
          </h1>
          <p className="text-gray-600">
            Configure your company&apos;s leave management settings
          </p>
        </div>

        {/* General Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">General Settings</h2>
              <p className="text-sm text-gray-600">Basic company configuration</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fiscal Year Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fiscal Year Start Month
              </label>
              <select
                value={settings.fiscal_year_start_month}
                onChange={(e) => updateSetting('fiscal_year_start_month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                When does your fiscal year begin?
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Your company&apos;s primary timezone
              </p>
            </div>

            {/* Working Hours Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Working Hours Per Day
              </label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={settings.working_hours_per_day}
                onChange={(e) => updateSetting('working_hours_per_day', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard working hours per day
              </p>
            </div>

            {/* Auto Approve After Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Check className="w-4 h-4 inline mr-2" />
                Auto-Approve After (Days)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Leave empty to disable"
                value={settings.auto_approve_after_days || ''}
                onChange={(e) => updateSetting('auto_approve_after_days', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-approve requests after this many days
              </p>
            </div>
          </div>
        </Card>

        {/* Working Days */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Working Days</h2>
              <p className="text-sm text-gray-600">Select your company&apos;s working days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {WEEKDAYS.map(day => (
              <button
                key={day.value}
                onClick={() => toggleWorkingDay(day.value)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  settings.working_days.includes(day.value)
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Leave Request Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Leave Request Settings</h2>
              <p className="text-sm text-gray-600">Configure approval and request rules</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Approval Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Levels
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.approval_levels}
                onChange={(e) => updateSetting('approval_levels', parseInt(e.target.value))}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of approval levels required
              </p>
            </div>

            {/* Toggle Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Require HR Approval</h4>
                  <p className="text-sm text-gray-600">All requests must be approved by HR</p>
                </div>
                <button
                  onClick={() => updateSetting('require_hr_approval', !settings.require_hr_approval)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.require_hr_approval ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.require_hr_approval ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Allow Overlapping Requests</h4>
                  <p className="text-sm text-gray-600">Allow multiple requests for same period</p>
                </div>
                <button
                  onClick={() => updateSetting('allow_overlapping_requests', !settings.allow_overlapping_requests)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allow_overlapping_requests ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allow_overlapping_requests ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Require Handover Notes</h4>
                  <p className="text-sm text-gray-600">Employees must provide handover notes</p>
                </div>
                <button
                  onClick={() => updateSetting('require_handover_notes', !settings.require_handover_notes)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.require_handover_notes ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.require_handover_notes ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notification Settings</h2>
              <p className="text-sm text-gray-600">Configure notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reminder Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Days Before Leave
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.reminder_days_before}
                onChange={(e) => updateSetting('reminder_days_before', parseInt(e.target.value))}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Days before leave to send reminder
              </p>
            </div>

            {/* Toggle Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Notify Managers</h4>
                  <p className="text-sm text-gray-600">Send notifications to managers</p>
                </div>
                <button
                  onClick={() => updateSetting('notify_managers', !settings.notify_managers)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notify_managers ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notify_managers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Notify HR</h4>
                  <p className="text-sm text-gray-600">Send notifications to HR</p>
                </div>
                <button
                  onClick={() => updateSetting('notify_hr', !settings.notify_hr)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notify_hr ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notify_hr ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Changes will affect all users in your organization
          </p>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Saved successfully
              </span>
            )}
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
