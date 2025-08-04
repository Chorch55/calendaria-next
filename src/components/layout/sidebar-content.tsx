
"use client";

import React from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logo } from '@/components/logo';
import { ChevronDown, LogOut, CreditCard as CreditCardIcon, FolderInput, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { useSettings, CustomNavGroup } from '@/context/settings-context';
import { NAV_ITEMS, NavItem, iconMap, GroupIconName } from '@/config/sidebar';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { TranslationKey } from '@/config/locales';
import { User, Edit, Trash2 } from 'lucide-react';
import { NotificationBell } from '../notifications/notification-bell';
import { useDragControls, Reorder } from "framer-motion";
import { Card, CardHeader, CardContent } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const user = {
  name: 'Elena Rodriguez',
  email: 'elena.rodriguez@example.com',
  avatar: 'https://placehold.co/100x100.png',
  initials: 'ER',
};

const RenderStructureItem = ({ item, allNavItems, pathname, t }: { item: string | CustomNavGroup; allNavItems: Map<string, NavItem>; pathname: string; t: (key: TranslationKey) => string; }) => {
    const { state: sidebarState } = useSidebar();
    const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(false);

    if (typeof item === 'string') {
        const navItem = allNavItems.get(item);
        if (!navItem) return null;

        if (navItem.id === 'notifications') {
            return <NotificationBell />;
        }
        
        return (
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    tooltip={{ children: t(navItem.id as TranslationKey), side: "right", align: "center" }} 
                    isActive={pathname === navItem.href}
                    className="data-[active=true]:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary"
                >
                    <Link href={navItem.href}>
                        {navItem.icon && <navItem.icon className="h-5 w-5" />}
                        <span className="flex-1 truncate">{t(navItem.id as TranslationKey)}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    } 
    
    // It's a CustomNavGroup
    const group = item;
    const IconComponent = iconMap[group.icon as GroupIconName] || FolderInput;
    const GroupIcon = typeof IconComponent === "function"
      ? React.createElement(IconComponent, { className: "h-5 w-5" })
      : null;
    const hasActiveChild = group.children.some(childId => pathname === allNavItems.get(childId)?.href);

    const renderGroupChildren = (isPopover = false) => (
        <ul className={cn(
            "flex min-w-0 flex-col gap-1",
            isPopover ? "p-2" : "ml-5 border-l border-sidebar-border py-1 pl-4",
        )}>
            {group.children.map(childId => {
                const childItem = allNavItems.get(childId);
                if (!childItem) return null;
                return (
                    <li key={childId}>
                        <SidebarMenuButton 
                            asChild 
                            size="sm" 
                            isActive={pathname === childItem.href}
                            className="data-[active=true]:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary"
                        >
                            <Link href={childItem.href}>
                                {childItem.icon && <childItem.icon className="h-4 w-4" />}
                                <span>{t(childItem.id as TranslationKey)}</span>
                            </Link>
                        </SidebarMenuButton>
                    </li>
                )
            })}
        </ul>
    );
    
    if (sidebarState === 'collapsed') {
         return (
            <SidebarMenuItem>
                <Popover>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton tooltip={{ children: group.name, side: "right", align: "center" }}>
                            {GroupIcon}
                        </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="p-0 w-auto">
                        {renderGroupChildren(true)}
                    </PopoverContent>
                </Popover>
            </SidebarMenuItem>
        );
    }
    
    return (
        <SidebarMenuItem>
            <Collapsible.Root asChild defaultOpen={hasActiveChild} onOpenChange={setIsCollapsibleOpen}>
                <div
                    className="group"
                    data-state={isCollapsibleOpen ? 'open' : 'closed'}
                >
                    <Collapsible.Trigger asChild>
                         <SidebarMenuButton
                            className="w-full justify-start data-[state=open]:bg-sidebar-accent"
                            data-active={hasActiveChild}
                            >
                            <div className="transition-colors group-data-[state=open]:text-primary text-teal-600">
                                {GroupIcon}
                            </div>
                            <span className="flex-1 truncate">{group.name}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                       {renderGroupChildren(false)}
                    </Collapsible.Content>
                </div>
            </Collapsible.Root>
        </SidebarMenuItem>
    );
};

export function SidebarLayoutContent() {
  const { isMobile } = useSidebar();
  const { appSettings, isSettingsLoaded } = useSettings();
  const { topNavOrder, bottomNavOrder, sidebarVisibility } = appSettings;
  const pathname = usePathname();
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

  return (
    <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-2">
            <div className="flex items-center justify-between">
                <Logo href="/dashboard" />
            </div>
        </SidebarHeader>
        <SidebarContent className="flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden">
            <SidebarMenu className="flex-grow flex flex-col gap-1 p-2">
                {isSettingsLoaded ? (
                  <>
                    {visibleTopItems.map((item) => (
                        <RenderStructureItem key={typeof item === 'string' ? item : item.id} item={item} allNavItems={allNavItems} pathname={pathname} t={t} />
                    ))}
                    <div className="flex-grow" />
                    <div className="flex justify-center py-2 group-data-[collapsible=icon]:p-0">
                        <SidebarTrigger />
                    </div>
                    {visibleBottomItems.map((item) => (
                        <RenderStructureItem key={typeof item === 'string' ? item : item.id} item={item} allNavItems={allNavItems} pathname={pathname} t={t} />
                    ))}
                  </>
                ) : (
                  <div>Loading...</div>
                )}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t flex flex-col gap-1">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:aspect-square p-2 h-auto">
                <Avatar className="h-8 w-8"><AvatarImage data-ai-hint="person portrait" src={user.avatar} alt={user.name} /><AvatarFallback>{user.initials}</AvatarFallback></Avatar>
                <div className={cn("ml-2 text-left truncate", useSidebar().state === 'collapsed' && !isMobile && "hidden")}><p className="font-semibold text-sm truncate">{user.name}</p><p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p></div>
                <ChevronDown className={cn("ml-auto h-4 w-4", useSidebar().state === 'collapsed' && !isMobile && "hidden")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel><DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/dashboard/profile" className="flex items-center w-full"><User className="mr-2 h-4 w-4" /><span>{t("profile")}</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/dashboard/billing" className="flex items-center w-full"><CreditCardIcon className="mr-2 h-4 w-4" /><span>{t("billing")}</span></Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => 
                toast("Log Out Clicked", {
                description: "Log out functionality to be implemented."
                })
              }><LogOut className="mr-2 h-4 w-4" /><span>{t("logout")}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
