
"use client";

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Mail, MessageSquare, Clock, CheckCircle, AlertCircle, Info, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AiLog {
  id: string;
  timestamp: string;
  channel: 'email' | 'whatsapp';
  action: string;
  details: string;
  status: 'success' | 'failure' | 'info';
  messageLink?: string; // Link to the original message if applicable
}

// Mock AI Logs
const mockAiLogs: AiLog[] = [
  { id: 'log1', timestamp: '2024-07-22 10:35 AM', channel: 'email', action: 'Summarized Email', details: 'Subject: Project Alpha Update', status: 'success', messageLink: '/inbox/email1' },
  { id: 'log2', timestamp: '2024-07-22 11:20 AM', channel: 'whatsapp', action: 'Suggested Appointment', details: 'For "Quick Question" thread, suggested 3 slots.', status: 'success', messageLink: '/inbox/wa1' },
  { id: 'log3', timestamp: '2024-07-21 09:00 AM', channel: 'email', action: 'Auto-Replied', details: 'To "Invoice #12345", standard acknowledgement.', status: 'info', messageLink: '/inbox/email2' },
  { id: 'log4', timestamp: '2024-07-21 02:15 PM', channel: 'email', action: 'Classification Failed', details: 'Could not determine intent for email from "Unknown Sender".', status: 'failure' },
  { id: 'log5', timestamp: '2024-07-20 05:00 PM', channel: 'whatsapp', action: 'Marked as Human Attention Needed', details: 'Complex query in "File Received" thread.', status: 'info', messageLink: '/inbox/wa2'},
  { id: 'log6', timestamp: '2024-07-23 09:15 AM', channel: 'email', action: 'Suggested Reply', details: 'Drafted reply for "Meeting Reminder".', status: 'success', messageLink: '/inbox/email3' },
  { id: 'log7', timestamp: '2024-07-23 10:00 AM', channel: 'whatsapp', action: 'Auto-Replied', details: 'Acknowledged "Lunch tomorrow?" message.', status: 'info', messageLink: '/inbox/wa3' },
];

const LogStatusIcon = ({ status }: { status: AiLog['status'] }) => {
  if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'failure') return <AlertCircle className="h-5 w-5 text-red-500" />;
  return <Info className="h-5 w-5 text-blue-500" />;
};

export default function AiLogsPage() {
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<AiLog['status'] | 'all'>('all');

  const uniqueActions = useMemo(() => {
    const actions = new Set(mockAiLogs.map(log => log.action));
    return ['all', ...Array.from(actions)];
  }, []);

  const uniqueStatuses: (AiLog['status'] | 'all')[] = ['all', 'success', 'failure', 'info'];

  const filteredLogs = useMemo(() => {
    return mockAiLogs.filter(log => {
      const actionMatch = selectedActionFilter === 'all' || log.action === selectedActionFilter;
      const statusMatch = selectedStatusFilter === 'all' || log.status === selectedStatusFilter;
      return actionMatch && statusMatch;
    });
  }, [selectedActionFilter, selectedStatusFilter]);

  const emailLogs = filteredLogs.filter(log => log.channel === 'email');
  const whatsappLogs = filteredLogs.filter(log => log.channel === 'whatsapp');

  const renderLogTable = (logs: AiLog[], channelName: string) => (
    <CardContent>
      {logs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              {/* <TableHead>Message</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell><LogStatusIcon status={log.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3 inline mr-1" />{log.timestamp}
                </TableCell>
                <TableCell>
                  <Badge variant={log.status === 'failure' ? 'destructive' : log.status === 'info' ? 'outline' : 'secondary'}>{log.action}</Badge>
                </TableCell>
                <TableCell className="text-sm">{log.details}</TableCell>
                {/* <TableCell>
                  {log.messageLink ? (
                    <a href={log.messageLink} className="text-primary hover:underline text-xs">View Message</a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-2" />
          <p>No AI activity logs found for {channelName} matching the current filters.</p>
        </div>
      )}
    </CardContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Activity Logs</h1>
      </div>
      <CardDescription>
        Review all actions taken by the AI assistant across your communication channels.
      </CardDescription>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="actionFilter" className="text-sm font-medium">AI Action</label>
            <Select value={selectedActionFilter} onValueChange={setSelectedActionFilter}>
              <SelectTrigger id="actionFilter" className="w-full">
                <SelectValue placeholder="Filter by AI Action" />
              </SelectTrigger>
              <SelectContent>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label htmlFor="statusFilter" className="text-sm font-medium">Log Status</label>
            <Select value={selectedStatusFilter} onValueChange={(value) => setSelectedStatusFilter(value as AiLog['status'] | 'all')}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Filter by Log Status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" />Email Logs ({emailLogs.length})</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2"><MessageSquare className="h-4 w-4" />WhatsApp Logs ({whatsappLogs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Email AI Logs</CardTitle>
              <CardDescription>Actions performed by AI on your email communications.</CardDescription>
            </CardHeader>
            {renderLogTable(emailLogs, 'Email')}
          </Card>
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>WhatsApp AI Logs</CardTitle>
              <CardDescription>Actions performed by AI on your WhatsApp messages.</CardDescription>
            </CardHeader>
            {renderLogTable(whatsappLogs, 'WhatsApp')}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
