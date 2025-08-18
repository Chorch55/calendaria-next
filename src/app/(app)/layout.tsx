
"use client";

import React, { Suspense, useEffect, useState } from 'react';

const LazySidebar = React.lazy(() => 
  import('@/components/layout/premium-sidebar').then(module => ({ default: module.PremiumSidebar }))
);

const LayoutInternal = ({ pageContent }: { pageContent: React.ReactNode}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Asegurar que el scroll siempre funcione en el contenido principal
    const handleWheel = (e: WheelEvent) => {
      const mainContent = document.querySelector('.main-scroll-container');
      if (mainContent && !e.defaultPrevented) {
        // Velocidad de scroll estándar web (sin multiplicador artificial)
        mainContent.scrollTop += e.deltaY;
      }
    };

    // Agregar listener global para scroll
    document.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72">
        <Suspense fallback={<div className="w-72 h-full bg-muted animate-pulse border-r border-border/50" />}>
          {hasMounted ? <LazySidebar /> : null}
        </Suspense>
      </div>

      {/* Sidebar Edge Gradient */}
      <div className="premium-sidebar-edge fixed inset-y-0 z-40"></div>
      
      {/* Main Content Area - Clean without overlapping gradients */}
      <div 
        className="flex-1 ml-72 h-screen overflow-y-auto relative main-scroll-container" 
        style={{ scrollBehavior: 'smooth', pointerEvents: 'auto' }}
        onWheel={(e) => {
          // Asegurar que el scroll siempre funcione
          e.stopPropagation();
        }}
      >
        <div className="min-h-screen">
          <div className="p-6 bg-background">
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
