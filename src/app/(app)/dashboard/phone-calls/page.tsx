"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, User, Clock, Sparkles, Star, MessageCircleQuestion, Download } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';

interface CallLog {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  reasonForSentiment: string;
  appointmentScheduled: boolean;
  appointmentDetails?: string;
  keyQueries: string[];
  recordingUrl: string;
}

const mockCallLogs: CallLog[] = [
  {
    id: 'call1',
    callerName: 'John Smith',
    callerNumber: '+1-202-555-0182',
    timestamp: 'Today, 11:45 AM',
    summary: 'John Smith called to schedule a follow-up consultation. An appointment was successfully booked for next Tuesday.',
    sentiment: 'Positive',
    reasonForSentiment: 'The caller was polite and expressed satisfaction with the ease of booking.',
    appointmentScheduled: true,
    appointmentDetails: 'Tuesday, June 11th at 2:00 PM',
    keyQueries: ['Can I book a follow-up?', 'Is next Tuesday available?'],
    recordingUrl: '/placeholder-audio.mp3',
  },
  {
    id: 'call2',
    callerName: 'Jane Doe',
    callerNumber: '+1-310-555-0145',
    timestamp: 'Today, 9:20 AM',
    summary: 'Jane Doe called with a question about her recent invoice. The query was resolved by clarifying the charges.',
    sentiment: 'Neutral',
    reasonForSentiment: 'The caller started with a concern but was satisfied with the explanation. The overall tone was neutral-to-positive.',
    appointmentScheduled: false,
    keyQueries: ['Why is there an extra charge on my invoice?', 'Can you explain the "Service Fee"?'],
    recordingUrl: '/placeholder-audio.mp3',
  },
  {
    id: 'call3',
    callerName: 'Unknown Caller',
    callerNumber: 'Unavailable',
    timestamp: 'Yesterday, 4:10 PM',
    summary: 'The caller inquired about opening hours on public holidays but disconnected before the AI could fully answer.',
    sentiment: 'Negative',
    reasonForSentiment: 'The caller sounded impatient and hung up abruptly, indicating frustration.',
    appointmentScheduled: false,
    keyQueries: ['Are you open on the 4th of July?'],
    recordingUrl: '/placeholder-audio.mp3',
  },
];

export default function PhoneCallsPage() {
  const { connections, appSettings, isSettingsLoaded } = useSettings();

  if (!isSettingsLoaded) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Phone Call Logs</h1>
        <p className="text-muted-foreground mt-1">Loading settings...</p>
      </div>
    );
  }

  if (!connections.phone.connected) {
    return (
       <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Phone Call Logs</h1>
          <Card className="text-center py-12">
          <CardHeader>
            <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Phone Service Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please connect your phone number in settings to view call logs.
            </p>
             <Button asChild variant="default" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard/settings#connections">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phone Call Logs</h1>
        <p className="text-muted-foreground mt-1">
          Review AI-analyzed summaries and recordings of your inbound calls.
        </p>
      </div>

      {mockCallLogs.length > 0 ? (
        <div className="space-y-4">
          {mockCallLogs.map((log) => (
            <Card key={log.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center text-xl">
                            <User className="mr-2 h-5 w-5 text-primary" /> {log.callerName}
                            {log.appointmentScheduled && (
                                <Badge variant="secondary" className="ml-2 font-normal">
                                    {appSettings.phoneCallAppointmentLabel}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm mt-1">
                            <Phone className="mr-2 h-4 w-4" /> {log.callerNumber}
                             <span className="mx-2">|</span>
                            <Clock className="mr-2 h-4 w-4" /> {log.timestamp}
                        </CardDescription>
                    </div>
                     <Badge
                        className={cn(
                            "capitalize whitespace-nowrap",
                            {
                                'bg-green-500 text-white border-transparent hover:bg-green-600': log.sentiment === 'Positive',
                                'bg-white text-black border border-gray-300': log.sentiment === 'Neutral',
                                'bg-red-500 text-white border-transparent hover:bg-red-600': log.sentiment === 'Negative',
                            }
                        )}
                    >
                        {log.sentiment}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div>
                        <h4 className="font-semibold text-sm flex items-center mb-1"><Sparkles className="h-4 w-4 mr-2 text-primary/80"/>AI Summary</h4>
                        <p className="text-sm text-muted-foreground">{log.summary}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm flex items-center mb-1"><Star className="h-4 w-4 mr-2 text-primary/80"/>Sentiment Analysis</h4>
                        <p className="text-sm text-muted-foreground">{log.reasonForSentiment}</p>
                    </div>
                </div>

                {log.appointmentScheduled && log.appointmentDetails && (
                    <div className="text-sm font-medium p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        Appointment Scheduled: {log.appointmentDetails}
                    </div>
                )}
                
                {log.keyQueries.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center"><MessageCircleQuestion className="h-4 w-4 mr-2 text-primary/80"/>Key Queries</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                            {log.keyQueries.map((query, index) => <li key={index}>{query}</li>)}
                        </ul>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold text-sm mb-2">Call Recording</h4>
                    <div className="flex items-center gap-2">
                        <audio controls className="w-full max-w-sm" src={log.recordingUrl}>
                            Your browser does not support the audio element.
                        </audio>
                         <Button variant="outline" size="sm" onClick={() => alert('Download functionality to be implemented.')}><Download className="h-4 w-4 mr-2"/>Download</Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">Note: This is a placeholder audio file.</p>
                </div>
                
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Call Logs Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your connected phone number has not received any calls yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
