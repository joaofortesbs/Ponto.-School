
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupDetailHeader from './GroupDetailHeader';
import GroupTabs from './GroupTabs';
import ChatSection from './ChatSection';
import PlaceholderSection from './PlaceholderSection';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    validateAccess();
  }, [groupId, currentUser]);

  const validateAccess = async () => {
    try {
      console.log('Validando acesso ao grupo:', groupId, 'para usuário:', currentUser?.id);
      
      if (!currentUser || !currentUser.id) {
        console.error('Usuário não autenticado');
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        onBack();
        return;
      }

      // Verificação manual detalhada da membresia
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id);

      console.log('Resultado da verificação de membresia:', {
        membership,
        error: membershipError,
        groupId,
        userId: currentUser.id
      });

      if (membershipError) {
        console.error('Erro ao verificar membresia:', membershipError);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões de acesso",
          variant: "destructive"
        });
        onBack();
        return;
      }

      if (!membership || membership.length === 0) {
        console.log('Usuário não é membro do grupo');
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar este grupo",
          variant: "destructive"
        });
        onBack();
        return;
      }

      console.log('Acesso validado com sucesso');
      setHasAccess(true);
    } catch (error) {
      console.error('Erro na validação de acesso:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar acesso ao grupo",
        variant: "destructive"
      });
      onBack();
    } finally {
      setIsValidating(false);
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

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
        <p className="ml-4 text-white">Validando acesso ao grupo...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Acesso Negado</h2>
          <p className="mb-4">Você não tem permissão para acessar este grupo.</p>
          <Button onClick={onBack} className="bg-[#FF6B00] hover:bg-[#FF8C40]">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

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
