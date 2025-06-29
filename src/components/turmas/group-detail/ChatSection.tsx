
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatSectionProps {
  groupId: string;
  currentUser: any;
}

interface Message {
  id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
}

export default function ChatSection({ groupId, currentUser }: ChatSectionProps) {
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
    if (currentUser && groupId) {
      loadMessages();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUser, groupId]);

  const loadMessages = async () => {
    try {
      console.log(`Carregando mensagens do grupo: ${groupId}`);
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('id, user_id, conteudo, created_at')
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar mensagens",
          variant: "destructive"
        });
        return;
      }

      console.log(`Mensagens carregadas: ${data?.length || 0}`);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log(`Configurando realtime para grupo: ${groupId}`);
    
    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `grupo_id=eq.${groupId}`
      }, (payload) => {
        console.log('Nova mensagem recebida:', payload);
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !currentUser) return;

    setIsLoading(true);
    try {
      console.log(`Enviando mensagem no grupo: ${groupId}`);
      
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

      console.log('Mensagem enviada com sucesso');
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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

  const getUserDisplayName = (userId: string) => {
    if (userId === currentUser?.id) {
      return 'Você';
    }
    return userId.substring(0, 8) + '...';
  };

  return (
    <div className="chat-section h-full flex flex-col">
      {/* Messages Area */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3 bg-[#001427]">
        {messages.length === 0 ? (
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
                  {getUserDisplayName(message.user_id)}
                </span>
                <span className="timestamp text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="message-content bg-[#2a4066] rounded-lg p-3">
                <p className="text-white text-sm whitespace-pre-wrap">
                  {message.conteudo}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input p-4 border-t border-gray-600 bg-[#1a2a44] flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 bg-[#001427] border-gray-600 text-white placeholder-gray-400"
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
