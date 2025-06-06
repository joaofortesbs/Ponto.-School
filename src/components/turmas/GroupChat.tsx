
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface GroupChatProps {
  groupId: string;
  groupName: string;
}

interface Message {
  id: string;
  user_id: string;
  mensagem: string;
  created_at: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('group-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_grupos',
          filter: `grupo_id=eq.${groupId}`
        },
        (payload) => {
          console.log('Nova mensagem recebida:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      console.log('Carregando mensagens do grupo:', groupId);

      const { data, error } = await supabase.rpc('get_group_messages', {
        p_group_id: groupId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar mensagens",
          variant: "destructive",
        });
        return;
      }

      console.log('Mensagens carregadas:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      console.log('Enviando mensagem:', newMessage);

      const { data, error } = await supabase.rpc('send_group_message', {
        p_group_id: groupId,
        p_user_id: user.id,
        p_message: newMessage.trim()
      });

      if (error || !data || !data[0]?.success) {
        const errorMessage = data?.[0]?.error_message || error?.message || 'Erro ao enviar mensagem';
        console.error('Erro ao enviar mensagem:', errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log('Mensagem enviada com sucesso:', data[0].message_id);
      setNewMessage("");
      
      // Recarregar mensagens para garantir sincronia
      await loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
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

  const getUserInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#FF6B00]">
          <MessageCircle className="h-5 w-5" />
          Chat - {groupName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Nenhuma mensagem ainda</p>
              <p className="text-gray-400 text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FF6B00] text-white text-xs">
                    {getUserInitials(message.user_id)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.user_id.substring(0, 8)}...
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                    {message.mensagem}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1"
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
      </CardContent>
    </Card>
  );
};

export default GroupChat;
