import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SaveReportModalProps {
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Save Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <Input
              id="reportName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter report name"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="reportDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter report description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!name.trim()}>
              Save Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveReportModal;
