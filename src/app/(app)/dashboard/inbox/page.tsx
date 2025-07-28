
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Search, ListFilter, Edit3, RefreshCw, Bot, Sparkles, AlertTriangle, WifiOff, MailX, Lightbulb } from "lucide-react"; 
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { useSettings } from '@/context/settings-context'; 

interface ConversationMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

interface MessageChannelDetailsEmail {
  type: 'email';
  service: 'gmail' | 'outlook';
  account: string;
}

interface MessageChannelDetailsWhatsApp {
  type: 'whatsapp';
  account: string; // WhatsApp number
}

type MessageChannelDetails = MessageChannelDetailsEmail | MessageChannelDetailsWhatsApp;

interface Message {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  timestamp: string;
  avatar: string;
  read: boolean;
  aiInteraction?: 'ai-responded' | 'needs-attention' | 'summarized' | 'none';
  conversationLog: ConversationMessage[];
  channelDetails: MessageChannelDetails;
}

const initialMockEmails: Message[] = [
  { 
    id: 'email1', sender: 'Alice Wonderland', subject: 'Project Alpha Update', snippet: 'Just wanted to give you a quick update on Project Alpha...', timestamp: '10:30 AM', avatar: 'https://placehold.co/40x40.png', read: false, 
    channelDetails: { type: 'email', service: 'gmail', account: 'alice.w@gmail.com' }, 
    aiInteraction: 'needs-attention',
    conversationLog: [{ id: 'email1_initial', sender: 'Alice Wonderland', text: 'Just wanted to give you a quick update on Project Alpha...\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: '10:30 AM', isUser: false }]
  },
  { 
    id: 'email2', sender: 'Bob The Builder', subject: 'Invoice #12345', snippet: 'Please find attached the invoice for recent services.', timestamp: 'Yesterday', avatar: 'https://placehold.co/40x40.png', read: true, 
    channelDetails: { type: 'email', service: 'outlook', account: 'bob.builder@outlook.com' }, 
    aiInteraction: 'ai-responded',
    conversationLog: [{ id: 'email2_initial', sender: 'Bob The Builder', text: 'Please find attached the invoice for recent services.\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Yesterday', isUser: false }]
  },
  { 
    id: 'email3', sender: 'Carol Danvers', subject: 'Meeting Reminder', snippet: 'Friendly reminder about our meeting tomorrow at 2 PM.', timestamp: 'Mon', avatar: 'https://placehold.co/40x40.png', read: false, 
    channelDetails: { type: 'email', service: 'gmail', account: 'carol.d@gmail.com' }, 
    aiInteraction: 'summarized',
    conversationLog: [{ id: 'email3_initial', sender: 'Carol Danvers', text: 'Friendly reminder about our meeting tomorrow at 2 PM.\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Mon', isUser: false }]
  },
  { 
    id: 'email4', sender: 'Support Team', subject: 'Your ticket has been updated', snippet: 'We have an update regarding your recent support ticket...', timestamp: 'Tue', avatar: 'https://placehold.co/40x40.png', read: true, 
    channelDetails: { type: 'email', service: 'outlook', account: 'support@company.com' }, 
    aiInteraction: 'none',
    conversationLog: [{ id: 'email4_initial', sender: 'Support Team', text: 'We have an update regarding your recent support ticket...\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Tue', isUser: false }]
  },
  { 
    id: 'email5', sender: 'New Inquiry from a Very Long Named Potential Client Incorporated', subject: 'Question about service', snippet: 'I have a question regarding your premium service...', timestamp: '11:45 AM', avatar: 'https://placehold.co/40x40.png', read: false, 
    channelDetails: { type: 'email', service: 'gmail', account: 'long.name.client@gmail.com' }, 
    aiInteraction: 'needs-attention',
    conversationLog: [{ id: 'email5_initial', sender: 'New Inquiry from a Very Long Named Potential Client Incorporated', text: 'I have a question regarding your premium service...\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: '11:45 AM', isUser: false }]
  },
  { 
    id: 'email6', sender: 'Automated System', subject: 'Weekly Report', snippet: 'Your weekly performance report is ready.', timestamp: 'Wed', avatar: 'https://placehold.co/40x40.png', read: true, 
    channelDetails: { type: 'email', service: 'outlook', account: 'reports@calendaria.internal' }, 
    aiInteraction: 'none',
    conversationLog: [{ id: 'email6_initial', sender: 'Automated System', text: 'Your weekly performance report is ready.\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Wed', isUser: false }]
  },
];

const initialMockWhatsAppMessages: Message[] = [
  { 
    id: 'wa1', sender: 'David Copperfield', subject: 'Quick Question', snippet: 'Hey, do you have a moment to chat?', timestamp: '11:15 AM', avatar: 'https://placehold.co/40x40.png', read: false, 
    channelDetails: { type: 'whatsapp', account: '+1234567890' }, 
    aiInteraction: 'needs-attention',
    conversationLog: [{ id: 'wa1_initial', sender: 'David Copperfield', text: 'Hey, do you have a moment to chat?\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: '11:15 AM', isUser: false }]
  },
  { 
    id: 'wa2', sender: 'Eva Green', subject: 'File Received', snippet: 'Got the document, thanks!', timestamp: '9:00 AM', avatar: 'https://placehold.co/40x40.png', read: true, 
    channelDetails: { type: 'whatsapp', account: '+1987654321' }, 
    aiInteraction: 'none',
    conversationLog: [{ id: 'wa2_initial', sender: 'Eva Green', text: 'Got the document, thanks!\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: '9:00 AM', isUser: false }]
  },
  { 
    id: 'wa3', sender: 'Frank Stone', subject: 'Lunch tomorrow?', snippet: 'Are we still on for lunch tomorrow at 1 PM?', timestamp: 'Wed', avatar: 'https://placehold.co/40x40.png', read: false, 
    channelDetails: { type: 'whatsapp', account: '+1555123456' }, 
    aiInteraction: 'summarized',
    conversationLog: [{ id: 'wa3_initial', sender: 'Frank Stone', text: 'Are we still on for lunch tomorrow at 1 PM?\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Wed', isUser: false }]
  },
  { 
    id: 'wa4', sender: 'AI Assistant', subject: 'Follow-up Scheduled', snippet: 'I have scheduled a follow-up call for you.', timestamp: 'Tue', avatar: 'https://placehold.co/40x40.png', read: true, 
    channelDetails: { type: 'whatsapp', account: 'CalendarIA-AI' }, 
    aiInteraction: 'ai-responded',
    conversationLog: [{ id: 'wa4_initial', sender: 'AI Assistant', text: 'I have scheduled a follow-up call for you.\n\n(This is the initial message content. More details would follow in a real scenario.)', timestamp: 'Tue', isUser: false }]
  },
];

type AiInteractionFilter = 'all' | 'ai-responded' | 'needs-attention' | 'summarized' | 'none';
type EmailServiceFilter = 'all' | 'gmail' | 'outlook';


const aiFilterOptions: { label: string; value: AiInteractionFilter; icon?: React.ReactNode }[] = [
  { label: 'All Messages', value: 'all' },
  { label: 'Needs My Attention', value: 'needs-attention', icon: <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" /> },
  { label: 'AI Responded', value: 'ai-responded', icon: <Bot className="h-4 w-4 mr-2" /> },
  { label: 'AI Summarized', value: 'summarized', icon: <Sparkles className="h-4 w-4 mr-2" /> },
  { label: 'No AI Interaction', value: 'none', icon: <Mail className="h-4 w-4 mr-2" /> },
];

const emailServiceFilterOptions: { label: string; value: EmailServiceFilter; icon?: React.ReactNode }[] = [
  { label: 'All Email Accounts', value: 'all' },
  { label: 'Gmail', value: 'gmail', icon: <Mail className="h-4 w-4 mr-2" /> },
  { label: 'Outlook', value: 'outlook', icon: <Mail className="h-4 w-4 mr-2" /> },
];


const AiInteractionBadge = ({ interaction }: { interaction: Message['aiInteraction'] }) => {
  if (!interaction || interaction === 'none') return null;

  let icon = null;
  let text = '';
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  let customClassName = '';

  switch (interaction) {
    case 'ai-responded':
      icon = <Bot className="h-3 w-3" />;
      text = 'AI Responded';
      variant = 'default';
      break;
    case 'needs-attention':
      icon = <Lightbulb className="h-3 w-3" />;
      text = 'Needs Attention';
      variant = 'outline';
      customClassName = 'border-yellow-400/80 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:border-yellow-400/60 dark:bg-yellow-500/10 font-medium';
      break;
    case 'summarized':
      icon = <Sparkles className="h-3 w-3" />;
      text = 'AI Summarized';
      variant = 'secondary';
      break;
  }

  return (
    <Badge variant={variant} className={`text-xs px-1.5 py-0.5 ml-2 whitespace-nowrap ${customClassName}`}>
      {icon}
      <span className="ml-1 hidden sm:inline">{text}</span>
    </Badge>
  );
};


const MessageItem = React.memo(({ message, onSelect, rowIndex }: { message: Message; onSelect: (message: Message) => void; rowIndex: number; }) => {
  const baseClasses = "flex items-start p-4 border-b hover:bg-muted/50 cursor-pointer";
  const rowBackground = rowIndex % 2 === 0 ? '' : 'bg-muted/20';

  return (
  <div
    onClick={() => onSelect(message)}
    className={`${baseClasses} ${rowBackground}`}
    role="button"
    tabIndex={0}
    aria-label={`Message from ${message.sender}: ${message.subject}`}
  >
    <Image data-ai-hint="person avatar" src={message.avatar} alt={message.sender} width={40} height={40} className="rounded-full mr-4" />
    <div className="flex-1 overflow-hidden space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center min-w-0"> 
          <h3 
            className={`text-md font-semibold truncate ${!message.read ? 'text-primary' : 'text-foreground'}`}
          >
            {message.sender}
          </h3>
          {message.channelDetails.type === 'email' && (
            <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5 capitalize">
              {message.channelDetails.service}
            </Badge>
          )}
          <AiInteractionBadge interaction={message.aiInteraction} />
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{message.timestamp}</span> 
      </div>
      <p 
        className={`text-sm truncate ${!message.read ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
      >
        {message.subject}
      </p>
      <p className="text-xs text-muted-foreground truncate">{message.snippet}</p>
    </div>
  </div>
  );
});
MessageItem.displayName = 'MessageItem';


interface MessageDetailProps {
  message: Message | null;
  onSendReply: (messageId: string, replyText: string) => void;
  onClose: () => void;
}

const MessageDetail = ({ message, onSendReply, onClose }: MessageDetailProps) => {
  const [reply, setReply] = useState('');
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setReply('');
      setSuggestedReply(null); 
      const timer = setTimeout(() => {
        if (message.aiInteraction === 'ai-responded') {
          let aiActualResponse = `Our AI assistant has already replied to "${message.subject}". The response sent was: "Thank you for your message regarding '${message.subject}'. We have received it and will get back to you if further action is needed."`;
          if (message.id === 'email2' && message.subject === 'Invoice #12345') {
            aiActualResponse = `Our AI assistant has already replied to "${message.subject}". The response sent was: "Thank you for sending Invoice #12345. We've received it and it's being processed."`;
          } else if (message.id === 'wa4' && message.subject === 'Follow-up Scheduled') {
            aiActualResponse = `Our AI assistant has confirmed this action. The message sent was: "Confirmation: A follow-up call has been scheduled for you as requested."`;
          }
          setSuggestedReply(aiActualResponse);
        } else if (message.aiInteraction === 'needs-attention') {
          setSuggestedReply(
            `This message regarding "${message.subject}" might require your specific input. How can I help draft a response?`
          );
        } else if (message.aiInteraction === 'summarized') {
          setSuggestedReply(
            `AI Summary: This thread discusses [key points of the message snippet: "${message.snippet.substring(0, 50)}..."]. Would you like to reply based on this summary or request a more detailed one?`
          );
        } else { // 'none' or undefined
          setSuggestedReply(
            `Draft a reply for "${message.subject}"? Or perhaps, summarize this message first?`
          );
        }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [message]);


  if (!message) {
    return null; 
  }

  const handleLocalReply = () => {
    if (!reply.trim() || !message) return;
    onSendReply(message.id, reply);
    setReply(''); 
  };


  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
       <div className="p-4 border-b flex justify-end sticky top-0 bg-background">
         <Button onClick={onClose} variant="ghost" size="sm">Close</Button>
       </div>
       <div className="flex-grow overflow-y-auto">
        <div className="flex-1 flex flex-col h-full"> 
          <div className="p-6 border-b">
            <div className="flex items-center mb-1">
               <h2 className="text-2xl font-semibold">{message.subject}</h2>
               <AiInteractionBadge interaction={message.aiInteraction} />
            </div>
            <div className="flex items-center text-sm text-muted-foreground space-x-2">
              <Image data-ai-hint="person avatar" src={message.avatar} alt={message.sender} width={24} height={24} className="rounded-full" />
              <span>From: {message.sender}</span>
              <span className="opacity-50">|</span>
              <span>Received: {message.timestamp}</span>
              {message.channelDetails.type === 'email' && (
                <>
                  <span className="opacity-50">|</span>
                  <span>Account: {message.channelDetails.account} (<span className="capitalize">{message.channelDetails.service}</span>)</span>
                </>
              )}
               {message.channelDetails.type === 'whatsapp' && (
                <>
                  <span className="opacity-50">|</span>
                  <span>WhatsApp: {message.channelDetails.account}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6 flex-grow space-y-4 overflow-y-auto"> 
            {(message.conversationLog || []).map((chatItem) => (
              <div
                key={chatItem.id}
                className={`flex ${chatItem.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                    chatItem.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border' 
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {chatItem.sender}
                    <span className={`ml-2 text-xs ${chatItem.isUser ? 'opacity-70' : 'opacity-60'}`}>{chatItem.timestamp}</span>
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{chatItem.text}</p>
                </div>
              </div>
            ))}
          </div>

          {suggestedReply && (
            <div className="p-4 sm:m-6 m-2 border rounded-md bg-accent/10"> 
              <p className="text-sm font-semibold text-primary mb-1">
                 {message.aiInteraction === 'ai-responded' ? 'AI Auto-Reply (Already Sent):' : 'AI Suggested Action:'}
              </p>
              <p className="text-sm text-foreground/90">{suggestedReply}</p>
              {message.aiInteraction !== 'ai-responded' && (
                 <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                  if (message.aiInteraction === 'needs-attention' || message.aiInteraction === 'none' || message.aiInteraction === 'summarized') {
                    setReply(suggestedReply ? `Regarding your suggestion: "${suggestedReply.substring(0,100)}..." \n\nMy response: ` : `Regarding "${message.subject}", `); 
                  }
                }}>
                  Draft Reply
                </Button>
              )}
            </div>
          )}
          <div className="p-6 border-t bg-background sticky bottom-0">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Reply to ${message.sender}...`}
              className="w-full p-3 border rounded-md min-h-[100px] focus:ring-primary focus:border-primary transition-shadow"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleLocalReply} disabled={!reply.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">Send Reply</Button>
            </div>
          </div>
        </div>
       </div>
    </div>
  );
};


export default function InboxPage() {
  const [emails, setEmails] = useState<Message[]>(initialMockEmails);
  const [whatsAppMessages, setWhatsAppMessages] = useState<Message[]>(initialMockWhatsAppMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentTab, setCurrentTab] = useState<'email' | 'whatsapp'>('email');
  const [activeAiFilter, setActiveAiFilter] = useState<AiInteractionFilter>('all');
  const [emailServiceFilter, setEmailServiceFilter] = useState<EmailServiceFilter>('all');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { connections: appConnections, isSettingsLoaded } = useSettings();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'whatsapp') {
      setCurrentTab('whatsapp');
      setEmailServiceFilter('all'); 
    } else {
      setCurrentTab('email');
    }
    const filterParam = searchParams.get('filter') as AiInteractionFilter | null;
    if (filterParam && aiFilterOptions.some(opt => opt.value === filterParam)) {
      setActiveAiFilter(filterParam);
    }
  }, [searchParams]);

  // Moved showEmailServiceFilters definition before filteredMessages
  const showEmailServiceFilters = useMemo(() => {
    if (!isSettingsLoaded) return false;
    // Show filters only if both Gmail and Outlook are connected according to settings
    return appConnections.gmail.connected && appConnections.outlook.connected;
  }, [appConnections, isSettingsLoaded]);

  useEffect(() => {
    if (selectedMessage) {
        const currentMessageList = currentTab === 'email' ? emails : whatsAppMessages;
        let isMessageStillVisible = currentMessageList.some(msg => {
            let matchesAiFilter = activeAiFilter === 'all' || msg.aiInteraction === activeAiFilter || (activeAiFilter === 'none' && (!msg.aiInteraction || msg.aiInteraction === 'none'));
            
            let matchesServiceFilter = true;
            if (msg.channelDetails.type === 'email' && isSettingsLoaded) {
                if (!appConnections[msg.channelDetails.service]?.connected) {
                    matchesServiceFilter = false; 
                } else if (showEmailServiceFilters && emailServiceFilter !== 'all') { // Use the memoized showEmailServiceFilters
                    matchesServiceFilter = msg.channelDetails.service === emailServiceFilter;
                }
            } else if (msg.channelDetails.type === 'whatsapp' && isSettingsLoaded) {
                if (!appConnections.whatsapp.connected) {
                    matchesServiceFilter = false;
                }
            }
            return msg.id === selectedMessage.id && matchesAiFilter && matchesServiceFilter;
        });

        if (isMessageStillVisible) {
            const freshMessage = currentMessageList.find(msg => msg.id === selectedMessage.id);
            if (freshMessage && JSON.stringify(selectedMessage) !== JSON.stringify(freshMessage)) {
                setSelectedMessage(freshMessage);
            }
        } else {
            setSelectedMessage(null);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, activeAiFilter, emailServiceFilter, emails, whatsAppMessages, appConnections, isSettingsLoaded, showEmailServiceFilters]); // Added showEmailServiceFilters to dependency array


  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Simulating message refresh for emails and WhatsApp...');
    }, 60000); 

    return () => clearInterval(intervalId); 
  }, []); 

  const filteredMessages = useMemo(() => {
    if (!isSettingsLoaded) return [];

    let baseMessages: Message[];

    if (currentTab === 'email') {
        baseMessages = emails.filter(message => {
            if (message.channelDetails.type === 'email') {
                // Only include emails from services that are connected
                return appConnections[message.channelDetails.service]?.connected;
            }
            return false; 
        });
    } else { 
        if (!appConnections.whatsapp.connected) {
            return []; 
        }
        baseMessages = whatsAppMessages;
    }
    
    let aiFiltered = baseMessages;
    if (activeAiFilter !== 'all') {
      aiFiltered = baseMessages.filter(message => message.aiInteraction === activeAiFilter || (activeAiFilter === 'none' && (!message.aiInteraction || message.aiInteraction === 'none')));
    }

    if (currentTab === 'email' && showEmailServiceFilters && emailServiceFilter !== 'all') {
      return aiFiltered.filter(message => 
        message.channelDetails.type === 'email' && message.channelDetails.service === emailServiceFilter
      );
    }
    
    return aiFiltered;
  }, [currentTab, emails, whatsAppMessages, activeAiFilter, emailServiceFilter, appConnections, isSettingsLoaded, showEmailServiceFilters]);


  const handleSendReply = (messageId: string, replyText: string) => {
    if (!replyText.trim()) return;

    const userReply: ConversationMessage = {
      id: `user_reply_${Date.now()}`,
      sender: 'You', 
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    
    const setUpdatedList = currentTab === 'email' ? setEmails : setWhatsAppMessages;
    const currentList = currentTab === 'email' ? emails : whatsAppMessages;
    
    const originalMessage = currentList.find(m => m.id === messageId);
    if (!originalMessage) return;

    const originalSender = originalMessage.sender;
    const originalSubject = originalMessage.subject;


    setUpdatedList(prevMessages => {
      const updatedMessages = prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newLog = [...(msg.conversationLog || []), userReply];
          
          setTimeout(() => {
            const mockResponseText = (msg.channelDetails.type === 'email' && msg.channelDetails.service === 'gmail') 
              ? `Thanks for your message about "${originalSubject}" via Gmail. I'll get back to you soon.`
              : `Got your reply to "${originalSubject}". This is a simulated automatic response.`;

            const mockResponse: ConversationMessage = {
              id: `mock_response_${Date.now()}`,
              sender: originalSender,
              text: mockResponseText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isUser: false,
            };
            setUpdatedList(currentMsgs => currentMsgs.map(m => {
              if (m.id === messageId) {
                const finalLog = [...newLog, mockResponse];
                const updatedMsg = { ...m, conversationLog: finalLog, read: true };
                if (selectedMessage && selectedMessage.id === messageId) {
                    setSelectedMessage(updatedMsg);
                }
                return updatedMsg;
              }
              return m;
            }));
          }, 1500);
          
          const updatedMsg = { ...msg, conversationLog: newLog, read: true };
           if (selectedMessage && selectedMessage.id === messageId) {
             setSelectedMessage(updatedMsg);
           }
          return updatedMsg; 
        }
        return msg;
      });
      return updatedMessages;
    });

    toast.success("Reply Sent", {
      description: "Your message has been sent successfully."
    });
  };
  
  const handleSelectMessage = useCallback((message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      const updateStateFunction = message.channelDetails.type === 'email' ? setEmails : setWhatsAppMessages;
      updateStateFunction(prev => prev.map(m => m.id === message.id ? {...m, read: true} : m));
    }
  }, []);

  const getTabCount = (tabType: 'email' | 'whatsapp') => {
    if (!isSettingsLoaded) return 0;

    let baseMessagesForCount: Message[];
    if (tabType === 'email') {
        baseMessagesForCount = emails.filter(message => {
            if (message.channelDetails.type === 'email') {
                return appConnections[message.channelDetails.service]?.connected;
            }
            return false;
        });
    } else { 
        if (!appConnections.whatsapp.connected) {
            return 0;
        }
        baseMessagesForCount = whatsAppMessages;
    }

    let count = baseMessagesForCount.filter(m => activeAiFilter === 'all' || m.aiInteraction === activeAiFilter || (activeAiFilter === 'none' && (!m.aiInteraction || m.aiInteraction === 'none'))).length;
    
    if (tabType === 'email' && showEmailServiceFilters && emailServiceFilter !== 'all') {
         count = baseMessagesForCount.filter(m => 
            (activeAiFilter === 'all' || m.aiInteraction === activeAiFilter || (activeAiFilter === 'none' && (!m.aiInteraction || m.aiInteraction === 'none'))) &&
            (m.channelDetails.type === 'email' && m.channelDetails.service === emailServiceFilter)
        ).length;
    }
    return count;
  }


  return (
    <div className="h-[calc(100vh-var(--header-height,4rem))] flex flex-col"> 
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => {
                console.log('Simulating message refresh for emails and WhatsApp...');
                toast("Manual Refresh", {
                  description: `Checked for new ${currentTab} messages.`,
                  duration: 3000,
                });
            }}><RefreshCw className="h-4 w-4" /></Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Edit3 className="h-4 w-4 mr-2" />Compose</Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-10 w-full" />
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={(value) => { 
          setCurrentTab(value as 'email' | 'whatsapp'); 
          setSelectedMessage(null);
          if (value === 'whatsapp') {
            setEmailServiceFilter('all'); 
          }
        }} className="flex-grow flex flex-col overflow-hidden">
        <div className="px-6 pt-4 space-y-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground mr-2 shrink-0"><ListFilter className="h-4 w-4 inline mr-1"/>AI Filters:</span>
            {aiFilterOptions.map(option => (
              <Button
                key={option.value}
                variant={activeAiFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveAiFilter(option.value)}
                className="shrink-0"
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>

          {currentTab === 'email' && showEmailServiceFilters && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-sm font-medium text-muted-foreground mr-2 shrink-0"><ListFilter className="h-4 w-4 inline mr-1"/>Email Source:</span>
              {emailServiceFilterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={emailServiceFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmailServiceFilter(option.value)}
                  className="shrink-0"
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />Email ({getTabCount('email')})
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
                <MessageSquare className="h-4 w-4" />WhatsApp ({getTabCount('whatsapp')})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-grow flex overflow-hidden mt-2">
          <div className="w-full border-r overflow-y-auto">
            <TabsContent value="email" className="m-0 h-full">
              {isSettingsLoaded && !appConnections.gmail.connected && !appConnections.outlook.connected ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MailX className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Email Accounts Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please connect a Gmail or Outlook account in settings to view your emails.
                  </p>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/dashboard/settings#connections">Go to Settings</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {filteredMessages.map((msg, index) => <MessageItem key={msg.id} message={msg} onSelect={handleSelectMessage} rowIndex={index} />)}
                  {filteredMessages.length === 0 && (appConnections.gmail.connected || appConnections.outlook.connected) && (
                    <p className="p-8 text-muted-foreground text-center">
                      No emails match the current filter(s) or selected accounts.
                    </p>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="whatsapp" className="m-0 h-full">
              {isSettingsLoaded && !appConnections.whatsapp.connected ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">WhatsApp Not Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please connect your WhatsApp account in settings to view your messages.
                  </p>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/dashboard/settings#connections">Go to Settings</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {filteredMessages.map((msg, index) => <MessageItem key={msg.id} message={msg} onSelect={handleSelectMessage} rowIndex={index} />)}
                  {filteredMessages.length === 0 && (
                    <p className="p-8 text-muted-foreground text-center">
                      No WhatsApp messages match the current filter(s).
                    </p>
                  )}
                </>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {selectedMessage && (
         <MessageDetail 
            message={selectedMessage} 
            onSendReply={handleSendReply}
            onClose={() => setSelectedMessage(null)} 
         />
      )}
    </div>
  );
}
