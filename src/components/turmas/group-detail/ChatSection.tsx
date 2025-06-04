
import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  mensagem: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    full_name?: string;
  };
}

interface ChatSectionProps {
  groupId: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ groupId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Carregar mensagens
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('mensagens_grupos')
        .select(`
          id,
          mensagem,
          created_at,
          user_id,
          profiles (
            display_name,
            full_name
          )
        `)
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive",
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Configurar realtime
  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_grupos',
          filter: `grupo_id=eq.${groupId}`
        },
        async (payload) => {
          console.log('Nova mensagem recebida:', payload);
          
          // Buscar dados do perfil para a nova mensagem
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, full_name')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg: Message = {
            ...payload.new,
            profiles: profile || undefined
          };

          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar mensagens",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: groupId,
          user_id: user.id,
          mensagem: newMessage.trim(),
        });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem",
          variant: "destructive",
        });
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Formatação de nome do usuário
  const getUserName = (message: Message) => {
    if (message.profiles?.display_name) {
      return message.profiles.display_name;
    }
    if (message.profiles?.full_name) {
      return message.profiles.full_name.split(' ')[0];
    }
    return 'Usuário';
  };

  // Verificar se é o usuário atual
  const isCurrentUser = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id === userId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] rounded-lg p-4 h-[600px] flex flex-col">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">
              Nenhuma mensagem ainda. Seja o primeiro a conversar!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex justify-start`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg bg-[#2D3A52] text-gray-100`}
              >
                <p className="text-xs font-medium text-[#FF6B00] mb-1">
                  {getUserName(message)}
                </p>
                <p className="text-sm">{message.mensagem}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-[#2D3A52] border-[#3D5A80] text-white placeholder-gray-400"
          disabled={sending}
        />
        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
