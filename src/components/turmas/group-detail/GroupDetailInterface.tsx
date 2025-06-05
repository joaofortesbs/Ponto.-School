
import React, { useState } from 'react';
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
