
import React from 'react';
import { Mail, CalendarDays, Phone, ListChecks, Lightbulb, BarChartHorizontalBig, Bot, Users, UserCog, Clock, Settings, Brain, Settings2, Briefcase, FileText, DollarSign, Target, Folder, Book, Star, Home, MessageSquare, Lock, Globe, BarChart3, Plane, Activity, FileDigit, Wallet, Bell, BookOpen } from 'lucide-react';

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  isNotification?: boolean; // Flag to identify the notification item
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'inbox', href: '/dashboard/inbox', label: 'Inbox', icon: React.createElement(Mail) },
  { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: React.createElement(CalendarDays) },
  { id: 'phone-calls', href: '/dashboard/phone-calls', label: 'Phone Calls', icon: React.createElement(Phone) },
  { id: 'notifications', href: '#', label: 'Notifications', icon: React.createElement(Bell), isNotification: true },
  { id: 'contacts', href: '/dashboard/contacts', label: 'Contacts', icon: React.createElement(Users) },
  { id: 'tasks', href: '/dashboard/tasks', label: 'Tasks', icon: React.createElement(ListChecks) },
  { id: 'chat', href: '/dashboard/chat', label: 'Chat', icon: React.createElement(MessageSquare) },
  { id: 'leave', href: '/dashboard/leave', label: 'Vacaciones y Ausencias', icon: React.createElement(Plane) },
  { id: 'payroll', href: '/dashboard/payroll', label: 'Payroll', icon: React.createElement(FileDigit) },
  { id: 'activity-log', href: '/dashboard/activity-log', label: 'Activity Log', icon: React.createElement(Activity) },
  { id: 'time-tracking', href: '/dashboard/time-tracking', label: 'Time Tracking', icon: React.createElement(Clock) },
  { id: 'team_management', href: '/dashboard/team', label: 'Team Management', icon: React.createElement(Users) },
  { id: 'role_management', href: '/dashboard/roles', label: 'Role Management', icon: React.createElement(UserCog) },
  { id: 'services', href: '/dashboard/services', label: 'Booking Settings', icon: React.createElement(Briefcase) },
  { id: 'online-booking', href: '/dashboard/online-booking', label: 'Online Booking', icon: React.createElement(BookOpen) },
  { id: 'ai_logs', href: '/dashboard/logs', label: 'AI Logs', icon: React.createElement(Brain) },
  { id: 'assistant', href: '/dashboard/assistant', label: 'Assistant', icon: React.createElement(Bot) },
  { id: 'suggestions', href: '/dashboard/suggestions', label: 'Suggestions', icon: React.createElement(Lightbulb) },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: React.createElement(Settings) },
];

export const AVAILABLE_GROUP_ICONS = [
  'Briefcase', 'FileText', 'DollarSign', 'Target', 'Folder', 
  'Book', 'Star', 'Users', 'Home', 'MessageSquare', 'Settings2',
  'Lock', 'Globe', 'BarChart3', 'Brain'
] as const;

export type GroupIconName = typeof AVAILABLE_GROUP_ICONS[number];

import {
  Briefcase as BriefcaseIcon,
  FileText as FileTextIcon,
  DollarSign as DollarSignIcon,
  Target as TargetIcon,
  Folder as FolderIcon,
  Book as BookIcon,
  Star as StarIcon,
  Users as UsersIcon,
  Home as HomeIcon,
  MessageSquare as MessageSquareIcon,
  Settings2 as Settings2Icon,
  Lock as LockIcon,
  Globe as GlobeIcon,
  BarChart3 as BarChart3Icon,
  Brain as BrainIcon
} from 'lucide-react';

export const iconMap: Record<GroupIconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Briefcase: BriefcaseIcon,
  FileText: FileTextIcon,
  DollarSign: DollarSignIcon,
  Target: TargetIcon,
  Folder: FolderIcon,
  Book: BookIcon,
  Star: StarIcon,
  Users: UsersIcon,
  Home: HomeIcon,
  MessageSquare: MessageSquareIcon,
  Settings2: Settings2Icon,
  Lock: LockIcon,
  Globe: GlobeIcon,
  BarChart3: BarChart3Icon,
  Brain: BrainIcon
};
