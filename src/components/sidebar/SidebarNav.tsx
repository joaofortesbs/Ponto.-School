
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  className?: string;
  children?: React.ReactNode;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ className, children }) => {
  return (
    <nav className={cn("sidebar-nav", className)}>
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem'
        }}
      >
        {children}
      </div>
    </nav>
  );
};

export default SidebarNav;
