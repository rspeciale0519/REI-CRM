import React, { useState } from 'react';
import { FiUser, FiBell, FiMonitor, FiLink, FiLock } from 'react-icons/fi';

// Define types for our settings
interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  leadAlerts: boolean;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
}

const Settings: React.FC = () => {
  // Initialize state for different setting categories
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    leadAlerts: true,
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    theme: 'system',
    compactMode: false,
    fontSize: 'medium',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'English',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  // Handler for notification toggles
  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handler for theme changes
  const handleThemeChange = (theme: DisplaySettings['theme']) => {
    setDisplay(prev => ({
      ...prev,
      theme
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* User Preferences Section */}
        <section className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <FiUser className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">User Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Language</label>
              <select 
                className="border rounded-md px-3 py-2"
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Time Zone</label>
              <select 
                className="border rounded-md px-3 py-2"
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notification Settings Section */}
        <section className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <FiBell className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={() => handleNotificationChange(key as keyof NotificationSettings)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Display Settings Section */}
        <section className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <FiMonitor className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Display</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Theme</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    className={`px-4 py-2 rounded-md ${
                      display.theme === theme
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleThemeChange(theme)}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Compact Mode</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={display.compactMode}
                  onChange={() => setDisplay(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Integration Settings Section */}
        <section className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <FiLink className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Integrations</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">Configure your third-party integrations here.</p>
            {/* Add integration configuration options as needed */}
          </div>
        </section>

        {/* Account Settings Section */}
        <section className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <FiLock className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Account Security</h2>
          </div>
          <div className="space-y-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Change Password
            </button>
            <button className="ml-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Enable Two-Factor Authentication
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings; 