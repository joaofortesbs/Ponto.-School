
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
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
  ArrowUpRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Conversa {
  id: string;
  titulo: string;
  timestamp: Date;
  favorito?: boolean;
  privado?: boolean;
  categoria?: string;
  resumo?: string;
  messages?: {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
  }[];
}

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversasData, setConversasData] = useState<Conversa[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState("todas");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para rolar até o final das mensagens quando uma conversa é selecionada
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Gerar dados simulados ao montar o componente
  useEffect(() => {
    // Dados de exemplo para conversas
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const ultimos7Dias = new Date(hoje);
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);
    
    const esteAno = new Date(hoje);
    esteAno.setMonth(esteAno.getMonth() - 3);

    const dadosSimulados: Conversa[] = [
      {
        id: "1",
        titulo: "Otimização de algoritmos de busca",
        timestamp: new Date(hoje.setHours(hoje.getHours() - 2)),
        favorito: true,
        privado: true,
        categoria: "tecnologia",
        resumo: "Discussão sobre diferentes métodos de otimização para algoritmos de busca, incluindo análise de complexidade e casos de uso.",
        messages: [
          { id: "m1", content: "Como posso otimizar um algoritmo de busca binária?", sender: "user", timestamp: new Date(hoje.setMinutes(hoje.getMinutes() - 30)) },
          { id: "m2", content: "A busca binária já é um algoritmo otimizado com complexidade O(log n). Para otimizá-lo ainda mais, você pode considerar: 1) Usar arrays ordenados para aproveitar ao máximo o algoritmo; 2) Implementar uma versão iterativa em vez de recursiva para evitar overhead de pilha; 3) Em grandes conjuntos de dados, considerar estruturas de dados especializadas como árvores B ou tabelas hash.", sender: "ai", timestamp: new Date(hoje.setMinutes(hoje.getMinutes() - 29)) },
          { id: "m3", content: "E quanto à busca em estruturas mais complexas como grafos?", sender: "user", timestamp: new Date(hoje.setMinutes(hoje.getMinutes() - 25)) }
        ]
      },
      {
        id: "2",
        titulo: "Desenvolvimento de interfaces responsivas",
        timestamp: new Date(ontem.setHours(ontem.getHours() - 5)),
        categoria: "design",
        resumo: "Exploração de técnicas modernas para criar interfaces responsivas que se adaptam a diferentes tamanhos de tela.",
        messages: [
          { id: "m4", content: "Quais são as melhores práticas para interfaces responsivas em 2024?", sender: "user", timestamp: new Date(ontem.setMinutes(ontem.getMinutes() - 45)) },
          { id: "m5", content: "Em 2024, as melhores práticas para interfaces responsivas incluem: uso de design system consistente, abordagem mobile-first, CSS Grid e Flexbox para layouts flexíveis, componentes adaptáveis por contexto, e uso de media queries estratégicas.", sender: "ai", timestamp: new Date(ontem.setMinutes(ontem.getMinutes() - 43)) }
        ]
      },
      {
        id: "3",
        titulo: "Estudo sobre inteligência artificial avançada",
        timestamp: new Date(ontem),
        favorito: true,
        categoria: "ia",
        resumo: "Análise profunda sobre modelos de IA modernos, arquiteturas de transformers e aplicações práticas.",
        messages: [
          { id: "m6", content: "Explique como funcionam os modelos de transformer em detalhes", sender: "user", timestamp: new Date(ontem.setMinutes(ontem.getMinutes() - 120)) },
          { id: "m7", content: "Os transformers são arquiteturas de redes neurais que utilizam mecanismos de atenção para processar dados sequenciais como texto. Diferente de RNNs, eles processam toda a sequência simultaneamente, permitindo paralelização e captura de dependências de longo alcance.", sender: "ai", timestamp: new Date(ontem.setMinutes(ontem.getMinutes() - 118)) }
        ]
      },
      {
        id: "4",
        titulo: "Estratégias para aprendizado de máquina",
        timestamp: new Date(ultimos7Dias.setDate(ultimos7Dias.getDate() + 2)),
        categoria: "ia",
        resumo: "Discussão sobre métodos eficientes de treinamento e validação de modelos de machine learning.",
        messages: [
          { id: "m8", content: "Quais são as melhores estratégias para evitar overfitting?", sender: "user", timestamp: new Date(ultimos7Dias.setMinutes(ultimos7Dias.getMinutes() - 60)) },
          { id: "m9", content: "Para evitar overfitting, você pode utilizar: regularização (L1, L2), dropout, data augmentation, early stopping, validação cruzada, e conjuntos de dados maiores.", sender: "ai", timestamp: new Date(ultimos7Dias.setMinutes(ultimos7Dias.getMinutes() - 58)) }
        ]
      },
      {
        id: "5",
        titulo: "Técnicas de processamento de linguagem natural",
        timestamp: new Date(ultimos7Dias),
        privado: true,
        categoria: "ia",
        resumo: "Exploração de métodos avançados de NLP para análise semântica e geração de texto.",
        messages: [
          { id: "m10", content: "Quais são as técnicas modernas de NLP além dos transformers?", sender: "user", timestamp: new Date(ultimos7Dias.setMinutes(ultimos7Dias.getMinutes() - 75)) },
          { id: "m11", content: "Além dos transformers, as técnicas modernas de NLP incluem: modelos híbridos com CNNs, sistemas de retrieval-augmented generation (RAG), aprendizado por reforço com feedback humano (RLHF), e arquiteturas específicas como Mamba (SSMs).", sender: "ai", timestamp: new Date(ultimos7Dias.setMinutes(ultimos7Dias.getMinutes() - 73)) }
        ]
      },
      {
        id: "6",
        titulo: "Frameworks modernos para desenvolvimento web",
        timestamp: new Date(esteAno),
        categoria: "tecnologia",
        resumo: "Comparação entre os principais frameworks web modernos e seus casos de uso ideais.",
        messages: [
          { id: "m12", content: "Qual a diferença entre React, Vue e Svelte?", sender: "user", timestamp: new Date(esteAno.setMinutes(esteAno.getMinutes() - 90)) },
          { id: "m13", content: "React utiliza Virtual DOM e é baseado em componentes com JSX. Vue combina reatividade declarativa com templates. Svelte é um compilador que converte código em JavaScript otimizado sem runtime virtual DOM. React tem maior ecossistema, Vue é mais fácil de integrar, e Svelte oferece melhor performance com menos código.", sender: "ai", timestamp: new Date(esteAno.setMinutes(esteAno.getMinutes() - 88)) }
        ]
      },
      {
        id: "7",
        titulo: "Composição e estruturas de dados avançadas",
        timestamp: new Date(esteAno.setDate(esteAno.getDate() + 15)),
        categoria: "tecnologia",
        resumo: "Abordagem detalhada sobre estruturas de dados complexas e sua aplicação em algoritmos eficientes.",
        messages: [
          { id: "m14", content: "Quando devo usar uma árvore B+ em vez de uma árvore binária?", sender: "user", timestamp: new Date(esteAno.setMinutes(esteAno.getMinutes() - 110)) },
          { id: "m15", content: "Árvores B+ são preferíveis quando você trabalha com sistemas que acessam dados em blocos, como bancos de dados e sistemas de arquivos. Elas maximizam o uso da memória cache e minimizam operações de I/O ao armazenar mais chaves por nó. Árvores binárias são mais simples para operações em memória com conjuntos de dados menores.", sender: "ai", timestamp: new Date(esteAno.setMinutes(esteAno.getMinutes() - 108)) }
        ]
      }
    ];

    setConversasData(dadosSimulados);
  }, []);

  useEffect(() => {
    // Quando uma conversa é selecionada, role para o final das mensagens
    if (selectedConversation) {
      scrollToBottom();
    }
    
    // Quando o modal abre, foque no campo de pesquisa
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [selectedConversation, open]);

  // Função para agrupar conversas por período
  const agruparConversas = () => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const ultimos7Dias = new Date(hoje);
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);
    
    const grupos: {[key: string]: Conversa[]} = {
      "HOJE": [],
      "ONTEM": [],
      "ÚLTIMOS 7 DIAS": [],
      "ESTE ANO": []
    };

    let conversasFiltradas = conversasData;
    
    // Filtro por termo de pesquisa
    if (searchTerm) {
      conversasFiltradas = conversasFiltradas.filter(conversa => 
        conversa.titulo.toLowerCase().includes(searchTerm.toLowerCase())
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
      const data = new Date(conversa.timestamp);
      
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
      grupos[key].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
    console.log("Criando novo chat privado");
    onOpenChange(false); // Fechar o modal após criar novo chat
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

  const toggleFavorito = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversasData(prevState => 
      prevState.map(conversa => 
        conversa.id === id 
          ? { ...conversa, favorito: !conversa.favorito } 
          : conversa
      )
    );
  };

  const togglePrivado = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversasData(prevState => 
      prevState.map(conversa => 
        conversa.id === id 
          ? { ...conversa, privado: !conversa.privado } 
          : conversa
      )
    );
  };

  const excluirConversa = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
      setConversasData(prevState => prevState.filter(conversa => conversa.id !== id));
      if (selectedConversation === id) {
        setSelectedConversation(null);
      }
    }
  };

  const continuarConversa = () => {
    console.log(`Continuando conversa: ${selectedConversation}`);
    onOpenChange(false);
  };

  const grupos = agruparConversas();
  const conversaSelecionada = selectedConversation ? conversasData.find(c => c.id === selectedConversation) : null;
  const todasCategorias = Array.from(new Set(conversasData.map(c => c.categoria).filter(Boolean)));

  // Verificar se há resultados após a filtragem
  const temResultados = Object.values(grupos).some(grupo => grupo.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none sm:rounded-xl text-white"
        style={{ 
          width: "85vw", 
          height: "85vh",
          background: "linear-gradient(145deg, #0a0f1a 0%, #131d2e 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
        }}>
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
                {!temResultados && (
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

                {Object.keys(grupos).map(periodo => {
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
                                        {conversa.titulo}
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
                                      {formatarTimestamp(conversa.timestamp)}
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
                                    <h4 className="text-xs font-medium text-gray-200 truncate max-w-[100px]">{conversa.titulo}</h4>
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
                                  {formatarTimestamp(conversa.timestamp)}
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
                          {conversaSelecionada.titulo}
                        </h2>
                        {conversaSelecionada.categoria && (
                          <Badge className="bg-[#131d2e] text-xs">
                            {conversaSelecionada.categoria}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>
                          {conversaSelecionada.timestamp.toLocaleDateString('pt-BR', { 
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
                    
                    <div className="space-y-4">
                      {conversaSelecionada.messages?.map((msg, index) => (
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
                              <span className="text-white text-xs font-bold">JF</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
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
    </Dialog>
  );
};

export default HistoricoConversasModal;
