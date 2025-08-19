
"use client";

import React, { Suspense, useEffect, useState } from 'react';

const LazySidebar = React.lazy(() => 
  import('@/components/layout/premium-sidebar').then(module => ({ default: module.PremiumSidebar }))
);

const LayoutInternal = ({ pageContent }: { pageContent: React.ReactNode}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Sidebar-specific scroll handler
    const handleSidebarWheel = (e: WheelEvent) => {
      const target = e.target as Element;
      const sidebarScrollArea = document.querySelector('.sidebar-scroll-area');
      
      if (sidebarScrollArea && sidebarScrollArea.contains(target)) {
        e.preventDefault();
        
        // Custom scroll speed for sidebar to match main content better
        const scrollAmount = e.deltaY * 0.8; // Slightly slower than default
        
        sidebarScrollArea.scrollTo({
          top: sidebarScrollArea.scrollTop + scrollAmount,
          behavior: 'auto'
        });
      }
    };
    
    // Main content scroll handler
    const handleMainContentWheel = (e: WheelEvent) => {
      const target = e.target as Element;
      const mainContent = document.querySelector('.main-scroll-container');
      
      // Get all possible sidebar elements
      const sidebarElements = [
        document.querySelector('.fixed.inset-y-0.left-0.z-50'),
        document.querySelector('.premium-sidebar'),
        document.querySelector('.sidebar-scroll-area'),
        document.querySelector('[class*="sidebar"]')
      ].filter(Boolean);
      
      // Check if the scroll event is happening within any sidebar component
      const isTargetInSidebar = sidebarElements.some(sidebar => 
        sidebar && sidebar.contains(target)
      );
      
      // Additional check: if the target is within the first 288px (sidebar width)
      const rect = (target as HTMLElement).getBoundingClientRect();
      const isInSidebarArea = rect.left < 288; // w-72 = 288px
      
      // Only apply custom scroll if we're clearly in the main content area
      if (mainContent && !e.defaultPrevented && !isTargetInSidebar && !isInSidebarArea) {
        const isTargetInMainContent = mainContent.contains(target);
        
        if (isTargetInMainContent) {
          e.preventDefault();
          
          // Slightly increase scroll speed to match sidebar better (reduced from 1.2 to 1.05)
          const scrollAmount = e.deltaY * 1.05;
          
          // Smooth scroll animation
          mainContent.scrollTo({
            top: mainContent.scrollTop + scrollAmount,
            behavior: 'auto'
          });
        }
      }
    };

    // Add event listeners - sidebar first for priority
    document.addEventListener('wheel', handleSidebarWheel, { passive: false, capture: true });
    document.addEventListener('wheel', handleMainContentWheel, { passive: false, capture: false });
    
    return () => {
      document.removeEventListener('wheel', handleSidebarWheel);
      document.removeEventListener('wheel', handleMainContentWheel);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto">
        <Suspense fallback={<div className="w-72 h-full bg-muted animate-pulse border-r border-border/50" />}>
          {hasMounted ? <LazySidebar /> : null}
        </Suspense>
      </div>

      {/* Sidebar Edge Gradient */}
      <div className="premium-sidebar-edge fixed inset-y-0 z-40"></div>
      
      {/* Main Content Area - Clean without overlapping gradients */}
      <div 
        className="flex-1 ml-72 h-screen overflow-y-auto relative main-scroll-container" 
      >
        <div className="min-h-screen">
          <div className="p-6 pt-8 bg-background">
            {pageContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutInternal pageContent={children} />
  );
}
