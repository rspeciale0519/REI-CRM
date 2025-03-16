import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  DollarSign, 
  CheckSquare, 
  Calendar, 
  BarChart2, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import UserMenu from '@/components/common/UserMenu';
import { ProfileService } from '@/services/profile.service';
import { Profile } from '@/types/database.types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/app', icon: <Home size={20} /> },
  { name: 'Properties', path: '/app/properties', icon: <Building2 size={20} /> },
  { name: 'Contacts', path: '/app/contacts', icon: <Users size={20} /> },
  { name: 'Deals', path: '/app/deals', icon: <DollarSign size={20} /> },
  { name: 'Tasks', path: '/app/tasks', icon: <CheckSquare size={20} /> },
  { name: 'Calendar', path: '/app/calendar', icon: <Calendar size={20} /> },
  { name: 'Reports', path: '/app/reports', icon: <BarChart2 size={20} /> },
  { name: 'Settings', path: '/app/settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await ProfileService.getProfile();
      setProfile(data);
    };
    loadProfile();
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:static lg:z-0
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">REI CRM</h1>
        </div>

        <nav className="mt-6">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600
                    ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <UserMenu 
            profile={profile} 
            showFullInfo={true} 
            align="left" 
            className="w-full"
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
