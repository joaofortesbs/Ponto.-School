
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
    if (!currentUser || !groupId) {
      console.log('Usuário ou grupo não disponível');
      return;
    }

    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Removendo canal Realtime:', channelRef.current);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId, currentUser]);

  const loadMessages = async () => {
    if (!currentUser || !groupId) {
      console.log('Usuário ou grupo não disponível para carregar mensagens');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Carregando mensagens para grupo:', groupId, 'usuário:', currentUser.id);

      // Primeiro verificar se o usuário é membro do grupo
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id)
        .single();

      if (membershipError || !membership) {
        console.error('Usuário não é membro do grupo:', membershipError);
        toast({
          title: "Acesso negado",
          description: "Você não é membro deste grupo",
          variant: "destructive"
        });
        return;
      }

      console.log('Verificação de membresia aprovada');

      // Carregar mensagens usando a função segura do banco
      const { data, error } = await supabase
        .rpc('get_group_messages_safe', {
          p_group_id: groupId,
          p_user_id: currentUser.id
        });

      if (error) {
        console.error('Erro ao carregar mensagens via função:', error);
        
        // Fallback: tentar consulta direta
        const { data: directData, error: directError } = await supabase
          .from('mensagens_grupos')
          .select(`
            id,
            mensagem,
            created_at,
            user_id,
            profiles!inner(display_name, email)
          `)
          .eq('grupo_id', groupId)
          .order('created_at', { ascending: true });

        if (directError) {
          console.error('Erro na consulta direta:', directError);
          toast({
            title: "Erro",
            description: "Erro ao carregar mensagens do chat",
            variant: "destructive"
          });
          return;
        }

        console.log('Mensagens carregadas via consulta direta:', directData?.length || 0);
        setMessages(directData || []);
        return;
      }

      console.log('Mensagens carregadas via função segura:', data?.length || 0);
      
      // Buscar dados dos perfis para as mensagens
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(msg => msg.user_id))];
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (!profilesError && profiles) {
          const messagesWithProfiles = data.map(msg => ({
            ...msg,
            profiles: profiles.find(p => p.id === msg.user_id) || { display_name: 'Usuário', email: '' }
          }));
          setMessages(messagesWithProfiles);
        } else {
          setMessages(data.map(msg => ({
            ...msg,
            profiles: { display_name: 'Usuário', email: '' }
          })));
        }
      } else {
        setMessages([]);
      }

    } catch (error) {
      console.error('Erro inesperado ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser || !groupId) {
      console.log('Não é possível configurar Realtime sem usuário ou grupo');
      return;
    }

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
        console.log('Nova mensagem recebida via Realtime:', payload);
        
        try {
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
          
          // Scroll para a nova mensagem
          setTimeout(scrollToBottom, 100);
        } catch (error) {
          console.error('Erro ao processar nova mensagem do Realtime:', error);
        }
      })
      .subscribe((status) => {
        console.log('Status da assinatura Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Realtime conectado com sucesso para grupo:', groupId);
        } else if (status === 'CLOSED') {
          console.log('Conexão Realtime fechada para grupo:', groupId);
        }
      });

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !currentUser || !groupId) {
      console.log('Condições inválidas para envio de mensagem');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando mensagem para grupo:', groupId, 'usuário:', currentUser.id);
      
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
          description: "Erro ao enviar mensagem: " + error.message,
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      console.log('Mensagem enviada com sucesso');
      
      // A nova mensagem será adicionada automaticamente via Realtime
      
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

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.user_id === currentUser?.id) {
      return 'Você';
    }
    return message.profiles?.display_name || message.profiles?.email || 'Usuário';
  };

  if (!currentUser) {
    return (
      <div className="chat-section h-full flex items-center justify-center">
        <div className="text-center text-gray-400 py-8">
          <p>Faça login para acessar o chat</p>
        </div>
      </div>
    );
  }

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
