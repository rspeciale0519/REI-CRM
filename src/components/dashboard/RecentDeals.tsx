import React from 'react';
import { Briefcase, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '../ui/Card';
import { Deal } from '../../types';

interface RecentDealsProps {
  deals: Deal[];
}

const RecentDeals: React.FC<RecentDealsProps> = ({ deals }) => {
  return (
    <Card title="Recent Deals" className="h-full">
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {deals.length === 0 ? (
            <li className="py-4 text-center text-gray-500">No deals found</li>
          ) : (
            deals.map((deal) => (
              <li key={deal.id} className="py-4">
                <Link to={`/deals/${deal.id}`} className="flex items-center hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center
                      ${deal.dealType === 'Purchase' ? 'bg-blue-100 text-blue-600' : 
                        deal.dealType === 'Sale' ? 'bg-green-100 text-green-600' : 
                        deal.dealType === 'Refinance' ? 'bg-purple-100 text-purple-600' : 
                        'bg-yellow-100 text-yellow-600'}`}>
                      <Briefcase size={20} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {deal.dealType} Deal
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${deal.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                            deal.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-800' : 
                            deal.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <DollarSign size={14} className="mr-1" />
                      <span className="font-medium">${deal.amount.toLocaleString()}</span>
                    </div>
                    {deal.closingDate && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>Closing: {format(new Date(deal.closingDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="mt-4">
        <Link
          to="/deals"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View all deals
        </Link>
      </div>
    </Card>
  );
};

export default RecentDeals;
