'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun, Settings, LogOut, User, ChevronDown, FolderInput, CreditCard } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useAuth } from '@/hooks/use-auth';
import { useSettings, type CustomNavGroup } from '@/context/settings-context';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/use-translation';
import { Logo } from '@/components/logo';
import { NAV_ITEMS, type NavItem, iconMap, type GroupIconName } from '@/config/sidebar';
import { type TranslationKey } from '@/config/locales';

// Mock user data - replace with actual user data when available
const mockUser = {
  name: 'Elena Rodriguez',
  email: 'elena.rodriguez@example.com',
  avatar: 'https://placehold.co/100x100.png',
  initials: 'ER',
};

const RenderStructureItem = ({ 
  item, 
  allNavItems, 
  pathname, 
  t 
}: { 
  item: string | CustomNavGroup; 
  allNavItems: Map<string, NavItem>; 
  pathname: string; 
  t: (key: TranslationKey) => string; 
}) => {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(false);

  if (typeof item === 'string') {
    const navItem = allNavItems.get(item);
    if (!navItem) return null;

    // Skip notifications as they are now floating
    if (navItem.id === 'notifications') {
      return null;
    }
    
    const Icon = navItem.icon;
    const isActive = pathname === navItem.href || 
                    (navItem.href !== '/dashboard' && pathname.startsWith(navItem.href));
    
    return (
      <Link
        key={navItem.id}
        href={navItem.href}
        className={`
          flex items-center gap-3 px-3 py-2.5 mx-3 rounded-lg text-sm font-medium
          transition-all duration-200 ease-in-out group
          ${isActive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }
        `}
      >
        <Icon width={20} height={20} className="shrink-0" />
        <span className="truncate">{t(navItem.id as TranslationKey)}</span>
      </Link>
    );
  } 
  
  // It's a CustomNavGroup
  const group = item;
  const IconComponent = iconMap[group.icon as GroupIconName] || FolderInput;
  
  const hasActiveChild = group.children.some(childId => {
    const childItem = allNavItems.get(childId);
    return childItem && pathname === childItem.href;
  });

  const renderGroupChildren = () => (
    <div className="space-y-1 mt-1">
      {group.children.map(childId => {
        const childItem = allNavItems.get(childId);
        if (!childItem) return null;
        
        const ChildIcon = childItem.icon;
        const isChildActive = pathname === childItem.href;
        
        return (
          <Link
            key={childId}
            href={childItem.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 ease-in-out
              ml-6 mr-6
              ${isChildActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <ChildIcon width={20} height={20} className="shrink-0" />
            <span className="truncate">{t(childItem.id as TranslationKey)}</span>
          </Link>
        );
      })}
    </div>
  );
  
  return (
    <Collapsible.Root 
      defaultOpen={hasActiveChild} 
      onOpenChange={setIsCollapsibleOpen}
    >
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className={`
            w-full justify-start gap-3 px-3 py-2.5 mx-3 rounded-lg text-sm font-medium h-auto
            transition-all duration-200 ease-in-out group
            ${hasActiveChild ? 'bg-muted' : 'hover:bg-muted/50'}
            ${hasActiveChild ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          <IconComponent width={22} height={22} className="shrink-0" />
          <span className="flex-1 truncate text-left">{group.name}</span>
          <ChevronDown 
            width={16} 
            height={16} 
            className={`shrink-0 transition-transform duration-200 ${isCollapsibleOpen ? 'rotate-180' : ''}`} 
          />
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {renderGroupChildren()}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export function ModernSidebar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { appSettings, isSettingsLoaded } = useSettings();
  const { topNavOrder, bottomNavOrder, sidebarVisibility } = appSettings;
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const allNavItems = React.useMemo(() => new Map(NAV_ITEMS.map(item => [item.id, item])), []);

  const getVisibleItems = React.useCallback((order: (string | CustomNavGroup)[]) => {
    return order.map(item => {
      if (typeof item === 'string') {
        return sidebarVisibility?.[item] ?? true ? item : null;
      }
      const visibleChildren = item.children.filter(childId => sidebarVisibility?.[childId] ?? true);

      if (visibleChildren.length > 0) {
        return {
          ...item,
          children: visibleChildren
        };
      }
      return null;
    }).filter(Boolean) as (string | CustomNavGroup)[];
  }, [sidebarVisibility]);
  
  const visibleTopItems = React.useMemo(() => getVisibleItems(topNavOrder), [topNavOrder, getVisibleItems]);
  const visibleBottomItems = React.useMemo(() => getVisibleItems(bottomNavOrder), [bottomNavOrder, getVisibleItems]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Show loading state while authentication is loading
  if (isLoading || !isSettingsLoaded) {
    return (
      <div className="h-full w-64 bg-background border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex justify-center">
          <Logo className="h-10 w-auto" href="/dashboard" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Use actual user data or fallback to mock
  const currentUser = user ? {
    name: user.name || user.email?.split('@')[0] || 'Usuario',
    email: user.email,
    avatar: user.image,
    initials: user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'
  } : mockUser;

  return (
    <div className="h-full w-64 bg-background border-r border-border flex flex-col overflow-hidden">
      {/* Logo Section */}
      <div className="p-4 border-b border-border flex justify-center">
        <Logo className="h-10 w-auto" href="/dashboard" />
      </div>

      {/* Navigation Section */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-1 p-2">
          {isSettingsLoaded ? (
            <>
              {/* Top Navigation */}
              {visibleTopItems.map((item) => (
                <RenderStructureItem 
                  key={typeof item === 'string' ? item : item.id} 
                  item={item} 
                  allNavItems={allNavItems} 
                  pathname={pathname} 
                  t={t} 
                />
              ))}
              
              {/* Spacer with visual separator */}
              <div className="flex-grow min-h-4" />
              <div className="mx-6 border-t border-border/50" />
              <div className="h-2" />
              
              {/* Bottom Navigation */}
              {visibleBottomItems.map((item) => (
                <RenderStructureItem 
                  key={typeof item === 'string' ? item : item.id} 
                  item={item} 
                  allNavItems={allNavItems} 
                  pathname={pathname} 
                  t={t} 
                />
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {theme === 'dark' ? <Moon width={16} height={16} /> : <Sun width={16} height={16} />}
            <span>Theme</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </div>

        <Separator />

        {/* User Section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 px-3 py-2 h-auto hover:bg-muted/50 min-w-0 overflow-hidden"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                <AvatarFallback className="text-xs">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <p className="text-sm font-semibold truncate w-full">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate w-full">
                  {currentUser.email}
                </p>
              </div>
              <ChevronDown width={16} height={16} className="text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <User width={16} height={16} />
                <span>{t("profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing" className="flex items-center gap-2">
                <CreditCard width={16} height={16} />
                <span>{t("billing")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings width={16} height={16} />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
              <LogOut width={16} height={16} />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
