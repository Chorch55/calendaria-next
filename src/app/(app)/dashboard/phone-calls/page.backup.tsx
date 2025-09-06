"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  User, 
  Clock, 
  Sparkles, 
  Star, 
  MessageCircleQuestion, 
  Download,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Play,
  Pause,
  Volume2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';

interface CallLog {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  duration: string;
  type: 'incoming' | 'outgoing' | 'missed';
  status: 'answered' | 'missed' | 'voicemail' | 'busy';
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentimentScore: number;
  reasonForSentiment: string;
  appointmentScheduled: boolean;
  appointmentDetails?: string;
  keyQueries: string[];
  recordingUrl: string;
  transcript?: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  followUpRequired: boolean;
  clientId?: string;
  outcome: 'appointment' | 'information' | 'complaint' | 'followup' | 'other';
  cost: number;
  revenue?: number;
}

interface CallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: string;
  totalDuration: string;
  positiveSentiment: number;
  appointmentsBooked: number;
  conversionRate: number;
  totalRevenue: number;
  avgCallCost: number;
}

const mockCallLogs: CallLog[] = [
  {
    id: 'call1',
    callerName: 'John Smith',
    callerNumber: '+1-202-555-0182',
    timestamp: '2024-09-06T11:45:00',
    duration: '8:32',
    type: 'incoming',
    status: 'answered',
    summary: 'John Smith called to schedule a follow-up consultation. An appointment was successfully booked for next Tuesday.',
    sentiment: 'Positive',
    sentimentScore: 85,
    reasonForSentiment: 'The caller was polite and expressed satisfaction with the ease of booking.',
    appointmentScheduled: true,
    appointmentDetails: 'Tuesday, June 11th at 2:00 PM',
    keyQueries: ['Can I book a follow-up?', 'Is next Tuesday available?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello, I would like to schedule a follow-up appointment...',
    tags: ['appointment', 'follow-up', 'returning-client'],
    priority: 'medium',
    followUpRequired: false,
    clientId: 'client_001',
    outcome: 'appointment',
    cost: 2.50,
    revenue: 150
  },
  {
    id: 'call2',
    callerName: 'Jane Doe',
    callerNumber: '+1-310-555-0145',
    timestamp: '2024-09-06T09:20:00',
    duration: '12:15',
    type: 'incoming',
    status: 'answered',
    summary: 'Jane Doe called with a question about her recent invoice. The query was resolved by clarifying the charges.',
    sentiment: 'Neutral',
    sentimentScore: 65,
    reasonForSentiment: 'The caller started with a concern but was satisfied with the explanation.',
    appointmentScheduled: false,
    keyQueries: ['Why is there an extra charge on my invoice?', 'Can you explain the "Service Fee"?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hi, I have a question about my invoice...',
    tags: ['billing', 'question', 'resolved'],
    priority: 'low',
    followUpRequired: false,
    clientId: 'client_002',
    outcome: 'information',
    cost: 3.25
  },
  {
    id: 'call3',
    callerName: 'Mike Johnson',
    callerNumber: '+1-555-0123',
    timestamp: '2024-09-05T16:10:00',
    duration: '0:00',
    type: 'incoming',
    status: 'missed',
    summary: 'Missed call - caller did not leave voicemail.',
    sentiment: 'Neutral',
    sentimentScore: 50,
    reasonForSentiment: 'No interaction occurred.',
    appointmentScheduled: false,
    keyQueries: [],
    recordingUrl: '',
    tags: ['missed', 'no-voicemail'],
    priority: 'low',
    followUpRequired: true,
    outcome: 'other',
    cost: 0
  },
  {
    id: 'call4',
    callerName: 'Sarah Wilson',
    callerNumber: '+1-415-555-0199',
    timestamp: '2024-09-05T14:30:00',
    duration: '15:45',
    type: 'incoming',
    status: 'answered',
    summary: 'New client inquiry about services. Very interested in premium package. Appointment scheduled for consultation.',
    sentiment: 'Positive',
    sentimentScore: 92,
    reasonForSentiment: 'Caller was enthusiastic and expressed strong interest in our services.',
    appointmentScheduled: true,
    appointmentDetails: 'Friday, September 8th at 10:00 AM',
    keyQueries: ['What packages do you offer?', 'Can I schedule a consultation?', 'What are your rates?'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello, I heard about your services and I\'m very interested...',
    tags: ['new-client', 'consultation', 'premium-package'],
    priority: 'high',
    followUpRequired: false,
    clientId: 'client_003',
    outcome: 'appointment',
    cost: 4.10,
    revenue: 500
  },
  {
    id: 'call5',
    callerName: 'Robert Brown',
    callerNumber: '+1-617-555-0177',
    timestamp: '2024-09-05T10:15:00',
    duration: '6:22',
    type: 'outgoing',
    status: 'answered',
    summary: 'Follow-up call to confirm appointment and provide additional information requested by client.',
    sentiment: 'Positive',
    sentimentScore: 78,
    reasonForSentiment: 'Client was appreciative of the follow-up and confirmed attendance.',
    appointmentScheduled: false,
    keyQueries: ['Confirmation needed', 'Additional documents'],
    recordingUrl: '/placeholder-audio.mp3',
    transcript: 'Hello Mr. Brown, this is a follow-up call regarding your appointment...',
    tags: ['follow-up', 'confirmation', 'outgoing'],
    priority: 'medium',
    followUpRequired: false,
    clientId: 'client_004',
    outcome: 'followup',
    cost: 1.75
  }
];

const calculateMetrics = (calls: CallLog[]): CallMetrics => {
  const totalCalls = calls.length;
  const answeredCalls = calls.filter(call => call.status === 'answered').length;
  const missedCalls = calls.filter(call => call.status === 'missed').length;
  
  const totalDurationMinutes = calls
    .filter(call => call.duration !== '0:00')
    .reduce((total, call) => {
      const [minutes, seconds] = call.duration.split(':').map(Number);
      return total + minutes + (seconds / 60);
    }, 0);
  
  const averageDuration = answeredCalls > 0 ? Math.round(totalDurationMinutes / answeredCalls) : 0;
  const positiveCalls = calls.filter(call => call.sentiment === 'Positive').length;
  const appointmentsBooked = calls.filter(call => call.appointmentScheduled).length;
  const totalRevenue = calls.reduce((sum, call) => sum + (call.revenue || 0), 0);
  const totalCost = calls.reduce((sum, call) => sum + call.cost, 0);
  
  return {
    totalCalls,
    answeredCalls,
    missedCalls,
    averageDuration: `${averageDuration}:${String(Math.round((totalDurationMinutes % 1) * 60)).padStart(2, '0')}`,
    totalDuration: `${Math.floor(totalDurationMinutes / 60)}h ${Math.round(totalDurationMinutes % 60)}m`,
    positiveSentiment: totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0,
    appointmentsBooked,
    conversionRate: totalCalls > 0 ? Math.round((appointmentsBooked / totalCalls) * 100) : 0,
    totalRevenue,
    avgCallCost: totalCalls > 0 ? Math.round((totalCost / totalCalls) * 100) / 100 : 0
  };
};
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
                                'bg-purple-500 text-white border-transparent hover:bg-purple-600': log.sentiment === 'Positive',
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
                    <div className="text-sm font-medium p-3 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
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
