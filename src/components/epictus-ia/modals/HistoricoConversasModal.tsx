
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  Tag,
  Brain,
  Edit,
  Pin,
  Star,
  Trash,
  RotateCcw,
  ClipboardCheck,
  FileText,
  Download,
  Book,
  Clock,
  ChevronDown,
  BarChart2,
  Key,
  Lightbulb,
  PenLine,
  Paperclip,
  RefreshCw,
  Share2,
  Split,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Tipos de dados para o histórico
interface Conversa {
  id: string;
  titulo: string;
  tipo: "explicacao" | "quiz" | "correcao" | "resumo" | "fluxograma";
  data: Date;
  tags: string[];
  preview: string;
  fixada: boolean;
  favorita: boolean;
  mensagens: Mensagem[];
  analise?: {
    qualidade: number;
    palavrasChave: string[];
    sugestoes: string[];
  };
  observacoes?: string;
}

interface Mensagem {
  id: string;
  remetente: "usuario" | "ia";
  conteudo: string;
  timestamp: Date;
  tipo?: "texto" | "imagem" | "codigo" | "quiz";
}

// Dados de exemplo para visualização
const conversasExemplo: Conversa[] = [
  {
    id: "1",
    titulo: "Teorema de Pitágoras e aplicações",
    tipo: "explicacao",
    data: new Date(2024, 6, 15, 14, 30),
    tags: ["Matemática", "Geometria"],
    preview: "Explicação detalhada do Teorema de Pitágoras e como aplicá-lo em problemas práticos...",
    fixada: true,
    favorita: true,
    mensagens: [
      {
        id: "m1",
        remetente: "usuario",
        conteudo: "Pode me explicar o Teorema de Pitágoras?",
        timestamp: new Date(2024, 6, 15, 14, 30)
      },
      {
        id: "m2",
        remetente: "ia",
        conteudo: "O Teorema de Pitágoras estabelece que em um triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos...",
        timestamp: new Date(2024, 6, 15, 14, 31)
      }
    ],
    analise: {
      qualidade: 95,
      palavrasChave: ["Triângulo retângulo", "Hipotenusa", "Catetos", "Geometria"],
      sugestoes: ["Revisar em 7 dias", "Aplicar em exercícios práticos"]
    }
  },
  {
    id: "2",
    titulo: "Preparação para redação ENEM",
    tipo: "correcao",
    data: new Date(2024, 6, 14, 10, 15),
    tags: ["ENEM", "Redação", "Urgente"],
    preview: "Análise e correção da redação sobre sustentabilidade com feedback detalhado...",
    fixada: false,
    favorita: true,
    mensagens: [
      {
        id: "m3",
        remetente: "usuario",
        conteudo: "Pode corrigir minha redação sobre sustentabilidade?",
        timestamp: new Date(2024, 6, 14, 10, 15)
      },
      {
        id: "m4",
        remetente: "ia",
        conteudo: "Sua redação está bem estruturada. Pontos fortes: argumentação coesa e repertório sociocultural. Pontos a melhorar: conclusão poderia propor soluções mais concretas...",
        timestamp: new Date(2024, 6, 14, 10, 17)
      }
    ],
    analise: {
      qualidade: 87,
      palavrasChave: ["Sustentabilidade", "Argumentação", "Coesão", "Propostas"],
      sugestoes: ["Praticar mais conclusões", "Rever em 3 dias"]
    }
  },
  {
    id: "3",
    titulo: "Simulado sobre Revolução Francesa",
    tipo: "quiz",
    data: new Date(2024, 6, 10, 16, 45),
    tags: ["História", "Simulado"],
    preview: "Quiz com 10 questões sobre causas e consequências da Revolução Francesa...",
    fixada: false,
    favorita: false,
    mensagens: [
      {
        id: "m5",
        remetente: "usuario",
        conteudo: "Crie um simulado sobre Revolução Francesa",
        timestamp: new Date(2024, 6, 10, 16, 45)
      },
      {
        id: "m6",
        remetente: "ia",
        conteudo: "Aqui está um simulado com 10 questões sobre a Revolução Francesa. 1. Qual evento marcou o início da Revolução Francesa?...",
        timestamp: new Date(2024, 6, 10, 16, 46),
        tipo: "quiz"
      }
    ],
    analise: {
      qualidade: 90,
      palavrasChave: ["Revolução Francesa", "Bastilha", "Monarquia", "Jacobinos"],
      sugestoes: ["Revisar conteúdo histórico", "Refazer simulado em uma semana"]
    }
  },
  {
    id: "4",
    titulo: "Resumo de Biologia Celular",
    tipo: "resumo",
    data: new Date(2024, 6, 8, 9, 20),
    tags: ["Biologia", "Celular"],
    preview: "Resumo completo sobre estrutura celular, organelas e suas funções...",
    fixada: false,
    favorita: false,
    mensagens: [
      {
        id: "m7",
        remetente: "usuario",
        conteudo: "Crie um resumo sobre biologia celular",
        timestamp: new Date(2024, 6, 8, 9, 20)
      },
      {
        id: "m8",
        remetente: "ia",
        conteudo: "# Biologia Celular - Resumo Completo\n\n## Estrutura Celular\nA célula é a unidade básica da vida...",
        timestamp: new Date(2024, 6, 8, 9, 21)
      }
    ],
    analise: {
      qualidade: 92,
      palavrasChave: ["Célula", "Organelas", "Mitocôndria", "Núcleo"],
      sugestoes: ["Transformar em flashcards", "Revisão espaçada"]
    }
  },
  {
    id: "5",
    titulo: "Fluxograma Fotossíntese",
    tipo: "fluxograma",
    data: new Date(2024, 6, 5, 11, 30),
    tags: ["Biologia", "Botânica"],
    preview: "Fluxograma detalhado do processo de fotossíntese com explicações...",
    fixada: false,
    favorita: true,
    mensagens: [
      {
        id: "m9",
        remetente: "usuario",
        conteudo: "Crie um fluxograma do processo de fotossíntese",
        timestamp: new Date(2024, 6, 5, 11, 30)
      },
      {
        id: "m10",
        remetente: "ia",
        conteudo: "Aqui está o fluxograma do processo de fotossíntese:\n\n[Diagrama com etapas da fotossíntese]",
        timestamp: new Date(2024, 6, 5, 11, 32)
      }
    ],
    analise: {
      qualidade: 98,
      palavrasChave: ["Fotossíntese", "Cloroplasto", "ATP", "Fase clara"],
      sugestoes: ["Imprimir esquema", "Comparar com respiração celular"]
    }
  }
];

// Mapeamento de ícones por tipo de conversa
const tipoIconMap = {
  explicacao: <FileText className="h-5 w-5 text-blue-500" />,
  quiz: <ClipboardCheck className="h-5 w-5 text-purple-500" />,
  correcao: <PenLine className="h-5 w-5 text-green-500" />,
  resumo: <Book className="h-5 w-5 text-amber-500" />,
  fluxograma: <Split className="h-5 w-5 text-cyan-500" />
};

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [filtro, setFiltro] = useState("");
  const [conversas, setConversas] = useState<Conversa[]>(conversasExemplo);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [tagFiltro, setTagFiltro] = useState<string | null>(null);
  const [dataFiltro, setDataFiltro] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<"padrao" | "linha-tempo">("padrao");
  const [observacoes, setObservacoes] = useState("");
  const [cardExpandido, setCardExpandido] = useState<string | null>(null);

  // Efeito para inicializar a conversa selecionada quando o modal abre
  useEffect(() => {
    if (open && conversas.length > 0 && !conversaSelecionada) {
      setConversaSelecionada(conversas[0]);
      setObservacoes(conversas[0].observacoes || "");
    }
  }, [open, conversas, conversaSelecionada]);

  // Função para filtrar conversas
  const conversasFiltradas = conversas.filter(conversa => {
    const matchesTermo = filtro
      ? conversa.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        conversa.preview.toLowerCase().includes(filtro.toLowerCase()) ||
        conversa.mensagens.some(m => m.conteudo.toLowerCase().includes(filtro.toLowerCase()))
      : true;
    
    const matchesTipo = tipoFiltro ? conversa.tipo === tipoFiltro : true;
    
    const matchesTag = tagFiltro
      ? conversa.tags.some(tag => tag.toLowerCase() === tagFiltro.toLowerCase())
      : true;
    
    // Filtragem básica por data (hoje, esta semana, este mês)
    const matchesData = dataFiltro ? filtrarPorData(conversa.data, dataFiltro) : true;
    
    return matchesTermo && matchesTipo && matchesTag && matchesData;
  });

  // Função auxiliar para filtrar por data
  const filtrarPorData = (data: Date, filtro: string): boolean => {
    const hoje = new Date();
    const umDiaEmMs = 24 * 60 * 60 * 1000;
    
    switch (filtro) {
      case "hoje":
        return data.toDateString() === hoje.toDateString();
      case "semana":
        const inicioSemana = new Date(hoje.getTime() - 7 * umDiaEmMs);
        return data >= inicioSemana;
      case "mes":
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return data >= inicioMes;
      default:
        return true;
    }
  };

  // Função para obter a lista de todas as tags disponíveis
  const todasTags = Array.from(
    new Set(conversas.flatMap(conversa => conversa.tags))
  );

  // Função para fixar/desfixar uma conversa
  const toggleFixar = (id: string) => {
    setConversas(prev => 
      prev.map(conversa => 
        conversa.id === id 
          ? { ...conversa, fixada: !conversa.fixada } 
          : conversa
      )
    );
  };

  // Função para favoritar/desfavoritar uma conversa
  const toggleFavorito = (id: string) => {
    setConversas(prev => 
      prev.map(conversa => 
        conversa.id === id 
          ? { ...conversa, favorita: !conversa.favorita } 
          : conversa
      )
    );
  };

  // Função para excluir uma conversa
  const excluirConversa = (id: string) => {
    setConversas(prev => prev.filter(conversa => conversa.id !== id));
    
    // Se a conversa excluída for a selecionada, selecione outra
    if (conversaSelecionada && conversaSelecionada.id === id) {
      const conversasRestantes = conversas.filter(c => c.id !== id);
      setConversaSelecionada(conversasRestantes.length > 0 ? conversasRestantes[0] : null);
    }
  };

  // Função para renomear uma conversa
  const renomearConversa = (id: string, novoTitulo: string) => {
    if (!novoTitulo.trim()) return;
    
    setConversas(prev => 
      prev.map(conversa => 
        conversa.id === id 
          ? { ...conversa, titulo: novoTitulo } 
          : conversa
      )
    );
  };

  // Função para lidar com clique em uma conversa
  const handleConversaClick = (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    setObservacoes(conversa.observacoes || "");
  };

  // Função para salvar observações
  const salvarObservacoes = () => {
    if (!conversaSelecionada) return;
    
    setConversas(prev => 
      prev.map(conversa => 
        conversa.id === conversaSelecionada.id 
          ? { ...conversa, observacoes } 
          : conversa
      )
    );
  };

  // Atualiza observações ao digitar
  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoes(e.target.value);
    // Implementação de auto-save com debounce seria ideal aqui
  };

  // Função para expandir/colapsar um card
  const toggleCardExpandido = (id: string) => {
    setCardExpandido(cardExpandido === id ? null : id);
  };

  // Mostrar conversas fixadas primeiro, depois por data
  const conversasOrdenadas = [...conversasFiltradas].sort((a, b) => {
    // Primeiro critério: fixadas no topo
    if (a.fixada && !b.fixada) return -1;
    if (!a.fixada && b.fixada) return 1;
    
    // Segundo critério: favoritas depois das fixadas
    if (a.favorita && !b.favorita) return -1;
    if (!a.favorita && b.favorita) return 1;
    
    // Terceiro critério: data (mais recente primeiro)
    return b.data.getTime() - a.data.getTime();
  });

  // Formatar data para exibição
  const formatarData = (data: Date): string => {
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje, ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem, ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] bg-gradient-to-br from-[#0D1117]/95 to-[#161B22]/95 backdrop-blur-md text-white border border-white/10 rounded-xl shadow-xl p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header principal do modal com título e ações principais */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-xl font-bold text-white">
                Histórico de Conversas
              </DialogTitle>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Busca semântica com IA */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text"
                  placeholder="Busca semântica - digite temas ou conceitos..."
                  className="pl-10 h-9 bg-[#1E2430] border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              </div>
              
              {/* Trocar modo visualização */}
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-sm flex items-center gap-1 ${modoVisualizacao === "linha-tempo" ? "bg-blue-900/30 text-blue-300" : "text-gray-300"}`}
                onClick={() => setModoVisualizacao(modo => modo === "padrao" ? "linha-tempo" : "padrao")}
              >
                {modoVisualizacao === "padrao" ? (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Linha do Tempo</span>
                  </>
                ) : (
                  <>
                    <Tabs className="h-4 w-4" />
                    <span>Visualização Padrão</span>
                  </>
                )}
              </Button>
              
              {/* Comparar conversas */}
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700/60"
              >
                <Split className="h-4 w-4" />
                <span>Comparar Conversas</span>
              </Button>
            </div>
          </div>
          
          {/* Corpo principal do modal em 3 colunas */}
          <div className="flex flex-1 overflow-hidden">
            {/* COLUNA ESQUERDA: Lista de Conversas */}
            <div className="w-1/4 border-r border-white/10 flex flex-col">
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                <h3 className="text-base font-semibold text-white">Suas Conversas</h3>
                
                <div className="flex items-center gap-2">
                  {/* Filtro por data */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 bg-[#1E2430] border-gray-700 text-white">
                      <DropdownMenuGroup>
                        <DropdownMenuItem 
                          className={dataFiltro === null ? "bg-blue-900/30" : ""}
                          onClick={() => setDataFiltro(null)}
                        >
                          Todas as datas
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={dataFiltro === "hoje" ? "bg-blue-900/30" : ""}
                          onClick={() => setDataFiltro("hoje")}
                        >
                          Hoje
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={dataFiltro === "semana" ? "bg-blue-900/30" : ""}
                          onClick={() => setDataFiltro("semana")}
                        >
                          Esta semana
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={dataFiltro === "mes" ? "bg-blue-900/30" : ""}
                          onClick={() => setDataFiltro("mes")}
                        >
                          Este mês
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Filtro por tag */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-[#1E2430] border-gray-700 text-white">
                      <DropdownMenuGroup>
                        <DropdownMenuItem 
                          className={tagFiltro === null ? "bg-blue-900/30" : ""}
                          onClick={() => setTagFiltro(null)}
                        >
                          Todas as tags
                        </DropdownMenuItem>
                        {todasTags.map(tag => (
                          <DropdownMenuItem 
                            key={tag}
                            className={tagFiltro === tag ? "bg-blue-900/30" : ""}
                            onClick={() => setTagFiltro(tag)}
                          >
                            {tag}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Filtro por tipo */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <Brain className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44 bg-[#1E2430] border-gray-700 text-white">
                      <DropdownMenuGroup>
                        <DropdownMenuItem 
                          className={tipoFiltro === null ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro(null)}
                        >
                          Todos os tipos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "explicacao" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("explicacao")}
                        >
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          Explicações
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "quiz" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("quiz")}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2 text-purple-500" />
                          Quizes/Simulados
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "correcao" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("correcao")}
                        >
                          <PenLine className="h-4 w-4 mr-2 text-green-500" />
                          Correções
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "resumo" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("resumo")}
                        >
                          <Book className="h-4 w-4 mr-2 text-amber-500" />
                          Resumos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "fluxograma" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("fluxograma")}
                        >
                          <Split className="h-4 w-4 mr-2 text-cyan-500" />
                          Fluxogramas
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Lista de conversas */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {conversasOrdenadas.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    conversasOrdenadas.map((conversa) => (
                      <motion.div
                        key={conversa.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 rounded-lg transition-all cursor-pointer group relative
                          ${conversaSelecionada?.id === conversa.id 
                            ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30' 
                            : 'hover:bg-[#1E2430] border border-transparent hover:border-white/10'
                          }
                          ${conversa.fixada ? 'border-l-2 border-l-blue-500' : ''}
                        `}
                        onClick={() => handleConversaClick(conversa)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {tipoIconMap[conversa.tipo]}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors flex items-center gap-1">
                                {conversa.titulo}
                                {conversa.favorita && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-1">
                                {conversa.preview}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {conversa.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline" 
                                    className="text-[10px] py-0 px-2 bg-[#1E2430]/80 text-gray-300 border-gray-700"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatarData(conversa.data)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-blue-400 hover:bg-[#1A1D2A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFixar(conversa.id);
                              }}
                              title={conversa.fixada ? "Desfixar" : "Fixar"}
                            >
                              <Pin className={`h-3.5 w-3.5 ${conversa.fixada ? "text-blue-400 fill-blue-400" : ""}`} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-yellow-400 hover:bg-[#1A1D2A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorito(conversa.id);
                              }}
                              title={conversa.favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                              <Star className={`h-3.5 w-3.5 ${conversa.favorita ? "text-yellow-400 fill-yellow-400" : ""}`} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-green-400 hover:bg-[#1A1D2A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                const novoTitulo = prompt("Novo título:", conversa.titulo);
                                if (novoTitulo) renomearConversa(conversa.id, novoTitulo);
                              }}
                              title="Renomear"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-[#1A1D2A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Tem certeza que deseja excluir esta conversa?")) {
                                  excluirConversa(conversa.id);
                                }
                              }}
                              title="Excluir"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-purple-400 hover:bg-[#1A1D2A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Conversa retomada! Esta funcionalidade seria integrada ao chat principal.");
                              }}
                              title="Retomar conversa"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* COLUNA CENTRAL: Pré-visualização inteligente */}
            <div className="w-2/4 border-r border-white/10 flex flex-col">
              {conversaSelecionada ? (
                <>
                  <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                        {tipoIconMap[conversaSelecionada.tipo]}
                      </div>
                      <h3 className="text-base font-semibold text-white">{conversaSelecionada.titulo}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-sm flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700/60"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                            <span>Ações Rápidas</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#1E2430] border-gray-700 text-white">
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
                              <ClipboardCheck className="h-4 w-4 mr-2 text-purple-500" />
                              <span>Gerar Quiz</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Book className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Transformar em Resumo</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2 text-green-500" />
                              <span>Exportar PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2 text-amber-500" />
                              <span>Mandar para Apostila</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Conversa</h4>
                    
                    <div className="space-y-4 mb-6">
                      {conversaSelecionada.mensagens.map(mensagem => (
                        <motion.div
                          key={mensagem.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-3 rounded-lg ${
                            mensagem.remetente === "usuario" 
                              ? "bg-[#1E2430] border border-[#2D3343]" 
                              : "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1A1D2A] text-gray-300">
                              {mensagem.remetente === "usuario" ? "Você" : "Epictus IA"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {mensagem.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">
                            {mensagem.conteudo.length > 150 
                              ? `${mensagem.conteudo.substring(0, 150)}...` 
                              : mensagem.conteudo}
                          </p>
                          {mensagem.conteudo.length > 150 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs mt-2 text-blue-400 hover:text-blue-300"
                            >
                              Mostrar mais
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-300 mt-6 mb-3">Visualização por Cards</h4>
                    
                    <div className="flex overflow-x-auto pb-4 space-x-3 mb-6 hide-scrollbar">
                      {conversaSelecionada.mensagens.map(mensagem => (
                        <motion.div
                          key={mensagem.id}
                          className={`flex-shrink-0 w-64 p-3 rounded-lg cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                            cardExpandido === mensagem.id
                              ? "w-96 ring-2 ring-blue-500"
                              : "hover:ring-1 hover:ring-blue-400/50"
                          } ${
                            mensagem.remetente === "usuario" 
                              ? "bg-[#1E2430] border border-[#2D3343]" 
                              : "bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20"
                          }`}
                          onClick={() => toggleCardExpandido(mensagem.id)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1A1D2A] text-gray-300">
                              {mensagem.remetente === "usuario" ? "Você" : "Epictus IA"}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <Paperclip className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-green-400 opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-purple-400 opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-sm text-gray-200 whitespace-pre-wrap ${cardExpandido === mensagem.id ? "" : "line-clamp-3"}`}>
                            {mensagem.conteudo}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Selecione uma conversa para visualizar</p>
                </div>
              )}
            </div>
            
            {/* COLUNA DIREITA: Detalhes e inteligência */}
            <div className="w-1/4 flex flex-col">
              {conversaSelecionada ? (
                <>
                  <div className="px-4 py-3 border-b border-white/10 flex items-center">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h3 className="text-base font-semibold text-white">Painel Inteligente</h3>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    {conversaSelecionada.analise && (
                      <>
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-blue-400" />
                            Análise de Qualidade
                          </h4>
                          <div className="bg-[#1A1D2A] rounded-lg p-3 border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-400">Qualidade do Estudo</span>
                              <span className={`text-sm font-medium ${
                                conversaSelecionada.analise.qualidade >= 90 
                                  ? "text-green-400" 
                                  : conversaSelecionada.analise.qualidade >= 70 
                                  ? "text-amber-400" 
                                  : "text-red-400"
                              }`}>{conversaSelecionada.analise.qualidade}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  conversaSelecionada.analise.qualidade >= 90 
                                    ? "bg-green-500" 
                                    : conversaSelecionada.analise.qualidade >= 70 
                                    ? "bg-amber-500" 
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${conversaSelecionada.analise.qualidade}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <Key className="h-4 w-4 text-amber-400" />
                            Palavras-Chave Identificadas
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {conversaSelecionada.analise.palavrasChave.map(palavra => (
                              <Badge 
                                key={palavra}
                                className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-200 border-blue-500/30 hover:border-blue-400"
                              >
                                {palavra}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            Sugestões da IA
                          </h4>
                          <ul className="space-y-2">
                            {conversaSelecionada.analise.sugestoes.map((sugestao, index) => (
                              <li 
                                key={index}
                                className="bg-[#1A1D2A] rounded-lg p-2 text-sm text-gray-300 border border-gray-700 hover:border-purple-500/30 hover:bg-gradient-to-r from-purple-900/20 to-indigo-900/20 transition-all cursor-pointer flex items-center gap-2"
                              >
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                {sugestao}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Minhas Observações</h4>
                      <textarea
                        className="w-full h-24 bg-[#1A1D2A] text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                        placeholder="Adicione suas observações aqui..."
                        value={observacoes}
                        onChange={handleObservacoesChange}
                        onBlur={salvarObservacoes}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-none"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Exportar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-[#1E2430]"
                      >
                        <Book className="h-3.5 w-3.5 mr-1" />
                        Para Caderno
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-[#1E2430]"
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Agendar Revisão
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-[#1E2430]"
                      >
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        Compartilhar
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        Linha do Tempo
                      </h4>
                      <div className="relative pl-5 border-l border-gray-700 space-y-3">
                        {conversaSelecionada.mensagens.map((mensagem, index) => (
                          <div key={mensagem.id} className="relative">
                            <div className="absolute -left-7 top-0 h-3 w-3 rounded-full bg-blue-500" />
                            <div className="text-xs text-gray-500 mb-1">
                              {mensagem.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className={`p-2 rounded text-xs ${
                              mensagem.remetente === "usuario" 
                                ? "bg-[#1E2430] text-gray-300" 
                                : "bg-gradient-to-r from-blue-900/20 to-purple-900/20 text-gray-200"
                            }`}>
                              {mensagem.conteudo.substring(0, 60)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Selecione uma conversa para ver detalhes</p>
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
