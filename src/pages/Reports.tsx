import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Download, 
  Save, 
  Clock, 
  Filter, 
  RefreshCw, 
  ChevronDown,
  FileText,
  BarChart2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ReportFilters from '../components/reports/ReportFilters';
import ReportTypeSelector from '../components/reports/ReportTypeSelector';
import DataTable from '../components/reports/DataTable';
import ChartContainer from '../components/reports/ChartContainer';
import ReportHeader from '../components/reports/ReportHeader';
import SaveReportModal from '../components/reports/SaveReportModal';
import ScheduleReportModal from '../components/reports/ScheduleReportModal';
import SavedReportsList from '../components/reports/SavedReportsList';
import { exportToCsv, exportToPdf } from '../lib/exportUtils';

// Mock data for demonstration
const mockPropertyData = [
  { id: 1, address: '123 Main St', city: 'Austin', state: 'TX', purchasePrice: 250000, currentValue: 320000, roi: 28, status: 'Active' },
  { id: 2, address: '456 Oak Ave', city: 'Dallas', state: 'TX', purchasePrice: 180000, currentValue: 210000, roi: 16.7, status: 'Active' },
  { id: 3, address: '789 Pine Rd', city: 'Houston', state: 'TX', purchasePrice: 320000, currentValue: 350000, roi: 9.4, status: 'Pending Sale' },
  { id: 4, address: '101 Cedar Ln', city: 'San Antonio', state: 'TX', purchasePrice: 210000, currentValue: 245000, roi: 16.7, status: 'Active' },
  { id: 5, address: '202 Maple Dr', city: 'Austin', state: 'TX', purchasePrice: 275000, currentValue: 340000, roi: 23.6, status: 'Active' },
];

const mockDealData = [
  { id: 1, property: '123 Main St', type: 'Flip', status: 'Closed', purchasePrice: 250000, salePrice: 320000, profit: 70000, roi: 28, closingDate: '2023-03-15' },
  { id: 2, property: '456 Oak Ave', type: 'Rental', status: 'Active', purchasePrice: 180000, monthlyRent: 1800, capRate: 8.2, cashFlow: 650, purchaseDate: '2023-01-10' },
  { id: 3, property: '789 Pine Rd', type: 'Wholesale', status: 'Pending', contractPrice: 320000, assignmentFee: 15000, closingDate: '2023-08-30' },
  { id: 4, property: '101 Cedar Ln', type: 'Rental', status: 'Active', purchasePrice: 210000, monthlyRent: 2100, capRate: 7.8, cashFlow: 720, purchaseDate: '2022-11-05' },
  { id: 5, property: '202 Maple Dr', type: 'Flip', status: 'In Progress', purchasePrice: 275000, estimatedValue: 340000, estimatedProfit: 65000, purchaseDate: '2023-06-20' },
];

const mockPerformanceData = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 38000, expenses: 24000, profit: 14000 },
  { month: 'Mar', revenue: 55000, expenses: 32000, profit: 23000 },
  { month: 'Apr', revenue: 47000, expenses: 29000, profit: 18000 },
  { month: 'May', revenue: 63000, expenses: 35000, profit: 28000 },
  { month: 'Jun', revenue: 51000, expenses: 31000, profit: 20000 },
];

const mockPortfolioData = [
  { name: 'Rental Properties', value: 65 },
  { name: 'Flips', value: 20 },
  { name: 'Wholesale Deals', value: 15 },
];

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('properties');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date(),
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Property report columns
  const propertyColumns = useMemo(
    () => [
      {
        Header: 'Address',
        accessor: 'address',
      },
      {
        Header: 'City',
        accessor: 'city',
      },
      {
        Header: 'State',
        accessor: 'state',
      },
      {
        Header: 'Purchase Price',
        accessor: 'purchasePrice',
        Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'Current Value',
        accessor: 'currentValue',
        Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'ROI',
        accessor: 'roi',
        Cell: ({ value }: { value: number }) => `${value.toFixed(1)}%`,
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
    ],
    []
  );

  // Deal report columns
  const dealColumns = useMemo(
    () => [
      {
        Header: 'Property',
        accessor: 'property',
      },
      {
        Header: 'Type',
        accessor: 'type',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Purchase Price',
        accessor: 'purchasePrice',
        Cell: ({ value }: { value: number }) => (value ? `$${value.toLocaleString()}` : '-'),
      },
      {
        Header: 'Sale/Rent',
        accessor: (row: any) => row.salePrice || row.monthlyRent || row.assignmentFee,
        Cell: ({ row }: { row: any }) => {
          if (row.original.type === 'Flip') return `$${row.original.salePrice?.toLocaleString() || 0}`;
          if (row.original.type === 'Rental') return `$${row.original.monthlyRent?.toLocaleString() || 0}/mo`;
          if (row.original.type === 'Wholesale') return `$${row.original.assignmentFee?.toLocaleString() || 0}`;
          return '-';
        },
      },
      {
        Header: 'Profit/Cash Flow',
        accessor: (row: any) => row.profit || row.cashFlow || row.assignmentFee,
        Cell: ({ row }: { row: any }) => {
          if (row.original.type === 'Flip') return `$${row.original.profit?.toLocaleString() || 0}`;
          if (row.original.type === 'Rental') return `$${row.original.cashFlow?.toLocaleString() || 0}/mo`;
          if (row.original.type === 'Wholesale') return `$${row.original.assignmentFee?.toLocaleString() || 0}`;
          return '-';
        },
      },
      {
        Header: 'Date',
        accessor: (row: any) => row.closingDate || row.purchaseDate,
        Cell: ({ value }: { value: string }) => (value ? format(new Date(value), 'MM/dd/yyyy') : '-'),
      },
    ],
    []
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExportCsv = () => {
    const data = reportType === 'properties' ? mockPropertyData : mockDealData;
    const filename = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToCsv(data, filename);
    setShowExportMenu(false);
  };

  const handleExportPdf = () => {
    const data = reportType === 'properties' ? mockPropertyData : mockDealData;
    const filename = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToPdf(data, filename);
    setShowExportMenu(false);
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'properties':
        return (
          <>
            <DataTable columns={propertyColumns} data={mockPropertyData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ChartContainer
                title="Property Value Distribution"
                type="bar"
                data={mockPropertyData.map(p => ({
                  name: p.address.split(' ').slice(0, 2).join(' '),
                  purchasePrice: p.purchasePrice,
                  currentValue: p.currentValue,
                }))}
                series={[
                  { dataKey: 'purchasePrice', name: 'Purchase Price', color: '#8884d8' },
                  { dataKey: 'currentValue', name: 'Current Value', color: '#82ca9d' },
                ]}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartContainer
                title="ROI by Property"
                type="bar"
                data={mockPropertyData.map(p => ({
                  name: p.address.split(' ').slice(0, 2).join(' '),
                  roi: p.roi,
                }))}
                dataKey="roi"
                valueFormatter={(value) => `${value}%`}
              />
            </div>
          </>
        );
      case 'deals':
        return (
          <>
            <DataTable columns={dealColumns} data={mockDealData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ChartContainer
                title="Deal Types"
                type="pie"
                data={[
                  { name: 'Flip', value: mockDealData.filter(d => d.type === 'Flip').length },
                  { name: 'Rental', value: mockDealData.filter(d => d.type === 'Rental').length },
                  { name: 'Wholesale', value: mockDealData.filter(d => d.type === 'Wholesale').length },
                ]}
              />
              <ChartContainer
                title="Deal Status"
                type="pie"
                data={[
                  { name: 'Active', value: mockDealData.filter(d => d.status === 'Active').length },
                  { name: 'Pending', value: mockDealData.filter(d => d.status === 'Pending').length },
                  { name: 'Closed', value: mockDealData.filter(d => d.status === 'Closed').length },
                  { name: 'In Progress', value: mockDealData.filter(d => d.status === 'In Progress').length },
                ]}
              />
            </div>
          </>
        );
      case 'performance':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card title="Total Revenue" subtitle="Last 6 months">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">
                    ${mockPerformanceData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                  </span>
                </div>
              </Card>
              <Card title="Total Expenses" subtitle="Last 6 months">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">
                    ${mockPerformanceData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
                  </span>
                </div>
              </Card>
              <Card title="Total Profit" subtitle="Last 6 months">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">
                    ${mockPerformanceData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}
                  </span>
                </div>
              </Card>
            </div>
            <ChartContainer
              title="Financial Performance"
              subtitle="Last 6 months"
              type="bar"
              data={mockPerformanceData}
              xAxisKey="month"
              series={[
                { dataKey: 'revenue', name: 'Revenue', color: '#8884d8' },
                { dataKey: 'expenses', name: 'Expenses', color: '#ff8042' },
                { dataKey: 'profit', name: 'Profit', color: '#82ca9d' },
              ]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ChartContainer
                title="Monthly Profit Trend"
                type="line"
                data={mockPerformanceData}
                xAxisKey="month"
                series={[
                  { dataKey: 'profit', name: 'Profit', color: '#82ca9d' },
                ]}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartContainer
                title="Portfolio Distribution"
                type="pie"
                data={mockPortfolioData}
                valueFormatter={(value) => `${value}%`}
              />
            </div>
          </>
        );
      default:
        return <div>Select a report type to view data</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ReportHeader
        title="Reports"
        subtitle="Generate and analyze reports on your real estate portfolio"
      />

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <ReportTypeSelector
                reportType={reportType}
                onChange={setReportType}
                options={[
                  { value: 'properties', label: 'Properties', icon: <FileText size={16} /> },
                  { value: 'deals', label: 'Deals', icon: <FileText size={16} /> },
                  { value: 'performance', label: 'Performance', icon: <BarChart2 size={16} /> },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter size={16} />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center gap-1"
                  disabled={isRefreshing}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1"
                  >
                    <Download size={16} />
                    Export
                    <ChevronDown size={14} />
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={handleExportCsv}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={handleExportPdf}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-1"
                >
                  <Save size={16} />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-1"
                >
                  <Clock size={16} />
                  Schedule
                </Button>
              </div>
            </div>

            {showFilters && (
              <ReportFilters
                reportType={reportType}
                filters={filters}
                onFilterChange={setFilters}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          </div>

          {renderReportContent()}
        </div>

        <div className="w-full md:w-1/4">
          <SavedReportsList
            reports={[
              { id: 1, name: 'Monthly Performance', type: 'performance', createdAt: '2023-08-15' },
              { id: 2, name: 'Active Properties', type: 'properties', createdAt: '2023-08-10' },
              { id: 3, name: 'Closed Deals Q2', type: 'deals', createdAt: '2023-07-01' },
            ]}
            onSelect={(report) => {
              setReportType(report.type);
              // Load saved report configuration
            }}
          />
        </div>
      </div>

      {showSaveModal && (
        <SaveReportModal
          onClose={() => setShowSaveModal(false)}
          onSave={(name, description) => {
            // Save report logic
            setShowSaveModal(false);
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleReportModal
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(schedule) => {
            // Schedule report logic
            setShowScheduleModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Reports;
