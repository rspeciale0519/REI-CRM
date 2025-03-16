import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ReportFiltersProps {
  reportType: string;
  filters: any;
  onFilterChange: (filters: any) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (dateRange: { start: Date; end: Date }) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  filters,
  onFilterChange,
  dateRange,
  onDateRangeChange,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (value) {
      onDateRangeChange({
        ...dateRange,
        [type]: new Date(value),
      });
    }
  };

  const renderPropertyFilters = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            id="city"
            type="text"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Filter by city"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Input
            id="state"
            type="text"
            value={filters.state || ''}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            placeholder="Filter by state"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Sale">Pending Sale</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderDealFilters = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dealType" className="block text-sm font-medium text-gray-700 mb-1">
            Deal Type
          </label>
          <select
            id="dealType"
            value={filters.dealType || ''}
            onChange={(e) => handleFilterChange('dealType', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Types</option>
            <option value="Flip">Flip</option>
            <option value="Rental">Rental</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
        <div>
          <label htmlFor="dealStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="dealStatus"
            value={filters.dealStatus || ''}
            onChange={(e) => handleFilterChange('dealStatus', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>
        <div>
          <label htmlFor="minProfit" className="block text-sm font-medium text-gray-700 mb-1">
            Min Profit/Cash Flow
          </label>
          <Input
            id="minProfit"
            type="number"
            value={filters.minProfit || ''}
            onChange={(e) => handleFilterChange('minProfit', e.target.value)}
            placeholder="Minimum profit"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              id="startDate"
              type="date"
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              id="endDate"
              type="date"
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
          </div>
        </div>

        {reportType === 'properties' && renderPropertyFilters()}
        {reportType === 'deals' && renderDealFilters()}
        {reportType === 'performance' && (
          <div className="text-sm text-gray-500">No additional filters available for performance reports.</div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onFilterChange({});
            onDateRangeChange({
              start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
              end: new Date(),
            });
          }}
          className="mr-2"
        >
          Reset
        </Button>
        <Button variant="primary" size="sm">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ReportFilters;
