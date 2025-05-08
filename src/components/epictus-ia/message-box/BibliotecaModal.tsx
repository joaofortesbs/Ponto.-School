import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Upload, FileText, Link2, Edit3, Plus, HelpCircle, ChevronDown, MoreVertical, Eye, Trash2, Tag, FileIcon, Image as ImageIcon, Film, Headphones, BookOpen, ExternalLink } from "lucide-react";
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

const BibliotecaModal: React.FC<BibliotecaModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [conteudos, setConteudos] = useState<ConteudoBiblioteca[]>([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [permiteUsarTodos, setPermiteUsarTodos] = useState(true);
  const [showAddOptionsMenu, setShowAddOptionsMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filtrar conteúdos com base na busca e categoria selecionada
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

    return matchesSearch && matchesTab;
  });

  // Carrega os arquivos do localStorage ao iniciar
  React.useEffect(() => {
    const savedConteudos = localStorage.getItem('bibliotecaConteudos');
    if (savedConteudos) {
      try {
        setConteudos(JSON.parse(savedConteudos));
      } catch (e) {
        console.error("Erro ao carregar conteúdos da biblioteca:", e);
      }
    }
  }, []);

  // Salva os arquivos no localStorage sempre que houver alterações
  React.useEffect(() => {
    if (conteudos.length > 0) {
      localStorage.setItem('bibliotecaConteudos', JSON.stringify(conteudos));
    }
  }, [conteudos]);

  // Alternar ativação de um conteúdo
  const toggleConteudoAtivo = (id: string) => {
    setConteudos(conteudos.map(item => 
      item.id === id ? { ...item, ativo: !item.ativo } : item
    ));
  };

  // Remover um conteúdo
  const removerConteudo = (id: string) => {
    setConteudos(conteudos.filter(item => item.id !== id));
  };

  // Adicionar novo conteúdo
  const adicionarConteudo = (novoConteudo: ConteudoBiblioteca) => {
    setConteudos([...conteudos, novoConteudo]);
  };

  // Adicionar tag a um conteúdo
  const adicionarTag = (id: string, tag: string) => {
    setConteudos(conteudos.map(item => 
      item.id === id ? { ...item, tags: [...item.tags, tag] } : item
    ));
  };

  // Remover tag de um conteúdo
  const removerTag = (id: string, tagToRemove: string) => {
    setConteudos(conteudos.map(item => 
      item.id === id ? { ...item, tags: item.tags.filter(tag => tag !== tagToRemove) } : item
    ));
  };

  // Tratar upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setShowTagsModal(true);
    }
  };

  // Identificar tipo de arquivo
  const identificarTipoArquivo = (filename: string): "pdf" | "documento" | "imagem" | "audio" | "video" | "link" | "nota" => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) return 'documento';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'imagem';
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) return 'audio';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    
    return 'documento';
  };

  // Adicionar tag para arquivo
  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  // Finalizar upload com tags
  const finalizarUpload = () => {
    if (uploadedFile) {
      const tipo = identificarTipoArquivo(uploadedFile.name);
      const fileSize = formatarTamanhoArquivo(uploadedFile.size);
      
      const novoConteudo: ConteudoBiblioteca = {
        id: Date.now().toString(),
        titulo: uploadedFile.name,
        tipo: tipo,
        tags: newTags,
        ativo: true,
        data: new Date().toISOString().split('T')[0],
        tamanho: fileSize
      };
      
      adicionarConteudo(novoConteudo);
      setShowTagsModal(false);
      setUploadedFile(null);
      setNewTags([]);
    }
  };

  // Adicionar link externo
  const adicionarLink = (url: string, titulo: string, tags: string[]) => {
    const novoConteudo: ConteudoBiblioteca = {
      id: Date.now().toString(),
      titulo: titulo,
      tipo: "link",
      tags: tags,
      ativo: true,
      data: new Date().toISOString().split('T')[0],
      url: url
    };
    
    adicionarConteudo(novoConteudo);
  };

  // Adicionar nota manual
  const adicionarNota = (conteudo: string, titulo: string, tags: string[]) => {
    const novoConteudo: ConteudoBiblioteca = {
      id: Date.now().toString(),
      titulo: titulo,
      tipo: "nota",
      tags: tags,
      ativo: true,
      data: new Date().toISOString().split('T')[0]
    };
    
    adicionarConteudo(novoConteudo);
  };

  // Formatar tamanho do arquivo
  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
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

                <div className="border-b border-white/10 px-4 flex">
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
                  <div className="flex h-full">
                    {/* Conteúdo principal */}
                    <ScrollArea className="flex-grow h-full overflow-y-auto" scrollHideDelay={0}>
                      {conteudosFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 pr-4">
                          {conteudosFiltrados.map(item => (
                            <ConteudoCard 
                              key={item.id} 
                              conteudo={item} 
                              toggleAtivo={() => toggleConteudoAtivo(item.id)}
                              removerConteudo={() => removerConteudo(item.id)}
                              adicionarTag={(tag) => adicionarTag(item.id, tag)}
                              removerTag={(tag) => removerTag(item.id, tag)}
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
                
                {/* Modal para adicionar tags ao arquivo */}
                <Dialog open={showTagsModal} onOpenChange={(open) => !open && setShowTagsModal(false)}>
                  <DialogContent className="bg-[#131d2e] border border-white/10 text-white p-6 max-w-md">
                    <h2 className="text-xl font-bold mb-4">Adicionar tags</h2>
                    <p className="text-gray-400 mb-4">Adicione tags para classificar seu arquivo "{uploadedFile?.name}"</p>
                    
                    <div className="grid gap-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newTags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            className="bg-[#0D23A0]/20 text-[#8EABFF] hover:bg-[#0D23A0]/30 text-sm py-1 px-2"
                          >
                            {tag}
                            <button 
                              className="ml-2 text-[#8EABFF] hover:text-white"
                              onClick={() => setNewTags(newTags.filter((_, i) => i !== index))}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          placeholder="Digite uma tag e pressione Enter"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          className="bg-[#0a1321]/80 border-white/10"
                        />
                        <Button onClick={handleAddTag} className="bg-[#0D23A0] hover:bg-[#0D23A0]/80">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowTagsModal(false);
                            setUploadedFile(null);
                            setNewTags([]);
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={finalizarUpload}
                          className="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] hover:from-[#0D23A0]/90 hover:to-[#5B21BD]/90 text-white border-none"
                        >
                          Adicionar à Biblioteca
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Input invisível para upload de arquivo */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
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
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none"
                              onClick={() => {
                                setShowAddOptionsMenu(false);
                                if (fileInputRef.current) {
                                  fileInputRef.current.click();
                                }
                              }}
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload de arquivo
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none"
                              onClick={() => {
                                setShowAddOptionsMenu(false);
                                const titulo = prompt("Digite o título da nota:");
                                if (titulo) {
                                  const conteudo = prompt("Digite o conteúdo da nota:");
                                  if (conteudo) {
                                    const tagsInput = prompt("Digite as tags separadas por vírgula:");
                                    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
                                    adicionarNota(conteudo, titulo, tags);
                                  }
                                }
                              }}
                            >
                              <Edit3 className="mr-2 h-4 w-4" /> Criar nota manual
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-none"
                              onClick={() => {
                                setShowAddOptionsMenu(false);
                                const url = prompt("Digite a URL do link:");
                                if (url && url.startsWith('http')) {
                                  const titulo = prompt("Digite um título para este link:");
                                  if (titulo) {
                                    const tagsInput = prompt("Digite as tags separadas por vírgula:");
                                    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
                                    adicionarLink(url, titulo, tags);
                                  }
                                } else if (url) {
                                  alert("Por favor, insira uma URL válida começando com http:// ou https://");
                                }
                              }}
                            >
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
  removerConteudo: () => void;
  adicionarTag: (tag: string) => void;
  removerTag: (tag: string) => void;
}

const ConteudoCard: React.FC<ConteudoCardProps> = ({ 
  conteudo, 
  toggleAtivo, 
  removerConteudo, 
  adicionarTag, 
  removerTag 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showEditTags, setShowEditTags] = useState(false);
  const [newTag, setNewTag] = useState("");

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

  const handleAddTag = () => {
    if (newTag.trim() && !conteudo.tags.includes(newTag.trim())) {
      adicionarTag(newTag.trim());
      setNewTag("");
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
                  {showEditTags && (
                    <button 
                      className="ml-1 text-[#8EABFF] hover:text-white"
                      onClick={() => removerTag(tag)}
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
              <span className="text-xs text-gray-400">
                {formatarData(conteudo.data)} {conteudo.tamanho && `• ${conteudo.tamanho}`}
              </span>
            </div>
            
            {showEditTags && (
              <div className="mt-2 flex items-center gap-2">
                <Input 
                  type="text" 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  className="h-7 text-xs py-0 bg-[#0a1321]/80 border-white/10"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button 
                  size="sm" 
                  className="h-7 py-0 px-2 bg-[#0D23A0] hover:bg-[#0D23A0]/80" 
                  onClick={handleAddTag}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
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
              <DropdownMenuItem 
                className="hover:bg-white/10 cursor-pointer"
                onClick={() => setShowEditTags(!showEditTags)}
              >
                <Tag className="h-4 w-4 mr-2" /> {showEditTags ? 'Concluir edição' : 'Editar tags'}
              </DropdownMenuItem>
              {conteudo.url && (
                <DropdownMenuItem 
                  className="hover:bg-white/10 cursor-pointer"
                  onClick={() => window.open(conteudo.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Abrir link
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                onClick={removerConteudo}
              >
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