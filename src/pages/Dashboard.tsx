import React from 'react';
import { Building2, Users, Briefcase, DollarSign, TrendingUp, CheckSquare } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import PropertyList from '../components/dashboard/PropertyList';
import TaskList from '../components/dashboard/TaskList';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import RecentDeals from '../components/dashboard/RecentDeals';
import { Property, Contact, Deal, Task } from '../types';

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
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Schedule property inspection',
    description: 'Contact inspector for 123 Main St',
    dueDate: '2023-06-15T00:00:00.000Z',
    status: 'Not Started',
    priority: 'High',
    relatedTo: {
      type: 'Property',
      id: '1',
    },
    createdAt: '2023-05-20T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '2',
    title: 'Call potential tenant',
    description: 'Follow up with John regarding 456 Oak Ave',
    dueDate: '2023-06-10T00:00:00.000Z',
    status: 'In Progress',
    priority: 'Medium',
    relatedTo: {
      type: 'Property',
      id: '2',
    },
    createdAt: '2023-05-18T00:00:00.000Z',
    updatedAt: '2023-05-25T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '3',
    title: 'Review purchase contract',
    description: 'Go through contract details for 789 Pine Ln',
    dueDate: '2023-06-05T00:00:00.000Z',
    status: 'Not Started',
    priority: 'High',
    relatedTo: {
      type: 'Deal',
      id: '1',
    },
    createdAt: '2023-05-22T00:00:00.000Z',
    updatedAt: '2023-05-22T00:00:00.000Z',
    ownerId: 'user1',
  },
];

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
];

const portfolioData = {
  labels: ['Single Family', 'Multi Family', 'Commercial', 'Land'],
  values: [530000, 350000, 0, 0],
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your real estate investment portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Properties"
          value={mockProperties.length}
          icon={<Building2 size={24} />}
          change={{ value: 33, isPositive: true }}
        />
        <StatCard
          title="Total Portfolio Value"
          value={`$${portfolioData.values.reduce((a, b) => a + b, 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          change={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Monthly Rental Income"
          value={`$${mockProperties.reduce((sum, prop) => sum + prop.monthlyRent, 0).toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          change={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PortfolioChart data={portfolioData} />
        <RecentDeals deals={mockDeals} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PropertyList properties={mockProperties} />
        <TaskList tasks={mockTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
