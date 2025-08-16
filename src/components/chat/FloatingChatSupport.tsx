
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, X, Send, Home, History, Bell, Settings, 
  User, Bot, Sparkles, Upload, Image, Mic, MicOff, 
  Heart, ThumbsUp, Copy, Share2, Download, Trash2,
  ChevronDown, ChevronUp, Volume2, VolumeX, RotateCcw,
  Star, Bookmark, Filter, Search, Tag, Calendar,
  Zap, Brain, Target, Trophy, Flame, Gift
} from 'lucide-react';

// Importar componentes separados
import { ChatHomeContent } from "./components/ChatHomeContent";
import { ChatHistoryContent } from "./components/ChatHistoryContent";
import { NotificationsContent } from "./components/NotificationsContent";
import { ChatMessagesList } from "./components/ChatMessagesList";
import { ChatInputArea } from "./components/ChatInputArea";
import { AISettingsModal } from "./components/AISettingsModal";
import { EpictusPersonalizeModal } from "./components/EpictusPersonalizeModal";
import { defaultData } from "./data/defaultData";

const FloatingChatSupport = () => {
  // Estados principais
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages] = useState(defaultData.messages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(defaultData.notifications);
  const [conversationHistory, setConversationHistory] = useState(defaultData.conversationHistory);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiPersonality, setAiPersonality] = useState('helpful');
  const [responseSpeed, setResponseSpeed] = useState('normal');
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState(defaultData.suggestions);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Funções auxiliares primeiro
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/message-sound.mp3');
      audio.play().catch(console.error);
    }
  };

  const loadUserProfileImage = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      const userId = sessionData.session.user.id;
      const { data: profileData } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
      if (profileData?.avatar_url) {
        setProfileImageUrl(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil:', error);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!tempProfileImage) return;
    setIsUploadingProfileImage(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({ title: "Erro", description: "Você precisa estar logado para fazer upload de imagens", variant: "destructive" });
        return;
      }
      const userId = sessionData.session.user.id;
      const fileExt = tempProfileImage.name.split('.').pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let fileToUpload = tempProfileImage;
      if (tempProfileImage.size > 1000000) { // Comprimir se maior que 1MB
        // Lógica de compressão seria implementada aqui
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfileImageUrl(publicUrl);
      setTempProfileImage(null);
      toast({ title: "Sucesso", description: "Imagem de perfil atualizada!" });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({ title: "Erro", description: "Falha ao atualizar imagem de perfil", variant: "destructive" });
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const generateAIResponse = async (userMessage) => {
    try {
      setIsTyping(true);
      
      // Simulação de delay da IA
      await new Promise(resolve => setTimeout(resolve, 1500));

      const responses = [
        "Entendo sua dúvida! Vou te ajudar com isso. Baseado no seu contexto, sugiro que...",
        "Ótima pergunta! Para resolver isso, você pode seguir estes passos...",
        "Vejo que você está enfrentando esse desafio. Uma abordagem eficaz seria...",
        "Interessante! Deixe-me explicar isso de forma clara e detalhada...",
        "Essa é uma questão importante! Vou te dar algumas opções para considerar..."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        id: Date.now(),
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date(),
        reactions: [],
        category: 'response'
      };
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return {
        id: Date.now(),
        text: "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.",
        sender: 'ai',
        timestamp: new Date(),
        reactions: [],
        category: 'error'
      };
    } finally {
      setIsTyping(false);
    }
  };

  const generateSmartSuggestions = async () => {
    setIsGeneratingPrompts(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSuggestions = [
        "Como posso melhorar minha técnica de estudos?",
        "Quais são os melhores métodos de memorização?",
        "Como organizar meu tempo de estudo?",
        "Dicas para manter o foco durante os estudos",
        "Como criar um cronograma eficiente?"
      ];
      
      setCurrentSuggestions(newSuggestions);
      toast({ title: "Sugestões atualizadas!", description: "Novos prompts foram gerados para você." });
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({ title: "Erro", description: "Não foi possível gerar novas sugestões", variant: "destructive" });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Gerar resposta da IA
    const aiResponse = await generateAIResponse(inputMessage);
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
    
    playNotificationSound();
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setActiveTab('home');
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({ title: "Erro", description: "Reconhecimento de voz não suportado neste navegador", variant: "destructive" });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
      toast({ title: "Erro", description: "Falha no reconhecimento de voz", variant: "destructive" });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast({ title: "Erro", description: "Arquivo muito grande. Máximo 5MB.", variant: "destructive" });
        return;
      }
      setTempProfileImage(file);
    }
  };

  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === reaction);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === reaction ? { ...r, count: r.count + 1 } : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji: reaction, count: 1 }]
          };
        }
      }
      return msg;
    }));
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Mensagem copiada para a área de transferência." });
  };

  const toggleFavorite = (messageId) => {
    setFavorites(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const toggleBookmark = (messageId) => {
    setBookmarks(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const resetConversation = () => {
    setMessages([]);
    setInputMessage('');
    toast({ title: "Conversa limpa", description: "Histórico da conversa foi removido." });
  };

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadUserProfileImage();
  }, []);

  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read).length;
    setUnreadCount(unreadNotifications);
  }, [notifications]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#FF5500] hover:to-[#FF7722] text-white shadow-2xl border-0 transition-all duration-300 hover:scale-110"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-96 h-[600px] shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback className="bg-white text-[#FF6B00] font-bold">
                    EP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold">Epictus IA</CardTitle>
                  <p className="text-sm opacity-90">Seu assistente de estudos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-white hover:bg-white/20"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-[520px] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                <TabsTrigger value="home" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2 relative">
                  <Bell className="h-4 w-4" />
                  <span>Alertas</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs p-0 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="flex-1 flex flex-col p-0 m-0">
                <ChatHomeContent 
                  messages={messages}
                  isTyping={isTyping}
                  messagesEndRef={messagesEndRef}
                  favorites={favorites}
                  bookmarks={bookmarks}
                  onAddReaction={addReaction}
                  onCopyMessage={copyMessage}
                  onToggleFavorite={toggleFavorite}
                  onToggleBookmark={toggleBookmark}
                  currentSuggestions={currentSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  onGeneratePrompts={generateSmartSuggestions}
                  isGeneratingPrompts={isGeneratingPrompts}
                />
                
                <ChatInputArea 
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  isListening={isListening}
                  onStartVoiceRecognition={startVoiceRecognition}
                  onStopVoiceRecognition={stopVoiceRecognition}
                  onFileUpload={() => fileInputRef.current?.click()}
                  onResetConversation={resetConversation}
                  onOpenSettings={() => setShowAISettingsModal(true)}
                  onOpenPersonalize={() => setShowPersonalizeModal(true)}
                />
              </TabsContent>

              <TabsContent value="history" className="flex-1 p-4 m-0">
                <ChatHistoryContent 
                  conversationHistory={conversationHistory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </TabsContent>

              <TabsContent value="notifications" className="flex-1 p-4 m-0">
                <NotificationsContent 
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onClearAll={clearAllNotifications}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* File Input Hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Modals */}
      <AISettingsModal 
        isOpen={showAISettingsModal}
        onClose={() => setShowAISettingsModal(false)}
        aiPersonality={aiPersonality}
        setAiPersonality={setAiPersonality}
        responseSpeed={responseSpeed}
        setResponseSpeed={setResponseSpeed}
        autoSuggestions={autoSuggestions}
        setAutoSuggestions={setAutoSuggestions}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <EpictusPersonalizeModal 
        isOpen={showPersonalizeModal}
        onClose={() => setShowPersonalizeModal(false)}
        profileImageUrl={profileImageUrl}
        tempProfileImage={tempProfileImage}
        isUploadingProfileImage={isUploadingProfileImage}
        onImageUpload={handleProfileImageUpload}
        onFileSelect={(file) => setTempProfileImage(file)}
      />
    </div>
  );
};

export default FloatingChatSupport;
