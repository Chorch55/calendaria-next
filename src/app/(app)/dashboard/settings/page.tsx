"use client";

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner"
import { Mail, MessageSquare, UserCircle, Building, Briefcase, Save, Wifi, WifiOff, Link as LinkIcon, Palette, Sun, Moon, Monitor, Phone, Paintbrush, ArrowUp, ArrowDown, GripVertical, Bell, Baseline, Globe, ArrowUpCircle, ArrowDownCircle, Users, UserCog, PlusCircle, Trash2, Edit, FolderInput, ChevronsUpDown, Unlink, Camera, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from '@/context/settings-context';
import { CustomNavGroup, AppSettings, Language } from '../../../../config/types';
import { NavItem } from '@/config/sidebar';
import { Badge } from '@/components/ui/badge';
import { sidebarConfig, AVAILABLE_GROUP_ICONS, iconMap, GroupIconName } from '@/config/sidebar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/hooks/use-translation';
import { translations, TranslationKey } from '@/config/locales';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, Reorder, useDragControls, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialUserData = {
  name: 'Elena Rodriguez',
  email: 'elena.rodriguez@example.com',
  companyName: 'Innovatech Solutions',
  professionalProfile: 'Tech Consultant',
  avatarUrl: 'https://placehold.co/150x150.png',
  initials: 'ER'
};

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  // 1. Authentication hook
  const { data: session, status } = useSession();

  // 2. All state hooks first
  const [userData, setUserData] = useState(initialUserData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomNavGroup | null>(null);
  const [groupTargetList, setGroupTargetList] = useState<'top' | 'bottom'>('top');

  // 3. Context hooks
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { connections, updateConnection, appSettings, updateAppSettings, isSettingsLoaded } = useSettings();

  // Primero, todos los hooks
  useEffect(() => { setMounted(true); }, []);

  const connectionsSectionRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && window.location.hash === '#connections') {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const navItemMap = useMemo<Map<string, NavItem>>(() => {
    const allNavItems = [...sidebarConfig.mainNav, ...sidebarConfig.secondaryNav];
    return new Map(allNavItems.map((item: NavItem) => [item.title, item]));
  }, []);

  // 4. All effects together
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login-mt");
    }
  }, [status]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 5. Loading states
  if (!mounted || status === "loading" || !isSettingsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your settings</p>
        </div>
      </div>
    );
  }

  // 6. Extract settings after all hooks
  const { topNavOrder = [], bottomNavOrder = [], sidebarVisibility = {} } = appSettings;

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => { setUserData({ ...userData, [e.target.name]: e.target.value }); };
  const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => { updateAppSettings({ [e.target.name]: e.target.value }); };
  const saveProfile = () => { toast.success(t('profile_updated'), { description: t('profile_updated_desc') }); setIsEditingProfile(false); };
  
  const handleToggleConnection = (service: keyof typeof connections) => {
    const currentServiceState = connections[service];
    const newStatus = !currentServiceState.connected;
    let newAccount = null;
    if (newStatus) {
        switch(service) {
            case 'gmail': newAccount = 'mock_user@gmail.com'; break;
            case 'outlook': newAccount = 'mock_user@outlook.com'; break;
            case 'whatsapp': newAccount = '+15551234567'; break;
            case 'phone': newAccount = '+15557654321'; break;
        }
    }
    updateConnection(service, { connected: newStatus, account: newAccount });
    const title = 
      `${service.charAt(0).toUpperCase() + service.slice(1)} Connection ` +
      (newStatus ? "Established" : "Removed");

    toast.success(title);
  };

  const fontSizes = [80, 85, 90, 95, 100, 105, 110, 115, 120];
  const currentFontSizeIndex = fontSizes.indexOf(appSettings.fontSize || 100);
  const fontSizeLabels = ['Smallest', 'XS', 'S', 'S/M', 'Normal', 'M/L', 'L', 'XL', 'Largest'];
  const handleFontSizeChange = (value: number[]) => { if (fontSizes[value[0]]) { updateAppSettings({ fontSize: fontSizes[value[0]] }); } };

  const handleOpenGroupDialog = (targetList: 'top' | 'bottom', group: CustomNavGroup | null) => {
    setEditingGroup(group);
    setGroupTargetList(targetList);
    setIsGroupDialogOpen(true);
  };

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(l => l.code === appSettings.language) || languages[0];

  const ConnectionCard = ({ title, serviceKey, icon }: { title: string, serviceKey: keyof typeof connections, icon: React.ReactNode }) => {
    if (!isSettingsLoaded) return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p>Loading settings...</p></CardContent></Card>;
    const serviceState = connections[serviceKey];

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center">
            {icon}
            <CardTitle className="text-xl ml-3">{title}</CardTitle>
          </div>
          <Badge variant={serviceState.connected ? "default" : "outline"} className={serviceState.connected ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
            {serviceState.connected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
            {serviceState.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardHeader>
        <CardContent>
          {serviceState.connected ? (
            <p className="text-sm text-muted-foreground">Account: <span className="font-medium text-foreground">{serviceState.account}</span></p>
          ) : (
            <p className="text-sm text-muted-foreground">Connect your {title} account to manage it within CalendarIA.</p>
          )}
        </CardContent>
        <CardFooter><Button onClick={() => handleToggleConnection(serviceKey)} variant={serviceState.connected ? "destructive" : "default"} className={!serviceState.connected ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}>{serviceState.connected ? 'Disconnect' : `Connect ${title}`}</Button></CardFooter>
      </Card>
    );
  };
  
  if (!mounted || !isSettingsLoaded) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settingsTitle')}</h1>
        <p className="text-muted-foreground">{t('settingsDescription')}</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="flex items-center"><UserCircle className="h-6 w-6 mr-2 text-primary" />{t('profileInfoTitle')}</CardTitle>
                <CardDescription>{t('profileInfoDescription')}</CardDescription>
            </div>
            {userData.avatarUrl && (
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                    <AvatarFallback>{userData.initials}</AvatarFallback>
                </Avatar>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingProfile && (
              <div className="flex flex-col items-center gap-4 py-4 border-b">
                 <div className="relative">
                    <Avatar className="h-24 w-24 border">
                        {userData.avatarUrl ? (
                            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                        ) : (
                            <AvatarFallback className="text-2xl">
                                <User className="h-10 w-10 text-muted-foreground" />
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background hover:bg-muted"
                      onClick={() => toast.info("Feature in development", { description: "Avatar upload will be available soon." })}>
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change avatar</span>
                    </Button>
                  </div>
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">{t('fullNameLabel')}</Label><Input id="name" name="name" value={userData.name} onChange={handleProfileChange} disabled={!isEditingProfile} /></div>
            <div><Label htmlFor="email">{t('emailAddressLabel')}</Label><Input id="email" name="email" type="email" value={userData.email} disabled /><p className="text-xs text-muted-foreground mt-1">{t('emailCannotBeChanged')}</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="companyName" className="flex items-center"><Building className="w-4 h-4 mr-1 text-muted-foreground"/>{t('companyNameLabel')}</Label><Input id="companyName" name="companyName" value={userData.companyName} onChange={handleProfileChange} disabled={!isEditingProfile} /></div>
            <div><Label htmlFor="professionalProfile" className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-muted-foreground"/>{t('professionalProfileLabel')}</Label><Input id="professionalProfile" name="professionalProfile" value={userData.professionalProfile} onChange={handleProfileChange} disabled={!isEditingProfile} /></div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end gap-2">
            {!isEditingProfile && <Button variant="outline" onClick={() => setIsEditingProfile(true)}>{t('editProfileButton')}</Button>}
            {isEditingProfile && (
                <>
                <Button variant="ghost" onClick={() => { setUserData(initialUserData); setIsEditingProfile(false); }}>{t('cancelButton')}</Button>
                <Button onClick={saveProfile} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-2 h-4 w-4" /> {t('saveChangesButton')}</Button>
                </>
            )}
        </CardFooter>
      </Card>
      
      <Separator />

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="h-6 w-6 mr-2 text-primary" />{t('appearanceTitle')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('themeTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('themeDescription')}</p>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Label htmlFor="light" className={cn("p-4 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground", theme === 'light' && "border-primary ring-2 ring-primary")}>
                  <Sun className="h-8 w-8" />
                  <span className="font-semibold">{t('themeLight')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Label htmlFor="dark" className={cn("p-4 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground", theme === 'dark' && "border-primary ring-2 ring-primary")}>
                  <Moon className="h-8 w-8" />
                  <span className="font-semibold">{t('themeDark')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Label htmlFor="system" className={cn("p-4 border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground", theme === 'system' && "border-primary ring-2 ring-primary")}>
                  <Monitor className="h-8 w-8" />
                  <span className="font-semibold">{t('themeSystem')}</span>
                </Label>
              </div>
            </RadioGroup>
            {theme === 'system' && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('currentSystemTheme')} {resolvedTheme === 'dark' ? t('themeDark') : t('themeLight')}.
              </p>
            )}
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('fontSizeTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('fontSizeDescription')}</p>
            <div className="grid gap-4 pt-2">
                <Slider
                    value={[currentFontSizeIndex]}
                    onValueChange={handleFontSizeChange}
                    max={fontSizes.length - 1}
                    step={1}
                    aria-label={t('fontSizeTitle')}
                />
                <p className="text-center text-sm font-medium text-muted-foreground">
                  {fontSizeLabels[currentFontSizeIndex]} ({appSettings.fontSize}%)
                </p>
            </div>
        </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="flex items-center"><Globe className="h-5 w-5 mr-2 text-primary" /> {t('languageTitle')}</CardTitle><CardDescription>{t('languageDescription')}</CardDescription></CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-[280px] justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{currentLanguage.flag}</span>
                        <span className="font-medium">{currentLanguage.name}</span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onSelect={() => {
                      updateAppSettings({ language: lang.code });
                      toast.success(
                        translations[lang.code]?.languageUpdated || translations.en.languageUpdated,
                        {
                          description:
                            translations[lang.code]?.languageSetTo || translations.en.languageSetTo,
                          duration: 5000,
                        }
                      );
                    }}
                  >
                    <span className="text-xl mr-3">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card className="shadow-lg">
        <CardHeader><CardTitle>{t('sidebarTitle')}</CardTitle><CardDescription>{t('sidebarDescription')}</CardDescription></CardHeader>
        <CardContent className="space-y-6">
            <NavCustomizationList 
                title={t('top_navigation')}
                listKey="topNavOrder"
                items={topNavOrder}
                allNavItems={navItemMap}
                t={t}
                appSettings={appSettings}
                updateAppSettings={updateAppSettings}
                onOpenGroupDialog={(group: CustomNavGroup | null) => handleOpenGroupDialog('top', group)}
            />
             <NavCustomizationList 
                title={t('bottom_navigation')}
                listKey="bottomNavOrder"
                items={bottomNavOrder}
                allNavItems={navItemMap}
                t={t}
                appSettings={appSettings}
                updateAppSettings={updateAppSettings}
                onOpenGroupDialog={(group: CustomNavGroup | null) => handleOpenGroupDialog('bottom', group)}
            />
        </CardContent>
      </Card>
      
      {isGroupDialogOpen && <GroupEditorDialog isOpen={isGroupDialogOpen} setIsOpen={setIsGroupDialogOpen} group={editingGroup} updateAppSettings={updateAppSettings} appSettings={appSettings} t={t} targetList={groupTargetList}/>}

      <Separator />
      
      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center"><Bell className="h-6 w-6 mr-2 text-primary" />{t('notificationSettingsTitle')}</CardTitle>
              <CardDescription>{t('notificationSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                      <Label htmlFor="show-badge" className="font-medium">{t('showNotifCountLabel')}</Label>
                      <p className="text-sm text-muted-foreground">{t('showNotifCountDescription')}</p>
                  </div>
                  <Switch
                      id="show-badge"
                      checked={appSettings.showNotificationBadge}
                      onCheckedChange={(checked) => updateAppSettings({ showNotificationBadge: checked })}
                      aria-label={t('showNotifCountLabel')}
                  />
              </div>
          </CardContent>
      </Card>

      <Separator />

      <div id="connections" ref={connectionsSectionRef} className="scroll-mt-24">
        <div className="flex items-center"><LinkIcon className="h-6 w-6 mr-2 text-primary" /><h2 className="text-2xl font-semibold">{t('connectionsTitle')}</h2></div>
        <p className="text-muted-foreground mt-1">{t('connectionsDescription')}</p>
      </div>
      <div className="space-y-6">
        <ConnectionCard title="Phone / Telephony" serviceKey="phone" icon={<Phone className="h-8 w-8 text-gray-500" />} />
        <ConnectionCard title="WhatsApp" serviceKey="whatsapp" icon={<MessageSquare className="h-8 w-8 text-green-500" />} />
        <ConnectionCard title="Gmail / Google Workspace" serviceKey="gmail" icon={<Mail className="h-8 w-8 text-red-500" />} />
        <ConnectionCard title="Outlook / Microsoft 365" serviceKey="outlook" icon={<Mail className="h-8 w-8 text-blue-500" />} />
      </div>
    </div>
  );
}


// --- COMPONENTS FOR SETTINGS PAGE ---

const NavCustomizationList = ({ title, listKey, items, allNavItems, t, appSettings, updateAppSettings, onOpenGroupDialog }: any) => {
    const handleReorder = (newList: (string | CustomNavGroup)[]) => {
        if (listKey === 'topNavOrder') {
            updateAppSettings({ topNavOrder: newList });
        } else {
            updateAppSettings({ bottomNavOrder: newList });
        }
        toast.success(t('sidebar_order_updated'), {
          duration: 5000
        });
    };

    const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
        let newTop = [...appSettings.topNavOrder];
        let newBottom = [...appSettings.bottomNavOrder];
        
        let itemToMove: string | CustomNavGroup | undefined;

        const findAndRemove = (list: any[], id: string) => {
            const itemIndex = list.findIndex(i => (typeof i === 'string' ? i : i.id) === id);
            if (itemIndex > -1) {
                itemToMove = list[itemIndex];
                return list.filter((_, index) => index !== itemIndex);
            }
            return list;
        };
        
        newTop = findAndRemove(newTop, itemId);
        if (!itemToMove) {
             newBottom = findAndRemove(newBottom, itemId);
        }

        if (!itemToMove) return;

        if (direction === 'down') {
            newBottom.unshift(itemToMove);
        } else {
            newTop.push(itemToMove);
        }

        updateAppSettings({topNavOrder: newTop, bottomNavOrder: newBottom});
        toast.success(t('sidebar_order_updated'), {
          duration: 5000
        });
    };
    
    const handleDeleteGroup = (groupToDelete: CustomNavGroup) => {
        const childrenToMove = groupToDelete.children || [];
        
        const updateList = (list: (string | CustomNavGroup)[]) => {
            const groupIndex = list.findIndex(item => typeof item !== 'string' && item.id === groupToDelete.id);
            if (groupIndex > -1) {
                const newList = [...list];
                newList.splice(groupIndex, 1);
                // Move children to the end of the same list
                return [...newList, ...childrenToMove];
            }
            return list;
        }
    
        const newTopOrder = updateList(appSettings.topNavOrder);
        const newBottomOrder = updateList(appSettings.bottomNavOrder);
        
        updateAppSettings({ topNavOrder: newTopOrder, bottomNavOrder: newBottomOrder });
        toast.error(t('group_deleted'), {
          duration: 5000
        });
    };

    const onDropToGroup = (group: CustomNavGroup, droppedItemId: string) => {
        if (group.children.includes(droppedItemId)) return;
        
        const removeFromList = (list: (string | CustomNavGroup)[]): (string | CustomNavGroup)[] =>
          list.filter(
            (i: string | CustomNavGroup) =>
              (typeof i === 'string' ? i : i.id) !== droppedItemId
          );

        const removeFromAllGroups = (list: (string | CustomNavGroup)[]): (string | CustomNavGroup)[] =>
          list.map((item: string | CustomNavGroup) => {
            if (typeof item !== 'string' && item.children) {
              return {
                ...item,
                children: item.children.filter(
                  (id: string) => id !== droppedItemId  // aquí ya tipamos `id`
                )
              };
            }
            return item;
          });

        let newTopOrder = removeFromAllGroups(removeFromList(appSettings.topNavOrder));
        let newBottomOrder = removeFromAllGroups(removeFromList(appSettings.bottomNavOrder));

        const updateGroupInList = (list: any[]) => list.map(item => {
             if (typeof item !== 'string' && item.id === group.id) {
                return {...item, children: [...item.children, droppedItemId]};
            }
            return item;
        });

        newTopOrder = updateGroupInList(newTopOrder);
        newBottomOrder = updateGroupInList(newBottomOrder);

        updateAppSettings({ topNavOrder: newTopOrder, bottomNavOrder: newBottomOrder });
        toast.success(
          `${t('move_to_group')} "${group.name}"`,
          { duration: 5000 }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenGroupDialog(null)}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />{t('create_group')}
                </Button>
            </div>
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2 p-2 border rounded-lg bg-background min-h-[60px]">
                {items.map((item: any) => (
                    <Reorder.Item key={typeof item === 'string' ? item : item.id} value={item} className="relative">
                        {typeof item === 'string' ? (
                            <SimpleNavItem 
                                itemId={item}
                                item={allNavItems.get(item)}
                                appSettings={appSettings} 
                                updateAppSettings={updateAppSettings}
                                t={t}
                                listKey={listKey}
                                onMove={handleMoveItem}
                            />
                        ) : (
                            <GroupNavItem 
                                group={item} 
                                allNavItems={allNavItems} 
                                appSettings={appSettings} 
                                updateAppSettings={updateAppSettings} 
                                t={t} 
                                onOpenGroupDialog={onOpenGroupDialog}
                                onDeleteGroup={handleDeleteGroup}
                                onDropToGroup={onDropToGroup}
                            />
                        )}
                    </Reorder.Item>
                ))}
                 {items.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg border-dashed">{t('empty_section')}</div>
                 )}
            </Reorder.Group>
        </div>
    );
};

const SimpleNavItem = ({ itemId, item, updateAppSettings, t, appSettings, listKey, onMove }: any) => {
    const controls = useDragControls();
    if (!item) return null;
    return (
        <div 
          className="flex items-center justify-between p-2 border rounded-lg bg-muted/30 hover:bg-muted/50"
          draggable
          onDragStart={(e) => { e.dataTransfer.setData('text/plain', itemId); e.stopPropagation(); }}
        >
          <div className="flex items-center gap-3">
              <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              {(() => {
                const Icon = item.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              <span className="font-medium text-sm">{t(item.title)}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
              <Switch 
                checked={appSettings.sidebarVisibility?.[item.title] ?? true} 
                onCheckedChange={(checked) => updateAppSettings({ sidebarVisibility: { ...appSettings.sidebarVisibility, [item.title]: checked } })} 
                disabled={item.title === 'settings'}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(itemId, listKey === 'topNavOrder' ? 'down' : 'up')}>
                  {listKey === 'topNavOrder' ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
              </Button>
          </div>
        </div>
    );
};

const GroupNavItem = ({ group, allNavItems, appSettings, updateAppSettings, t, onOpenGroupDialog, onDeleteGroup, onDropToGroup }: any) => {
    const controls = useDragControls();
    const [isDropTarget, setIsDropTarget] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDropTarget(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDropTarget(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDropTarget(false);
        const droppedItemId = e.dataTransfer.getData('text/plain');
        if (droppedItemId) {
            onDropToGroup(group, droppedItemId);
        }
    };

    const handleReorderChildren = (newList: string[]) => {
      const newTop = appSettings.topNavOrder.map((i: any) => (typeof i !== 'string' && i.id === group.id) ? { ...i, children: newList } : i);
      const newBottom = appSettings.bottomNavOrder.map((i: any) => (typeof i !== 'string' && i.id === group.id) ? { ...i, children: newList } : i);
      updateAppSettings({ topNavOrder: newTop, bottomNavOrder: newBottom });
      toast.success(t('sidebar_order_updated'), {
        duration: 5000
      });
    }

    const handleUnGroup = (childId: string) => {
        // Find which list the group is in
        const isInTop = appSettings.topNavOrder.some((item: any) => typeof item !== 'string' && item.id === group.id);

        // Remove from group
        const newChildren = group.children.filter((id: string) => id !== childId);
        
        let newTopOrder = appSettings.topNavOrder.map((item: any) => (typeof item !== 'string' && item.id === group.id) ? {...item, children: newChildren} : item);
        let newBottomOrder = appSettings.bottomNavOrder.map((item: any) => (typeof item !== 'string' && item.id === group.id) ? {...item, children: newChildren} : item);

        // Add to the appropriate main list
        if (isInTop) {
            newTopOrder = [...newTopOrder, childId];
        } else {
            newBottomOrder = [...newBottomOrder, childId];
        }
        
        updateAppSettings({ topNavOrder: newTopOrder, bottomNavOrder: newBottomOrder });
        toast.success(t('sidebar_order_updated'), {
          duration: 5000
        });
    };
    
    const openEditDialog = () => { onOpenGroupDialog(group); }

    return (
        <div
            className={cn("bg-muted/40 rounded-lg", isDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="p-2 flex flex-row items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none flex-shrink-0">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {(() => {
                          const Icon = iconMap[group.icon as GroupIconName] || FolderInput;
                          return <Icon className="h-5 w-5 text-teal-600 flex-shrink-0" />;
                        })()}
                        <span className="font-semibold text-sm truncate">{group.name}</span>
                    </div>
                     <div className="flex items-center gap-1 sm:gap-2 cursor-default flex-shrink-0 ml-4" onPointerDown={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-600/20 group text-teal-600" onClick={(e) => { e.stopPropagation(); openEditDialog();}}>
                          <Edit className="h-4 w-4 text-teal-600 transition-colors group-hover:text-white" />
                        </Button>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>{t('delete_group_title')}</AlertDialogTitle><AlertDialogDescription>{t('delete_group_desc')}</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteGroup(group)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="p-2 pl-4 pr-1">
                    <Reorder.Group axis="y" values={group.children} onReorder={handleReorderChildren} className="space-y-1">
                        <AnimatePresence>
                            {group.children.map((childId: string) => {
                                const childItem = allNavItems.get(childId);
                                if (!childItem) return null;
                                return (
                                    <Reorder.Item
                                      key={childId}
                                      value={childId}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex items-center justify-between p-2 border rounded-lg bg-background"
                                    >
                                        <div className="flex items-center gap-2 cursor-grab">
                                            <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none">
                                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            {(() => {
                                                const Icon = childItem.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
                                                return <Icon className="h-4 w-4 text-teal-600" />;
                                            })()}
                                            <span className="text-sm">{t(childItem.title)}</span>
                                        </div>
                                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleUnGroup(childId); }}>
                                            <Unlink className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    </Reorder.Item>
                                )
                            })}
                        </AnimatePresence>
                    </Reorder.Group>
                     {group.children.length === 0 && <p className="text-xs text-muted-foreground text-center p-2 border border-dashed rounded-md">{t('empty_group_message')}</p>}
                </CardContent>
            </Card>
        </div>
    )
};

const GroupEditorDialog = ({ isOpen, setIsOpen, group, updateAppSettings, appSettings, t, targetList }: any) => {
    const [name, setName] = useState(group?.name || '');
    const [icon, setIcon] = useState<GroupIconName>(group?.icon || 'Briefcase');

    const handleSave = () => {
        if (!name.trim()) {
            toast.error(t('group_name_required'), {
              duration: 5000
            });
            return;
        }

        if (group) { // Editing existing group
            const newTop = appSettings.topNavOrder.map((i: any) => (typeof i !== 'string' && i.id === group.id) ? { ...i, name, icon } : i);
            const newBottom = appSettings.bottomNavOrder.map((i: any) => (typeof i !== 'string' && i.id === group.id) ? { ...i, name, icon } : i);
            updateAppSettings({ topNavOrder: newTop, bottomNavOrder: newBottom });
            toast.success(t('group_updated'), {
              duration: 5000
            });
        } else { // Creating new group
            const newGroup: CustomNavGroup = {
                id: `custom-${Date.now()}`,
                type: 'group',
                name,
                icon,
                children: []
            };
            if (targetList === 'top') {
                 updateAppSettings({ topNavOrder: [...appSettings.topNavOrder, newGroup] });
            } else {
                 updateAppSettings({ bottomNavOrder: [...appSettings.bottomNavOrder, newGroup] });
            }
            toast.success(t('group_updated'), {
              duration: 5000
            });
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{group ? t('edit_group') : t('create_group')}</DialogTitle><DialogDescription>{group ? t('edit_group_desc') : t('create_group_desc')}</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="group-name">{t('group_name')}</Label>
                        <Input 
                            id="group-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            maxLength={20}
                            className="focus-visible:ring-teal-500"
                        />
                    </div>
                    <div className="space-y-2"><Label>{t('group_icon')}</Label>
                        <div className="grid grid-cols-5 gap-2 border p-2 rounded-md">
                            {AVAILABLE_GROUP_ICONS.map((iconName) => {
                              const IconComponent = iconMap[iconName]

                              return (
                                <Button 
                                  key={iconName} 
                                  variant="outline"
                                  size="icon" 
                                  onClick={() => setIcon(iconName)} 
                                  className={cn(
                                    "h-10 w-10 transition-colors group",
                                    icon === iconName 
                                      ? "bg-teal-600 border-teal-700 hover:bg-teal-700" 
                                      : "hover:bg-teal-600/20 hover:border-teal-600"
                                  )}
                                >

                                  <IconComponent
                                    className={cn(
                                      "h-5 w-5 transition-colors",
                                      icon === iconName ? "text-white" : "text-foreground group-hover:text-white"
                                    )}
                                  />
                                </Button>
                              );
                            })}
                        </div>
                    </div>
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline">{t('cancelButton')}</Button></DialogClose><Button onClick={handleSave} className="bg-teal-600 text-white hover:bg-teal-700">{t('saveChangesButton')}</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};





