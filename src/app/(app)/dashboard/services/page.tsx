
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Save, Users, Briefcase, UserPlus, Link as LinkIcon, Folder, ChevronDown, ChevronRight, CalendarCheck2, Coffee } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initialTeamMembers } from '../team/page';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// --- MOCK DATA & TYPES ---
// In a real app, these would come from a database/API

export interface MockService {
  id: string;
  name: string;
  duration: number; // in minutes
  categoryId: string;
}

export interface MockServiceCategory {
    id: string;
    name: string;
}

export interface MockTeam {
  id: string;
  name: string;
  memberIds: string[];
}

export interface MockUser {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export interface ServiceAssignment {
    // Can assign a whole category or a single service
    assignee: { type: 'user' | 'team'; id: string };
    assignment: { type: 'category' | 'service'; id: string };
}

interface AvailabilityOverride {
  id: string;
  dateRange: DateRange;
  openingHour: number;
  closingHour: number;
}

interface Break {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

const emptyOverrideData: Omit<AvailabilityOverride, 'id'> = {
    dateRange: { from: undefined, to: undefined },
    openingHour: 9,
    closingHour: 14,
};

const emptyBreakData: Omit<Break, 'id'> = {
  name: 'Lunch Break',
  startTime: '13:00',
  endTime: '14:00',
};


const initialCategories: MockServiceCategory[] = [
    { id: 'cat-1', name: 'Consultas Legales' },
    { id: 'cat-2', name: 'Gestión de Atestados' },
];

const initialServices: MockService[] = [
    { id: 'service-1', name: 'Consulta de Divorcio', duration: 30, categoryId: 'cat-1' },
    { id: 'service-2', name: 'Consulta de Herencia', duration: 60, categoryId: 'cat-1' },
    { id: 'service-3', name: 'Revisión de Atestado de Coche', duration: 45, categoryId: 'cat-2' },
    { id: 'service-4', name: 'Revisión de Atestado de Bici', duration: 25, categoryId: 'cat-2' },
];

const initialTeams: MockTeam[] = [
    { id: 'team-1', name: 'Equipo de Divorcios', memberIds: ['user0', 'user4'] },
    { id: 'team-2', name: 'Equipo de Atestados', memberIds: ['user2', 'user3', 'user4'] },
];

const initialAssignments: ServiceAssignment[] = [
    { assignee: { type: 'team', id: 'team-1' }, assignment: { type: 'service', id: 'service-1' } },
    { assignee: { type: 'team', id: 'team-2' }, assignment: { type: 'category', id: 'cat-2' } },
    { assignee: { type: 'user', id: 'user0' }, assignment: { type: 'service', id: 'service-2' } },
];

const initialAvailabilitySettingsData = {
    openingHour: 9,
    closingHour: 17,
    availabilityOverrides: [] as AvailabilityOverride[],
    breaks: [
      { id: 'break-1', name: 'Lunch Break', startTime: '13:00', endTime: '14:00' },
    ] as Break[],
};


const allUsers: MockUser[] = initialTeamMembers.map(tm => ({ id: tm.id, name: tm.name, email: tm.email, avatarUrl: tm.avatarUrl }));

// --- HELPER FUNCTIONS FOR MOCKING ---
export const getMockCategories = () => initialCategories;
export const getMockServices = () => initialServices;
export const getMockTeamMembers = () => allUsers;
export const getMockTeams = () => initialTeams;
export const getMockAssignments = () => initialAssignments;
export const getMockAvailability = () => initialAvailabilitySettingsData;


export default function ServicesPage() {
    const [categories, setCategories] = useState<MockServiceCategory[]>(initialCategories);
    const [services, setServices] = useState<MockService[]>(initialServices);
    const [teams, setTeams] = useState<MockTeam[]>(initialTeams);
    const [assignments, setAssignments] = useState<ServiceAssignment[]>(initialAssignments);
    const { toast } = useToast();
    
    // Moved Availability State
    const [availability, setAvailability] = useState(initialAvailabilitySettingsData);

    // --- State for Dialogs ---
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MockServiceCategory | null>(null);

    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<MockService | null>(null);
    const [serviceDialogCategoryId, setServiceDialogCategoryId] = useState<string | null>(null);

    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<MockTeam | null>(null);

    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [assignmentTarget, setAssignmentTarget] = useState<{ type: 'user' | 'team'; id: string; name: string; } | null>(null);
    

    // --- Memoized data for easy lookup ---
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), []);
    const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);
    const serviceMap = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
    
    const servicesByCategory = useMemo(() => {
        return categories.reduce((acc, category) => {
            acc[category.id] = services.filter(s => s.categoryId === category.id);
            return acc;
        }, {} as Record<string, MockService[]>);
    }, [categories, services]);
    
    const getAssignmentsFor = useCallback((type: 'user' | 'team', id: string) => {
        return assignments.filter(a => a.assignee.type === type && a.assignee.id === id);
    }, [assignments]);
    
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}:00` }));


    // --- Category Management ---
    const handleOpenCategoryDialog = (category: MockServiceCategory | null) => {
        setEditingCategory(category);
        setIsCategoryDialogOpen(true);
    };

    const handleSaveCategory = (formData: { name: string }) => {
        if (editingCategory) {
            setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
            toast({ title: "Category Updated" });
        } else {
            const newCategory = { id: `cat-${Date.now()}`, ...formData };
            setCategories(prev => [...prev, newCategory]);
            toast({ title: "Category Created" });
        }
        setIsCategoryDialogOpen(false);
    };

    const handleDeleteCategory = (categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        setServices(prev => prev.filter(s => s.categoryId !== categoryId));
        setAssignments(prev => prev.filter(a => a.assignment.type !== 'category' || a.assignment.id !== categoryId));
        toast({ title: "Category Deleted", variant: "destructive" });
    };

    // --- Service Management ---
    const handleOpenServiceDialog = (service: MockService | null, categoryId: string) => {
        setEditingService(service);
        setServiceDialogCategoryId(categoryId);
        setIsServiceDialogOpen(true);
    };

    const handleSaveService = (formData: { name: string; duration: number; categoryId: string }) => {
        if (editingService) {
            setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...formData } : s));
            toast({ title: "Service Updated" });
        } else {
            const newService = { id: `service-${Date.now()}`, ...formData };
            setServices(prev => [...prev, newService]);
            toast({ title: "Service Created" });
        }
        setIsServiceDialogOpen(false);
    };
    
    const handleDeleteService = (serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setAssignments(prev => prev.filter(a => a.assignment.type !== 'service' || a.assignment.id !== serviceId));
        toast({ title: "Service Deleted", variant: "destructive" });
    };

    // --- Team Management ---
    const handleOpenTeamDialog = (team: MockTeam | null) => {
        setEditingTeam(team);
        setIsTeamDialogOpen(true);
    };

    const handleSaveTeam = (formData: { name: string; memberIds: string[] }) => {
        if (editingTeam) {
            setTeams(prev => prev.map(t => t.id === editingTeam.id ? { ...t, ...formData } : t));
            toast({ title: "Team Updated" });
        } else {
            const newTeam = { id: `team-${Date.now()}`, ...formData };
            setTeams(prev => [...prev, newTeam]);
            toast({ title: "Team Created" });
        }
        setIsTeamDialogOpen(false);
    };
    
    const handleDeleteTeam = (teamId: string) => {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        setAssignments(prev => prev.filter(a => a.assignee.type !== 'team' || a.assignee.id !== teamId));
        toast({ title: "Team Deleted", variant: "destructive" });
    };
    
    // --- Assignment Management ---
    const handleOpenAssignmentDialog = (assignee: { type: 'user' | 'team', id: string, name: string }) => {
        setAssignmentTarget(assignee);
        setIsAssignmentDialogOpen(true);
    };
    
    const handleSaveAssignments = (selectedAssignments: { type: 'category' | 'service', id: string }[]) => {
        if (!assignmentTarget) return;

        const otherAssignments = assignments.filter(a => a.assignee.id !== assignmentTarget.id || a.assignee.type !== assignmentTarget.type);
        
        const newAssignments = selectedAssignments.map(assignment => ({
            assignee: { type: assignmentTarget.type, id: assignmentTarget.id },
            assignment,
        }));

        setAssignments([...otherAssignments, ...newAssignments]);
        toast({ title: "Assignments Updated" });
        setIsAssignmentDialogOpen(false);
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ajustes de Reservas</h1>
                <p className="text-muted-foreground mt-1">
                    Define services, teams, assignments, and manage your company's general availability for bookings.
                </p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Left Column */}
                <div className="space-y-8">
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center"><Briefcase className="h-5 w-5 mr-2 text-primary" /> Service Catalog</CardTitle>
                            <Button size="sm" onClick={() => handleOpenCategoryDialog(null)}><PlusCircle className="h-4 w-4 mr-2"/>Add Category</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {categories.map(category => (
                                <Collapsible key={category.id} defaultOpen>
                                    <div className="p-3 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-center">
                                            <CollapsibleTrigger asChild>
                                            <div className="flex items-center gap-2 flex-1 cursor-pointer group">
                                                    <Folder className="h-5 w-5 text-primary"/>
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                            </div>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryDialog(category)}><Edit className="h-4 w-4"/></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete category "{category.name}"?</AlertDialogTitle><AlertDialogDescription>This will also delete all services and assignments within this category. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="pt-2 pl-4 space-y-2 mt-2 border-l border-dashed">
                                            {(servicesByCategory[category.id] || []).map(service => (
                                                <ServiceCard key={service.id} service={service} onEdit={() => handleOpenServiceDialog(service, category.id)} onDelete={handleDeleteService} />
                                            ))}
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenServiceDialog(null, category.id)}>
                                                <PlusCircle className="h-4 w-4 mr-2"/>Add Service to "{category.name}"
                                            </Button>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            ))}
                        {categories.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No service categories created yet.</p>}
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center"><CalendarCheck2 className="h-5 w-5 mr-2 text-primary"/> General Availability</CardTitle>
                            <CardDescription>Define your company's standard working hours. Individual schedules and time off are managed in "Leave & Absences".</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="font-semibold">General Company Schedule</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-2"><Label>Opening Hour</Label><Select value={String(availability.openingHour)} onValueChange={(v) => setAvailability(p => ({...p, openingHour: parseInt(v)}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{hourOptions.map(h => <SelectItem key={h.value} value={String(h.value)}>{h.label}</SelectItem>)}</SelectContent></Select></div>
                                    <div className="space-y-2"><Label>Closing Hour</Label><Select value={String(availability.closingHour)} onValueChange={(v) => setAvailability(p => ({...p, closingHour: parseInt(v)}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{hourOptions.map(h => <SelectItem key={h.value} value={String(h.value)}>{h.label}</SelectItem>)}</SelectContent></Select></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                         <CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-primary" /> Teams & Users</CardTitle>
                         <Button size="sm" onClick={() => handleOpenTeamDialog(null)}><UserPlus className="h-4 w-4 mr-2"/>Create Team</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {teams.map(team => (
                                <AssigneeCard
                                    key={team.id}
                                    type="team"
                                    id={team.id}
                                    name={team.name}
                                    members={team.memberIds.map(id => userMap.get(id)!).filter(Boolean)}
                                    assignedItems={getAssignmentsFor('team', team.id)}
                                    serviceMap={serviceMap}
                                    categoryMap={categoryMap}
                                    onEditAssignments={() => handleOpenAssignmentDialog({ type: 'team', id: team.id, name: team.name })}
                                    onEditEntity={() => handleOpenTeamDialog(team)}
                                    onDeleteEntity={() => handleDeleteTeam(team.id)}
                                />
                            ))}
                        </div>
                        
                        <div className="pt-4 border-t">
                             <h3 className="font-semibold text-lg text-muted-foreground mt-2 mb-4">Individual Users</h3>
                             <div className="space-y-4">
                                {allUsers.map(user => (
                                    <AssigneeCard
                                        key={user.id}
                                        type="user"
                                        id={user.id}
                                        name={user.name}
                                        members={[user]}
                                        assignedItems={getAssignmentsFor('user', user.id)}
                                        serviceMap={serviceMap}
                                        categoryMap={categoryMap}
                                        onEditAssignments={() => handleOpenAssignmentDialog({ type: 'user', id: user.id, name: user.name })}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isCategoryDialogOpen && <CategoryDialog isOpen={isCategoryDialogOpen} onClose={() => setIsCategoryDialogOpen(false)} onSave={handleSaveCategory} category={editingCategory} />}
            {isServiceDialogOpen && <ServiceDialog isOpen={isServiceDialogOpen} onClose={() => setIsServiceDialogOpen(false)} onSave={handleSaveService} service={editingService} categoryId={serviceDialogCategoryId!} />}
            {isTeamDialogOpen && <TeamDialog isOpen={isTeamDialogOpen} onClose={() => setIsTeamDialogOpen(false)} onSave={handleSaveTeam} team={editingTeam} allUsers={allUsers} />}
            {isAssignmentDialogOpen && assignmentTarget &&(
                <AssignmentDialog
                    isOpen={isAssignmentDialogOpen}
                    onClose={() => setIsAssignmentDialogOpen(false)}
                    onSave={handleSaveAssignments}
                    assigneeName={assignmentTarget.name}
                    allCategories={categories}
                    allServices={services}
                    servicesByCategory={servicesByCategory}
                    currentAssignments={getAssignmentsFor(assignmentTarget.type, assignmentTarget.id)}
                />
            )}
        </div>
    );
}

// --- SUB-COMPONENTS ---

const ServiceCard = ({ service, onEdit, onDelete }: { service: MockService, onEdit: () => void, onDelete: (id: string) => void }) => (
    <div className="p-2 border rounded-md bg-background flex justify-between items-center">
        <div>
            <p className="font-medium text-sm">{service.name}</p>
            <p className="text-xs text-muted-foreground">{service.duration} min</p>
        </div>
        <div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Edit className="h-3.5 w-3.5"/></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete service "{service.name}"?</AlertDialogTitle><AlertDialogDescription>This will also remove any assignments of this service. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(service.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
);


const AssigneeCard = ({ type, id, name, members, assignedItems, serviceMap, categoryMap, onEditAssignments, onEditEntity, onDeleteEntity }: { type: 'user' | 'team', id: string, name: string, members: MockUser[], assignedItems: ServiceAssignment[], serviceMap: Map<string, MockService>, categoryMap: Map<string, MockServiceCategory>, onEditAssignments: () => void, onEditEntity?: () => void, onDeleteEntity?: () => void }) => {
    return (
         <Card className="bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                        {members.slice(0, 3).map(m => (
                            <Avatar key={m.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                <AvatarImage src={m.avatarUrl} alt={m.name} />
                                <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                </div>
                {type === 'team' && (
                    <div className="flex items-center gap-1">
                        {onEditEntity && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEditEntity}><Edit className="h-4 w-4"/></Button>}
                        {onDeleteEntity && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete {type} "{name}"?</AlertDialogTitle><AlertDialogDescription>This will also remove all service assignments for this {type}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDeleteEntity}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="p-3 border rounded-md bg-muted/30">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm">Assigned Services & Categories</h4>
                        <Button variant="outline" size="sm" onClick={onEditAssignments}><LinkIcon className="h-3 w-3 mr-2"/>Manage</Button>
                    </div>
                    <div className="space-y-1">
                        {assignedItems.length > 0 ? assignedItems.map(item => {
                            const assignment = item.assignment;
                            if (assignment.type === 'category') {
                                const category = categoryMap.get(assignment.id);
                                return <p key={`cat-${assignment.id}`} className="text-sm font-semibold text-foreground">&bull; {category?.name} (Category)</p>
                            } else {
                                const service = serviceMap.get(assignment.id);
                                return <p key={`srv-${assignment.id}`} className="text-sm text-muted-foreground pl-4">&bull; {service?.name} ({service?.duration} min)</p>
                            }
                        }) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No items assigned.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};


const CategoryDialog = ({ isOpen, onClose, onSave, category }: { isOpen: boolean; onClose: () => void; onSave: (data: { name: string }) => void; category: MockServiceCategory | null }) => {
    const [name, setName] = useState(category?.name || '');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name.trim()) {
            toast({ title: "Validation Error", description: "Please enter a category name.", variant: "destructive"});
            return;
        }
        onSave({ name });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>{category ? "Edit Category" : "Create New Category"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="category-name">Category Name</Label><Input id="category-name" value={name} onChange={e => setName(e.target.value)} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2"/>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ServiceDialog = ({ isOpen, onClose, onSave, service, categoryId }: { isOpen: boolean; onClose: () => void; onSave: (data: { name: string; duration: number, categoryId: string }) => void; service: MockService | null; categoryId: string }) => {
    const [name, setName] = useState(service?.name || '');
    const [duration, setDuration] = useState(service?.duration || 30);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name.trim() || duration <= 0) {
            toast({ title: "Validation Error", description: "Please enter a valid name and a duration greater than 0.", variant: "destructive"});
            return;
        }
        onSave({ name, duration, categoryId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>{service ? "Edit Service" : "Create New Service"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="service-name">Service Name</Label><Input id="service-name" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="service-duration">Duration (in minutes)</Label><Input id="service-duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2"/>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const TeamDialog = ({ isOpen, onClose, onSave, team, allUsers }: { isOpen: boolean; onClose: () => void; onSave: (data: { name: string; memberIds: string[] }) => void; team: MockTeam | null, allUsers: MockUser[] }) => {
    const [name, setName] = useState(team?.name || '');
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set(team?.memberIds || []));
    const { toast } = useToast();

    const handleMemberToggle = (memberId: string) => {
        const newSet = new Set(selectedMemberIds);
        if (newSet.has(memberId)) {
            newSet.delete(memberId);
        } else {
            newSet.add(memberId);
        }
        setSelectedMemberIds(newSet);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast({ title: "Validation Error", description: "Please enter a team name.", variant: "destructive"});
            return;
        }
        onSave({ name, memberIds: Array.from(selectedMemberIds) });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{team ? "Edit Team" : "Create New Team"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="team-name">Team Name</Label><Input id="team-name" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Team Members</Label>
                        <ScrollArea className="h-48 border rounded-md p-2">
                           {allUsers.map(user => (
                               <div key={user.id} className="flex items-center space-x-2 py-1.5">
                                   <Checkbox id={`member-${user.id}`} checked={selectedMemberIds.has(user.id)} onCheckedChange={() => handleMemberToggle(user.id)} />
                                   <Label htmlFor={`member-${user.id}`} className="font-normal">{user.name}</Label>
                               </div>
                           ))}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2"/>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AssignmentDialog = ({ isOpen, onClose, onSave, assigneeName, allCategories, allServices, servicesByCategory, currentAssignments }: { isOpen: boolean; onClose: () => void; onSave: (assignments: { type: 'category' | 'service', id: string }[]) => void; assigneeName: string; allCategories: MockServiceCategory[]; allServices: MockService[], servicesByCategory: Record<string, MockService[]>, currentAssignments: ServiceAssignment[] }) => {
    
    const [selectedItems, setSelectedItems] = useState<Set<string>>(
      new Set(currentAssignments.map(a => `${a.assignment.type}:${a.assignment.id}`))
    );

    const handleItemToggle = (type: 'category' | 'service', id: string) => {
        const key = `${type}:${id}`;
        const newSet = new Set(selectedItems);
        if (newSet.has(key)) {
            newSet.delete(key);
            // If it's a category, uncheck all its services
            if(type === 'category'){
                (servicesByCategory[id] || []).forEach(service => newSet.delete(`service:${service.id}`));
            }
        } else {
            newSet.add(key);
            // If it's a category, check all its services
             if(type === 'category'){
                (servicesByCategory[id] || []).forEach(service => newSet.add(`service:${service.id}`));
            }
        }
        setSelectedItems(newSet);
    };

    const handleSubmit = () => {
        const assignmentsToSave = Array.from(selectedItems)
            .map(key => {
                const [type, id] = key.split(':');
                return { type, id } as { type: 'category' | 'service', id: string };
            })
            // Filter out services if their category is also selected
            .filter((item, _, arr) => {
                if(item.type === 'service') {
                    const service = allServices.find(s => s.id === item.id);
                    if (service && arr.some(i => i.type === 'category' && i.id === service.categoryId)) {
                        return false;
                    }
                }
                return true;
            });
        
        onSave(assignmentsToSave);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Manage Services for {assigneeName}</DialogTitle><DialogDescription>Select the services and categories this user or team will provide.</DialogDescription></DialogHeader>
                <ScrollArea className="h-72 border rounded-md p-4 my-4">
                    <div className="space-y-4">
                        {allCategories.map(category => (
                            <div key={category.id} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`cat-assign-${category.id}`} 
                                        checked={selectedItems.has(`category:${category.id}`)} 
                                        onCheckedChange={() => handleItemToggle('category', category.id)} />
                                    <Label htmlFor={`cat-assign-${category.id}`} className="font-semibold">{category.name}</Label>
                                </div>
                                <div className="pl-6 space-y-2">
                                    {(servicesByCategory[category.id] || []).map(service => (
                                         <div key={service.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`service-assign-${service.id}`} 
                                                checked={selectedItems.has(`service:${service.id}`)} 
                                                onCheckedChange={() => handleItemToggle('service', service.id)}
                                                disabled={selectedItems.has(`category:${category.id}`)}
                                            />
                                            <Label htmlFor={`service-assign-${service.id}`} className="font-normal">{service.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2"/>Save Assignments</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
