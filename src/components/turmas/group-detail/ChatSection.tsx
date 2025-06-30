
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  conteudo: string;
  enviado_em: string;
  user_id: string;
  userProfile?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface ChatSectionProps {
  groupId: string;
}

export default function ChatSection({ groupId }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCache, setUserCache] = useState<Map<string, any>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  // Carregar usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para carregar perfis de usuários
  const loadUserProfiles = async (userIds: string[]) => {
    try {
      // Buscar perfis da tabela profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Erro ao carregar profiles:', profilesError);
      }

      // Buscar dados do auth.users para usuários sem profile
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.warn('Erro ao carregar auth users:', usersError);
      }

      const newCache = new Map(userCache);

      // Processar profiles existentes
      if (profilesData) {
        profilesData.forEach(profile => {
          newCache.set(profile.id, {
            display_name: profile.display_name || profile.email || 'Usuário',
            email: profile.email || '',
            avatar_url: profile.avatar_url || null
          });
        });
      }

      // Processar dados do auth.users para usuários sem profile
      if (users) {
        users.forEach(user => {
          if (!newCache.has(user.id)) {
            const metadata = user.user_metadata || {};
            newCache.set(user.id, {
              display_name: metadata.name || metadata.display_name || user.email || 'Usuário',
              email: user.email || '',
              avatar_url: metadata.avatar_url || null
            });
          }
        });
      }

      setUserCache(newCache);
    } catch (error) {
      console.error('Erro ao carregar perfis de usuário:', error);
    }
  };

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

      // Primeiro verificar se o usuário é membro do grupo ou criador
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id')
        .eq('id', groupId)
        .single();

      const isCreator = groupData?.criador_id === currentUser.id;
      
      if (!membership && !isCreator) {
        console.error('Usuário não é membro do grupo e nem criador:', membershipError);
        toast({
          title: "Acesso negado",
          description: "Você não é membro deste grupo",
          variant: "destructive"
        });
        return;
      }

      console.log('Verificação de membresia aprovada');

      // Carregar mensagens da tabela mensagens_chat_grupos
      const { data: messagesData, error: messagesError } = await supabase
        .from('mensagens_chat_grupos')
        .select('id, conteudo, enviado_em, user_id')
        .eq('grupo_id', groupId)
        .order('enviado_em', { ascending: true });

      if (messagesError) {
        console.error('Erro ao carregar mensagens:', messagesError);
        toast({
          title: "Erro",
          description: "Erro ao carregar mensagens do chat",
          variant: "destructive"
        });
        return;
      }

      console.log('Mensagens carregadas:', messagesData?.length || 0);
      
      // Carregar perfis dos usuários das mensagens
      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
        await loadUserProfiles(userIds);
      }

      setMessages(messagesData || []);

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
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_chat_grupos',
        filter: `grupo_id=eq.${groupId}`
      }, async (payload) => {
        console.log('Nova mensagem recebida via Realtime:', payload);
        
        try {
          // Carregar perfil do usuário que enviou a mensagem se não estiver no cache
          if (!userCache.has(payload.new.user_id)) {
            await loadUserProfiles([payload.new.user_id]);
          }

          const newMessage: ChatMessage = {
            ...payload.new,
            userProfile: userCache.get(payload.new.user_id) || {
              display_name: 'Usuário',
              email: '',
              avatar_url: null
            }
          };

          setMessages(prev => [...prev, newMessage]);
          
          // Scroll para a nova mensagem
          setTimeout(scrollToBottom, 100);
        } catch (error) {
          console.error('Erro ao processar nova mensagem do Realtime:', error);
          // Adicionar mensagem mesmo sem profile
          const newMessage: ChatMessage = {
            ...payload.new,
            userProfile: { display_name: 'Usuário', email: '', avatar_url: null }
          };
          setMessages(prev => [...prev, newMessage]);
          setTimeout(scrollToBottom, 100);
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
      console.log('Conteúdo da mensagem:', newMessage.trim());
      
      const { data, error } = await supabase
        .from('mensagens_chat_grupos')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id,
          conteudo: newMessage.trim()
        })
        .select();

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Mensagem enviada com sucesso:', data);
      setNewMessage('');
      
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
    
    const userProfile = userCache.get(message.user_id);
    if (userProfile) {
      return userProfile.display_name || userProfile.email || 'Usuário';
    }
    
    return `Usuário ${message.user_id.slice(0, 5)}`;
  };

  const getUserAvatarUrl = (message: ChatMessage) => {
    const userProfile = userCache.get(message.user_id);
    if (userProfile?.avatar_url) {
      return userProfile.avatar_url;
    }
    
    // Gerar avatar com iniciais usando ui-avatars.com
    const displayName = getUserDisplayName(message);
    const initials = displayName === 'Você' ? 'EU' : displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=FF6B00&color=ffffff&size=128`;
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
    <div className="chat-section w-full h-full flex flex-col bg-[#001427] rounded-lg border border-gray-700">
      {/* Header do Chat */}
      <div className="chat-header p-4 border-b border-gray-600 bg-[#1a2a44] rounded-t-lg">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          Chat do Grupo
        </h4>
        <p className="text-gray-400 text-xs mt-1">
          {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Área de mensagens */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3 bg-[#001427]" style={{ minHeight: '300px', maxHeight: '500px' }}>
        {!currentUser ? (
          <div className="text-center text-gray-400 py-8">
            <p>Carregando usuário...</p>
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
            <p>Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 bg-[#1a2a44] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <p className="text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
            <p className="text-sm">Seja o primeiro a conversar no grupo!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user_id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`chat-message flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar do usuário */}
                <div className="flex-shrink-0">
                  <img
                    src={getUserAvatarUrl(message)}
                    alt={getUserDisplayName(message)}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                    onError={(e) => {
                      // Fallback se a imagem falhar
                      const target = e.target as HTMLImageElement;
                      const displayName = getUserDisplayName(message);
                      const initials = displayName === 'Você' ? 'EU' : displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=666&color=ffffff&size=128`;
                    }}
                  />
                </div>

                {/* Conteúdo da mensagem */}
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                  <div className="message-header flex items-center gap-2 mb-1">
                    <span className={`sender font-medium text-xs opacity-90 text-white ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {getUserDisplayName(message)}
                    </span>
                    <span className={`timestamp text-xs opacity-70 text-gray-400 ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                      {formatTime(message.enviado_em)}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg shadow-sm ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-br-none'
                        : 'bg-[#2a4066] text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.conteudo}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input - sempre visível e fixa */}
      <div className="chat-input p-4 border-t border-gray-600 bg-[#1a2a44] rounded-b-lg flex-shrink-0">
        {!currentUser ? (
          <div className="text-center text-gray-400 py-2">
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 bg-[#001427] border-gray-600 text-white placeholder-gray-400 h-11 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim()}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-11 px-4 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isLoading && (
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></div>
                Enviando mensagem...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
