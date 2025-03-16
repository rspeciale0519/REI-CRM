import React from 'react';
import { format } from 'date-fns';
import { FileText, BarChart2, Clock, Download, Edit, Trash2 } from 'lucide-react';
import Card from '../ui/Card';

interface SavedReport {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  scheduled?: boolean;
}

interface SavedReportsListProps {
  reports: SavedReport[];
  onSelect: (report: SavedReport) => void;
  onEdit?: (report: SavedReport) => void;
  onDelete?: (report: SavedReport) => void;
  onSchedule?: (report: SavedReport) => void;
  onDownload?: (report: SavedReport) => void;
}

const SavedReportsList: React.FC<SavedReportsListProps> = ({
  reports,
  onSelect,
  onEdit,
  onDelete,
  onSchedule,
  onDownload,
}) => {
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'properties':
      case 'deals':
        return <FileText size={16} className="text-blue-500" />;
      case 'performance':
        return <BarChart2 size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <Card title="Saved Reports">
      <div className="divide-y divide-gray-200">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="py-3">
              <div 
                className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                onClick={() => onSelect(report)}
              >
                <div className="mr-3 mt-1">{getReportIcon(report.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{report.name}</p>
                  <p className="text-xs text-gray-500">
                    Created {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </p>
                  {report.scheduled && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>Scheduled</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  {onDownload && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(report);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Download size={14} />
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(report);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(report);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            No saved reports yet
          </div>
        )}
      </div>
    </Card>
  );
};

export default SavedReportsList;
