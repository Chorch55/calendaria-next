
import { 
  Calendar, 
  Users,
  PhoneCall, 
  Inbox,
  Settings,
  CreditCard,
  Contact,
  Bot,
  CheckSquare,
  Clock,
  HelpCircle
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type SidebarConfig = {
  mainNav: NavItem[];
  secondaryNav: NavItem[];
};

export const sidebarConfig: SidebarConfig = {
  mainNav: [
    {
      title: 'calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
    {
      title: 'inbox',
      href: '/dashboard/inbox',
      icon: Inbox,
    },
    {
      title: 'contacts',
      href: '/dashboard/contacts',
      icon: Contact,
    },
    {
      title: 'phone_calls',
      href: '/dashboard/phone-calls',
      icon: PhoneCall,
    },
    {
      title: 'tasks',
      href: '/dashboard/tasks',
      icon: CheckSquare,
    },
    {
      title: 'team',
      href: '/dashboard/team',
      icon: Users,
    },
    {
      title: 'time_tracking',
      href: '/dashboard/time-tracking',
      icon: Clock,
    },
    {
      title: 'assistant',
      href: '/dashboard/assistant',
      icon: Bot,
    }
  ],
  secondaryNav: [
    {
      title: 'settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      title: 'billing',
      href: '/dashboard/billing',
      icon: CreditCard,
    },
    {
      title: 'help',
      href: '/dashboard/help',
      icon: HelpCircle,
    }
  ]
};

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
