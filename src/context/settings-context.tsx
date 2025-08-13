
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { sidebarConfig } from '@/config/sidebar';
import { AppSettings } from '@/config/types';

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

const defaultAppSettings: AppSettings = {
  phoneCallAppointmentLabel: 'Appointment',
  sidebarVisibility: {},  // Will be populated with the sidebar items
  showNotificationBadge: true,
  fontSize: 105,
  language: 'en',
  topNavOrder: [],
  bottomNavOrder: []
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
    
    // Initialize visibility state for all current sidebar items
    const currentItems = [...sidebarConfig.mainNav, ...sidebarConfig.secondaryNav];
    const defaultVisibility = currentItems.reduce((acc, item) => ({
      ...acc,
      [item.title]: true
    }), {});

    if (storedAppSettings) {
      const loaded = JSON.parse(storedAppSettings);
      
      // Load and merge app settings
      const mergedAppSettings: AppSettings = {
        ...defaultAppSettings,
        ...loaded,
        // Ensure sidebarVisibility has all current items while preserving saved states
        sidebarVisibility: {
          ...defaultVisibility,
          ...(loaded.sidebarVisibility || {})
        }
      };
      
      setAppSettings(mergedAppSettings);
    } else {
      setAppSettings({
        ...defaultAppSettings,
        sidebarVisibility: defaultVisibility
      });
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
