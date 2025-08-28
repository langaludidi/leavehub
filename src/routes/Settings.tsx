import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your LeaveHub experience</p>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Notifications</div>
            <div className="card-subtitle">Choose how you'd like to be notified</div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Email Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates about leave requests and approvals
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Push Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get instant notifications in your browser
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">SMS Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive text messages for urgent updates
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Preferences */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Appearance & Preferences</div>
            <div className="card-subtitle">Customize your interface preferences</div>
          </div>
          <div className="card-body">
            <form className="space-y-6">
              <div className="form-group">
                <label htmlFor="theme" className="label">Theme</label>
                <select
                  id="theme"
                  className="input"
                  value={preferences.theme}
                  onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <div className="help">Choose your preferred color scheme</div>
              </div>

              <div className="form-group">
                <label htmlFor="language" className="label">Language</label>
                <select
                  id="language"
                  className="input"
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timezone" className="label">Timezone</label>
                <select
                  id="timezone"
                  className="input"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateFormat" className="label">Date Format</label>
                <select
                  id="dateFormat"
                  className="input"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Privacy & Security</div>
            <div className="card-subtitle">Manage your privacy settings</div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <button className="btn-secondary w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Data Export</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Download your personal data</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </button>

              <button className="btn-danger w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Delete Account</div>
                    <div className="text-sm opacity-90">Permanently delete your account and all data</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button className="btn-primary">Save All Changes</button>
          <button className="btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}