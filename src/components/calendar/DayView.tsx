import React, { useRef } from 'react';
import { format, isSameDay, differenceInMinutes, addMinutes, setHours, setMinutes } from 'date-fns';
import { CalendarEvent } from '../../types';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEventDrop: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  events, 
  onEventSelect,
  onCreateEvent,
  onEventDrop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedEventRef = useRef<{ id: string, startOffset: number } | null>(null);
  
  // Create time slots for each hour (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter events for the current day
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.start), currentDate) || 
    isSameDay(new Date(event.end), currentDate)
  );
  
  // Current time indicator
  const now = new Date();
  const currentTimePosition = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
  const isToday = isSameDay(currentDate, now);
  
  // Helper to get event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Calculate start and end times for display
    const displayStart = isSameDay(eventStart, currentDate) 
      ? eventStart 
      : setHours(setMinutes(new Date(currentDate), 0), 0);
      
    const displayEnd = isSameDay(eventEnd, currentDate) 
      ? eventEnd 
      : setHours(setMinutes(new Date(currentDate), 59), 23);
    
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
  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, hour: number) => {
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
    const newStart = new Date(currentDate);
    newStart.setHours(hours, minutes, 0, 0);
    
    // Maintain the same duration
    const duration = differenceInMinutes(new Date(event.end), new Date(event.start));
    const newEnd = addMinutes(newStart, duration);
    
    // Update the event
    onEventDrop(eventId, newStart, newEnd);
    
    // Reset drag state
    draggedEventRef.current = null;
  };

  // Group overlapping events
  const groupEvents = (events: CalendarEvent[]) => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    const columns: CalendarEvent[][] = [];
    
    sortedEvents.forEach(event => {
      // Find the first column where this event doesn't overlap
      const columnIndex = columns.findIndex(column => {
        const lastEvent = column[column.length - 1];
        return new Date(lastEvent.end).getTime() <= new Date(event.start).getTime();
      });
      
      if (columnIndex === -1) {
        // Create a new column
        columns.push([event]);
      } else {
        // Add to existing column
        columns[columnIndex].push(event);
      }
    });
    
    return columns;
  };
  
  const eventColumns = groupEvents(dayEvents);
  const columnCount = eventColumns.length;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 py-2 text-center">
        <h3 className="text-lg font-medium text-gray-800">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        <div className="relative grid grid-cols-[100px_1fr] h-[1440px]">
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
          
          {/* Events container */}
          <div className="relative">
            {/* Hour cells */}
            {hours.map(hour => (
              <div 
                key={hour}
                className="h-[60px] border-b border-gray-200 hover:bg-gray-50"
                onClick={() => onCreateEvent(currentDate, hour)}
                onDragOver={(e) => handleDragOver(e, hour)}
                onDrop={(e) => handleDrop(e, hour)}
              ></div>
            ))}
            
            {/* Half-hour grid lines */}
            {hours.map(hour => (
              <div 
                key={`half-${hour}`}
                className="absolute left-0 right-0 border-b border-gray-100"
                style={{ top: `${(hour * 60 + 30) / 1440 * 100}%` }}
              ></div>
            ))}
            
            {/* Events */}
            {dayEvents.map(event => {
              const style = getEventStyle(event);
              
              // Find which column this event belongs to
              let columnIndex = 0;
              let columnWidth = 100;
              let leftOffset = 0;
              
              if (columnCount > 1) {
                for (let i = 0; i < eventColumns.length; i++) {
                  if (eventColumns[i].some(e => e.id === event.id)) {
                    columnIndex = i;
                    break;
                  }
                }
                
                columnWidth = 100 / columnCount;
                leftOffset = columnIndex * columnWidth;
              }
              
              const eventStyle = {
                ...style,
                left: `${leftOffset}%`,
                width: `${columnWidth}%`
              };
              
              return (
                <div
                  key={event.id}
                  className="absolute rounded px-2 overflow-hidden cursor-pointer"
                  style={eventStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventSelect(event);
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                >
                  <div className="text-sm font-medium truncate">
                    {event.title}
                  </div>
                  {parseFloat(style.height) > 5 && (
                    <>
                      <div className="text-xs truncate">
                        {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                      </div>
                      {parseFloat(style.height) > 10 && event.location && (
                        <div className="text-xs truncate mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Current time indicator */}
            {isToday && (
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
    </div>
  );
};

export default DayView;
