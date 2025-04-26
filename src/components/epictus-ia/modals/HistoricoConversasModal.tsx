
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { getUserConversations, SavedConversation, updateConversation, deleteConversation } from "@/services/aiChatService";
import { Cross2Icon } from "@radix-ui/react-icons";
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
  Sparkles,
  MoreHorizontal,
  MessageCircle,
  Reply,
  ExternalLink,
  AlignJustify,
  ChevronRight,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen
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

// Estado inicial vazio para o carregamento das conversas
const conversasIniciais: Conversa[] = [];

// Função auxiliar para gerar análise automática de conversa
const gerarAnaliseAutomatica = (mensagens: Mensagem[]): { qualidade: number; palavrasChave: string[]; sugestoes: string[] } => {
  // Extrair todo o texto da conversa
  const textoCompleto = mensagens.map(m => m.conteudo).join(' ').toLowerCase();
  
  // Detector simples de palavras-chave por área de conhecimento
  const potenciaisPalavrasChave = [
    // Matemática
    { palavra: "equação", area: "Matemática" },
    { palavra: "teorema", area: "Matemática" },
    { palavra: "triângulo", area: "Geometria" },
    { palavra: "função", area: "Matemática" },
    { palavra: "álgebra", area: "Matemática" },
    
    // Física
    { palavra: "força", area: "Física" },
    { palavra: "energia", area: "Física" },
    { palavra: "movimento", area: "Física" },
    { palavra: "gravitação", area: "Física" },
    
    // Química
    { palavra: "átomo", area: "Química" },
    { palavra: "molécula", area: "Química" },
    { palavra: "elemento", area: "Química" },
    { palavra: "reação", area: "Química" },
    
    // Biologia
    { palavra: "célula", area: "Biologia" },
    { palavra: "dna", area: "Biologia" },
    { palavra: "ecossistema", area: "Biologia" },
    { palavra: "organela", area: "Biologia Celular" },
    { palavra: "fotossíntese", area: "Botânica" },
    
    // História
    { palavra: "revolução", area: "História" },
    { palavra: "guerra", area: "História" },
    { palavra: "império", area: "História" },
    { palavra: "política", area: "História" },
    
    // Português/Redação
    { palavra: "gramática", area: "Português" },
    { palavra: "redação", area: "Português" },
    { palavra: "literatura", area: "Literatura" },
    { palavra: "argumento", area: "Redação" },
    { palavra: "coesão", area: "Redação" },
    
    // Geografia
    { palavra: "clima", area: "Geografia" },
    { palavra: "relevo", area: "Geografia" },
    { palavra: "urbanização", area: "Geografia" },
    { palavra: "população", area: "Geografia" }
  ];
  
  // Identificar palavras-chave no texto
  const palavrasChaveEncontradas = new Set<string>();
  potenciaisPalavrasChave.forEach(item => {
    if (textoCompleto.includes(item.palavra)) {
      if (item.area) palavrasChaveEncontradas.add(item.area);
      palavrasChaveEncontradas.add(item.palavra.charAt(0).toUpperCase() + item.palavra.slice(1));
    }
  });
  
  // Se não encontrar palavras-chave específicas, tentar extrair substantivos importantes
  if (palavrasChaveEncontradas.size < 2) {
    const substantivosComuns = [
      "conceito", "princípio", "sistema", "método", "análise", 
      "pesquisa", "estudo", "aprendizado", "conhecimento", "ciência",
      "teoria", "prática", "exercício", "demonstração", "exemplo",
      "caso", "problema", "solução", "aplicação", "tecnologia",
      "desenvolvimento", "estrutura", "processo", "resultado", "conclusão"
    ];
    
    substantivosComuns.forEach(substantivo => {
      if (textoCompleto.includes(substantivo) && palavrasChaveEncontradas.size < 4) {
        palavrasChaveEncontradas.add(substantivo.charAt(0).toUpperCase() + substantivo.slice(1));
      }
    });
  }
  
  // Gerar sugestões com base no conteúdo
  const sugestoes: string[] = [];
  
  // Sugestões baseadas no tipo de conteúdo
  if (textoCompleto.includes("questão") || textoCompleto.includes("exercício")) {
    sugestoes.push("Praticar mais exercícios similares");
  }
  
  if (textoCompleto.includes("conceito") || textoCompleto.includes("definição")) {
    sugestoes.push("Revisar conceitos fundamentais");
  }
  
  if (textoCompleto.includes("exemplo") || textoCompleto.includes("aplicação")) {
    sugestoes.push("Buscar exemplos práticos adicionais");
  }
  
  // Adicionar sugestões padrão se necessário
  if (sugestoes.length < 2) {
    sugestoes.push("Revisar este conteúdo em 7 dias");
    sugestoes.push("Criar mapas mentais sobre o tema");
  }
  
  // Calcular "qualidade" da conversa - um valor simulado para interface
  // Baseado na quantidade de trocas de mensagens e presença de palavras-chave
  const numeroTrocas = mensagens.length;
  const temPalavrasChave = palavrasChaveEncontradas.size >= 3;
  const temConteudoDetalhado = mensagens.some(m => m.conteudo.length > 200);
  
  let qualidade = 75; // Base
  
  if (numeroTrocas > 4) qualidade += 5;
  if (numeroTrocas > 8) qualidade += 5;
  if (temPalavrasChave) qualidade += 8;
  if (temConteudoDetalhado) qualidade += 7;
  
  // Limitar a 100
  qualidade = Math.min(qualidade, 98);
  
  return {
    qualidade,
    palavrasChave: Array.from(palavrasChaveEncontradas).slice(0, 5),
    sugestoes
  };
};

// Mapeamento de ícones por tipo de conversa
const tipoIconMap = {
  explicacao: <FileText className="h-4 w-4 text-blue-400" />,
  quiz: <ClipboardCheck className="h-4 w-4 text-purple-400" />,
  correcao: <PenLine className="h-4 w-4 text-green-400" />,
  resumo: <Book className="h-4 w-4 text-amber-400" />,
  fluxograma: <Split className="h-4 w-4 text-cyan-400" />
};

// Ícones temáticos por conteúdo
const getContentIcon = (title: string) => {
  if (title.toLowerCase().includes("pitágoras") || title.toLowerCase().includes("matemática")) 
    return "📐";
  if (title.toLowerCase().includes("biologia") || title.toLowerCase().includes("celular") || title.toLowerCase().includes("fotossíntese")) 
    return "🧬";
  if (title.toLowerCase().includes("redação") || title.toLowerCase().includes("enem")) 
    return "📝";
  if (title.toLowerCase().includes("revolução") || title.toLowerCase().includes("história")) 
    return "📜";
  if (title.toLowerCase().includes("química") || title.toLowerCase().includes("física")) 
    return "⚗️";
  return "📚";
};

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [filtro, setFiltro] = useState("");
  const [conversas, setConversas] = useState<Conversa[]>(conversasIniciais);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [tagFiltro, setTagFiltro] = useState<string | null>(null);
  const [dataFiltro, setDataFiltro] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<"padrao" | "linha-tempo">("padrao");
  const [observacoes, setObservacoes] = useState("");
  const [cardExpandido, setCardExpandido] = useState<string | null>(null);
  const [showCompactTimeline, setShowCompactTimeline] = useState(true);
  const [showPainelInteligente, setShowPainelInteligente] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carrega as conversas do usuário do Supabase
  const carregarConversas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const conversasUsuario = await getUserConversations();
      
      // Converter do formato do banco para o formato do componente
      const conversasMapeadas: Conversa[] = conversasUsuario.map(c => ({
        id: c.id,
        titulo: c.title,
        tipo: c.tipo as any,
        data: new Date(c.created_at),
        tags: Array.isArray(c.tags) ? c.tags : [],
        preview: c.preview || "",
        fixada: c.fixada,
        favorita: c.favorita,
        mensagens: c.mensagens || [],
        analise: c.analise || gerarAnaliseAutomatica(c.mensagens || []),
        observacoes: c.observacoes
      }));
      
      setConversas(conversasMapeadas);
      
      // Se não houver conversa selecionada e tiver conversas, seleciona a primeira
      if (conversasMapeadas.length > 0 && !conversaSelecionada) {
        setConversaSelecionada(conversasMapeadas[0]);
        setObservacoes(conversasMapeadas[0].observacoes || "");
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      setErro("Não foi possível carregar as conversas. Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  };

  // Efeito para carregar conversas quando o modal abre
  useEffect(() => {
    if (open) {
      carregarConversas();
    }
  }, [open]);

  // Efeito para atualizar observações ao selecionar outra conversa
  useEffect(() => {
    if (conversaSelecionada) {
      setObservacoes(conversaSelecionada.observacoes || "");
    }
  }, [conversaSelecionada]);

  // Configurar escuta em tempo real para atualizações nas conversas
  useEffect(() => {
    const setupRealTime = async () => {
      // Inscrever-se para mudanças na tabela de conversas
      const subscription = supabase
        .channel('user_conversations_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_conversations' 
        }, () => {
          // Quando houver qualquer mudança, recarregar as conversas
          carregarConversas();
        })
        .subscribe();

      // Limpar a inscrição quando o componente for desmontado
      return () => {
        subscription.unsubscribe();
      };
    };

    if (open) {
      setupRealTime();
    }
  }, [open]);

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

  // Função para obter a lista de todas as tags disponíveis
  const todasTags = Array.from(
    new Set(conversas.flatMap(conversa => conversa.tags))
  );

  // Função para fixar/desfixar uma conversa
  const toggleFixar = async (id: string) => {
    try {
      // Atualizar estado local imediatamente para UX responsiva
      setConversas(prev => 
        prev.map(conversa => 
          conversa.id === id 
            ? { ...conversa, fixada: !conversa.fixada } 
            : conversa
        )
      );
      
      // Encontrar a conversa no estado atual para ver seu valor atual
      const conversa = conversas.find(c => c.id === id);
      if (!conversa) return;
      
      // Atualizar no Supabase
      await updateConversation(id, {
        fixada: !conversa.fixada
      });
    } catch (error) {
      console.error("Erro ao alternar fixação da conversa:", error);
      // Reverter alteração em caso de erro
      carregarConversas();
    }
  };

  // Função para favoritar/desfavoritar uma conversa
  const toggleFavorito = async (id: string) => {
    try {
      // Atualizar estado local imediatamente para UX responsiva
      setConversas(prev => 
        prev.map(conversa => 
          conversa.id === id 
            ? { ...conversa, favorita: !conversa.favorita } 
            : conversa
        )
      );
      
      // Encontrar a conversa no estado atual para ver seu valor atual
      const conversa = conversas.find(c => c.id === id);
      if (!conversa) return;
      
      // Atualizar no Supabase
      await updateConversation(id, {
        favorita: !conversa.favorita
      });
    } catch (error) {
      console.error("Erro ao alternar favorito da conversa:", error);
      // Reverter alteração em caso de erro
      carregarConversas();
    }
  };

  // Função para excluir uma conversa
  const excluirConversa = async (id: string) => {
    try {
      // Atualizar estado local imediatamente para UX responsiva
      setConversas(prev => prev.filter(conversa => conversa.id !== id));
      
      // Se a conversa excluída for a selecionada, selecione outra
      if (conversaSelecionada && conversaSelecionada.id === id) {
        const conversasRestantes = conversas.filter(c => c.id !== id);
        setConversaSelecionada(conversasRestantes.length > 0 ? conversasRestantes[0] : null);
      }
      
      // Excluir no Supabase
      await deleteConversation(id);
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      // Reverter alteração em caso de erro
      carregarConversas();
    }
  };

  // Função para renomear uma conversa
  const renomearConversa = async (id: string, novoTitulo: string) => {
    if (!novoTitulo.trim()) return;
    
    try {
      // Atualizar estado local imediatamente para UX responsiva
      setConversas(prev => 
        prev.map(conversa => 
          conversa.id === id 
            ? { ...conversa, titulo: novoTitulo } 
            : conversa
        )
      );
      
      // Atualizar conversa selecionada se for a mesma
      if (conversaSelecionada && conversaSelecionada.id === id) {
        setConversaSelecionada(prev => prev ? { ...prev, titulo: novoTitulo } : null);
      }
      
      // Atualizar no Supabase
      await updateConversation(id, { title: novoTitulo });
    } catch (error) {
      console.error("Erro ao renomear conversa:", error);
      // Reverter alteração em caso de erro
      carregarConversas();
    }
  };

  // Função para lidar com clique em uma conversa
  const handleConversaClick = (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    setObservacoes(conversa.observacoes || "");
  };

  // Função para salvar observações
  const salvarObservacoes = async () => {
    if (!conversaSelecionada) return;
    
    try {
      // Atualizar estado local imediatamente para UX responsiva
      setConversas(prev => 
        prev.map(conversa => 
          conversa.id === conversaSelecionada.id 
            ? { ...conversa, observacoes } 
            : conversa
        )
      );
      
      // Atualizar no Supabase
      await updateConversation(conversaSelecionada.id, { observacoes });
    } catch (error) {
      console.error("Erro ao salvar observações:", error);
    }
  };
  
  // Função para retomar uma conversa no chat principal
  const retomarConversa = (conversa: Conversa) => {
    // Fechar o modal
    onOpenChange(false);
    
    // Aqui iria a lógica para carregar esta conversa no chat principal
    // Isso depende da implementação do chat principal
    alert("Conversa retomada! Esta funcionalidade seria integrada ao chat principal.");
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
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] bg-gradient-to-br from-[#0D1117]/90 to-[#161B22]/90 backdrop-blur-md text-white border border-white/10 rounded-xl shadow-xl p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header principal do modal com título e ações principais - mais discreto */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <DialogTitle className="text-lg font-medium text-white">
                Histórico de Conversas
              </DialogTitle>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Busca semântica com IA */}
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  type="text"
                  placeholder="Busca semântica - temas ou conceitos..."
                  className="pl-8 h-8 bg-[#1E2430] border-gray-700 text-white text-sm placeholder:text-gray-400 focus:border-blue-500"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                <Sparkles className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-purple-400" />
              </div>
              
              {/* Trocar modo visualização */}
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-xs flex items-center gap-1 px-2 h-7 ${modoVisualizacao === "linha-tempo" ? "bg-blue-900/30 text-blue-300" : "text-gray-300"}`}
                onClick={() => setModoVisualizacao(modo => modo === "padrao" ? "linha-tempo" : "padrao")}
              >
                {modoVisualizacao === "padrao" ? (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Linha do Tempo</span>
                  </>
                ) : (
                  <>
                    <AlignJustify className="h-3.5 w-3.5" />
                    <span>Padrão</span>
                  </>
                )}
              </Button>
              
              {/* Mostrar/Ocultar Painel Inteligente */}
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-xs flex items-center gap-1 px-2 h-7 ${showPainelInteligente ? "bg-purple-900/30 text-purple-300" : "text-gray-300"}`}
                onClick={() => setShowPainelInteligente(prev => !prev)}
              >
                {showPainelInteligente ? (
                  <>
                    <PanelRightClose className="h-3.5 w-3.5" />
                    <span>Ocultar Painel</span>
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="h-3.5 w-3.5" />
                    <span>Mostrar Painel</span>
                  </>
                )}
              </Button>
              
              {/* Comparar conversas */}
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1 px-2 h-7 text-gray-300 hover:text-white hover:bg-gray-700/60"
              >
                <Split className="h-3.5 w-3.5" />
                <span>Comparar</span>
              </Button>
            </div>
          </div>
          
          {/* Corpo principal do modal em colunas - com mais espaçamento */}
          <div className="flex flex-1 overflow-hidden gap-0.5">
            {/* COLUNA ESQUERDA: Lista de Conversas */}
            <div className="w-1/4 border-r border-white/5 flex flex-col">
              <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
                <h3 className="text-sm font-medium text-gray-300">Suas Conversas</h3>
                
                <div className="flex items-center gap-1">
                  {/* Filtro por data */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
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
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400">
                        <Tag className="h-3.5 w-3.5" />
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
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400">
                        <Brain className="h-3.5 w-3.5" />
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
                          <FileText className="h-3.5 w-3.5 mr-2 text-blue-400" />
                          Explicações
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "quiz" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("quiz")}
                        >
                          <ClipboardCheck className="h-3.5 w-3.5 mr-2 text-purple-400" />
                          Quizes/Simulados
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "correcao" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("correcao")}
                        >
                          <PenLine className="h-3.5 w-3.5 mr-2 text-green-400" />
                          Correções
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "resumo" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("resumo")}
                        >
                          <Book className="h-3.5 w-3.5 mr-2 text-amber-400" />
                          Resumos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={tipoFiltro === "fluxograma" ? "bg-blue-900/30" : ""}
                          onClick={() => setTipoFiltro("fluxograma")}
                        >
                          <Split className="h-3.5 w-3.5 mr-2 text-cyan-400" />
                          Fluxogramas
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Lista de conversas - com divisores mais visíveis */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
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
                        className={`p-2.5 rounded-lg transition-all cursor-pointer group relative border-b border-white/5
                          ${conversaSelecionada?.id === conversa.id 
                            ? 'bg-gradient-to-r from-[#1A2036]/80 to-[#1F2A45]/80 border-l-2 border-l-blue-500' 
                            : 'hover:bg-[#1A1E2A] border-l border-l-transparent hover:border-l-white/20'
                          }
                        `}
                        onClick={() => handleConversaClick(conversa)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex flex-col items-center">
                              <span className="text-base mb-1">{getContentIcon(conversa.titulo)}</span>
                              {tipoIconMap[conversa.tipo]}
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors flex items-center gap-1 truncate">
                                {conversa.titulo}
                                {conversa.favorita && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-1">
                                {conversa.preview}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {conversa.tags.slice(0, 2).map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline" 
                                    className="text-[10px] py-0 px-1.5 bg-[#1A2033]/80 text-gray-300 border-gray-700/60"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {conversa.tags.length > 2 && (
                                  <Badge className="text-[10px] py-0 px-1.5 bg-gray-700/20 text-gray-400 border border-gray-700/40">
                                    +{conversa.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {formatarData(conversa.data)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-1.5">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300 hover:bg-[#1A1D2A]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 bg-[#1E2430] border-gray-700 text-white">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem 
                                    className="text-xs py-1.5 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFixar(conversa.id);
                                    }}
                                  >
                                    <Pin className={`h-3.5 w-3.5 ${conversa.fixada ? "text-blue-400" : "text-gray-400"}`} />
                                    {conversa.fixada ? "Desfixar" : "Fixar"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-xs py-1.5 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorito(conversa.id);
                                    }}
                                  >
                                    <Star className={`h-3.5 w-3.5 ${conversa.favorita ? "text-yellow-400" : "text-gray-400"}`} />
                                    {conversa.favorita ? "Desfavoritar" : "Favoritar"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-xs py-1.5 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const novoTitulo = prompt("Novo título:", conversa.titulo);
                                      if (novoTitulo) renomearConversa(conversa.id, novoTitulo);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5 text-gray-400" />
                                    Renomear
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-xs py-1.5 flex items-center gap-2 text-red-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Tem certeza que deseja excluir esta conversa?")) {
                                        excluirConversa(conversa.id);
                                      }
                                    }}
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                    Excluir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-xs py-1.5 flex items-center gap-2 text-purple-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      alert("Conversa retomada! Esta funcionalidade seria integrada ao chat principal.");
                                    }}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Retomar conversa
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* COLUNA CENTRAL: Pré-visualização inteligente */}
            <div className={`${showPainelInteligente ? "w-2/4" : "w-3/4"} flex flex-col relative`}>
              {conversaSelecionada ? (
                <>
                  <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/30">
                        {tipoIconMap[conversaSelecionada.tipo]}
                      </div>
                      <h3 className="text-sm font-medium text-white">{conversaSelecionada.titulo}</h3>
                    </div>
                    
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#1A2033]/80"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-[#1E2430] border-gray-700 text-white">
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                              <ClipboardCheck className="h-3.5 w-3.5 text-purple-400" />
                              <span>Gerar Quiz</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                              <Book className="h-3.5 w-3.5 text-blue-400" />
                              <span>Transformar em Resumo</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                              <Download className="h-3.5 w-3.5 text-green-400" />
                              <span>Exportar PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-amber-400" />
                              <span>Mandar para Apostila</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 px-4 py-3">
                    <h4 className="text-xs font-medium text-gray-400 mb-3">Conversa</h4>
                    
                    <div className="space-y-3 mb-6">
                      {conversaSelecionada.mensagens.map(mensagem => (
                        <motion.div
                          key={mensagem.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-3 rounded-xl shadow-sm transition-all hover:shadow-md ${
                            mensagem.remetente === "usuario" 
                              ? "bg-[#1A2033]/60 border border-[#2D3343]/50" 
                              : "bg-gradient-to-r from-[#1A2642]/60 to-[#1F2A45]/60 border border-blue-500/20"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#1A1D2A] text-gray-300">
                                {mensagem.remetente === "usuario" ? (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3 text-blue-400" />
                                    <span>Você</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Reply className="h-3 w-3 text-purple-400" />
                                    <span>Epictus IA</span>
                                  </div>
                                )}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500">
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
                              className="text-xs mt-2 text-blue-400 hover:text-blue-300 px-2 py-0 h-6"
                            >
                              Mostrar mais
                            </Button>
                          )}
                          
                          <div className="flex gap-1 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10"
                            >
                              <Paperclip className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <h4 className="text-xs font-medium text-gray-400 mt-6 mb-3">Visualização por Cards</h4>
                    
                    <div className="flex overflow-x-auto pb-4 space-x-3 mb-6 hide-scrollbar">
                      {conversaSelecionada.mensagens.map(mensagem => (
                        <motion.div
                          key={mensagem.id}
                          className={`flex-shrink-0 w-64 p-3 rounded-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                            cardExpandido === mensagem.id
                              ? "w-96 ring-1 ring-blue-500/30"
                              : "hover:ring-1 hover:ring-blue-400/30"
                          } ${
                            mensagem.remetente === "usuario" 
                              ? "bg-[#1A2033]/60 border border-[#2D3343]/50" 
                              : "bg-gradient-to-r from-[#1A2642]/60 to-[#1F2A45]/60 border border-blue-500/20"
                          }`}
                          onClick={() => toggleCardExpandido(mensagem.id)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#1A1D2A] text-gray-300">
                              {mensagem.remetente === "usuario" ? "Você" : "Epictus IA"}
                            </span>
                            <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-gray-500 hover:text-blue-400"
                              >
                                <Paperclip className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-gray-500 hover:text-green-400"
                              >
                                <Edit className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-gray-500 hover:text-purple-400"
                              >
                                <RefreshCw className="h-2.5 w-2.5" />
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
              
              {/* Botão flutuante para expandir painel inteligente quando está fechado */}
              {!showPainelInteligente && conversaSelecionada && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#1A2033]/80 border-gray-700/50 text-gray-300 hover:bg-[#1A2642]/70 hover:text-purple-300 h-auto py-6"
                  onClick={() => setShowPainelInteligente(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* COLUNA DIREITA: Detalhes e inteligência - mais compacta */}
            {showPainelInteligente && (
              <div className="w-1/4 flex flex-col border-l border-white/5">
              {conversaSelecionada ? (
                <>
                  <div className="px-4 py-2 border-b border-white/5 flex items-center">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <h3 className="text-sm font-medium text-white">Painel Inteligente</h3>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-3">
                    {conversaSelecionada.analise && (
                      <>
                        {/* Análise de Qualidade - mais compacta */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            <BarChart2 className="h-3.5 w-3.5 text-blue-400" />
                            Análise de Qualidade
                          </h4>
                          <div className="bg-[#1A1D2A]/70 rounded-lg p-2 border border-gray-700/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-gray-400">Qualidade do Estudo</span>
                              <span className={`text-xs font-medium ${
                                conversaSelecionada.analise.qualidade >= 90 
                                  ? "text-green-400" 
                                  : conversaSelecionada.analise.qualidade >= 70 
                                  ? "text-amber-400" 
                                  : "text-red-400"
                              }`}>{conversaSelecionada.analise.qualidade}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700/70 rounded-full overflow-hidden">
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
                        
                        {/* Palavras-Chave - chips menores */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            <Key className="h-3.5 w-3.5 text-amber-400" />
                            Palavras-Chave
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {conversaSelecionada.analise.palavrasChave.map(palavra => (
                              <Badge 
                                key={palavra}
                                className="bg-[#1A2642]/40 text-blue-200 border-blue-500/20 text-[10px] px-1.5 py-0"
                              >
                                {palavra}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Card de Próximas Ações (Sugestões + Observações) */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                            Próximas Ações
                          </h4>
                          <div className="bg-[#1A1D2A]/70 rounded-lg p-2 border border-gray-700/50 space-y-3">
                            {/* Seção de Sugestões da IA */}
                            <div>
                              <h5 className="text-[10px] uppercase text-gray-500 mb-1.5">Sugestões da IA</h5>
                              <ul className="space-y-1.5">
                                {conversaSelecionada.analise.sugestoes.map((sugestao, index) => (
                                  <li 
                                    key={index}
                                    className="bg-[#1A2033]/70 rounded-md p-1.5 text-xs text-gray-300 border border-gray-700/40 hover:border-purple-500/20 hover:bg-[#1A2642]/20 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500/70" />
                                    {sugestao}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Seção de Minhas Observações */}
                            <div>
                              <h5 className="text-[10px] uppercase text-gray-500 mb-1.5">Minhas Observações</h5>
                              <textarea
                                className="w-full h-20 bg-[#1A2033]/70 text-white rounded-md p-1.5 border border-gray-700/40 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 resize-none text-xs"
                                placeholder="Adicione suas observações aqui..."
                                value={observacoes}
                                onChange={handleObservacoesChange}
                                onBlur={salvarObservacoes}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Ações Unificadas */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-500/90 hover:to-blue-600/90 
                                            text-white border-none text-xs h-7 shadow-sm px-3"
                                >
                                  <Share2 className="h-3 w-3 mr-1.5" />
                                  Compartilhar e Exportar
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48 bg-[#1A2033] border-gray-700/60 text-white">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                                    <Download className="h-3.5 w-3.5 text-blue-400" />
                                    Exportar PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                                    <Book className="h-3.5 w-3.5 text-amber-400" />
                                    Para Caderno
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-green-400" />
                                    Agendar Revisão
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs py-1.5 flex items-center gap-2">
                                    <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                                    Compartilhar Link
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 border-gray-700/50 text-gray-300 hover:bg-[#1A2033]"
                              onClick={() => setShowCompactTimeline(!showCompactTimeline)}
                            >
                              {showCompactTimeline ? "Expandir" : "Compactar"} Timeline
                            </Button>
                          </div>
                        </div>
                        
                        {/* Linha do Tempo - mais compacta com ícones */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            Linha do Tempo
                          </h4>
                          <div className="relative pl-4 border-l border-gray-700/50 space-y-2">
                            {conversaSelecionada.mensagens.map((mensagem, index) => (
                              <div key={mensagem.id} className="relative">
                                <div className={`absolute -left-[13px] top-0 h-2.5 w-2.5 rounded-full ${
                                  mensagem.remetente === "usuario" ? "bg-blue-500/70" : "bg-purple-500/70"
                                }`} />
                                <div className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                                  {mensagem.remetente === "usuario" ? (
                                    <MessageCircle className="h-2.5 w-2.5 text-blue-400" />
                                  ) : (
                                    <Reply className="h-2.5 w-2.5 text-purple-400" />
                                  )}
                                  {mensagem.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                {showCompactTimeline ? (
                                  <div className={`p-1.5 rounded text-[10px] ${
                                    mensagem.remetente === "usuario" 
                                      ? "bg-[#1A2033]/60 text-gray-300" 
                                      : "bg-[#1A2642]/60 text-gray-200"
                                  }`}>
                                    {mensagem.conteudo.substring(0, 50)}...
                                  </div>
                                ) : (
                                  <div className={`p-2 rounded text-xs ${
                                    mensagem.remetente === "usuario" 
                                      ? "bg-[#1A2033]/70 text-gray-300" 
                                      : "bg-[#1A2642]/70 text-gray-200"
                                  }`}>
                                    {mensagem.conteudo.substring(0, 150)}...
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Selecione uma conversa para ver detalhes</p>
                </div>
              )}
              
              {/* Botão para fechar o painel */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300 h-auto py-6"
                onClick={() => setShowPainelInteligente(false)}
              >
                <ChevronRight className="h-4 w-4" />
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
