
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Mail, CalendarDays, CalendarIcon as CalendarIconLucide, Info, Clock, ListTodo } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { toast } from "sonner"
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialTasks, Task as TaskManagementTask } from '../tasks/page';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  linkedMessageId?: string;
  attendees?: string[];
  type: 'email' | 'whatsapp' | 'call' | 'manual';
  category: 'appointment' | 'task';
  // Appointment specific
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  isAllDay?: boolean;
  // Task specific
  priority?: 'low' | 'medium' | 'high';
}

// Initial mock events will now primarily be appointments
const initialMockAppointments: CalendarEvent[] = [
  { id: 'evt1', title: 'Team Sync - All Day', date: new Date(), description: 'Discuss weekly goals.', type: 'manual', category: 'appointment', isAllDay: true },
  { id: '1', title: 'Meeting with Client X', date: new Date(new Date().setDate(new Date().getDate() + 2)), description: 'Discuss project milestones.', linkedMessageId: 'email1', attendees: ['Alice', 'Bob'], type: 'email', category: 'appointment', startTime: '10:00', endTime: '11:00', isAllDay: false },
  { id: '2', title: 'Follow-up Call with Prospect Y', date: new Date(new Date().setDate(new Date().getDate() + 5)), description: 'Follow up on the proposal.', type: 'call', category: 'appointment', startTime: '14:00', endTime: '14:30', isAllDay: false },
  { id: '3', title: 'WhatsApp Demo with Team Lead', date: new Date(), description: 'Demo new WhatsApp features.', linkedMessageId: 'wa1', attendees: ['David'], type: 'whatsapp', category: 'appointment', startTime: '09:00', endTime: '09:30', isAllDay: false },
  { id: 'evt2', title: 'Client Lunch', date: new Date(), description: 'Lunch meeting with new client.', type: 'manual', category: 'appointment', startTime: '12:30', endTime: '13:30', isAllDay: false },
];

// Map tasks from Task Management to CalendarEvent format
const tasksFromManagement: CalendarEvent[] = initialTasks.map((task: TaskManagementTask) => {
  // Helper to safely parse date string, accounting for timezone issues with yyyy-mm-dd
  const parseDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  return {
    id: `task-mgmt-${task.id}`, // Prefix to avoid ID collision
    title: task.title,
    description: task.description || '',
    // Use current date if dueDate is undefined, otherwise parse it
    date: task.dueDate ? parseDateString(task.dueDate) : new Date(new Date().setHours(0,0,0,0)),
    attendees: task.assignee ? [task.assignee.name] : [], // Map assignee to attendees if needed
    type: 'manual', // Default type for tasks from task management
    category: 'task',
    priority: task.priority,
    isAllDay: true, // Tasks from task management are treated as all-day for calendar view
  };
});


const defaultEventFormData: Omit<CalendarEvent, 'id'> = {
  title: '',
  date: new Date(),
  description: '',
  attendees: [],
  type: 'manual',
  category: 'appointment',
  startTime: '09:00',
  endTime: '10:00',
  isAllDay: false,
  priority: 'medium',
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Initialize allEvents with appointments and tasks from task management
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([...initialMockAppointments, ...tasksFromManagement]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailDialogOpen, setIsEventDetailDialogOpen] = useState(false);
  
  const [isEventFormDialogOpen, setIsEventFormDialogOpen] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<'add' | 'edit'>('add');
  const [currentEventData, setCurrentEventData] = useState<Omit<CalendarEvent, 'id'> & { id?: string }>(defaultEventFormData);

  const [formattedSelectedDate, setFormattedSelectedDate] = useState<string>('');
  const [formattedEventDate, setFormattedEventDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'tasks'>('appointments');


  useEffect(() => {
    if (selectedDate) {
      setFormattedSelectedDate(selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    } else {
      setFormattedSelectedDate('selected date');
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedEvent) {
      let dateStr = selectedEvent.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      if (selectedEvent.category === 'appointment' && !selectedEvent.isAllDay && selectedEvent.startTime) {
        dateStr += `, ${selectedEvent.startTime}`;
        if (selectedEvent.endTime) {
          dateStr += ` - ${selectedEvent.endTime}`;
        }
      } else if (selectedEvent.category === 'appointment' && selectedEvent.isAllDay) {
        dateStr += ' (All-day)';
      }
      setFormattedEventDate(dateStr);
    } else {
      setFormattedEventDate(null);
    }
  }, [selectedEvent]);

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return allEvents.filter(event => {
        const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate());
        return eventDate.getTime() === targetDate.getTime();
      }
    );
  }, [allEvents, selectedDate]);
  
  const eventsForSelectedDateAppointments = useMemo(() => {
    return eventsForSelectedDate
      .filter(e => e.category === 'appointment')
      .sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        
        if (a.isAllDay && b.isAllDay) {
            return a.title.localeCompare(b.title);
        }

        const timeA = a.startTime;
        const timeB = b.startTime;

        if (timeA && timeB) {
          return timeA.localeCompare(timeB);
        }
        if (timeA) return -1; 
        if (timeB) return 1;
        return 0; 
      });
  }, [eventsForSelectedDate]);

  const eventsForSelectedDateTasks = useMemo(() => {
    return eventsForSelectedDate
      .filter(e => e.category === 'task')
      .sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const priorityA = priorityOrder[a.priority || 'medium'] || 3;
        const priorityB = priorityOrder[b.priority || 'medium'] || 3;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.title.localeCompare(b.title);
      });
  }, [eventsForSelectedDate]);


  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailDialogOpen(true);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    const newSelectedDate = new Date(month.getFullYear(), month.getMonth(), selectedDate?.getDate() || 1);
    if (newSelectedDate.getMonth() !== month.getMonth()) {
        setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    } else {
        setSelectedDate(newSelectedDate);
    }
  }

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleOpenAddEventDialog = () => {
    setEventFormMode('add');
    const defaultCategory = activeTab === 'tasks' ? 'task' : 'appointment';
    setCurrentEventData({ ...defaultEventFormData, date: selectedDate || new Date(), category: defaultCategory });
    setIsEventFormDialogOpen(true);
  };
  
  const handleOpenEditEventDialog = (eventToEdit: CalendarEvent) => {
    setEventFormMode('edit');
    setCurrentEventData({ ...eventToEdit });
    setIsEventDetailDialogOpen(false); 
    setIsEventFormDialogOpen(true);
  };

  // Helper function to generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the end of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Helper function to get events for a specific day
  const getDayEvents = (date: Date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return allEvents.filter(event => {
      const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate());
      return eventDate.getTime() === targetDate.getTime();
    }).sort((a, b) => {
      // Sort by time if appointments
      if (a.category === 'appointment' && b.category === 'appointment') {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
      }
      return 0;
    });
  };


  const handleCurrentEventDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setCurrentEventData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : name === 'attendees' ? value.split(',').map(a => a.trim()) : value 
    }));
  };
  
  const handleCurrentEventDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentEventData(prev => ({ ...prev, date }));
    }
  };

  const handleCurrentEventTypeChange = (value: CalendarEvent['type']) => {
    setCurrentEventData(prev => ({ ...prev, type: value }));
  };

  const handleCurrentEventCategoryChange = (value: CalendarEvent['category']) => {
    setCurrentEventData(prev => ({ ...prev, category: value }));
  };

  const handleCurrentEventPriorityChange = (value: string) => {
    setCurrentEventData(prev => ({ ...prev, priority: value as CalendarEvent['priority'] }));
  };

  const handleSaveEvent = () => {
    if (!currentEventData.title || !currentEventData.date) {
      toast.error("Error", {
        description: "Event title and date are required."
      });
      return;
    }

    if (currentEventData.category === 'appointment' && !currentEventData.isAllDay) {
        if (!currentEventData.startTime || !currentEventData.endTime) {
            toast.error("Start and end times are required for non-all-day appointments.");
            return;
        }
        if (currentEventData.startTime >= currentEventData.endTime) {
            toast.error("Start time must be before end time.");
            return;
        }
    }


    if (eventFormMode === 'add') {
      const finalNewEvent: CalendarEvent = {
        ...(currentEventData as Omit<CalendarEvent, 'id' | 'attendees'>), 
        id: `evt-cal-${Date.now()}`, // Prefixed to distinguish from task-mgmt ids
        attendees: typeof currentEventData.attendees === 'string' ? (currentEventData.attendees as string).split(',').map(a => a.trim()) : currentEventData.attendees || [],
      };
      setAllEvents(prev => [...prev, finalNewEvent]);
      toast.success("Event Created", {
        description: `"${finalNewEvent.title}" has been added to your calendar. (Note: This is local to the calendar page for now.)`
      });
    } else if (eventFormMode === 'edit' && currentEventData.id) {
       const updatedEventData = {
        ...currentEventData,
        attendees: typeof currentEventData.attendees === 'string' ? (currentEventData.attendees as string).split(',').map(a => a.trim()) : currentEventData.attendees || [],
      };
      setAllEvents(prev => prev.map(event => event.id === currentEventData.id ? { ...event, ...updatedEventData } as CalendarEvent : event));
      toast.success("Event Updated", {
        description: `"${currentEventData.title}" has been updated. (Note: This is local…)`
      });
    }
    
    setIsEventFormDialogOpen(false);
    setCurrentEventData(defaultEventFormData); 
  };

  const getEventTypeDisplay = (type: CalendarEvent['type']) => {
    switch(type) {
      case 'email': return 'From Email';
      case 'whatsapp': return 'From WhatsApp';
      case 'call': return 'From Call Log';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTodayClick}>
            <CalendarIconLucide className="mr-2 h-5 w-5" /> Today
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenAddEventDialog}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Event
          </Button>
        </div>
      </div>

      {/* Compact Month View */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                ←
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Custom Month Grid */}
          <div className="grid grid-cols-7 border-t">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-b bg-muted/30">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {generateCalendarDays().map((day, index) => {
              const dayEvents = getDayEvents(day.date);
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              const isToday = day.date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border-r border-b cursor-pointer transition-colors relative
                    ${day.isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                    ${isSelected ? 'bg-primary/10 ring-2 ring-primary/20' : ''}
                    ${isToday ? 'bg-accent/20' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {/* Day Number */}
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Events for the day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`
                          text-xs p-1 rounded truncate cursor-pointer
                          ${event.category === 'appointment' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsEventDetailDialogOpen(true);
                        }}
                        title={event.title}
                      >
                        {event.category === 'appointment' && !event.isAllDay && event.startTime && (
                          <span className="font-medium">{event.startTime} </span>
                        )}
                        {event.title}
                      </div>
                    ))}
                    
                    {/* Show +X more if there are more events */}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'appointments' | 'tasks')} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="appointments" className="gap-2">
                <CalendarDays className="h-4 w-4" /> Appointments ({eventsForSelectedDateAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <ListTodo className="h-4 w-4" /> Tasks ({eventsForSelectedDateTasks.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="appointments">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>
                  Appointments for {formattedSelectedDate}
                </CardTitle>
                <CardDescription>
                  {eventsForSelectedDateAppointments.length === 0 
                    ? "No appointments scheduled for this date." 
                    : `${eventsForSelectedDateAppointments.length} appointment(s) scheduled.`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {eventsForSelectedDateAppointments.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventDetailDialogOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            {event.startTime && (
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {event.isAllDay ? 'All day' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {event.type !== 'manual' && (
                              <Badge variant="outline" className="text-xs">
                                {getEventTypeDisplay(event.type)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>
                  Tasks for {formattedSelectedDate}
                </CardTitle>
                <CardDescription>
                  {eventsForSelectedDateTasks.length === 0 
                    ? "No tasks scheduled for this date." 
                    : `${eventsForSelectedDateTasks.length} task(s) scheduled.`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {eventsForSelectedDateTasks.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventDetailDialogOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {event.priority && (
                              <Badge 
                                variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {event.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailDialogOpen} onOpenChange={setIsEventDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
              <div className="flex gap-2 flex-wrap">
                {selectedEvent?.type !== 'manual' && selectedEvent?.type !== 'call' && (
                    <Badge variant="outline" className="capitalize text-xs">{getEventTypeDisplay(selectedEvent.type)}</Badge>
                )}
                <Badge variant={selectedEvent?.category === 'appointment' ? 'default' : 'secondary'} className="capitalize text-xs">{selectedEvent?.category}</Badge>
                 {selectedEvent?.category === 'task' && selectedEvent?.priority && (
                    <Badge variant={selectedEvent.priority === 'high' ? 'destructive' : selectedEvent.priority === 'medium' ? 'default' : 'outline'} className="capitalize text-xs">
                        {selectedEvent.priority} Priority
                    </Badge>
                )}
              </div>
            </div>
            <DialogDescription>
              <p><span className="font-semibold">Date:</span> {formattedEventDate}</p>
              <p><span className="font-semibold">Description:</span> {selectedEvent?.description}</p>
              {selectedEvent?.attendees && selectedEvent.attendees.length > 0 && <p><span className="font-semibold">Attendees:</span> {selectedEvent.attendees.join(', ')}</p>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selectedEvent && handleOpenEditEventDialog(selectedEvent)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedEvent) {
                setAllEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
                setIsEventDetailDialogOpen(false);
                toast.success('Event deleted successfully');
              }
            }}>
              Delete
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'appointments' | 'tasks')} className="w-full">
          <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-2">
              <TabsTrigger value="appointments" className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Appointments ({eventsForSelectedDateAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                  <ListTodo className="h-4 w-4" /> Tasks ({eventsForSelectedDateTasks.length})
              </TabsTrigger>
              </TabsList>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 ml-4" onClick={handleOpenAddEventDialog}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Event
              </Button>
          </div>
            
          <TabsContent value="appointments">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>
                    Appointments for {formattedSelectedDate || 'Loading date...'}
                  </CardTitle>
                  <CardDescription>
                    {eventsForSelectedDateAppointments.length > 0
                      ? `${eventsForSelectedDateAppointments.length} appointment(s) scheduled.`
                      : "No appointments scheduled for this day."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDateAppointments.length > 0 ? (
                    <ul className="space-y-4">
                      {eventsForSelectedDateAppointments.map((event) => (
                        <li
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors shadow-sm"
                          role="button"
                          tabIndex={0}
                          aria-label={`Appointment: ${event.title}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-md">{event.title}</h4>
                            {event.type !== 'manual' && event.type !== 'call' && (
                              <Badge variant="outline" className="capitalize text-xs">{getEventTypeDisplay(event.type)}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1"/>
                            {event.isAllDay ? 'All-day' : `${event.startTime || ''} - ${event.endTime || ''}`}
                          </p>
                          {event.attendees && event.attendees.length > 0 && <p className="text-xs text-muted-foreground mt-1">Attendees: {event.attendees.join(', ')}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <CalendarDays className="h-12 w-12 mx-auto mb-2" />
                      <p>No appointments. Enjoy your day!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>
                    Tasks for {formattedSelectedDate || 'Loading date...'}
                  </CardTitle>
                  <CardDescription>
                    {eventsForSelectedDateTasks.length > 0
                      ? `${eventsForSelectedDateTasks.length} task(s) for today.`
                      : "No tasks scheduled for this day."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDateTasks.length > 0 ? (
                    <ul className="space-y-4">
                      {eventsForSelectedDateTasks.map((event) => (
                        <li
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors shadow-sm"
                          role="button"
                          tabIndex={0}
                          aria-label={`Task: ${event.title}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-md">{event.title}</h4>
                             <Badge 
                              variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'outline'} 
                              className="capitalize text-xs"
                            >
                              {event.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">{event.description}</p>
                           {event.type !== 'manual' && event.type !== 'call' && (
                            <Badge variant='secondary' className="capitalize text-xs mt-1">{getEventTypeDisplay(event.type)}</Badge>
                           )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <ListTodo className="h-12 w-12 mx-auto mb-2" />
                      <p>No tasks. Well done!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </div>

      {selectedEvent && (
        <Dialog open={isEventDetailDialogOpen} onOpenChange={setIsEventDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="flex items-center flex-wrap gap-1">
                <span>{formattedEventDate || 'Loading date...'}</span>
                {selectedEvent.type !== 'manual' && selectedEvent.type !== 'call' && (
                    <Badge variant="outline" className="capitalize text-xs">{getEventTypeDisplay(selectedEvent.type)}</Badge>
                )}
                <Badge variant={selectedEvent.category === 'appointment' ? 'default' : 'secondary'} className="capitalize text-xs">{selectedEvent.category}</Badge>
                 {selectedEvent.category === 'task' && selectedEvent.priority && (
                    <Badge variant={selectedEvent.priority === 'high' ? 'destructive' : selectedEvent.priority === 'medium' ? 'default' : 'outline'} className="capitalize text-xs">
                        {selectedEvent.priority} Priority
                    </Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p><span className="font-semibold">Description:</span> {selectedEvent.description}</p>
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && <p><span className="font-semibold">Attendees:</span> {selectedEvent.attendees.join(', ')}</p>}
              {selectedEvent.linkedMessageId && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/inbox?messageId=${selectedEvent.linkedMessageId}`}>
                    <Mail className="mr-2 h-4 w-4" /> View Original Message
                  </a>
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDetailDialogOpen(false)}>Close</Button>
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90" 
                onClick={() => handleOpenEditEventDialog(selectedEvent)}
              >
                Edit Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEventFormDialogOpen} onOpenChange={setIsEventFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{eventFormMode === 'add' ? 'Add New Event' : 'Edit Event'}</DialogTitle>
            <DialogDescription>
              {eventFormMode === 'add' ? 'Fill in the details for your new calendar event.' : 'Update the details for your event.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] overflow-y-auto pr-6 pl-2 py-2">
            <div className="space-y-6">

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-primary font-semibold">Category</Label>
                <Select value={currentEventData.category} onValueChange={handleCurrentEventCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={currentEventData.title} onChange={handleCurrentEventDataChange} placeholder="Event Title" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                 <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIconLucide className="mr-2 h-4 w-4" />
                        {currentEventData.date ? format(currentEventData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <ShadcnCalendar
                        mode="single"
                        selected={currentEventData.date}
                        onSelect={handleCurrentEventDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="type">Source Type</Label>
                  <Select value={currentEventData.type} onValueChange={handleCurrentEventTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event source type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="email">From Email</SelectItem>
                      <SelectItem value="whatsapp">From WhatsApp</SelectItem>
                      <SelectItem value="call">From Call Log</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
               <div className="space-y-1.5">
                  <Label htmlFor="attendees">Attendees</Label>
                  <Input 
                    id="attendees" 
                    name="attendees" 
                    value={(currentEventData.attendees || []).join(', ')} 
                    onChange={handleCurrentEventDataChange} 
                    placeholder="john@example.com, jane@example.com" 
                  />
                  <p className="text-xs text-muted-foreground pt-1">Separate with commas.</p>
              </div>

              {currentEventData.category === 'appointment' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="isAllDay" 
                        name="isAllDay"
                        checked={currentEventData.isAllDay} 
                        onCheckedChange={(checked) => setCurrentEventData(prev => ({...prev, isAllDay: Boolean(checked)}))}
                    />
                    <Label htmlFor="isAllDay" className="text-sm font-normal">All-day event</Label>
                  </div>
                  {!currentEventData.isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" name="startTime" type="time" value={currentEventData.startTime} onChange={handleCurrentEventDataChange} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" name="endTime" type="time" value={currentEventData.endTime} onChange={handleCurrentEventDataChange} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentEventData.category === 'task' && (
                <div className="space-y-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={currentEventData.priority} onValueChange={handleCurrentEventPriorityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={currentEventData.description} onChange={handleCurrentEventDataChange} placeholder="Event description..." rows={5} />
              </div>

            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsEventFormDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEvent} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {eventFormMode === 'add' ? 'Save Event' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
