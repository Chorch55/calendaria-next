
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LazySidebar = React.lazy(() => 
  import('@/components/layout/modern-sidebar').then(module => ({ default: module.ModernSidebar }))
);

const LazyFloatingNotifications = React.lazy(() => 
  import('@/components/notifications/floating-notification-bell').then(module => ({ default: module.FloatingNotificationBell }))
);

const PageSkeleton = () => (
  <div className="flex h-screen">
    <div className="hidden sm:block p-2 border-r">
        <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-[240px]" />
            <Skeleton className="h-8 w-[240px] mt-4" />
            <Skeleton className="h-8 w-[240px]" />
            <Skeleton className="h-8 w-[240px]" />
            <Skeleton className="h-8 w-[240px]" />
        </div>
    </div>
    <div className="flex-1 p-6 space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
       <div className="grid gap-6 lg:grid-cols-2">
         <Skeleton className="h-64" />
         <Skeleton className="h-64" />
      </div>
    </div>
  </div>
);

const LayoutInternal = ({ pageContent }: { pageContent: React.ReactNode}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Suspense fallback={<div className="w-64 h-full bg-muted animate-pulse" />}>
        {hasMounted ? <LazySidebar /> : null}
      </Suspense>
      <main className="flex-1 p-6 overflow-auto relative">
        <Suspense fallback={<PageSkeleton />}>
          {pageContent}
        </Suspense>
      </main>
      <Suspense fallback={null}>
        {hasMounted ? <LazyFloatingNotifications /> : null}
      </Suspense>
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
