'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, User, ChevronDown, CreditCard, Settings, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Logo } from '@/components/logo';
import { sidebarConfig } from '@/config/sidebar';
import { type TranslationKey } from '@/config/locales';

interface ModernSidebarProps {
  children?: React.ReactNode;
}

const ModernSidebar = React.memo(({ children }: ModernSidebarProps) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex min-h-screen">
      <nav className="flex flex-col w-64 bg-background border-r">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span>CalendariA</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          {/* Main Navigation */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
              {t('main_navigation')}
            </h2>
            <nav className="space-y-1">
              {sidebarConfig.mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{t(item.title)}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Secondary Navigation */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
              {t('navigation_settings')}
            </h2>
            <nav className="space-y-1">
              {sidebarConfig.secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{t(item.title)}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>{user?.name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{user?.name || user?.email || t('user')}</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onSelect={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator className="my-4" />
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('themeTitle')}</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="ml-auto"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
});

ModernSidebar.displayName = 'ModernSidebar';

export { ModernSidebar };
