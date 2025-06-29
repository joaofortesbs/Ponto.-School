
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, CheckSquare, Calendar, FileText } from "lucide-react";

interface GroupTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function GroupTabs({ activeTab, onTabChange }: GroupTabsProps) {
  const tabs = [
    { id: 'discussions', label: 'Discussões', icon: MessageCircle, active: true },
    { id: 'members', label: 'Membros', icon: Users, active: false },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, active: false },
    { id: 'events', label: 'Eventos', icon: Calendar, active: false },
    { id: 'files', label: 'Arquivos', icon: FileText, active: false },
  ];

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={`rounded-none border-b-2 ${
              activeTab === tab.id 
                ? "border-[#FF6B00] bg-[#FF6B00] text-white" 
                : tab.active 
                  ? "border-transparent hover:border-[#FF6B00]/50 text-gray-700 dark:text-gray-300" 
                  : "border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
            }`}
            onClick={() => tab.active && onTabChange(tab.id)}
            disabled={!tab.active}
          >
            <Icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
