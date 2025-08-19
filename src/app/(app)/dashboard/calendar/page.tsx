"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarIcon as CalendarIconLucide, ListTodo, CalendarDays } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner"

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  linkedMessageId?: string;
  attendees?: string[];
  type: 'email' | 'whatsapp' | 'call' | 'manual';
  category: 'appointment' | 'task';
  color?: string; // User-assigned color
  // Appointment specific
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  isAllDay?: boolean;
  // Task specific
  priority?: 'low' | 'medium' | 'high';
}

// Sample events
const initialMockEvents: CalendarEvent[] = [
  { 
    id: 'evt1', 
    title: 'Team Meeting', 
    date: new Date(), 
    description: 'Weekly team sync meeting', 
    type: 'manual', 
    category: 'appointment', 
    startTime: '10:00',
    endTime: '11:00',
    color: '#3b82f6' // Custom blue
  },
  { 
    id: 'evt2', 
    title: 'Review Documents', 
    date: new Date(new Date().setDate(new Date().getDate() + 1)), 
    description: 'Review Q4 reports', 
    type: 'manual', 
    category: 'task',
    priority: 'high',
    color: '#ef4444' // Custom red
  },
  { 
    id: 'evt3', 
    title: 'Client Call', 
    date: new Date(new Date().setDate(new Date().getDate() + 2)), 
    description: 'Call with potential client', 
    type: 'call', 
    category: 'appointment',
    startTime: '14:30',
    endTime: '15:30',
    color: '#10b981' // Custom green
  },
];

const defaultEventFormData: Omit<CalendarEvent, 'id'> = {
  title: '',
  date: new Date(),
  description: '',
  type: 'manual',
  category: 'appointment',
  startTime: '09:00',
  endTime: '10:00',
  isAllDay: false,
  priority: 'medium'
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(initialMockEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailDialogOpen, setIsEventDetailDialogOpen] = useState(false);
  const [isEventFormDialogOpen, setIsEventFormDialogOpen] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<'add' | 'edit'>('add');
  const [currentEventData, setCurrentEventData] = useState<Omit<CalendarEvent, 'id'> & { id?: string }>(defaultEventFormData);
  const [formattedEventDate, setFormattedEventDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'tasks'>('appointments');
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  // Color automation settings
  const [colorAutomation, setColorAutomation] = useState({
    enabled: true,
    rules: {
      appointment: '#3b82f6', // Blue
      task: '#10b981', // Green
      'high-priority': '#ef4444', // Red
      'medium-priority': '#f59e0b', // Amber
      'low-priority': '#6b7280', // Gray
      email: '#8b5cf6', // Purple
      whatsapp: '#059669', // Emerald
      call: '#dc2626', // Red
      manual: '#6366f1' // Indigo
    }
  });

  // Predefined color palette
  const colorPalette = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#64748b', '#dc2626', '#059669', '#7c3aed', '#0891b2'
  ];

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
    });
  }, [allEvents, selectedDate]);
  
  const eventsForSelectedDateAppointments = useMemo(() => {
    return eventsForSelectedDate
      .filter(e => e.category === 'appointment')
      .sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return 0;
      });
  }, [eventsForSelectedDate]);

  const eventsForSelectedDateTasks = useMemo(() => {
    return eventsForSelectedDate
      .filter(e => e.category === 'task')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        return bPriority - aPriority;
      });
  }, [eventsForSelectedDate]);

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
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
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

  const getEventTypeDisplay = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'call': return 'Call';
      default: return 'Manual';
    }
  };

  const handleCurrentEventDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = () => {
    if (!currentEventData.title.trim()) {
      toast.error('Please enter a title for the event');
      return;
    }

    if (eventFormMode === 'add') {
      const automaticColor = getAutomaticColor(currentEventData);
      const newEvent: CalendarEvent = {
        ...currentEventData,
        id: Date.now().toString(),
        date: currentEventData.date || new Date(),
        // Apply automatic color if no color is selected
        color: currentEventData.color || automaticColor || undefined
      } as CalendarEvent;
      setAllEvents(prev => [...prev, newEvent]);
      toast.success('Event added successfully');
    } else {
      const automaticColor = getAutomaticColor(currentEventData);
      setAllEvents(prev => prev.map(e => 
        e.id === currentEventData.id ? { 
          ...currentEventData as CalendarEvent,
          // Apply automatic color if no color is selected in edit mode
          color: currentEventData.color || automaticColor || undefined
        } : e
      ));
      toast.success('Event updated successfully');
    }
    
    setIsEventFormDialogOpen(false);
    setCurrentEventData(defaultEventFormData);
  };

  // Helper function to get automatic color for event
  const getAutomaticColor = (event: Partial<CalendarEvent>) => {
    if (!colorAutomation.enabled) return null;
    
    // Priority-based colors for tasks
    if (event.category === 'task' && event.priority) {
      return colorAutomation.rules[`${event.priority}-priority`];
    }
    
    // Type-based colors
    if (event.type && colorAutomation.rules[event.type]) {
      return colorAutomation.rules[event.type];
    }
    
    // Category-based colors
    if (event.category && colorAutomation.rules[event.category]) {
      return colorAutomation.rules[event.category];
    }
    
    return null;
  };

  // Helper function to get event colors with good contrast
  const getEventColors = (event: CalendarEvent) => {
    // Use user-assigned color or automatic color
    const eventColor = event.color || getAutomaticColor(event);
    
    if (eventColor) {
      return {
        bg: eventColor,
        text: getContrastColor(eventColor),
        border: eventColor,
        hover: adjustColorBrightness(eventColor, -10)
      };
    }
    
    // Default colors based on category with better variety
    const colorSchemes = {
      appointment: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-800'
      },
      task: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-200 dark:hover:bg-green-800'
      }
    };
    
    return colorSchemes[event.category] || colorSchemes.appointment;
  };

  // Helper function to determine if color is light or dark for contrast
  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hexColor: string, amount: number) => {
    const color = hexColor.replace('#', '');
    const num = parseInt(color, 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  return (
    <div className="space-y-1">
      {/* Compact Month View */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0 px-3 py-0">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  ←
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  →
                </Button>
              </div>
              <CardTitle className="text-sm font-medium">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleTodayClick}>
                <CalendarIconLucide className="mr-2 h-4 w-4" /> Today
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenAddEventDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsColorSettingsOpen(true)}>
                <div className="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
                Colors
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
                    min-h-[160px] p-3 border-r border-b cursor-pointer transition-colors relative flex flex-col
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
                  <div className="space-y-1 flex-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => {
                      const colors = getEventColors(event);
                      return (
                        <div
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                            event.color 
                              ? '' // Custom colors will be applied via style
                              : `${colors.bg} ${colors.text} ${colors.hover}`
                          }`}
                          style={event.color ? {
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border
                          } : {}}
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
                      );
                    })}
                  </div>
                  
                  {/* Indicator for more events - Three dots at bottom center */}
                  {dayEvents.length > 3 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day.date);
                          // Scroll to the development section
                          setTimeout(() => {
                            const scheduleSection = document.querySelector('[data-schedule-section]');
                            if (scheduleSection) {
                              scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }}
                        title={`${dayEvents.length - 3} more events`}
                      >
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tabs - Always visible when date selected */}
      {selectedDate && (
        <div className="space-y-6" data-schedule-section>
          {/* Compact Tabs Display - Always visible */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'appointments' | 'tasks')} className="w-full">
            <div className="flex items-center justify-center">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="appointments" className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Appointments ({eventsForSelectedDateAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <ListTodo className="h-4 w-4" /> Tasks ({eventsForSelectedDateTasks.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Day Schedule - Quick Add Interface */}
          <Card className="shadow-lg mt-2">
            <CardHeader className="pb-1 px-4 py-2">
              <CardTitle className="text-sm font-medium">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Quick Add Section */}
                <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="text-sm text-gray-600">
                    No events scheduled for this day
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEventFormMode('add');
                      const defaultCategory = activeTab === 'tasks' ? 'task' : 'appointment';
                      setCurrentEventData({ 
                        ...defaultEventFormData, 
                        date: selectedDate || new Date(), 
                        category: defaultCategory 
                      });
                      setIsEventFormDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add {activeTab === 'tasks' ? 'Task' : 'Appointment'}
                  </Button>
                </div>

                {/* Events List for Selected Date */}
                {eventsForSelectedDate.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Today&apos;s Events</h4>
                    {eventsForSelectedDate.map((event) => {
                      const colors = getEventColors(event);
                      return (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            event.color 
                              ? 'border-gray-200' // Generic border for custom colors
                              : `${colors.bg} ${colors.border} ${colors.hover}`
                          }`}
                          style={event.color ? {
                            backgroundColor: `${colors.bg}20`, // 20% opacity for background
                            borderColor: colors.border,
                            color: colors.text
                          } : {}}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEventDetailDialogOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{event.title}</h5>
                            {event.description && (
                              <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                            )}
                            {event.startTime && (
                              <div className="flex items-center gap-1 mt-2">
                                <CalendarDays className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {event.isAllDay ? 'All day' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {event.category && (
                              <Badge 
                                variant={event.category === 'appointment' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {event.category}
                              </Badge>
                            )}
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
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TODO: Detailed Content - Show only when user scrolls or clicks */}
          {/* Temporarily hidden to show only tabs as requested */}
          {/*
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'appointments' | 'tasks')} className="w-full">
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
                    <ScrollArea className="h-[400px]">
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
                    <ScrollArea className="h-[400px]">
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
          </div>
          */}
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailDialogOpen} onOpenChange={setIsEventDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
              <div className="flex gap-2 flex-wrap">
                {selectedEvent?.type !== 'manual' && selectedEvent?.type !== 'call' && selectedEvent && (
                    <Badge variant="outline" className="capitalize text-xs">{getEventTypeDisplay(selectedEvent.type)}</Badge>
                )}
                {selectedEvent && (
                  <Badge variant={selectedEvent.category === 'appointment' ? 'default' : 'secondary'} className="capitalize text-xs">{selectedEvent.category}</Badge>
                )}
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

      {/* Event Form Dialog */}
      <Dialog open={isEventFormDialogOpen} onOpenChange={setIsEventFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{eventFormMode === 'add' ? 'Add New Event' : 'Edit Event'}</DialogTitle>
            <DialogDescription>
              {eventFormMode === 'add' ? 'Create a new event for your calendar.' : 'Update the event details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                name="title"
                value={currentEventData.title}
                onChange={handleCurrentEventDataChange}
                className="col-span-3"
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentEventData.description}
                onChange={handleCurrentEventDataChange}
                className="col-span-3"
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={currentEventData.date?.toISOString().split('T')[0] || ''}
                onChange={(e) => setCurrentEventData(prev => ({
                  ...prev,
                  date: new Date(e.target.value)
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={currentEventData.category}
                onValueChange={(value: 'appointment' | 'task') => 
                  setCurrentEventData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Color Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Color</Label>
              <div className="col-span-3 space-y-3">
                {/* Current color preview and custom input */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                    style={{ 
                      backgroundColor: currentEventData.color || getAutomaticColor(currentEventData) || '#3b82f6' 
                    }}
                  />
                  <Input
                    type="color"
                    value={currentEventData.color || getAutomaticColor(currentEventData) || '#3b82f6'}
                    onChange={(e) => setCurrentEventData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentEventData(prev => ({ ...prev, color: undefined }))}
                  >
                    Auto
                  </Button>
                </div>
                
                {/* Predefined color palette */}
                <div className="flex flex-wrap gap-1">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        currentEventData.color === color 
                          ? 'border-gray-600 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentEventData(prev => ({ ...prev, color }))}
                      title={color}
                    />
                  ))}
                </div>
                
                {/* Show automatic color info */}
                {!currentEventData.color && (
                  <p className="text-xs text-gray-500">
                    Using automatic color: {getAutomaticColor(currentEventData) || 'Default'}
                  </p>
                )}
              </div>
            </div>
            
            {currentEventData.category === 'appointment' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">All Day</Label>
                  <div className="col-span-3">
                    <Checkbox
                      checked={currentEventData.isAllDay || false}
                      onCheckedChange={(checked) => 
                        setCurrentEventData(prev => ({ ...prev, isAllDay: !!checked }))
                      }
                    />
                  </div>
                </div>
                {!currentEventData.isAllDay && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startTime" className="text-right">Start Time</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={currentEventData.startTime || ''}
                        onChange={handleCurrentEventDataChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endTime" className="text-right">End Time</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={currentEventData.endTime || ''}
                        onChange={handleCurrentEventDataChange}
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {currentEventData.category === 'task' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">Priority</Label>
                <Select
                  value={currentEventData.priority || 'medium'}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setCurrentEventData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEvent} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {eventFormMode === 'add' ? 'Save Event' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Settings Modal */}
      <Dialog open={isColorSettingsOpen} onOpenChange={setIsColorSettingsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Color Automation Settings</DialogTitle>
            <DialogDescription>
              Configure automatic color assignments for events based on category, type, and priority.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Enable/Disable Automation */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableAutomation"
                checked={colorAutomation.enabled}
                onCheckedChange={(checked) => 
                  setColorAutomation(prev => ({ ...prev, enabled: !!checked }))
                }
              />
              <Label htmlFor="enableAutomation">Enable automatic color assignment</Label>
            </div>

            {/* Category Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Category Colors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.appointment }}
                  />
                  <Label className="flex-1">Appointments</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.appointment}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, appointment: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.task }}
                  />
                  <Label className="flex-1">Tasks</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.task}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, task: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>

            {/* Priority Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Priority Colors (for Tasks)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules['high-priority'] }}
                  />
                  <Label className="flex-1">High</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules['high-priority']}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, 'high-priority': e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules['medium-priority'] }}
                  />
                  <Label className="flex-1">Medium</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules['medium-priority']}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, 'medium-priority': e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules['low-priority'] }}
                  />
                  <Label className="flex-1">Low</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules['low-priority']}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, 'low-priority': e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>

            {/* Event Type Colors */}
            <div className="space-y-3">
              <h4 className="font-medium">Event Type Colors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.email }}
                  />
                  <Label className="flex-1">Email</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.email}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, email: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.whatsapp }}
                  />
                  <Label className="flex-1">WhatsApp</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.whatsapp}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, whatsapp: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.call }}
                  />
                  <Label className="flex-1">Call</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.call}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, call: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colorAutomation.rules.manual }}
                  />
                  <Label className="flex-1">Manual</Label>
                  <Input
                    type="color"
                    value={colorAutomation.rules.manual}
                    onChange={(e) => setColorAutomation(prev => ({
                      ...prev,
                      rules: { ...prev.rules, manual: e.target.value }
                    }))}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsColorSettingsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
