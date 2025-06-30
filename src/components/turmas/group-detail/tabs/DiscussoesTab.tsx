import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Send, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GroupSettingsModal from "../GroupSettingsModal";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface DiscussoesTabProps {
  groupId: string;
  groupData?: {
    nome: string;
    tipo_grupo: string;
    is_private: boolean;
    codigo_unico: string;
  };
}

const DiscussoesTab: React.FC<DiscussoesTabProps> = ({ groupId, groupData }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!groupId || !user) return;

    // Load initial messages
    loadMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_chat_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          loadMessages(); // Reload all messages to get user profile data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false);
      }
    };

    if (showSettingsModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsModal]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("group_chat_messages")
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles(display_name, avatar_url)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        user_id: msg.user_id,
        created_at: msg.created_at,
        user_profile: {
          display_name: msg.profiles?.display_name || "Usuário",
          avatar_url: msg.profiles?.avatar_url,
        },
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from("group_chat_messages")
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      console.log(`Mensagem enviada para grupo ${groupId}`);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSettingsClick = () => {
    setShowGroupSettingsModal(true);
    console.log("Modal de configurações do grupo acionado");
  };

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.user_profile?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveGroupSettings = async (settings: any) => {
    try {
      // Aqui você implementaria a lógica para salvar as configurações do grupo
      console.log('Salvando configurações do grupo:', settings);

      // toast({
      //   title: "Sucesso",
      //   description: "Configurações do grupo salvas com sucesso!",
      //   variant: "default"
      // });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // toast({
      //   title: "Erro",
      //   description: "Erro ao salvar configurações do grupo",
      //   variant: "destructive"
      // });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Membros Online: {onlineCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsClick}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && groupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={settingsModalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between border-b-2 border-blue-500 pb-3 mb-4">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Configurações do Grupo
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(false)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Grupo:
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {groupData.nome}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Grupo:
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {groupData.tipo_grupo}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Visibilidade:
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {groupData.is_private ? 'Privado' : 'Público'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Código Único:
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono">
                  {groupData.codigo_unico}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowSettingsModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showGroupSettingsModal && groupData && (
        <GroupSettingsModal
          isOpen={showGroupSettingsModal}
          onClose={() => setShowGroupSettingsModal(false)}
          groupData={groupData}
          onSave={handleSaveGroupSettings}
        />
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            placeholder="Pesquisar mensagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user_id === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${
                message.user_id === user?.id ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.user_profile?.avatar_url} />
                <AvatarFallback>
                  {message.user_profile?.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.user_id === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {message.user_profile?.display_name}
                </p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscussoesTab;