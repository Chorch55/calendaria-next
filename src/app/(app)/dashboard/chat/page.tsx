// src/app/(app)/dashboard/chat/page.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, User, Users, MessageSquare, Paperclip, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

interface Group {
    id: string;
    name: string;
    members: string[]; // array of user IDs
    avatarUrl: string;
}

interface Conversation {
  id: string; // user ID or group ID
  type: 'dm' | 'group';
  messages: ChatMessage[];
}

// Mock Data
const mockUsers: User[] = [
  { id: 'user0', name: 'Elena Rodriguez', avatarUrl: 'https://placehold.co/40x40.png', isOnline: true },
  { id: 'user2', name: 'Bob Smith', avatarUrl: 'https://placehold.co/40x40.png', isOnline: false },
  { id: 'user3', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/40x40.png', isOnline: true },
  { id: 'user4', name: 'Diana Prince', avatarUrl: 'https://placehold.co/40x40.png', isOnline: false },
];

const mockGroups: Group[] = [
    { id: 'group1', name: 'Project Alpha Team', members: ['user0', 'user2', 'user4'], avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'group2', name: 'Marketing Q3', members: ['user0', 'user3'], avatarUrl: 'https://placehold.co/40x40.png' },
];

const mockConversations: Conversation[] = [
  {
    id: 'user2',
    type: 'dm',
    messages: [
      { id: 'msg1', senderId: 'user2', text: 'Hey, do you have the Q3 report ready?', timestamp: '10:30 AM' },
      { id: 'msg2', senderId: 'user0', text: 'Almost, just finalizing the last section. I will send it over in an hour.', timestamp: '10:31 AM' },
    ],
  },
  {
    id: 'user3',
    type: 'dm',
    messages: [
      { id: 'msg3', senderId: 'user3', text: 'Great work on the new landing page mockups!', timestamp: 'Yesterday' },
    ],
  },
  {
      id: 'group1',
      type: 'group',
      messages: [
          { id: 'g_msg1', senderId: 'user4', text: 'Team, please check the latest mockups in Figma.', timestamp: '9:15 AM' },
          { id: 'g_msg2', senderId: 'user0', text: 'Looks great, Diana! I have a few comments.', timestamp: '9:20 AM' },
      ]
  }
];

type ConversationListItem = (User & { type: 'dm' }) | (Group & { type: 'group' });
type SelectedConversation = ConversationListItem | null;

const CURRENT_USER_ID = 'user0'; // Assume Elena is the current user

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation>(mockGroups.find(g => g.id === 'group1') ? { ...mockGroups.find(g => g.id === 'group1')!, type: 'group' } : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For "New Chat" Dialog
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newChatTab, setNewChatTab] = useState<'dm' | 'group'>('dm');
  
  const conversationList: ConversationListItem[] = useMemo(() => {
    const dms = mockUsers
      .filter(user => user.id !== CURRENT_USER_ID)
      .map(user => ({ ...user, type: 'dm' as const }));

    const groups = mockGroups.map(group => ({ ...group, type: 'group' as const }));
    
    const combined = [...groups, ...dms];

    return combined.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  }, [searchTerm]);


  const activeConversationMessages = useMemo(() => {
    if (!selectedConversation) return null;
    return conversations.find(c => c.id === selectedConversation.id);
  }, [selectedConversation, conversations]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeConversationMessages]);
  
  const getUserById = (id: string) => mockUsers.find(u => u.id === id);


  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
        if (newMessage.trim()) {
            toast({ title: "Message cannot be empty", variant: "destructive" });
        }
        return;
    }

    const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: CURRENT_USER_ID,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => {
        const newConversations = JSON.parse(JSON.stringify(prev)); // Deep copy
        const existingConvIndex = newConversations.findIndex((c: Conversation) => c.id === selectedConversation.id);
        
        if (existingConvIndex > -1) {
            newConversations[existingConvIndex].messages.push(message);
        } else {
            newConversations.push({ id: selectedConversation.id, type: selectedConversation.type, messages: [message] });
        }
        return newConversations;
    });

    setNewMessage('');
};
  
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `Selected "${file.name}". Upload functionality is a future feature.`,
      });
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) {
        toast({ title: "Error", description: "Group name and at least one member are required.", variant: "destructive" });
        return;
    }
    const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        members: [...newGroupMembers, CURRENT_USER_ID],
        avatarUrl: 'https://placehold.co/40x40.png',
    };
    mockGroups.unshift(newGroup); // In a real app, this would be an API call
    setSelectedConversation({ ...newGroup, type: 'group' });
    setIsNewChatDialogOpen(false);
    setNewGroupName('');
    setNewGroupMembers([]);
    toast({ title: "Group Created", description: `"${newGroup.name}" has been created.` });
  }

  const handleMemberSelection = (memberId: string, isChecked: boolean) => {
    setNewGroupMembers(prev => 
        isChecked ? [...prev, memberId] : prev.filter(id => id !== memberId)
    );
  };
  
  const renderSelectedConversationHeader = () => {
    if (!selectedConversation) return null;

    if (selectedConversation.type === 'dm') {
        const user = selectedConversation as User;
        return (
             <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                </div>
              </CardHeader>
        );
    }
    
    if (selectedConversation.type === 'group') {
        const group = selectedConversation as Group;
        return (
             <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.avatarUrl} alt={group.name} data-ai-hint="team logo" />
                  <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                      {group.members.slice(0, 3).map(id => getUserById(id)?.name).join(', ')}
                      {group.members.length > 3 && `, +${group.members.length - 3} more`}
                  </CardDescription>
                </div>
              </CardHeader>
        )
    }
  };


  return (
    <div className="h-[calc(100vh-var(--header-height,4rem))] flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
        <p className="text-muted-foreground mt-1">Communicate directly with your team members and groups.</p>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* User & Group List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Button variant="outline" className="w-full" onClick={() => setIsNewChatDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2"/>
                New Chat / Group
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            {conversationList.map(item => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedConversation?.id === item.id && "bg-muted"
                )}
                onClick={() => setSelectedConversation(item)}
              >
                 <Avatar className="h-10 w-10 relative">
                  <AvatarImage src={item.avatarUrl} alt={item.name} />
                  <AvatarFallback>
                      {item.type === 'dm' ? (item as User).name.split(' ').map(n => n[0]).join('') : <Users className="h-5 w-5"/>}
                  </AvatarFallback>
                   {item.type === 'dm' && (item as User).isOnline && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate flex items-center gap-2">
                    {item.name}
                    {item.type === 'group' && <Users className="h-4 w-4 text-muted-foreground shrink-0"/>}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.type === 'dm' ? ((item as User).isOnline ? 'Online' : 'Offline') : `${(item as Group).members.length} members`}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {renderSelectedConversationHeader()}
              <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {(activeConversationMessages?.messages || []).map(msg => {
                    const sender = getUserById(msg.senderId);
                    if (!sender) return null;

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={cn(
                                'flex items-end gap-3',
                                msg.senderId === CURRENT_USER_ID ? 'justify-end' : 'justify-start'
                            )}
                        >
                        {msg.senderId !== CURRENT_USER_ID && (
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={sender.avatarUrl} alt={sender.name} />
                            <AvatarFallback>{sender.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-md rounded-lg px-4 py-3 text-sm shadow-sm whitespace-pre-wrap',
                            msg.senderId === CURRENT_USER_ID
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border'
                            )}
                        >
                            {selectedConversation.type === 'group' && msg.senderId !== CURRENT_USER_ID && (
                                 <p className="text-xs font-bold mb-1 text-primary">{sender.name}</p>
                            )}
                            <p className={cn(msg.senderId === CURRENT_USER_ID && "font-semibold")}>{msg.text}</p>
                            <p className={cn(
                                "text-xs mt-1",
                                msg.senderId === CURRENT_USER_ID ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'
                            )}>{msg.timestamp}</p>
                        </div>
                        {msg.senderId === CURRENT_USER_ID && (
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={getUserById(CURRENT_USER_ID)?.avatarUrl} alt="You" />
                            <AvatarFallback>
                                {getUserById(CURRENT_USER_ID)?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                            </Avatar>
                        )}
                        </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-muted">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-4"
                >
                  <Button variant="ghost" size="icon" type="button" onClick={handleAttachmentClick}>
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedConversation.name}...`}
                    className="flex-1 bg-background"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send Message</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <MessageSquare className="h-16 w-16 mb-4" />
              <h2 className="text-xl font-semibold">Select a conversation</h2>
              <p>Choose a team member or group from the list to start chatting.</p>
            </div>
          )}
        </div>
      </div>

       <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Chat</DialogTitle>
                    <DialogDescription>Start a new conversation with a team member or create a new group.</DialogDescription>
                </DialogHeader>
                <Tabs value={newChatTab} onValueChange={(value) => setNewChatTab(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dm">Direct Message</TabsTrigger>
                        <TabsTrigger value="group">Create Group</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dm" className="pt-4">
                       <ScrollArea className="h-60">
                           <div className="space-y-2 pr-4">
                                {mockUsers.filter(u => u.id !== CURRENT_USER_ID).map(user => (
                                    <div key={user.id} className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer" onClick={() => { setSelectedConversation({...user, type: 'dm'}); setIsNewChatDialogOpen(false); }}>
                                        <Avatar className="h-8 w-8 mr-3"><AvatarImage src={user.avatarUrl}/><AvatarFallback>{user.name.split(' ').map(n=>n[0])}</AvatarFallback></Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                ))}
                           </div>
                       </ScrollArea>
                    </TabsContent>
                    <TabsContent value="group" className="pt-4 space-y-4">
                        <div>
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input id="group-name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g., Marketing Team" />
                        </div>
                         <div>
                            <Label>Select Members</Label>
                            <ScrollArea className="h-40 border rounded-md p-2">
                               <div className="space-y-2">
                                {mockUsers.filter(u => u.id !== CURRENT_USER_ID).map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox id={`member-${user.id}`} onCheckedChange={(checked) => handleMemberSelection(user.id, !!checked)} />
                                        <Label htmlFor={`member-${user.id}`} className="flex-grow flex items-center gap-2 cursor-pointer">
                                           <Avatar className="h-6 w-6"><AvatarImage src={user.avatarUrl}/><AvatarFallback>{user.name.split(' ').map(n=>n[0])}</AvatarFallback></Avatar> 
                                           {user.name}
                                        </Label>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || newGroupMembers.length === 0} className="bg-accent text-accent-foreground hover:bg-accent/90">Create Group</Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    </div>
  );
}
