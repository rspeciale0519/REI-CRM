import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onDateSelect, events }) => {
  const [calendarDate, setCalendarDate] = useState(startOfMonth(currentDate));
  
  useEffect(() => {
    setCalendarDate(startOfMonth(currentDate));
  }, [currentDate]);

  const navigatePreviousMonth = () => {
    setCalendarDate(subMonths(calendarDate, 1));
  };

  const navigateNextMonth = () => {
    setCalendarDate(addMonths(calendarDate, 1));
  };

  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const hasEventOnDay = (day: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={navigatePreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-medium">
          {format(calendarDate, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={navigateNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, calendarDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, currentDate);
          const hasEvent = hasEventOnDay(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                text-xs py-1 rounded-full relative
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'font-bold' : ''}
                ${isSelected ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
              `}
            >
              {format(day, 'd')}
              {hasEvent && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
