
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatSection from "./group-detail/ChatSection";

interface GroupInterfaceProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

export default function GroupInterface({ groupId, groupName, onBack }: GroupInterfaceProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      console.log('Obtendo usuário atual na interface do grupo...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return;
      }
      console.log('Usuário atual na interface do grupo:', user?.id);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    }
  };

  return (
    <div className="group-interface h-screen bg-[#001427] text-white flex flex-col">
      {/* Header */}
      <div className="group-header flex items-center p-4 border-b border-gray-600 bg-[#1a2a44] flex-shrink-0">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-xl font-bold text-[#FF6B00]">
          {groupName}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-600 bg-[#1a2a44] flex-shrink-0">
        <Button className="bg-[#FF6B00] text-white hover:bg-[#FF8C40]">
          Discussões
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-400 cursor-not-allowed opacity-60">
          Membros
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-400 cursor-not-allowed opacity-60">
          Tarefas
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-400 cursor-not-allowed opacity-60">
          Arquivos
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-400 cursor-not-allowed opacity-60">
          Configurações
        </Button>
      </div>

      {/* Chat Content */}
      <div className="group-content flex flex-col flex-1 min-h-0">
        {currentUser ? (
          <ChatSection groupId={groupId} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
