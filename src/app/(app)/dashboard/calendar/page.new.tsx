"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarIcon as CalendarIconLucide, Clock, ListTodo, CalendarDays } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner"
import { ScrollArea } from '@/components/ui/scroll-area';

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
    endTime: '11:00'
  },
  { 
    id: 'evt2', 
    title: 'Review Documents', 
    date: new Date(new Date().setDate(new Date().getDate() + 1)), 
    description: 'Review Q4 reports', 
    type: 'manual', 
    category: 'task',
    priority: 'high'
  },
  { 
    id: 'evt3', 
    title: 'Client Call', 
    date: new Date(new Date().setDate(new Date().getDate() + 2)), 
    description: 'Call with potential client', 
    type: 'call', 
    category: 'appointment',
    startTime: '14:30',
    endTime: '15:30'
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
      const newEvent: CalendarEvent = {
        ...currentEventData,
        id: Date.now().toString(),
        date: currentEventData.date || new Date()
      } as CalendarEvent;
      setAllEvents(prev => [...prev, newEvent]);
      toast.success('Event added successfully');
    } else {
      setAllEvents(prev => prev.map(e => 
        e.id === currentEventData.id ? { ...currentEventData as CalendarEvent } : e
      ));
      toast.success('Event updated successfully');
    }
    
    setIsEventFormDialogOpen(false);
    setCurrentEventData(defaultEventFormData);
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

    </div>
  );
}
