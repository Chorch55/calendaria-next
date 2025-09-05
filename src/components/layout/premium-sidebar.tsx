'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Inbox, 
  Users, 
  PhoneCall, 
  Contact, 
  Bot, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  Settings, 
  CreditCard,
  HelpCircle,
  Moon, 
  Sun, 
  User, 
  ChevronDown, 
  LogOut,
  MessageSquare,
  Zap,
  Shield,
  Brain,
  Target,
  Globe,
  FileText,
  Archive,
  Bell,
  Crown,
  Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Logo } from '@/components/logo';
import { AddonsDropdown } from '@/components/ui/addons-dropdown';
import './premium-sidebar.css';

type SubItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  isNew?: boolean;
};

type NavSection = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  items?: SubItem[];
  badge?: string;
  isNew?: boolean;
};

const PremiumSidebar = React.memo(() => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['core']);
  
  // Notification count - In a real app, this would come from an API/context
  const notificationCount = 23;
  
  // Format notification count for display
  const formatNotificationCount = (count: number): string => {
    if (count === 0) return '0';
    if (count <= 999) return count.toString();
    return '+999';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isItemActive = (href: string) => pathname === href;
  const isSectionActive = (section: NavSection) => {
    if (section.href && pathname === section.href) return true;
    if (section.items) {
      return section.items.some(item => pathname === item.href);
    }
    return false;
  };

  const navigationSections: NavSection[] = [
    {
      title: 'core',
      icon: Target,
      items: [
        { title: 'dashboard', href: '/dashboard', icon: BarChart3 },
        { title: 'calendar', href: '/dashboard/calendar', icon: Calendar },
        { title: 'inbox', href: '/dashboard/inbox', icon: Inbox, badge: '3' },
      ]
    },
    {
      title: 'communication',
      icon: MessageSquare,
      items: [
        { title: 'phone_calls', href: '/dashboard/phone-calls', icon: PhoneCall },
        { title: 'contacts', href: '/dashboard/contacts', icon: Contact },
        { title: 'companies', href: '/dashboard/companies', icon: Users },
      ]
    },
    {
      title: 'automation',
      icon: Zap,
      items: [
        { title: 'assistant', href: '/dashboard/assistant', icon: Bot, isNew: true },
        { title: 'workflows', href: '/dashboard/workflows', icon: Zap },
        { title: 'integrations', href: '/dashboard/integrations', icon: Globe },
      ]
    },
    {
      title: 'productivity',
      icon: CheckSquare,
      items: [
        { title: 'tasks', href: '/dashboard/tasks', icon: CheckSquare },
        { title: 'projects', href: '/dashboard/projects', icon: FileText },
        { title: 'balance_accounts', href: '/dashboard/balance-accounts', icon: CreditCard },
      ]
    },
    {
      title: 'team_management',
      icon: Users,
      items: [
        { title: 'team', href: '/dashboard/team', icon: Users },
        { title: 'time_tracking', href: '/dashboard/time-tracking', icon: Clock },
        { title: 'hr_module', href: '/dashboard/hr', icon: Shield },
        { title: 'analytics_personnel', href: '/dashboard/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'advanced',
      icon: Brain,
      items: [
        { title: 'call_analytics', href: '/dashboard/call-analytics', icon: Brain, badge: 'Pro' },
        { title: 'real_time_monitoring', href: '/dashboard/monitoring', icon: BarChart3, badge: 'Pro' },
        { title: 'archives', href: '/dashboard/archives', icon: Archive },
      ]
    }
  ];

  const settingsSections: NavSection[] = [
    { title: 'settings', href: '/dashboard/settings', icon: Settings },
    { title: 'billing', href: '/dashboard/billing', icon: CreditCard },
    { title: 'help', href: '/dashboard/help', icon: HelpCircle },
  ];

  return (
    <div className="h-full w-full">
      {/* Premium Sidebar - Fixed with three sections */}
      <nav className="premium-sidebar flex flex-col h-full w-72 border-r border-sidebar-border/30 relative">
        
        {/* Logo Section - Fixed Top */}
        <div className="sidebar-section-header h-16 flex items-center px-6 border-b border-sidebar-border/30 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <Logo className="h-8 w-8 text-sidebar-primary" />
          </Link>
        </div>

        {/* Navigation Sections - Scrollable Middle */}
        <div className="flex-1 overflow-y-auto sidebar-scroll-area">
          <div className="px-3 py-4 space-y-1 pb-20">{/* Added padding bottom for better scrolling */}
              {/* Main Navigation */}
              {navigationSections.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections.includes(section.title);
                const isActive = isSectionActive(section);

                return (
                  <Collapsible
                    key={section.title}
                    open={isExpanded}
                    onOpenChange={() => toggleSection(section.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "sidebar-nav-item w-full justify-between font-medium mb-1 h-10 px-4 rounded-xl transition-all duration-200",
                          isActive
                            ? "active"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <SectionIcon className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                          )} />
                          <span className="text-sm font-medium capitalize">
                            {t(section.title)}
                          </span>
                          {section.badge && (
                            <Badge variant="secondary" className="sidebar-badge text-xs px-2 py-0 h-5">
                              {section.badge}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="sidebar-collapsible-content space-y-1 ml-2 border-l border-sidebar-border/30 pl-4 mt-2">
                      {section.items?.map((item) => {
                        const ItemIcon = item.icon;
                        const itemActive = isItemActive(item.href);

                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "sidebar-nav-item w-full justify-start h-9 px-3 rounded-lg transition-all duration-200 group",
                                itemActive
                                  ? "active"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                              )}
                            >
                              <ItemIcon className={cn(
                                "h-4 w-4 mr-3 transition-colors",
                                itemActive 
                                  ? "text-sidebar-primary" 
                                  : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                              )} />
                              <span className="text-sm flex-1 text-left">
                                {t(item.title)}
                              </span>
                              {item.badge && (
                                <Badge 
                                  variant={itemActive ? "default" : "secondary"} 
                                  className="sidebar-badge text-xs px-2 py-0 h-5 ml-2"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {item.isNew && (
                                <div className="w-2 h-2 bg-gradient-to-r from-accent to-sidebar-primary rounded-full ml-2 sidebar-pulse"></div>
                              )}
                            </Button>
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              <Separator className="sidebar-section-divider my-4" />

              {/* Settings Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-4 mb-3">
                  {t('configuration')}
                </p>
                {settingsSections.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link key={item.href!} href={item.href!}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "sidebar-nav-item w-full justify-start h-10 px-4 rounded-xl transition-all duration-200",
                          isActive
                            ? "active"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 mr-3 transition-colors",
                          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                        )} />
                        <span className="text-sm">{t(item.title)}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
        </div>

        {/* User Section - Fixed Bottom with Box Design */}
        <div className="sidebar-user-section border-t border-sidebar-border/30 p-4 flex-shrink-0">
          <div className="bg-gradient-to-br from-sidebar-accent/15 to-purple-500/5 rounded-xl border border-sidebar-border/30 overflow-hidden">
            <div className="flex items-center gap-3">
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-14 px-4 rounded-xl hover:bg-sidebar-accent/20 transition-all duration-200 group"
                  >
                  <Avatar className="h-9 w-9 ring-2 ring-purple-400/20">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-medium">
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name || user?.email || t('user')}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
                      <Crown className="h-3 w-3 text-amber-500" />
                      Enterprise Plan
                    </p>
                  </div>
                  
                  {/* Notification Bell Icon inside user button */}
                  <Link href="/dashboard/notifications" className="relative mr-2 hover:opacity-80 transition-opacity">
                    <Bell className={cn(
                      "h-4 w-4 transition-colors",
                      notificationCount > 0 
                        ? "text-red-400" 
                        : "text-sidebar-foreground/70"
                    )} />
                  </Link>
                  
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-72 p-0 z-[60] bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl"
                style={{ pointerEvents: 'auto' }}
                onInteractOutside={(e) => {
                  // Evitar que se cierre cuando se hace clic en dropdowns anidados
                  const target = e.target as Element;
                  if (target?.closest('[data-radix-dropdown-content]')) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="p-6 bg-gradient-to-br from-sidebar-accent/10 to-purple-500/3 backdrop-blur-sm border-b border-border/30">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-4 ring-purple-400/20 shadow-xl backdrop-blur-sm">
                        <AvatarImage src={user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl font-semibold">
                          {user?.name?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-purple-600 border-2 border-background rounded-full w-5 h-5 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-lg text-foreground">{user?.name || user?.email || t('user')}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Enterprise Plan</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                
                <div className="p-3">
                  {/* Profile & Settings */}
                  <div className="space-y-1">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center cursor-pointer h-9">
                        <User className="mr-3 h-4 w-4" />
                        <span>{t('profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/notifications" className="flex items-center justify-between cursor-pointer h-9 hover:bg-accent/10">
                        <div className="flex items-center">
                          <Bell className="mr-3 h-4 w-4 text-foreground/70" />
                          <span>{t('notifications')}</span>
                        </div>
                        {notificationCount > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 min-w-[24px] flex items-center justify-center font-medium">
                            {formatNotificationCount(notificationCount)}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center cursor-pointer h-9">
                        <Settings className="mr-3 h-4 w-4" />
                        <span>{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/billing" className="flex items-center cursor-pointer h-9">
                        <CreditCard className="mr-3 h-4 w-4" />
                        <span>{t('billing')}</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-border/30" />

                  {/* Plan & Add-ons */}
                  <div className="space-y-1">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/subscriptions" className="flex items-center justify-between cursor-pointer h-9">
                        <div className="flex items-center">
                          <Crown className="mr-3 h-4 w-4 text-amber-500" />
                          <span>Upgrade Plan</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <div>
                      <AddonsDropdown 
                        trigger={
                          <button 
                            className="flex items-center justify-between cursor-pointer h-9 w-full px-2 py-1.5 text-left hover:bg-accent/10 rounded-sm transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <div className="flex items-center">
                              <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                              <span className="text-sm">Add-ons</span>
                            </div>
                            <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-medium shadow-sm border-0">New</Badge>
                          </button>
                        }
                        align="start"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border/30" />

                  {/* Theme Toggle */}
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between h-9">
                      <div className="flex items-center">
                        {theme === 'dark' ? (
                          <Moon className="mr-3 h-4 w-4 text-foreground/70" />
                        ) : (
                          <Sun className="mr-3 h-4 w-4 text-foreground/70" />
                        )}
                        <span className="text-sm text-foreground/80">{t('theme')}</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border/30" />
                  
                  <DropdownMenuItem className="text-red-600 cursor-pointer h-9 focus:text-red-600" onSelect={() => logout()}>
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
});PremiumSidebar.displayName = 'PremiumSidebar';

export { PremiumSidebar };
