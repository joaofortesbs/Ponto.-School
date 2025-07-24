
import React from 'react';
import { FileText, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const AdminSidebar = () => {
  const menuItems = [
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      active: true,
    },
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-[#1E293B] border-r border-white/10 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                item.active
                  ? "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
