'use client';

import React, { useState } from 'react';
import { Inbox, Search, ArrowUpDown, Filter, MoreVertical, Star } from 'lucide-react';
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
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  conversationLog: ConversationMessage[];
}

type FilterType = 'all' | 'unread' | 'starred';
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

MessageItem.displayName = 'MessageItem';

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
    const handleClickOutside = () => setShowSizeMenu(false);
    if (showSizeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSizeMenu]);

  const allMessages = getAllMessages();

  const filteredMessages = allMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !message.read) ||
                         (filterType === 'starred' && message.starred);
    
    return matchesSearch && matchesFilter;
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
    <div className="h-full bg-background">
      <div className="flex h-full">
        {/* Sidebar */}
        <div 
          className="bg-card border-r border-border flex flex-col relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Header */}
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Unified Inbox
            </CardTitle>
          </CardHeader>

          {/* Search and Filters */}
          <div className="px-6 pb-4 space-y-3">
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
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {sortedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onSelect={setSelectedMessage}
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
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Message Header */}
              <div className="border-b border-border bg-card">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-lg">
                        {selectedMessage.contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.contact.name} • {selectedMessage.contact.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.starred && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Reply</DropdownMenuItem>
                        <DropdownMenuItem>Forward</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Labels */}
                {selectedMessage.labels.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                  
                  {/* Conversation Log */}
                  {selectedMessage.conversationLog.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold">Conversation History</h3>
                      {selectedMessage.conversationLog.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.isUser ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{message.sender}</span>
                            <time className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </time>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  <span>{attachment.name}</span>
                                  <span className="text-muted-foreground">({attachment.size})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
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
                    {allMessages.length} total messages
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
