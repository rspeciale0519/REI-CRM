import React, { useState, useEffect } from 'react';
import { Menu, Search, Plus, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';
import CompanyMenu from '@/components/common/CompanyMenu';
import { CompanyService, CompanySettings } from '@/services/company.service';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        const { data } = await CompanyService.getSettings();
        setCompanySettings(data);
      } catch (error) {
        console.error('Failed to load company settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanySettings();
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;

    // Determine which section we're in and navigate accordingly
    const currentPath = location.pathname.toLowerCase();
    let searchPath = '/search';

    if (currentPath.includes('properties')) {
      searchPath = `/properties?q=${encodeURIComponent(searchTerm)}`;
    } else if (currentPath.includes('contacts')) {
      searchPath = `/contacts?q=${encodeURIComponent(searchTerm)}`;
    } else if (currentPath.includes('deals')) {
      searchPath = `/deals?q=${encodeURIComponent(searchTerm)}`;
    } else if (currentPath.includes('tasks')) {
      searchPath = `/tasks?q=${encodeURIComponent(searchTerm)}`;
    }

    navigate(searchPath);
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-10">
      <button
        onClick={toggleSidebar}
        className="p-1 mr-4 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none md:hidden"
      >
        <Menu size={24} />
      </button>
      
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </form>
      
      <div className="ml-auto flex items-center space-x-4">
        <Button 
          variant="primary" 
          size="sm" 
          leftIcon={<Plus size={16} />}
        >
          Add New
        </Button>
        
        <button className="p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        <CompanyMenu settings={companySettings} />
      </div>
    </header>
  );
};

export default Header;
