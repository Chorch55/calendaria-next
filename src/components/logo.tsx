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
      className={`flex items-center justify-center space-x-2 text-2xl font-bold text-primary w-full ${className}`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
      >
        {/* Binder rings */}
        <rect x="30" y="5" width="10" height="15" rx="5" fill="#0891b2" />
        <rect x="60" y="5" width="10" height="15" rx="5" fill="#0891b2" />
        
        {/* Main calendar body */}
        <rect x="10" y="15" width="80" height="80" rx="15" fill="#0891b2" />
        
        {/* AI Sparkle, centered */}
        <g transform="translate(38, 43) scale(0.8)">
            <path
            d="M20.5,0,25,12.5,37.5,16,25,19.5,20.5,32,16,19.5,3.5,16,16,12.5Z"
            fill="#f59e0b"
            />
        </g>
      </svg>
      <span className="group-data-[collapsible=icon]:hidden">{/* This will hide text when sidebar uses collapsible="icon" and is collapsed */}
        Calendar<span className="text-amber-500">IA</span>
      </span>
    </Link>
  );
}
