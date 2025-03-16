import React, { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiCreditCard, FiPackage, FiLayout, FiSettings, FiLink } from 'react-icons/fi';
import { CompanyService, CompanySettings as ICompanySettings } from '@/services/company.service';
import { usePermissions } from '@/contexts/PermissionContext';
import { Permissions } from '@/types/roles.types';
import TeamManagementModal from './modals/TeamManagementModal';

const CompanySettings: React.FC = () => {
  const [settings, setSettings] = useState<ICompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = usePermissions();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Load company settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await CompanyService.getSettings();
        if (error) throw error;
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle settings update
  const handleSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasPermission(Permissions.EDIT_COMPANY_SETTINGS)) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const updatedSettings = {
        name: formData.get('name') as string,
        business_hours: formData.get('businessHours') as string,
        address: formData.get('address') as string,
      };

      const { data, error } = await CompanyService.updateSettings(updatedSettings);
      if (error) throw error;
      setSettings(data);
      // Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission(Permissions.VIEW_COMPANY_SETTINGS)) {
    return (
      <div className="text-center py-8 text-gray-600">
        You don't have permission to view company settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Company Information */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FiHome className="text-blue-500 mr-2" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Company Information</h3>
        </div>

        <form onSubmit={handleSettingsUpdate}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={settings?.name || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!hasPermission(Permissions.EDIT_COMPANY_SETTINGS)}
              />
            </div>

            <div>
              <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700">
                Business Hours
              </label>
              <input
                type="text"
                id="businessHours"
                name="businessHours"
                defaultValue={settings?.business_hours || ''}
                placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!hasPermission(Permissions.EDIT_COMPANY_SETTINGS)}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={settings?.address || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!hasPermission(Permissions.EDIT_COMPANY_SETTINGS)}
              />
            </div>

            {hasPermission(Permissions.EDIT_COMPANY_SETTINGS) && (
              <div>
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
            )}
          </div>
        </form>
      </section>

      {/* Team Management Section */}
      {hasPermission(Permissions.VIEW_USERS) && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiUsers className="text-blue-500 mr-2" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
            </div>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Manage Team
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Manage your team members, their roles, and permissions.
          </p>
        </section>
      )}

      {/* Billing Section */}
      {hasPermission(Permissions.MANAGE_BILLING) && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiCreditCard className="text-blue-500 mr-2" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Billing & Subscription</h3>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Manage Billing
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            View and manage your subscription, billing information, and invoices.
          </p>
        </section>
      )}

      {/* Branding Section */}
      {hasPermission(Permissions.MANAGE_COMPANY_SETTINGS) && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiSettings className="text-blue-500 mr-2" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Company Branding</h3>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Customize
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Customize your company's branding, logo, and colors.
          </p>
        </section>
      )}

      {/* Integrations Section */}
      {hasPermission(Permissions.MANAGE_INTEGRATIONS) && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiLink className="text-blue-500 mr-2" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Integrations</h3>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Configure
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Connect and manage third-party integrations and APIs.
          </p>
        </section>
      )}

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
};

export default CompanySettings; 