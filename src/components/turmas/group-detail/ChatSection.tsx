
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Search, MoreHorizontal, Settings, CheckSquare, MessageSquare } from "lucide-react";
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
    full_name?: string;
  };
}

interface ChatSectionProps {
  groupId: string;
}

export default function ChatSection({ groupId }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());
  const [onlineCount, setOnlineCount] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const onlineChannelRef = useRef<any>(null);
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
  }, [filteredMessages]);

  // Função para carregar perfis de usuários
  const loadUserProfiles = async (userIds: string[]) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, email, avatar_url')
        .in('id', userIds);

      if (error) {
        console.error('Erro ao carregar perfis:', error);
        return;
      }

      const profileMap = new Map(userProfiles);
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      setUserProfiles(profileMap);
    } catch (error) {
      console.error('Erro ao carregar perfis de usuário:', error);
    }
  };

  // Atualizar status online
  const updateOnlineStatus = async () => {
    if (!currentUser || !groupId) return;
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: currentUser.id,
          grupo_id: groupId,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'user_id,grupo_id'
        });

      if (error) {
        console.error('Erro ao atualizar status online:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status online:', error);
    }
  };

  // Atualizar contagem de membros online
  const updateOnlineCount = async () => {
    if (!groupId) return;
    
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { data, error } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('grupo_id', groupId)
        .gt('last_active', thirtySecondsAgo);

      if (error) {
        console.error('Erro ao contar membros online:', error);
        return;
      }

      setOnlineCount(data?.length || 0);
    } catch (error) {
      console.error('Erro ao contar membros online:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || !groupId) {
      console.log('Usuário ou grupo não disponível');
      return;
    }

    loadMessages();
    setupRealtimeSubscription();
    setupOnlineTracking();

    return () => {
      if (channelRef.current) {
        console.log('Removendo canal Realtime:', channelRef.current);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (onlineChannelRef.current) {
        console.log('Removendo canal online:', onlineChannelRef.current);
        supabase.removeChannel(onlineChannelRef.current);
        onlineChannelRef.current = null;
      }
    };
  }, [groupId, currentUser]);

  const setupOnlineTracking = () => {
    if (!currentUser || !groupId) return;

    // Atualizar status inicial
    updateOnlineStatus();
    updateOnlineCount();

    // Configurar interval para atualizar status
    const statusInterval = setInterval(updateOnlineStatus, 15000);

    // Configurar realtime para contagem online
    const onlineChannel = supabase
      .channel(`online-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_sessions',
        filter: `grupo_id=eq.${groupId}`
      }, () => {
        updateOnlineCount();
      })
      .subscribe((status) => {
        console.log('Status do canal online:', status);
      });

    onlineChannelRef.current = onlineChannel;

    // Cleanup
    return () => {
      clearInterval(statusInterval);
      if (onlineChannel) {
        supabase.removeChannel(onlineChannel);
      }
    };
  };

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
      setFilteredMessages(messagesData || []);

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
          const newMessage: ChatMessage = payload.new;

          // Carregar perfil do usuário se não estiver no cache
          if (!userProfiles.has(newMessage.user_id)) {
            await loadUserProfiles([newMessage.user_id]);
          }

          setMessages(prev => [...prev, newMessage]);
          setFilteredMessages(prev => [...prev, newMessage]);

          // Scroll para a nova mensagem
          setTimeout(scrollToBottom, 100);
        } catch (error) {
          console.error('Erro ao processar nova mensagem do Realtime:', error);
          // Adicionar mensagem mesmo sem profile
          setMessages(prev => [...prev, payload.new]);
          setFilteredMessages(prev => [...prev, payload.new]);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(message =>
      message.conteudo.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
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

    const profile = userProfiles.get(message.user_id);
    if (profile) {
      return profile.display_name || profile.full_name || profile.email || 'Usuário';
    }

    return 'Usuário';
  };

  const getUserAvatar = (message: ChatMessage) => {
    const profile = userProfiles.get(message.user_id);
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }

    // Gerar avatar com inicial do nome
    const displayName = getUserDisplayName(message);
    const initials = displayName.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=FF6B00&color=fff&size=40`;
  };

  // Função para copiar o código único
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      const feedback = document.getElementById('copy-feedback');
      if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => feedback.style.display = 'none', 2000);
      }
      toast({
        title: "Código copiado!",
        description: "O código do grupo foi copiado para a área de transferência",
      });
    }).catch(err => {
      console.error('Erro ao copiar código:', err);
      toast({
        title: "Erro",
        description: "Erro ao copiar código",
        variant: "destructive"
      });
    });
  };

  // Função para exibir o modal de configurações
  const showSettingsModal = async () => {
    if (!groupId) {
      toast({
        title: "Erro",
        description: "ID do grupo não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Carregando configurações do grupo:', groupId);

      const { data: groupData, error } = await supabase
        .from('grupos_estudo')
        .select('nome, tipo_grupo, is_private, is_visible_to_all, codigo_unico')
        .eq('id', groupId)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do grupo:', error);
        throw error;
      }

      console.log('Dados do grupo carregados:', groupData);

      // Criar o modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        z-index: 2000;
        width: 400px;
        font-family: Arial, sans-serif;
        text-align: left;
        color: #333;
      `;

      modal.innerHTML = `
        <div id="settings-modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); z-index: 1999;"></div>
        <div style="position: relative; z-index: 2001;">
          <h2 style="color: #333; margin-top: 0; margin-bottom: 20px; font-weight: bold; font-size: 18px;">Configurações do Grupo</h2>
          
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">Nome do Grupo:</label>
            <p style="margin: 0; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">${groupData.nome}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">Tipo de Grupo:</label>
            <p style="margin: 0; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">${groupData.tipo_grupo}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">Visibilidade:</label>
            <p style="margin: 0; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">${groupData.is_private ? 'Privado' : 'Público'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">Visível para Todos:</label>
            <p style="margin: 0; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">${groupData.is_visible_to_all ? 'Sim' : 'Não'}</p>
          </div>
          
          <div style="margin-bottom: 20px; position: relative;">
            <label style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">Código Único:</label>
            <p id="code-text" style="margin: 0; cursor: pointer; color: #666; background: #f0f0f0; padding: 8px; border-radius: 4px; transition: background 0.2s ease;" 
               onmouseover="this.style.background='#e9ecef'" 
               onmouseout="this.style.background='#f0f0f0'"
               onclick="copyCodeFromModal('${groupData.codigo_unico}')">${groupData.codigo_unico}</p>
            <span id="copy-feedback" style="display: none; position: absolute; top: -20px; right: 0; color: #2ecc71; font-size: 12px; font-weight: bold;">Copiado!</span>
          </div>
          
          <button onclick="closeSettingsModal()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%; transition: background 0.2s ease;" 
                  onmouseover="this.style.background='#c0392b'" 
                  onmouseout="this.style.background='#e74c3c'">Fechar</button>
        </div>
      `;

      // Responsividade
      if (window.innerWidth < 600) {
        modal.style.width = '90%';
        modal.style.maxWidth = '350px';
      }

      document.body.appendChild(modal);

      // Função global para copiar código
      (window as any).copyCodeFromModal = (code: string) => {
        copyCode(code);
      };

      // Função global para fechar modal
      (window as any).closeSettingsModal = () => {
        modal.remove();
        delete (window as any).copyCodeFromModal;
        delete (window as any).closeSettingsModal;
        document.removeEventListener('keydown', closeOnEscape);
      };

      // Fechamento com Escape
      const closeOnEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          (window as any).closeSettingsModal();
        }
      };
      document.addEventListener('keydown', closeOnEscape);

      // Fechamento ao clicar fora (no backdrop)
      const backdrop = document.getElementById('settings-modal-backdrop');
      if (backdrop) {
        backdrop.onclick = () => {
          (window as any).closeSettingsModal();
        };
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do grupo",
        variant: "destructive"
      });

      // Retry após 2 segundos
      setTimeout(() => {
        console.log('Tentando novamente carregar configurações...');
        showSettingsModal();
      }, 2000);
    }
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">Chat do Grupo</span>
            <span className="text-gray-400 text-sm">({onlineCount} online)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Popover open={showOptionsMenu} onOpenChange={setShowOptionsMenu}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1 bg-[#1e293b] border-gray-700" align="end">
                <div className="space-y-1">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md flex items-center gap-2"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      showSettingsModal();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Configurações
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md flex items-center gap-2 opacity-50 cursor-not-allowed"
                    disabled={true}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Selecionar
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md flex items-center gap-2 opacity-50 cursor-not-allowed"
                    disabled={true}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Resumir conversa com IA
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Barra de pesquisa */}
        {showSearchBar && (
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Pesquisar mensagens..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-[#001427] border-gray-600 text-white placeholder-gray-400 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearchBar(false);
                setSearchQuery('');
                setFilteredMessages(messages);
              }}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              Fechar
            </Button>
          </div>
        )}
      </div>

      {/* Área de mensagens */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3 bg-[#001427]" style={{ maxHeight: '500px' }}>
        {!currentUser ? (
          <div className="text-center text-gray-400 py-8">
            <p>Carregando usuário...</p>
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
            <p>Carregando mensagens...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 bg-[#1a2a44] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Tente outro termo de pesquisa' : 'Seja o primeiro a conversar no grupo!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOwnMessage = message.user_id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`chat-message flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex-shrink-0">
                  <img
                    src={getUserAvatar(message)}
                    alt={getUserDisplayName(message)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
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
