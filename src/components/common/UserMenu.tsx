import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiSettings, 
  FiBell, 
  FiLock, 
  FiHelpCircle, 
  FiLogOut,
  FiMonitor,
  FiGlobe
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/database.types';

interface UserMenuProps {
  profile: Profile | null;
  showFullInfo?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  profile, 
  showFullInfo = false, 
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Menu items grouped by category
  const menuItems = [
    {
      category: 'Account',
      items: [
        { 
          icon: <FiUser size={16} />, 
          label: 'My Profile', 
          action: () => navigate('/app/settings/profile') 
        },
        { 
          icon: <FiLock size={16} />, 
          label: 'Security', 
          action: () => navigate('/app/settings/security') 
        },
      ]
    },
    {
      category: 'Preferences',
      items: [
        { 
          icon: <FiMonitor size={16} />, 
          label: 'Appearance', 
          action: () => navigate('/app/settings/appearance') 
        },
        { 
          icon: <FiBell size={16} />, 
          label: 'Notifications', 
          action: () => navigate('/app/settings/notifications') 
        },
        { 
          icon: <FiGlobe size={16} />, 
          label: 'Language & Region', 
          action: () => navigate('/app/settings/locale') 
        },
      ]
    },
    {
      category: 'Support',
      items: [
        { 
          icon: <FiHelpCircle size={16} />, 
          label: 'Help & Support', 
          action: () => navigate('/app/help') 
        },
        { 
          icon: <FiLogOut size={16} />, 
          label: 'Sign Out',
          action: async () => {
            await signOut();
            navigate('/app/login');
          }
        },
      ]
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none group"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-transparent group-hover:ring-gray-200 transition-all">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiUser size={24} />
            </div>
          )}
        </div>
        {showFullInfo && (
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-gray-500 group-hover:text-gray-700">
              {user?.email}
            </p>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className={`
              absolute ${align === 'right' ? 'right-0' : 'left-0'} ${align === 'right' ? 'mt-2' : 'bottom-full mb-2'} w-64 
              rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20
              transform transition-all duration-100 ease-out
            `}
          >
            {/* User Info Header */}
            {!showFullInfo && (
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.email}
                </p>
              </div>
            )}

            {/* Menu Items */}
            {menuItems.map((group, groupIndex) => (
              <div 
                key={group.category}
                className={groupIndex !== 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}
              >
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.category}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 
                      flex items-center space-x-2 transition-colors
                      ${item.label === 'Sign Out' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu; 