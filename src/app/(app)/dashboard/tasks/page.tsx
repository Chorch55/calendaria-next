
"use client";

import type {NextPage} from 'next';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PlusCircle, GripVertical, Filter, Calendar as CalendarIcon, AlertOctagon, ChevronsUpDown, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner"
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // Keep as string 'yyyy-MM-dd'
  assignee?: { name: string; avatar?: string };
}

export const initialTasksData: Task[] = [
  { id: 'task1', title: 'Draft Q3 Report for Project Alpha', description: 'Compile all financial data, performance metrics, and draft the initial report for Q3 review. Focus on key achievements and challenges.', status: 'todo', priority: 'high', dueDate: '2024-08-15', assignee: { name: 'Elena R.', avatar: 'https://placehold.co/40x40.png'} },
  { id: 'task2', title: 'Follow up with Client X regarding new proposal', description: 'Send a follow-up email and schedule a call to discuss the new service proposal sent last week.', status: 'todo', priority: 'medium', dueDate: '2024-08-05', assignee: { name: 'Bob S.', avatar: 'https://placehold.co/40x40.png'} },
  { id: 'task3', title: 'Develop new landing page design mockups', description: 'Create 3-4 initial mockups for the new landing page V2. Consider mobile-first approach and modern UI trends.', status: 'inprogress', priority: 'high', dueDate: '2024-08-20', assignee: { name: 'Alice W.', avatar: 'https://placehold.co/40x40.png'} },
  { id: 'task4', title: 'Review team performance for Q2', description: 'Analyze Q2 performance metrics for all team members and prepare individual feedback sessions.', status: 'inprogress', priority: 'medium', assignee: { name: 'Elena R.', avatar: 'https://placehold.co/40x40.png'} },
  { id: 'task5', title: 'Onboard new intern - Phase 1', description: 'Prepare onboarding materials, access credentials, and schedule introductory meetings for the new marketing intern.', status: 'done', priority: 'low', dueDate: '2024-07-30', assignee: { name: 'Charlie B.', avatar: 'https://placehold.co/40x40.png'} },
  { id: 'task6', title: 'Fix critical login bug #123 on production', status: 'todo', priority: 'high', assignee: {name: "Dev Team", avatar: 'https://placehold.co/40x40.png'}},
  { id: 'task7', title: 'Plan Q4 Marketing Campaign', description: 'Outline key themes, channels, and budget for the upcoming Q4 marketing campaign.', status: 'todo', priority: 'medium', dueDate: '2024-09-01', assignee: { name: 'Alice W.', avatar: 'https://placehold.co/40x40.png'}},
  { id: 'taskToday', title: 'Prepare for today\'s team meeting (from Tasks Page)', description: 'Review agenda and prepare talking points.', status: 'todo', priority: 'high', dueDate: new Date().toISOString().split('T')[0], assignee: { name: 'Elena R.', avatar: 'https://placehold.co/40x40.png'} },
];

type TaskStatus = 'todo' | 'inprogress' | 'done';

const statusColumns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  switch (priority) {
    case 'high': return <AlertOctagon className="h-3 w-3" />;
    case 'medium': return <ChevronsUpDown className="h-3 w-3" />; 
    case 'low': return <ChevronsUpDown className="h-3 w-3 opacity-70" />; 
    default: return null;
  }
};

const TaskCard = React.memo(({ task, onEdit }: { task: Task; onEdit: (task: Task) => void; }) => (
  <Card 
    className="mb-3 shadow-sm hover:shadow-lg transition-shadow duration-150 ease-in-out cursor-pointer"
    onClick={() => onEdit(task)}
    role="button"
    tabIndex={0}
    aria-label={`Edit task: ${task.title}`}
  >
    <CardContent className="p-3 space-y-2">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm leading-tight flex-1 mr-2">{task.title}</p>
        <Button variant="ghost" size="sm" className="p-1 h-auto opacity-50 hover:opacity-100" onClick={(e) => e.stopPropagation()} >
          <GripVertical className="h-4 w-4" />
          <span className="sr-only">Move task (visual only)</span>
        </Button>
      </div>
      {task.description && <p className="text-xs text-muted-foreground break-words">{task.description.substring(0, 120)}{task.description.length > 120 ? '...' : ''}</p>}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} 
                  className="px-1.5 py-0.5 text-[10px] capitalize"
                >
                    <PriorityIcon priority={task.priority} />
                    <span className="ml-1">{task.priority}</span>
                </Badge>
            )}
            {task.dueDate && (
                <span className="flex items-center gap-1 text-muted-foreground/80">
                    <CalendarIcon className="h-3 w-3" /> 
                    {format(new Date(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7)) - 1, parseInt(task.dueDate.substring(8,10))), 'MMM d')}
                </span>
            )}
        </div>
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint="person avatar" />
            <AvatarFallback className="text-[10px]">
              {task.assignee.name ? task.assignee.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'NA'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </CardContent>
  </Card>
));
TaskCard.displayName = 'TaskCard';


const defaultTaskFormData: Partial<Task> = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: undefined,
  assignee: { name: '', avatar: 'https://placehold.co/40x40.png' },
};

// Helper function to parse 'yyyy-MM-dd' string to local Date object
const parseValidDateString = (dateStr: string | undefined): Date | undefined => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return undefined;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return undefined;
  }
  return new Date(year, month - 1, day);
};


const TasksPage: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasksData);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false); 
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentTaskData, setCurrentTaskData] = useState<Partial<Task>>(defaultTaskFormData);

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter(task => task.status === column.id)
        .sort((a, b) => { // Optional: sort tasks within columns, e.g., by priority then title
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityA = priorityOrder[a.priority] || 3;
            const priorityB = priorityOrder[b.priority] || 3;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return (a.title || '').localeCompare(b.title || '');
        });
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const handleOpenCreateTaskDialog = () => {
    setEditingTask(null);
    setCurrentTaskData(defaultTaskFormData);
    setIsTaskDialogOpen(true);
  };

  const handleOpenEditTaskDialog = useCallback((task: Task) => {
    setEditingTask(task);
    setCurrentTaskData({ ...task });
    setIsTaskDialogOpen(true);
  }, []);

  const handleTaskDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "assigneeName") {
        setCurrentTaskData(prev => ({ ...prev, assignee: { ...(prev.assignee || { avatar: 'https://placehold.co/40x40.png' }), name: value } }));
    } else {
        setCurrentTaskData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTaskSelectChange = (name: 'status' | 'priority', value: string) => {
    setCurrentTaskData(prev => ({ ...prev, [name]: value as Task['status'] | Task['priority'] }));
  };

  const handleTaskDateChange = (date: Date | undefined) => {
    setCurrentTaskData(prev => ({ ...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined }));
  };

  const handleSaveTask = () => {
    if (!currentTaskData.title?.trim()) {
      toast.error("Error", {
        description: "Task title is required."
      });
      return;
    }

    if (editingTask) { 
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === editingTask.id ? { ...task, ...currentTaskData } as Task : task
      ));
      toast.success("Task Updated", {
        description: `"${currentTaskData.title}" has been updated.`
      });
    } else { 
      const newTaskAssigneeName = currentTaskData.assignee?.name?.trim();
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: currentTaskData.title!,
        description: currentTaskData.description || '',
        status: currentTaskData.status || 'todo',
        priority: currentTaskData.priority || 'medium',
        dueDate: currentTaskData.dueDate,
        assignee: { 
            name: newTaskAssigneeName || 'Unassigned', 
            avatar: currentTaskData.assignee?.avatar || 'https://placehold.co/40x40.png'
        },
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      toast.success("Task Created", {
        description: `"${newTask.title}" has been added.`
      });
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setCurrentTaskData(defaultTaskFormData);
  };

  const currentDueDateForDisplay = useMemo(() => {
    return parseValidDateString(currentTaskData.dueDate);
  }, [currentTaskData.dueDate]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <CardDescription>Organize, assign, and track your team's work using a Kanban-style board.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => alert("Filters functionality will be added later.")}>
                <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenCreateTaskDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Task
            </Button>
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 pb-4 overflow-x-auto">
        {statusColumns.map(column => (
          <div key={column.id} className="flex flex-col min-w-[320px] md:min-w-0">
            <Card className="flex flex-col flex-grow bg-muted/20 shadow-sm">
              <CardHeader className="p-3 border-b sticky top-0 bg-muted/40 backdrop-blur-sm z-10">
                <CardTitle className="text-md font-semibold flex items-center justify-between">
                  {column.title}
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{tasksByStatus[column.id]?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex-grow overflow-y-auto">
                {tasksByStatus[column.id] && tasksByStatus[column.id].length > 0 ? (
                  tasksByStatus[column.id].map(task => (
                    <TaskCard key={task.id} task={task} onEdit={handleOpenEditTaskDialog} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No tasks in this stage.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={(isOpen) => {
          setIsTaskDialogOpen(isOpen);
          if (!isOpen) {
            setEditingTask(null);
            setCurrentTaskData(defaultTaskFormData);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-y-auto pr-6 pl-2 py-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={currentTaskData.title || ''} onChange={handleTaskDataChange} placeholder="Task title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={currentTaskData.description || ''} onChange={handleTaskDataChange} placeholder="Task description..." rows={4} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" value={currentTaskData.status} onValueChange={(value) => handleTaskSelectChange('status', value)}>
                    <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" value={currentTaskData.priority} onValueChange={(value) => handleTaskSelectChange('priority', value)}>
                    <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDueDateForDisplay ? format(currentDueDateForDisplay, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={currentDueDateForDisplay}
                        onSelect={handleTaskDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                 <div>
                  <Label htmlFor="assigneeName">Assignee Name</Label>
                  <Input id="assigneeName" name="assigneeName" value={currentTaskData.assignee?.name || ''} onChange={handleTaskDataChange} placeholder="Assignee name" />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveTask} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" /> {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default TasksPage;
// Export initialTasksData for calendar integration (or other pages if needed)
export { initialTasksData as initialTasks };
