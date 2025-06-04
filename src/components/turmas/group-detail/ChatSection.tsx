
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
}

export default function ChatSection({ groupId }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [groupId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando mensagens para grupo:', groupId);
      
      const { data, error } = await supabase
        .from('mensagens_grupos')
        .select(`
          id,
          mensagem,
          created_at,
          user_id,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro geral ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_grupos',
          filter: `grupo_id=eq.${groupId}`,
        },
        async (payload) => {
          console.log('Nova mensagem recebida:', payload);
          
          // Buscar dados do perfil do usuário que enviou a mensagem
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage: ChatMessage = {
            id: payload.new.id,
            mensagem: payload.new.mensagem,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            profiles: profile || undefined
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: groupId,
          user_id: user.id,
          mensagem: newMessage.trim()
        });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error('Erro geral ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
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
    return message.profiles?.display_name || 
           message.profiles?.email?.split('@')[0] || 
           'Usuário';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-[#001427] rounded-lg p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Nenhuma mensagem ainda. Seja o primeiro a iniciar uma conversa!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="group">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-[#FF6B00] text-sm">
                  {getUserDisplayName(message)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="text-white text-sm mt-1 ml-0">
                {message.mensagem}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={isSending}
          className="flex-1 bg-[#001427] border-gray-600 text-white placeholder-gray-400"
        />
        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
