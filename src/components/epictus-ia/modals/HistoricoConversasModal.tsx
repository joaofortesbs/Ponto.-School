
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Search,
  Star,
  Bookmark,
  Pin,
  Edit,
  Trash2,
  Tag,
  MoreHorizontal,
  FileText,
  Brain,
  Tool,
  Calendar,
  AlarmClock,
  PlayCircle,
  Download,
  Send,
  Copy,
  CheckCircle,
  Book,
  StickyNote,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  ArrowRight,
  MessageSquare,
  Clock10,
  Award,
  CheckSquare,
  TimerReset,
  Expand,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Tipos para os dados do histórico
interface Conversa {
  id: string;
  titulo: string;
  data: Date;
  tipo: 'conteudo' | 'duvida' | 'correcao' | 'simulado' | 'resumo';
  fixada: boolean;
  favorita: boolean;
  tags: string[];
  previa: string;
  conteudo: { role: 'user' | 'assistant'; content: string }[];
  arquivada: boolean;
}

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dados de exemplo para demonstração
const conversasExemplo: Conversa[] = [
  {
    id: uuidv4(),
    titulo: 'Função Afim e suas aplicações',
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    tipo: 'conteudo',
    fixada: true,
    favorita: true,
    tags: ['matemática', 'enem', 'funções'],
    previa: 'Explicação completa sobre funções do 1° grau com exemplos práticos',
    conteudo: [
      { role: 'user', content: 'Explique o que é uma função afim e dê exemplos práticos para o ENEM' },
      { role: 'assistant', content: 'Uma função afim é uma função do tipo f(x) = ax + b, onde a e b são números reais e a ≠ 0. O coeficiente a determina a inclinação da reta e b é o ponto onde a reta cruza o eixo y...' }
    ],
    arquivada: false
  },
  {
    id: uuidv4(),
    titulo: 'Revisão Guerra Fria',
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    tipo: 'duvida',
    fixada: false,
    favorita: true,
    tags: ['história', 'geopolítica'],
    previa: 'Principais eventos e consequências da Guerra Fria',
    conteudo: [
      { role: 'user', content: 'Quais foram os principais eventos da Guerra Fria e suas consequências para o mundo atual?' },
      { role: 'assistant', content: 'A Guerra Fria foi um período de tensão geopolítica entre os Estados Unidos e a União Soviética e seus respectivos aliados...' }
    ],
    arquivada: false
  },
  {
    id: uuidv4(),
    titulo: 'Correção redação tema tecnologia',
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    tipo: 'correcao',
    fixada: false,
    favorita: false,
    tags: ['redação', 'português', 'revisar'],
    previa: 'Análise e correção da redação sobre impactos da tecnologia',
    conteudo: [
      { role: 'user', content: 'Poderia corrigir minha redação sobre os impactos da tecnologia na sociedade?' },
      { role: 'assistant', content: 'Analisando sua redação, percebo que você desenvolveu bem a argumentação sobre os impactos positivos da tecnologia...' }
    ],
    arquivada: false
  },
  {
    id: uuidv4(),
    titulo: 'Simulado Química Orgânica',
    data: new Date(),
    tipo: 'simulado',
    fixada: false,
    favorita: false,
    tags: ['química', 'simulado', 'enem'],
    previa: '10 questões sobre hidrocarbonetos e funções orgânicas',
    conteudo: [
      { role: 'user', content: 'Crie um simulado com 10 questões sobre química orgânica, focando em hidrocarbonetos e funções orgânicas' },
      { role: 'assistant', content: 'Simulado de Química Orgânica\n\nQuestão 1: Qual das seguintes moléculas representa um alcano?\n(a) C3H6\n(b) C4H10\n(c) C2H4\n(d) C2H2\n(e) C6H6...' }
    ],
    arquivada: false
  },
];

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  // Estados
  const [conversas, setConversas] = useState<Conversa[]>(conversasExemplo);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtual, setFiltroAtual] = useState<string>('todos');
  const [modoArquivados, setModoArquivados] = useState(false);

  // Selecionar primeira conversa automaticamente ao abrir
  useEffect(() => {
    if (open && conversas.length > 0 && !conversaSelecionada) {
      setConversaSelecionada(conversas[0]);
    }
  }, [open, conversas, conversaSelecionada]);

  // Funções de manipulação
  const alternarFavorito = (id: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id ? {...conversa, favorita: !conversa.favorita} : conversa
    ));
  };

  const alternarFixado = (id: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id ? {...conversa, fixada: !conversa.fixada} : conversa
    ));
  };

  const arquivarConversa = (id: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id ? {...conversa, arquivada: !conversa.arquivada} : conversa
    ));
  };

  const excluirConversa = (id: string) => {
    setConversas(conversas.filter(conversa => conversa.id !== id));
    if (conversaSelecionada?.id === id) {
      setConversaSelecionada(conversas.find(c => c.id !== id) || null);
    }
  };

  const renomearConversa = (id: string, novoTitulo: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id ? {...conversa, titulo: novoTitulo} : conversa
    ));
  };

  const adicionarTag = (id: string, novaTag: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id && !conversa.tags.includes(novaTag) 
        ? {...conversa, tags: [...conversa.tags, novaTag]} 
        : conversa
    ));
  };

  const removerTag = (id: string, tag: string) => {
    setConversas(conversas.map(conversa => 
      conversa.id === id 
        ? {...conversa, tags: conversa.tags.filter(t => t !== tag)} 
        : conversa
    ));
  };

  // Filtragem de conversas
  const conversasFiltradas = conversas.filter(conversa => {
    // Filtro por termo de busca
    const matchBusca = conversa.titulo.toLowerCase().includes(termoBusca.toLowerCase()) || 
                       conversa.previa.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       conversa.tags.some(tag => tag.toLowerCase().includes(termoBusca.toLowerCase()));
    
    // Filtro por arquivo
    const matchArquivado = modoArquivados ? conversa.arquivada : !conversa.arquivada;
    
    // Filtro por tipo
    const matchTipo = filtroAtual === 'todos' || 
                      (filtroAtual === 'favoritos' && conversa.favorita) ||
                      (filtroAtual === 'fixados' && conversa.fixada) ||
                      filtroAtual === conversa.tipo;
    
    return matchBusca && matchArquivado && matchTipo;
  }).sort((a, b) => {
    // Ordenação: primeiro fixados, depois por data (mais recente primeiro)
    if (a.fixada && !b.fixada) return -1;
    if (!a.fixada && b.fixada) return 1;
    return b.data.getTime() - a.data.getTime();
  });

  // Função para formatar data
  const formatarData = (data: Date) => {
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    
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

  // Ícone baseado no tipo de conversa
  const renderIconeTipo = (tipo: Conversa['tipo']) => {
    switch (tipo) {
      case 'conteudo':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'duvida':
        return <Brain className="h-4 w-4 text-purple-400" />;
      case 'correcao':
        return <CheckSquare className="h-4 w-4 text-green-400" />;
      case 'simulado':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'resumo':
        return <Book className="h-4 w-4 text-teal-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  // Componente para a coluna da lista de conversas (esquerda)
  const ColunaListaConversas = () => (
    <div className="w-full h-full border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversa..."
            className="pl-8 bg-gray-800 border-gray-700 focus-visible:ring-blue-600"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="todos" className="w-full" onValueChange={setFiltroAtual}>
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="favoritos" className="text-xs">Favoritos</TabsTrigger>
              <TabsTrigger value="conteudo" className="text-xs">Conteúdo</TabsTrigger>
              <TabsTrigger value="duvida" className="text-xs">Dúvidas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => setModoArquivados(!modoArquivados)}
                >
                  <Archive className={`h-4 w-4 ${modoArquivados ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {modoArquivados ? 'Ver conversas ativas' : 'Ver arquivadas'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <Filter className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Filtros avançados
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-100px)]">
        <div className="p-2 space-y-2">
          {conversasFiltradas.length > 0 ? (
            conversasFiltradas.map((conversa) => (
              <ConversaItem 
                key={conversa.id} 
                conversa={conversa} 
                selecionada={conversaSelecionada?.id === conversa.id}
                onClick={() => {
                  setConversaSelecionada(conversa);
                  setMostrarDetalhes(false);
                }}
                onFavoritar={() => alternarFavorito(conversa.id)}
                onFixar={() => alternarFixado(conversa.id)}
                onArquivar={() => arquivarConversa(conversa.id)}
                onExcluir={() => excluirConversa(conversa.id)}
                onRenomear={(novoTitulo) => renomearConversa(conversa.id, novoTitulo)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <SearchX className="h-12 w-12 mb-2 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
              <p className="text-sm opacity-70">Tente alterar os filtros ou a busca</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Componente de item de conversa
  const ConversaItem = ({ 
    conversa, 
    selecionada, 
    onClick, 
    onFavoritar, 
    onFixar,
    onArquivar,
    onExcluir,
    onRenomear
  }) => {
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [novoTitulo, setNovoTitulo] = useState(conversa.titulo);
    
    const salvarNovoTitulo = () => {
      if (novoTitulo.trim()) {
        onRenomear(novoTitulo);
      } else {
        setNovoTitulo(conversa.titulo);
      }
      setEditandoTitulo(false);
    };
    
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className={`relative p-3 rounded-lg cursor-pointer ${
          selecionada 
            ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-700/50'
            : 'bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            {renderIconeTipo(conversa.tipo)}
            {conversa.fixada && (
              <Pin className="h-3 w-3 ml-1 text-blue-300" fill="currentColor" />
            )}
          </div>
          
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoritar();
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 ${conversa.favorita ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {conversa.favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditandoTitulo(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Renomear</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onFixar();
                }}>
                  <Pin className="h-4 w-4 mr-2" />
                  <span>{conversa.fixada ? 'Desafixar' : 'Fixar'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onArquivar();
                }}>
                  <Archive className="h-4 w-4 mr-2" />
                  <span>{conversa.arquivada ? 'Desarquivar' : 'Arquivar'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onExcluir();
                  }}
                  className="text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {editandoTitulo ? (
          <div className="mb-2" onClick={(e) => e.stopPropagation()}>
            <Input 
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              className="bg-gray-700 border-blue-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  salvarNovoTitulo();
                } else if (e.key === 'Escape') {
                  setEditandoTitulo(false);
                  setNovoTitulo(conversa.titulo);
                }
              }}
            />
            <div className="flex justify-end mt-1 space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => {
                  setEditandoTitulo(false);
                  setNovoTitulo(conversa.titulo);
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-6 text-xs"
                onClick={salvarNovoTitulo}
              >
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <h4 className="font-medium text-sm text-white truncate">{conversa.titulo}</h4>
        )}
        
        <div className="flex justify-between items-center mt-1.5">
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {conversa.tags.slice(0, 2).map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="px-1.5 py-0 text-[10px] bg-gray-800/70 border-gray-600 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
            {conversa.tags.length > 2 && (
              <Badge 
                variant="outline" 
                className="px-1.5 py-0 text-[10px] bg-gray-800/70 border-gray-600 text-gray-300"
              >
                +{conversa.tags.length - 2}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-gray-400">{formatarData(conversa.data)}</p>
        </div>
      </motion.div>
    );
  };

  // Componente para a coluna central (prévia visual)
  const ColunaPreviaVisual = () => {
    if (!conversaSelecionada) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          <p>Selecione uma conversa para visualizar</p>
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {renderIconeTipo(conversaSelecionada.tipo)}
              <h3 className="ml-2 font-medium">{conversaSelecionada.titulo}</h3>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => setMostrarDetalhes(true)}
                    >
                      <Expand className="h-4 w-4" />
                      <span className="text-xs">Expandir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Ver detalhes completos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {conversaSelecionada.tags.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-gray-800 border-gray-700 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
            >
              <Tag className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                Resumo da Conversa
              </h4>
              <p className="text-sm text-gray-300">{conversaSelecionada.previa}</p>
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Clock10 className="h-4 w-4 mr-2 text-blue-400" />
                Linha do Tempo
              </h4>
              <div className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {conversaSelecionada.conteudo.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex-shrink-0 w-32 h-16 rounded-md flex flex-col justify-center items-center p-2 ${
                      item.role === 'user' 
                        ? 'bg-blue-900/30 border border-blue-800/50' 
                        : 'bg-gray-700/50 border border-gray-600/50'
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 mb-1">
                      {item.role === 'user' ? 'Você' : 'Epictus IA'}
                    </div>
                    <div className="text-[10px] text-center truncate w-full">
                      {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
                Sugestões da IA
              </h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  <span>Retomar de onde parou</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                  <span>Gerar simulado baseado nessa conversa</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <Book className="h-3.5 w-3.5 mr-2" />
                  <span>Criar resumo interativo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente para a coluna da direita (detalhes avançados)
  const ColunaDetalhesAvancados = () => {
    if (!conversaSelecionada) return null;
    
    return (
      <AnimatePresence>
        {mostrarDetalhes && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-0 h-full bg-gray-900 border-l border-gray-700 w-full md:w-[60%] lg:w-[50%] z-10"
          >
            <div className="flex flex-col h-full">
              <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                <h3 className="font-medium flex items-center">
                  {renderIconeTipo(conversaSelecionada.tipo)}
                  <span className="ml-2">{conversaSelecionada.titulo}</span>
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setMostrarDetalhes(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="conteudo" className="flex-1 flex flex-col">
                <div className="border-b border-gray-700">
                  <TabsList className="m-4 bg-gray-800 border border-gray-700">
                    <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                    <TabsTrigger value="acoes">Ações</TabsTrigger>
                    <TabsTrigger value="comentarios">Comentários</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="conteudo" className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {conversaSelecionada.conteudo.map((item, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg ${
                            item.role === 'user' 
                              ? 'bg-blue-900/30 border border-blue-800/50' 
                              : 'bg-gray-800/70 border border-gray-700/50'
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-2">
                            {item.role === 'user' ? 'Você' : 'Epictus IA'}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="acoes" className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-blue-900/30 border border-blue-800/50">
                          <Book className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Transformar em Resumo</div>
                          <div className="text-xs text-gray-400">Gera uma versão condensada</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-purple-900/30 border border-purple-800/50">
                          <AlertTriangle className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Gerar Quiz</div>
                          <div className="text-xs text-gray-400">Cria questões baseadas no conteúdo</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-teal-900/30 border border-teal-800/50">
                          <Download className="h-4 w-4 text-teal-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Exportar como PDF</div>
                          <div className="text-xs text-gray-400">Salve a conversa localmente</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-green-900/30 border border-green-800/50">
                          <StickyNote className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Mandar para Caderno</div>
                          <div className="text-xs text-gray-400">Salve como anotação pessoal</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-orange-900/30 border border-orange-800/50">
                          <Calendar className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Agendar Revisão</div>
                          <div className="text-xs text-gray-400">Programe uma revisão futura</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start h-auto p-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <div className="mr-3 p-2 rounded-md bg-red-900/30 border border-red-800/50">
                          <Award className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Análise de Qualidade</div>
                          <div className="text-xs text-gray-400">Avalie seu estudo com IA</div>
                        </div>
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="comentarios" className="flex-1 p-0 overflow-hidden">
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        <div className="text-center text-gray-400 p-6">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Você ainda não adicionou comentários a esta conversa</p>
                          <p className="text-sm mt-1">Adicione notas pessoais para organizar seus estudos</p>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <div className="border-t border-gray-700 p-3">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Adicione um comentário pessoal..."
                          className="bg-gray-800 border-gray-700"
                        />
                        <Button>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[80%] md:max-w-[80%] lg:max-w-[80%] xl:max-w-[1000px] h-[80vh] bg-gradient-to-br from-[#161b26] to-[#1d2234] text-white border-gray-800 p-0 overflow-hidden"
        onEscapeKeyDown={() => mostrarDetalhes ? setMostrarDetalhes(false) : onOpenChange(false)}
      >
        <DialogHeader className="px-6 py-3 border-b border-gray-800 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FF6B00]" />
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100%-60px)] overflow-hidden relative">
          <div className="flex flex-col h-full md:border-r border-gray-800">
            <ColunaListaConversas />
          </div>
          
          <div className="hidden md:block h-full">
            <ColunaPreviaVisual />
          </div>
          
          <ColunaDetalhesAvancados />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente Archive que estava faltando
const Archive = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

// Componente SearchX que estava faltando
const SearchX = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m13.5 8.5-5 5" />
    <path d="m8.5 8.5 5 5" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Componente X que estava faltando
const X = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default HistoricoConversasModal;
