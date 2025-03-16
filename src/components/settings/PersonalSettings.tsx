import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiBell, FiMonitor, FiLock, FiCamera } from 'react-icons/fi';
import { ProfileService } from '@/services/profile.service';
import { Profile } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import PasswordChangeModal from './modals/PasswordChangeModal';
import TwoFactorSetupModal from './modals/TwoFactorSetupModal';

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

const PersonalSettings: React.FC = () => {
  // State for different setting categories
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

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await ProfileService.getProfile();
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const profileData = {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as string,
      };

      const { data, error } = await ProfileService.updateProfile(profileData);
      if (error) throw error;
      setProfile(data);
      // Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const file = e.target.files[0];
      const { url, error: uploadError } = await ProfileService.uploadAvatar(file);
      if (uploadError) throw uploadError;

      if (url) {
        const { error: updateError } = await ProfileService.updateProfile({
          avatar_url: url,
        });
        if (updateError) throw updateError;

        setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Personal Settings</h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <FiUser className="text-blue-500 mr-2" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
        </div>

        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiUser size={40} />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <FiCamera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="ml-6">
            <h4 className="text-lg font-medium text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </h4>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                defaultValue={profile?.first_name || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                defaultValue={profile?.last_name || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={profile?.phone || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Job Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                defaultValue={profile?.role || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Notification Settings */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FiBell className="text-blue-500 mr-2" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
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

      {/* Display Settings */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FiMonitor className="text-blue-500 mr-2" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Display</h3>
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

      {/* Account Security */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FiLock className="text-blue-500 mr-2" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Account Security</h3>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={() => setIsTwoFactorModalOpen(true)}
            className="ml-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      </section>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <TwoFactorSetupModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
      />
    </div>
  );
};

export default PersonalSettings; 