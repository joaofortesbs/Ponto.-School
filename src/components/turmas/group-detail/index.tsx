import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Users, Calendar, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AjustesTab from './tabs/AjustesTab';
import GroupDetailHeader from './GroupDetailHeader';
import GroupTabs from './GroupTabs';
import ChatSection from './ChatSection';
import PlaceholderSection from './PlaceholderSection';

interface GroupDetailProps {
  group: {
    id: string;
    nome: string;
    descricao?: string;
    tipo_grupo?: string;
    disciplina_area?: string;
    topico_especifico?: string;
    tags?: string[];
    criador_id: string;
    created_at: string;
  };
  currentUser: any;
  onBack: () => void;
}

export default function GroupDetail({ group, currentUser, onBack }: GroupDetailProps) {
  const [activeTab, setActiveTab] = useState('discussions');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discussions':
        return <ChatSection groupId={group.id} currentUser={currentUser} />;
      case 'events':
        return <PlaceholderSection title="Eventos" message="Funcionalidade em desenvolvimento" />;
      case 'members':
        return <PlaceholderSection title="Membros" message="Funcionalidade em desenvolvimento" />;
      case 'files':
        return <PlaceholderSection title="Arquivos" message="Funcionalidade em desenvolvimento" />;
      case 'about':
        return (
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Sobre o Grupo</h3>
            <div className="bg-[#2a4066] rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300">Nome:</label>
                <p className="text-white">{group.nome}</p>
              </div>
              {group.descricao && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Descrição:</label>
                  <p className="text-white">{group.descricao}</p>
                </div>
              )}
              {group.tipo_grupo && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Tipo:</label>
                  <p className="text-white">{group.tipo_grupo}</p>
                </div>
              )}
              {group.disciplina_area && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Disciplina:</label>
                  <p className="text-white">{group.disciplina_area}</p>
                </div>
              )}
              {group.topico_especifico && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Tópico:</label>
                  <p className="text-white">{group.topico_especifico}</p>
                </div>
              )}
              {group.tags && group.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Tags:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {group.tags.map((tag, index) => (
                      <span key={index} className="bg-[#FF6B00] text-white px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-300">Criado em:</label>
                <p className="text-white">
                  {new Date(group.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        );
      case 'ajustes':
        return <AjustesTab 
          group={group} 
          onSave={(settings) => {
            console.log('Settings saved:', settings);
            // Recarregar dados do grupo após salvar
            if (typeof loadGroupData === 'function') {
              loadGroupData();
            }
          }}
          onUpdate={() => {
            console.log('Group data update requested');
            // Recarregar dados do grupo após atualização
            if (typeof loadGroupData === 'function') {
              loadGroupData();
            }
          }}
        />;
      default:
        return <PlaceholderSection title="Discussões" message="Selecione uma aba" />;
    }
  };

  return (
    <div className="group-interface h-screen flex flex-col">
      <GroupDetailHeader groupName={group.nome} onBack={onBack} />
      <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="group-content flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}