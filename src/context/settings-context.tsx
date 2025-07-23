
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { NAV_ITEMS } from '@/config/sidebar';

interface ConnectionDetail {
  connected: boolean;
  account: string | null;
}

interface WhatsAppConnectionDetail extends ConnectionDetail {
  active?: boolean;
}

interface ConnectionsState {
  gmail: ConnectionDetail;
  outlook: ConnectionDetail;
  whatsapp: WhatsAppConnectionDetail;
  phone: ConnectionDetail;
}

export interface CustomNavGroup {
  id: string; // e.g., 'custom-162...
  type: 'group';
  name: string;
  icon: string; // name of lucide-react icon
  children: string[]; // array of nav item ids
}

interface AppSettings {
  phoneCallAppointmentLabel: string;
  topNavOrder: (string | CustomNavGroup)[];
  bottomNavOrder: (string | CustomNavGroup)[];
  sidebarVisibility: Record<string, boolean>;
  showNotificationBadge: boolean;
  fontSize: number;
  language: string;
}

const defaultTopNavOrder: (string | CustomNavGroup)[] = [
  'inbox', 'calendar', 'phone-calls', 'notifications', 'contacts', 'tasks', 'chat', 'time-tracking',
  {
    id: 'human-resources',
    type: 'group',
    name: 'Human Resources',
    icon: 'Briefcase',
    children: ['leave', 'payroll'],
  },
];
const defaultBottomNavOrder: (string | CustomNavGroup)[] = [
  {
    id: 'management',
    type: 'group',
    name: 'Management',
    icon: 'Settings2',
    children: ['team_management', 'role_management', 'services', 'online-booking'],
  },
  'ai_logs', 'settings', 'suggestions', 'assistant'
];

const defaultAppSettings: AppSettings = {
  phoneCallAppointmentLabel: 'Appointment',
  topNavOrder: defaultTopNavOrder,
  bottomNavOrder: defaultBottomNavOrder,
  sidebarVisibility: NAV_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
  showNotificationBadge: true,
  fontSize: 105,
  language: 'en',
};

const defaultConnections: ConnectionsState = {
  gmail: { connected: true, account: 'default_user@gmail.com' },
  outlook: { connected: false, account: null },
  whatsapp: { connected: false, account: null, active: false },
  phone: { connected: false, account: null },
};

interface SettingsContextType {
  connections: ConnectionsState;
  appSettings: AppSettings;
  updateConnection: (service: keyof ConnectionsState, status: Partial<ConnectionDetail | WhatsAppConnectionDetail>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  isSettingsLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [connections, setConnections] = useState<ConnectionsState>(defaultConnections);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    // Load connections from local storage
    const storedConnections = localStorage.getItem('calendaria-connections');
    if (storedConnections) {
      const loaded = JSON.parse(storedConnections);
      const mergedConnections = { ...defaultConnections, ...loaded };
      setConnections(mergedConnections);
    }
    
    // Load app settings from local storage and reconcile them
    const storedAppSettings = localStorage.getItem('calendaria-app-settings');
    if (storedAppSettings) {
      const loaded = JSON.parse(storedAppSettings);
      
      // Start with default settings and merge loaded ones
      const mergedAppSettings: AppSettings = { ...defaultAppSettings, ...loaded };

      const allNavIds = new Set(NAV_ITEMS.map(item => item.id));
      const seenIds = new Set<string>();

      // Filter function to remove duplicates and invalid items from any list
      const filterAndTrack = (item: string | CustomNavGroup) => {
        const id = typeof item === 'string' ? item : item.id;
        
        if (!id || seenIds.has(id)) return false;
        
        if (typeof item === 'string') {
            if (!allNavIds.has(item)) return false;
        } else if (item.type !== 'group') {
            return false;
        }

        seenIds.add(id);
        
        // If it's a group, sanitize its children
        if (typeof item !== 'string' && item.type === 'group') {
            const childSeenIds = new Set<string>();
            item.children = item.children.filter(childId => {
                if(allNavIds.has(childId) && !seenIds.has(childId) && !childSeenIds.has(childId)) {
                    seenIds.add(childId);
                    childSeenIds.add(childId);
                    return true;
                }
                return false;
            });
        }
        return true;
      };
      
      let reconciledTopOrder = Array.isArray(mergedAppSettings.topNavOrder) 
        ? mergedAppSettings.topNavOrder.filter(filterAndTrack) 
        : defaultTopNavOrder;
        
      let reconciledBottomOrder = Array.isArray(mergedAppSettings.bottomNavOrder)
        ? mergedAppSettings.bottomNavOrder.filter(filterAndTrack)
        : defaultBottomNavOrder;
      
      // Add back any items that are completely missing after sanitization
      const missingNavItems = NAV_ITEMS.filter(item => !seenIds.has(item.id));
      if (missingNavItems.length > 0) {
        const defaultBottomIds = new Set(defaultBottomNavOrder.map(item => typeof item === 'string' ? item : item.id));
        missingNavItems.forEach(item => {
          if (defaultBottomIds.has(item.id)) {
            reconciledBottomOrder.push(item.id);
          } else {
            reconciledTopOrder.push(item.id);
          }
        });
      }
      
      mergedAppSettings.topNavOrder = reconciledTopOrder;
      mergedAppSettings.bottomNavOrder = reconciledBottomOrder;
      mergedAppSettings.sidebarVisibility = {
        ...defaultAppSettings.sidebarVisibility,
        ...(loaded.sidebarVisibility || {})
      };
      
      setAppSettings(mergedAppSettings);

    } else {
      setAppSettings(defaultAppSettings);
    }

    setIsSettingsLoaded(true);
  }, []);

  const updateConnection = useCallback((
    service: keyof ConnectionsState,
    status: Partial<ConnectionDetail | WhatsAppConnectionDetail>
  ) => {
    setConnections(prev => ({
      ...prev,
      [service]: { ...prev[service], ...status },
    }));
  }, []);

  const updateAppSettings = useCallback((settings: Partial<AppSettings>) => {
    setAppSettings(prev => {
        const newSettings = { ...prev, ...settings };
        if(isSettingsLoaded) {
           localStorage.setItem('calendaria-app-settings', JSON.stringify(newSettings));
           localStorage.setItem('calendaria-connections', JSON.stringify(connections));
        }
        return newSettings;
    });
  }, [isSettingsLoaded, connections]);

  const contextValue = useMemo(() => ({
    connections,
    appSettings,
    updateConnection,
    updateAppSettings,
    isSettingsLoaded
  }), [connections, appSettings, updateConnection, updateAppSettings, isSettingsLoaded]);


  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
