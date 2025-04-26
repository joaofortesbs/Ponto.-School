
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  Lock, 
  Mic, 
  ChevronDown, 
  Calendar, 
  X, 
  Clock
} from "lucide-react";
import { format, isYesterday, isToday, isThisWeek, isThisYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  user_id: string;
  preview?: string;
  messages?: any[];
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPainelInteligenteOpen, setIsPainelInteligenteOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Função para filtrar as conversas por data
  const filtrarPorData = (data: string) => {
    setDateFilter(data === dateFilter ? null : data);
  };

  // Função para carregar as conversas do usuário
  const carregarConversas = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Usuário não autenticado");
        setIsLoading(false);
        return;
      }
      
      // Buscar conversas do banco de dados
      const { data, error } = await supabase
        .from('user_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Erro ao carregar conversas:", error);
        setIsLoading(false);
        return;
      }
      
      // Transformar os dados para o formato necessário
      const conversationsData: Conversation[] = data.map((item: any) => {
        // Se conversation for uma string, tentar parseá-la como JSON
        let conversationObj;
        try {
          conversationObj = typeof item.conversation === 'string' 
            ? JSON.parse(item.conversation) 
            : item.conversation;
        } catch (e) {
          conversationObj = { title: "Conversa sem título" };
        }
        
        return {
          id: item.id,
          title: conversationObj.title || `Conversa ${new Date(item.created_at).toLocaleDateString()}`,
          timestamp: new Date(item.created_at),
          user_id: item.user_id,
          preview: conversationObj.preview || "Sem prévia disponível",
          messages: conversationObj.messages || []
        };
      });
      
      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
    } catch (error) {
      console.error("Erro ao processar conversas:", error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar seu histórico de conversas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar conversas quando o modal abrir
  useEffect(() => {
    if (open) {
      carregarConversas();
    }
  }, [open]);

  // Filtrar conversas baseado na pesquisa
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  // Filtrar por data quando o filtro de data mudar
  useEffect(() => {
    if (!dateFilter) {
      setFilteredConversations(conversations);
      return;
    }
    
    const today = new Date();
    let filtered: Conversation[] = [];
    
    switch (dateFilter) {
      case "hoje":
        filtered = conversations.filter(conversation => 
          isToday(conversation.timestamp)
        );
        break;
      case "ontem":
        filtered = conversations.filter(conversation => 
          isYesterday(conversation.timestamp)
        );
        break;
      case "semana":
        filtered = conversations.filter(conversation => 
          isThisWeek(conversation.timestamp) && 
          !isToday(conversation.timestamp) &&
          !isYesterday(conversation.timestamp)
        );
        break;
      case "mes":
        // Últimos 30 dias excluindo hoje, ontem e esta semana
        filtered = conversations.filter(conversation => {
          const thirtyDaysAgo = subDays(today, 30);
          return conversation.timestamp >= thirtyDaysAgo && 
            !isThisWeek(conversation.timestamp) &&
            !isToday(conversation.timestamp) &&
            !isYesterday(conversation.timestamp);
        });
        break;
      case "ano":
        // Este ano excluindo o último mês
        filtered = conversations.filter(conversation => {
          const thirtyDaysAgo = subDays(today, 30);
          return isThisYear(conversation.timestamp) && 
            conversation.timestamp < thirtyDaysAgo;
        });
        break;
      default:
        filtered = conversations;
    }
    
    setFilteredConversations(filtered);
  }, [dateFilter, conversations]);

  // Agrupar conversas por período
  const gruposConversas = {
    hoje: filteredConversations.filter(conversation => isToday(conversation.timestamp)),
    ontem: filteredConversations.filter(conversation => isYesterday(conversation.timestamp)),
    semana: filteredConversations.filter(conversation => 
      isThisWeek(conversation.timestamp) && 
      !isToday(conversation.timestamp) && 
      !isYesterday(conversation.timestamp)
    ),
    mes: filteredConversations.filter(conversation => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      return conversation.timestamp >= thirtyDaysAgo && 
        !isThisWeek(conversation.timestamp) &&
        !isToday(conversation.timestamp) &&
        !isYesterday(conversation.timestamp);
    }),
    ano: filteredConversations.filter(conversation => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      return isThisYear(conversation.timestamp) && 
        conversation.timestamp < thirtyDaysAgo;
    })
  };

  // Função para formatar a data relativa
  const formatarDataRelativa = (data: Date) => {
    if (isToday(data)) {
      return `Hoje, ${format(data, 'HH:mm')}`;
    }
    if (isYesterday(data)) {
      return `Ontem, ${format(data, 'HH:mm')}`;
    }
    if (isThisWeek(data)) {
      return format(data, "EEEE, HH:mm", { locale: ptBR });
    }
    return format(data, "d 'de' MMM, yyyy", { locale: ptBR });
  };

  // Função para criar uma nova conversa
  const criarNovoChat = () => {
    onOpenChange(false);
    // Limpar o chat atual (simulação)
    console.log("Criando novo chat privado");
    toast({
      title: "Novo chat privado",
      description: "Iniciando uma nova conversa"
    });
  };

  // Selecionar uma conversa e mostrar detalhes
  const selecionarConversa = (conversa: Conversation) => {
    setSelectedConversation(conversa);
    console.log("Conversa selecionada:", conversa);
  };

  // Função para excluir uma conversa
  const excluirConversa = async (conversaId: string) => {
    try {
      const { error } = await supabase
        .from('user_conversations')
        .delete()
        .eq('id', conversaId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de conversas
      setConversations(conversations.filter(c => c.id !== conversaId));
      if (selectedConversation?.id === conversaId) {
        setSelectedConversation(null);
      }
      
      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive"
      });
    }
  };
  
  // Função para retomar uma conversa
  const retomarConversa = (conversa: Conversation) => {
    if (!conversa.messages || conversa.messages.length === 0) {
      toast({
        title: "Erro ao retomar conversa",
        description: "Esta conversa não contém mensagens que possam ser retomadas.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Armazenar a conversa no localStorage para acesso posterior
      localStorage.setItem('epictus_retomar_conversa', JSON.stringify(conversa.messages));
      
      // Fechar o modal
      onOpenChange(false);
      
      toast({
        title: "Conversa retomada",
        description: "A conversa foi carregada com sucesso."
      });
      
      // Recarregar a página para atualizar o chat com a conversa selecionada
      // ou usar um callback se disponível para evitar recarregar a página
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Erro ao retomar conversa:", error);
      toast({
        title: "Erro ao retomar conversa",
        description: "Não foi possível carregar a conversa selecionada.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] bg-gradient-to-br from-[#0D1117]/90 to-[#161B22]/90 backdrop-blur-md text-white border border-white/10 rounded-xl shadow-xl p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header principal do modal com título e ações principais - mais discreto */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/30">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Histórico de Conversas
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setIsPainelInteligenteOpen(!isPainelInteligenteOpen)}
              >
                {isPainelInteligenteOpen ? "Fechar Painel" : "Expandir Painel"}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPainelInteligenteOpen ? 'rotate-180' : ''}`} />
              </Button>
              <DialogClose className="rounded-full p-1.5 hover:bg-white/10">
                <X className="h-4 w-4" />
              </DialogClose>
            </div>
          </div>

          <div className="flex flex-1 h-full overflow-hidden">
            {/* Seção esquerda - Lista de conversas */}
            <div className="w-1/3 border-r border-white/10 flex flex-col h-full">
              {/* Barra de pesquisa fixa */}
              <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar conversas..."
                    className="pl-10 bg-[#1A1D2D] border-white/10 focus-visible:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filtros de data */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2 py-1 h-auto border-white/10 ${dateFilter === 'hoje' ? 'bg-blue-600/30 border-blue-500/30' : 'bg-[#1A1D2D]'}`}
                    onClick={() => filtrarPorData('hoje')}
                  >
                    Hoje
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2 py-1 h-auto border-white/10 ${dateFilter === 'ontem' ? 'bg-blue-600/30 border-blue-500/30' : 'bg-[#1A1D2D]'}`}
                    onClick={() => filtrarPorData('ontem')}
                  >
                    Ontem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2 py-1 h-auto border-white/10 ${dateFilter === 'semana' ? 'bg-blue-600/30 border-blue-500/30' : 'bg-[#1A1D2D]'}`}
                    onClick={() => filtrarPorData('semana')}
                  >
                    Esta semana
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2 py-1 h-auto border-white/10 ${dateFilter === 'mes' ? 'bg-blue-600/30 border-blue-500/30' : 'bg-[#1A1D2D]'}`}
                    onClick={() => filtrarPorData('mes')}
                  >
                    Último mês
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2 py-1 h-auto border-white/10 ${dateFilter === 'ano' ? 'bg-blue-600/30 border-blue-500/30' : 'bg-[#1A1D2D]'}`}
                    onClick={() => filtrarPorData('ano')}
                  >
                    Este ano
                  </Button>
                </div>
              </div>

              {/* Ações e botão de novo chat */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/10">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                    onClick={() => setShowActions(!showActions)}
                  >
                    Ações
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${showActions ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showActions && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A1D2D] border border-white/10 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20"
                          onClick={() => {
                            toast({
                              title: "Arquivar conversas",
                              description: "Funcionalidade em desenvolvimento"
                            });
                            setShowActions(false);
                          }}
                        >
                          Arquivar conversas
                        </button>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20"
                          onClick={() => {
                            toast({
                              title: "Exportar histórico",
                              description: "Funcionalidade em desenvolvimento"
                            });
                            setShowActions(false);
                          }}
                        >
                          Exportar histórico
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm flex items-center gap-1 bg-[#1A1D2D] border-white/10 hover:bg-blue-600/20"
                  onClick={criarNovoChat}
                >
                  <Lock className="h-3 w-3" />
                  Criar novo chat privado
                </Button>
              </div>

              {/* Lista de conversas agrupadas por período */}
              <ScrollArea className="flex-1 overflow-auto">
                <div className="px-2 py-4">
                  {isLoading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}

                  {!isLoading && filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-2">Nenhuma conversa encontrada</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-sm flex items-center gap-1 bg-[#1A1D2D] border-white/10 hover:bg-blue-600/20"
                        onClick={criarNovoChat}
                      >
                        <Plus className="h-3 w-3" />
                        Iniciar uma nova conversa
                      </Button>
                    </div>
                  )}

                  {/* Grupo: Hoje */}
                  {gruposConversas.hoje.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-2">Hoje</h3>
                      <div className="space-y-1">
                        {gruposConversas.hoje.map((conversa) => (
                          <div 
                            key={conversa.id} 
                            className={`p-2 rounded-md cursor-pointer transition-colors ${selectedConversation?.id === conversa.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                            onClick={() => selecionarConversa(conversa)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium truncate flex-1">{conversa.title}</div>
                              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {format(conversa.timestamp, 'HH:mm')}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">
                              {conversa.preview || "Sem prévia disponível"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grupo: Ontem */}
                  {gruposConversas.ontem.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-2">Ontem</h3>
                      <div className="space-y-1">
                        {gruposConversas.ontem.map((conversa) => (
                          <div 
                            key={conversa.id} 
                            className={`p-2 rounded-md cursor-pointer transition-colors ${selectedConversation?.id === conversa.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                            onClick={() => selecionarConversa(conversa)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium truncate flex-1">{conversa.title}</div>
                              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {format(conversa.timestamp, 'HH:mm')}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">
                              {conversa.preview || "Sem prévia disponível"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grupo: Esta semana */}
                  {gruposConversas.semana.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-2">Esta semana</h3>
                      <div className="space-y-1">
                        {gruposConversas.semana.map((conversa) => (
                          <div 
                            key={conversa.id} 
                            className={`p-2 rounded-md cursor-pointer transition-colors ${selectedConversation?.id === conversa.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                            onClick={() => selecionarConversa(conversa)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium truncate flex-1">{conversa.title}</div>
                              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {format(conversa.timestamp, 'EEE, HH:mm', { locale: ptBR })}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">
                              {conversa.preview || "Sem prévia disponível"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grupo: Último mês */}
                  {gruposConversas.mes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-2">Último mês</h3>
                      <div className="space-y-1">
                        {gruposConversas.mes.map((conversa) => (
                          <div 
                            key={conversa.id} 
                            className={`p-2 rounded-md cursor-pointer transition-colors ${selectedConversation?.id === conversa.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                            onClick={() => selecionarConversa(conversa)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium truncate flex-1">{conversa.title}</div>
                              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {format(conversa.timestamp, 'd MMM', { locale: ptBR })}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">
                              {conversa.preview || "Sem prévia disponível"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grupo: Este ano */}
                  {gruposConversas.ano.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-2">Este ano</h3>
                      <div className="space-y-1">
                        {gruposConversas.ano.map((conversa) => (
                          <div 
                            key={conversa.id} 
                            className={`p-2 rounded-md cursor-pointer transition-colors ${selectedConversation?.id === conversa.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                            onClick={() => selecionarConversa(conversa)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium truncate flex-1">{conversa.title}</div>
                              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {format(conversa.timestamp, 'd MMM', { locale: ptBR })}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">
                              {conversa.preview || "Sem prévia disponível"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer com botão de novo chat */}
              <div className="border-t border-white/10 p-4 bg-black/20">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm flex items-center gap-1 bg-[#1A1D2D] border-white/10 hover:bg-blue-600/20"
                    onClick={criarNovoChat}
                  >
                    <Lock className="h-3 w-3" />
                    Criar novo chat privado
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Seção direita - Painel Inteligente (somente quando expandido) */}
            {isPainelInteligenteOpen && (
              <div className="w-2/3 h-full bg-[#0A0D14] overflow-hidden flex flex-col">
                {selectedConversation ? (
                  <div className="flex flex-col h-full">
                    {/* Header da conversa */}
                    <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{selectedConversation.title}</h3>
                        <p className="text-xs text-gray-400">{formatarDataRelativa(selectedConversation.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => retomarConversa(selectedConversation)}
                        >
                          Retomar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-red-900/20"
                          onClick={() => excluirConversa(selectedConversation.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                    
                    {/* Conteúdo da conversa */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-6">
                        {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                          selectedConversation.messages.map((msg, index) => (
                            <div 
                              key={index} 
                              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  msg.sender === 'user' 
                                    ? 'bg-blue-600/30 text-white' 
                                    : 'bg-[#1A1D2D] text-white'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <span className="text-xs text-gray-400 block mt-1">
                                  {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-gray-400">
                            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Detalhes da conversa não disponíveis</p>
                            <p className="text-sm mt-1">Os detalhes completos desta conversa não puderam ser carregados.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                    <Calendar className="h-16 w-16 mb-4 opacity-30" />
                    <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                    <p className="text-sm max-w-md">
                      Escolha uma conversa da lista para visualizar seu conteúdo e detalhes aqui.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
