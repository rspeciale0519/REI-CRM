import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Filter, ArrowUpDown, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Deal } from '../types';

// Mock data for demonstration
const mockDeals: Deal[] = [
  {
    id: '1',
    propertyId: '3',
    contactId: '2',
    dealType: 'Purchase',
    status: 'Under Contract',
    amount: 320000,
    closingDate: '2023-07-15T00:00:00.000Z',
    notes: 'Negotiated $10k below asking',
    createdAt: '2023-05-10T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '2',
    propertyId: '1',
    contactId: '3',
    dealType: 'Refinance',
    status: 'Closed',
    amount: 250000,
    closingDate: '2023-04-20T00:00:00.000Z',
    notes: 'Cash out refinance to fund next purchase',
    createdAt: '2023-03-15T00:00:00.000Z',
    updatedAt: '2023-04-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '3',
    propertyId: '2',
    contactId: '4',
    dealType: 'Lease',
    status: 'Closed',
    amount: 21600,
    closingDate: '2023-02-01T00:00:00.000Z',
    notes: '12-month lease agreement',
    createdAt: '2023-01-10T00:00:00.000Z',
    updatedAt: '2023-02-01T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '4',
    propertyId: '5',
    contactId: '1',
    dealType: 'Sale',
    status: 'Lead',
    amount: 340000,
    closingDate: null,
    notes: 'Potential buyer interested in property',
    createdAt: '2023-05-25T00:00:00.000Z',
    updatedAt: '2023-05-25T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '5',
    propertyId: '4',
    contactId: '5',
    dealType: 'Purchase',
    status: 'Cancelled',
    amount: 450000,
    closingDate: null,
    notes: 'Deal fell through due to financing issues',
    createdAt: '2023-04-05T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z',
    ownerId: 'user1',
  },
];

// Mock property addresses for display
const propertyAddresses: Record<string, string> = {
  '1': '123 Main St',
  '2': '456 Oak Ave',
  '3': '789 Pine Ln',
  '4': '101 River Rd',
  '5': '222 Market St',
};

// Mock contact names for display
const contactNames: Record<string, string> = {
  '1': 'John Smith',
  '2': 'Sarah Johnson',
  '3': 'Michael Brown',
  '4': 'Emily Davis',
  '5': 'Robert Wilson',
};

const Deals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeals, setFilteredDeals] = useState(mockDeals);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Deal | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredDeals(mockDeals);
    } else {
      const filtered = mockDeals.filter(
        (deal) =>
          deal.dealType.toLowerCase().includes(term.toLowerCase()) ||
          deal.status.toLowerCase().includes(term.toLowerCase()) ||
          propertyAddresses[deal.propertyId]?.toLowerCase().includes(term.toLowerCase()) ||
          contactNames[deal.contactId]?.toLowerCase().includes(term.toLowerCase()) ||
          deal.amount.toString().includes(term)
      );
      setFilteredDeals(filtered);
    }
  };

  const handleSort = (key: keyof Deal) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedDeals = [...filteredDeals].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredDeals(sortedDeals);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your real estate transactions
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
        >
          Add Deal
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
              placeholder="Search deals..."
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
                  onClick={() => handleSort('dealType')}
                >
                  <div className="flex items-center">
                    Deal
                    {sortConfig.key === 'dealType' && (
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
                  Property / Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('closingDate')}
                >
                  <div className="flex items-center">
                    Closing Date
                    {sortConfig.key === 'closingDate' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No deals found
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center
                          ${deal.dealType === 'Purchase' ? 'bg-blue-100 text-blue-600' : 
                            deal.dealType === 'Sale' ? 'bg-green-100 text-green-600' : 
                            deal.dealType === 'Refinance' ? 'bg-purple-100 text-purple-600' : 
                            'bg-yellow-100 text-yellow-600'}`}>
                          <Briefcase size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.dealType} Deal
                          </div>
                          <div className="text-sm text-gray-500">
                            Created {format(new Date(deal.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {propertyAddresses[deal.propertyId]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contactNames[deal.contactId]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <DollarSign size={16} className="mr-1 text-gray-500" />
                        {deal.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deal.closingDate ? (
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar size={16} className="mr-1 text-gray-500" />
                          {format(new Date(deal.closingDate), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${deal.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                          deal.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-800' : 
                          deal.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/deals/${deal.id}`} className="text-blue-600 hover:text-blue-900">
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

export default Deals;
