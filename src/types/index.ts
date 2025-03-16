export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  colorCode?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: Date;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface TimeSlot {
  time: Date;
  events: CalendarEvent[];
}

export interface DayData {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
