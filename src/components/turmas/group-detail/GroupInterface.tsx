
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupInterfaceProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
  currentUser: any;
}

interface Message {
  id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    email?: string;
  };
}

export default function GroupInterface({ groupId, groupName, onBack, currentUser }: GroupInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !groupId) return;

    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId, currentUser]);

  const loadMessages = async () => {
    if (!currentUser || !groupId) return;

    try {
      setIsLoading(true);
      console.log('Carregando mensagens para grupo:', groupId);

      const { data, error } = await supabase
        .from('mensagens')
        .select(`
          id,
          conteudo,
          created_at,
          user_id,
          profiles!inner(display_name, email)
        `)
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar mensagens do chat",
          variant: "destructive"
        });
        return;
      }

      setMessages(data || []);
      console.log('Mensagens carregadas:', data?.length || 0);

    } catch (error) {
      console.error('Erro inesperado ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser || !groupId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Configurando Realtime para grupo:', groupId);
    
    const channel = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `grupo_id=eq.${groupId}`
      }, async (payload) => {
        console.log('Nova mensagem recebida:', payload);
        
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage: Message = {
            ...payload.new,
            profiles: userProfile || { display_name: 'Usuário', email: '' }
          };

          setMessages(prev => [...prev, newMessage]);
        } catch (error) {
          console.error('Erro ao processar nova mensagem:', error);
        }
      })
      .subscribe((status) => {
        console.log('Status Realtime:', status);
      });

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !currentUser || !groupId) return;

    setIsLoading(true);
    try {
      console.log('Enviando mensagem para grupo:', groupId);
      
      const { error } = await supabase
        .from('mensagens')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id,
          conteudo: newMessage.trim()
        });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      console.log('Mensagem enviada com sucesso');
      
    } catch (error) {
      console.error('Erro inesperado ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (message: Message) => {
    if (message.user_id === currentUser?.id) {
      return 'Você';
    }
    return message.profiles?.display_name || message.profiles?.email || 'Usuário';
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <p>Faça login para acessar o chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#001427]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-600">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-xl font-bold text-[#FF6B00]">
          {groupName}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-600">
        <Button
          variant="default"
          className="bg-[#FF6B00] text-white hover:bg-[#FF8C40]"
        >
          Discussões
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-500">
          Anúncios
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-500">
          Tarefas
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-500">
          Membros
        </Button>
        <Button variant="outline" disabled className="border-gray-600 text-gray-500">
          Arquivos
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              <p>Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Nenhuma mensagem ainda. Seja o primeiro a conversar!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.user_id === currentUser?.id ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#FF6B00] text-sm">
                    {getUserDisplayName(message)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.user_id === currentUser?.id
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-[#2a4066] text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.conteudo}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-600">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 bg-[#1a2a44] border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim()}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
