
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroupInterfaceProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

interface Message {
  id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
}

export default function GroupInterface({ groupId, groupName, onBack }: GroupInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    getCurrentUser();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser && groupId) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [currentUser, groupId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('id, user_id, conteudo, created_at')
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `grupo_id=eq.${groupId}`
      }, (payload) => {
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
        {/* Messages Area */}
        <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3">
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
    </div>
  );
}
