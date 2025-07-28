
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileDigit, Users, MoreHorizontal, DollarSign, History, Save, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { getMockRoles } from '../roles/page';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SalaryHistoryEntry {
  date: string; // ISO String
  amount: number;
  reason: string;
  changedBy: string; // Name of admin
}

interface PayrollData {
  id: string; // Corresponds to TeamMember id
  name: string;
  email: string;
  avatarUrl?: string;
  roleId: string;
  currentSalary: number;
  lastUpdated: string; // ISO String
  history: SalaryHistoryEntry[];
}

const initialPayrollData: PayrollData[] = [
  { id: 'user0', name: 'Elena Rodriguez', email: 'elena.rodriguez@example.com', avatarUrl: 'https://placehold.co/40x40.png', roleId: 'super_admin', currentSalary: 95000, lastUpdated: new Date('2024-01-15').toISOString(), history: [{ date: new Date('2024-01-15').toISOString(), amount: 95000, reason: 'Annual Review', changedBy: 'System' }] },
  { id: 'user2', name: 'Bob Smith', email: 'bob@example.com', avatarUrl: 'https://placehold.co/40x40.png', roleId: 'member', currentSalary: 62000, lastUpdated: new Date('2024-03-01').toISOString(), history: [{ date: new Date('2024-03-01').toISOString(), amount: 62000, reason: 'Performance Increase', changedBy: 'Elena R.' }, { date: new Date('2023-03-01').toISOString(), amount: 58000, reason: 'Initial Salary', changedBy: 'Elena R.' }] },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://placehold.co/40x40.png', roleId: 'member', currentSalary: 55000, lastUpdated: new Date('2023-06-01').toISOString(), history: [{ date: new Date('2023-06-01').toISOString(), amount: 55000, reason: 'Hired', changedBy: 'Elena R.' }] },
  { id: 'user4', name: 'Diana Prince', email: 'diana@example.com', avatarUrl: 'https://placehold.co/40x40.png', roleId: 'admin', currentSalary: 80000, lastUpdated: new Date('2024-01-15').toISOString(), history: [{ date: new Date('2024-01-15').toISOString(), amount: 80000, reason: 'Promotion to Admin', changedBy: 'Elena R.' }, { date: new Date('2023-01-15').toISOString(), amount: 82000, reason: 'Initial Salary', changedBy: 'Elena R.' }] },
];

const availableRoles = getMockRoles();

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollData[]>(initialPayrollData);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<PayrollData | null>(null);
  const [newSalary, setNewSalary] = useState<number | string>('');
  const [changeReason, setChangeReason] = useState('');

  const getRoleNameById = (roleId: string): string => {
    return availableRoles.find(r => r.id === roleId)?.name || 'Unknown Role';
  };

  const handleOpenEditDialog = (member: PayrollData) => {
    setSelectedMember(member);
    setNewSalary(member.currentSalary);
    setChangeReason('');
    setIsEditDialogOpen(true);
  };
  
  const handleOpenHistoryDialog = (member: PayrollData) => {
    setSelectedMember(member);
    setIsHistoryDialogOpen(true);
  };

  const handleSaveSalary = () => {
    if (!selectedMember || !newSalary || !changeReason.trim()) {
        toast.error("Error", {
          description: "New salary and a reason for the change are required."
        });
        return;
    }
    const salaryAmount = typeof newSalary === 'string' ? parseFloat(newSalary) : newSalary;
    if (isNaN(salaryAmount) || salaryAmount <= 0) {
      toast.error("Error", {
        description: "Please enter a valid salary amount."
      });
      return;
    }
    
    setPayroll(prev => prev.map(member => {
        if (member.id === selectedMember.id) {
            const newHistoryEntry: SalaryHistoryEntry = {
                date: new Date().toISOString(),
                amount: salaryAmount,
                reason: changeReason,
                changedBy: 'Elena Rodriguez', // Assume current admin
            };
            return {
                ...member,
                currentSalary: salaryAmount,
                lastUpdated: newHistoryEntry.date,
                history: [newHistoryEntry, ...member.history],
            };
        }
        return member;
    }));
    
    toast.success("Salary Updated", {
      description: `Salary for ${selectedMember.name} has been updated.`
    });
    setIsEditDialogOpen(false);
  };
  
  const calculateChange = (history: SalaryHistoryEntry[]) => {
    if (history.length < 2) {
      return null;
    }
    const current = history[0].amount;
    const previous = history[1].amount;
    
    if(previous === 0) return null; // Avoid division by zero

    const change = ((current - previous) / previous) * 100;
    
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down' as 'up' | 'down',
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <CardDescription className="mt-1">View and manage employee salaries and their history.</CardDescription>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Employee Salaries</CardTitle>
          <CardDescription>Overview of current salaries for all team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Current Salary (EUR)</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.map((member) => {
                const changeInfo = calculateChange(member.history);
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person avatar"/><AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{getRoleNameById(member.roleId)}</Badge></TableCell>
                    <TableCell className="font-semibold text-primary">€{member.currentSalary.toLocaleString('de-DE')}</TableCell>
                    <TableCell>
                      {changeInfo ? (
                        <div className={cn("flex items-center gap-1 font-medium", {
                          "text-green-600": changeInfo.direction === 'up',
                          "text-red-600": changeInfo.direction === 'down',
                        })}>
                          {changeInfo.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{changeInfo.percentage}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(member.lastUpdated), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenEditDialog(member)}><DollarSign className="mr-2 h-4 w-4"/>Edit Salary</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenHistoryDialog(member)}><History className="mr-2 h-4 w-4"/>View History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Salary Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Salary for {selectedMember?.name}</DialogTitle>
            <DialogDescription>Set a new salary and provide a reason for the change.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="newSalary">New Annual Salary (EUR)</Label>
                <Input id="newSalary" type="number" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder="e.g., 65000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="changeReason">Reason for Change</Label>
                <Input id="changeReason" value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="e.g., Annual performance review" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveSalary} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-2 h-4 w-4" /> Save Salary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Salary History Dialog */}
       <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Salary History for {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount (EUR)</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selectedMember?.history.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>€{entry.amount.toLocaleString('de-DE')}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
