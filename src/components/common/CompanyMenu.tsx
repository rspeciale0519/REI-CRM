import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiSettings, 
  FiCreditCard, 
  FiMail, 
  FiPackage,
  FiLayout,
  FiClock,
  FiHome
} from 'react-icons/fi';

interface CompanySettings {
  name: string;
  logo_url: string | null;
  business_hours?: string;
  address?: string;
}

interface CompanyMenuProps {
  settings: CompanySettings | null;
  className?: string;
}

const CompanyMenu: React.FC<CompanyMenuProps> = ({ 
  settings,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Menu items grouped by category
  const menuItems = [
    {
      category: 'Company Profile',
      items: [
        { 
          icon: <FiHome size={16} />, 
          label: 'Company Info', 
          action: () => navigate('/app/settings?tab=company') 
        },
        { 
          icon: <FiClock size={16} />, 
          label: 'Business Hours', 
          action: () => navigate('/app/settings?tab=hours') 
        },
      ]
    },
    {
      category: 'Team',
      items: [
        { 
          icon: <FiUsers size={16} />, 
          label: 'Team Management', 
          action: () => navigate('/app/settings?tab=team') 
        },
        { 
          icon: <FiMail size={16} />, 
          label: 'Invite Members', 
          action: () => navigate('/app/settings?tab=invite') 
        },
      ]
    },
    {
      category: 'Settings',
      items: [
        { 
          icon: <FiCreditCard size={16} />, 
          label: 'Billing & Subscription', 
          action: () => navigate('/app/settings?tab=billing') 
        },
        { 
          icon: <FiLayout size={16} />, 
          label: 'Branding', 
          action: () => navigate('/app/settings?tab=branding') 
        },
        { 
          icon: <FiPackage size={16} />, 
          label: 'Integrations', 
          action: () => navigate('/app/settings?tab=integrations') 
        },
        { 
          icon: <FiSettings size={16} />, 
          label: 'Company Settings', 
          action: () => navigate('/app/settings?tab=company') 
        },
      ]
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Company Logo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-lg font-semibold">
              {settings?.name ? settings.name.charAt(0) : 'C'}
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20"
          >
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
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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

export default CompanyMenu; 