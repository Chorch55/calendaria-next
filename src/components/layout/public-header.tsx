
"use client";

import React from 'react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useSettings } from '@/context/settings-context';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { appSettings, updateAppSettings } = useSettings();
  const { language } = appSettings;
  const { setTheme } = useTheme();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, '');
    
    // Si no estamos en la página principal, navegar primero a ella
    if (pathname !== '/') {
      window.location.href = `/#${targetId}`;
      return;
    }
    
    const elem = document.getElementById(targetId);
    
    if (elem) {
        const smoothScrollToElement = (element: HTMLElement, duration: number, offset: number = 0) => {
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime: number | null = null;
        
            const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            };
        
            const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
        
            requestAnimationFrame(animation);
        }
        // h-16 = 4rem = 64px offset for the sticky header  
        smoothScrollToElement(elem, 1000, 64);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  const navItems = (
    <>
        <>
          <Link href="/#features" onClick={handleScroll} className="text-base font-medium text-foreground transition-colors hover:text-primary">
            {t('features')}
          </Link>
          <Link href="/#pricing" onClick={handleScroll} className="text-base font-medium text-foreground transition-colors hover:text-primary">
            {t('pricing')}
          </Link>
        </>
      <Link href="/#contact" onClick={handleScroll} className="text-base font-medium text-foreground transition-colors hover:text-primary">
        {t('contact')}
      </Link>
    </>
  );
  
  const mobileNavItems = (
    <>
        <>
          <Link href="/#features" onClick={handleScroll} className="text-lg font-medium text-foreground transition-colors hover:text-primary">
            {t('features')}
          </Link>
          <Link href="/#pricing" onClick={handleScroll} className="text-lg font-medium text-foreground transition-colors hover:text-primary">
            {t('pricing')}
          </Link>
        </>
      <Link href="/#contact" onClick={handleScroll} className="text-lg font-medium text-foreground transition-colors hover:text-primary">
        {t('contact')}
      </Link>
    </>
  );

  const LanguageSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {currentLanguage.code.toUpperCase()}
          <span className="ml-2 text-lg">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onSelect={() => updateAppSettings({ language: lang.code })}>
            <span>{lang.name}</span>
            <span className="ml-auto text-lg">{lang.flag}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  const ThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center px-2 sm:px-4 md:px-6 lg:px-8">
        
        {/* Left item: Logo */}
        <div className="flex items-center gap-6">
            <Logo />
        </div>

        {/* Center item: Nav links - hidden on mobile */}
        <nav className="hidden md:flex md:items-center md:justify-center md:space-x-4 lg:space-x-6 flex-1 mx-4">
            {navItems}
        </nav>
        
        {/* Right Grouping: Actions and Mobile Menu */}
        <div className="flex items-center justify-end space-x-2 md:space-x-4 ml-auto min-w-[200px] sm:min-w-[250px] md:min-w-[300px]">
          {/* Desktop actions - hide on small screens */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-3">
            {/* Theme and Language grouped together */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
            
            {/* Auth buttons with reduced text size on smaller screens */}
            <Button 
              variant="outline" 
              asChild 
              className="hidden lg:inline-flex whitespace-nowrap border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-sm"
            >
              <Link href="/auth/login-mt">{t('login')}</Link>
            </Button>
            <Button 
              asChild 
              className="hidden lg:inline-flex whitespace-nowrap bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300 border-0 text-sm"
            >
              <Link href="/auth/signup-mt">{t('signup')}</Link>
            </Button>
          </div>

          {/* Mobile Menu - show on small screens */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-8 pt-12">
                  {mobileNavItems}
                  <div className="mt-6 flex flex-col gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/auth/login-mt">{t('login')}</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth/signup-mt">{t('signup')}</Link>
                    </Button>
                  </div>
                  <div className="mt-8 border-t pt-6 flex items-center justify-center gap-4">
                     <ThemeToggle />
                     <LanguageSelector />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
    </header>
  );
}
