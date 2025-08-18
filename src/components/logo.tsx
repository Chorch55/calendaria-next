"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Logo({ className, href = '/' }: { className?: string, href?: string }) {
  const pathname = usePathname();

  const smoothScrollToTop = (duration: number) => {
    const startPosition = window.pageYOffset;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, -startPosition, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we are on the page the link goes to, scroll to top instead of navigating.
    if (pathname === href) {
      e.preventDefault();
      // Use custom smooth scroll for controlled speed
      smoothScrollToTop(1000);
    }
    // Otherwise, let the Link component handle the navigation as usual.
  };
  
  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`flex items-center justify-center space-x-3 w-full ${className}`}
    >
      <div className="relative">
        {/* Minimal geometric logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 bg-white/20 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur-sm opacity-50 -z-10"></div>
      </div>
      
      <span className="group-data-[collapsible=icon]:hidden font-light text-2xl tracking-wide">
        <span className="text-slate-700 dark:text-slate-200">Calendar</span>
        <span className="text-blue-500 font-medium">IA</span>
      </span>
    </Link>
  );
}
