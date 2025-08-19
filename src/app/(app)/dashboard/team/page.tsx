
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Users, Edit, Trash2, ShieldCheck, ShieldAlert, Save, Mail, Smartphone, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { getMockRoles } from '../roles/page'; // Import roles

interface TeamMemberConnection {
  gmail?: { connected: boolean; account?: string };
  outlook?: { connected: boolean; account?: string };
  whatsapp?: { connected: boolean; number?: string; active: boolean };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleIds: string[]; // Changed from role to roleIds
  status: 'Active' | 'Pending' | 'Inactive';
  avatarUrl?: string;
  lastLogin: string;
  phone?: string;
  connections?: TeamMemberConnection;
}

const MAIN_ADMIN_EMAIL = 'elena.rodriguez@example.com';
const SUPER_ADMIN_ROLE_ID = 'super_admin';

// Mock roles data - in a real app, this would come from a service or context
const availableRoles = getMockRoles();

export const initialTeamMembers: TeamMember[] = [
  { id: 'user0', name: 'Elena Rodriguez', email: MAIN_ADMIN_EMAIL, roleIds: [SUPER_ADMIN_ROLE_ID], status: 'Active', avatarUrl: 'https://placehold.co/40x40.png', lastLogin: 'Just now', phone: '+1 555-0100', connections: { gmail: { connected: true, account: 'elena.r@gmail.com' }, whatsapp: { connected: true, number: '+15550100', active: true } } },
  { id: 'user2', name: 'Bob Smith', email: 'bob@example.com', roleIds: ['member'], status: 'Active', avatarUrl: 'https://placehold.co/40x40.png', lastLogin: '1 day ago', phone: '+1 555-0102', connections: { outlook: { connected: true, account: 'bob.smith@outlook.com' }, whatsapp: { connected: true, number: '+15550102', active: false } } },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', roleIds: ['member'], status: 'Pending', avatarUrl: 'https://placehold.co/40x40.png', lastLogin: 'N/A', phone: '+1 555-0103', connections: { whatsapp: { connected: false, number: '+15550103', active: false } } },
  { id: 'user4', name: 'Diana Prince', email: 'diana@example.com', roleIds: ['admin'], status: 'Inactive', avatarUrl: 'https://placehold.co/40x40.png', lastLogin: '1 week ago', phone: '+1 555-0104', connections: { gmail: { connected: false } } },
];

const emptyMemberForm: Omit<TeamMember, 'id' | 'lastLogin' | 'avatarUrl' | 'connections' | 'phone'> & {roleId?: string} = {
  name: '',
  email: '',
  roleIds: ['member'], // Default to 'member' role ID
  roleId: 'member', // For single select UI
  status: 'Active',
};


export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'invite' | 'edit'>('invite');
  const [currentMember, setCurrentMember] = useState<Omit<TeamMember, 'id' | 'lastLogin' | 'avatarUrl' | 'connections' | 'roleIds'> & { id?: string, roleId?: string }>(emptyMemberForm);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const getRoleNameById = (roleId: string): string => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };
  
  const getRoleIcon = (roleId: string) => {
    if (roleId === SUPER_ADMIN_ROLE_ID || roleId === 'admin') {
      return <ShieldCheck className="h-3.5 w-3.5 mr-1" />;
    }
    return <ShieldAlert className="h-3.5 w-3.5 mr-1" />;
  };

  const handleOpenInviteDialog = () => {
    setDialogMode('invite');
    setCurrentMember({...emptyMemberForm, roleId: 'member'}); // Ensure roleId is set
    setIsMemberDialogOpen(true);
  };

  const handleOpenEditDialog = (member: TeamMember) => {
    setDialogMode('edit');
    setCurrentMember({ ...member, roleId: member.roleIds[0] || 'member' }); // Use first role for single select UI
    setIsMemberDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsMemberDialogOpen(false);
    setCurrentMember({...emptyMemberForm, roleId: 'member'}); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'roleId' | 'status', value: string) => {
     if (name === 'roleId') {
      setCurrentMember(prev => ({ ...prev, roleId: value }));
    } else {
      setCurrentMember(prev => ({ ...prev, [name]: value as TeamMember['status'] }));
    }
  };
  
  const handleSaveMember = () => {
    if (!currentMember.name || !currentMember.email || !currentMember.roleId) {
      toast.error("Error", {
        description: "Name, email, and role are required."
      });
      return;
    }
  
    if (dialogMode === 'invite') {
      const newMember: TeamMember = {
        name: currentMember.name,
        email: currentMember.email,
        roleIds: [currentMember.roleId!],
        status: currentMember.status,
        id: `user${Date.now()}`,
        avatarUrl: 'https://placehold.co/40x40.png', 
        lastLogin: 'Never',
        phone: currentMember.phone || '', // Add phone from form if exists
        connections: {}, // Default empty connections
      };
      setTeamMembers(prev => [newMember, ...prev]);
      toast.success("Member Invited", {
        description: `${newMember.name} has been added to the team.`
      });
    } else if (dialogMode === 'edit' && currentMember.id) {
      setTeamMembers(prev => prev.map(m => m.id === currentMember.id ? { ...m, name: currentMember.name, email: currentMember.email, roleIds: [currentMember.roleId!], status: currentMember.status, phone: currentMember.phone } : m));
      toast.success("Member Updated", {
        description: `${currentMember.name}'s information has been updated.`
      });
    }
    handleCloseDialog();
  };

  const handleRemoveMember = () => {
    if (memberToRemove) {
      if (memberToRemove.email === MAIN_ADMIN_EMAIL) {
        toast.error("Action Not Allowed", {
          description: "You cannot remove the main administrator."
        });
        setMemberToRemove(null);
        return;
      }
      setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      toast.success("Member Removed", {
        description: `${memberToRemove.name} has been removed from the team.`
      });
      setMemberToRemove(null);
    }
  };

  const renderConnections = (connections?: TeamMemberConnection) => {
    if (!connections) return <span className="text-xs text-muted-foreground">-</span>;
    const parts: React.ReactNode[] = [];
    if (connections.gmail) {
      parts.push(<Badge key="gmail" variant={connections.gmail.connected ? "default" : "outline"} className={`text-xs ${connections.gmail.connected ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-red-100 text-red-700'}`}><Mail className="h-3 w-3 mr-1"/>Gmail{connections.gmail.connected ? "" : ": Off"}</Badge>);
    }
    if (connections.outlook) {
      parts.push(<Badge key="outlook" variant={connections.outlook.connected ? "default" : "outline"} className={`text-xs ${connections.outlook.connected ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-red-100 text-red-700'}`}><Mail className="h-3 w-3 mr-1"/>Outlook{connections.outlook.connected ? "" : ": Off"}</Badge>);
    }
    if (connections.whatsapp) {
      parts.push(<Badge key="whatsapp" variant={connections.whatsapp.active ? "default" : "outline"} className={`text-xs ${connections.whatsapp.active ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-red-100 text-red-700'}`}><Smartphone className="h-3 w-3 mr-1"/>WhatsApp{connections.whatsapp.active ? ": On" : ": Off"}</Badge>);
    }
    return parts.length > 0 ? <div className="flex flex-wrap gap-1">{parts}</div> : <span className="text-xs text-muted-foreground">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <CardDescription className="mt-1">Manage your company's users, roles, and access.</CardDescription>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenInviteDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Invite New Member
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Team Members ({teamMembers.length})</CardTitle>
          <CardDescription>Overview of all users in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email & Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connections</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person avatar"/>
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="text-xs text-muted-foreground">{member.phone || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.roleIds.includes(SUPER_ADMIN_ROLE_ID) || member.roleIds.includes('admin') ? 'default' : 'secondary'} className="capitalize">
                        {getRoleIcon(member.roleIds[0])}
                        {getRoleNameById(member.roleIds[0])} {/* Display first role name */}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'Active' ? 'default' :
                          member.status === 'Pending' ? 'outline' : 'destructive'
                        }
                        className={`capitalize ${member.status === 'Active' && 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'} ${member.status === 'Pending' && 'border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'} ${member.status === 'Inactive' && 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'}`}
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderConnections(member.connections)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{member.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => handleOpenEditDialog(member)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit user</span>
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => setMemberToRemove(member)}
                            disabled={member.email === MAIN_ADMIN_EMAIL} 
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove user</span>
                          </Button>
                        </AlertDialogTrigger>
                        {memberToRemove && memberToRemove.id === member.id && ( 
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to remove {memberToRemove.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the user from your team.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>No team members yet. Invite your first team member to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isMemberDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'invite' ? 'Invite New Member' : 'Edit Team Member'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'invite' ? 'Enter the details of the new team member.' : `Update information for ${currentMember.name || 'member'}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" value={currentMember.name || ''} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={currentMember.email || ''} onChange={handleInputChange} className="col-span-3" disabled={dialogMode === 'edit'}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" name="phone" value={(currentMember as any).phone || ''} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select 
                name="roleId" 
                value={currentMember.roleId} 
                onValueChange={(value) => handleSelectChange('roleId', value)} 
                disabled={dialogMode === 'edit' && currentMember.email === MAIN_ADMIN_EMAIL}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.filter(r => r.id !== SUPER_ADMIN_ROLE_ID || (dialogMode === 'edit' && currentMember.email === MAIN_ADMIN_EMAIL)).map(role => ( // Filter out Super Admin for general selection unless it's the super admin themselves
                    <SelectItem key={role.id} value={role.id} disabled={role.id === SUPER_ADMIN_ROLE_ID && currentMember.email !== MAIN_ADMIN_EMAIL}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(dialogMode === 'edit' && currentMember.email === MAIN_ADMIN_EMAIL) && (
                 <p className="col-span-4 text-xs text-muted-foreground text-center">The main administrator's role cannot be changed from Super Admin.</p>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select name="status" value={currentMember.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveMember} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" /> {dialogMode === 'invite' ? 'Invite Member' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
