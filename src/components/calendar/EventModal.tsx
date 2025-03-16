import React, { useState, useEffect } from 'react';
import { format, parse, addDays } from 'date-fns';
import { X, Trash2, Clock, MapPin, AlignLeft, Repeat } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CalendarEvent } from '../../types';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  selectedDate: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('blue');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  
  const isNewEvent = !event?.id;
  
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setStartDate(format(new Date(event.start), 'yyyy-MM-dd'));
      setStartTime(format(new Date(event.start), 'HH:mm'));
      setEndDate(format(new Date(event.end), 'yyyy-MM-dd'));
      setEndTime(format(new Date(event.end), 'HH:mm'));
      setLocation(event.location || '');
      setDescription(event.description || '');
      setColorCode(event.colorCode || 'blue');
      setIsRecurring(event.isRecurring || false);
      setRecurringPattern(event.recurringPattern || 'weekly');
      setRecurringEndDate(event.recurringEndDate ? format(new Date(event.recurringEndDate), 'yyyy-MM-dd') : format(addDays(new Date(), 30), 'yyyy-MM-dd'));
    } else if (selectedDate) {
      // Default values for new event
      setStartDate(format(selectedDate, 'yyyy-MM-dd'));
      setEndDate(format(selectedDate, 'yyyy-MM-dd'));
      
      // Default to current time rounded to nearest half hour
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = minutes < 30 ? 30 : 0;
      const roundedHours = minutes < 30 ? now.getHours() : now.getHours() + 1;
      
      const startTimeStr = `${roundedHours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
      setStartTime(startTimeStr);
      
      // Default end time is 1 hour after start
      const endHour = roundedHours + 1;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
      setEndTime(endTimeStr);
    }
  }, [event, selectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const start = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(`${endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // Validate end time is after start time
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }
    
    const updatedEvent: CalendarEvent = {
      id: event?.id || '',
      title,
      start,
      end,
      location: location || undefined,
      description: description || undefined,
      colorCode,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      recurringEndDate: isRecurring ? parse(recurringEndDate, 'yyyy-MM-dd', new Date()) : undefined
    };
    
    onSave(updatedEvent);
  };
  
  const handleDelete = () => {
    if (event?.id && confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };
  
  const colorOptions = [
    { value: 'blue', label: 'Blue', bgClass: 'bg-blue-500' },
    { value: 'green', label: 'Green', bgClass: 'bg-green-500' },
    { value: 'red', label: 'Red', bgClass: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-500' },
    { value: 'purple', label: 'Purple', bgClass: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', bgClass: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500' },
    { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isNewEvent ? 'Create Event' : 'Edit Event'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium w-full"
              required
            />
          </div>
          
          <div className="mb-4 flex items-center">
            <Clock size={18} className="text-gray-500 mr-2" />
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex items-center">
            <div className="w-[18px] mr-2"></div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex items-center">
            <MapPin size={18} className="text-gray-500 mr-2" />
            <Input
              type="text"
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="mb-4 flex items-start">
            <AlignLeft size={18} className="text-gray-500 mr-2 mt-2" />
            <textarea
              placeholder="Add description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color.bgClass} ${colorCode === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  onClick={() => setColorCode(color.value)}
                  title={color.label}
                ></button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isRecurring" className="flex items-center text-sm font-medium text-gray-700">
                <Repeat size={16} className="mr-1" /> Recurring event
              </label>
            </div>
            
            {isRecurring && (
              <div className="ml-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeats
                  </label>
                  <select
                    value={recurringPattern}
                    onChange={(e) => setRecurringPattern(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ends on
                  </label>
                  <Input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full"
                    required={isRecurring}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {!isNewEvent && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                leftIcon={<Trash2 size={16} />}
              >
                Delete
              </Button>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {isNewEvent ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
