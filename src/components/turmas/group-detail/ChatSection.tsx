
import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  user_id: string;
  mensagem: string;
  created_at: string;
}

interface ChatSectionProps {
  groupId: string;
  userId: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ groupId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update online status
  const updateOnlineStatus = async () => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          grupo_id: groupId,
          last_active: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao atualizar status online:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status online:', error);
    }
  };

  // Get online count
  const getOnlineCount = async () => {
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('grupo_id', groupId)
        .gt('last_active', thirtySecondsAgo);

      if (error) {
        console.error('Erro ao buscar contagem online:', error);
        return;
      }

      setOnlineCount(data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar contagem online:', error);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('mensagens_grupos')
        .select('*')
        .eq('grupo_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      setMessages(data || []);
      setFilteredMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: groupId,
          user_id: userId,
          mensagem: newMessage.trim()
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(message =>
      message.mensagem.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  // Initialize
  useEffect(() => {
    loadMessages();
    updateOnlineStatus();
    getOnlineCount();

    // Update online status every 15 seconds
    const statusInterval = setInterval(updateOnlineStatus, 15000);
    
    // Update online count every 30 seconds
    const countInterval = setInterval(getOnlineCount, 30000);

    // Set up real-time subscriptions
    const messagesChannel = supabase
      .channel(`messages-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_grupos',
        filter: `grupo_id=eq.${groupId}`
      }, () => {
        loadMessages();
      })
      .subscribe();

    const onlineChannel = supabase
      .channel(`online-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_sessions',
        filter: `grupo_id=eq.${groupId}`
      }, () => {
        getOnlineCount();
      })
      .subscribe();

    return () => {
      clearInterval(statusInterval);
      clearInterval(countInterval);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(onlineChannel);
    };
  }, [groupId, userId]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {onlineCount} {onlineCount === 1 ? 'membro online' : 'membros online'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar mensagens..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setFilteredMessages(messages);
              }}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.user_id === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.mensagem}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
