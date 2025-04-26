
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Pin,
  Edit,
  Trash2,
  Tag,
  MoreHorizontal,
  FileText,
  Brain,
  CheckSquare,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Book,
  Expand,
  Sparkles,
  Download,
  Send,
  StickyNote,
  Calendar,
  Award,
  ArrowRight,
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
    <div className="w-full h-full border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="relative mb-3">
          <div className="absolute left-2.5 top-2.5 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Buscar conversa..."
            className="pl-9 bg-gray-800/60 border-gray-700/70 focus-visible:ring-blue-600 h-9 text-sm rounded-lg"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="todos" className="w-full" onValueChange={setFiltroAtual}>
            <TabsList className="bg-gray-800/70 border border-gray-700/70 p-0.5 h-8">
              <TabsTrigger value="todos" className="text-xs px-2.5 py-1">Todos</TabsTrigger>
              <TabsTrigger value="favoritos" className="text-xs px-2.5 py-1">Favoritos</TabsTrigger>
              <TabsTrigger value="conteudo" className="text-xs px-2.5 py-1">Conteúdo</TabsTrigger>
              <TabsTrigger value="duvida" className="text-xs px-2.5 py-1">Dúvidas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8 rounded-full"
                  onClick={() => setModoArquivados(!modoArquivados)}
                >
                  <Archive className={`h-4 w-4 ${modoArquivados ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {modoArquivados ? 'Ver conversas ativas' : 'Ver arquivadas'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 rounded-full">
                  <Filter className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Filtros avançados
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-100px)]">
        <div className="p-3 space-y-2.5">
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
            <div className="flex flex-col items-center justify-center p-10 text-center text-gray-400">
              <SearchX className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium mb-1">Nenhuma conversa encontrada</p>
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
            ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-600/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
            : 'bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/60'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-700/80">
              {renderIconeTipo(conversa.tipo)}
            </div>
            {conversa.fixada && (
              <Pin className="h-3 w-3 ml-1 text-blue-400" fill="currentColor" />
            )}
          </div>
          
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-gray-700/60" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoritar();
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 ${conversa.favorita ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  {conversa.favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-gray-700/60">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 p-1.5 min-w-[160px]">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditandoTitulo(true);
                }} className="py-1.5 text-sm gap-2">
                  <Edit className="h-3.5 w-3.5" />
                  <span>Renomear</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onFixar();
                }} className="py-1.5 text-sm gap-2">
                  <Pin className="h-3.5 w-3.5" />
                  <span>{conversa.fixada ? 'Desafixar' : 'Fixar'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onArquivar();
                }} className="py-1.5 text-sm gap-2">
                  <Archive className="h-3.5 w-3.5" />
                  <span>{conversa.arquivada ? 'Desarquivar' : 'Arquivar'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onExcluir();
                  }}
                  className="text-red-400 py-1.5 text-sm gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
              className="bg-gray-700/80 border-blue-700/60 text-sm"
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
            <div className="flex justify-end mt-1.5 space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs px-2"
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
                className="h-6 text-xs px-2 bg-blue-600 hover:bg-blue-700"
                onClick={salvarNovoTitulo}
              >
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <h4 className="font-medium text-sm text-white mb-1 truncate">{conversa.titulo}</h4>
        )}
        
        {!editandoTitulo && <p className="text-xs text-gray-300/80 truncate line-clamp-1 mb-2">{conversa.previa}</p>}
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {conversa.tags.slice(0, 2).map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="px-1.5 py-0 text-[10px] bg-gray-800/70 border-gray-600/70 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
            {conversa.tags.length > 2 && (
              <Badge 
                variant="outline" 
                className="px-1.5 py-0 text-[10px] bg-gray-800/70 border-gray-600/70 text-gray-300"
              >
                +{conversa.tags.length - 2}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formatarData(conversa.data)}
          </p>
        </div>
      </motion.div>
    );
  };

  // Componente para a coluna central (prévia visual)
  const ColunaPreviaVisual = () => {
    if (!conversaSelecionada) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mb-3 mx-auto opacity-30" />
            <p className="text-lg font-medium mb-1">Selecione uma conversa</p>
            <p className="text-sm opacity-70">Escolha uma conversa para visualizar</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-700/50 p-4 bg-gradient-to-r from-gray-800/40 to-gray-800/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-700/80">
                {renderIconeTipo(conversaSelecionada.tipo)}
              </div>
              <h3 className="font-medium text-base">{conversaSelecionada.titulo}</h3>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1.5 bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/60"
                      onClick={() => setMostrarDetalhes(true)}
                    >
                      <Expand className="h-3.5 w-3.5" />
                      <span className="text-xs">Expandir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    Ver detalhes completos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {conversaSelecionada.tags.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-gray-800/60 border-gray-700/50 text-gray-300 hover:bg-gray-700/60 cursor-pointer text-xs px-2"
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
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-700/70 transition-colors">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-600/20">
                  <MessageSquare className="h-3 w-3 text-blue-400" />
                </div>
                Resumo da Conversa
              </h4>
              <p className="text-sm text-gray-300/90 leading-relaxed">{conversaSelecionada.previa}</p>
            </div>
            
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-700/70 transition-colors">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-600/20">
                  <Clock className="h-3 w-3 text-indigo-400" />
                </div>
                Linha do Tempo
              </h4>
              <div className="flex items-center space-x-2 overflow-x-auto py-2 pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {conversaSelecionada.conteudo.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex-shrink-0 w-40 h-16 rounded-md flex flex-col justify-center items-center p-2 ${
                      item.role === 'user' 
                        ? 'bg-blue-900/30 border border-blue-700/60' 
                        : 'bg-gray-700/50 border border-gray-600/50'
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-600/60">
                        {item.role === 'user' ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </div>
                      {item.role === 'user' ? 'Você' : 'Epictus IA'}
                    </div>
                    <div className="text-[10px] text-center truncate w-full">
                      {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-700/70 transition-colors">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-600/20">
                  <Sparkles className="h-3 w-3 text-orange-400" />
                </div>
                Sugestões da IA
              </h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700/60 border-gray-600/60 hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-900/40 group-hover:bg-blue-900/60 transition-colors">
                      <RefreshCw className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-xs">Retomar de onde parou</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700/60 border-gray-600/60 hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-900/40 group-hover:bg-orange-900/60 transition-colors">
                      <AlertTriangle className="h-3 w-3 text-orange-400" />
                    </div>
                    <span className="text-xs">Gerar simulado baseado nessa conversa</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm bg-gray-700/60 border-gray-600/60 hover:bg-gray-600/60 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-900/40 group-hover:bg-green-900/60 transition-colors">
                      <Book className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-xs">Criar resumo interativo</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
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
            className="absolute right-0 top-0 h-full bg-gray-900 border-l border-gray-700/50 w-full md:w-[60%] lg:w-[50%] z-10 shadow-lg"
          >
            <div className="flex flex-col h-full">
              <div className="border-b border-gray-700/50 p-4 flex justify-between items-center bg-gradient-to-r from-gray-800/40 to-gray-800/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-700/80">
                    {renderIconeTipo(conversaSelecionada.tipo)}
                  </div>
                  <h3 className="font-medium text-base">{conversaSelecionada.titulo}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full hover:bg-gray-700/50"
                  onClick={() => setMostrarDetalhes(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="conteudo" className="flex-1 flex flex-col">
                <div className="border-b border-gray-700/50 bg-gray-800/30">
                  <TabsList className="mx-4 my-2 bg-gray-800/70 border border-gray-700/50">
                    <TabsTrigger value="conteudo" className="text-sm">Conteúdo</TabsTrigger>
                    <TabsTrigger value="acoes" className="text-sm">Ações</TabsTrigger>
                    <TabsTrigger value="comentarios" className="text-sm">Comentários</TabsTrigger>
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
                              : 'bg-gray-800/60 border border-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700/70">
                              {item.role === 'user' ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                              ) : (
                                <Brain className="h-3.5 w-3.5 text-indigo-400" />
                              )}
                            </div>
                            <div className="text-sm font-medium">
                              {item.role === 'user' ? 'Você' : 'Epictus IA'}
                            </div>
                            <div className="text-xs text-gray-400 ml-auto">
                              {idx === 0 ? formatarData(conversaSelecionada.data) : null}
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap ml-8 leading-relaxed">{item.content}</p>
                          
                          <div className="flex mt-3 ml-8 gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs rounded-full px-2.5 hover:bg-gray-700/50"
                            >
                              <Copy className="h-3 w-3 mr-1.5" />
                              Copiar
                            </Button>
                            {item.role === 'assistant' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs rounded-full px-2.5 hover:bg-gray-700/50"
                              >
                                <RefreshCw className="h-3 w-3 mr-1.5" />
                                Regenerar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="acoes" className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <AcaoCard 
                        titulo="Transformar em Resumo"
                        descricao="Gera uma versão condensada"
                        icone={<Book className="h-4 w-4 text-blue-400" />}
                        cor="blue"
                      />
                      
                      <AcaoCard 
                        titulo="Gerar Quiz"
                        descricao="Cria questões baseadas no conteúdo"
                        icone={<AlertTriangle className="h-4 w-4 text-purple-400" />}
                        cor="purple"
                      />
                      
                      <AcaoCard 
                        titulo="Exportar como PDF"
                        descricao="Salve a conversa localmente"
                        icone={<Download className="h-4 w-4 text-teal-400" />}
                        cor="teal"
                      />
                      
                      <AcaoCard 
                        titulo="Mandar para Caderno"
                        descricao="Salve como anotação pessoal"
                        icone={<StickyNote className="h-4 w-4 text-green-400" />}
                        cor="green"
                      />
                      
                      <AcaoCard 
                        titulo="Agendar Revisão"
                        descricao="Programe uma revisão futura"
                        icone={<Calendar className="h-4 w-4 text-orange-400" />}
                        cor="orange"
                      />
                      
                      <AcaoCard 
                        titulo="Análise de Qualidade"
                        descricao="Avalie seu estudo com IA"
                        icone={<Award className="h-4 w-4 text-red-400" />}
                        cor="red"
                      />
                      
                      <AcaoCard 
                        titulo="Retomar Conversa"
                        descricao="Continue de onde parou"
                        icone={<ArrowRight className="h-4 w-4 text-indigo-400" />}
                        cor="indigo"
                      />
                      
                      <AcaoCard 
                        titulo="Criar Fluxograma"
                        descricao="Visualize o conteúdo graficamente"
                        icone={<Sparkles className="h-4 w-4 text-yellow-400" />}
                        cor="yellow"
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="comentarios" className="flex-1 p-0 overflow-hidden">
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                      <div className="flex flex-col items-center justify-center text-center text-gray-400 h-64">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="font-medium mb-1">Nenhum comentário ainda</p>
                        <p className="text-sm opacity-70 mb-4">Adicione notas pessoais para organizar seus estudos</p>
                        
                        <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50">
                          <MessageSquare className="h-3.5 w-3.5 mr-2" />
                          Adicionar primeiro comentário
                        </Button>
                      </div>
                    </ScrollArea>
                    
                    <div className="border-t border-gray-700/50 p-3 bg-gray-800/20">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Adicione um comentário pessoal..."
                          className="bg-gray-800/50 border-gray-700/50 text-sm focus-visible:ring-blue-600"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700">
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
  
  // Componente de card de ação
  const AcaoCard = ({ titulo, descricao, icone, cor }) => {
    const getBgColor = () => {
      switch (cor) {
        case 'blue': return 'bg-blue-900/30 border-blue-800/50 hover:bg-blue-900/40';
        case 'purple': return 'bg-purple-900/30 border-purple-800/50 hover:bg-purple-900/40';
        case 'teal': return 'bg-teal-900/30 border-teal-800/50 hover:bg-teal-900/40';
        case 'green': return 'bg-green-900/30 border-green-800/50 hover:bg-green-900/40';
        case 'orange': return 'bg-orange-900/30 border-orange-800/50 hover:bg-orange-900/40';
        case 'red': return 'bg-red-900/30 border-red-800/50 hover:bg-red-900/40';
        case 'indigo': return 'bg-indigo-900/30 border-indigo-800/50 hover:bg-indigo-900/40';
        case 'yellow': return 'bg-yellow-900/30 border-yellow-800/50 hover:bg-yellow-900/40';
        default: return 'bg-gray-900/30 border-gray-800/50 hover:bg-gray-900/40';
      }
    };
    
    return (
      <Button 
        variant="outline" 
        className={`flex items-center justify-start h-auto p-3 ${getBgColor()} border transition-colors group`}
      >
        <div className={`mr-3 p-2 rounded-md ${getBgColor()} group-hover:scale-105 transition-transform`}>
          {icone}
        </div>
        <div className="text-left">
          <div className="font-medium text-sm">{titulo}</div>
          <div className="text-xs text-gray-400">{descricao}</div>
        </div>
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[85%] md:max-w-[85%] lg:max-w-[85%] xl:max-w-[1100px] h-[85vh] bg-gradient-to-br from-[#161b26] to-[#1d2234] text-white border-gray-800 p-0 overflow-hidden shadow-2xl"
        onEscapeKeyDown={() => mostrarDetalhes ? setMostrarDetalhes(false) : onOpenChange(false)}
      >
        <DialogHeader className="px-6 py-3 border-b border-gray-800 bg-gradient-to-r from-blue-900/30 to-indigo-900/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100%-60px)] overflow-hidden relative">
          <div className="w-full h-full md:max-w-[350px]">
            <ColunaListaConversas />
          </div>
          
          <div className="hidden md:block h-full md:col-span-1">
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

// Componente Filter que estava faltando
const Filter = ({ className, ...props }) => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default HistoricoConversasModal;
