
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, MapPin, CheckCircle, Calendar, Bell, MessageSquare, AlertCircle, Star } from "lucide-react";
import { Button } from "../ui/button";
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { supabase } from "@/lib/supabase";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'notification' | 'expert' | 'news';
  timestamp: string;
  read: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  isFirstLogin,
}) => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Notification[]>([]);
  const [expertRequests, setExpertRequests] = useState<Notification[]>([]);
  const [news, setNews] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Salvar estado do modal para restaurar em caso de refresh da página
  useEffect(() => {
    if (showNotifications) {
      try {
        sessionStorage.setItem('showingNotificationsModal', 'true');
      } catch (error) {
        console.error('Erro ao salvar estado do modal de notificações:', error);
      }
    } else {
      sessionStorage.removeItem('showingNotificationsModal');
    }
  }, [showNotifications]);
  
  // Verificar se devemos restaurar o modal de notificações ao carregar
  useEffect(() => {
    const shouldShowNotifications = sessionStorage.getItem('showingNotificationsModal') === 'true';
    if (shouldShowNotifications) {
      setShowNotifications(true);
    }
  }, []);

  // Função para buscar notificações e mensagens
  const fetchUpdates = async () => {
    setLoading(true);
    try {
      // Simular/buscar notificações e mensagens
      // Em um ambiente real, essas informações viriam do banco de dados
      const mockNotifications = [
        {
          id: '1',
          title: 'Nova tarefa adicionada',
          message: 'Seu professor adicionou uma nova tarefa na turma de Matemática',
          type: 'notification' as const,
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          title: 'Lembrete de atividade',
          message: 'Você tem uma atividade pendente para amanhã',
          type: 'notification' as const,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: false
        }
      ];
      
      const mockMessages = [
        {
          id: '3',
          title: 'João Silva',
          message: 'Olá, você viu a nova atividade que o professor postou?',
          type: 'message' as const,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ];
      
      const mockExpertRequests = [
        {
          id: '4',
          title: 'Sua dúvida foi respondida',
          message: 'O expert Maria Oliveira respondeu sua dúvida sobre Física',
          type: 'expert' as const,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false
        }
      ];
      
      const mockNews = [
        {
          id: '5',
          title: 'Nova funcionalidade disponível',
          message: 'Agora você pode usar o recurso de resumos automatizados na plataforma',
          type: 'news' as const,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: false
        }
      ];

      // Na implementação real, usaríamos o Supabase para buscar dados:
      // const { data: notificationsData } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false });

      setNotifications(mockNotifications);
      setMessages(mockMessages);
      setExpertRequests(mockExpertRequests);
      setNews(mockNews);
    } catch (error) {
      console.error('Erro ao buscar atualizações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchUpdates();
    }
  }, [showNotifications]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingsClick = () => {
    navigate("/configuracoes");
    onClose();
  };

  // Primeiro login - Modal completo com confetes
  if (isFirstLogin) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
              colors={['#FF6B00', '#FF8C40', '#29335C', '#001427', '#FFC107']}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#001427] rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-[#FF6B00]/30"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=90"
                    alt="Bem-vindo à Ponto. School"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                        <h3 className="text-xl font-bold">Conta criada com sucesso!</h3>
                      </div>
                      <p className="text-white/80">
                        Estamos muito felizes em ter você na Ponto. School!
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Bem-vindo à Ponto. School
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Estamos animados para ajudar você em sua jornada de aprendizado!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <Settings className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configure sua conta</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Personalize seu perfil e preferências para melhorar sua experiência.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                        onClick={handleSettingsClick}
                      >
                        Configurar agora
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <MapPin className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tour pela plataforma</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Conheça os recursos e funcionalidades da Ponto. School.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 w-full opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Em breve
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Comece a aprender</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Vá direto para o dashboard e comece sua jornada agora.
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
                        onClick={onClose}
                      >
                        Ir para o Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Login subsequente - Modal simples
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#001427] rounded-xl p-6 max-w-md w-full shadow-xl border border-[#FF6B00]/20"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center mb-6 pt-4">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                A Ponto. School está feliz por te ter de volta!
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-4">
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
                  onClick={() => {
                    navigate("/agenda");
                    onClose();
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver compromissos do dia
                </Button>
                
                <Button
                  variant="outline"
                  className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                  onClick={() => {
                    setShowNotifications(true);
                    onClose();
                  }}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Ver atualizações da minha conta
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={onClose}
              >
                Continuar para a plataforma
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal de notificações e atualizações
  const NotificationsDialog = () => (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Atualizações da sua conta</DialogTitle>
          <DialogDescription>
            Confira o que aconteceu enquanto você esteve fora
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="w-full mt-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">
              Tudo <Badge className="ml-1 bg-[#FF6B00]">
                {notifications.length + messages.length + expertRequests.length + news.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              Notificações <Badge className="ml-1 bg-[#FF6B00]">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages">
              Mensagens <Badge className="ml-1 bg-[#FF6B00]">{messages.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="expert">
              Expert <Badge className="ml-1 bg-[#FF6B00]">{expertRequests.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[50vh] mt-4">
            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
                </div>
              ) : (
                <>
                  {notifications.length + messages.length + expertRequests.length + news.length > 0 ? (
                    <>
                      {notifications.map(notification => (
                        <div key={notification.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                          <div className="bg-[#FF6B00]/10 p-2 rounded-full h-fit">
                            <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{notification.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {messages.map(message => (
                        <div key={message.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full h-fit">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{message.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{message.message}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {expertRequests.map(request => (
                        <div key={request.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                          <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full h-fit">
                            <Star className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{request.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{request.message}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              {new Date(request.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {news.map(item => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                          <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full h-fit">
                            <Bell className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.message}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Bell className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 dark:text-white font-medium">Nenhuma atualização</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Você está completamente em dia com todas as atualizações.
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                    <div className="bg-[#FF6B00]/10 p-2 rounded-full h-fit">
                      <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{notification.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação encontrada</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              {messages.length > 0 ? (
                messages.map(message => (
                  <div key={message.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full h-fit">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{message.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{message.message}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma mensagem encontrada</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="expert" className="space-y-4">
              {expertRequests.length > 0 ? (
                expertRequests.map(request => (
                  <div key={request.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-3">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full h-fit">
                      <Star className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{request.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{request.message}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {new Date(request.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma solicitação de expert encontrada</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowNotifications(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {isFirstLogin ? (
        <AnimatePresence>
          {isOpen && (
            <>
              <Confetti
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.2}
                colors={['#FF6B00', '#FF8C40', '#29335C', '#001427', '#FFC107']}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                {/* Conteúdo do modal de primeiro login */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white dark:bg-[#001427] rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-[#FF6B00]/30"
                >
                  {/* ... conteúdo do modal de primeiro login ... */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=90"
                      alt="Bem-vindo à Ponto. School"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                          <h3 className="text-xl font-bold">Conta criada com sucesso!</h3>
                        </div>
                        <p className="text-white/80">
                          Estamos muito felizes em ter você na Ponto. School!
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Bem-vindo à Ponto. School
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Estamos animados para ajudar você em sua jornada de aprendizado!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                          <Settings className="h-5 w-5 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configure sua conta</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Personalize seu perfil e preferências para melhorar sua experiência.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                          onClick={handleSettingsClick}
                        >
                          Configurar agora
                        </Button>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                          <MapPin className="h-5 w-5 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tour pela plataforma</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Conheça os recursos e funcionalidades da Ponto. School.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 w-full opacity-70 cursor-not-allowed"
                          disabled
                        >
                          Em breve
                        </Button>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                          <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Comece a aprender</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Vá direto para o dashboard e comece sua jornada agora.
                        </p>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
                          onClick={onClose}
                        >
                          Ir para o Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#001427] rounded-xl p-6 max-w-md w-full shadow-xl border border-[#FF6B00]/20"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-3 right-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="text-center mb-6 pt-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    A Ponto. School está feliz por te ter de volta!
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-col gap-4">
                    <Button
                      className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
                      onClick={() => {
                        navigate("/agenda");
                        onClose();
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver compromissos do dia
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                      onClick={() => {
                        setShowNotifications(true);
                        onClose();
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Ver atualizações da minha conta
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={onClose}
                  >
                    Continuar para a plataforma
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      <NotificationsDialog />
    </>
  );
};

export default WelcomeModal;
