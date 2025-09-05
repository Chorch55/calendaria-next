"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarIcon as CalendarIconLucide, ListTodo, CalendarDays, Settings, Trash2, Plus, Copy, Palette, Clock, Users, Tag, Filter, CheckCircle, TrendingUp, Edit2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner"

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  linkedMessageId?: string;
  attendees?: string[];
  type: 'email' | 'whatsapp' | 'call' | 'manual' | 'automated' | 'imported';
  category: 'appointment' | 'task' | 'meeting' | 'reminder' | 'event' | 'deadline';
  color?: string; // User-assigned color
  // Appointment specific
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  isAllDay?: boolean;
  // Task specific
  priority?: 'low' | 'medium' | 'high' | 'critical';
  // Enhanced properties
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'in-progress' | 'overdue';
  isRecurring?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  department?: 'sales' | 'marketing' | 'development' | 'support' | 'hr' | 'finance' | 'management';
  clientType?: 'vip-client' | 'new-client' | 'returning-client' | 'internal' | 'external';
  tags?: string[];
  createdBy?: string;
  lastModified?: Date;
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

  // Priority hierarchy order state with drag & drop
  const [priorityOrder, setPriorityOrder] = useState([
    { id: 1, name: "Manual Color Selection", description: "Colors manually assigned by the user when creating or editing events always take precedence over automatic rules.", color: "red", badge: "Highest Priority" },
    { id: 2, name: "Advanced Rules", description: "Custom rules with multiple conditions (category + priority + keywords, etc.) override all other automatic rules.", color: "orange", badge: "Very High" },
    { id: 3, name: "Keyword Patterns", description: "Colors assigned based on keywords found in event titles or descriptions.", color: "yellow", badge: "High" },
    { id: 4, name: "Time-based Rules", description: "Colors based on the time of day when events are scheduled (morning, afternoon, evening, night).", color: "blue", badge: "Medium-High" },
    { id: 5, name: "Recurring Event Rules", description: "Special colors for recurring events (daily, weekly, monthly, yearly).", color: "purple", badge: "Medium" },
    { id: 6, name: "Duration-based Colors", description: "Colors based on event duration: short (<30min), medium (30min-2h), long (>2h), or all-day events.", color: "green", badge: "Medium" },
    { id: 7, name: "Status-based Colors", description: "Colors based on event status (confirmed, pending, cancelled, completed, in-progress, overdue).", color: "indigo", badge: "Low-Medium" },
    { id: 8, name: "Priority-based Colors", description: "Colors for tasks based on priority level (critical, high, medium, low).", color: "pink", badge: "Low" },
    { id: 9, name: "Type-based Colors", description: "Colors based on how the event was created (email, WhatsApp, call, manual, automated, imported).", color: "cyan", badge: "Low" },
    { id: 10, name: "Category-based Colors", description: "Basic colors based on event category (appointment, task, meeting, reminder, event, deadline). Used when no other rules apply.", color: "gray", badge: "Fallback" }
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Color automation settings
  const [colorAutomation, setColorAutomation] = useState({
    enabled: true,
    rules: {
      // Category Colors
      appointment: '#3b82f6', // Blue
      task: '#10b981', // Green
      meeting: '#8b5cf6', // Purple
      reminder: '#f59e0b', // Amber
      event: '#06b6d4', // Cyan
      deadline: '#dc2626', // Red
      
      // Priority Colors
      'high-priority': '#ef4444', // Red
      'medium-priority': '#f59e0b', // Amber
      'low-priority': '#6b7280', // Gray
      'critical-priority': '#991b1b', // Dark Red
      
      // Event Type Colors
      email: '#8b5cf6', // Purple
      whatsapp: '#059669', // Emerald
      call: '#dc2626', // Red
      manual: '#6366f1', // Indigo
      automated: '#0ea5e9', // Sky
      imported: '#84cc16', // Lime
      
      // Status Colors
      confirmed: '#16a34a', // Green
      pending: '#eab308', // Yellow
      cancelled: '#64748b', // Slate
      completed: '#059669', // Emerald
      'in-progress': '#3b82f6', // Blue
      overdue: '#dc2626', // Red
      
      // Department/Team Colors
      sales: '#f97316', // Orange
      marketing: '#ec4899', // Pink
      development: '#06b6d4', // Cyan
      support: '#8b5cf6', // Purple
      hr: '#84cc16', // Lime
      finance: '#eab308', // Yellow
      management: '#6366f1', // Indigo
      
      // Client/Contact Colors
      'vip-client': '#facc15', // Yellow
      'new-client': '#22c55e', // Green
      'returning-client': '#3b82f6', // Blue
      'internal': '#6b7280', // Gray
      'external': '#f97316', // Orange
      
      // Duration-based Colors
      'short-duration': '#84cc16', // Lime (< 30 min)
      'medium-duration': '#3b82f6', // Blue (30min - 2h)
      'long-duration': '#dc2626', // Red (> 2h)
      'all-day': '#8b5cf6', // Purple
    },
    advancedRules: [
      {
        id: 1,
        name: "VIP Client Meetings",
        conditions: {
          category: "appointment",
          clientType: "vip-client",
          priority: "high-priority"
        },
        color: "#facc15",
        enabled: true
      },
      {
        id: 2,
        name: "Urgent Tasks",
        conditions: {
          category: "task",
          priority: "critical-priority",
          status: "pending"
        },
        color: "#991b1b",
        enabled: true
      }
    ],
    timeBasedRules: {
      enabled: true,
      rules: {
        morning: { from: "06:00", to: "12:00", color: "#fbbf24" }, // Yellow
        afternoon: { from: "12:00", to: "18:00", color: "#60a5fa" }, // Blue
        evening: { from: "18:00", to: "23:59", color: "#a78bfa" }, // Purple
        night: { from: "00:00", to: "06:00", color: "#374151" } // Gray
      }
    },
    recurringRules: {
      enabled: true,
      daily: "#16a34a", // Green
      weekly: "#3b82f6", // Blue
      monthly: "#8b5cf6", // Purple
      yearly: "#f59e0b" // Amber
    },
    customPatterns: {
      enabled: true,
      patterns: [
        {
          id: 1,
          name: "Holiday Events",
          keywords: ["holiday", "vacation", "break", "festivo"],
          color: "#dc2626",
          enabled: true
        },
        {
          id: 2,
          name: "Training Sessions",
          keywords: ["training", "course", "workshop", "seminar"],
          color: "#059669",
          enabled: true
        }
      ]
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
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        return bPriority - aPriority;
      });
  }, [eventsForSelectedDate]);

  // Auto-save function for color settings
  const saveColorSettings = (newSettings: any) => {
    // TODO: Implement actual save to backend/localStorage
    console.log('Saving color settings:', newSettings);
    toast.success("✓ Auto-saved", {
      description: "Color settings updated",
      duration: 2000,
    });
  };

  // Helper function to update color rules with auto-save
  const updateColorRule = (ruleKey: string, color: string) => {
    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        rules: { ...prev.rules, [ruleKey]: color }
      };
      // Auto-save after a brief delay
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });
  };

  // Helper function to update advanced rules with auto-save
  const updateAdvancedRule = (ruleId: number, updates: any) => {
    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        advancedRules: prev.advancedRules.map((rule: any) => 
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });
  };

  // Helper function to update time-based rules with auto-save
  const updateTimeBasedRule = (timeSlot: string, updates: any) => {
    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        timeBasedRules: {
          ...prev.timeBasedRules,
          rules: {
            ...prev.timeBasedRules.rules,
            [timeSlot]: { ...prev.timeBasedRules.rules[timeSlot as keyof typeof prev.timeBasedRules.rules], ...updates }
          }
        }
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });
  };

  // Helper function to handle color picker for any rule
  const openColorPicker = (ruleKey: string) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = (colorAutomation.rules as any)[ruleKey];
    input.onchange = (e) => {
      updateColorRule(ruleKey, (e.target as HTMLInputElement).value);
    };
    input.click();
  };

  // Function to add new advanced rule
  const addAdvancedRule = () => {
    const newRule = {
      id: Date.now(),
      name: `Rule ${colorAutomation.advancedRules.length + 1}`,
      enabled: true,
      color: '#3B82F6',
      conditions: {
        titleContains: '',
        category: 'any',
        duration: 'any'
      },
      priority: colorAutomation.advancedRules.length + 1
    };

    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        advancedRules: [...prev.advancedRules, newRule]
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Advanced rule added", {
      description: "New rule created successfully",
      duration: 2000,
    });
  };

  // Function to remove advanced rule
  const removeAdvancedRule = (ruleId: number) => {
    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        advancedRules: prev.advancedRules.filter((rule: any) => rule.id !== ruleId)
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Rule removed", {
      description: "Advanced rule deleted successfully",
      duration: 2000,
    });
  };

  // Function to add new pattern
  const addPattern = () => {
    const newPattern = {
      id: Date.now(),
      name: `Pattern ${colorAutomation.customPatterns.patterns.length + 1}`,
      enabled: true,
      color: '#10B981',
      keywords: ['keyword'],
      matchType: 'contains' as const,
      caseSensitive: false
    };

    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        customPatterns: {
          ...prev.customPatterns,
          patterns: [...prev.customPatterns.patterns, newPattern]
        }
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Pattern added", {
      description: "New pattern created successfully",
      duration: 2000,
    });
  };

  // Function to remove pattern
  const removePattern = (patternId: number) => {
    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        customPatterns: {
          ...prev.customPatterns,
          patterns: prev.customPatterns.patterns.filter((pattern: any) => pattern.id !== patternId)
        }
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Pattern removed", {
      description: "Pattern deleted successfully",
      duration: 2000,
    });
  };

  // Function to add new time slot
  const addTimeSlot = () => {
    const timeSlotNames = ['morning', 'afternoon', 'evening', 'night', 'early-morning', 'late-night', 'noon', 'dawn', 'dusk'];
    const existingSlots = Object.keys(colorAutomation.timeBasedRules.rules);
    const availableSlots = timeSlotNames.filter(slot => !existingSlots.includes(slot));
    
    let newSlotName = `custom-${Date.now()}`;
    if (availableSlots.length > 0) {
      newSlotName = availableSlots[0];
    }

    const newTimeSlot = {
      from: "09:00",
      to: "12:00",
      color: "#8B5CF6"
    };

    setColorAutomation(prev => {
      const newSettings = {
        ...prev,
        timeBasedRules: {
          ...prev.timeBasedRules,
          rules: {
            ...prev.timeBasedRules.rules,
            [newSlotName]: newTimeSlot
          }
        }
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Time slot added", {
      description: `New ${newSlotName} slot created`,
      duration: 2000,
    });
  };

  // Function to remove time slot
  const removeTimeSlot = (timeSlot: string) => {
    setColorAutomation(prev => {
      const newRules = { ...prev.timeBasedRules.rules };
      delete newRules[timeSlot];
      
      const newSettings = {
        ...prev,
        timeBasedRules: {
          ...prev.timeBasedRules,
          rules: newRules
        }
      };
      setTimeout(() => saveColorSettings(newSettings), 500);
      return newSettings;
    });

    toast.success("✓ Time slot removed", {
      description: `${timeSlot} slot deleted successfully`,
      duration: 2000,
    });
  };

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

  // Drag & Drop functions for priority hierarchy
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, itemId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem !== null && draggedItem !== itemId) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo limpiar si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, dropItemId: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropItemId) return;

    const draggedIndex = priorityOrder.findIndex(item => item.id === draggedItem);
    const dropIndex = priorityOrder.findIndex(item => item.id === dropItemId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newOrder = [...priorityOrder];
    const [draggedItemData] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItemData);

    // Update the priority order but keep original IDs to maintain number-color mapping
    setPriorityOrder(newOrder);
    
    toast.success("✓ Priority order updated", {
      description: "Hierarchy has been reordered successfully",
      duration: 2000,
    });
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

  // Enhanced automatic color function with clear priority hierarchy
  const getAutomaticColor = (event: Partial<CalendarEvent>) => {
    if (!colorAutomation.enabled) return null;
    
    // PRIORITY 1: Manual color selection (handled in UI, not here)
    // User-assigned colors always take precedence
    
    // PRIORITY 2: Advanced rules (highest automatic priority)
    // Custom rules with multiple conditions override everything else
    for (const rule of colorAutomation.advancedRules) {
      if (!rule.enabled) continue;
      
      let matchesAllConditions = true;
      for (const [key, value] of Object.entries(rule.conditions)) {
        if (event[key as keyof CalendarEvent] !== value) {
          matchesAllConditions = false;
          break;
        }
      }
      
      if (matchesAllConditions) {
        return rule.color;
      }
    }
    
    // PRIORITY 3: Keyword patterns
    // Colors based on keywords in title or description
    if (colorAutomation.customPatterns.enabled && event.title) {
      for (const pattern of colorAutomation.customPatterns.patterns) {
        if (!pattern.enabled) continue;
        
        const titleLower = event.title.toLowerCase();
        const descriptionLower = event.description?.toLowerCase() || '';
        
        for (const keyword of pattern.keywords) {
          if (titleLower.includes(keyword.toLowerCase()) || descriptionLower.includes(keyword.toLowerCase())) {
            return pattern.color;
          }
        }
      }
    }
    
    // PRIORITY 4: Time-based rules
    // Colors based on time of day when event is scheduled
    if (colorAutomation.timeBasedRules.enabled && event.startTime) {
      const eventTime = event.startTime;
      for (const [timeSlot, timeRule] of Object.entries(colorAutomation.timeBasedRules.rules)) {
        if (eventTime >= timeRule.from && eventTime <= timeRule.to) {
          return timeRule.color;
        }
      }
    }
    
    // PRIORITY 5: Recurring event rules
    // Special colors for recurring events
    if (colorAutomation.recurringRules.enabled && event.isRecurring && event.recurrenceType) {
      const recurringColor = colorAutomation.recurringRules[event.recurrenceType as keyof typeof colorAutomation.recurringRules];
      if (typeof recurringColor === 'string') {
        return recurringColor;
      }
    }
    
    // PRIORITY 6: Duration-based colors
    // Colors based on event duration
    if (event.startTime && event.endTime) {
      const start = new Date(`2000-01-01 ${event.startTime}`);
      const end = new Date(`2000-01-01 ${event.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      if (durationMinutes < 30) {
        return colorAutomation.rules['short-duration'];
      } else if (durationMinutes <= 120) {
        return colorAutomation.rules['medium-duration'];
      } else {
        return colorAutomation.rules['long-duration'];
      }
    }
    
    // All-day events (part of duration-based)
    if (event.isAllDay) {
      return colorAutomation.rules['all-day'];
    }
    
    // PRIORITY 7: Status-based colors
    // Colors based on event status
    if (event.status && event.status in colorAutomation.rules) {
      return colorAutomation.rules[event.status as keyof typeof colorAutomation.rules];
    }
    
    // PRIORITY 8: Priority-based colors (for tasks)
    // Colors based on task priority level
    if (event.category === 'task' && event.priority) {
      return colorAutomation.rules[`${event.priority}-priority`];
    }
    
    // PRIORITY 9: Type-based colors
    // Colors based on how the event was created
    if (event.type && colorAutomation.rules[event.type]) {
      return colorAutomation.rules[event.type];
    }
    
    // PRIORITY 10: Category-based colors (fallback)
    // Basic colors based on event category
    if (event.category && colorAutomation.rules[event.category]) {
      return colorAutomation.rules[event.category];
    }
    
    // No automatic color rule applies
    return null;
  };

  // Helper function to explain which color rule was applied
  const getAppliedColorRule = (event: Partial<CalendarEvent>): string => {
    if (!colorAutomation.enabled) return "Color automation disabled";
    
    // Check each rule in priority order and return explanation
    
    // Priority 2: Advanced rules
    for (const rule of colorAutomation.advancedRules) {
      if (!rule.enabled) continue;
      
      let matchesAllConditions = true;
      for (const [key, value] of Object.entries(rule.conditions)) {
        if (event[key as keyof CalendarEvent] !== value) {
          matchesAllConditions = false;
          break;
        }
      }
      
      if (matchesAllConditions) {
        return `Advanced Rule: "${rule.name}"`;
      }
    }
    
    // Priority 3: Keyword patterns
    if (colorAutomation.customPatterns.enabled && event.title) {
      for (const pattern of colorAutomation.customPatterns.patterns) {
        if (!pattern.enabled) continue;
        
        const titleLower = event.title.toLowerCase();
        const descriptionLower = event.description?.toLowerCase() || '';
        
        for (const keyword of pattern.keywords) {
          if (titleLower.includes(keyword.toLowerCase()) || descriptionLower.includes(keyword.toLowerCase())) {
            return `Keyword Pattern: "${keyword}" found in ${titleLower.includes(keyword.toLowerCase()) ? 'title' : 'description'}`;
          }
        }
      }
    }
    
    // Priority 4: Time-based rules
    if (colorAutomation.timeBasedRules.enabled && event.startTime) {
      const eventTime = event.startTime;
      for (const [timeSlot, timeRule] of Object.entries(colorAutomation.timeBasedRules.rules)) {
        if (eventTime >= timeRule.from && eventTime <= timeRule.to) {
          return `Time-based Rule: ${timeSlot} (${timeRule.from} - ${timeRule.to})`;
        }
      }
    }
    
    // Priority 5: Recurring event rules
    if (colorAutomation.recurringRules.enabled && event.isRecurring && event.recurrenceType) {
      return `Recurring Rule: ${event.recurrenceType} events`;
    }
    
    // Priority 6: Duration-based colors
    if (event.startTime && event.endTime) {
      const start = new Date(`2000-01-01 ${event.startTime}`);
      const end = new Date(`2000-01-01 ${event.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      if (durationMinutes < 30) {
        return "Duration Rule: Short duration (<30 min)";
      } else if (durationMinutes <= 120) {
        return "Duration Rule: Medium duration (30min-2h)";
      } else {
        return "Duration Rule: Long duration (>2h)";
      }
    }
    
    if (event.isAllDay) {
      return "Duration Rule: All-day event";
    }
    
    // Priority 7: Status-based colors
    if (event.status && event.status in colorAutomation.rules) {
      return `Status Rule: ${event.status}`;
    }
    
    // Priority 8: Priority-based colors
    if (event.category === 'task' && event.priority) {
      return `Priority Rule: ${event.priority} priority task`;
    }
    
    // Priority 9: Type-based colors
    if (event.type && colorAutomation.rules[event.type]) {
      return `Type Rule: ${event.type} event`;
    }
    
    // Priority 10: Category-based colors
    if (event.category && colorAutomation.rules[event.category]) {
      return `Category Rule: ${event.category}`;
    }
    
    return "No automatic rule applied";
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
      },
      meeting: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-800 dark:text-purple-200',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-200 dark:hover:bg-purple-800'
      },
      reminder: {
        bg: 'bg-amber-100 dark:bg-amber-900',
        text: 'text-amber-800 dark:text-amber-200',
        border: 'border-amber-200 dark:border-amber-800',
        hover: 'hover:bg-amber-200 dark:hover:bg-amber-800'
      },
      event: {
        bg: 'bg-cyan-100 dark:bg-cyan-900',
        text: 'text-cyan-800 dark:text-cyan-200',
        border: 'border-cyan-200 dark:border-cyan-800',
        hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-800'
      },
      deadline: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:bg-red-200 dark:hover:bg-red-800'
      }
    };
    
    return colorSchemes[event.category as keyof typeof colorSchemes] || colorSchemes.appointment;
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

      {/* Advanced Color Automation Settings Modal */}
      <Dialog open={isColorSettingsOpen} onOpenChange={setIsColorSettingsOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Advanced Color Automation Settings
              <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-save enabled
              </div>
            </DialogTitle>
            <DialogDescription>
              Configure intelligent color automation for events based on multiple criteria including category, priority, time, patterns, and custom rules.
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                💡 <strong>Tip:</strong> All changes are saved automatically as you edit. No need to click save!
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="priority" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="priority">Priority</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="time">Time-based</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Priority Hierarchy Tab */}
            <TabsContent value="priority" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Color Priority Hierarchy</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    When multiple color rules apply to the same event, CalendarIA uses this priority order. Higher priority rules override lower ones.
                    <strong className="block mt-2 text-blue-600">💡 Tip: Drag and drop cards to reorder priorities according to your preferences!</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  {priorityOrder.map((item, index) => {
                    const colorClasses = {
                      red: { bg: "bg-red-500", badgeClass: "bg-red-100 text-red-700" },
                      orange: { bg: "bg-orange-500", badgeClass: "bg-orange-100 text-orange-700" },
                      yellow: { bg: "bg-yellow-500", badgeClass: "bg-yellow-100 text-yellow-700" },
                      blue: { bg: "bg-blue-500", badgeClass: "bg-blue-100 text-blue-700" },
                      purple: { bg: "bg-purple-500", badgeClass: "bg-purple-100 text-purple-700" },
                      green: { bg: "bg-green-500", badgeClass: "bg-green-100 text-green-700" },
                      indigo: { bg: "bg-indigo-500", badgeClass: "bg-indigo-100 text-indigo-700" },
                      pink: { bg: "bg-pink-500", badgeClass: "bg-pink-100 text-pink-700" },
                      cyan: { bg: "bg-cyan-500", badgeClass: "bg-cyan-100 text-cyan-700" },
                      gray: { bg: "bg-gray-500", badgeClass: "bg-gray-100 text-gray-700" }
                    };
                    
                    // Mapeo fijo de posición a color y badge (siempre en el mismo orden)
                    const fixedHierarchy = [
                      { color: "red", badge: "Highest Priority" },
                      { color: "orange", badge: "Very High" }, 
                      { color: "yellow", badge: "High" },
                      { color: "blue", badge: "Medium-High" },
                      { color: "purple", badge: "Medium" },
                      { color: "green", badge: "Medium" },
                      { color: "indigo", badge: "Low-Medium" },
                      { color: "pink", badge: "Low" },
                      { color: "cyan", badge: "Low" },
                      { color: "gray", badge: "Fallback" }
                    ];
                    
                    const positionData = fixedHierarchy[index] || fixedHierarchy[9];
                    const colors = colorClasses[positionData.color as keyof typeof colorClasses];
                    
                    return (
                      <div key={item.id} className="flex items-start gap-4">
                        {/* Columna izquierda: Número y Badge fijos con ancho consistente */}
                        <div className="flex flex-col items-center w-24">
                          <div className={`${colors.bg} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md transition-all duration-200 ${
                            dragOverItem === item.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                          }`}>
                            {index + 1}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`mt-2 text-xs ${colors.badgeClass} font-medium text-center transition-all duration-200 ${
                              dragOverItem === item.id ? 'scale-105' : ''
                            }`}
                          >
                            {positionData.badge}
                          </Badge>
                        </div>
                        
                        {/* Columna derecha: Bocadillo draggable con estilo mejorado */}
                        <div 
                          className={`relative flex-1 p-3 border rounded-lg cursor-move transition-all duration-200 select-none ${
                            draggedItem === item.id 
                              ? 'opacity-75 scale-98 shadow-lg border-gray-300 bg-gray-50' 
                              : dragOverItem === item.id
                              ? 'border-blue-200 bg-blue-25 shadow-md scale-102'
                              : 'border-gray-200 hover:shadow-sm hover:border-gray-300'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnter(e, item.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, item.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-semibold transition-colors duration-200 ${
                              draggedItem === item.id ? 'text-blue-600' : ''
                            }`}>
                              {item.name}
                            </h5>
                            <div className={`text-sm transition-all duration-200 ${
                              draggedItem === item.id 
                                ? 'text-blue-500 scale-110' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}>
                              {draggedItem === item.id ? '🔄' : '⋮⋮'}
                            </div>
                          </div>
                          <p className={`text-sm transition-colors duration-200 ${
                            draggedItem === item.id ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">💡</div>
                    <div>
                      <h6 className="font-semibold text-blue-900 mb-2">Example Conflict Resolution</h6>
                      <p className="text-sm text-blue-800 mb-2">
                        Imagine an event titled <strong>"Client Meeting"</strong> scheduled at <strong>2:00 PM</strong> with <strong>high priority</strong>:
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1 ml-4">
                        <li>• If you set a keyword pattern for "Client" → Uses pattern color (Priority #{(priorityOrder.findIndex(item => item.name === "Keyword Patterns") + 1) || 3})</li>
                        <li>• If no pattern but afternoon time rule exists → Uses afternoon color (Priority #{(priorityOrder.findIndex(item => item.name === "Time-based Rules") + 1) || 4})</li>
                        <li>• If no time rule but high priority exists → Uses high priority color (Priority #{(priorityOrder.findIndex(item => item.name === "Priority-based Colors") + 1) || 8})</li>
                        <li>• If none of the above → Uses meeting category color (Priority #{(priorityOrder.findIndex(item => item.name === "Category-based Colors") + 1) || 10})</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="mt-6">
              {/* Global Enable/Disable */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-base font-medium">Enable Color Automation</Label>
                    <p className="text-sm text-muted-foreground">Automatically assign colors to events based on your rules</p>
                  </div>
                </div>
                <Switch
                  checked={colorAutomation.enabled}
                  onCheckedChange={(checked) => 
                    setColorAutomation(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              {colorAutomation.enabled && (
                <>
                  {/* Category Colors */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <h4 className="font-semibold">Category Colors</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Assign specific colors to different event categories. These colors help you quickly identify event types at a glance.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries({
                        appointment: 'Appointments',
                        task: 'Tasks',
                        meeting: 'Meetings',
                        reminder: 'Reminders',
                        event: 'Events',
                        deadline: 'Deadlines'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div 
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: (colorAutomation.rules as any)[key] }}
                          />
                          <Label className="flex-1 text-sm">{label}</Label>
                          <div className="relative">
                            <Edit2 
                              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
                              onClick={() => openColorPicker(key)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Priority Colors */}
                  <div className="space-y-4 my-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <h4 className="font-semibold">Priority Colors</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Set colors based on event priority levels. Critical events get attention-grabbing colors while low-priority events use subtle tones.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries({
                        'critical-priority': 'Critical',
                        'high-priority': 'High',
                        'medium-priority': 'Medium',
                        'low-priority': 'Low'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div 
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: (colorAutomation.rules as any)[key] }}
                          />
                          <Label className="flex-1 text-sm">{label}</Label>
                          <div className="relative">
                            <Edit2 
                              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
                              onClick={() => openColorPicker(key)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Event Type Colors */}
                  <div className="space-y-4 my-6">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <h4 className="font-semibold">Event Type Colors</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Differentiate events by their creation method or source. This helps track how events were added to your calendar.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries({
                        email: 'Email',
                        whatsapp: 'WhatsApp',
                        call: 'Call',
                        manual: 'Manual',
                        automated: 'Automated',
                        imported: 'Imported'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div 
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: (colorAutomation.rules as any)[key] }}
                          />
                          <Label className="flex-1 text-sm">{label}</Label>
                          <div className="relative">
                            <Edit2 
                              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
                              onClick={() => openColorPicker(key)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Status Colors */}
                  <div className="space-y-4 my-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <h4 className="font-semibold">Status Colors</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Visualize event progress and completion status. Different colors indicate whether events are confirmed, pending, or completed.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries({
                        confirmed: 'Confirmed',
                        pending: 'Pending',
                        cancelled: 'Cancelled',
                        completed: 'Completed',
                        'in-progress': 'In Progress',
                        overdue: 'Overdue'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div 
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: (colorAutomation.rules as any)[key] }}
                          />
                          <Label className="flex-1 text-sm">{label}</Label>
                          <div className="relative">
                            <Edit2 
                              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
                              onClick={() => openColorPicker(key)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Advanced Rules Tab */}
            <TabsContent value="advanced" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Advanced Color Rules</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create sophisticated rules with multiple conditions like title patterns, duration, category combinations, and custom logic to automatically assign colors.
                    </p>
                  </div>
                  <Button size="sm" className="flex items-center gap-2" onClick={addAdvancedRule}>
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
                
                {colorAutomation.advancedRules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: rule.color }}
                        />
                        <span className="font-medium">{rule.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={(checked) => 
                            setColorAutomation(prev => ({
                              ...prev,
                              advancedRules: prev.advancedRules.map(r => 
                                r.id === rule.id ? { ...r, enabled: checked } : r
                              )
                            }))
                          }
                        />
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeAdvancedRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(rule.conditions).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Time-based Rules Tab */}
            <TabsContent value="time" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-base font-medium">Time-based Color Rules</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically color events based on when they occur during the day (morning, afternoon, evening, night).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={colorAutomation.timeBasedRules.enabled}
                      onCheckedChange={(checked) => 
                        setColorAutomation(prev => ({
                          ...prev,
                          timeBasedRules: { ...prev.timeBasedRules, enabled: checked }
                        }))
                      }
                    />
                  </div>
                </div>

                {colorAutomation.timeBasedRules.enabled && (
                  <>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Time Slots</h4>
                      <Button size="sm" className="flex items-center gap-2" onClick={addTimeSlot}>
                        <Plus className="h-4 w-4" />
                        Add Time Slot
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(colorAutomation.timeBasedRules.rules).map(([timeSlot, timeRule]) => (
                      <Card key={timeSlot} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: timeRule.color }}
                            />
                            <span className="font-medium capitalize">{timeSlot.replace('-', ' ')}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTimeSlot(timeSlot)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-12">From:</span>
                            <Input 
                              type="time" 
                              value={timeRule.from} 
                              className="flex-1"
                              onChange={(e) => setColorAutomation(prev => ({
                                ...prev,
                                timeBasedRules: {
                                  ...prev.timeBasedRules,
                                  rules: {
                                    ...prev.timeBasedRules.rules,
                                    [timeSlot]: { ...timeRule, from: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-12">To:</span>
                            <Input 
                              type="time" 
                              value={timeRule.to} 
                              className="flex-1"
                              onChange={(e) => setColorAutomation(prev => ({
                                ...prev,
                                timeBasedRules: {
                                  ...prev.timeBasedRules,
                                  rules: {
                                    ...prev.timeBasedRules.rules,
                                    [timeSlot]: { ...timeRule, to: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-12">Color:</span>
                            <Input 
                              type="color" 
                              value={timeRule.color} 
                              className="w-16 h-8 p-0 border-0"
                              onChange={(e) => setColorAutomation(prev => ({
                                ...prev,
                                timeBasedRules: {
                                  ...prev.timeBasedRules,
                                  rules: {
                                    ...prev.timeBasedRules.rules,
                                    [timeSlot]: { ...timeRule, color: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
                )}
              </div>
            </TabsContent>

            {/* Patterns Tab */}
            <TabsContent value="patterns" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-base font-medium">Keyword Pattern Rules</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan event titles and descriptions for specific keywords or phrases and automatically apply colors. Perfect for project names, client names, or activity types.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={colorAutomation.customPatterns.enabled}
                    onCheckedChange={(checked) => 
                      setColorAutomation(prev => ({
                        ...prev,
                        customPatterns: { ...prev.customPatterns, enabled: checked }
                      }))
                    }
                  />
                </div>

                {colorAutomation.customPatterns.enabled && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Pattern Rules</h4>
                      <Button size="sm" className="flex items-center gap-2" onClick={addPattern}>
                        <Plus className="h-4 w-4" />
                        Add Pattern
                      </Button>
                    </div>
                    
                    {colorAutomation.customPatterns.patterns.map((pattern) => (
                      <Card key={pattern.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: pattern.color }}
                            />
                            <span className="font-medium">{pattern.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={pattern.enabled}
                              onCheckedChange={(checked) => 
                                setColorAutomation(prev => ({
                                  ...prev,
                                  customPatterns: {
                                    ...prev.customPatterns,
                                    patterns: prev.customPatterns.patterns.map(p => 
                                      p.id === pattern.id ? { ...p, enabled: checked } : p
                                    )
                                  }
                                }))
                              }
                            />
                            <Button variant="ghost" size="sm" onClick={() => removePattern(pattern.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-1">
                            <span>Keywords:</span>
                            {pattern.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Color Templates</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pre-designed color schemes that instantly transform your calendar appearance. Choose from professional, creative, or accessibility-focused palettes.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Professional", colors: ["#1e40af", "#059669", "#dc2626", "#ea580c"] },
                    { name: "Pastel", colors: ["#93c5fd", "#86efac", "#fca5a5", "#fdba74"] },
                    { name: "Dark Mode", colors: ["#374151", "#6b7280", "#9ca3af", "#d1d5db"] },
                    { name: "Vibrant", colors: ["#7c3aed", "#ec4899", "#f59e0b", "#10b981"] },
                    { name: "Ocean", colors: ["#0369a1", "#0891b2", "#059669", "#065f46"] },
                    { name: "Sunset", colors: ["#dc2626", "#ea580c", "#f59e0b", "#eab308"] }
                  ].map((template) => (
                    <Card key={template.name} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <h5 className="font-medium">{template.name}</h5>
                        <div className="flex gap-2">
                          {template.colors.map((color, index) => (
                            <div 
                              key={index}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Apply template logic here
                            toast.success(`Applied ${template.name} template!`);
                          }}
                        >
                          Apply Template
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Color Preview</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview how your color automation rules apply to different event types. Test your settings before saving.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h5 className="font-medium mb-3">Sample Events with Applied Rules</h5>
                    <div className="space-y-3">
                      {[
                        { title: "High Priority Task", category: "task" as const, priority: "high" as const, type: "manual" as const, startTime: "09:00", color: "#f97316" },
                        { title: "Client Meeting", category: "appointment" as const, type: "email" as const, startTime: "14:00", color: "#3b82f6" },
                        { title: "Holiday Event", category: "event" as const, type: "manual" as const, startTime: "10:00", isAllDay: true, color: "#10b981" },
                        { title: "Training Session", category: "meeting" as const, type: "automated" as const, startTime: "16:00", color: "#8b5cf6" },
                        { title: "Emergency Call", category: "task" as const, priority: "critical" as const, type: "call" as const, startTime: "11:30", color: "#ef4444" }
                      ].map((event, index) => {
                        const appliedRule = getAppliedColorRule(event);
                        return (
                          <div key={index} className="p-3 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="w-5 h-5 rounded border shadow-sm"
                                style={{ backgroundColor: event.color }}
                              />
                              <span className="font-medium text-sm text-gray-900">{event.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-700 ml-8">
                              <strong>Applied Rule:</strong> {appliedRule}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>💡 Tip:</strong> Hover over any event in your calendar to see which color rule was applied!
                      </p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-3">Color Rules Summary</h5>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Basic Rules:</span>
                        <span>{Object.keys(colorAutomation.rules).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Advanced Rules:</span>
                        <span>{colorAutomation.advancedRules.filter(r => r.enabled).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Rules:</span>
                        <span>{colorAutomation.timeBasedRules.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pattern Rules:</span>
                        <span>{colorAutomation.customPatterns.patterns.filter(p => p.enabled).length}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                // Reset to defaults
                setColorAutomation(prev => ({
                  ...prev,
                  rules: {
                    appointment: '#3b82f6',
                    task: '#10b981',
                    meeting: '#8b5cf6',
                    reminder: '#f59e0b',
                    event: '#06b6d4',
                    deadline: '#dc2626',
                    'high-priority': '#ef4444',
                    'medium-priority': '#f59e0b',
                    'low-priority': '#6b7280',
                    'critical-priority': '#991b1b',
                    email: '#8b5cf6',
                    whatsapp: '#059669',
                    call: '#dc2626',
                    manual: '#6366f1',
                    automated: '#0ea5e9',
                    imported: '#84cc16',
                    confirmed: '#16a34a',
                    pending: '#eab308',
                    cancelled: '#64748b',
                    completed: '#059669',
                    'in-progress': '#3b82f6',
                    overdue: '#dc2626',
                    sales: '#f97316',
                    marketing: '#ec4899',
                    development: '#06b6d4',
                    support: '#8b5cf6',
                    hr: '#84cc16',
                    finance: '#eab308',
                    management: '#6366f1',
                    'vip-client': '#facc15',
                    'new-client': '#22c55e',
                    'returning-client': '#3b82f6',
                    'internal': '#6b7280',
                    'external': '#f97316',
                    'short-duration': '#84cc16',
                    'medium-duration': '#3b82f6',
                    'long-duration': '#dc2626',
                    'all-day': '#8b5cf6'
                  }
                }));
              }}>
                Reset to Defaults
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsColorSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Color automation settings saved successfully!");
                setIsColorSettingsOpen(false);
              }}>
                Save Settings
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
/ /   F o r c e   r e c o m p i l e 
 
 
