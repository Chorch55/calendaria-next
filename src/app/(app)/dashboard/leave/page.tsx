
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, CalendarDays, Filter, Check, X, Calendar as CalendarIcon, Info, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { ChromePicker, ColorResult } from 'react-color';


interface LeaveRequest {
  id: string;
  employee: {
    name: string;
    avatarUrl?: string;
  };
  startDate: Date;
  endDate: Date;
  typeId: string; // Changed from type to typeId
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

interface LeaveType {
    id: string;
    name: string;
    color: string;
    isSystemType?: boolean;
}

const initialLeaveTypes: LeaveType[] = [
    { id: 'vacation', name: 'Vacation', color: '#3B82F6', isSystemType: true },
    { id: 'sick', name: 'Sick Leave', color: '#F59E0B', isSystemType: true },
    { id: 'personal', name: 'Personal', color: '#8B5CF6', isSystemType: true },
];

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'req1', employee: { name: 'Diana Prince', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-09-02'), endDate: new Date('2024-09-06'), typeId: 'vacation', reason: 'Annual leave', status: 'Pending' },
  { id: 'req2', employee: { name: 'Charlie Brown', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-08-19'), endDate: new Date('2024-08-19'), typeId: 'sick', reason: '-', status: 'Approved' },
  { id: 'req3', employee: { name: 'Bob Smith', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-08-12'), endDate: new Date('2024-08-16'), typeId: 'vacation', reason: 'Family trip', status: 'Approved' },
  { id: 'req4', employee: { name: 'Bob Smith', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-07-25'), endDate: new Date('2024-07-25'), typeId: 'personal', reason: 'Not enough notice', status: 'Denied' },
  { id: 'req5', employee: { name: 'Elena Rodriguez', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-08-28'), endDate: new Date('2024-08-30'), typeId: 'vacation', reason: 'Short break', status: 'Approved' },
  { id: 'req6', employee: { name: 'Diana Prince', avatarUrl: 'https://placehold.co/40x40.png' }, startDate: new Date('2024-08-12'), endDate: new Date('2024-08-12'), typeId: 'sick', reason: 'Feeling unwell', status: 'Approved' },
];

const emptyRequestForm: { range?: DateRange; typeId: string; reason: string } = {
  typeId: 'vacation',
  reason: '',
};

const emptyLeaveTypeForm: Omit<LeaveType, 'id'|'isSystemType'> = { name: '', color: '#A3E635' };


export default function LeaveManagementPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveRequest['status']>('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState(emptyRequestForm);
  
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialLeaveTypes);
  const [isLeaveTypeDialogOpen, setIsLeaveTypeDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [leaveTypeForm, setLeaveTypeForm] = useState<Partial<LeaveType>>(emptyLeaveTypeForm);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(req => req.status === statusFilter);
  }, [requests, statusFilter]);
  
  const getLeaveTypeById = useCallback((typeId: string) => {
    return leaveTypes.find(lt => lt.id === typeId);
  }, [leaveTypes]);

  const approvedLeaveDaysByCount = useMemo(() => {
    const dayCounts: Record<string, number> = {};
    requests.forEach(req => {
      if (req.status === 'Approved') {
        eachDayOfInterval({ start: startOfDay(req.startDate), end: startOfDay(req.endDate) }).forEach(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
        });
      }
    });

    // Build modifiers object: keys are "1", "2", "3", values are arrays of Date
    const modifiers: Record<string, Date[]> = { "1": [], "2": [], "3": [] };
    Object.entries(dayCounts).forEach(([dateStr, count]) => {
      const date = new Date(dateStr);
      if (count >= 3) {
        modifiers["3"].push(date);
      } else if (count === 2) {
        modifiers["2"].push(date);
      } else if (count === 1) {
        modifiers["1"].push(date);
      }
    });
    return modifiers;
  }, [requests]);

  const handleRequestStatusChange = (requestId: string, newStatus: LeaveRequest['status']) => {
    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
    toast.success("Request Updated", {
      description: `The leave request has been ${newStatus.toLowerCase()}.`
    });
  };
  
  const handleNewRequestSubmit = () => {
    if (!newRequestForm.range?.from || !newRequestForm.range?.to) {
        toast.error("Date range required", {
          description: "Please select a start and end date."
        });
        return;
    }

    const newRequest: LeaveRequest = {
        id: `req-${Date.now()}`,
        employee: { name: 'Elena Rodriguez', avatarUrl: 'https://placehold.co/40x40.png' }, // Assuming current user
        startDate: newRequestForm.range.from,
        endDate: newRequestForm.range.to,
        typeId: newRequestForm.typeId,
        reason: newRequestForm.reason || '-',
        status: 'Pending',
    };
    
    setRequests(prev => [newRequest, ...prev]);
    setIsRequestDialogOpen(false);
    setNewRequestForm(emptyRequestForm);
    toast.success("Request Submitted", {
      description: "Your time off request has been submitted for approval."
    });
  }
  
  const handleOpenLeaveTypeDialog = (type: LeaveType | null) => {
      setEditingLeaveType(type);
      setLeaveTypeForm(type ? { ...type } : { ...emptyLeaveTypeForm });
      setIsLeaveTypeDialogOpen(true);
  };
  
  const handleSaveLeaveType = () => {
    if (!leaveTypeForm.name?.trim() || !leaveTypeForm.color?.trim()) {
        toast.error("Name and color are required");
        return;
    }
    if (editingLeaveType) {
        setLeaveTypes(prev => prev.map(lt => lt.id === editingLeaveType.id ? { ...lt, name: leaveTypeForm.name, color: leaveTypeForm.color } as LeaveType : lt));
        toast.success("Leave Type Updated");
    } else {
        const newLeaveType: LeaveType = {
            id: `custom-${Date.now()}`,
            name: leaveTypeForm.name,
            color: leaveTypeForm.color,
            isSystemType: false,
        };
        setLeaveTypes(prev => [...prev, newLeaveType]);
        toast.success("Leave Type Created");
    }
    setIsLeaveTypeDialogOpen(false);
  };
  
  const handleDeleteLeaveType = (typeId: string) => {
    // TODO: Add check if type is in use by any request
    setLeaveTypes(prev => prev.filter(lt => lt.id !== typeId));
    setIsLeaveTypeDialogOpen(false);
    toast.error("Leave Type Deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('leave')}</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza las ausencias del equipo y gestiona las solicitudes de vacaciones.
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsRequestDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Solicitar Ausencia
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Calendario de Ausencias del Equipo</CardTitle>
          <CardDescription>Una vista general de las vacaciones aprobadas en todo el equipo.</CardDescription>
        </CardHeader>
        <CardContent>
           <CalendarComponent
              mode="multiple"
              modifiers={approvedLeaveDaysByCount}
              modifiersStyles={{
                  1: { backgroundColor: '#FBBF24', color: '#1E293B', borderRadius: '0.375rem', fontWeight: 'bold' },
                  2: { backgroundColor: '#F59E0B', color: '#1E293B', borderRadius: '0.375rem', fontWeight: 'bold' },
                  3: { backgroundColor: '#EF4444', color: '#ffffff', borderRadius: '0.375rem', fontWeight: 'bold' },
              }}
              modifiersClassNames={{
                  'react-day-picker-modifier-3-or-more': 'font-bold'
              }}
            />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">Solicitudes de Ausencia</CardTitle>
            <CardDescription>Revisa y gestiona todas las solicitudes de días libres.</CardDescription>
          </div>
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pending">Pendiente</SelectItem>
                <SelectItem value="Approved">Aprobado</SelectItem>
                <SelectItem value="Denied">Denegado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => {
                const leaveType = getLeaveTypeById(req.typeId);
                return (
                    <TableRow key={req.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={req.employee.avatarUrl} alt={req.employee.name} data-ai-hint="person avatar"/>
                            <AvatarFallback>{req.employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{req.employee.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(req.startDate, 'MMM d, yyyy')} - {format(req.endDate, 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                        {leaveType && (
                            <Badge style={{ backgroundColor: leaveType.color, color: '#ffffff' }}>
                                {leaveType.name}
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{req.reason}</TableCell>
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
                    <TableCell className="text-right">
                        {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"><Check className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>¿Aprobar solicitud?</AlertDialogTitle><AlertDialogDescription>Esto aprobará la solicitud de ausencia para {req.employee.name}. Esta acción se puede cambiar más tarde.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRequestStatusChange(req.id, 'Approved')}>Aprobar</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"><X className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>¿Denegar solicitud?</AlertDialogTitle><AlertDialogDescription>Esto denegará la solicitud de ausencia para {req.employee.name}. Esta acción se puede cambiar más tarde.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRequestStatusChange(req.id, 'Denied')} className="bg-destructive hover:bg-destructive/90">Denegar</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        ) : (
                        <span>-</span>
                        )}
                    </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-6 border-t p-4">
            <h4 className="font-semibold text-sm">Esquema de Color</h4>
            <div className="w-full space-y-4">
                <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                    <p className="font-medium text-sm pt-2">Estados de la Solicitud</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-yellow-500 text-white">Pendiente</Badge>
                        <Badge className="bg-green-600 text-white">Aprobado</Badge>
                        <Badge className="bg-red-600 text-white">Denegado</Badge>
                    </div>
                </div>
                <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                    <p className="font-medium text-sm pt-2">Tipos de Ausencia</p>
                    <div className="flex flex-wrap items-center gap-2">
                        {leaveTypes.map(lt => (
                            <Badge key={lt.id} style={{ backgroundColor: lt.color, color: '#ffffff' }} className="flex items-center gap-1.5 group">
                                {lt.name}
                                <button onClick={() => handleOpenLeaveTypeDialog(lt)} className="ml-1 opacity-75 hover:opacity-100 focus:outline-none"><Edit className="h-3 w-3" /></button>
                            </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => handleOpenLeaveTypeDialog(null)}>
                            <PlusCircle className="h-3 w-3 mr-1" /> Añadir Tipo
                        </Button>
                    </div>
                </div>
            </div>
        </CardFooter>
      </Card>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Solicitar Ausencia</DialogTitle>
                <DialogDescription>Selecciona las fechas y el tipo de ausencia que solicitas.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="date-range">Fechas</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date-range"
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
                        <CalendarComponent
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
                     <Select value={newRequestForm.typeId} onValueChange={(value) => setNewRequestForm(prev => ({...prev, typeId: value}))}>
                        <SelectTrigger id="leave-type">
                            <SelectValue placeholder="Selecciona el tipo de ausencia" />
                        </SelectTrigger>
                        <SelectContent>
                            {leaveTypes.map(lt => (
                                <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reason">Motivo (Opcional)</Label>
                    <Textarea id="reason" placeholder="Ej: Viaje familiar" value={newRequestForm.reason} onChange={(e) => setNewRequestForm(prev => ({...prev, reason: e.target.value}))} />
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleNewRequestSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">Enviar Solicitud</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLeaveTypeDialogOpen} onOpenChange={setIsLeaveTypeDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}</DialogTitle>
                    <DialogDescription>Customize the name and color for this leave category.</DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="leave-type-name">Type Name</Label>
                        <Input
                            id="leave-type-name"
                            value={leaveTypeForm.name || ''}
                            onChange={(e) => setLeaveTypeForm(p => ({...p, name: e.target.value}))}
                            disabled={leaveTypeForm.isSystemType}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center gap-2 pt-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <div className="w-5 h-5 rounded-md border mr-2" style={{ backgroundColor: leaveTypeForm.color }} />
                                    {leaveTypeForm.color}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 border-0 w-auto">
                                <ChromePicker
                                    color={leaveTypeForm.color}
                                    onChange={(color: ColorResult) => setLeaveTypeForm(p => ({ ...p, color: color.hex }))}
                                    disableAlpha={true}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                   <div>
                     {!editingLeaveType?.isSystemType && editingLeaveType && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Type</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete "{editingLeaveType.name}"?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this leave type. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLeaveType(editingLeaveType.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                   </div>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveLeaveType} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
    
