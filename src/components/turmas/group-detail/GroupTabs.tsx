import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Calendar, FileText, Info, Settings } from "lucide-react";

interface GroupTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function GroupTabs({ activeTab, onTabChange }: GroupTabsProps) {
  const tabs = [
    { id: 'discussions', label: 'Discussões', icon: MessageCircle },
    { id: 'members', label: 'Membros', icon: Users },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'files', label: 'Arquivos', icon: FileText },
    { id: 'about', label: 'Sobre', icon: Info },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            disabled={!tab.enabled}
            onClick={() => tab.enabled && onTabChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#FF6B00] text-white hover:bg-[#FF8C40]"
                : tab.enabled
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}