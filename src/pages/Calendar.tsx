import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, subDays, parse, isWithinInterval } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import MiniCalendar from '../components/calendar/MiniCalendar';
import EventModal from '../components/calendar/EventModal';
import { CalendarEvent, CalendarView } from '../types';

// Sample events data
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Property Viewing',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    location: '123 Main St',
    description: 'Meeting with potential buyers',
    colorCode: 'blue',
  },
  {
    id: '2',
    title: 'Investor Meeting',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    location: 'Office',
    description: 'Discuss funding for new development',
    colorCode: 'green',
  },
  {
    id: '3',
    title: 'Contract Signing',
    start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(11, 0, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(12, 0, 0, 0)),
    location: 'Legal Office',
    description: 'Finalize purchase agreement',
    colorCode: 'purple',
  },
  {
    id: '4',
    title: 'Property Inspection',
    start: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(9, 0, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 0, 0, 0)),
    location: '456 Oak Ave',
    description: 'Complete inspection with licensed inspector',
    colorCode: 'orange',
  },
  {
    id: '5',
    title: 'Team Standup',
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 30, 0, 0)),
    location: 'Conference Room',
    description: 'Weekly team meeting',
    colorCode: 'red',
    isRecurring: true,
    recurringPattern: 'weekly',
  }
];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const navigatePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (currentView === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    if (currentView === 'month') {
      setCurrentView('day');
    }
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCreateEvent = (date?: Date, hour?: number) => {
    const startDate = date || currentDate;
    let startTime = new Date(startDate);
    
    if (hour !== undefined) {
      startTime.setHours(hour, 0, 0, 0);
    } else {
      // Default to current time, rounded to nearest half hour
      const minutes = startTime.getMinutes();
      const roundedMinutes = minutes < 30 ? 30 : 0;
      const roundedHours = minutes < 30 ? startTime.getHours() : startTime.getHours() + 1;
      startTime.setHours(roundedHours, roundedMinutes, 0, 0);
    }
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);
    
    setSelectedEvent({
      id: '',
      title: '',
      start: startTime,
      end: endTime,
      colorCode: 'blue'
    });
    setSelectedDate(startDate);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (event.id) {
      // Update existing event
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      // Create new event
      const newEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 11)
      };
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventDrop = (eventId: string, newStart: Date, newEnd: Date) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return event;
    }));
  };

  const getViewTitle = () => {
    if (currentView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (currentView === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
      } else {
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={() => handleCreateEvent()}
            leftIcon={<Plus size={16} />}
          >
            Create
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('month')}
              className={currentView === 'month' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
            >
              Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('week')}
              className={currentView === 'week' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
            >
              Week
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('day')}
              className={currentView === 'day' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
            >
              Day
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-64 flex-shrink-0">
          <Card className="mb-6">
            <Button 
              variant="primary" 
              className="w-full mb-4"
              leftIcon={<Plus size={16} />}
              onClick={() => handleCreateEvent()}
            >
              Create Event
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={navigateToToday}
            >
              Today
            </Button>
            
            <MiniCalendar 
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
              events={events}
            />
          </Card>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1 mr-2"
                  onClick={navigatePrevious}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1 mr-4"
                  onClick={navigateNext}
                >
                  <ChevronRight size={18} />
                </Button>
                <h2 className="text-xl font-medium text-gray-800">{getViewTitle()}</h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {currentView === 'month' && (
                <MonthView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateSelect={handleDateSelect}
                  onEventSelect={handleEventSelect}
                  onCreateEvent={handleCreateEvent}
                />
              )}
              
              {currentView === 'week' && (
                <WeekView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                  onCreateEvent={handleCreateEvent}
                  onEventDrop={handleEventDrop}
                />
              )}
              
              {currentView === 'day' && (
                <DayView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventSelect={handleEventSelect}
                  onCreateEvent={handleCreateEvent}
                  onEventDrop={handleEventDrop}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;
