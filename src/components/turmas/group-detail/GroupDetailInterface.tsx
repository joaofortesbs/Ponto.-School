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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Função para abrir modal de configurações com segurança
  const handleSettingsClick = () => {
    try {
      console.log(`Abrindo modal de configurações para o grupo ${groupId}...`);
      setShowSettingsModal(true);
    } catch (error) {
      console.error(`Erro ao abrir modal de configurações para o grupo ${groupId}:`, error.message);
      alert('Erro ao abrir as configurações. Verifique o console.');
    }
  };

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
```import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupDetailHeader from './GroupDetailHeader';
import GroupTabs from './GroupTabs';
import ChatSection from './ChatSection';
import PlaceholderSection from './PlaceholderSection';
import GroupSettingsModal from './GroupSettingsModal';

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Função para abrir modal de configurações com segurança
  const handleSettingsClick = () => {
    try {
      console.log(`Abrindo modal de configurações para o grupo ${groupId}...`);
      setShowSettingsModal(true);
    } catch (error) {
      console.error(`Erro ao abrir modal de configurações para o grupo ${groupId}:`, error.message);
      alert('Erro ao abrir as configurações. Verifique o console.');
    }
  };

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
      <div className="tabs">
      <button
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              onClick={handleSettingsClick}
              id={`settings-button-${groupId}`}
            >
              Ajustes
            </button>
      </div>
      <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="group-content">
        {renderTabContent()}
      </div>
      {showSettingsModal && (
        <GroupSettingsModal
          isOpen={showSettingsModal}
          onClose={() => {
            console.log(`Fechando modal de configurações para o grupo ${groupId}`);
            setShowSettingsModal(false);
          }}
          group={
            {
              id: groupId,
              name: groupName
            }
          }
          onSave={(settings) => {
            console.log('Configurações salvas para o grupo:', groupId, settings);
            setShowSettingsModal(false);
            // Aqui você pode adicionar lógica para salvar as configurações no Supabase
          }}
        />
      )}
    </div>
  );
}