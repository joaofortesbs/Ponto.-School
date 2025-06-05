
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  mensagem: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    email?: string;
  };
}

interface ChatSectionProps {
  groupId: string;
  currentUser: any;
}

export default function ChatSection({ groupId, currentUser }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Removendo canal Realtime:', channelRef.current);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando mensagens para grupo:', groupId);

      // Primeiro, carregar apenas as mensagens sem fazer join com profiles
      const { data: messagesData, error: messagesError } = await supabase
        .from('mensagens_grupos')
        .select('id, mensagem, created_at, user_id')
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Erro ao carregar mensagens:', messagesError);
        toast({
          title: "Erro",
          description: "Erro ao carregar mensagens",
          variant: "destructive"
        });
        return;
      }

      console.log('Mensagens carregadas:', messagesData?.length || 0);

      // Se não há mensagens, definir array vazio
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Depois, carregar os perfis dos usuários separadamente
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erro ao carregar perfis:', profilesError);
        // Continuar sem os perfis se houver erro
      }

      // Combinar mensagens com perfis
      const messagesWithProfiles = messagesData.map(message => ({
        ...message,
        profiles: profilesData?.find(profile => profile.id === message.user_id) || {
          display_name: 'Usuário',
          email: ''
        }
      }));

      console.log('Mensagens com perfis:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Limpar canal existente se houver
    if (channelRef.current) {
      console.log('Removendo canal existente:', channelRef.current);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Configurando novo canal Realtime para grupo:', groupId);
    
    const channel = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_grupos',
        filter: `grupo_id=eq.${groupId}`
      }, async (payload) => {
        console.log('Nova mensagem recebida:', payload);
        
        // Buscar dados do usuário que enviou a mensagem
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', payload.new.user_id)
          .single();

        const newMessage: ChatMessage = {
          ...payload.new,
          profiles: userProfile || { display_name: 'Usuário', email: '' }
        };

        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe((status) => {
        console.log('Status da assinatura Realtime:', status);
      });

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !currentUser) return;

    setIsLoading(true);
    try {
      console.log('Enviando mensagem para grupo:', groupId);
      
      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id,
          mensagem: newMessage.trim()
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
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
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

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.user_id === currentUser?.id) {
      return 'Você';
    }
    return message.profiles?.display_name || message.profiles?.email || 'Usuário';
  };

  return (
    <div className="chat-section h-full flex flex-col">
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3">
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
              className={`chat-message ${
                message.user_id === currentUser?.id ? 'own-message' : 'other-message'
              }`}
            >
              <div className="message-header flex items-center gap-2 mb-1">
                <span className="sender font-medium text-[#FF6B00]">
                  {getUserDisplayName(message)}
                </span>
                <span className="timestamp text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="message-content bg-[#2a4066] rounded-lg p-3">
                <p className="text-white text-sm whitespace-pre-wrap">
                  {message.mensagem}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input p-4 border-t border-gray-600">
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
  );
}
