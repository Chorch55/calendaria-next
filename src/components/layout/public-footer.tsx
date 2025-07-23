import React from 'react';

export function PublicFooter() {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        © {new Date().getFullYear()} CalendarIA. All rights reserved.
      </div>
    </footer>
  );
}
