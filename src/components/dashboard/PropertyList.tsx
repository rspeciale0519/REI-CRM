import React from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { Property } from '../../types';

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <Card title="Recent Properties" className="h-full">
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {properties.length === 0 ? (
            <li className="py-4 text-center text-gray-500">No properties found</li>
          ) : (
            properties.map((property) => (
              <li key={property.id} className="py-4">
                <Link to={`/properties/${property.id}`} className="flex items-center hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.address}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            property.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-800' : 
                            property.status === 'For Sale' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{property.city}, {property.state} {property.zipCode}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">${property.currentValue.toLocaleString()}</span>
                        {property.monthlyRent > 0 && (
                          <span className="ml-2 text-gray-500">
                            ${property.monthlyRent.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="mt-4">
        <Link
          to="/properties"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View all properties
        </Link>
      </div>
    </Card>
  );
};

export default PropertyList;
