
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, FolderPlus, Search, Edit, MessageSquare, RefreshCw, 
  Headphones, FileImage, FileExport, Calendar, Star, BookmarkIcon,
  PlusCircle, Trash2, X, Download, Share2, Clock, Tag, Filter,
  FolderIcon, Edit3, ArrowLeft, ArrowRight, CheckSquare
} from 'lucide-react';

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dados mock para simulação
const mockFolders = [
  { id: 1, name: 'Matemática', pinned: true },
  { id: 2, name: 'Física', pinned: false },
  { id: 3, name: 'Química', pinned: false },
  { id: 4, name: 'Biologia', pinned: false },
  { id: 5, name: 'História', pinned: false },
  { id: 6, name: 'Geografia', pinned: false },
  { id: 7, name: 'Português', pinned: false },
  { id: 8, name: 'Revisão ENEM', pinned: true },
];

const mockNotes = [
  { 
    id: 1, 
    title: 'Teorema de Pitágoras', 
    content: 'No triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos. A² = B² + C²...', 
    date: '12/09/2023', 
    folder: 1,
    type: 'Resumo',
    keywords: ['matemática', 'geometria', 'triângulo', 'pitágoras'],
    favorite: true
  },
  { 
    id: 2, 
    title: 'Leis de Newton', 
    content: 'Primeira Lei: Um corpo permanece em repouso ou em movimento retilíneo uniforme, a menos que uma força resultante não nula atue sobre ele...', 
    date: '15/09/2023', 
    folder: 2,
    type: 'Mapa Conceitual',
    keywords: ['física', 'mecânica', 'movimento', 'newton'],
    favorite: false
  },
  { 
    id: 3, 
    title: 'Tabela Periódica', 
    content: 'A tabela periódica é um arranjo sistemático dos elementos químicos ordenados por seus números atômicos, configurações eletrônicas e propriedades químicas recorrentes...', 
    date: '20/09/2023', 
    folder: 3,
    type: 'Fichamento',
    keywords: ['química', 'elementos', 'tabela', 'periódica'],
    favorite: true
  },
  { 
    id: 4, 
    title: 'Função do 2º Grau', 
    content: 'Uma função do segundo grau é representada por f(x) = ax² + bx + c, onde a, b e c são números reais e a ≠ 0...', 
    date: '25/09/2023', 
    folder: 1,
    type: 'Resumo',
    keywords: ['matemática', 'álgebra', 'função', 'parábola'],
    favorite: false
  },
  { 
    id: 5, 
    title: 'Revolução Francesa', 
    content: 'A Revolução Francesa foi um período de intensa agitação política e social na França que teve um impacto duradouro na história do país e em todo o mundo...', 
    date: '01/10/2023', 
    folder: 5,
    type: 'Estudo Completo',
    keywords: ['história', 'revolução', 'frança', 'política'],
    favorite: false
  },
];

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [filteredNotes, setFilteredNotes] = useState(mockNotes);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Filtrar notas baseado na pasta selecionada e termo de busca
  useEffect(() => {
    let filtered = mockNotes;
    
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folder === selectedFolder);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredNotes(filtered);
  }, [selectedFolder, searchTerm]);

  // Selecionar nota e mostrar painel direito
  const handleNoteClick = (noteId: number) => {
    if (isSelectMode) {
      toggleNoteSelection(noteId);
      return;
    }
    
    setSelectedNote(noteId);
    setShowRightPanel(true);
  };

  // Toggle seleção de nota para ações em lote
  const toggleNoteSelection = (noteId: number) => {
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter(id => id !== noteId));
    } else {
      setSelectedNotes([...selectedNotes, noteId]);
    }
  };

  // Entrar/sair do modo de seleção
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedNotes([]);
    }
  };

  // Adicionar pasta
  const handleAddFolder = () => {
    if (newFolderName.trim() !== "") {
      // Adicionar lógica para salvar a pasta
      setIsAddingFolder(false);
      setNewFolderName("");
    }
  };

  // Fechar painel direito
  const closeRightPanel = () => {
    setShowRightPanel(false);
    setSelectedNote(null);
  };

  // Encontrar a nota selecionada
  const selectedNoteData = selectedNote ? mockNotes.find(note => note.id === selectedNote) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] w-[1200px] p-0 bg-[#121826] text-white overflow-hidden rounded-2xl border border-[#2a3142]/50 shadow-xl">
        {/* Header do Modal */}
        <div className="flex justify-between items-center p-4 bg-[#1a2236] border-b border-[#2a3142]">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Apostila Inteligente</h2>
          </div>
          
          {/* Barra de Busca Semântica */}
          <div className="flex-1 max-w-[500px] mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busque por tópico, data, conceito ou palavra-chave..." 
                className="w-full pl-10 bg-[#242c3d] border-[#394255] focus-visible:ring-amber-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isSelectMode ? (
              <Button 
                onClick={toggleSelectMode}
                variant="outline" 
                className="border-[#394255] hover:bg-[#2a3142] text-white"
              >
                Cancelar Seleção ({selectedNotes.length})
              </Button>
            ) : (
              <Button 
                onClick={toggleSelectMode}
                variant="outline" 
                className="border-[#394255] hover:bg-[#2a3142] text-white"
              >
                Selecionar Várias
              </Button>
            )}
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="ghost" 
              className="p-2 h-9 w-9 rounded-full hover:bg-[#2a3142]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Corpo do Modal - Layout de 3 painéis */}
        <div className="flex h-[calc(85vh-120px)]">
          {/* Painel Esquerdo - Pastas */}
          <div className="w-[250px] border-r border-[#2a3142] p-3 flex flex-col">
            <div className="mb-3">
              <h3 className="text-sm uppercase text-gray-400 font-semibold mb-2 px-1">Organização</h3>
              
              {/* Busca de pastas */}
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <Input 
                  placeholder="Buscar pasta..." 
                  className="w-full pl-8 h-8 text-sm bg-[#1a2236] border-[#394255]"
                />
              </div>

              {/* Botão Adicionar Pasta */}
              {isAddingFolder ? (
                <div className="flex items-center mb-3 space-x-1">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nome da pasta"
                    className="h-8 text-sm bg-[#1a2236] border-[#394255]"
                    autoFocus
                  />
                  <Button 
                    onClick={handleAddFolder} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                  >
                    <CheckSquare className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    onClick={() => setIsAddingFolder(false)} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsAddingFolder(true)}
                  className="w-full mb-3 bg-[#242c3d] hover:bg-[#2a3142] text-white border border-[#394255] flex items-center justify-center space-x-2 h-8 text-sm"
                >
                  <FolderPlus className="h-4 w-4 text-amber-400" />
                  <span>Nova Pasta</span>
                </Button>
              )}
            </div>

            {/* Lista de Pastas */}
            <ScrollArea className="flex-1">
              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${selectedFolder === null ? 'bg-[#2a3142] text-amber-400' : 'hover:bg-[#1a2236] text-gray-300'}`}
                >
                  <BookmarkIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Todas as Anotações</span>
                </button>

                <h4 className="text-xs uppercase text-gray-500 font-semibold px-3 pt-3 pb-1">Pastas Fixadas</h4>
                {mockFolders
                  .filter(folder => folder.pinned)
                  .map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${selectedFolder === folder.id ? 'bg-[#2a3142] text-amber-400' : 'hover:bg-[#1a2236] text-gray-300'}`}
                    >
                      <FolderIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                      <Star className="h-3 w-3 ml-auto text-amber-400" />
                    </button>
                  ))
                }

                <h4 className="text-xs uppercase text-gray-500 font-semibold px-3 pt-3 pb-1">Todas as Pastas</h4>
                {mockFolders
                  .filter(folder => !folder.pinned)
                  .map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${selectedFolder === folder.id ? 'bg-[#2a3142] text-amber-400' : 'hover:bg-[#1a2236] text-gray-300'}`}
                    >
                      <FolderIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </button>
                  ))
                }
              </div>
            </ScrollArea>
            
            {/* Sugestões IA */}
            <div className="mt-3 p-3 bg-gradient-to-r from-[#242c3d] to-[#2a3142] rounded-lg border border-[#394255]/50">
              <h4 className="text-xs uppercase text-amber-400 font-semibold mb-2">Sugestões da IA</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-xs text-white hover:text-amber-400 transition-colors">
                  + Criar pasta "Exercícios Enem"
                </button>
                <button className="w-full text-left text-xs text-white hover:text-amber-400 transition-colors">
                  + Organizar por matéria
                </button>
              </div>
            </div>
          </div>

          {/* Painel Central - Anotações */}
          <div className="flex-1 flex flex-col">
            {/* Cabeçalho do Painel Central */}
            <div className="p-3 border-b border-[#2a3142] bg-[#1a2236]/50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  {selectedFolder 
                    ? mockFolders.find(f => f.id === selectedFolder)?.name
                    : "Todas as Anotações"
                  }
                  <span className="ml-2 text-sm text-gray-400">({filteredNotes.length})</span>
                </h3>
              </div>
              
              <div className="flex space-x-2">
                {/* Filtros */}
                <Button variant="outline" size="sm" className="bg-[#242c3d] border-[#394255] text-white h-8">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filtrar
                </Button>
                
                {/* Botões de gerenciamento */}
                {selectedNotes.length > 0 && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-[#242c3d] border-[#394255] text-white h-8">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Exportar ({selectedNotes.length})
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#242c3d] border-[#394255] text-white h-8">
                      <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Lista de Anotações */}
            <ScrollArea className="flex-1 p-3">
              <div className="grid grid-cols-2 gap-3">
                {filteredNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className={`
                      group cursor-pointer p-3 rounded-xl 
                      ${selectedNotes.includes(note.id) 
                        ? 'border-2 border-amber-500 bg-[#2a3142]' 
                        : 'border border-[#394255] bg-[#1a2236] hover:bg-[#242c3d]'
                      }
                      transition-all duration-200 relative
                    `}
                  >
                    {/* Checkbox para seleção múltipla */}
                    {isSelectMode && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={`
                            h-5 w-5 rounded border 
                            ${selectedNotes.includes(note.id) 
                              ? 'bg-amber-500 border-amber-600' 
                              : 'border-[#394255] bg-[#242c3d]'
                            }
                            flex items-center justify-center
                          `}
                        >
                          {selectedNotes.includes(note.id) && (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Conteúdo da nota */}
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-1">{note.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">{note.date}</span>
                            <div className="h-4 px-1.5 rounded-full bg-[#242c3d] border border-[#394255] flex items-center">
                              <span className="text-xs text-amber-400">{note.type}</span>
                            </div>
                            {note.favorite && <Star className="h-3 w-3 text-amber-400" />}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-3 mt-2">{note.content}</p>
                      
                      {/* Ações da nota */}
                      <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                          <Edit className="h-3.5 w-3.5 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                          <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                          <RefreshCw className="h-3.5 w-3.5 text-green-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                          <Headphones className="h-3.5 w-3.5 text-violet-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                          <FileExport className="h-3.5 w-3.5 text-amber-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Painel Direito - Detalhes da Anotação */}
          <AnimatePresence>
            {showRightPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 350, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-[#2a3142] bg-[#1a2236] overflow-hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Cabeçalho do Painel Direito */}
                  <div className="p-3 border-b border-[#2a3142] flex items-center justify-between">
                    <Button 
                      onClick={closeRightPanel}
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <h3 className="font-medium text-sm">Detalhes da Anotação</h3>
                    <div className="w-8" />
                  </div>
                  
                  {/* Conteúdo do Painel Direito */}
                  {selectedNoteData && (
                    <ScrollArea className="flex-1 p-4">
                      <h2 className="text-xl font-semibold mb-1">{selectedNoteData.title}</h2>
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-400">{selectedNoteData.date}</span>
                        <div className="h-5 px-2 rounded-full bg-[#242c3d] border border-[#394255] flex items-center">
                          <span className="text-xs text-amber-400">{selectedNoteData.type}</span>
                        </div>
                      </div>
                      
                      <Tabs defaultValue="conteudo" className="w-full">
                        <TabsList className="w-full bg-[#242c3d] border border-[#394255] mb-4">
                          <TabsTrigger value="conteudo" className="flex-1 data-[state=active]:bg-[#2a3142]">Conteúdo</TabsTrigger>
                          <TabsTrigger value="detalhes" className="flex-1 data-[state=active]:bg-[#2a3142]">Detalhes</TabsTrigger>
                          <TabsTrigger value="acoes" className="flex-1 data-[state=active]:bg-[#2a3142]">Ações</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="conteudo" className="mt-0">
                          <div className="prose prose-invert max-w-none text-gray-300">
                            <p>{selectedNoteData.content}</p>
                            <p>{selectedNoteData.content}</p>
                            <p>{selectedNoteData.content}</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="detalhes" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Palavras-chave</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedNoteData.keywords.map((keyword, index) => (
                                  <div key={index} className="px-2 py-1 rounded-full bg-[#242c3d] border border-[#394255] text-xs">
                                    {keyword}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Competências BNCC</h4>
                              <div className="flex flex-wrap gap-2">
                                <div className="px-2 py-1 rounded-full bg-[#242c3d] border border-[#394255] text-xs">
                                  Competência 1
                                </div>
                                <div className="px-2 py-1 rounded-full bg-[#242c3d] border border-[#394255] text-xs">
                                  Competência 3
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Observações Pessoais</h4>
                              <textarea 
                                className="w-full rounded-lg bg-[#242c3d] border border-[#394255] p-2 text-sm"
                                rows={3}
                                placeholder="Adicione suas observações..."
                              ></textarea>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="acoes" className="mt-0">
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start border-[#394255] bg-[#242c3d] hover:bg-[#2a3142]">
                              <RefreshCw className="h-4 w-4 mr-2 text-green-400" />
                              Regerar com IA
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-[#394255] bg-[#242c3d] hover:bg-[#2a3142]">
                              <FileImage className="h-4 w-4 mr-2 text-blue-400" />
                              Transformar em Fluxograma
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-[#394255] bg-[#242c3d] hover:bg-[#2a3142]">
                              <FileExport className="h-4 w-4 mr-2 text-amber-400" />
                              Exportar como PDF
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-[#394255] bg-[#242c3d] hover:bg-[#2a3142]">
                              <Share2 className="h-4 w-4 mr-2 text-purple-400" />
                              Compartilhar
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-[#394255] bg-[#242c3d] hover:bg-[#2a3142]">
                              <Clock className="h-4 w-4 mr-2 text-blue-400" />
                              Agendar Revisão
                            </Button>
                          </div>
                          
                          <div className="mt-6 p-3 bg-[#242c3d] rounded-lg border border-[#394255]">
                            <h4 className="text-sm font-medium text-amber-400 mb-2">Sugestões da IA</h4>
                            <div className="space-y-2">
                              <button className="w-full text-left text-xs text-white hover:text-amber-400 transition-colors">
                                + Gerar quiz sobre este tema
                              </button>
                              <button className="w-full text-left text-xs text-white hover:text-amber-400 transition-colors">
                                + Conectar com anotação "Geometria Espacial"
                              </button>
                              <button className="w-full text-left text-xs text-white hover:text-amber-400 transition-colors">
                                + Revisar em 7 dias (ótimo para memorização)
                              </button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </ScrollArea>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-[#2a3142] bg-[#1a2236] flex justify-between items-center">
          <Button 
            variant="outline" 
            className="border-[#394255] bg-[#242c3d] hover:bg-[#2a3142] text-white" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="border-[#394255] bg-[#242c3d] hover:bg-[#2a3142] text-white">
              <Download className="h-4 w-4 mr-2" />
              Exportar Apostila
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Anotação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;

// Componente auxiliar para ícone de Check
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
