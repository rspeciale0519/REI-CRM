import React from 'react';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
};

export default ReportHeader;
