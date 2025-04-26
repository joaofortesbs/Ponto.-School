
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Mic, 
  ChevronDown, 
  Clock, 
  Star, 
  Lock, 
  Trash2, 
  Download, 
  MoreVertical, 
  ArrowLeft, 
  MessageSquare, 
  Filter, 
  Calendar,
  Info,
  X,
  Bookmark,
  Share2,
  ExternalLink,
  ArrowUpRight,
  Copy
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Conversation, 
  Message,
  getConversations,
  getMessages,
  createConversation,
  updateConversationMetadata,
  deleteConversation
} from "@/services/conversationHistoryService";

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectConversation?: (conversationId: string) => void;
  onCreateNewChat?: () => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
  onSelectConversation,
  onCreateNewChat
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversasData, setConversasData] = useState<Conversation[]>([]);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState("todas");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para rolar até o final das mensagens quando uma conversa é selecionada
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carregar conversas do Supabase ao abrir o modal
  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    // Quando uma conversa é selecionada, carregue suas mensagens e role para o final
    if (selectedConversation) {
      loadConversationMessages(selectedConversation);
      scrollToBottom();
    }
    
    // Quando o modal abre, foque no campo de pesquisa
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [selectedConversation, open]);

  // Carregar conversas do usuário atual
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Obter o ID do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado");
        setIsLoading(false);
        return;
      }

      const conversations = await getConversations(user.id);
      setConversasData(conversations);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar o histórico de conversas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar mensagens de uma conversa específica
  const loadConversationMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const messages = await getMessages(conversationId);
      setConversationMessages(messages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens desta conversa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para agrupar conversas por período
  const agruparConversas = () => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const ultimos7Dias = new Date(hoje);
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);
    
    const grupos: {[key: string]: Conversation[]} = {
      "HOJE": [],
      "ONTEM": [],
      "ÚLTIMOS 7 DIAS": [],
      "ESTE ANO": []
    };

    let conversasFiltradas = conversasData;
    
    // Filtro por termo de pesquisa
    if (searchTerm) {
      conversasFiltradas = conversasFiltradas.filter(conversa => 
        conversa.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por categoria
    if (categoryFilter) {
      conversasFiltradas = conversasFiltradas.filter(conversa => 
        conversa.categoria === categoryFilter
      );
    }
    
    // Filtro por tab
    if (selectedTab === "favoritos") {
      conversasFiltradas = conversasFiltradas.filter(conversa => conversa.favorito);
    } else if (selectedTab === "privados") {
      conversasFiltradas = conversasFiltradas.filter(conversa => conversa.privado);
    }

    conversasFiltradas.forEach(conversa => {
      const data = new Date(conversa.updated_at);
      
      if (data.toDateString() === hoje.toDateString()) {
        grupos["HOJE"].push(conversa);
      } else if (data.toDateString() === ontem.toDateString()) {
        grupos["ONTEM"].push(conversa);
      } else if (data > ultimos7Dias) {
        grupos["ÚLTIMOS 7 DIAS"].push(conversa);
      } else {
        grupos["ESTE ANO"].push(conversa);
      }
    });

    // Ordenar conversas em cada grupo (mais recentes primeiro)
    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
    });

    return grupos;
  };

  const formatarTimestamp = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - timestamp.getTime();
    const minutosPassados = Math.floor(diff / (1000 * 60));
    const horasPassadas = Math.floor(diff / (1000 * 60 * 60));
    const diasPassados = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutosPassados < 60) {
      return `${minutosPassados}m atrás`;
    } else if (horasPassadas < 24) {
      return `${horasPassadas}h atrás`;
    } else if (diasPassados < 7) {
      return `${diasPassados}d atrás`;
    } else {
      return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  };

  const formatarHoraMensagem = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const selecionarConversa = (id: string) => {
    setSelectedConversation(id);
  };

  const criarNovoChat = () => {
    onOpenChange(false); // Fechar o modal após criar novo chat
    
    if (onCreateNewChat) {
      onCreateNewChat();
    }
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleAction = (action: string) => {
    console.log(`Ação executada: ${action}`);
    setShowActionsMenu(false);
  };

  const toggleFavorito = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const conversa = conversasData.find(c => c.id === id);
    if (!conversa) return;
    
    try {
      const novoStatus = !conversa.favorito;
      await updateConversationMetadata(id, { favorito: novoStatus });
      
      setConversasData(prevState => 
        prevState.map(conversa => 
          conversa.id === id 
            ? { ...conversa, favorito: novoStatus } 
            : conversa
        )
      );
      
      toast({
        title: novoStatus ? "Conversa favoritada" : "Conversa removida dos favoritos",
        duration: 2000
      });
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de favorito",
        variant: "destructive"
      });
    }
  };

  const togglePrivado = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const conversa = conversasData.find(c => c.id === id);
    if (!conversa) return;
    
    try {
      const novoStatus = !conversa.privado;
      await updateConversationMetadata(id, { privado: novoStatus });
      
      setConversasData(prevState => 
        prevState.map(conversa => 
          conversa.id === id 
            ? { ...conversa, privado: novoStatus } 
            : conversa
        )
      );
      
      toast({
        title: novoStatus ? "Conversa definida como privada" : "Conversa definida como pública",
        duration: 2000
      });
    } catch (error) {
      console.error("Erro ao atualizar privacidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de privacidade",
        variant: "destructive"
      });
    }
  };

  const excluirConversa = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Confirmação via toast em vez de window.confirm para manter a estética da UI
    const confirmar = window.confirm('Tem certeza que deseja excluir esta conversa?');
    
    if (confirmar) {
      try {
        await deleteConversation(id);
        
        setConversasData(prevState => prevState.filter(conversa => conversa.id !== id));
        
        if (selectedConversation === id) {
          setSelectedConversation(null);
        }
        
        toast({
          title: "Conversa excluída com sucesso",
          duration: 2000
        });
      } catch (error) {
        console.error("Erro ao excluir conversa:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a conversa",
          variant: "destructive"
        });
      }
    }
  };

  const continuarConversa = () => {
    if (selectedConversation && typeof onSelectConversation === 'function') {
      onSelectConversation(selectedConversation);
      onOpenChange(false);
    }
  };

  const grupos = agruparConversas();
  const conversaSelecionada = selectedConversation ? conversasData.find(c => c.id === selectedConversation) : null;
  const todasCategorias = Array.from(new Set(conversasData.map(c => c.categoria).filter(Boolean)));

  // Verificar se há resultados após a filtragem
  const temResultados = Object.values(grupos).some(grupo => grupo.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent 
          className="max-w-5xl p-0 overflow-hidden border-none sm:rounded-xl text-white"
          style={{ 
            width: "85vw", 
            height: "85vh",
            background: "linear-gradient(145deg, #0a0f1a 0%, #131d2e 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}
        >
          <div className="flex h-full">
            {/* Painel lateral esquerdo com histórico */}
            <div className="w-1/3 border-r border-[#1e2a3e]/80 flex flex-col h-full bg-[#0b121f]/50 backdrop-blur-sm">
              {/* Barra de pesquisa fixa */}
              <div className="sticky top-0 p-4 border-b border-[#1e2a3e]/80 bg-[#0a0f1a]/90 backdrop-blur-md z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A0D9F] h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar conversas..."
                    className="w-full py-2 pl-10 pr-4 rounded-md bg-[#131d2e]/50 border border-[#1e2a3e]/50 text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#0D23A0] placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Tabs defaultValue="todas" className="mt-4" onValueChange={setSelectedTab}>
                  <TabsList className="grid grid-cols-3 w-full bg-[#131d2e]/30">
                    <TabsTrigger 
                      value="todas" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0D23A0] data-[state=active]:to-[#4A0D9F] data-[state=active]:text-white"
                    >
                      Todas
                    </TabsTrigger>
                    <TabsTrigger 
                      value="favoritos"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0D23A0] data-[state=active]:to-[#4A0D9F] data-[state=active]:text-white"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Favoritos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="privados"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0D23A0] data-[state=active]:to-[#4A0D9F] data-[state=active]:text-white"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Privados
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center text-sm text-gray-300 hover:text-white bg-[#131d2e]/50 hover:bg-[#1e2a3e]/50 px-3 py-1 h-8 rounded-md"
                        onClick={toggleActionsMenu}
                      >
                        <span>Ações</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                      <AnimatePresence>
                        {showActionsMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-9 w-56 bg-[#131d2e] rounded-md shadow-lg border border-[#1e2a3e]/80 z-50 overflow-hidden"
                          >
                            <ul className="py-1">
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]/70 transition-colors"
                                  onClick={() => handleAction("Marcar favoritos")}
                                >
                                  <Star className="h-4 w-4 mr-2 text-[#FF6B00]" />
                                  Marcar favoritos
                                </button>
                              </li>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]/70 transition-colors"
                                  onClick={() => handleAction("Privatizar conversas")}
                                >
                                  <Lock className="h-4 w-4 mr-2 text-[#4A0D9F]" />
                                  Privatizar conversas
                                </button>
                              </li>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]/70 transition-colors"
                                  onClick={() => handleAction("Excluir conversas")}
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                  Excluir conversas
                                </button>
                              </li>
                              <li>
                                <button
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]/70 transition-colors"
                                  onClick={() => handleAction("Exportar histórico")}
                                >
                                  <Download className="h-4 w-4 mr-2 text-teal-500" />
                                  Exportar histórico
                                </button>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center text-sm text-gray-300 hover:text-white bg-[#131d2e]/50 hover:bg-[#1e2a3e]/50 px-3 py-1 h-8 rounded-md"
                        onClick={toggleFilterMenu}
                      >
                        <Filter className="h-3.5 w-3.5 mr-1" />
                        <span>Filtrar</span>
                      </Button>
                      <AnimatePresence>
                        {showFilterMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-9 w-56 bg-[#131d2e] rounded-md shadow-lg border border-[#1e2a3e]/80 z-50 overflow-hidden"
                          >
                            <div className="p-2">
                              <h4 className="text-xs font-medium text-gray-400 mb-2 px-2">Categorias</h4>
                              <div className="flex flex-wrap gap-1 p-1">
                                <Badge
                                  onClick={() => setCategoryFilter(null)} 
                                  className={`cursor-pointer ${!categoryFilter ? 'bg-[#0D23A0] hover:bg-[#0D23A0]/80' : 'bg-[#1e2a3e] hover:bg-[#1e2a3e]/80'}`}
                                >
                                  Todas
                                </Badge>
                                {todasCategorias.map(cat => (
                                  <Badge 
                                    key={cat} 
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`cursor-pointer ${categoryFilter === cat ? 'bg-[#0D23A0] hover:bg-[#0D23A0]/80' : 'bg-[#1e2a3e] hover:bg-[#1e2a3e]/80'}`}
                                  >
                                    {cat?.charAt(0).toUpperCase() + cat?.slice(1)}
                                  </Badge>
                                ))}
                              </div>
                              <h4 className="text-xs font-medium text-gray-400 mb-2 mt-3 px-2">Visualização</h4>
                              <div className="flex gap-2 p-1">
                                <Badge
                                  onClick={() => setViewMode("list")}
                                  className={`cursor-pointer ${viewMode === "list" ? 'bg-[#0D23A0] hover:bg-[#0D23A0]/80' : 'bg-[#1e2a3e] hover:bg-[#1e2a3e]/80'}`}
                                >
                                  Lista
                                </Badge>
                                <Badge
                                  onClick={() => setViewMode("grid")}
                                  className={`cursor-pointer ${viewMode === "grid" ? 'bg-[#0D23A0] hover:bg-[#0D23A0]/80' : 'bg-[#1e2a3e] hover:bg-[#1e2a3e]/80'}`}
                                >
                                  Grade
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Button
                    className="flex items-center bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] text-xs px-3 py-1 h-8 rounded-md border-none shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={criarNovoChat}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Novo chat
                  </Button>
                </div>
              </div>

              {/* Lista de conversas com rolagem */}
              <ScrollArea className="flex-1 px-2">
                <div className="py-2">
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-[#0D23A0] border-t-transparent rounded-full"></div>
                    </div>
                  )}

                  {!isLoading && !temResultados && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <Search className="h-10 w-10 text-gray-500 mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-400">Nenhum resultado encontrado</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">
                        Tente usar termos diferentes ou remover os filtros aplicados.
                      </p>
                      {(searchTerm || categoryFilter || selectedTab !== "todas") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 bg-[#131d2e]/50 border-[#1e2a3e] text-gray-300 hover:bg-[#1e2a3e]"
                          onClick={() => {
                            setSearchTerm("");
                            setCategoryFilter(null);
                            setSelectedTab("todas");
                          }}
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  )}

                  {!isLoading && temResultados && Object.keys(grupos).map(periodo => {
                    if (grupos[periodo].length === 0) return null;
                    
                    return (
                      <div key={periodo} className="mb-4">
                        <div className="flex items-center">
                          <h3 className="text-xs font-bold text-gray-400 px-2 mb-2">{periodo}</h3>
                          <div className="h-px flex-grow bg-[#1e2a3e]/50 ml-2 mb-2" />
                        </div>
                        
                        {viewMode === "list" ? (
                          <ul>
                            {grupos[periodo].map(conversa => (
                              <motion.li
                                key={conversa.id}
                                whileHover={{ 
                                  backgroundColor: "rgba(30, 42, 62, 0.5)",
                                  scale: 1.01,
                                  transition: { duration: 0.1 }
                                }}
                                className={`relative px-3 py-2 rounded-md cursor-pointer overflow-hidden mb-1.5 group
                                  ${selectedConversation === conversa.id 
                                    ? "bg-gradient-to-r from-[#131d2e] to-[#1e2a3e]" 
                                    : "hover:bg-[#1e2a3e]/50 bg-[#131d2e]/30"
                                  } transition-all duration-150`}
                                onClick={() => selecionarConversa(conversa.id)}
                              >
                                {selectedConversation === conversa.id && (
                                  <motion.div
                                    layoutId="selectedHighlight"
                                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#0D23A0] to-[#4A0D9F]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                                
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center pr-2 truncate max-w-[70%]">
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        {conversa.privado && <Lock className="h-3 w-3 mr-1 text-[#4A0D9F]" />}
                                        <span className={`truncate text-sm font-medium ${selectedConversation === conversa.id ? 'text-white' : 'text-gray-200'}`}>
                                          {conversa.title}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                                        {conversa.resumo?.substring(0, 45)}...
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <div className="flex items-center">
                                      {conversa.favorito && <Star className="h-3 w-3 mr-1 text-[#FF6B00]" />}
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatarTimestamp(conversa.updated_at)}
                                      </span>
                                    </div>
                                    {conversa.categoria && (
                                      <Badge variant="outline" className="mt-1 px-1.5 py-0 h-4 text-[10px] bg-[#131d2e]/50 border-[#1e2a3e]/70 text-gray-300">
                                        {conversa.categoria}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Botões de ação que aparecem ao passar o mouse */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-[#131d2e]/70 hover:bg-[#1e2a3e] rounded-full"
                                    onClick={(e) => toggleFavorito(conversa.id, e)}
                                    title={conversa.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                  >
                                    <Star className={`h-3 w-3 ${conversa.favorito ? 'text-[#FF6B00] fill-[#FF6B00]' : 'text-gray-400'}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-[#131d2e]/70 hover:bg-[#1e2a3e] rounded-full"
                                    onClick={(e) => togglePrivado(conversa.id, e)}
                                    title={conversa.privado ? "Tornar público" : "Tornar privado"}
                                  >
                                    <Lock className={`h-3 w-3 ${conversa.privado ? 'text-[#4A0D9F]' : 'text-gray-400'}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-[#131d2e]/70 hover:bg-[#1e2a3e] hover:text-red-500 rounded-full"
                                    onClick={(e) => excluirConversa(conversa.id, e)}
                                    title="Excluir conversa"
                                  >
                                    <Trash2 className="h-3 w-3 text-gray-400" />
                                  </Button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {grupos[periodo].map(conversa => (
                              <motion.div
                                key={conversa.id}
                                whileHover={{ 
                                  scale: 1.02,
                                  transition: { duration: 0.1 }
                                }}
                                className={`relative p-3 rounded-md cursor-pointer overflow-hidden mb-1 group
                                  ${selectedConversation === conversa.id 
                                    ? "bg-gradient-to-br from-[#131d2e] to-[#1e2a3e] border border-[#0D23A0]/30" 
                                    : "hover:bg-[#1e2a3e]/50 bg-[#131d2e]/30"
                                  } transition-all duration-150 h-24 flex flex-col justify-between`}
                                onClick={() => selecionarConversa(conversa.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D23A0]/20 to-[#4A0D9F]/20 flex items-center justify-center">
                                      <MessageSquare className="h-3.5 w-3.5 text-[#4A0D9F]" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-200 truncate max-w-[100px]">{conversa.title}</h4>
                                      <p className="text-[10px] text-gray-400 truncate max-w-[100px]">
                                        {conversa.resumo?.substring(0, 30)}...
                                      </p>
                                    </div>
                                  </div>
                                  {conversa.favorito && <Star className="h-3 w-3 text-[#FF6B00] fill-[#FF6B00]" />}
                                </div>
                                
                                <div className="flex justify-between items-end">
                                  <div className="flex gap-1">
                                    {conversa.categoria && (
                                      <Badge variant="outline" className="px-1.5 py-0 h-4 text-[10px] bg-[#131d2e]/50 border-[#1e2a3e]/70 text-gray-300">
                                        {conversa.categoria}
                                      </Badge>
                                    )}
                                    {conversa.privado && (
                                      <Badge variant="outline" className="px-1.5 py-0 h-4 text-[10px] bg-[#131d2e]/50 border-[#1e2a3e]/70 text-[#4A0D9F]">
                                        <Lock className="h-2 w-2 mr-0.5" /> privado
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                    {formatarTimestamp(conversa.updated_at)}
                                  </span>
                                </div>
                                
                                {/* Efeito de seleção */}
                                {selectedConversation === conversa.id && (
                                  <motion.div
                                    layoutId="selectedHighlightGrid"
                                    className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-[#0D23A0] to-[#4A0D9F]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Rodapé fixo */}
              <div className="sticky bottom-0 w-full p-3 border-t border-[#1e2a3e]/80 bg-[#0a0f1a]/90 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <Button
                    className="flex items-center bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] text-xs px-3 py-1 h-8 rounded-md border-none shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={criarNovoChat}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Novo chat
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-[#131d2e]/50 hover:bg-[#1e2a3e] border border-[#1e2a3e]/50"
                      title="Comando de voz"
                    >
                      <Mic className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-[#131d2e]/50 hover:bg-[#1e2a3e] border border-[#1e2a3e]/50"
                      title="Calendário"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de pré-visualização à direita */}
            <div className="w-2/3 h-full bg-[#070c16]/80 p-6 flex flex-col">
              {selectedConversation && conversaSelecionada ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center mr-3 shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-medium text-white">
                            {conversaSelecionada.title}
                          </h2>
                          {conversaSelecionada.categoria && (
                            <Badge className="bg-[#131d2e] text-xs">
                              {conversaSelecionada.categoria}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>
                            {conversaSelecionada.created_at.toLocaleDateString('pt-BR', { 
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                          {conversaSelecionada.privado && (
                            <Badge variant="outline" className="bg-transparent border-[#4A0D9F]/50 text-[#4A0D9F] px-1.5 py-0 h-5 text-[10px]">
                              <Lock className="h-2.5 w-2.5 mr-1" />
                              Privado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-[#1e2a3e] text-gray-400 hover:text-white"
                        onClick={(e) => toggleFavorito(conversaSelecionada.id, e)}
                        title={conversaSelecionada.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star className={`h-4 w-4 ${conversaSelecionada.favorito ? 'text-[#FF6B00] fill-[#FF6B00]' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-[#1e2a3e] text-gray-400 hover:text-white"
                        title="Compartilhar conversa"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-[#1e2a3e] text-gray-400 hover:text-white"
                        title="Exportar conversa"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-[#1e2a3e] text-gray-400 hover:text-red-500"
                        onClick={(e) => excluirConversa(conversaSelecionada.id, e)}
                        title="Excluir conversa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a1321]/50 rounded-lg p-4 mb-4 flex-1 overflow-hidden relative border border-[#1e2a3e]/50 shadow-inner">
                    <ScrollArea className="h-full pr-4">
                      {conversaSelecionada.resumo && (
                        <div className="mb-6 pb-5 border-b border-[#1e2a3e]/50">
                          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                            <Info className="h-3.5 w-3.5 mr-1.5 text-[#4A0D9F]" />
                            Resumo da conversa
                          </h3>
                          <p className="text-sm text-gray-300 leading-relaxed">{conversaSelecionada.resumo}</p>
                        </div>
                      )}
                      
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-2 border-[#0D23A0] border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversationMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              Nenhuma mensagem encontrada nesta conversa.
                            </div>
                          ) : (
                            conversationMessages.map((msg, index) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}
                              >
                                {msg.sender === "ai" && (
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center flex-shrink-0 mt-1">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                
                                <div 
                                  className={`rounded-lg p-3 max-w-[80%] ${
                                    msg.sender === "user" 
                                      ? "bg-[#1e2a3e] text-gray-200 rounded-tr-none" 
                                      : "bg-[#131d2e] text-gray-200 rounded-tl-none"
                                  } shadow-sm group relative`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  <div className="mt-1 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{formatarHoraMensagem(msg.timestamp)}</span>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 rounded-full hover:bg-[#1e2a3e] text-gray-500 hover:text-white"
                                        title="Copiar mensagem"
                                        onClick={() => {
                                          navigator.clipboard.writeText(msg.content);
                                          toast({
                                            title: "Mensagem copiada",
                                            description: "Conteúdo copiado para a área de transferência",
                                            duration: 2000
                                          });
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 rounded-full hover:bg-[#1e2a3e] text-gray-500 hover:text-white"
                                        title="Salvar mensagem"
                                      >
                                        <Bookmark className="h-3 w-3" />
                                      </Button>
                                      {msg.sender === "ai" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 rounded-full hover:bg-[#1e2a3e] text-gray-500 hover:text-white"
                                          title="Explorar mais"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {msg.sender === "user" && (
                                  <div className="h-8 w-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-white text-xs font-bold">
                                      {localStorage.getItem('headerUsername')?.substring(0, 2).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] py-2 rounded-md border-none text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={continuarConversa}
                      >
                        Continuar Conversa
                        <ArrowUpRight className="h-4 w-4 ml-1.5" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0 rounded-md border border-[#1e2a3e] bg-[#131d2e]/30 hover:bg-[#1e2a3e] text-gray-300"
                        onClick={() => setSelectedConversation(null)}
                        title="Voltar"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3
                    }}
                    className="mb-6"
                  >
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#0D23A0]/10 to-[#4A0D9F]/10 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0D23A0]/20 to-[#4A0D9F]/20 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0D23A0]/40 to-[#4A0D9F]/40 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center shadow-lg">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <h2 className="text-xl font-medium mb-3 text-white">Histórico de Conversas</h2>
                  <p className="text-gray-400 text-center max-w-md mb-6">
                    Selecione uma conversa do histórico para visualizar seu conteúdo ou 
                    inicie um novo chat privado para explorar novas ideias.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] rounded-md border-none text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={criarNovoChat}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Novo Chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default HistoricoConversasModal;
