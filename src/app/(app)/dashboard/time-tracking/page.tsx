
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { useTranslation } from '@/hooks/use-translation';
import { Clock, Briefcase, Hourglass, PlayCircle, StopCircle, ChevronLeft, ChevronRight, Edit, Save, CalendarRange, CalendarDays, Calendar as CalendarIcon, BarChart3, TrendingUp, Users, Plane, Send, Paperclip, CheckCircle2, XCircle } from "lucide-react";
import { format, isToday, isThisMonth, differenceInSeconds, parseISO, addMonths, subMonths, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


interface TimeEntry {
  id: string;
  taskDescription: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationInSeconds: number;
}

interface LeaveRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
  hasAttachment?: boolean;
}

const initialLeaveRequests: LeaveRequest[] = [
    { id: 'my-req1', startDate: new Date('2024-09-02'), endDate: new Date('2024-09-06'), type: 'Vacation', reason: 'Annual leave', status: 'Pending', hasAttachment: false },
    { id: 'my-req2', startDate: new Date('2024-07-20'), endDate: new Date('2024-07-20'), type: 'Sick Leave', reason: 'Flu', status: 'Approved', hasAttachment: true },
];

const availableLeaveTypes = ['Vacation', 'Sick Leave', 'Personal', 'Other'];


// Mock initial entries for demonstration
const initialEntries: TimeEntry[] = [
  {
    id: 'entry1',
    taskDescription: 'Team meeting and Q3 planning',
    startTime: new Date(new Date().setHours(9, 0, 15)).toISOString(),
    endTime: new Date(new Date().setHours(10, 30, 5)).toISOString(),
    durationInSeconds: 5390,
  },
  {
    id: 'entry2',
    taskDescription: 'Develop new landing page design mockups',
    startTime: new Date(new Date().setHours(10, 45, 0)).toISOString(),
    endTime: new Date(new Date().setHours(13, 15, 20)).toISOString(),
    durationInSeconds: 9020,
  },
  {
    id: 'entry3',
    taskDescription: 'Review Q2 performance metrics',
    startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(14, 0, 0)).toISOString(),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(15, 0, 0)).toISOString(),
    durationInSeconds: 3600,
  },
    {
    id: 'entry4',
    taskDescription: 'Client Call - Project Onboarding',
    startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(11, 0, 0)).toISOString(),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(11, 45, 0)).toISOString(),
    durationInSeconds: 2700,
  },
];

const emptyRequestForm: { range?: DateRange; type: string; reason: string } = {
  type: 'Vacation',
  reason: '',
};

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function TimeTrackingPage() {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("time-log");

  // State for Time Logging
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialEntries);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editForm, setEditForm] = useState({ taskDescription: '', startTime: '', endTime: '' });

  // State for Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [newRequestForm, setNewRequestForm] = useState(emptyRequestForm);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isClockedIn && startTime) {
      timer = setInterval(() => {
        setSessionSeconds(differenceInSeconds(new Date(), startTime));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, startTime]);

  const handleClockIn = () => {
    if (!currentTask.trim()) {
      toast.error("Task Required", {
        description: "Please enter a description for the task you are starting.",
      });
      return;
    }
    setIsClockedIn(true);
    setStartTime(new Date());
    setSessionSeconds(0);
    toast.success("Clocked In", {
      description: `Started tracking time for: ${currentTask}`,
    });
  };

  const handleClockOut = () => {
    if (!startTime) return;

    const endTime = new Date();
    const durationInSeconds = differenceInSeconds(endTime, startTime);

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      taskDescription: currentTask,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationInSeconds,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setIsClockedIn(false);
    setCurrentTask('');
    setStartTime(null);
    setSessionSeconds(0);
    toast.success("Clocked Out", {
      description: `Session saved. Duration: ${formatDuration(durationInSeconds)}`,
    });
  };
  
  const handleNewRequestSubmit = () => {
    if (!newRequestForm.range?.from || !newRequestForm.range?.to) {
        toast.error("Date range required", {
          description: "Please select a start and end date.",
        });
        return;
    }

    const newRequest: LeaveRequest = {
        id: `req-${Date.now()}`,
        startDate: newRequestForm.range.from,
        endDate: newRequestForm.range.to,
        type: newRequestForm.type,
        reason: newRequestForm.reason || '-',
        status: 'Pending',
    };
    
    setLeaveRequests(prev => [newRequest, ...prev]);
    setNewRequestForm(emptyRequestForm);
    toast.success("Request Submitted", {
      description: "Your time off request has been submitted for approval."
    });
  }

  const handleModeChange = (mode: 'single' | 'multiple' | 'range') => {
    setSelectionMode(mode);
    // Reset selections when changing mode
    setSelectedDate(mode === 'single' ? new Date() : undefined);
    setSelectedDates([]);
    setRange(undefined);
  };
  
  const handleOpenEditDialog = useCallback((entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      taskDescription: entry.taskDescription,
      startTime: format(parseISO(entry.startTime), 'HH:mm'),
      endTime: format(parseISO(entry.endTime), 'HH:mm'),
    });
    setIsEditModalOpen(true);
  }, []);

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = useCallback(() => {
    if (!editingEntry) {
      toast.error("Error", {
        description: "Cannot save entry without required data."
      });
      return;
    }

    const [startHours, startMinutes] = editForm.startTime.split(':').map(Number);
    const [endHours, endMinutes] = editForm.endTime.split(':').map(Number);
    
    const originalEntryDate = parseISO(editingEntry.startTime);

    const newStartDate = new Date(originalEntryDate);
    newStartDate.setHours(startHours, startMinutes, 0, 0);

    const newEndDate = new Date(originalEntryDate);
    newEndDate.setHours(endHours, endMinutes, 0, 0);

    if (newEndDate < newStartDate) {
      toast.error("Invalid Time", {
        description: "End time cannot be before start time."
      });
      return;
    }

    const newDuration = differenceInSeconds(newEndDate, newStartDate);

    const updatedEntry: TimeEntry = {
      ...editingEntry,
      taskDescription: editForm.taskDescription,
      startTime: newStartDate.toISOString(),
      endTime: newEndDate.toISOString(),
      durationInSeconds: newDuration,
    };
    
    setTimeEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setIsEditModalOpen(false);
    setEditingEntry(null);
    toast.success("Entry Updated", {
      description: "Your time entry has been successfully updated."
    });
  }, [editingEntry, editForm, toast]);


  const dailyTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    timeEntries.forEach(entry => {
      const entryDateStr = format(parseISO(entry.startTime), 'yyyy-MM-dd');
      totals[entryDateStr] = (totals[entryDateStr] || 0) + entry.durationInSeconds;
    });
    return totals;
  }, [timeEntries]);

  const modifiers = useMemo(() => ({
    hasEntries: Object.keys(dailyTotals).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    })
  }), [dailyTotals]);

  const modifiersComponents = useMemo(() => ({
    hasEntries: ({ date }: {date: Date}) => {
        const totalSeconds = dailyTotals[format(date, 'yyyy-MM-dd')] || 0;
        if (totalSeconds === 0) return null;
        return (
            <Badge
                variant="secondary"
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] h-4 px-1.5 font-mono pointer-events-none"
            >
                {formatDuration(totalSeconds).substring(0, 5)}
            </Badge>
        );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dailyTotals]);

  const entriesForSelection = useMemo(() => {
    switch (selectionMode) {
      case 'multiple':
        if (!selectedDates || selectedDates.length === 0) return [];
        const selectedDateStrs = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
        return timeEntries
            .filter(entry => selectedDateStrs.includes(format(parseISO(entry.startTime), 'yyyy-MM-dd')))
            .sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
      
      case 'range':
        if (!range?.from) return [];
        const startDate = startOfDay(range.from);
        const endDate = endOfDay(range.to || range.from);
        return timeEntries
            .filter(entry => {
                const entryDate = parseISO(entry.startTime);
                return isWithinInterval(entryDate, { start: startDate, end: endDate });
            })
            .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());

      case 'single':
      default:
        if (!selectedDate) return [];
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        return timeEntries
          .filter(entry => format(parseISO(entry.startTime), 'yyyy-MM-dd') === selectedDateStr)
          .sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
    }
  }, [selectedDate, selectedDates, range, timeEntries, selectionMode]);

  const summaryDetails = useMemo(() => {
    const totalDuration = entriesForSelection.reduce((acc, entry) => acc + entry.durationInSeconds, 0);

    switch (selectionMode) {
        case 'multiple':
            if (!selectedDates || selectedDates.length === 0) return null;
            return {
                title: `${t('summary_for_days')}`,
                totalDuration,
            };
        case 'range':
            if (!range?.from) return null;
            const fromStr = format(range.from, 'MMM d');
            const toStr = range.to ? format(range.to, 'MMM d, yyyy') : '';
             return {
                title: `${t('summary_for_range')} ${fromStr}${toStr ? ` - ${toStr}` : ''}`,
                totalDuration,
            };
        case 'single':
        default:
            if (!selectedDate) return null;
            return {
                title: `${t('todays_summary')} ${format(selectedDate, 'MMMM d, yyyy')}`,
                totalDuration: dailyTotals[format(selectedDate, 'yyyy-MM-dd')] || 0,
            };
    }
  }, [selectionMode, selectedDate, selectedDates, range, entriesForSelection, dailyTotals, t]);

  const statisticsData = useMemo(() => {
    if (!entriesForSelection || entriesForSelection.length === 0) {
        return {
            totalDuration: 0,
            numberOfDays: 0,
            averageDurationPerDay: 0,
            dailyData: [],
        };
    }

    const dailyTotalsMap = entriesForSelection.reduce((acc, entry) => {
        const date = format(parseISO(entry.startTime), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + entry.durationInSeconds;
        return acc;
    }, {} as Record<string, number>);

    const dailyData = Object.entries(dailyTotalsMap).map(([date, totalSeconds]) => ({
        date: format(parseISO(date), 'MMM d'),
        totalHours: parseFloat((totalSeconds / 3600).toFixed(2)),
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalDuration = entriesForSelection.reduce((acc, entry) => acc + entry.durationInSeconds, 0);
    const numberOfDays = Object.keys(dailyTotalsMap).length;
    const averageDurationPerDay = numberOfDays > 0 ? totalDuration / numberOfDays : 0;

    return {
        totalDuration,
        numberOfDays,
        averageDurationPerDay,
        dailyData,
    };
  }, [entriesForSelection]);


  const showSummaryAndStats = (selectionMode === 'range' && range && range.from) || (selectionMode === 'multiple' && selectedDates && selectedDates.length > 0);
  const showSingleDayLog = (selectionMode === 'single' && selectedDate && entriesForSelection.length > 0);

  const chartConfig = {
      totalHours: {
        label: t('hours'),
        color: "hsl(var(--primary))",
      },
  } satisfies ChartConfig;

  const calendarProps = {
    month: currentMonth,
    onMonthChange: setCurrentMonth,
    modifiers: modifiers,
    modifiersComponents: modifiersComponents,
    className:"p-0",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('time_tracking_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('time_tracking_description')}</p>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 h-auto">
                <TabsTrigger value="time-log" className="gap-2 text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Clock className="h-4 w-4" /> Registro de Horas
                </TabsTrigger>
                <TabsTrigger value="leave-request" className="gap-2 text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Plane className="h-4 w-4" /> Solicitud de Ausencias
                </TabsTrigger>
            </TabsList>
            <TabsContent value="time-log" className="mt-4 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isClockedIn ? <Hourglass className="h-6 w-6 mr-2 text-primary animate-spin" /> : <Clock className="h-6 w-6 mr-2 text-primary" />}
                    {isClockedIn ? t('you_are_clocked_in') : t('you_are_clocked_out')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-task">{t('current_task')}</Label>
                    <Input
                      id="current-task"
                      placeholder={t('current_task_placeholder')}
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      disabled={isClockedIn}
                    />
                  </div>
                  {isClockedIn ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="text-center sm:text-left">
                        <p className="font-semibold text-lg">{t('current_session')}</p>
                        <p className="text-3xl font-bold font-mono text-primary">{formatDuration(sessionSeconds)}</p>
                      </div>
                      <Button onClick={handleClockOut} variant="destructive" size="lg" className="w-full sm:w-auto">
                        <StopCircle className="mr-2 h-5 w-5" /> {t('clock_out')}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleClockIn} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <PlayCircle className="mr-2 h-5 w-5" /> {t('clock_in')}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                    <div>
                      <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                      <CardDescription>Select a day, multiple days, or a range to see entries.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                            <Button variant={selectionMode === 'single' ? 'secondary' : 'ghost'} size="sm" className="px-3" onClick={() => handleModeChange('single')} aria-label={t('single_day_select')}>
                                <CalendarIcon className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">{t('single_day')}</span>
                            </Button>
                            <Button variant={selectionMode === 'multiple' ? 'secondary' : 'ghost'} size="sm" className="px-3" onClick={() => handleModeChange('multiple')} aria-label={t('multiple_days_select')}>
                                <CalendarDays className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">{t('multiple_days')}</span>
                            </Button>
                            <Button variant={selectionMode === 'range' ? 'secondary' : 'ghost'} size="sm" className="px-3" onClick={() => handleModeChange('range')} aria-label={t('date_range_select')}>
                                <CalendarRange className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">{t('date_range')}</span>
                            </Button>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectionMode === 'single' && (
                      <Calendar
                        {...calendarProps}
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    )}
                    {selectionMode === 'multiple' && (
                      <Calendar
                        {...calendarProps}
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                      />
                    )}
                    {selectionMode === 'range' && (
                      <Calendar
                        {...calendarProps}
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                      />
                    )}
                </CardContent>
              </Card>

              {(showSummaryAndStats || showSingleDayLog) && summaryDetails && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>{summaryDetails.title}</CardTitle>
                     <CardDescription>
                        Total Duration: <span className="font-bold text-primary">{formatDuration(summaryDetails.totalDuration)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {(selectionMode === 'multiple' || selectionMode === 'range') && <TableHead>Date</TableHead>}
                          <TableHead>{t('task_description')}</TableHead>
                          <TableHead>{t('start_time')}</TableHead>
                          <TableHead>{t('end_time')}</TableHead>
                          <TableHead className="text-right">{t('duration')}</TableHead>
                          <TableHead className="w-[50px] text-right">Edit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entriesForSelection.length > 0 ? (
                          entriesForSelection.map(entry => (
                            <TableRow key={entry.id}>
                              {(selectionMode === 'multiple' || selectionMode === 'range') && <TableCell className="font-medium">{format(parseISO(entry.startTime), 'MMM d')}</TableCell>}
                              <TableCell className="font-medium">{entry.taskDescription}</TableCell>
                              <TableCell className="text-muted-foreground">{format(parseISO(entry.startTime), 'HH:mm:ss')}</TableCell>
                              <TableCell className="text-muted-foreground">{format(parseISO(entry.endTime), 'HH:mm:ss')}</TableCell>
                              <TableCell className="text-right font-mono">{formatDuration(entry.durationInSeconds)}</TableCell>
                               <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(entry)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                              {t('no_entries_for_selection')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {showSummaryAndStats && statisticsData.dailyData.length > 0 && (
                 <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>{t('statistics_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="bg-muted/50">
                          <CardHeader className="pb-2">
                            <CardDescription>{t('total_days_worked')}</CardDescription>
                            <CardTitle className="text-4xl">{statisticsData.numberOfDays}</CardTitle>
                          </CardHeader>
                      </Card>
                      <Card className="bg-muted/50">
                           <CardHeader className="pb-2">
                            <CardDescription>{t('average_daily_hours')}</CardDescription>
                            <CardTitle className="text-4xl">{formatDuration(statisticsData.averageDurationPerDay)}</CardTitle>
                          </CardHeader>
                      </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('daily_work_hours_chart')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                              <BarChart accessibilityLayer data={statisticsData.dailyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  tickLine={false}
                                  tickMargin={10}
                                  axisLine={false}
                                />
                                <YAxis
                                  tickFormatter={(value) => `${value}h`}
                                />
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="totalHours" fill="var(--color-totalHours)" radius={4} />
                              </BarChart>
                            </ChartContainer>
                        </CardContent>
                     </Card>
                  </CardContent>
                 </Card>
              )}
            </TabsContent>
            <TabsContent value="leave-request" className="mt-4 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Solicitar Ausencia</CardTitle>
                        <CardDescription>Completa el formulario para enviar una nueva solicitud de ausencia a tu administrador.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="leave-date-range">Fechas</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="leave-date-range"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !newRequestForm.range && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newRequestForm.range?.from ? (
                                    newRequestForm.range.to ? (
                                        <>
                                        {format(newRequestForm.range.from, "LLL dd, y")} -{" "}
                                        {format(newRequestForm.range.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(newRequestForm.range.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Elige un rango de fechas</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={newRequestForm.range?.from}
                                    selected={newRequestForm.range}
                                    onSelect={(range) => setNewRequestForm(prev => ({...prev, range}))}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leave-type">Tipo de Ausencia</Label>
                            <Select value={newRequestForm.type} onValueChange={(value) => setNewRequestForm(prev => ({...prev, type: value}))}>
                                <SelectTrigger id="leave-type">
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableLeaveTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leave-reason">Motivo (Opcional)</Label>
                            <Textarea id="leave-reason" placeholder="Ej: Viaje familiar" value={newRequestForm.reason} onChange={(e) => setNewRequestForm(prev => ({...prev, reason: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leave-attachment">Añadir Archivo</Label>
                            <Input id="leave-attachment" type="file" />
                        </div>
                    </CardContent>
                    <CardFooter>
                       <Button onClick={handleNewRequestSubmit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <Send className="mr-2 h-4 w-4" /> Enviar Solicitud
                        </Button>
                    </CardFooter>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Mis Solicitudes de Ausencia</CardTitle>
                        <CardDescription>Aquí puedes ver el historial y estado de tus solicitudes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rango de Fechas</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-center">Documentos</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{format(req.startDate, 'MMM d, yyyy')} - {format(req.endDate, 'MMM d, yyyy')}</TableCell>
                                        <TableCell>{req.type}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="icon" onClick={() => toast.info("Feature in development",{ description: "File attachment logic will be implemented." })}>
                                                    <Paperclip className="h-4 w-4" />
                                                </Button>
                                                {req.hasAttachment ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn({
                                                    'bg-yellow-500 text-white hover:bg-yellow-600': req.status === 'Pending',
                                                    'bg-green-600 text-white hover:bg-green-700': req.status === 'Approved',
                                                    'bg-red-600 text-white hover:bg-red-700': req.status === 'Denied',
                                                })}
                                            >
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Time Entry</DialogTitle>
                <DialogDescription>
                    Update the details for your time entry on {editingEntry ? format(parseISO(editingEntry.startTime), 'PPP') : ''}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-taskDescription">Task Description</Label>
                    <Input
                        id="edit-taskDescription"
                        name="taskDescription"
                        value={editForm.taskDescription}
                        onChange={handleEditFormChange}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-startTime">Start Time</Label>
                        <Input
                            id="edit-startTime"
                            name="startTime"
                            type="time"
                            value={editForm.startTime}
                            onChange={handleEditFormChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-endTime">End Time</Label>
                        <Input
                            id="edit-endTime"
                            name="endTime"
                            type="time"
                            value={editForm.endTime}
                            onChange={handleEditFormChange}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}



