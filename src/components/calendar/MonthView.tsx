import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isWithinInterval, addMinutes } from 'date-fns';
import { CalendarEvent, DayData } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  currentDate, 
  events, 
  onDateSelect, 
  onEventSelect,
  onCreateEvent
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group events by day
  const daysWithEvents: DayData[] = days.map(day => {
    const dayEvents = events.filter(event => {
      // Check if event occurs on this day
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // For single-day events
      if (isSameDay(eventStart, day)) {
        return true;
      }
      
      // For multi-day events
      if (isWithinInterval(day, { start: eventStart, end: eventEnd })) {
        return true;
      }
      
      return false;
    });

    return {
      date: day,
      events: dayEvents,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, new Date())
    };
  });

  // Split days into weeks
  const weeks: DayData[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(daysWithEvents.slice(i, i + 7));
  }

  // Sort events by start time
  const sortEventsByTime = (events: CalendarEvent[]) => {
    return [...events].sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  };

  // Limit events shown per day
  const MAX_VISIBLE_EVENTS = 3;

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map(day => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-6 h-full">
        {weeks.flat().map((dayData, index) => {
          const { date, events, isCurrentMonth, isToday } = dayData;
          const sortedEvents = sortEventsByTime(events);
          const visibleEvents = sortedEvents.slice(0, MAX_VISIBLE_EVENTS);
          const hasMoreEvents = sortedEvents.length > MAX_VISIBLE_EVENTS;
          
          return (
            <div 
              key={index}
              className={`
                border-b border-r border-gray-200 p-1 overflow-hidden
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateSelect(date)}
            >
              <div className="flex justify-between items-center mb-1">
                <span 
                  className={`
                    text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                  `}
                >
                  {format(date, 'd')}
                </span>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateEvent(date);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-1">
                {visibleEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`
                      text-xs truncate rounded px-1 py-0.5 cursor-pointer
                      bg-${event.colorCode || 'blue'}-100 text-${event.colorCode || 'blue'}-800
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(event);
                    }}
                  >
                    {format(new Date(event.start), 'h:mm a')} {event.title}
                  </div>
                ))}
                
                {hasMoreEvents && (
                  <div 
                    className="text-xs text-gray-500 px-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    +{sortedEvents.length - MAX_VISIBLE_EVENTS} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
