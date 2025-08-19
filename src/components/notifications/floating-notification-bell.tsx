"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Mail, ListChecks, Circle, CalendarDays, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettings } from '@/context/settings-context';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  href: string;
  read: boolean;
  timestamp: string;
  icon?: React.ReactNode;
}

const initialMockNotifications: NotificationItem[] = [
  { id: '1', title: 'New Email: Project Alpha', description: 'From: Alice W. - Update & Next Steps', href: '/dashboard/inbox?messageId=email1', read: false, timestamp: '2m ago', icon: <Mail className="h-4 w-4 text-purple-700" /> },
  { id: '2', title: 'Task Due: Q3 Report', description: 'Draft Q3 Report for Project Alpha is due tomorrow.', href: '/dashboard/tasks', read: false, timestamp: '1h ago', icon: <ListChecks className="h-4 w-4 text-orange-500" /> },
  { id: '3', title: 'AI Responded: Invoice #12345', description: 'AI auto-replied to Bob The Builder.', href: '/dashboard/inbox?messageId=email2', read: true, timestamp: '3h ago', icon: <Bot className="h-4 w-4 text-purple-500" /> },
  { id: '4', title: 'Calendar: Team Sync', description: 'Reminder: Team Sync starts in 15 minutes.', href: '/dashboard/calendar', read: false, timestamp: '10m ago', icon: <CalendarDays className="h-4 w-4 text-purple-700" /> },
];

export function FloatingNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialMockNotifications);
  const [hasMounted, setHasMounted] = useState(false);
  const { appSettings } = useSettings();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <Bell className="h-6 w-6" />
            {appSettings.showNotificationBadge && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full animate-pulse"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 md:w-96 p-0 border-border shadow-xl rounded-lg mr-4" 
          side="bottom" 
          align="end" 
          sideOffset={8}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] max-h-[60vh]">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <li key={notification.id} className={`${!notification.read ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <Link 
                          href={notification.href} 
                          className="block p-3"
                          onClick={() => {
                              handleMarkAsRead(notification.id);
                              setIsOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {!notification.read && (
                              <Circle className="h-2 w-2 mt-1.5 fill-primary stroke-primary flex-shrink-0" />
                            )}
                            <div className={`flex-shrink-0 mt-0.5 ${notification.read ? 'ml-[14px]' : ''}`}>
                              {notification.icon || <Bell className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-center">
                                  <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notification.timestamp}</p>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{notification.description}</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No new notifications.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            {notifications.length > 0 && (
              <div className="p-2 border-t text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => setIsOpen(false)}>
                      Close
                  </Button>
              </div>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
