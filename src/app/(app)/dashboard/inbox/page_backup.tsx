'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Phone, 
  Star, 
  Archive, 
  MoreVertical, 
  Reply, 
  Forward, 
  Trash,
  Bot,
  Lightbulb,
  Sparkles,
  Send,
  AlertCircle,
  X,
  Clock,
  Tag,
  Paperclip,
  Download,
  Mic,
  Users,
  CalendarPlus,
  FileText,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  CheckCircle,
  Volume2,
  UserCheck,
  ArrowUpDown,
  Globe,
  Settings,
  Plus
} from 'lucide-react';

// Enhanced Type Definitions
interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar: string;
  tags: string[];
  status: 'online' | 'offline' | 'busy' | 'away';
  timezone?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp' | 'web' | 'custom';
  vipLevel: 'standard' | 'premium' | 'vip' | 'enterprise';
}

interface Attachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation';
  size: string;
  url: string;
  previewUrl?: string;
  thumbnail?: string;
}

interface ConversationMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  type?: 'text' | 'file' | 'image' | 'voice' | 'video' | 'call-summary' | 'ai-response' | 'system';
  attachments?: Attachment[];
  aiGenerated?: boolean;
  transcription?: string;
  callDuration?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface AiInsights {
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  topics: string[];
  actionItems: string[];
  suggestedResponses: string[];
  customerSatisfaction?: number; // 1-10 scale
  nextBestAction?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Message {
  id: string;
  contact: Contact;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  conversationLog: ConversationMessage[];
}

// Mock Data
const mockContacts: Contact[] = [
  {
    id: 'contact1',
    name: 'Alice Wonderland',
    email: 'alice.w@gmail.com',
    phone: '+1234567890',
    company: 'Tech Innovators Inc.',
    avatar: 'https://placehold.co/40x40.png',
    tags: ['VIP', 'Client'],
    status: 'online',
    timezone: 'UTC-5',
    preferredContact: 'email',
    vipLevel: 'vip'
  },
  {
    id: 'contact2',
    name: 'Bob The Builder',
    email: 'bob.builder@outlook.com',
    phone: '+1987654321',
    company: 'Construction Co.',
    avatar: 'https://placehold.co/40x40.png',
    tags: ['Vendor'],
    status: 'busy',
    preferredContact: 'phone',
    vipLevel: 'standard'
  },
  {
    id: 'contact3',
    name: 'Carol Danvers',
    email: 'carol.d@gmail.com',
    phone: '+1555123456',
    company: 'Marketing Agency',
    avatar: 'https://placehold.co/40x40.png',
    tags: ['Partner'],
    status: 'online',
    preferredContact: 'email',
    vipLevel: 'premium'
  },
  {
    id: 'contact4',
    name: 'David Garcia',
    email: 'david@company.com',
    phone: '+1666777888',
    company: 'Legal Services',
    avatar: 'https://placehold.co/40x40.png',
    tags: ['Legal'],
    status: 'away',
    preferredContact: 'email',
    vipLevel: 'enterprise'
  },
  {
    id: 'contact5',
    name: 'Emma Wilson',
    email: 'emma.wilson@startup.io',
    phone: '+1444555666',
    company: 'TechStart',
    avatar: 'https://placehold.co/40x40.png',
    tags: ['Prospect', 'Hot Lead'],
    status: 'offline',
    preferredContact: 'whatsapp',
    vipLevel: 'standard'
  }
];

// Simple Mock Messages
const mockMessages: Message[] = [
  {
    id: '1',
    contact: mockContacts[0],
    subject: 'Project Update',
    content: 'Hi there! I wanted to provide you with an update on our project progress.',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    starred: true,
    labels: ['work'],
    conversationLog: []
  },
  {
    id: '2',
    contact: mockContacts[1],
    subject: 'Invoice Question',
    content: 'Hello, I have a question about the invoice you sent last week.',
    timestamp: '2024-01-15T09:15:00Z',
    read: true,
    starred: false,
    labels: ['billing'],
    conversationLog: []
  },
  {
    id: '3',
    contact: mockContacts[2],
    subject: 'Meeting Follow-up',
    content: 'Thanks for the great meeting yesterday! Here are my notes.',
    timestamp: '2024-01-14T16:45:00Z',
    read: true,
    starred: false,
    labels: ['meeting'],
    conversationLog: []
  }
];

const getAllMessages = (): Message[] => {
  return mockMessages;
};

const MessageItem = React.memo(({ message, onSelect }: { message: Message; onSelect: (message: Message) => void; }) => {
  const baseClasses = "flex items-start p-4 hover:bg-muted/50 cursor-pointer transition-colors";

  return (
    <div className={baseClasses} onClick={() => onSelect(message)}>
      <Avatar className="w-10 h-10 mr-3">
        <AvatarFallback className="text-sm">
          {message.contact.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      folder: 'inbox',
      messageId: 'msg_001',
      threadId: 'thread_001',
      importance: 'high',
      encrypted: false
    },
    labels: ['Project', 'Budget'],
    sentiment: 'neutral',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 120,
    aiInsights: {
      sentiment: 'neutral',
      urgency: 'high',
      topics: ['budget', 'project management', 'Q4 planning'],
      actionItems: ['Review budget allocation', 'Schedule meeting', 'Approve timeline'],
      suggestedResponses: ['Schedule a meeting to discuss the budget', 'Request additional details on timeline'],
      customerSatisfaction: 8,
      nextBestAction: 'Schedule budget review meeting',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'email1_msg1',
        sender: 'Alice Wonderland',
        text: 'Hi there! I wanted to provide you with a comprehensive update on Project Alpha and discuss the Q4 budget allocation. We\'ve made significant progress and I think you\'ll be pleased with the results.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive',
        attachments: [
          { id: 'att1', name: 'Q4_Budget_Report.pdf', type: 'document', size: '2.3 MB', url: '#', thumbnail: 'https://placehold.co/100x100.png' },
          { id: 'att2', name: 'Project_Alpha_Timeline.xlsx', type: 'spreadsheet', size: '854 KB', url: '#', thumbnail: 'https://placehold.co/100x100.png' }
        ]
      }
    ]
  },
  {
    id: 'email2',
    contact: mockContacts[1],
    subject: 'Invoice #INV-2024-12345 - Construction Services',
    snippet: 'Please find attached the detailed invoice for the construction services completed last month...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    priority: 'normal',
    aiInteraction: 'ai-responded',
    channelDetails: { 
      type: 'email', 
      service: 'outlook', 
      account: 'bob.builder@outlook.com', 
      folder: 'inbox',
      messageId: 'msg_002',
      threadId: 'thread_002',
      importance: 'normal',
      encrypted: false
    },
    labels: ['Invoice', 'Finance'],
    sentiment: 'positive',
    actionRequired: false,
    resolutionStatus: 'resolved',
    estimatedResponseTime: 60,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['invoice', 'payment', 'construction'],
      actionItems: ['Process payment within 30 days'],
      suggestedResponses: ['Acknowledge receipt and confirm payment timeline'],
      customerSatisfaction: 9,
      nextBestAction: 'Schedule payment processing',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'email2_msg1',
        sender: 'Bob The Builder',
        text: 'Please find attached the detailed invoice for the construction services completed last month. Payment is due within 30 days. Thank you for your business!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive',
        attachments: [
          { id: 'att3', name: 'Invoice_INV-2024-12345.pdf', type: 'document', size: '1.1 MB', url: '#', thumbnail: 'https://placehold.co/100x100.png' }
        ]
      },
      {
        id: 'email2_msg2',
        sender: 'AI Assistant',
        text: 'I\'ve automatically processed this invoice and scheduled it for payment within the 30-day terms. The payment will be processed on March 15th, 2024.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'ai-response',
        aiGenerated: true,
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'email3',
    contact: mockContacts[2],
    subject: 'Marketing Campaign Results & Next Steps',
    snippet: 'Great news! Our latest marketing campaign exceeded all expectations. Here are the detailed results...',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: false,
    starred: true,
    priority: 'high',
    aiInteraction: 'summarized',
    channelDetails: { 
      type: 'email', 
      service: 'gmail', 
      account: 'carol.d@gmail.com', 
      folder: 'inbox',
      messageId: 'msg_003',
      threadId: 'thread_003',
      importance: 'high',
      encrypted: false
    },
    labels: ['Marketing', 'Results'],
    sentiment: 'positive',
    actionRequired: true,
    resolutionStatus: 'in-progress',
    estimatedResponseTime: 180,
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['marketing', 'campaign results', 'ROI', 'lead generation'],
      actionItems: ['Review campaign results', 'Plan next campaign', 'Allocate budget'],
      suggestedResponses: ['Congratulate on excellent results and request next steps meeting'],
      customerSatisfaction: 10,
      nextBestAction: 'Schedule strategy meeting for next campaign',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'email3_msg1',
        sender: 'Carol Danvers',
        text: 'Great news! Our latest marketing campaign exceeded all expectations. We achieved a 340% ROI and generated 1,250 new leads. I\'ve prepared a comprehensive report with recommendations for our next campaign.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive',
        attachments: [
          { id: 'att4', name: 'Campaign_Results_Q4.pdf', type: 'document', size: '3.2 MB', url: '#', thumbnail: 'https://placehold.co/100x100.png' },
          { id: 'att5', name: 'Lead_Analytics.xlsx', type: 'spreadsheet', size: '1.8 MB', url: '#', thumbnail: 'https://placehold.co/100x100.png' }
        ]
      }
    ]
  }
];

const initialWhatsAppMessages: Message[] = [
  {
    id: 'wa1',
    contact: mockContacts[3],
    subject: 'Contract Review Urgent',
    snippet: 'Hey! I\'ve reviewed the contract and have some important feedback. Can we schedule a call today?',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    priority: 'urgent',
    aiInteraction: 'needs-attention',
    channelDetails: { 
      type: 'whatsapp', 
      account: '+1666777888', 
      businessAccount: true,
      verified: true,
      groupChat: false
    },
    labels: ['Legal', 'Contract'],
    sentiment: 'neutral',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 30,
    aiInsights: {
      sentiment: 'neutral',
      urgency: 'high',
      topics: ['contract', 'legal review', 'urgent meeting'],
      actionItems: ['Schedule call today', 'Review contract feedback'],
      suggestedResponses: ['I can schedule a call for today. What time works best?'],
      customerSatisfaction: 7,
      nextBestAction: 'Schedule immediate call',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'wa1_msg1',
        sender: 'David Garcia',
        text: 'Hey! I\'ve reviewed the contract and have some important feedback. Can we schedule a call today?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'neutral'
      },
      {
        id: 'wa1_msg2',
        sender: 'David Garcia',
        text: 'There are a few clauses that need clarification, particularly around liability and termination conditions.',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'wa2',
    contact: mockContacts[4],
    subject: 'Follow-up on Partnership Proposal',
    snippet: 'Hi! Following up on our partnership discussion. I have some exciting updates to share! 🚀',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: true,
    starred: true,
    priority: 'high',
    aiInteraction: 'ai-responded',
    channelDetails: { 
      type: 'whatsapp', 
      account: '+1444555666', 
      businessAccount: false,
      verified: false,
      groupChat: false
    },
    labels: ['Partnership', 'Business Development'],
    sentiment: 'positive',
    actionRequired: false,
    resolutionStatus: 'in-progress',
    estimatedResponseTime: 60,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['partnership', 'business development', 'collaboration'],
      actionItems: ['Review partnership updates', 'Schedule follow-up meeting'],
      suggestedResponses: ['Great to hear about the updates! Let\'s schedule a meeting to discuss'],
      customerSatisfaction: 9,
      nextBestAction: 'Schedule partnership review meeting',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'wa2_msg1',
        sender: 'Emma Wilson',
        text: 'Hi! Following up on our partnership discussion. I have some exciting updates to share! 🚀',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'wa2_msg2',
        sender: 'AI Assistant',
        text: 'I\'ve reviewed the partnership proposal and scheduled a follow-up meeting for next week. Emma seems very enthusiastic about moving forward.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'ai-response',
        aiGenerated: true,
        sentiment: 'positive'
      }
    ]
  }
];

const initialPhoneMessages: Message[] = [
  {
    id: 'phone1',
    contact: mockContacts[0],
    subject: 'Project Alpha Discussion',
    snippet: 'Incoming call - 8 minutes, recorded',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    priority: 'normal',
    aiInteraction: 'summarized',
    channelDetails: { 
      type: 'phone', 
      number: '+1234567890', 
      callType: 'incoming', 
      duration: '8m 15s', 
      recorded: true,
      recordingUrl: '/recordings/call_001.mp3',
      transcriptionAvailable: true,
      quality: 'excellent'
    },
    labels: ['Project', 'Call'],
    sentiment: 'positive',
    actionRequired: false,
    resolutionStatus: 'resolved',
    estimatedResponseTime: 0,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['project timeline', 'budget', 'resources', 'Q4 delivery'],
      actionItems: ['Allocate additional resources', 'Confirm Q4 delivery date'],
      suggestedResponses: ['Acknowledge timeline confirmation and resource allocation'],
      customerSatisfaction: 8,
      nextBestAction: 'Follow up with resource allocation plan',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'phone1_msg1',
        sender: 'Alice Wonderland',
        text: '📞 Call Summary: Discussed Project Alpha timeline, budget adjustments, and next milestones. Alice confirmed the Q4 delivery date and requested additional resources for the development team.',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'call-summary',
        callDuration: '8m 15s',
        transcription: 'Hi, I wanted to discuss the Project Alpha timeline. We need additional resources for Q4 delivery...',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'phone2',
    contact: mockContacts[4],
    subject: 'Sales Follow-up Call',
    snippet: 'Missed call - Urgent callback needed',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    priority: 'high',
    aiInteraction: 'needs-attention',
    channelDetails: { 
      type: 'phone', 
      number: '+1444555666', 
      callType: 'missed', 
      recorded: false,
      quality: 'good'
    },
    labels: ['Sales', 'Follow-up', 'Urgent'],
    sentiment: 'neutral',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 120,
    followUpDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    aiInsights: {
      sentiment: 'neutral',
      urgency: 'high',
      topics: ['sales follow-up', 'partnership discussion', 'callback urgency'],
      actionItems: ['Call back within 2 hours', 'Prepare partnership proposal'],
      suggestedResponses: ['Schedule callback immediately', 'Send availability for discussion'],
      customerSatisfaction: 6,
      nextBestAction: 'Immediate callback with partnership details',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'phone2_msg1',
        sender: 'System',
        text: '📞 Missed call from Emma Wilson. AI suggests calling back within 2 hours for optimal engagement based on her communication patterns.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'system',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'phone3',
    contact: mockContacts[1],
    subject: 'Invoice Payment Discussion',
    snippet: 'Outgoing call - 4 minutes, payment confirmed',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    priority: 'normal',
    aiInteraction: 'auto-resolved',
    channelDetails: { 
      type: 'phone', 
      number: '+1987654321', 
      callType: 'outgoing', 
      duration: '4m 32s', 
      recorded: false,
      quality: 'good'
    },
    labels: ['Finance', 'Invoice', 'Payment'],
    sentiment: 'positive',
    actionRequired: false,
    resolutionStatus: 'resolved',
    estimatedResponseTime: 0,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'low',
      topics: ['invoice payment', 'construction work', 'payment terms'],
      actionItems: ['Process payment within 30 days'],
      suggestedResponses: ['Confirm payment processing timeline'],
      customerSatisfaction: 9,
      nextBestAction: 'Schedule payment processing',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'phone3_msg1',
        sender: 'You',
        text: '📞 Discussed invoice payment terms and confirmed receipt of construction work. Payment will be processed within 30 days as agreed.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isUser: true,
        type: 'call-summary',
        callDuration: '4m 32s',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'phone4',
    contact: mockContacts[2],
    subject: 'Marketing Strategy Conference Call',
    snippet: 'Conference call - 3 participants, 15 minutes',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: true,
    priority: 'high',
    aiInteraction: 'summarized',
    channelDetails: { 
      type: 'phone', 
      number: '+1555123456', 
      callType: 'conference', 
      duration: '15m 42s', 
      recorded: true,
      recordingUrl: '/recordings/conference_002.mp3',
      transcriptionAvailable: true,
      quality: 'excellent',
      conferenceParticipants: ['Carol Danvers', 'Marketing Team Lead', 'Strategy Director']
    },
    labels: ['Marketing', 'Strategy', 'Conference'],
    sentiment: 'positive',
    actionRequired: true,
    resolutionStatus: 'in-progress',
    estimatedResponseTime: 240,
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['marketing strategy', 'campaign planning', 'budget allocation', 'Q1 goals'],
      actionItems: ['Review Q1 marketing budget', 'Approve campaign strategies', 'Schedule implementation timeline'],
      suggestedResponses: ['Approve proposed strategies and schedule implementation meeting'],
      customerSatisfaction: 9,
      nextBestAction: 'Schedule strategy implementation meeting',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'phone4_msg1',
        sender: 'Carol Danvers',
        text: '📞 Conference Call Summary: Discussed Q1 marketing strategy, budget allocation for new campaigns, and implementation timeline. All participants agreed on the proposed approach.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'call-summary',
        callDuration: '15m 42s',
        transcription: 'We discussed the Q1 marketing strategy including digital campaigns, budget allocation...',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'phone5',
    contact: mockContacts[3],
    subject: 'Legal Consultation - Voicemail',
    snippet: 'Voicemail - Contract clarification needed',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    priority: 'high',
    aiInteraction: 'needs-attention',
    channelDetails: { 
      type: 'phone', 
      number: '+1666777888', 
      callType: 'voicemail', 
      duration: '2m 15s', 
      recorded: true,
      recordingUrl: '/recordings/voicemail_003.mp3',
      transcriptionAvailable: true,
      quality: 'good',
      voicemailTranscription: 'Hi, this is David from Legal Services. I need to discuss some contract clauses that require clarification. Please call me back when you have a chance. Thanks.'
    },
    labels: ['Legal', 'Contract', 'Voicemail'],
    sentiment: 'neutral',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 180,
    followUpDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    aiInsights: {
      sentiment: 'neutral',
      urgency: 'high',
      topics: ['legal consultation', 'contract clauses', 'clarification needed'],
      actionItems: ['Return call to discuss contract clauses', 'Review contract documents'],
      suggestedResponses: ['Schedule call to discuss contract clarifications'],
      customerSatisfaction: 7,
      nextBestAction: 'Schedule legal consultation call',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'phone5_msg1',
        sender: 'David Garcia',
        text: '🎤 Voicemail: "Hi, this is David from Legal Services. I need to discuss some contract clauses that require clarification. Please call me back when you have a chance. Thanks."',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'voice',
        callDuration: '2m 15s',
        transcription: 'Hi, this is David from Legal Services. I need to discuss some contract clauses that require clarification...',
        sentiment: 'neutral'
      }
    ]
  }
];

// Mock data for web messages
const initialWebMessages: Message[] = [
  {
    id: 'web1',
    contact: {
      id: 'web_contact1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      avatar: '👩‍💼',
      tags: ['Website Visitor', 'Potential Customer'],
      status: 'online',
      preferredContact: 'web',
      vipLevel: 'standard'
    },
    subject: 'Product Demo Request',
    snippet: 'Interested in scheduling a product demo for our team',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    priority: 'high',
    aiInteraction: 'needs-attention',
    channelDetails: {
      type: 'web',
      source: 'contact-form',
      pageUrl: 'https://company.com/contact',
      sessionId: 'sess_12345',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY'
    },
    labels: ['Demo Request', 'New Lead', 'Sales'],
    sentiment: 'positive',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 2 * 60 * 60 * 1000,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'high',
      topics: ['product demo', 'team meeting', 'enterprise solution'],
      actionItems: ['Schedule product demo', 'Send calendar link'],
      suggestedResponses: ['Thank you for your interest! I\'d be happy to schedule a demo.'],
      nextBestAction: 'Schedule demo call within 24 hours',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'web1_msg1',
        sender: 'Sarah Johnson',
        text: 'Hi! I\'m interested in scheduling a product demo for our team of 15 people. We\'re looking for a solution that can handle our project management needs.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'web2',
    contact: {
      id: 'web_contact2',
      name: 'Mike Chen',
      email: 'mike.chen@techstartup.com',
      avatar: '👨‍💻',
      tags: ['Support', 'Technical Issue'],
      status: 'online',
      preferredContact: 'web',
      vipLevel: 'premium'
    },
    subject: 'Integration Support Needed',
    snippet: 'Having trouble with API integration, getting 403 errors',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: true,
    priority: 'urgent',
    aiInteraction: 'escalated',
    channelDetails: {
      type: 'web',
      source: 'support-widget',
      pageUrl: 'https://company.com/docs/api',
      sessionId: 'sess_67890',
      referrer: 'https://github.com/company/sdk'
    },
    labels: ['Technical Support', 'API', 'Integration'],
    sentiment: 'negative',
    actionRequired: true,
    resolutionStatus: 'in-progress',
    estimatedResponseTime: 1 * 60 * 60 * 1000,
    aiInsights: {
      sentiment: 'negative',
      urgency: 'high',
      topics: ['API integration', '403 error', 'authentication'],
      actionItems: ['Check API credentials', 'Review authentication setup'],
      suggestedResponses: ['Let me help you troubleshoot the API integration issue.'],
      nextBestAction: 'Escalate to technical team',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'web2_msg1',
        sender: 'Mike Chen',
        text: 'I\'m getting 403 Forbidden errors when trying to access the API endpoints. My credentials should be correct.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'negative'
      }
    ]
  }
];

// Mock data for custom channel messages
const initialCustomMessages: Message[] = [
  {
    id: 'custom1',
    contact: {
      id: 'custom_contact1',
      name: 'Jessica Martinez',
      email: 'jessica@socialmedia.com',
      avatar: '📱',
      tags: ['Social Media', 'Instagram'],
      status: 'online',
      preferredContact: 'custom',
      vipLevel: 'vip'
    },
    subject: 'Instagram DM: Partnership Proposal',
    snippet: 'Interested in collaborating on our upcoming campaign',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    starred: true,
    priority: 'high',
    aiInteraction: 'needs-attention',
    channelDetails: {
      type: 'custom',
      platform: 'Instagram',
      customType: 'direct-message',
      customIcon: '📷',
      customColor: '#E4405F',
      metadata: {
        username: '@jessica_marketing',
        followers: '50000',
        verified: 'true'
      }
    },
    labels: ['Partnership', 'Social Media', 'Marketing'],
    sentiment: 'positive',
    actionRequired: true,
    resolutionStatus: 'open',
    estimatedResponseTime: 4 * 60 * 60 * 1000,
    aiInsights: {
      sentiment: 'positive',
      urgency: 'medium',
      topics: ['partnership', 'collaboration', 'marketing campaign'],
      actionItems: ['Review partnership proposal', 'Schedule discussion'],
      suggestedResponses: ['Thank you for reaching out! We\'d love to explore this partnership.'],
      nextBestAction: 'Review influencer profile and engagement rates',
      riskLevel: 'low'
    },
    conversationLog: [
      {
        id: 'custom1_msg1',
        sender: 'Jessica Martinez',
        text: '🌟 Hi! I love your brand and would like to discuss a potential partnership for our upcoming summer campaign. I have 50k engaged followers in your target demographic.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'custom2',
    contact: {
      id: 'custom_contact2',
      name: 'Roberto Silva',
      email: 'roberto@marketplace.com',
      avatar: '🏪',
      tags: ['Marketplace', 'Vendor'],
      status: 'offline',
      preferredContact: 'custom',
      vipLevel: 'enterprise'
    },
    subject: 'Marketplace: Order Issue #12345',
    snippet: 'Customer complaint about delayed shipping',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    priority: 'urgent',
    aiInteraction: 'auto-resolved',
    channelDetails: {
      type: 'custom',
      platform: 'E-commerce Marketplace',
      customType: 'vendor-message',
      customIcon: '🛒',
      customColor: '#FF6B35',
      integrationId: 'marketplace_integration_v2',
      metadata: {
        orderId: '12345',
        customerRating: '2',
        issueType: 'shipping-delay'
      }
    },
    labels: ['Marketplace', 'Shipping', 'Customer Service'],
    sentiment: 'negative',
    actionRequired: false,
    resolutionStatus: 'resolved',
    estimatedResponseTime: 0,
    aiInsights: {
      sentiment: 'negative',
      urgency: 'high',
      topics: ['shipping delay', 'customer complaint', 'order fulfillment'],
      actionItems: ['Process refund', 'Update shipping status'],
      suggestedResponses: ['We apologize for the delay and have processed a full refund.'],
      nextBestAction: 'Monitor for similar shipping issues',
      riskLevel: 'medium'
    },
    conversationLog: [
      {
        id: 'custom2_msg1',
        sender: 'Roberto Silva',
        text: '⚠️ We have received a customer complaint about Order #12345. The shipment was delayed by 5 days and the customer is requesting a refund.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isUser: false,
        type: 'text',
        sentiment: 'negative'
      }
    ]
  }
];

type FilterType = 'all' | 'starred';
type SortType = 'newest' | 'oldest' | 'sender';

const aiFilterOptions: { label: string; value: FilterType; icon?: React.ReactNode; count?: number }[] = [
  { label: 'All', value: 'all' },
  { label: 'Starred', value: 'starred', icon: <Star className="h-4 w-4 mr-2" /> },
];

const AiInteractionBadge = ({ interaction }: { interaction: Message['aiInteraction'] }) => {
  if (!interaction || interaction === 'none') return null;

  let icon = null;
  let text = '';

  switch (interaction) {
    case 'ai-responded':
      icon = <Bot className="h-3 w-3" />;
      text = 'AI Responded';
      break;
    case 'needs-attention':
      icon = <Lightbulb className="h-3 w-3" />;
      text = 'Needs Attention';
      break;
    case 'summarized':
      icon = <Sparkles className="h-3 w-3" />;
      text = 'AI Summarized';
      break;
    case 'auto-archived':
      icon = <Archive className="h-3 w-3" />;
      text = 'Auto Archived';
      break;
    case 'escalated':
      icon = <TrendingUp className="h-3 w-3" />;
      text = 'Escalated';
      break;
    case 'auto-resolved':
      icon = <CheckCircle className="h-3 w-3" />;
      text = 'Auto Resolved';
      break;
    default:
      return null;
  }

  return (
    <Badge variant="outline" className="text-xs">
      {icon}
      {text}
    </Badge>
  );
};

const MessageItem = React.memo(({ message, onSelect }: { message: Message; onSelect: (message: Message) => void; }) => {
  const baseClasses = "flex items-start p-4 hover:bg-muted/50 cursor-pointer transition-colors";

  return (
    <div className={baseClasses} onClick={() => onSelect(message)}>
      <Avatar className="w-10 h-10 mr-3">
        <AvatarFallback className="text-sm">
          {message.contact.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium truncate">
            {message.contact.name}
          </h3>
          <time className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {message.content}
        </p>
      </div>
    </div>
  );
});

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  
  // Resizable sidebar states
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [showWidthIndicator, setShowWidthIndicator] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  // Resizing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setShowWidthIndicator(true);
    setStartX(e.clientX);
    setStartWidth(sidebarWidth);
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  const handleDoubleClick = () => {
    setSidebarWidth(384); // Reset to default width
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSizeMenu(!showSizeMenu);
  };

  const presetSizes = [
    { label: 'Compact', width: 280 },
    { label: 'Default', width: 384 },
    { label: 'Comfortable', width: 480 },
    { label: 'Wide', width: 600 },
  ];

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(280, Math.min(800, startWidth + deltaX)); // Min 280px, Max 800px
    setSidebarWidth(newWidth);
  }, [isResizing, startX, startWidth]);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
    setShowWidthIndicator(false);
    document.body.style.cursor = 'default';
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Close size menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showSizeMenu) {
        setShowSizeMenu(false);
      }
    };

    if (showSizeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSizeMenu]);

  // Combine all messages
  const allMessages = useMemo(() => {
    return [...initialEmailMessages, ...initialWhatsAppMessages, ...initialPhoneMessages, ...initialWebMessages, ...initialCustomMessages];
  }, []);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let filtered = allMessages;

    // Enhanced search with AI insights and labels
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(message =>
        message.contact.name.toLowerCase().includes(searchLower) ||
        message.subject.toLowerCase().includes(searchLower) ||
        message.snippet.toLowerCase().includes(searchLower) ||
        message.contact.company?.toLowerCase().includes(searchLower) ||
        message.labels.some(label => label.toLowerCase().includes(searchLower)) ||
        message.aiInsights?.topics.some(topic => topic.toLowerCase().includes(searchLower)) ||
        message.aiInsights?.actionItems.some(item => item.toLowerCase().includes(searchLower))
      );
    }

    // Enhanced filtering with new filter types
    switch (filterType) {
      case 'starred':
        filtered = filtered.filter(message => message.starred);
        break;
    }

    // Enhanced sorting
    switch (sortType) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'sender':
        filtered.sort((a, b) => a.contact.name.localeCompare(b.contact.name));
        break;
    }

    return filtered;
  }, [allMessages, searchTerm, filterType, sortType]);

  const getChannelCounts = () => {
    return {
      all: allMessages.length,
    };
  };

  const channelCounts = getChannelCounts();

  return (
    <div className="flex h-full bg-background">
      {/* Enhanced Sidebar - resizable */}
      <div 
        className="relative border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-none"
        data-sidebar-width={sidebarWidth}
        style={{ 
          width: `${sidebarWidth}px`,
          minWidth: '280px',
          maxWidth: '800px'
        }}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Unified Inbox
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => {
                    // TODO: Open custom channel configuration modal
                    console.log('Open custom channel configuration');
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Channel
                </Button>
                <Badge variant="outline" className="text-xs">
                  {channelCounts.all} total
                </Badge>
              </div>
            </div>
            
            {/* Enhanced Search with better styling */}
            <div className="relative mt-4">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Search across all channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Filters with better UI */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 h-9 justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {aiFilterOptions.find(option => option.value === filterType)?.label || 'Filter'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {aiFilterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilterType(option.value)}
                      className={filterType === option.value ? 'bg-primary/10' : ''}
                    >
                      <div className="flex items-center w-full">
                        {option.icon}
                        <span className="flex-1">{option.label}</span>
                        {filterType === option.value && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSortType('newest')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('oldest')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('priority')}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    By Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('sender')}>
                    <Users className="h-4 w-4 mr-2" />
                    By Sender
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('ai-insights')}>
                    <Brain className="h-4 w-4 mr-2" />
                    AI Insights Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('response-time')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Response Time
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-4">
                {filteredMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onSelect={setSelectedMessage}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Resizable Handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-primary/20 transition-colors z-10 ${
            isResizing ? 'bg-primary/30' : ''
          }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          title="Drag to resize • Double-click to reset • Right-click for presets"
        >
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-4 h-12 bg-background border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm">
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-1 bg-muted-foreground/40 rounded-full"></div>
              <div className="w-0.5 h-1 bg-muted-foreground/40 rounded-full"></div>
              <div className="w-0.5 h-1 bg-muted-foreground/40 rounded-full"></div>
            </div>
          </div>
          
          {/* Width Indicator */}
          {showWidthIndicator && (
            <div className="absolute top-4 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono shadow-lg z-20">
              {sidebarWidth}px
            </div>
          )}
          
          {/* Size Presets Menu */}
          {showSizeMenu && (
            <div className="absolute top-4 right-6 bg-background border border-border rounded-md shadow-lg z-30 min-w-[120px]">
              <div className="p-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 border-b border-border">
                  Size Presets
                </div>
                {presetSizes.map((preset) => (
                  <button
                    key={preset.width}
                    className={`w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors ${
                      sidebarWidth === preset.width ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => {
                      setSidebarWidth(preset.width);
                      setShowSizeMenu(false);
                    }}
                  >
                    {preset.label} ({preset.width}px)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Panel - Expandable */}
      <div className={`transition-all duration-300 border-l bg-background ${
        selectedMessage ? 'flex-1 min-w-0' : 'w-0 hidden lg:flex lg:flex-1'
      }`}>
        {selectedMessage ? (
          <MessageDetail 
            message={selectedMessage} 
            onSendReply={(messageId, replyText) => {
              console.log(`Sending reply to ${messageId}: ${replyText}`);
            }}
            onClose={() => setSelectedMessage(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a message</p>
              <p className="text-sm">Choose a conversation to view details and expand the view</p>
              <div className="mt-4 flex flex-col space-y-2">
                <Badge variant="outline" className="w-fit mx-auto">
                  📧 Email • 💬 WhatsApp • ☎️ Phone • 🌐 Web • ⚙️ Custom
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Unified communication channels in one interface
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
