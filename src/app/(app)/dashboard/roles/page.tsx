
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, UserCog, ShieldCheck, Save, ListChecks } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { ScrollArea } from '@/components/ui/scroll-area';

type PermissionKey = 
  | 'view_billing' | 'manage_billing' | 'view_team' | 'manage_team' 
  | 'view_roles' | 'manage_roles' | 'view_inbox' | 'manage_inbox_settings' 
  | 'view_calendar' | 'manage_calendar_events' | 'view_ai_logs' 
  | 'configure_ai_settings' | 'access_profile' | 'edit_own_profile' | 'all';

interface Role {
  id: string;
  name: string;
  permissions: PermissionKey[];
  isSystemRole?: boolean; // To prevent deletion/major edits of essential roles
}

const allAvailablePermissions: Record<PermissionKey, string> = {
  view_billing: "View Billing Page",
  manage_billing: "Manage Billing & Subscription",
  view_team: "View Team Members Page",
  manage_team: "Manage Team Members (Invite, Edit, Remove)",
  view_roles: "View Role Management Page",
  manage_roles: "Manage Roles & Permissions",
  view_inbox: "Access Unified Inbox",
  manage_inbox_settings: "Manage Inbox Connection Settings",
  view_calendar: "Access Calendar",
  manage_calendar_events: "Create/Edit Calendar Events",
  view_ai_logs: "View AI Activity Logs",
  configure_ai_settings: "Configure AI Assistant Settings",
  access_profile: "Access Own Profile",
  edit_own_profile: "Edit Own Profile",
  all: "All Permissions (Super Admin)",
};
const assignablePermissions = Object.entries(allAvailablePermissions).filter(([key]) => key !== 'all');


const initialRolesData: Role[] = [
  { id: 'super_admin', name: 'Super Admin', permissions: ['all'], isSystemRole: true },
  { id: 'admin', name: 'Admin', permissions: ['view_team', 'manage_team', 'view_inbox', 'view_calendar', 'view_ai_logs', 'access_profile', 'edit_own_profile', 'view_billing'], isSystemRole: true },
  { id: 'member', name: 'Member', permissions: ['view_inbox', 'view_calendar', 'access_profile', 'edit_own_profile'], isSystemRole: false },
  { id: 'billing_manager', name: 'Billing Manager', permissions: ['view_billing', 'manage_billing', 'access_profile'], isSystemRole: false },
];

const emptyRoleForm: Omit<Role, 'id' | 'isSystemRole'> = {
  name: '',
  permissions: [],
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>(initialRolesData);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentRole, setCurrentRole] = useState<Omit<Role, 'id' | 'isSystemRole'> & { id?: string; isSystemRole?: boolean }>(emptyRoleForm);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setCurrentRole(emptyRoleForm);
    setIsRoleDialogOpen(true);
  };

  const handleOpenEditDialog = (role: Role) => {
    setDialogMode('edit');
    setCurrentRole({ ...role });
    setIsRoleDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsRoleDialogOpen(false);
    setCurrentRole(emptyRoleForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentRole(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permissionKey: PermissionKey, checked: boolean) => {
    setCurrentRole(prev => {
      const newPermissions = checked
        ? [...(prev.permissions || []), permissionKey]
        : (prev.permissions || []).filter(p => p !== permissionKey);
      return { ...prev, permissions: newPermissions };
    });
  };
  
  const handleSaveRole = () => {
    if (!currentRole.name) {
      toast.error("Error", {
        description: "Role name is required."
      });
      return;
    }

    if (dialogMode === 'create') {
      const newRole: Role = {
        ...currentRole,
        id: `role_${Date.now()}_${currentRole.name.toLowerCase().replace(/\s+/g, '_')}`,
        permissions: currentRole.permissions || [],
      };
      setRoles(prev => [newRole, ...prev]);
      toast.success("Role Created", {
        description: `Role "${newRole.name}" has been created.`
      });
    } else if (dialogMode === 'edit' && currentRole.id) {
      setRoles(prev => prev.map(r => r.id === currentRole.id ? { ...r, name: currentRole.name, permissions: currentRole.permissions || [] } : r));
      toast.success("Role Updated", {
        description: `Role "${currentRole.name}" has been updated.`
      });
    }
    handleCloseDialog();
  };

  const handleDeleteRole = () => {
    if (roleToDelete) {
      if (roleToDelete.isSystemRole) {
        toast.error("Action Not Allowed", {
          description: "System roles cannot be deleted."
        });
        setRoleToDelete(null);
        return;
      }
      // TODO: Check if role is in use by any team member before deleting
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      toast.error("Action Not Allowed", {
        description: "System roles cannot be deleted."
      });
      setRoleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <CardDescription className="mt-1">Define roles and manage their permissions within the application.</CardDescription>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Role
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary" /> Application Roles ({roles.length})</CardTitle> 
          <CardDescription>Overview of all defined roles and their permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md">
                      {role.permissions.includes('all') 
                        ? <Badge variant="secondary">All Permissions</Badge> 
                        : role.permissions.length > 0 
                          ? role.permissions.map(pKey => allAvailablePermissions[pKey] || pKey).join(', ')
                          : 'No permissions assigned'}
                    </TableCell>
                    <TableCell>
                      {role.isSystemRole ? (
                        <Badge variant="outline">System</Badge>
                      ) : (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:text-primary" 
                        onClick={() => handleOpenEditDialog(role)}
                        disabled={role.id === 'super_admin'} // Super Admin details not editable through this UI
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit role</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:text-destructive" 
                            onClick={() => setRoleToDelete(role)}
                            disabled={role.isSystemRole}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete role</span>
                          </Button>
                        </AlertDialogTrigger>
                        {roleToDelete && roleToDelete.id === role.id && ( 
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role: {roleToDelete.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the role.
                                Make sure no users are currently assigned to this role.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
              <ListChecks className="h-12 w-12 mx-auto mb-2" />
              <p>No custom roles defined. Create your first role to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Create New Role' : 'Edit Role'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' ? 'Define the name and permissions for the new role.' : `Update details for the "${currentRole.name || 'role'}".`}
              {currentRole.isSystemRole && dialogMode === 'edit' && <span className="block text-sm text-yellow-600 mt-1">System roles have restricted editing capabilities.</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">Name</Label>
              <Input 
                id="roleName" 
                name="name" 
                value={currentRole.name} 
                onChange={handleInputChange} 
                className="col-span-3" 
                disabled={currentRole.isSystemRole && dialogMode === 'edit'}
              />
            </div>
            
            <div>
              <Label className="font-semibold">Permissions</Label>
              {currentRole.isSystemRole && (currentRole.permissions || []).includes('all') && dialogMode === 'edit' ? (
                <p className="text-sm text-muted-foreground p-2">Super Admins have all permissions by default. This cannot be changed.</p>
              ) : (
                <ScrollArea className="h-60 mt-2 rounded-md border p-4 col-span-4">
                  <div className="space-y-3">
                  {assignablePermissions.map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${key}`}
                        checked={(currentRole.permissions || []).includes(key as PermissionKey)}
                        onCheckedChange={(checked) => handlePermissionChange(key as PermissionKey, !!checked)}
                        disabled={currentRole.isSystemRole && dialogMode === 'edit' && currentRole.id === 'admin'} // Example: 'Admin' role permissions not directly editable here
                      />
                      <Label htmlFor={`perm-${key}`} className="font-normal text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveRole} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={currentRole.isSystemRole && dialogMode === 'edit' && currentRole.id === 'admin'}>
              <Save className="mr-2 h-4 w-4" /> {dialogMode === 'create' ? 'Create Role' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export roles to be used by Team Management page (mocking shared state)
export const getMockRoles = () => initialRolesData;

