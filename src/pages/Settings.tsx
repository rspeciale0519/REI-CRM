import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionContext';
import { Permissions } from '@/types/roles.types';
import CompanySettings from '@/components/settings/CompanySettings';
import PersonalSettings from '@/components/settings/PersonalSettings';

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();
  const currentTab = searchParams.get('tab') || 'personal';

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => handleTabChange('personal')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentTab === 'personal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Personal
            </button>
            
            {hasPermission(Permissions.VIEW_COMPANY_SETTINGS) && (
              <button
                onClick={() => handleTabChange('company')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentTab === 'company'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Company
              </button>
            )}
          </div>
        </div>

        {/* Settings Content */}
        {currentTab === 'company' && hasPermission(Permissions.VIEW_COMPANY_SETTINGS) ? (
          <CompanySettings />
        ) : (
          <PersonalSettings />
        )}
      </div>
    </div>
  );
};

export default Settings; 