
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Users, Calendar, Files, Info, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GroupDetailProps {
  group: {
    id: string;
    nome: string;
    descricao: string;
    membros: number;
    tags: string[];
  };
  onBack: () => void;
}

interface Message {
  id: string;
  user_id: string;
  mensagem: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    full_name?: string;
  };
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState('discussoes');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await loadMessages();
      }
    };

    initializeChat();
  }, [group.id]);

  const loadMessages = async () => {
    try {
      console.log('🔍 Carregando mensagens para o grupo:', group.id);
      
      const { data: messages, error } = await supabase
        .from('mensagens_grupos')
        .select(`
          id,
          user_id,
          mensagem,
          created_at,
          profiles (
            display_name,
            full_name
          )
        `)
        .eq('grupo_id', group.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        return;
      }

      console.log('✅ Mensagens carregadas:', messages?.length || 0);
      setMessages(messages || []);
    } catch (error) {
      console.error('❌ Erro geral ao carregar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    setIsLoading(true);
    try {
      console.log('📤 Enviando mensagem:', newMessage);
      
      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: group.id,
          user_id: currentUserId,
          mensagem: newMessage.trim()
        });

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Mensagem enviada com sucesso');
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('❌ Erro geral ao enviar mensagem:', error);
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

  const getUserName = (message: Message) => {
    if (message.profiles?.display_name) {
      return message.profiles.display_name;
    }
    if (message.profiles?.full_name) {
      return message.profiles.full_name;
    }
    return 'Usuário';
  };

  const tabs = [
    { id: 'discussoes', label: 'Discussões', icon: MessageCircle, active: true },
    { id: 'eventos', label: 'Eventos', icon: Calendar, active: false },
    { id: 'membros', label: 'Membros', icon: Users, active: false },
    { id: 'arquivos', label: 'Arquivos', icon: Files, active: false },
    { id: 'sobre', label: 'Sobre', icon: Info, active: false }
  ];

  const renderDiscussions = () => (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#FF6B00] text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat do Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-900 rounded-lg">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhuma mensagem ainda. Seja o primeiro a conversar!
              </p>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.user_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.user_id === currentUserId
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.user_id !== currentUserId && (
                      <div className="text-xs font-medium mb-1 text-gray-300">
                        {getUserName(message)}
                      </div>
                    )}
                    <div className="text-sm">{message.mensagem}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input de mensagem */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInactiveSection = (sectionName: string) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-8 text-center">
        <div className="text-gray-400">
          <h3 className="text-lg font-medium mb-2">Seção {sectionName}</h3>
          <p>Esta funcionalidade está em desenvolvimento e será disponibilizada em breve.</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{group.nome}</h1>
            <p className="text-gray-400">{group.descricao}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#FF6B00] text-white">
            <Users className="h-3 w-3 mr-1" />
            {group.membros} membros
          </Badge>
        </div>
      </div>

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${
                activeTab === tab.id
                  ? 'text-[#FF6B00] border-b-2 border-[#FF6B00] bg-transparent'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              } ${!tab.active ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!tab.active}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'discussoes' && renderDiscussions()}
          {activeTab === 'eventos' && renderInactiveSection('Eventos')}
          {activeTab === 'membros' && renderInactiveSection('Membros')}
          {activeTab === 'arquivos' && renderInactiveSection('Arquivos')}
          {activeTab === 'sobre' && renderInactiveSection('Sobre')}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GroupDetail;
