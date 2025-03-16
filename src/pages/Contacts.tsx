import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Search, Filter, ArrowUpDown, Mail, Phone } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Contact } from '../types';

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(512) 555-1234',
    type: 'Seller',
    status: 'Active',
    source: 'Referral',
    notes: 'Interested in selling multiple properties',
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@example.com',
    phone: '(214) 555-5678',
    type: 'Agent',
    status: 'Active',
    source: 'Networking Event',
    notes: 'Real estate agent specializing in investment properties',
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-04-15T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@example.com',
    phone: '(713) 555-9012',
    type: 'Buyer',
    status: 'Lead',
    source: 'Website',
    notes: 'Looking for multi-family properties',
    createdAt: '2023-03-05T00:00:00.000Z',
    updatedAt: '2023-05-01T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@example.com',
    phone: '(210) 555-3456',
    type: 'Tenant',
    status: 'Active',
    source: 'Zillow',
    notes: 'Current tenant at 123 Main St',
    createdAt: '2022-11-10T00:00:00.000Z',
    updatedAt: '2023-02-15T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.w@example.com',
    phone: '(512) 555-7890',
    type: 'Contractor',
    status: 'Active',
    source: 'Referral',
    notes: 'Reliable contractor for renovations',
    createdAt: '2023-01-05T00:00:00.000Z',
    updatedAt: '2023-03-20T00:00:00.000Z',
    ownerId: 'user1',
  },
];

const Contacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(mockContacts);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredContacts(mockContacts);
    } else {
      const filtered = mockContacts.filter(
        (contact) =>
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
          contact.email.toLowerCase().includes(term.toLowerCase()) ||
          contact.phone.includes(term) ||
          contact.type.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  const handleSort = (key: keyof Contact) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedContacts = [...filteredContacts].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredContacts(sortedContacts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your network of real estate contacts
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus size={16} />}
        >
          Add Contact
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              leftIcon={<Filter size={16} />}
              className="w-full sm:w-auto"
            >
              Filter
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowUpDown size={16} />}
              className="w-full sm:w-auto"
            >
              Sort
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastName')}
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig.key === 'lastName' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortConfig.key === 'type' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center">
                    Source
                    {sortConfig.key === 'source' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <span className="text-sm font-medium">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contact.type === 'Seller' ? 'bg-purple-100 text-purple-800' : 
                          contact.type === 'Buyer' ? 'bg-blue-100 text-blue-800' : 
                          contact.type === 'Agent' ? 'bg-green-100 text-green-800' : 
                          contact.type === 'Contractor' ? 'bg-yellow-100 text-yellow-800' : 
                          contact.type === 'Tenant' ? 'bg-indigo-100 text-indigo-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-1" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-900">
                          {contact.email}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={14} className="mr-1" />
                        <a href={`tel:${contact.phone}`} className="hover:text-gray-700">
                          {contact.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          contact.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 
                          contact.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Contacts;
