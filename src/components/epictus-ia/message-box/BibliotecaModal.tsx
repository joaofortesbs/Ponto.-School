import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Upload, FileText, Link2, Edit3, Plus, HelpCircle, ChevronDown, MoreVertical, Eye, Trash2, Tag, FileIcon, Image as ImageIcon, Film, Headphones, BookOpen, ExternalLink, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface ConteudoBiblioteca {
  id: string;
  titulo: string;
  tipo: "pdf" | "documento" | "imagem" | "audio" | "video" | "link" | "nota";
  tags: string[];
  ativo: boolean;
  data: string;
  tamanho?: string;
  url?: string;
}

interface BibliotecaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dados simulados para demonstração
const dadosSimulados: ConteudoBiblioteca[] = [
  {
    id: "1",
    titulo: "Resumo Matemática - Funções Trigonométricas",
    tipo: "pdf",
    tags: ["matemática", "trigonometria", "resumo"],
    ativo: true,
    data: "2024-07-10",
    tamanho: "1.2 MB"
  },
  {
    id: "2",
    titulo: "Anotações de Física - Leis de Newton",
    tipo: "documento",
    tags: ["física", "mecânica", "leis de newton"],
    ativo: true,
    data: "2024-07-08",
    tamanho: "520 KB"
  },
  {
    id: "3",
    titulo: "Mapa Mental - História do Brasil",
    tipo: "imagem",
    tags: ["história", "brasil", "mapa mental"],
    ativo: false,
    data: "2024-07-05",
    tamanho: "3.7 MB"
  },
  {
    id: "4",
    titulo: "Podcast - Revolução Francesa",
    tipo: "audio",
    tags: ["história", "revolução francesa", "podcast"],
    ativo: true,
    data: "2024-07-01",
    tamanho: "15.3 MB"
  },
  {
    id: "5",
    titulo: "Aula - Biologia Celular",
    tipo: "video",
    tags: ["biologia", "célula", "aula"],
    ativo: true,
    data: "2024-06-28",
    tamanho: "87.2 MB"
  },
  {
    id: "6",
    titulo: "Artigo - Inteligência Artificial na Educação",
    tipo: "link",
    tags: ["tecnologia", "IA", "educação"],
    ativo: true,
    data: "2024-06-25",
    url: "https://exemplo.com/artigo-ia-educacao"
  },
  {
    id: "7",
    titulo: "Notas pessoais - Redação ENEM",
    tipo: "nota",
    tags: ["redação", "enem", "dicas"],
    ativo: true,
    data: "2024-06-20"
  },
];

const BibliotecaModal: React.FC<BibliotecaModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [conteudos, setConteudos] = useState<ConteudoBiblioteca[]>(dadosSimulados);
  const [activeTab, setActiveTab] = useState("todos");
  const [permiteUsarTodos, setPermiteUsarTodos] = useState(true);
  const [showAddOptionsMenu, setShowAddOptionsMenu] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    data: {
      ultimos7Dias: false,
      ultimos30Dias: false,
      ultimos3Meses: false
    },
    tipos: {
      pdf: false,
      documento: false,
      imagem: false,
      audio: false,
      video: false,
      link: false,
      nota: false
    },
    tamanho: {
      pequeno: false,
      medio: false,
      grande: false
    },
    status: {
      ativo: false,
      inativo: false
    },
    tags: [] as string[]
  });

  // Filtrar conteúdos com base na busca, categoria selecionada e filtros adicionais
  const conteudosFiltrados = conteudos.filter(item => {
    // Filtro por busca
    const matchesSearch = 
      searchTerm === "" || 
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por categoria (tab)
    const matchesTab = 
      activeTab === "todos" || 
      item.tipo === activeTab;
      
    // Filtro por data
    let matchesDate = true;
    if (filtrosAtivos.data.ultimos7Dias || filtrosAtivos.data.ultimos30Dias || filtrosAtivos.data.ultimos3Meses) {
      const uploadDate = new Date(item.data);
      const hoje = new Date();
      const diffDias = Math.floor((hoje.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      matchesDate = (
        (filtrosAtivos.data.ultimos7Dias && diffDias <= 7) ||
        (filtrosAtivos.data.ultimos30Dias && diffDias <= 30) ||
        (filtrosAtivos.data.ultimos3Meses && diffDias <= 90)
      );
    }
    
    // Filtro por tipo
    let matchesTipo = true;
    const tiposSelecionados = Object.entries(filtrosAtivos.tipos)
      .filter(([_, selecionado]) => selecionado)
      .map(([tipo]) => tipo);
      
    if (tiposSelecionados.length > 0) {
      matchesTipo = tiposSelecionados.includes(item.tipo);
    }
    
    // Filtro por tamanho
    let matchesTamanho = true;
    if (filtrosAtivos.tamanho.pequeno || filtrosAtivos.tamanho.medio || filtrosAtivos.tamanho.grande) {
      if (!item.tamanho) {
        matchesTamanho = false;
      } else {
        const tamanhoMB = parseFloat(item.tamanho.replace(' MB', ''));
        matchesTamanho = (
          (filtrosAtivos.tamanho.pequeno && tamanhoMB < 1) ||
          (filtrosAtivos.tamanho.medio && tamanhoMB >= 1 && tamanhoMB <= 10) ||
          (filtrosAtivos.tamanho.grande && tamanhoMB > 10)
        );
      }
    }
    
    // Filtro por status (ativo/inativo)
    let matchesStatus = true;
    if (filtrosAtivos.status.ativo || filtrosAtivos.status.inativo) {
      matchesStatus = (
        (filtrosAtivos.status.ativo && item.ativo) ||
        (filtrosAtivos.status.inativo && !item.ativo)
      );
    }
    
    // Filtro por tags
    let matchesTags = true;
    if (filtrosAtivos.tags.length > 0) {
      matchesTags = item.tags.some(tag => filtrosAtivos.tags.includes(tag));
    }

    return matchesSearch && matchesTab && matchesDate && matchesTipo && matchesTamanho && matchesStatus && matchesTags;
  });

  // Alternar ativação de um conteúdo
  const toggleConteudoAtivo = (id: string) => {
    setConteudos(conteudos.map(item => 
      item.id === id ? { ...item, ativo: !item.ativo } : item
    ));
  };

  // Obter ícone baseado no tipo de arquivo
  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "documento":
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      case "imagem":
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      case "audio":
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case "video":
        return <Film className="h-5 w-5 text-pink-500" />;
      case "link":
        return <Link2 className="h-5 w-5 text-cyan-500" />;
      case "nota":
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 h-[90vh] overflow-hidden border-0 rounded-2xl bg-gradient-to-br from-[#0a0f1a] to-[#131d2e] text-white shadow-2xl"
        style={{ 
          position: "fixed",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full h-full flex flex-col"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-start p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="mr-2">📚</span> Biblioteca Inteligente
                </h2>
                <p className="mt-1 text-sm text-gray-300 max-w-xl">
                  Todos os seus arquivos que podem ser usados como base de conhecimento pela IA
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Barra de busca */}
            <div className="p-4 bg-[#0a1321]/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título, tipo de conteúdo ou tag…"
                  className="pl-10 py-5 bg-[#131d2e]/40 border-white/10 text-white placeholder:text-gray-400 rounded-lg focus-visible:ring-[#0D23A0] focus-visible:ring-opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conteúdo principal com abas */}
            <div className="flex-grow overflow-hidden flex flex-col">
              <Tabs defaultValue="todos" className="flex-grow flex flex-col h-full" onValueChange={setActiveTab}>
                <div className="border-b border-white/10 px-4">
                  <TabsList className="bg-transparent border-b-0 justify-start px-0 py-0">
                    <TabsTrigger 
                      value="todos" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Todos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pdf" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      PDFs
                    </TabsTrigger>
                    <TabsTrigger 
                      value="documento" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Documentos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="imagem" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Imagens
                    </TabsTrigger>
                    <TabsTrigger 
                      value="audio" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Áudios
                    </TabsTrigger>
                    <TabsTrigger 
                      value="video" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Vídeos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="link" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Links
                    </TabsTrigger>
                    <TabsTrigger 
                      value="nota" 
                      className="px-4 py-2 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0D23A0] data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent text-sm"
                    >
                      Notas
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="flex-grow p-4 data-[state=active]:mt-0 overflow-hidden">
                  <div className="flex h-full gap-4">
                    {/* Barra lateral de Filtros - Colapsável */}
                    <div className="w-auto flex-shrink-0">
                      <Collapsible 
                        className="overflow-hidden" 
                        defaultOpen={false}
                      >
                        <div className="w-12 p-2 rounded-lg border border-white/10 bg-[#0a1321]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#131d2e]/60 transition-colors">
                          <CollapsibleTrigger className="w-full flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <SlidersHorizontal className="h-5 w-5 text-[#0D23A0]" />
                              <span className="text-xs text-gray-200 mt-1 font-medium">Filtros</span>
                            </div>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="mt-2 w-64 flex-shrink-0 bg-[#0a1321]/60 rounded-lg border border-white/10 p-4 overflow-hidden flex flex-col">
                            <ScrollArea className="flex-grow overflow-y-auto pr-2 max-h-[500px]">
                              {/* Seção: Data de Upload */}
                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Data de Upload</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="data-7dias" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.data.ultimos7Dias}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          data: { ...filtrosAtivos.data, ultimos7Dias: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="data-7dias" className="ml-2 text-xs text-gray-200">Últimos 7 dias</label>
                                  </div>
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="data-30dias" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.data.ultimos30Dias}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          data: { ...filtrosAtivos.data, ultimos30Dias: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="data-30dias" className="ml-2 text-xs text-gray-200">Últimos 30 dias</label>
                                  </div>
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="data-3meses" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.data.ultimos3Meses}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          data: { ...filtrosAtivos.data, ultimos3Meses: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="data-3meses" className="ml-2 text-xs text-gray-200">Últimos 3 meses</label>
                                  </div>
                                </div>
                              </div>

                              {/* Seção: Tipos de Conteúdo */}
                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Tipos de Conteúdo</h4>
                                <div className="space-y-2">
                                  {["pdf", "documento", "imagem", "audio", "video", "link", "nota"].map(tipo => (
                                    <div key={tipo} className="flex items-center">
                                      <Checkbox 
                                        id={`tipo-${tipo}`} 
                                        className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                        checked={filtrosAtivos.tipos[tipo as keyof typeof filtrosAtivos.tipos]}
                                        onCheckedChange={(checked) => {
                                          setFiltrosAtivos({
                                            ...filtrosAtivos,
                                            tipos: {
                                              ...filtrosAtivos.tipos,
                                              [tipo]: !!checked
                                            }
                                          });
                                        }}
                                      />
                                      <label htmlFor={`tipo-${tipo}`} className="ml-2 text-xs text-gray-200 capitalize">{tipo}</label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Seção: Tags Populares */}
                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Tags Populares</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['matemática', 'física', 'história', 'biologia', 'redação', 'enem'].map(tag => (
                                    <Badge 
                                      key={tag}
                                      className={`${
                                        filtrosAtivos.tags.includes(tag) 
                                          ? 'bg-[#0D23A0] text-white' 
                                          : 'bg-[#0D23A0]/20 text-[#8EABFF]'
                                      } hover:bg-[#0D23A0]/40 cursor-pointer text-xs py-0.5 px-1.5`}
                                      onClick={() => {
                                        const tagIndex = filtrosAtivos.tags.indexOf(tag);
                                        let newTags = [...filtrosAtivos.tags];
                                        
                                        if (tagIndex === -1) {
                                          newTags.push(tag);
                                        } else {
                                          newTags = newTags.filter(t => t !== tag);
                                        }
                                        
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          tags: newTags
                                        });
                                      }}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Seção: Tamanho do Arquivo */}
                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Tamanho do Arquivo</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="tamanho-pequeno" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.tamanho.pequeno}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          tamanho: { ...filtrosAtivos.tamanho, pequeno: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="tamanho-pequeno" className="ml-2 text-xs text-gray-200">Pequeno (&lt; 1MB)</label>
                                  </div>
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="tamanho-medio" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.tamanho.medio}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          tamanho: { ...filtrosAtivos.tamanho, medio: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="tamanho-medio" className="ml-2 text-xs text-gray-200">Médio (1-10MB)</label>
                                  </div>
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="tamanho-grande" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.tamanho.grande}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          tamanho: { ...filtrosAtivos.tamanho, grande: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="tamanho-grande" className="ml-2 text-xs text-gray-200">Grande (&gt; 10MB)</label>
                                  </div>
                                </div>
                              </div>
                            
                              {/* Seção: Status do Arquivo */}
                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Status</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="status-ativo" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.status.ativo}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          status: { ...filtrosAtivos.status, ativo: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="status-ativo" className="ml-2 text-xs text-gray-200">Ativos</label>
                                  </div>
                                  <div className="flex items-center">
                                    <Checkbox 
                                      id="status-inativo" 
                                      className="bg-[#131d2e]/50 border-white/20 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                                      checked={filtrosAtivos.status.inativo}
                                      onCheckedChange={(checked) => {
                                        setFiltrosAtivos({
                                          ...filtrosAtivos,
                                          status: { ...filtrosAtivos.status, inativo: !!checked }
                                        });
                                      }}
                                    />
                                    <label htmlFor="status-inativo" className="ml-2 text-xs text-gray-200">Inativos</label>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                            
                            <div className="mt-4 flex justify-between pt-3 border-t border-white/10">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs text-gray-300 border-white/20 hover:bg-white/10 hover:text-white"
                                onClick={() => {
                                  setFiltrosAtivos({
                                    data: {
                                      ultimos7Dias: false,
                                      ultimos30Dias: false,
                                      ultimos3Meses: false
                                    },
                                    tipos: {
                                      pdf: false,
                                      documento: false,
                                      imagem: false,
                                      audio: false,
                                      video: false,
                                      link: false,
                                      nota: false
                                    },
                                    tamanho: {
                                      pequeno: false,
                                      medio: false,
                                      grande: false
                                    },
                                    status: {
                                      ativo: false,
                                      inativo: false
                                    },
                                    tags: []
                                  });
                                }}
                              >
                                Limpar filtros
                              </Button>
                              <Button 
                                size="sm" 
                                className="text-xs bg-[#0D23A0] hover:bg-[#0D23A0]/80"
                              >
                                Aplicar
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Conteúdo principal */}
                    <ScrollArea className="flex-grow h-full overflow-y-auto" scrollHideDelay={0}>
                      {conteudosFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 pr-4">
                          {conteudosFiltrados.map(item => (
                            <ConteudoCard 
                              key={item.id} 
                              conteudo={item} 
                              toggleAtivo={() => toggleConteudoAtivo(item.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                          <div className="w-16 h-16 rounded-full bg-[#0D23A0]/20 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-[#0D23A0]/70" />
                          </div>
                          <h3 className="text-xl font-medium mb-2">Nenhum conteúdo encontrado</h3>
                          <p className="text-gray-400 max-w-md mb-6">
                            {searchTerm 
                              ? "Tente ajustar sua busca ou remover filtros para encontrar o que procura." 
                              : "Você ainda não tem conteúdos nesta categoria. Adicione novos materiais para enriquecer sua base de conhecimento."}
                          </p>
                          <Button 
                            className="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] hover:from-[#0D23A0]/90 hover:to-[#5B21BD]/90 text-white border-none"
                            onClick={() => setShowAddOptionsMenu(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Conteúdo
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Rodapé */}
            <div className="p-4 border-t border-white/10 bg-[#0a1321]/80 backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                <div className="flex relative">
                  <div className="relative">
                    <Button
                      className="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] hover:from-[#0D23A0]/90 hover:to-[#5B21BD]/90 text-white border-none"
                      onClick={() => setShowAddOptionsMenu(!showAddOptionsMenu)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Conteúdo
                      <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAddOptionsMenu ? 'rotate-180' : ''}`} />
                    </Button>

                    {/* Menu dropdown para adicionar conteúdo */}
                    <AnimatePresence>
                      {showAddOptionsMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute bottom-full left-0 mb-2 w-64 bg-[#131d2e] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden"
                        >
                          <div className="py-1">
                            <Button variant="ghost" className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none">
                              <Upload className="mr-2 h-4 w-4" /> Upload de arquivo
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none">
                              <Edit3 className="mr-2 h-4 w-4" /> Criar nota manual
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none">
                              <Link2 className="mr-2 h-4 w-4" /> Adicionar link externo
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="permitir-todos" 
                      checked={permiteUsarTodos}
                      onCheckedChange={(checked) => setPermiteUsarTodos(checked as boolean)}
                      className="bg-[#131d2e]/50 border-white/30 data-[state=checked]:bg-[#0D23A0] data-[state=checked]:border-[#0D23A0]"
                    />
                    <label htmlFor="permitir-todos" className="text-sm font-medium text-gray-200 cursor-pointer">
                      Permitir que a IA use todos os conteúdos marcados como base
                    </label>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-[#131d2e] border border-white/10 text-white max-w-xs">
                        <p>Quanto mais organizado, mais inteligente será o uso da sua biblioteca pela IA</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// Componente de card de conteúdo
interface ConteudoCardProps {
  conteudo: ConteudoBiblioteca;
  toggleAtivo: () => void;
}

const ConteudoCard: React.FC<ConteudoCardProps> = ({ conteudo, toggleAtivo }) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "documento":
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      case "imagem":
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      case "audio":
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case "video":
        return <Film className="h-5 w-5 text-pink-500" />;
      case "link":
        return <Link2 className="h-5 w-5 text-cyan-500" />;
      case "nota":
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-[#131d2e]/50 border border-white/10 hover:bg-[#182448]/50 transition-colors p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#0a1321] flex items-center justify-center flex-shrink-0">
            {getIconForType(conteudo.tipo)}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-medium text-white truncate">{conteudo.titulo}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {conteudo.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="bg-[#0D23A0]/20 text-[#8EABFF] hover:bg-[#0D23A0]/30 text-xs py-0.5 px-1.5"
                >
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-gray-400">
                {formatarData(conteudo.data)} {conteudo.tamanho && `• ${conteudo.tamanho}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <Switch 
            checked={conteudo.ativo} 
            onCheckedChange={toggleAtivo}
            className="data-[state=checked]:bg-[#0D23A0]"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#131d2e] border border-white/10 text-white">
                <p>Pré-visualizar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#131d2e] border border-white/10 text-white">
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                <Tag className="h-4 w-4 mr-2" /> Editar tags
              </DropdownMenuItem>
              {conteudo.url && (
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Abrir link
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" /> Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default BibliotecaModal;