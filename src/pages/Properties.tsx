import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Property } from '../types';

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    purchasePrice: 250000,
    currentValue: 320000,
    monthlyRent: 2200,
    propertyType: 'Single Family',
    status: 'Active',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    yearBuilt: 2005,
    notes: 'Great rental property in a growing neighborhood',
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '2',
    address: '456 Oak Ave',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    purchasePrice: 180000,
    currentValue: 210000,
    monthlyRent: 1800,
    propertyType: 'Single Family',
    status: 'Active',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    yearBuilt: 1998,
    notes: 'Solid cash-flowing property',
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-04-15T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '3',
    address: '789 Pine Ln',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    purchasePrice: 320000,
    currentValue: 350000,
    monthlyRent: 0,
    propertyType: 'Multi Family',
    status: 'Under Contract',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    yearBuilt: 2010,
    notes: 'Duplex with great potential for increased rent',
    createdAt: '2023-03-05T00:00:00.000Z',
    updatedAt: '2023-05-01T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '4',
    address: '101 River Rd',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78215',
    purchasePrice: 420000,
    currentValue: 450000,
    monthlyRent: 3200,
    propertyType: 'Multi Family',
    status: 'Active',
    bedrooms: 5,
    bathrooms: 3,
    squareFeet: 3000,
    yearBuilt: 2015,
    notes: 'Triplex in excellent condition',
    createdAt: '2022-11-10T00:00:00.000Z',
    updatedAt: '2023-02-15T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '5',
    address: '222 Market St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    purchasePrice: 290000,
    currentValue: 340000,
    monthlyRent: 2400,
    propertyType: 'Single Family',
    status: 'Active',
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1950,
    yearBuilt: 2008,
    notes: 'Recently renovated property in up-and-coming area',
    createdAt: '2023-01-05T00:00:00.000Z',
    updatedAt: '2023-03-20T00:00:00.000Z',
    ownerId: 'user1',
  },
];

const Properties: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Property | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredProperties(mockProperties);
    } else {
      const filtered = mockProperties.filter(
        (property) =>
          property.address.toLowerCase().includes(term.toLowerCase()) ||
          property.city.toLowerCase().includes(term.toLowerCase()) ||
          property.state.toLowerCase().includes(term.toLowerCase()) ||
          property.zipCode.includes(term)
      );
      setFilteredProperties(filtered);
    }
  };

  const handleSort = (key: keyof Property) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedProperties = [...filteredProperties].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredProperties(sortedProperties);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your real estate portfolio
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
        >
          Add Property
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
              placeholder="Search properties..."
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
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center">
                    Property
                    {sortConfig.key === 'address' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('propertyType')}
                >
                  <div className="flex items-center">
                    Type
                    {sortConfig.key === 'propertyType' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('currentValue')}
                >
                  <div className="flex items-center">
                    Value
                    {sortConfig.key === 'currentValue' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('monthlyRent')}
                >
                  <div className="flex items-center">
                    Monthly Rent
                    {sortConfig.key === 'monthlyRent' && (
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
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                          <Building2 size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.address}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.city}, {property.state} {property.zipCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.propertyType}</div>
                      <div className="text-sm text-gray-500">
                        {property.bedrooms} bed, {property.bathrooms} bath
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${property.currentValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        Purchased: ${property.purchasePrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.monthlyRent > 0 ? `$${property.monthlyRent.toLocaleString()}/mo` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          property.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-800' : 
                          property.status === 'For Sale' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/properties/${property.id}`} className="text-blue-600 hover:text-blue-900">
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

export default Properties;
