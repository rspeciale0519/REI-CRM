import React, { useRef } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, addHours, isSameDay, isWithinInterval, differenceInMinutes, addMinutes, setHours, setMinutes } from 'date-fns';
import { CalendarEvent } from '../../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEventDrop: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  events, 
  onEventSelect,
  onCreateEvent,
  onEventDrop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedEventRef = useRef<{ id: string, startOffset: number } | null>(null);
  
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Create time slots for each hour (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Current time indicator
  const now = new Date();
  const currentTimePosition = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
  const isCurrentWeek = days.some(day => isSameDay(day, now));
  
  // Helper to get event position and height
  const getEventStyle = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Check if event is on this day
    if (!isSameDay(eventStart, day) && !isSameDay(eventEnd, day) && 
        !isWithinInterval(day, { start: eventStart, end: eventEnd })) {
      return null;
    }
    
    // Calculate start and end times for display
    const displayStart = isSameDay(eventStart, day) 
      ? eventStart 
      : setHours(setMinutes(new Date(day), 0), 0);
      
    const displayEnd = isSameDay(eventEnd, day) 
      ? eventEnd 
      : setHours(setMinutes(new Date(day), 59), 23);
    
    // Calculate position and height
    const startMinutes = displayStart.getHours() * 60 + displayStart.getMinutes();
    const endMinutes = displayEnd.getHours() * 60 + displayEnd.getMinutes();
    const durationMinutes = endMinutes - startMinutes;
    
    const top = (startMinutes / 1440) * 100;
    const height = (durationMinutes / 1440) * 100;
    
    return {
      top: `${top}%`,
      height: `${height}%`,
      backgroundColor: event.colorCode ? `var(--color-${event.colorCode}-100)` : 'var(--color-blue-100)',
      borderLeft: `3px solid ${event.colorCode ? `var(--color-${event.colorCode}-500)` : 'var(--color-blue-500)'}`,
      color: event.colorCode ? `var(--color-${event.colorCode}-800)` : 'var(--color-blue-800)',
    };
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.setData('text/plain', event.id);
    
    // Calculate offset within the event where the drag started
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    
    draggedEventRef.current = {
      id: event.id,
      startOffset: offsetY
    };
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId || !draggedEventRef.current) return;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Calculate the drop position in minutes
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const relativeY = e.clientY - containerRect.top;
    const totalHeight = containerRect.height;
    const minutesPerPixel = 24 * 60 / totalHeight;
    
    // Calculate new start time based on drop position and drag offset
    const offsetMinutes = draggedEventRef.current.startOffset * minutesPerPixel;
    const dropMinutes = relativeY * minutesPerPixel - offsetMinutes;
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(dropMinutes / 15) * 15;
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    
    // Create new start and end times
    const newStart = new Date(day);
    newStart.setHours(hours, minutes, 0, 0);
    
    // Maintain the same duration
    const duration = differenceInMinutes(new Date(event.end), new Date(event.start));
    const newEnd = addMinutes(newStart, duration);
    
    // Update the event
    onEventDrop(eventId, newStart, newEnd);
    
    // Reset drag state
    draggedEventRef.current = null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="py-2 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
          GMT
        </div>
        {days.map(day => (
          <div 
            key={day.toString()} 
            className="py-2 text-center text-sm font-medium text-gray-700"
          >
            <div>{format(day, 'EEE')}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        <div className="relative grid grid-cols-8 h-[1440px]">
          {/* Time labels */}
          <div className="border-r border-gray-200">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-[60px] border-b border-gray-200 text-xs text-gray-500 pr-2 text-right relative"
              >
                <span className="absolute -top-2 right-2">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          {days.map(day => (
            <div 
              key={day.toString()} 
              className="relative border-r border-gray-200"
            >
              {/* Hour cells */}
              {hours.map(hour => (
                <div 
                  key={hour}
                  className="h-[60px] border-b border-gray-200 hover:bg-gray-50"
                  onClick={() => onCreateEvent(day, hour)}
                  onDragOver={(e) => handleDragOver(e, day, hour)}
                  onDrop={(e) => handleDrop(e, day, hour)}
                ></div>
              ))}
              
              {/* Events */}
              {events.map(event => {
                const style = getEventStyle(event, day);
                if (!style) return null;
                
                return (
                  <div
                    key={event.id}
                    className="absolute left-0 right-0 mx-1 rounded px-1 overflow-hidden cursor-pointer"
                    style={style}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(event);
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                  >
                    <div className="text-xs font-medium truncate">
                      {event.title}
                    </div>
                    {parseFloat(style.height) > 5 && (
                      <div className="text-xs truncate">
                        {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Current time indicator */}
          {isCurrentWeek && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="absolute -left-1 -top-2 w-4 h-4 rounded-full bg-red-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
