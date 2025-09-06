'use client';

import React, { useState } from 'react';
import { Inbox, Search, ArrowUpDown, Filter, MoreVertical, Star, Mail, MessageSquare, Globe, Phone, Bot, Zap, CheckCircle, Archive, Trash2, Send, Paperclip, Clock, Users, AlertCircle, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Type definitions for simplified unified inbox
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  tags: string[];
  status: 'online' | 'offline' | 'away';
  timezone?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  vipLevel: 'standard' | 'premium' | 'enterprise';
}

interface ConversationMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
}

interface Message {
  id: string;
  contact: Contact;
  type: 'email' | 'whatsapp' | 'web-appointment' | 'phone-appointment' | 'ai' | 'attention';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  conversationLog: ConversationMessage[];
}

type FilterType = 'all' | 'unread' | 'starred';
type MessageTypeFilter = 'all' | 'email' | 'whatsapp' | 'web-appointment' | 'phone-appointment' | 'ai' | 'attention';
type SortType = 'newest' | 'oldest' | 'alphabetical';

// Mock contacts data
const mockContacts: Contact[] = [
  {
    id: 'contact1',
    name: 'Alice Wonderland',
    email: 'alice.w@gmail.com',
    phone: '+1234567890',
    company: 'Tech Innovations',
    avatar: '',
    tags: ['VIP', 'Project Manager'],
    status: 'online',
    timezone: 'UTC-5',
    preferredContact: 'email',
    vipLevel: 'premium'
  },
  {
    id: 'contact2',
    name: 'Bob Builder',
    email: 'bob.builder@constructio.com',
    phone: '+1234567891',
    company: 'Construction Co.',
    avatar: '',
    tags: ['Contractor', 'Reliable'],
    status: 'offline',
    timezone: 'UTC-6',
    preferredContact: 'phone',
    vipLevel: 'standard'
  },
  {
    id: 'contact3',
    name: 'Charlie Creative',
    email: 'charlie.creative@designstudio.com',
    phone: '+1234567892',
    company: 'Design Studio Pro',
    avatar: '',
    tags: ['Designer', 'Creative'],
    status: 'online',
    timezone: 'UTC-8',
    preferredContact: 'email',
    vipLevel: 'enterprise'
  }
];

// Simple Mock Messages
const mockMessages: Message[] = [
  {
    id: '1',
    contact: mockContacts[0],
    type: 'email',
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
    type: 'whatsapp',
    subject: 'Invoice Question',
    content: 'Hello, I have a question about the invoice you sent last week.',
    timestamp: '2024-01-15T09:15:00Z',
    read: true,
    starred: false,
    labels: ['billing'],
    conversationLog: [
      {
        id: 'conv1',
        sender: 'Bob Builder',
        text: 'Hello, I have a question about the invoice you sent last week. Could you please clarify the item on line 3?',
        timestamp: '2024-01-15T09:15:00Z',
        isUser: false,
        attachments: []
      },
      {
        id: 'conv2',
        sender: 'You',
        text: 'Hi Bob! Thanks for reaching out. Line 3 refers to the additional materials we discussed during our call. Let me send you the detailed breakdown.',
        timestamp: '2024-01-15T09:22:00Z',
        isUser: true,
        attachments: [
          {
            id: 'att1',
            name: 'materials-breakdown.pdf',
            size: '245 KB',
            type: 'pdf'
          }
        ]
      },
      {
        id: 'conv3',
        sender: 'Bob Builder',
        text: 'Perfect! That clears everything up. When would be the best time for payment? I can process it this week.',
        timestamp: '2024-01-15T09:35:00Z',
        isUser: false,
        attachments: []
      },
      {
        id: 'conv4',
        sender: 'You',
        text: 'Great! Any time this week works perfectly. Our payment terms are net 30, but earlier is always appreciated. Thank you for your prompt response!',
        timestamp: '2024-01-15T09:40:00Z',
        isUser: true,
        attachments: []
      }
    ]
  },
  {
    id: '3',
    contact: mockContacts[2],
    type: 'web-appointment',
    subject: 'Meeting Follow-up',
    content: 'Thanks for the great meeting yesterday! Here are my notes.',
    timestamp: '2024-01-14T16:45:00Z',
    read: true,
    starred: false,
    labels: ['meeting'],
    conversationLog: []
  },
  {
    id: '4',
    contact: mockContacts[0],
    type: 'phone-appointment',
    subject: 'Consultation Call Scheduled',
    content: 'Your consultation call has been scheduled for tomorrow at 3 PM.',
    timestamp: '2024-01-14T14:20:00Z',
    read: false,
    starred: false,
    labels: ['appointment'],
    conversationLog: []
  },
  {
    id: '5',
    contact: mockContacts[1],
    type: 'email',
    subject: 'Quarterly Report',
    content: 'Please find attached the quarterly financial report for your review.',
    timestamp: '2024-01-13T11:45:00Z',
    read: true,
    starred: true,
    labels: ['reports', 'finance'],
    conversationLog: []
  },
  {
    id: '6',
    contact: mockContacts[2],
    type: 'whatsapp',
    subject: 'Quick Update',
    content: 'Hey! Just wanted to give you a quick update on the design progress.',
    timestamp: '2024-01-13T08:30:00Z',
    read: false,
    starred: false,
    labels: ['design'],
    conversationLog: []
  },
  {
    id: '7',
    contact: mockContacts[0],
    type: 'ai',
    subject: 'AI Analysis Complete',
    content: 'Your AI analysis for the quarterly report has been completed. Key insights and recommendations are ready for review.',
    timestamp: '2024-01-12T15:20:00Z',
    read: false,
    starred: true,
    labels: ['ai', 'analysis'],
    conversationLog: []
  },
  {
    id: '8',
    contact: mockContacts[1],
    type: 'attention',
    subject: 'Urgent: Payment Overdue',
    content: 'ATTENTION REQUIRED: Payment for invoice #INV-2024-0123 is now 15 days overdue. Immediate action needed.',
    timestamp: '2024-01-12T09:45:00Z',
    read: false,
    starred: true,
    labels: ['urgent', 'payment'],
    conversationLog: []
  }
];

const getAllMessages = (): Message[] => {
  return mockMessages;
};

// Function to get message styling based on type
const getMessageStyle = (type: Message['type']) => {
  const styles = {
    email: {
      icon: Mail,
      iconColor: 'text-red-500'
    },
    whatsapp: {
      icon: MessageSquare,
      iconColor: 'text-green-500'
    },
    'web-appointment': {
      icon: Globe,
      iconColor: 'text-gray-600'
    },
    'phone-appointment': {
      icon: Phone,
      iconColor: 'text-blue-500'
    },
    ai: {
      icon: Bot,
      iconColor: 'text-yellow-500'
    },
    attention: {
      icon: Zap,
      iconColor: 'text-orange-600'
    }
  };
  
  return styles[type];
};

const MessageItem = React.memo(({ message, onSelect, isSelected, isExpanded, onToggleExpand, onToggleSelect, isCheckboxSelected }: { 
  message: Message; 
  onSelect: (message: Message) => void; 
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggleExpand: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  isCheckboxSelected?: boolean;
}) => {
  const messageStyle = getMessageStyle(message.type);
  const IconComponent = messageStyle.icon;
  
  const baseClasses = `flex items-start p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 border-b border-border ${
    isSelected 
      ? 'bg-accent/50 border-l-4 border-l-primary shadow-sm' 
      : 'border-l-4 border-l-transparent'
  }`;

  return (
    <div className={baseClasses}>
      {/* Checkbox for bulk selection */}
      {onToggleSelect && (
        <div className="mr-3 pt-1">
          <input
            type="checkbox"
            checked={isCheckboxSelected || false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(message.id);
            }}
            className="rounded border-border"
          />
        </div>
      )}
      
      <div className="flex-1" onClick={() => onSelect(message)}>
        <div className="flex items-start gap-3">
          <div className="flex items-center mr-3">
            <Avatar className="w-10 h-10 mr-2">
              <AvatarFallback className="text-sm">
                {message.contact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <IconComponent className={`h-4 w-4 ${messageStyle.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium truncate">
                {message.contact.name}
              </h3>
              <div className="text-xs text-muted-foreground ml-2 flex-shrink-0 text-right">
                <div className="font-medium">
                  {new Date(message.timestamp).toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric',
                    year: new Date(message.timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  })}
                </div>
                <div>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium mb-1 truncate">{message.subject}</p>
            
            <div className="text-sm text-muted-foreground">
              {isExpanded ? (
                <div>
                  <p>{message.content}</p>
                  <button 
                    className="text-blue-500 hover:text-blue-700 mt-2 text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(message.id);
                    }}
                  >
                    Show less
                  </button>
                </div>
              ) : (
                <div>
                  <p className="line-clamp-2">{message.content}</p>
                  {message.content.length > 100 && (
                    <button 
                      className="text-blue-500 hover:text-blue-700 mt-1 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(message.id);
                      }}
                    >
                      Show more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {message.starred && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {!message.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [messageTypeFilter, setMessageTypeFilter] = useState<MessageTypeFilter>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  
  // New functionality states
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Local state for messages to allow updates
  const [messages, setMessages] = useState<Message[]>(getAllMessages());
  
  // Resizable sidebar states
  const [sidebarWidth, setSidebarWidth] = useState(800); // Default width in pixels
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
    setSidebarWidth(800); // Reset to default width
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
    const handleClickOutside = () => setShowSizeMenu(false);
    if (showSizeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSizeMenu]);

  // Toggle expanded message
  const handleToggleExpand = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  // Template messages for quick replies
  const templates = [
    { id: 'thanks', text: 'Thank you for your message. I\'ll get back to you shortly.', label: 'Thanks' },
    { id: 'meeting', text: 'I\'d be happy to schedule a meeting. What times work best for you?', label: 'Schedule Meeting' },
    { id: 'followup', text: 'Following up on our previous conversation. Do you have any updates?', label: 'Follow Up' },
    { id: 'received', text: 'I\'ve received your message and will review it. Thanks for reaching out.', label: 'Received' }
  ];

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedMessages.size === 0) return;
    
    switch (action) {
      case 'markRead':
        // Update messages state to mark selected messages as read
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            selectedMessages.has(msg.id) 
              ? { ...msg, read: true }
              : msg
          )
        );
        // Update selected message if it was marked as read
        if (selectedMessage && selectedMessages.has(selectedMessage.id)) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
        setNotification(`Marked ${selectedMessages.size} messages as read`);
        break;
      case 'markUnread':
        // Update messages state to mark selected messages as unread
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            selectedMessages.has(msg.id) 
              ? { ...msg, read: false }
              : msg
          )
        );
        // Update selected message if it was marked as unread
        if (selectedMessage && selectedMessages.has(selectedMessage.id)) {
          setSelectedMessage({ ...selectedMessage, read: false });
        }
        setNotification(`Marked ${selectedMessages.size} messages as unread`);
        break;
      case 'archive':
        setNotification(`Archived ${selectedMessages.size} messages`);
        break;
      case 'delete':
        setNotification(`Deleted ${selectedMessages.size} messages`);
        break;
    }
    setSelectedMessages(new Set());
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle message selection for bulk actions
  const handleToggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  // Mark message as read when selected
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if it wasn't read before
    if (!message.read) {
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id 
            ? { ...msg, read: true }
            : msg
        )
      );
      
      // Update the selected message as well
      setSelectedMessage({ ...message, read: true });
      
      setNotification('Message marked as read');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  // Handle quick reply
  const handleQuickReply = (template?: string) => {
    const text = template || replyText;
    if (!text.trim()) return;
    
    setNotification('Reply sent successfully!');
    setReplyText('');
    setShowTemplates(false);
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-save draft
  React.useEffect(() => {
    if (replyText && replyText.length > 10) {
      const timer = setTimeout(() => {
        // Auto-save logic here
        console.log('Draft auto-saved');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [replyText]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !message.read) ||
                         (filterType === 'starred' && message.starred);
    
    const matchesMessageType = messageTypeFilter === 'all' || message.type === messageTypeFilter;
    
    return matchesSearch && matchesFilter && matchesMessageType;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortType) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'alphabetical':
        return a.contact.name.localeCompare(b.contact.name);
      default:
        return 0;
    }
  });

  return (
    <div className="h-screen min-h-screen bg-background overflow-hidden">
      {/* Notification Bar */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{notification}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotification(null)}
              className="ml-2 h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex h-full min-h-screen">
        {/* Sidebar */}
        <div 
          className="bg-card border-r border-border flex flex-col relative h-full min-h-screen rounded-tl-lg"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Header */}
          <CardHeader className="pt-4 pb-4 px-6 rounded-tl-lg">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Unified Inbox
            </CardTitle>
          </CardHeader>

          {/* Color Legend */}
          <div className="px-6 pb-4 border-b border-border">
            <div className="text-sm font-semibold text-foreground mb-3">Message Types</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setMessageTypeFilter('all')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span className="font-medium">All ({messages.length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('email')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'email' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Mail className="h-4 w-4 text-red-500" />
                <span className="font-medium">Email ({messages.filter(m => m.type === 'email').length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('whatsapp')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'whatsapp' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="font-medium">WhatsApp ({messages.filter(m => m.type === 'whatsapp').length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('web-appointment')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'web-appointment' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Web Apps ({messages.filter(m => m.type === 'web-appointment').length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('phone-appointment')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'phone-appointment' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Phone ({messages.filter(m => m.type === 'phone-appointment').length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('ai')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'ai' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Bot className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">AI ({messages.filter(m => m.type === 'ai').length})</span>
              </button>
              <button 
                onClick={() => setMessageTypeFilter('attention')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  messageTypeFilter === 'attention' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Attention ({messages.filter(m => m.type === 'attention').length})</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 pt-6 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
                <SelectTrigger className="flex-1">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Count and Bulk Actions */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {sortedMessages.length} message{sortedMessages.length !== 1 ? 's' : ''}
                  {selectedMessages.size > 0 && ` • ${selectedMessages.size} selected`}
                </span>
                {messageTypeFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {messageTypeFilter} filter active
                    <button 
                      onClick={() => setMessageTypeFilter('all')}
                      className="ml-2 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              
              {selectedMessages.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('markRead')}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMessages(new Set())}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {sortedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onSelect={handleSelectMessage}
                isSelected={selectedMessage?.id === message.id}
                isExpanded={expandedMessage === message.id}
                onToggleExpand={handleToggleExpand}
                onToggleSelect={handleToggleMessageSelection}
                isCheckboxSelected={selectedMessages.has(message.id)}
              />
            ))}
          </div>

          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors group"
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-12 bg-primary/10 rounded-l opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Width Indicator */}
          {showWidthIndicator && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              {sidebarWidth}px
            </div>
          )}

          {/* Size Menu */}
          {showSizeMenu && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-popover border rounded-md shadow-md p-2 z-10">
              <div className="text-xs font-medium mb-2">Quick Sizes</div>
              {presetSizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => {
                    setSidebarWidth(size.width);
                    setShowSizeMenu(false);
                  }}
                  className="block w-full text-left px-2 py-1 text-xs hover:bg-muted rounded"
                >
                  {size.label} ({size.width}px)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-h-screen overflow-hidden">
          {selectedMessage ? (
            <div className="h-full min-h-screen flex flex-col overflow-hidden">
              {/* Message Header */}
              <div className="border-b border-border bg-card">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg">
                          {selectedMessage.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {(() => {
                        const messageStyle = getMessageStyle(selectedMessage.type);
                        const IconComponent = messageStyle.icon;
                        return (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                            <IconComponent className={`h-3 w-3 ${messageStyle.iconColor}`} />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                        {(() => {
                          const messageStyle = getMessageStyle(selectedMessage.type);
                          const IconComponent = messageStyle.icon;
                          return <IconComponent className={`h-5 w-5 ${messageStyle.iconColor}`} />;
                        })()}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{selectedMessage.contact.name}</span>
                        <span>{selectedMessage.contact.email}</span>
                        {selectedMessage.contact.phone && (
                          <span>{selectedMessage.contact.phone}</span>
                        )}
                        <span>•</span>
                        <time>
                          {new Date(selectedMessage.timestamp).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Star className={`h-4 w-4 mr-2 ${selectedMessage.starred ? 'text-yellow-500 fill-current' : ''}`} />
                      {selectedMessage.starred ? 'Starred' : 'Star'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Forward
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          {selectedMessage.starred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Labels and Status */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedMessage.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedMessage.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {!selectedMessage.read && (
                        <Badge variant="destructive" className="text-xs">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedMessage.contact.status === 'online' ? 'bg-green-500' : 
                        selectedMessage.contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="capitalize">{selectedMessage.contact.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto bg-muted/20">
                <div className="p-6">
                  {/* Original Message */}
                  <div className="bg-card rounded-lg border p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-sm">
                          {selectedMessage.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{selectedMessage.contact.name}</span>
                          <time className="text-xs text-muted-foreground">
                            {new Date(selectedMessage.timestamp).toLocaleString()}
                          </time>
                        </div>
                        <div className="prose max-w-none text-sm">
                          <p className="leading-relaxed whitespace-pre-wrap mb-0">
                            {selectedMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation History */}
                  {selectedMessage.conversationLog.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-sm font-medium text-muted-foreground">Conversation</span>
                        <div className="h-px bg-border flex-1" />
                      </div>
                      {selectedMessage.conversationLog.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {message.isUser ? 'Y' : message.sender.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`rounded-lg p-3 ${
                              message.isUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-card border'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium text-xs ${
                                  message.isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                }`}>
                                  {message.sender}
                                </span>
                                <time className={`text-xs ${
                                  message.isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </time>
                              </div>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.text}
                              </p>
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div 
                                      key={attachment.id} 
                                      className={`flex items-center space-x-2 text-xs p-2 rounded border ${
                                        message.isUser 
                                          ? 'bg-primary-foreground/10 border-primary-foreground/20' 
                                          : 'bg-muted border-border'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${
                                        message.isUser ? 'bg-primary-foreground' : 'bg-primary'
                                      }`} />
                                      <span className="font-medium">{attachment.name}</span>
                                      <span className={`${
                                        message.isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                      }`}>
                                        ({attachment.size})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Reply Section */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-sm">Y</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="relative">
                          <textarea 
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                          />
                          {isTyping && replyText.length > 0 && (
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                              Auto-saving...
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Templates */}
                        {showTemplates && (
                          <div className="border border-border rounded-lg p-3 bg-muted/50">
                            <div className="text-sm font-medium mb-2">Quick Templates:</div>
                            <div className="grid grid-cols-2 gap-2">
                              {templates.map((template) => (
                                <Button
                                  key={template.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReplyText(template.text);
                                    setShowTemplates(false);
                                  }}
                                  className="text-left h-auto p-2"
                                >
                                  <div>
                                    <div className="font-medium text-xs">{template.label}</div>
                                    <div className="text-xs text-muted-foreground truncate mt-1">
                                      {template.text.substring(0, 40)}...
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Paperclip className="h-4 w-4 mr-1" />
                              Attach
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowTemplates(!showTemplates)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Templates
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!replyText.trim()}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Draft
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleQuickReply()}
                              disabled={!replyText.trim()}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full min-h-screen">
              <Card className="w-96 text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Inbox className="h-6 w-6" />
                    Unified Inbox
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Select a message to view its contents and conversation history.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {messages.length} total messages
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
