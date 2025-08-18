// src/app/(app)/dashboard/settings/types.ts

import { GroupIconName } from '@/config/sidebar';

export interface CustomNavGroup {
  id: string;
  type: 'group'; 
  name: string;
  icon: GroupIconName;
  children: string[];
}

export interface AppSettings {
  topNavOrder: (string | CustomNavGroup)[];
  bottomNavOrder: (string | CustomNavGroup)[];
  sidebarVisibility: Record<string, boolean>;
  fontSize: number;
  language: string;
  phoneCallAppointmentLabel: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}