import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupDetailHeader from './GroupDetailHeader';
import GroupTabs from './GroupTabs';
import ChatSection from './ChatSection';
import PlaceholderSection from './PlaceholderSection';

interface GroupDetailInterfaceProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
  currentUser: any;
}

export default function GroupDetailInterface({
  groupId,
  groupName,
  onBack,
  currentUser
}: GroupDetailInterfaceProps) {
  const [activeTab, setActiveTab] = useState('discussions');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discussions':
        return <ChatSection groupId={groupId} currentUser={currentUser} />;
      case 'events':
        return <PlaceholderSection title="Eventos" message="Funcionalidade em desenvolvimento" />;
      case 'members':
        return <PlaceholderSection title="Membros" message="Funcionalidade em desenvolvimento" />;
      case 'files':
        return <PlaceholderSection title="Arquivos" message="Funcionalidade em desenvolvimento" />;
      case 'about':
        return <PlaceholderSection title="Sobre" message="Funcionalidade em desenvolvimento" />;
      default:
        return <PlaceholderSection title="Discussões" message="Selecione uma aba" />;
    }
  };

  useEffect(() => {
    // Scroll to top when entering group interface
    window.scrollTo(0, 0);

    // Cleanup function para restaurar cabeçalho se componente for desmontado
    return () => {
      const headers = document.querySelectorAll('.groups-header, [data-testid="groups-header"], .turmas-header');
      if (headers.length > 0) {
        headers.forEach(header => {
          (header as HTMLElement).classList.remove('hidden');
          (header as HTMLElement).classList.add('visible');
        });
        console.log('Cabeçalho restaurado na limpeza do componente.');
      }
    };
  }, []);

  return (
    <div className="group-interface">
      <GroupDetailHeader groupName={groupName} onBack={onBack} />
      <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="group-content">
        {renderTabContent()}
      </div>
    </div>
  );
}