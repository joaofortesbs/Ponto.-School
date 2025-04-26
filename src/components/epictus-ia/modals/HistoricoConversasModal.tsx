
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Star,
  Clock,
  Edit3,
  Trash2,
  Pin,
  MoreHorizontal,
  ArrowRight,
  BookOpen,
  FileText,
  Award,
  Tool,
  Brain,
  Filter,
  Tag,
  Archive,
  MessageSquare,
  Book,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { v4 as uuidv4 } from "uuid";

// Interface para os tipos de mensagens
interface Message {
  id: string;
  sender: 'user' | 'ia';
  content: string;
  timestamp: Date;
}

// Interface para as conversas
interface Conversation {
  id: string;
  title: string;
  type: 'conteudo' | 'duvidas' | 'correcao' | 'simulado' | 'resumo';
  messages: Message[];
  timestamp: Date;
  isPinned: boolean;
  isFavorite: boolean;
  tags: string[];
  discipline?: string;
}

// Função auxiliar para formatar data
const formatDate = (date: Date): string => {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  
  // Verifica se é hoje
  if (date.toDateString() === hoje.toDateString()) {
    return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Verifica se é ontem
  if (date.toDateString() === ontem.toDateString()) {
    return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Caso contrário, mostra a data completa
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Ícones para os tipos de conversa
const typeIcons = {
  conteudo: <BookOpen className="h-4 w-4 text-blue-500" />,
  duvidas: <Brain className="h-4 w-4 text-purple-500" />,
  correcao: <Tool className="h-4 w-4 text-orange-500" />,
  simulado: <FileText className="h-4 w-4 text-green-500" />,
  resumo: <Book className="h-4 w-4 text-indigo-500" />
};

// Componente principal do modal
const HistoricoConversasModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulação de dados
  useEffect(() => {
    // Dados de exemplo
    const mockConversas: Conversation[] = [
      {
        id: uuidv4(),
        title: "Estudando Funções Afim para o ENEM",
        type: "conteudo",
        messages: [
          {
            id: uuidv4(),
            sender: 'user',
            content: "Preciso entender melhor como resolver problemas com função afim para o ENEM",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            sender: 'ia',
            content: "Vamos trabalhar isso! Função afim é uma das funções mais importantes para o ENEM. Vou te explicar o conceito e depois trabalhamos com exemplos práticos...",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000)
          }
        ],
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isPinned: true,
        isFavorite: true,
        tags: ["Matemática", "ENEM", "Funções"],
        discipline: "Matemática"
      },
      {
        id: uuidv4(),
        title: "Dúvidas sobre Segunda Guerra Mundial",
        type: "duvidas",
        messages: [
          {
            id: uuidv4(),
            sender: 'user',
            content: "Pode me explicar os principais fatores que levaram à Segunda Guerra Mundial?",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            sender: 'ia',
            content: "Claro! A Segunda Guerra Mundial (1939-1945) foi resultado de diversos fatores interconectados. Vamos analisar os principais...",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000)
          }
        ],
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isPinned: false,
        isFavorite: false,
        tags: ["História", "Segunda Guerra"],
        discipline: "História"
      },
      {
        id: uuidv4(),
        title: "Correção da minha redação sobre meio ambiente",
        type: "correcao",
        messages: [
          {
            id: uuidv4(),
            sender: 'user',
            content: "Pode corrigir esta redação que fiz sobre o tema 'Desafios para a preservação ambiental no Brasil contemporâneo'?",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            sender: 'ia',
            content: "Vou analisar sua redação com base nos critérios de correção do ENEM. Vamos por partes...",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1000)
          }
        ],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isPinned: false,
        isFavorite: true,
        tags: ["Redação", "Meio Ambiente"],
        discipline: "Português"
      },
      {
        id: uuidv4(),
        title: "Simulado de Ciências da Natureza",
        type: "simulado",
        messages: [
          {
            id: uuidv4(),
            sender: 'user',
            content: "Gere um simulado com 5 questões sobre Ciências da Natureza focado no ENEM",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            sender: 'ia',
            content: "Aqui está um simulado com 5 questões de Ciências da Natureza no estilo ENEM...",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1000)
          }
        ],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isPinned: false,
        isFavorite: false,
        tags: ["Simulado", "Ciências"],
        discipline: "Ciências"
      },
      {
        id: uuidv4(),
        title: "Resumo de Literatura Brasileira",
        type: "resumo",
        messages: [
          {
            id: uuidv4(),
            sender: 'user',
            content: "Faça um resumo sobre os principais autores do Modernismo brasileiro",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            sender: 'ia',
            content: "Vou criar um resumo sobre os principais autores do Modernismo brasileiro, focando em suas obras e características...",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000 + 1000)
          }
        ],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isPinned: false,
        isFavorite: false,
        tags: ["Literatura", "Resumo"],
        discipline: "Literatura"
      }
    ];

    // Ordenar por data (mais recente primeiro) e pinados no topo
    const sortedConversas = [...mockConversas].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setConversas(sortedConversas);
  }, []);

  // Função para filtrar conversas
  const filteredConversas = conversas.filter(conversa => {
    // Aplicar filtro por tipo
    if (activeFilter !== 'todos' && conversa.type !== activeFilter) {
      return false;
    }
    
    // Aplicar busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conversa.title.toLowerCase().includes(query) ||
        conversa.tags.some(tag => tag.toLowerCase().includes(query)) ||
        conversa.messages.some(msg => msg.content.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Handler para clicar em uma conversa
  const handleConversationClick = (conversa: Conversation) => {
    setSelectedConversation(conversa);
    setShowDetails(false); // Reset para mostrar apenas a prévia
  };

  // Handler para fixar/desfixar uma conversa
  const handlePinConversation = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversas(prevConversas => {
      return prevConversas.map(conv => {
        if (conv.id === id) {
          return { ...conv, isPinned: !conv.isPinned };
        }
        return conv;
      });
    });
  };

  // Handler para favoritar/desfavoritar uma conversa
  const handleFavoriteConversation = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversas(prevConversas => {
      return prevConversas.map(conv => {
        if (conv.id === id) {
          return { ...conv, isFavorite: !conv.isFavorite };
        }
        return conv;
      });
    });
  };

  // Handler para excluir uma conversa
  const handleDeleteConversation = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversas(prevConversas => prevConversas.filter(conv => conv.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  // Extrair palavras-chave da conversa
  const extractKeywords = (conversation: Conversation): string[] => {
    const content = conversation.messages.map(msg => msg.content).join(' ');
    const commonWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'para', 'com', 'em', 'no', 'na'];
    
    const words = content.toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const wordCount: {[key: string]: number} = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  // Continuar conversa
  const handleContinueConversation = (id: string) => {
    onClose();
    // Aqui seria implementada a lógica para continuar a conversa
    console.log("Continuando conversa", id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`max-w-[85%] h-[85vh] p-0 gap-0 ${isDark ? 'bg-[#001427]/95 text-white border-slate-700' : 'bg-white/95 text-slate-900 border-slate-200'}`}>
        <div className="w-full h-full flex flex-col">
          {/* Header do Modal */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">Histórico de Conversas</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar em todas as conversas..."
                  className={`pl-10 w-[350px] ${isDark ? 'bg-[#0A1625] border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Corpo do Modal */}
          <div className="flex-1 flex overflow-hidden">
            {/* Coluna Esquerda - Lista de Conversas */}
            <div className={`w-1/3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'} flex flex-col`}>
              {/* Filtros */}
              <div className={`p-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveFilter}>
                  <TabsList className={`w-full grid grid-cols-6 ${isDark ? 'bg-[#0A1625]' : 'bg-slate-100'}`}>
                    <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="conteudo" className="text-xs flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="duvidas" className="text-xs flex items-center gap-1">
                      <Brain className="h-3 w-3" /> Dúvidas
                    </TabsTrigger>
                    <TabsTrigger value="correcao" className="text-xs flex items-center gap-1">
                      <Tool className="h-3 w-3" /> Correções
                    </TabsTrigger>
                    <TabsTrigger value="simulado" className="text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Simulados
                    </TabsTrigger>
                    <TabsTrigger value="resumo" className="text-xs flex items-center gap-1">
                      <Book className="h-3 w-3" /> Resumos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center justify-between mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Filter className="h-3 w-3 mr-1" /> Filtros Avançados
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" /> Tags
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Archive className="h-3 w-3 mr-1" /> Arquivados
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Conversas */}
              <ScrollArea className="flex-1">
                <div className="p-1">
                  {filteredConversas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <MessageSquare className={`h-12 w-12 ${isDark ? 'text-slate-600' : 'text-slate-300'} mb-2`} />
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                        Nenhuma conversa encontrada para "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    filteredConversas.map(conversa => (
                      <motion.div
                        key={conversa.id}
                        className={`p-3 mb-1 rounded-lg cursor-pointer group relative ${
                          selectedConversation?.id === conversa.id 
                            ? (isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200/50') 
                            : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100')
                        } border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                        onClick={() => handleConversationClick(conversa)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 rounded-md p-1 ${
                              isDark ? 'bg-slate-800' : 'bg-slate-200'
                            }`}>
                              {typeIcons[conversa.type]}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm line-clamp-1 flex items-center gap-1">
                                {conversa.title}
                                {conversa.isPinned && (
                                  <Pin className="h-3 w-3 text-blue-500 rotate-45" />
                                )}
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {formatDate(conversa.timestamp)}
                                </p>
                                <div className="flex items-center gap-1 ml-2">
                                  {conversa.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-[10px] py-0 h-4">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {conversa.tags.length > 2 && (
                                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                                      +{conversa.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Ações visíveis no hover */}
                          <div className={`absolute right-3 top-3 flex items-center gap-1 ${
                            selectedConversation?.id === conversa.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          } transition-opacity`}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => handleFavoriteConversation(conversa.id, e)}
                            >
                              <Star className={`h-4 w-4 ${conversa.isFavorite ? 'fill-yellow-400 text-yellow-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => handlePinConversation(conversa.id, e)}
                            >
                              <Pin className={`h-4 w-4 ${conversa.isPinned ? 'text-blue-500' : isDark ? 'text-slate-400' : 'text-slate-500'} ${conversa.isPinned ? 'rotate-45' : ''}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => handleDeleteConversation(conversa.id, e)}
                            >
                              <Trash2 className={`h-4 w-4 ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {conversa.discipline && (
                              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                                {conversa.discipline}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-7 text-xs ${isDark ? 'bg-blue-950/30 hover:bg-blue-900/50 border-blue-900/50' : 'bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
                            onClick={() => handleContinueConversation(conversa.id)}
                          >
                            Continuar <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Coluna Central e Direita */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <div className="flex h-full">
                  {/* Coluna Central - Prévia Visual */}
                  {!showDetails && (
                    <div className={`w-full border-r ${isDark ? 'border-slate-700' : 'border-slate-200'} p-4`}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`rounded-md p-1.5 ${
                              isDark ? 'bg-slate-800' : 'bg-slate-200'
                            }`}>
                              {typeIcons[selectedConversation.type]}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
                              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {formatDate(selectedConversation.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className={isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300'}
                              onClick={() => setShowDetails(true)}
                            >
                              Ver Detalhes
                            </Button>
                            <Button 
                              className={`bg-blue-600 hover:bg-blue-700 text-white`}
                              onClick={() => handleContinueConversation(selectedConversation.id)}
                            >
                              Continuar Conversa
                            </Button>
                          </div>
                        </div>
                        
                        {/* Preview da conversa */}
                        <div className="flex-1 flex flex-col">
                          {/* Palavras-chave */}
                          <div className={`p-4 rounded-lg mb-4 ${
                            isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                          }`}>
                            <h3 className="font-medium mb-2">Palavras-chave</h3>
                            <div className="flex flex-wrap gap-2">
                              {extractKeywords(selectedConversation).map(keyword => (
                                <Badge key={keyword} className="bg-blue-600">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Prévia das mensagens */}
                          <div className={`flex-1 rounded-lg p-4 ${
                            isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                          }`}>
                            <h3 className="font-medium mb-3">Prévia da conversa</h3>
                            <div className="space-y-4">
                              {selectedConversation.messages.map(message => (
                                <div 
                                  key={message.id}
                                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  {message.sender === 'ia' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                      <Brain className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                  <div 
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      message.sender === 'user'
                                        ? isDark ? 'bg-blue-700 text-white' : 'bg-blue-100'
                                        : isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                                    }`}
                                  >
                                    <p className="text-sm line-clamp-3">{message.content}</p>
                                  </div>
                                  {message.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-medium">EU</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Ações sugeridas */}
                          <div className={`mt-4 p-4 rounded-lg border ${
                            isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50 border-blue-200'
                          }`}>
                            <h3 className="font-medium mb-3">Sugestões da IA</h3>
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" className="justify-start text-sm">
                                <FileText className="h-4 w-4 mr-2" /> Transformar em resumo
                              </Button>
                              <Button variant="outline" className="justify-start text-sm">
                                <Award className="h-4 w-4 mr-2" /> Gerar quiz
                              </Button>
                              <Button variant="outline" className="justify-start text-sm">
                                <Book className="h-4 w-4 mr-2" /> Salvar na apostila
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Coluna Direita - Detalhes Completos (aparece quando showDetails é true) */}
                  {showDetails && (
                    <motion.div 
                      className="w-full p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowDetails(false)}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <h2 className="text-xl font-bold">Detalhes da Conversa</h2>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className={isDark ? 'border-slate-700' : 'border-slate-200'}
                          >
                            <FileText className="h-4 w-4 mr-2" /> Exportar PDF
                          </Button>
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleContinueConversation(selectedConversation.id)}
                          >
                            Continuar Conversa
                          </Button>
                        </div>
                      </div>
                      
                      {/* Conteúdo completo da conversa */}
                      <div className="flex gap-4 h-[calc(100%-48px)]">
                        <ScrollArea className="w-2/3 pr-4">
                          <div className={`p-4 rounded-lg ${
                            isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium">Conversa Completa</h3>
                              <Badge className={`${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                                {selectedConversation.messages.length} mensagens
                              </Badge>
                            </div>
                            
                            <div className="space-y-6">
                              {selectedConversation.messages.map(message => (
                                <div 
                                  key={message.id}
                                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  {message.sender === 'ia' && (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                      <Brain className="h-5 w-5 text-white" />
                                    </div>
                                  )}
                                  
                                  <div 
                                    className={`max-w-[80%] p-4 rounded-lg ${
                                      message.sender === 'user'
                                        ? isDark ? 'bg-blue-700 text-white' : 'bg-blue-100'
                                        : isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                                    }`}
                                  >
                                    <div className={`flex justify-between mb-1 text-xs ${
                                      message.sender === 'user'
                                        ? isDark ? 'text-blue-200' : 'text-blue-700'
                                        : isDark ? 'text-slate-400' : 'text-slate-500'
                                    }`}>
                                      <span>{message.sender === 'user' ? 'Você' : 'Epictus IA'}</span>
                                      <span>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  
                                  {message.sender === 'user' && (
                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-medium">EU</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </ScrollArea>
                        
                        {/* Painel de ações */}
                        <div className="w-1/3">
                          <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${
                              isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                            }`}>
                              <h3 className="font-medium mb-2">Ações com esta conversa</h3>
                              <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                  <FileText className="h-4 w-4 mr-2" /> Transformar em resumo
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                  <Award className="h-4 w-4 mr-2" /> Gerar quiz
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                  <Book className="h-4 w-4 mr-2" /> Salvar na apostila
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                  <MessageSquare className="h-4 w-4 mr-2" /> Criar flashcards
                                </Button>
                              </div>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${
                              isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                            }`}>
                              <h3 className="font-medium mb-2">Informações</h3>
                              <div className="space-y-3">
                                <div>
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Tipo de conversa
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {typeIcons[selectedConversation.type]}
                                    <span className="text-sm font-medium">
                                      {
                                        selectedConversation.type === 'conteudo' ? 'Conteúdo' :
                                        selectedConversation.type === 'duvidas' ? 'Dúvidas' :
                                        selectedConversation.type === 'correcao' ? 'Correção' :
                                        selectedConversation.type === 'simulado' ? 'Simulado' : 'Resumo'
                                      }
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Data da conversa
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                      {formatDate(selectedConversation.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Tags
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedConversation.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${
                              isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                            }`}>
                              <h3 className="font-medium mb-2">Revisão programada</h3>
                              <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Agende uma revisão deste conteúdo para fixar seu aprendizado
                              </p>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm">Ativar revisão</p>
                                <Switch />
                              </div>
                              <Button variant="outline" className="w-full" disabled>
                                <Calendar className="h-4 w-4 mr-2" /> Agendar revisão
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Estado vazio - nenhuma conversa selecionada
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className={`h-16 w-16 ${isDark ? 'text-slate-700' : 'text-slate-300'} mb-4`} />
                  <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                  <p className={`max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Escolha uma conversa da lista à esquerda para visualizar detalhes, 
                    continuar de onde parou ou transformar em outros formatos de estudo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
