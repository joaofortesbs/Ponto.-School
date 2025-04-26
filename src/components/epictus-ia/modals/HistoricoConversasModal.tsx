
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Clock,
  Calendar,
  Pin,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Archive,
  FileText,
  BookOpen,
  Brain,
  Tool,
  Filter,
  ChevronRight,
  Download,
  Copy,
  Share,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  CheckSquare,
  Code,
  Bookmark,
  PenTool,
  Zap,
  BarChart
} from "lucide-react";

// Definir tipos para as conversas
interface Conversa {
  id: string;
  titulo: string;
  tipo: "conteudo" | "duvidas" | "correcao" | "simulado" | "resumo";
  timestamp: Date;
  fixada: boolean;
  favorita: boolean;
  tags: string[];
  previa: string;
  conteudo: ConteudoItem[];
  disciplina?: string;
}

interface ConteudoItem {
  id: string;
  tipo: "pergunta" | "resposta" | "imagem" | "codigo" | "simulado" | "quiz";
  conteudo: string;
  timestamp: Date;
}

// Componente para o modal de histórico
const HistoricoConversasModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState<string | null>(null);

  // Carregar conversas do localStorage ou de uma API
  useEffect(() => {
    if (open) {
      try {
        // Tentar carregar do localStorage primeiro
        const savedMessages = localStorage.getItem('epictus_beta_chat');
        if (savedMessages) {
          const mensagens = JSON.parse(savedMessages);
          
          // Transformar as mensagens em conversas agrupadas
          // Esta é uma simulação - em produção você teria uma lógica mais robusta
          const conversasSimuladas: Conversa[] = [
            {
              id: "conv-1",
              titulo: "Estudo sobre Função Afim",
              tipo: "conteudo",
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
              fixada: true,
              favorita: true,
              tags: ["Matemática", "Enem", "Importante"],
              previa: "Estudamos o conceito de função afim, suas propriedades e aplicações...",
              conteudo: [
                {
                  id: "msg-1",
                  tipo: "pergunta",
                  conteudo: "Pode me explicar o que é uma função afim e como aplicá-la?",
                  timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                },
                {
                  id: "msg-2",
                  tipo: "resposta",
                  conteudo: "Uma função afim é uma função do tipo f(x) = ax + b, onde a e b são constantes reais e a ≠ 0...",
                  timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                }
              ],
              disciplina: "Matemática"
            },
            {
              id: "conv-2",
              titulo: "Revolução Industrial",
              tipo: "duvidas",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
              fixada: false,
              favorita: false,
              tags: ["História", "Revisão"],
              previa: "Discutimos os principais eventos da Revolução Industrial e seus impactos...",
              conteudo: [
                {
                  id: "msg-3",
                  tipo: "pergunta",
                  conteudo: "Quais foram as principais causas da Revolução Industrial?",
                  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                },
                {
                  id: "msg-4",
                  tipo: "resposta",
                  conteudo: "A Revolução Industrial teve várias causas importantes, incluindo...",
                  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                }
              ],
              disciplina: "História"
            },
            {
              id: "conv-3",
              titulo: "Correção de redação ENEM",
              tipo: "correcao",
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
              fixada: false,
              favorita: true,
              tags: ["Redação", "Enem", "Urgente"],
              previa: "Análise da estrutura argumentativa e sugestões de melhoria...",
              conteudo: [
                {
                  id: "msg-5",
                  tipo: "pergunta",
                  conteudo: "Pode corrigir minha redação sobre desafios da educação no Brasil?",
                  timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
                },
                {
                  id: "msg-6",
                  tipo: "resposta",
                  conteudo: "Aqui está a correção da sua redação, com pontos fortes e sugestões de melhoria...",
                  timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
                }
              ],
              disciplina: "Redação"
            },
            {
              id: "conv-4",
              titulo: "Simulado de Física - Mecânica",
              tipo: "simulado",
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
              fixada: false,
              favorita: false,
              tags: ["Física", "Simulado"],
              previa: "Simulado com 10 questões sobre Leis de Newton e aplicações...",
              conteudo: [
                {
                  id: "msg-7",
                  tipo: "pergunta",
                  conteudo: "Gere um simulado com 10 questões sobre Leis de Newton",
                  timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                },
                {
                  id: "msg-8",
                  tipo: "simulado",
                  conteudo: "Simulado gerado com 10 questões sobre Leis de Newton...",
                  timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                }
              ],
              disciplina: "Física"
            }
          ];
          
          setConversas(conversasSimuladas);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        // Fallback para conversas simuladas em caso de erro
      }
    }
  }, [open]);

  // Selecionar a primeira conversa automaticamente
  useEffect(() => {
    if (conversas.length > 0 && !conversaSelecionada) {
      setConversaSelecionada(conversas[0]);
    }
  }, [conversas, conversaSelecionada]);

  // Filtrar conversas com base nos critérios selecionados
  const conversasFiltradas = conversas.filter(conversa => {
    // Filtro por texto de busca
    const buscaMatch = filtroBusca 
      ? conversa.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) || 
        conversa.previa.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        conversa.tags.some(tag => tag.toLowerCase().includes(filtroBusca.toLowerCase()))
      : true;
      
    // Filtro por tipo
    const tipoMatch = filtroTipo 
      ? conversa.tipo === filtroTipo
      : true;
      
    // Filtro por período
    let periodoMatch = true;
    if (filtroPeriodo) {
      const agora = new Date();
      if (filtroPeriodo === "hoje") {
        periodoMatch = conversa.timestamp.toDateString() === agora.toDateString();
      } else if (filtroPeriodo === "semana") {
        const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodoMatch = conversa.timestamp >= umaSemanaAtras;
      } else if (filtroPeriodo === "mes") {
        const umMesAtras = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
        periodoMatch = conversa.timestamp >= umMesAtras;
      }
    }
    
    return buscaMatch && tipoMatch && periodoMatch;
  });

  // Organizar conversas: primeiro fixadas, depois por data
  const conversasOrdenadas = [...conversasFiltradas].sort((a, b) => {
    // Primeiro critério: fixadas no topo
    if (a.fixada && !b.fixada) return -1;
    if (!a.fixada && b.fixada) return 1;
    
    // Segundo critério: data (mais recente primeiro)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  // Função para obter ícone conforme o tipo da conversa
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "conteudo":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "duvidas":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "correcao":
        return <Tool className="h-4 w-4 text-orange-500" />;
      case "simulado":
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case "resumo":
        return <FileText className="h-4 w-4 text-indigo-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };

  // Função para formatar data
  const formatarData = (data: Date) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje, ${data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem, ${data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Função para continuar uma conversa
  const continuarConversa = (conversaId: string) => {
    // Lógica para redirecionar para a conversa ou reabri-la
    console.log("Continuando conversa:", conversaId);
    onOpenChange(false); // Fechar modal
    // Aqui você redirecionaria ou iniciaria a conversa
  };

  // Função para fixar/desfixar conversa
  const toggleFixarConversa = (conversa: Conversa, event: React.MouseEvent) => {
    event.stopPropagation();
    const novaLista = conversas.map(c => 
      c.id === conversa.id ? { ...c, fixada: !c.fixada } : c
    );
    setConversas(novaLista);
  };

  // Função para favoritar/desfavoritar conversa
  const toggleFavoritarConversa = (conversa: Conversa, event: React.MouseEvent) => {
    event.stopPropagation();
    const novaLista = conversas.map(c => 
      c.id === conversa.id ? { ...c, favorita: !c.favorita } : c
    );
    setConversas(novaLista);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] h-[80vh] p-0 rounded-xl border-0 shadow-2xl bg-background">
        <motion.div 
          className="w-full h-full rounded-xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Cabeçalho do Modal */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Histórico de Conversas</h2>
            </div>
            
            {/* Barra de busca e filtros */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/70" />
                <Input
                  placeholder="Buscar nas conversas..."
                  className="pl-8 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setMostrarDetalhes(false)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros
                </Button>
              </div>
            </div>
          </div>
          
          {/* Conteúdo Principal - Layout de 3 colunas */}
          <div className="flex h-full divide-x">
            {/* Coluna 1: Lista de Conversas */}
            <div className="w-1/3 h-full flex flex-col border-r">
              <div className="p-3 border-b flex justify-between">
                <Tabs defaultValue="todas" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                    <TabsTrigger value="favoritas">Favoritas</TabsTrigger>
                    <TabsTrigger value="arquivadas">Arquivadas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="p-3 border-b">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={filtroPeriodo === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroPeriodo(null)}
                    className="text-xs h-7"
                  >
                    Todas
                  </Button>
                  <Button 
                    variant={filtroPeriodo === "hoje" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroPeriodo("hoje")}
                    className="text-xs h-7"
                  >
                    Hoje
                  </Button>
                  <Button 
                    variant={filtroPeriodo === "semana" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroPeriodo("semana")}
                    className="text-xs h-7"
                  >
                    Esta semana
                  </Button>
                  <Button 
                    variant={filtroPeriodo === "mes" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroPeriodo("mes")}
                    className="text-xs h-7"
                  >
                    Este mês
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border-b">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={filtroTipo === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo(null)}
                    className="text-xs h-7"
                  >
                    Todos tipos
                  </Button>
                  <Button 
                    variant={filtroTipo === "conteudo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo("conteudo")}
                    className="text-xs h-7"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Conteúdos
                  </Button>
                  <Button 
                    variant={filtroTipo === "duvidas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo("duvidas")}
                    className="text-xs h-7"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Dúvidas
                  </Button>
                  <Button 
                    variant={filtroTipo === "correcao" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo("correcao")}
                    className="text-xs h-7"
                  >
                    <Tool className="h-3 w-3 mr-1" />
                    Correções
                  </Button>
                  <Button 
                    variant={filtroTipo === "simulado" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo("simulado")}
                    className="text-xs h-7"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Simulados
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <AnimatePresence>
                  {conversasOrdenadas.length > 0 ? (
                    <div className="px-2 py-1">
                      {conversasOrdenadas.map((conversa) => (
                        <motion.div
                          key={conversa.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`mb-2 p-3 rounded-lg cursor-pointer group border transition-all ${
                            conversaSelecionada?.id === conversa.id
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-100 dark:border-gray-700"
                          }`}
                          onClick={() => setConversaSelecionada(conversa)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              <div className={`mt-0.5 p-1 rounded-md ${
                                conversa.tipo === "conteudo" ? "bg-blue-100 dark:bg-blue-900/50" :
                                conversa.tipo === "duvidas" ? "bg-purple-100 dark:bg-purple-900/50" :
                                conversa.tipo === "correcao" ? "bg-orange-100 dark:bg-orange-900/50" :
                                conversa.tipo === "simulado" ? "bg-green-100 dark:bg-green-900/50" :
                                "bg-indigo-100 dark:bg-indigo-900/50"
                              }`}>
                                {getTipoIcon(conversa.tipo)}
                              </div>
                              <div>
                                <h3 className="font-medium line-clamp-1">{conversa.titulo}</h3>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <Calendar className="h-3 w-3 mr-1" /> 
                                  {formatarData(conversa.timestamp)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <motion.button 
                                className={`p-1 rounded-full ${conversa.fixada 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                                onClick={(e) => toggleFixarConversa(conversa, e)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Pin className="h-4 w-4" />
                              </motion.button>
                              
                              <motion.button 
                                className={`p-1 rounded-full ${conversa.favorita 
                                  ? 'text-yellow-500' 
                                  : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                                onClick={(e) => toggleFavoritarConversa(conversa, e)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Star className="h-4 w-4" />
                              </motion.button>
                              
                              <motion.button 
                                className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Lógica para menu de opções
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {conversa.previa}
                          </p>
                          
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {conversa.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs py-0 px-2">
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-2 pt-2 border-t flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => continuarConversa(conversa.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Recontinuar
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-40 p-6">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="mt-4 font-medium">Nenhuma conversa encontrada</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tente ajustar seus filtros ou realizar novas conversas.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
            
            {/* Coluna 2: Prévia da Conversa Selecionada */}
            <div className="w-1/3 h-full flex flex-col border-r">
              {conversaSelecionada ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{conversaSelecionada.titulo}</h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMostrarDetalhes(true)}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Expandir Detalhes
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTipoIcon(conversaSelecionada.tipo)}
                        {conversaSelecionada.tipo.charAt(0).toUpperCase() + conversaSelecionada.tipo.slice(1)}
                      </Badge>
                      
                      {conversaSelecionada.disciplina && (
                        <Badge variant="outline">
                          {conversaSelecionada.disciplina}
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatarData(conversaSelecionada.timestamp)}
                      </Badge>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          Sugestão Inteligente
                        </h3>
                        <p className="text-sm">
                          Baseado nesta conversa, você pode:
                        </p>
                        <div className="mt-2 space-y-2">
                          <Button className="w-full justify-start text-sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Gerar quiz sobre este tema
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <Share className="h-4 w-4 mr-2" />
                            Exportar para apostila
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar revisão em 5 dias
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Resumo Visual
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {conversaSelecionada.conteudo.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="border rounded-lg p-3 bg-white dark:bg-gray-800"
                            >
                              <div className="text-xs text-gray-500 mb-1 flex items-center">
                                {item.tipo === "pergunta" ? (
                                  <>
                                    <PenTool className="h-3 w-3 mr-1 text-purple-500" />
                                    <span>Sua pergunta</span>
                                  </>
                                ) : item.tipo === "resposta" ? (
                                  <>
                                    <Brain className="h-3 w-3 mr-1 text-blue-500" />
                                    <span>Resposta do Epictus</span>
                                  </>
                                ) : item.tipo === "simulado" ? (
                                  <>
                                    <CheckSquare className="h-3 w-3 mr-1 text-green-500" />
                                    <span>Simulado</span>
                                  </>
                                ) : (
                                  <>
                                    <Code className="h-3 w-3 mr-1 text-orange-500" />
                                    <span>Código</span>
                                  </>
                                )}
                              </div>
                              
                              <p className="text-sm line-clamp-3">{item.conteudo}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <BarChart className="h-4 w-4 mr-1" />
                          Análise de Interação
                        </h3>
                        
                        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Profundidade da conversa</span>
                            <Badge>Alta</Badge>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Esta conversa teve um nível de profundidade alto, com explicações detalhadas e análises aprofundadas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <Button 
                      className="w-full"
                      onClick={() => continuarConversa(conversaSelecionada.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continuar esta conversa
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 font-medium">Nenhuma conversa selecionada</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Selecione uma conversa para visualizar sua prévia
                  </p>
                </div>
              )}
            </div>
            
            {/* Coluna 3: Detalhes da Conversa */}
            <AnimatePresence>
              {mostrarDetalhes && conversaSelecionada && (
                <motion.div 
                  className="w-1/3 h-full flex flex-col overflow-hidden"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Conteúdo Completo</h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMostrarDetalhes(false)}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Salvar Anotação
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      {conversaSelecionada.conteudo.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg ${
                            item.tipo === "pergunta" 
                              ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800" 
                              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {item.tipo === "pergunta" ? (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                    <PenTool className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                  </div>
                                  <span className="ml-2 font-medium">Você</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                  </div>
                                  <span className="ml-2 font-medium">Epictus IA</span>
                                </>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatarData(item.timestamp)}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            {item.conteudo}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Exportar PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4 mr-1" />
                        Compartilhar
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
