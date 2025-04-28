
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Pencil, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  FolderOpen, 
  X,
  Filter,
  Star,
  Clock,
  History,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
  FileText,
  CheckCircle,
  ChevronDown,
  Shuffle,
  LayoutGrid,
  ListFilter,
  CalendarDays,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Settings,
  Edit3,
  Sparkles
} from "lucide-react";

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Pasta {
  id: string;
  nome: string;
  cor: string;
  contagem?: number;
}

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  pastaId: string;
  data: Date;
  modelo: string;
  favorito: boolean;
  ultimaEdicao?: Date;
  tags?: string[];
  visualizacoes?: number;
}

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // Estados
  const [pastas, setPastas] = useState<Pasta[]>([
    { id: "p1", nome: "História", cor: "#F5C542", contagem: 3 },
    { id: "p2", nome: "Matemática", cor: "#42C5F5", contagem: 4 },
    { id: "p3", nome: "Biologia", cor: "#4CAF50", contagem: 2 },
    { id: "p4", nome: "Literatura", cor: "#9C27B0", contagem: 1 },
    { id: "p5", nome: "Provas Finais", cor: "#F44336", contagem: 5 },
  ]);
  
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([
    { 
      id: "a1", 
      titulo: "Revolução Francesa", 
      conteudo: "# Revolução Francesa\n\n## Contexto Histórico\nA Revolução Francesa (1789-1799) foi um período de mudança social e política radical na França que teve um impacto profundo na história moderna.\n\n## Causas Principais\n- Crise financeira do estado\n- Desigualdade social (sistema de estados)\n- Influência do Iluminismo\n- Exemplo da Revolução Americana\n\n## Eventos Importantes\n1. Queda da Bastilha (14 de julho de 1789)\n2. Declaração dos Direitos do Homem e do Cidadão\n3. Período do Terror\n4. Ascensão de Napoleão Bonaparte", 
      resumo: "Análise completa da Revolução Francesa, suas causas, eventos principais e consequências históricas.",
      pastaId: "p1",
      data: new Date("2023-10-15"),
      modelo: "Estudo Completo",
      favorito: true,
      ultimaEdicao: new Date("2023-11-20"),
      tags: ["História", "Europa", "Revolução", "Iluminismo"],
      visualizacoes: 42
    },
    { 
      id: "a2", 
      titulo: "Teorema de Pitágoras", 
      conteudo: "# Teorema de Pitágoras\n\n## Definição\nEm um triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.\n\n## Fórmula\na² = b² + c²\n\nOnde:\n- a é a hipotenusa\n- b e c são os catetos\n\n## Exemplos de Aplicação\n1. Triângulo 3-4-5\n   - 5² = 3² + 4²\n   - 25 = 9 + 16 ✓\n\n2. Triângulo 5-12-13\n   - 13² = 5² + 12²\n   - 169 = 25 + 144 ✓", 
      resumo: "Explicação detalhada do Teorema de Pitágoras, suas aplicações e exemplos práticos.",
      pastaId: "p2",
      data: new Date("2023-11-20"),
      modelo: "Revisão Rápida",
      favorito: false,
      ultimaEdicao: new Date("2023-12-01"),
      tags: ["Matemática", "Geometria", "Teorema", "Triângulos"],
      visualizacoes: 27
    },
    { 
      id: "a3", 
      titulo: "Fotossíntese", 
      conteudo: "# Fotossíntese\n\n## O que é\nProcesso bioquímico realizado pelas plantas, algas e algumas bactérias para converter energia luminosa em energia química.\n\n## Equação Química\n6CO₂ + 6H₂O + Energia Luminosa → C₆H₁₂O₆ + 6O₂\n\n## Fases da Fotossíntese\n1. **Fase Clara (Fotoquímica)**\n   - Ocorre nas membranas dos tilacoides\n   - Depende diretamente da luz\n   - Produção de ATP e NADPH\n\n2. **Fase Escura (Ciclo de Calvin)**\n   - Ocorre no estroma dos cloroplastos\n   - Não depende diretamente da luz\n   - Utiliza o CO₂ para produzir glicose", 
      resumo: "Estudo detalhado sobre o processo de fotossíntese, suas fases e importância biológica.",
      pastaId: "p3",
      data: new Date("2023-12-05"),
      modelo: "Estudo Completo",
      favorito: true,
      ultimaEdicao: new Date("2023-12-20"),
      tags: ["Biologia", "Botânica", "Bioquímica", "Energia"],
      visualizacoes: 38
    },
    { 
      id: "a4", 
      titulo: "Funções Logarítmicas", 
      conteudo: "# Funções Logarítmicas\n\n## Definição\nUma função logarítmica é definida como f(x) = log_a(x), onde a > 0 e a ≠ 1.\n\n## Propriedades Importantes\n- log_a(1) = 0\n- log_a(a) = 1\n- log_a(x·y) = log_a(x) + log_a(y)\n- log_a(x/y) = log_a(x) - log_a(y)\n- log_a(x^n) = n·log_a(x)\n\n## Aplicações\n1. Problemas de crescimento e decaimento\n2. Escala Richter (terremotos)\n3. Escala de pH\n4. Decibéis (intensidade sonora)", 
      resumo: "Estudo detalhado sobre funções logarítmicas, suas propriedades e aplicações no mundo real.",
      pastaId: "p2",
      data: new Date("2024-01-10"),
      modelo: "Estudo Completo",
      favorito: false,
      ultimaEdicao: new Date("2024-01-15"),
      tags: ["Matemática", "Funções", "Logaritmo", "Álgebra"],
      visualizacoes: 19
    },
  ]);
  
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>("p1");
  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState<string | null>("a1");
  const [pesquisa, setPesquisa] = useState("");
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [novaPasta, setNovaPasta] = useState({ nome: "", cor: "#42C5F5" });
  const [visualMode, setVisualMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"recentes" | "az" | "favoritos">("recentes");
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Animação ao abrir
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Funções auxiliares
  const getAnotacoesDaPasta = () => {
    if (!pastaSelecionada) return [];
    
    let filteredAnotacoes = anotacoes.filter(a => a.pastaId === pastaSelecionada);
    
    // Aplicar pesquisa
    if (pesquisa !== "") {
      filteredAnotacoes = filteredAnotacoes.filter(a => 
        a.titulo.toLowerCase().includes(pesquisa.toLowerCase()) || 
        a.resumo.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }
    
    // Aplicar filtro de tags
    if (selectedTags.length > 0) {
      filteredAnotacoes = filteredAnotacoes.filter(a => 
        a.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Aplicar ordenação
    switch (sortBy) {
      case "recentes":
        return filteredAnotacoes.sort((a, b) => b.ultimaEdicao!.getTime() - a.ultimaEdicao!.getTime());
      case "az":
        return filteredAnotacoes.sort((a, b) => a.titulo.localeCompare(b.titulo));
      case "favoritos":
        return filteredAnotacoes.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));
      default:
        return filteredAnotacoes;
    }
  };
  
  const getAnotacaoSelecionada = () => {
    return anotacoes.find(a => a.id === anotacaoSelecionada);
  };
  
  const handleCriarPasta = () => {
    if (novaPasta.nome.trim() === "") return;
    
    const novaPastaObj: Pasta = {
      id: `p${pastas.length + 1}`,
      nome: novaPasta.nome,
      cor: novaPasta.cor,
      contagem: 0
    };
    
    setPastas([...pastas, novaPastaObj]);
    setNovaPasta({ nome: "", cor: "#42C5F5" });
    setCriandoPasta(false);
    setPastaSelecionada(novaPastaObj.id);
  };
  
  const handleExcluirPasta = (id: string) => {
    const novasPastas = pastas.filter(p => p.id !== id);
    setPastas(novasPastas);
    
    if (pastaSelecionada === id) {
      setPastaSelecionada(novasPastas.length > 0 ? novasPastas[0].id : null);
    }
  };
  
  const handleFavoritar = (id: string) => {
    setAnotacoes(
      anotacoes.map(a => 
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  const getAllTags = () => {
    const allTags: string[] = [];
    anotacoes.forEach(anotacao => {
      anotacao.tags?.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });
    return allTags.sort();
  };

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Forçar renderização correta
  useEffect(() => {
    if (open) {
      // Força reflow/repaint para garantir que o modal seja renderizado corretamente
      setTimeout(() => {
        const element = document.querySelector('.apostila-modal');
        if (element) {
          element.classList.add('apostila-modal-active');
        }
      }, 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true} className="apostila-modal">
      <DialogContent 
        className={`${isFullscreen ? 'max-w-[98vw] h-[98vh] max-h-[98vh]' : 'max-w-[90vw] w-[1400px] h-[85vh] max-h-[85vh]'} bg-[#0a0a0c] text-white rounded-3xl p-0 overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
        style={{
          boxShadow: '0 10px 60px rgba(0, 0, 0, 0.6), 0 0 100px rgba(66, 197, 245, 0.2)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(13,13,15,0.98) 0%, rgba(17,17,23,0.98) 100%)',
          position: 'relative',
          zIndex: 100
        }}
        onInteractOutside={(e) => {
          e.preventDefault(); // Previne interação externa
        }}
        onEscapeKeyDown={(e) => {
          // Garante que apenas o ESC deste modal seja processado
          e.preventDefault();
          onOpenChange(false);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <DialogHeader className="py-4 px-6 flex flex-row justify-between items-center border-b border-[#1a1a24] bg-gradient-to-r from-[#0a0a0c] to-[#131320]">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#42C5F5] to-[#0A84FF] flex items-center justify-center shadow-xl relative group">
                  <BookOpen size={22} className="text-white" />
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#42C5F5] to-[#0A84FF] opacity-70 blur-md -z-10"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-white font-bold tracking-tight">Apostila Inteligente</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] px-2 py-0 h-4">PRO</Badge>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">Organize suas anotações com inteligência artificial</span>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 hover:bg-[#1a1a24] text-gray-400 hover:text-white"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>
                <DialogClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-9 w-9 hover:bg-[#1a1a24] text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>
          <div className="flex flex-1 overflow-hidden">
          {/* Barra Lateral Esquerda (Pastas) */}
          <div className="w-[280px] border-r border-[#1a1a24] bg-[#0a0a0c] flex flex-col">
            <div className="p-4 border-b border-[#1a1a24]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1a1a24] flex items-center justify-center">
                    <FolderOpen size={14} className="text-[#42C5F5]" />
                  </div>
                  <span>Minhas Pastas</span>
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 hover:bg-[#1a1a24] text-[#42C5F5]"
                        onClick={() => setCriandoPasta(true)}
                      >
                        <FolderPlus size={15} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Criar nova pasta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <AnimatePresence>
                {criandoPasta && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 bg-[#12121a] p-4 rounded-xl overflow-hidden border border-[#2a2a3a]"
                    style={{
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                    }}
                  >
                    <Input 
                      placeholder="Nome da pasta" 
                      className="bg-[#1a1a24] border-[#2a2a3a] mb-3 h-10 text-sm focus-visible:ring-[#42C5F5]"
                      value={novaPasta.nome}
                      onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                      autoFocus
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5 flex-wrap max-w-[160px]">
                        {["#42C5F5", "#F5C542", "#4CAF50", "#F44336", "#9C27B0", "#2196F3", "#FF9800", "#E91E63"].map(cor => (
                          <motion.button
                            key={cor}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-6 h-6 rounded-full border-2 ${novaPasta.cor === cor ? 'border-white' : 'border-transparent'}`}
                            style={{ 
                              backgroundColor: cor,
                              boxShadow: novaPasta.cor === cor ? `0 0 12px ${cor}90` : 'none'
                            }}
                            onClick={() => setNovaPasta({...novaPasta, cor})}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 hover:bg-[#2a2a3a] text-sm"
                          onClick={() => setCriandoPasta(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 px-3 bg-gradient-to-r from-[#42C5F5] to-[#3BABDB] hover:from-[#3BABDB] hover:to-[#42C5F5] text-white text-sm"
                          onClick={handleCriarPasta}
                        >
                          Criar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <ScrollArea className="flex-1 py-2 px-1">
              <div className="flex flex-col gap-1.5 px-2">
                <AnimatePresence>
                  {pastas.map((pasta, index) => (
                    <motion.div 
                      key={pasta.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`px-3 py-3 rounded-xl flex items-center justify-between group cursor-pointer transition-all duration-200
                      ${pastaSelecionada === pasta.id 
                        ? 'bg-gradient-to-r from-[#12121a] to-[#1a1a24] border-l-4 pl-2 shadow-lg' 
                        : 'hover:bg-[#12121a] border-l-4 border-transparent pl-2'}`}
                      style={{
                        borderLeftColor: pastaSelecionada === pasta.id ? pasta.cor : 'transparent',
                        boxShadow: pastaSelecionada === pasta.id ? '0 2px 10px rgba(0, 0, 0, 0.2)' : 'none'
                      }}
                      onClick={() => setPastaSelecionada(pasta.id)}
                      whileHover={{ 
                        scale: pastaSelecionada === pasta.id ? 1 : 1.02,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: pasta.cor,
                            boxShadow: pastaSelecionada === pasta.id ? `0 0 8px ${pasta.cor}80` : 'none'
                          }}
                        ></div>
                        <span className="truncate font-medium text-sm">{pasta.nome}</span>
                        {pasta.contagem !== undefined && (
                          <Badge 
                            className={`ml-1 h-5 py-0 text-xs ${
                              pastaSelecionada === pasta.id 
                                ? 'bg-[#2a2a3a] text-white' 
                                : 'bg-[#1a1a24] text-gray-400'
                            }`}
                          >
                            {pasta.contagem}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-gray-400">
                                <Pencil size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              <p>Editar pasta</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-gray-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExcluirPasta(pasta.id);
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              <p>Excluir pasta</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-[#1a1a24]">
              <Button 
                className="w-full bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6] gap-2 h-10 shadow-lg"
                style={{
                  boxShadow: '0 5px 15px rgba(10, 132, 255, 0.2)'
                }}
              >
                <Plus size={16} /> Nova Anotação
              </Button>
            </div>
          </div>
          
          {/* Área Central (Lista de Anotações) */}
          <div className="w-[360px] border-r border-[#1a1a24] bg-[#0c0c12] flex flex-col">
            {/* Cabeçalho da área central */}
            <div className="p-4 border-b border-[#1a1a24]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1a1a24] flex items-center justify-center">
                    <FileText size={14} className="text-[#42C5F5]" />
                  </div>
                  <span>Anotações</span>
                </h3>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setVisualMode(visualMode === "list" ? "grid" : "list")}
                          className="rounded-full h-8 w-8 hover:bg-[#1a1a24] text-gray-300"
                        >
                          {visualMode === "list" ? <LayoutGrid size={16} /> : <ListFilter size={16} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Alternar visualização</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-[#1a1a24] text-[#42C5F5]"
                        >
                          <Plus size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Criar nova anotação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="relative mb-4 group">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-[#42C5F5] transition-colors duration-200" />
                <Input 
                  placeholder="Pesquisar anotações..." 
                  className="pl-10 bg-[#151520] border-[#2a2a3a] h-10 text-sm focus-visible:ring-[#42C5F5] rounded-xl"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
                {pesquisa && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-[#2a2a3a]"
                    onClick={() => setPesquisa("")}
                  >
                    <X size={14} className="text-gray-500" />
                  </Button>
                )}
              </div>
              
              {/* Filtros e ordenação */}
              <div className="flex justify-between items-center gap-2 mb-3">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-9 px-3 text-xs rounded-lg ${
                            showTagsFilter 
                              ? 'bg-gradient-to-r from-[#1a1a24] to-[#2a2a3a] text-[#42C5F5] border border-[#2a2a3a]' 
                              : 'text-gray-400 hover:bg-[#1a1a24]'
                          }`}
                          onClick={() => setShowTagsFilter(!showTagsFilter)}
                        >
                          <Filter size={14} className="mr-1.5" /> Filtrar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Filtrar por tags</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 text-xs rounded-lg text-gray-400 hover:bg-[#1a1a24]"
                          onClick={() => setSortBy(sortBy === "recentes" ? "az" : sortBy === "az" ? "favoritos" : "recentes")}
                        >
                          <Shuffle size={14} className="mr-1.5" /> 
                          {sortBy === "recentes" ? "Recentes" : sortBy === "az" ? "A-Z" : "Favoritos"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Alterar ordenação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Badge variant="outline" className="bg-[#151520] text-xs">
                  {getAnotacoesDaPasta().length} anotações
                </Badge>
              </div>
              
              {/* Filtro de tags */}
              <AnimatePresence>
                {showTagsFilter && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#151520] rounded-xl p-3 mb-3 border border-[#2a2a3a] overflow-hidden"
                    style={{
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}
                  >
                    <div className="text-xs text-gray-300 mb-2 flex items-center">
                      <Sparkles size={12} className="text-[#42C5F5] mr-1.5" />
                      Filtrar por tags:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {getAllTags().map(tag => (
                        <Badge 
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer text-xs py-0.5 px-2 ${
                            selectedTags.includes(tag) 
                              ? 'bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6] text-white border-none' 
                              : 'hover:bg-[#2a2a3a] border-[#2a2a3a]'
                          }`}
                          onClick={() => toggleTagSelection(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Lista de anotações */}
            <ScrollArea className="flex-1">
              <div className={`p-3 ${visualMode === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2.5"}`}>
                <AnimatePresence>
                  {getAnotacoesDaPasta().length > 0 ? (
                    getAnotacoesDaPasta().map((anotacao, index) => (
                      <motion.div 
                        key={anotacao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.25, 
                          delay: index * 0.04,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        whileHover={{ 
                          scale: anotacaoSelecionada === anotacao.id ? 1 : 1.02,
                          y: anotacaoSelecionada === anotacao.id ? 0 : -3,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`${visualMode === "grid" 
                          ? "p-4 h-[190px] flex flex-col" 
                          : "p-4"} 
                          rounded-xl bg-gradient-to-b from-[#151520] to-[#0f0f18] cursor-pointer group
                          ${anotacaoSelecionada === anotacao.id 
                            ? 'ring-2 ring-[#42C5F5]' 
                            : 'hover:bg-[#181825] border border-[#2a2a3a] hover:border-[#3a3a4a]'}
                          transition-all duration-200`}
                        onClick={() => setAnotacaoSelecionada(anotacao.id)}
                        style={{
                          boxShadow: anotacaoSelecionada === anotacao.id 
                            ? '0 0 25px rgba(66, 197, 245, 0.25), 0 5px 15px rgba(0, 0, 0, 0.1)' 
                            : '0 4px 8px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white truncate text-sm">{anotacao.titulo}</h4>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.button 
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.85 }}
                                    className={`p-1.5 rounded-lg hover:bg-[#2a2a3a] ${anotacao.favorito ? 'text-amber-400' : 'text-gray-500'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFavoritar(anotacao.id);
                                    }}
                                  >
                                    <Star size={14} fill={anotacao.favorito ? "currentColor" : "none"} />
                                  </motion.button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                  <p>{anotacao.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.button 
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.85 }}
                                    className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-gray-500"
                                  >
                                    <MoreHorizontal size={14} />
                                  </motion.button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                  <p>Mais opções</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        <p className={`text-xs text-gray-400 line-clamp-${visualMode === "grid" ? "3" : "2"} flex-grow leading-relaxed`}>
                          {anotacao.resumo}
                        </p>
                        
                        {visualMode === "grid" && (
                          <div className="mt-auto">
                            {anotacao.tags && (
                              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                                {anotacao.tags.slice(0, 2).map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs py-0.5 px-2 bg-[#1A1A24] text-gray-300 border-[#2a2a3a]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {anotacao.tags.length > 2 && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs py-0.5 px-2 bg-[#1A1A24] text-gray-300 border-[#2a2a3a]"
                                  >
                                    +{anotacao.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2 text-xs">
                          <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Clock size={12} />
                            {anotacao.ultimaEdicao?.toLocaleDateString() || anotacao.data.toLocaleDateString()}
                          </span>
                          <span 
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              anotacao.modelo === "Estudo Completo" 
                                ? 'bg-[#42C5F5]/15 text-[#42C5F5]' 
                                : 'bg-[#9C27B0]/15 text-[#D39EE2]'
                            }`}
                          >
                            {anotacao.modelo}
                          </span>
                        </div>
                        
                        <motion.div 
                          className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 0, y: 5 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 hover:bg-[#2a2a3a] text-gray-300 text-xs">
                            <Eye size={13} className="mr-1.5"/> Ver
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 hover:bg-[#2a2a3a] text-gray-300 text-xs">
                            <Edit3 size={13} className="mr-1.5"/> Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 hover:bg-[#2a2a3a] text-gray-300 text-xs">
                            <Trash2 size={13} className="mr-1.5"/> Excluir
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center h-60 text-gray-400 p-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#151520] flex items-center justify-center mb-4 border border-[#2a2a3a]">
                        <FileText size={30} className="text-gray-500" />
                      </div>
                      <p className="text-center text-base font-medium mb-2">Nenhuma anotação encontrada</p>
                      <p className="text-xs text-gray-500 text-center max-w-[240px]">
                        Crie uma nova anotação ou modifique seus filtros de busca para visualizar conteúdo
                      </p>
                      <Button 
                        className="mt-4 h-9 px-4 bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6] shadow-md"
                        style={{
                          boxShadow: '0 4px 12px rgba(10, 132, 255, 0.2)'
                        }}
                      >
                        <Plus size={14} className="mr-1.5" /> Criar Anotação
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
          
          {/* Área Direita (Visualização e Ações) */}
          <div className="flex-1 bg-[#0a0a0c] flex flex-col">
            <AnimatePresence mode="wait">
              {anotacaoSelecionada && getAnotacaoSelecionada() ? (
                <motion.div
                  key="anotacao-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="px-8 py-5 border-b border-[#1a1a24] bg-gradient-to-r from-[#0a0a0c] to-[#0d0d14]">
                    <div className="flex justify-between items-center mb-3">
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <h2 className="text-2xl font-bold text-white tracking-tight">{getAnotacaoSelecionada()?.titulo}</h2>
                        {getAnotacaoSelecionada()?.favorito && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 260, 
                              damping: 20, 
                              delay: 0.2 
                            }}
                          >
                            <Star size={18} className="text-amber-400" fill="currentColor" />
                          </motion.div>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="flex gap-2"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 gap-1.5 bg-[#151520]/50 border-[#2a2a3a] hover:bg-[#1a1a24] text-white"
                              >
                                <Edit3 size={15} /> Editar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Editar anotação</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-9 gap-1.5 bg-[#151520]/50 border-[#2a2a3a] hover:bg-[#1a1a24] text-white"
                              >
                                <Download size={15} /> Exportar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Exportar como PDF/Markdown</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-9 w-9 bg-[#151520]/50 border-[#2a2a3a] hover:bg-[#1a1a24] text-white"
                              >
                                <MoreHorizontal size={15} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Mais opções</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-3"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-[#151520] flex items-center justify-center">
                          <FolderOpen size={12} className="text-[#42C5F5]" />
                        </div>
                        <span className="text-gray-300">
                          {pastas.find(p => p.id === getAnotacaoSelecionada()?.pastaId)?.nome}
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-[#151520] flex items-center justify-center">
                          <CalendarDays size={12} className="text-[#42C5F5]" />
                        </div>
                        <span className="text-gray-300">
                          Criado em {getAnotacaoSelecionada()?.data.toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-[#151520] flex items-center justify-center">
                          <Clock size={12} className="text-[#42C5F5]" />
                        </div>
                        <span className="text-gray-300">
                          Editado em {getAnotacaoSelecionada()?.ultimaEdicao?.toLocaleDateString() || getAnotacaoSelecionada()?.data.toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-[#151520] flex items-center justify-center">
                          <Eye size={12} className="text-[#42C5F5]" />
                        </div>
                        <span className="text-gray-300">{getAnotacaoSelecionada()?.visualizacoes || 0} visualizações</span>
                      </div>
                    </motion.div>
                    
                    {getAnotacaoSelecionada()?.tags && (
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="flex flex-wrap gap-1.5 mt-3"
                      >
                        {getAnotacaoSelecionada()?.tags?.map((tag, index) => (
                          <Badge 
                            key={index} 
                            className="bg-[#151520] hover:bg-[#1a1a24] text-gray-200 border border-[#2a2a3a] px-2.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  
                  <Tabs defaultValue="conteudo" className="flex-1 flex flex-col" style={{ height: "calc(100% - 170px)" }}>
                    <div className="px-8 py-3 border-b border-[#1a1a24] bg-[#0a0a0c]">
                      <TabsList className="bg-[#151520] p-1.5 rounded-lg">
                        <TabsTrigger 
                          value="conteudo" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#42C5F5] data-[state=active]:to-[#0A84FF] data-[state=active]:text-white rounded-md px-5 py-1.5"
                        >
                          Conteúdo
                        </TabsTrigger>
                        <TabsTrigger 
                          value="historico" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#42C5F5] data-[state=active]:to-[#0A84FF] data-[state=active]:text-white rounded-md px-5 py-1.5"
                        >
                          Histórico de Versões
                        </TabsTrigger>
                        <TabsTrigger 
                          value="estatisticas" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#42C5F5] data-[state=active]:to-[#0A84FF] data-[state=active]:text-white rounded-md px-5 py-1.5"
                        >
                          Estatísticas
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="conteudo" className="flex-1 p-0 m-0 h-full">
                      <ScrollArea className="flex-1 h-full custom-scrollbar p-8">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                          className="max-w-4xl mx-auto prose prose-invert prose-headings:font-display prose-headings:font-bold"
                        >
                          {getAnotacaoSelecionada()?.conteudo.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                              return (
                                <motion.h1 
                                  key={i} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + (i * 0.03), duration: 0.4 }}
                                  className="text-3xl font-bold mt-6 mb-5 text-white pb-3 border-b border-[#1a1a24] tracking-tight"
                                >
                                  {line.substring(2)}
                                </motion.h1>
                              );
                            } else if (line.startsWith('## ')) {
                              return (
                                <motion.h2 
                                  key={i} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + (i * 0.02), duration: 0.3 }}
                                  className="text-xl font-bold mt-8 mb-4 text-white group flex items-center"
                                >
                                  <div className="relative">
                                    <span className="absolute inset-0 bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] blur-sm opacity-50 rounded-sm"></span>
                                    <span className="bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] w-1.5 h-6 rounded-sm relative"></span>
                                  </div>
                                  <span className="ml-3">{line.substring(3)}</span>
                                </motion.h2>
                              );
                            } else if (line.startsWith('- ')) {
                              return (
                                <motion.li 
                                  key={i} 
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + (i * 0.01), duration: 0.3 }}
                                  className="ml-5 my-1.5 text-gray-300"
                                >
                                  {line.substring(2)}
                                </motion.li>
                              );
                            } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                              const numberMatch = line.match(/^\d+\.\s/);
                              const number = numberMatch ? numberMatch[0] : "";
                              return (
                                <motion.div 
                                  key={i} 
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + (i * 0.01), duration: 0.3 }}
                                  className="flex ml-3 my-3"
                                >
                                  <div className="relative mr-3 flex-shrink-0">
                                    <span className="absolute inset-0 bg-gradient-to-r from-[#42C5F5]/30 to-[#0A84FF]/30 blur-md rounded-full"></span>
                                    <div className="w-7 h-7 rounded-full bg-[#151520] border border-[#2a2a3a] flex items-center justify-center text-[#42C5F5] text-sm font-medium relative">
                                      {number.replace('. ', '')}
                                    </div>
                                  </div>
                                  <span className="text-gray-200 pt-1">{line.substring(number.length)}</span>
                                </motion.div>
                              );
                            } else if (line === '') {
                              return <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>&nbsp;</motion.p>;
                            } else {
                              return (
                                <motion.p 
                                  key={i} 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + (i * 0.01), duration: 0.3 }}
                                  className="my-2.5 text-gray-200 leading-relaxed"
                                >
                                  {line}
                                </motion.p>
                              );
                            }
                          })}
                        </motion.div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="historico" className="flex-1 p-0 m-0">
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-[#151520] flex items-center justify-center mx-auto mb-4 border border-[#2a2a3a]">
                            <History size={28} className="text-[#42C5F5]" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3 text-white">Histórico de Versões</h3>
                          <p className="text-sm text-gray-400 max-w-md">
                            Acompanhe as alterações feitas nesta anotação ao longo do tempo e restaure versões anteriores quando necessário.
                          </p>
                          <Button className="mt-5 bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6]">
                            Ver Histórico Completo
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="estatisticas" className="flex-1 p-0 m-0">
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-[#151520] flex items-center justify-center mx-auto mb-4 border border-[#2a2a3a]">
                            <SlidersHorizontal size={28} className="text-[#42C5F5]" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3 text-white">Estatísticas</h3>
                          <p className="text-sm text-gray-400 max-w-md">
                            Visualize estatísticas detalhadas sobre suas anotações, frequência de uso e sugestões de revisão inteligente.
                          </p>
                          <Button className="mt-5 bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6]">
                            Gerar Relatório
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-full text-gray-400 p-8"
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#0c0c12] to-[#151520] flex items-center justify-center mb-6 border border-[#2a2a3a]"
                    style={{
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#42C5F5]/20 to-[#0A84FF]/20 rounded-full blur-xl"></div>
                      <BookOpen size={48} className="text-[#42C5F5] relative" />
                    </div>
                  </motion.div>
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-2xl font-bold mb-3 text-white tracking-tight"
                  >
                    Nenhuma anotação selecionada
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-gray-400 text-center max-w-md mb-8 leading-relaxed"
                  >
                    Selecione uma anotação da lista para visualizar seu conteúdo ou crie uma nova anotação para organizar seus estudos de forma inteligente.
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Button 
                      className="px-6 py-7 h-auto bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0979e6] text-white font-medium rounded-xl shadow-xl"
                      style={{
                        boxShadow: '0 8px 25px rgba(10, 132, 255, 0.3)'
                      }}
                    >
                      <Plus size={20} className="mr-2" /> Criar Nova Anotação
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;
