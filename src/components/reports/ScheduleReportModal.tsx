import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ScheduleReportModalProps {
  onClose: () => void;
  onSchedule: (schedule: {
    frequency: string;
    day?: string;
    time: string;
    recipients: string[];
    format: string;
  }) => void;
}

const ScheduleReportModal: React.FC<ScheduleReportModalProps> = ({ onClose, onSchedule }) => {
  const [frequency, setFrequency] = useState('weekly');
  const [day, setDay] = useState('monday');
  const [time, setTime] = useState('09:00');
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState('pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      frequency,
      day: frequency !== 'daily' ? day : undefined,
      time,
      recipients: recipients.split(',').map(email => email.trim()),
      format,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          {frequency !== 'daily' && (
            <div className="mb-4">
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                {frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
              </label>
              {frequency === 'weekly' ? (
                <select
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              ) : (
                <select
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </option>
                  ))}
                  <option value="last">Last day</option>
                </select>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
              Recipients (comma separated)
            </label>
            <Input
              id="recipients"
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email@example.com, another@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleReportModal;
