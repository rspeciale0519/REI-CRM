import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ReportTypeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ReportTypeSelectorProps {
  reportType: string;
  onChange: (type: string) => void;
  options: ReportTypeOption[];
}

const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
  reportType,
  onChange,
  options
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            reportType === option.value
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ReportTypeSelector;
