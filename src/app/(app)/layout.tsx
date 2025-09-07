
"use client";

import React, { Suspense, useEffect, useState } from 'react';

const LazySidebar = React.lazy(() => 
  import('@/components/layout/premium-sidebar').then(module => ({ default: module.PremiumSidebar }))
);

const LayoutInternal = ({ pageContent }: { pageContent: React.ReactNode}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Ultra-fluid scroll with consistent velocity throughout the page
    let animationFrame: number | null = null;
    let targetScrollTop = 0;
    let currentScrollTop = 0;
    let isScrollActive = false;
    let scrollTimeout: NodeJS.Timeout | null = null;
    let lastScrollTime = 0;
    let scrollVelocity = 0;

    const smoothScrollHandler = (e: WheelEvent) => {
      const target = e.target as Element;
      const mainContent = document.querySelector('.main-scroll-container');
      const sidebarScrollArea = document.querySelector('.sidebar-scroll-area');
      
      // Check if we're in sidebar - let it scroll naturally
      const isInSidebar = sidebarScrollArea && sidebarScrollArea.contains(target);
      if (isInSidebar) return;
      
      // Check if we're in main content
      const isInMainContent = mainContent && mainContent.contains(target);
      
      if (isInMainContent) {
        e.preventDefault();
        
        // Calculate velocity and direction
        const now = performance.now();
        const deltaTime = Math.max(now - lastScrollTime, 1);
        scrollVelocity = Math.abs(e.deltaY) / deltaTime;
        lastScrollTime = now;
        
        // Initialize scroll position if not active
        if (!isScrollActive) {
          currentScrollTop = mainContent.scrollTop;
          targetScrollTop = currentScrollTop;
        }
        
        // Fixed logic: Fast scroll = more distance, slow scroll = less distance
        let velocityMultiplier;
        if (scrollVelocity > 3) {
          // Very fast scroll = maximum distance per event
          velocityMultiplier = 4.0; // High multiplier for fast scrolling
        } else if (scrollVelocity > 1) {
          velocityMultiplier = 2.2; // Medium for moderate speed
        } else {
          velocityMultiplier = 1.2; // Lower for slow, precise scrolling
        }
        
        const scrollDelta = e.deltaY * velocityMultiplier;
        targetScrollTop += scrollDelta;
        
        // Clamp target within bounds
        const maxScroll = mainContent.scrollHeight - mainContent.clientHeight;
        targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));
        
        isScrollActive = true;
        
        // Clear any existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        
        // Cancel previous frame
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        
        const animate = () => {
          if (!mainContent || !isScrollActive) return;
          
          // Calculate distance to target
          const distance = targetScrollTop - currentScrollTop;
          const absDistance = Math.abs(distance);
          
          // FIXED: Consistent interpolation regardless of position or distance
          let interpolationFactor;
          if (scrollVelocity > 3) {
            // For very fast scroll, use higher factor but cap it to prevent slowdown
            interpolationFactor = Math.min(0.6, absDistance > 200 ? 0.6 : 0.45);
          } else if (scrollVelocity > 1) {
            interpolationFactor = 0.3; // Medium interpolation for moderate scroll
          } else {
            interpolationFactor = 0.15; // Slow, smooth interpolation for precise scroll
          }
          
          const step = distance * interpolationFactor;
          
          // If we're close enough, snap to target
          if (absDistance < 2.0) { // Increased threshold to prevent micro-animations
            currentScrollTop = targetScrollTop;
            mainContent.scrollTop = currentScrollTop;
            isScrollActive = false;
            return;
          }
          
          // Apply smooth step
          currentScrollTop += step;
          mainContent.scrollTop = currentScrollTop;
          
          // Continue animation
          animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Set timeout based on scroll speed - faster scroll needs longer animation time
        const timeoutDuration = scrollVelocity > 3 ? 150 : 100; // More time for fast scroll consistency
        scrollTimeout = setTimeout(() => {
          isScrollActive = false;
        }, timeoutDuration);
      }
    };

    // Use passive: false only for main content, passive: true for sidebar
    document.addEventListener('wheel', smoothScrollHandler, { passive: false });
    
    // Cleanup function
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      isScrollActive = false;
      document.removeEventListener('wheel', smoothScrollHandler);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Sidebar - Natural scroll behavior */}
      <div 
        className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto"
        style={{
          scrollBehavior: 'auto',
          overscrollBehavior: 'contain'
        }}
      >
        <Suspense fallback={<div className="w-72 h-full bg-muted animate-pulse border-r border-border/50" />}>
          {hasMounted ? <LazySidebar /> : null}
        </Suspense>
      </div>

      {/* Sidebar Edge Gradient */}
      <div className="premium-sidebar-edge fixed inset-y-0 z-40"></div>
      
      {/* Main Content Area - Maximum fluidity with hardware acceleration */}
      <div 
        className="flex-1 ml-72 h-screen overflow-y-auto relative main-scroll-container" 
        style={{
          overscrollBehavior: 'contain',
          willChange: 'scroll-position',
          transform: 'translate3d(0, 0, 0)',
          isolation: 'isolate'
        }}
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
