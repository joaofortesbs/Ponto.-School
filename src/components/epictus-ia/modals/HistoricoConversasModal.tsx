
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  History,
  Book,
  Brain,
  Wrench, // Substituído Tool por Wrench
  Clock,
  Pin,
  Star,
  RefreshCw,
  Pencil,
  Trash2,
  Tag,
  Archive,
  Search,
  X,
  Filter,
  PlusCircle,
  CheckSquare, // Adicionado para substituir o componente Check
  Sparkles // Adicionado para substituir o componente Sparkle
} from "lucide-react";

interface Conversation {
  id: string;
  type: "content" | "question" | "correction" | "other";
  title: string;
  timestamp: Date;
  isPinned: boolean;
  isFavorite: boolean;
  tags: string[];
  isArchived: boolean;
}

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueConversation?: (conversationId: string) => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
  onContinueConversation,
}) => {
  console.log("Renderizando HistoricoConversasModal, estado open:", open);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Mock data for demonstration
  useEffect(() => {
    console.log("Carregando conversas mock em HistoricoConversasModal");
    try {
      const mockConversations: Conversation[] = [
      {
        id: "1",
        type: "content",
        title: "Resumo sobre Revolução Francesa",
        timestamp: new Date(2023, 10, 15, 14, 30),
        isPinned: true,
        isFavorite: true,
        tags: ["História", "Resumo"],
        isArchived: false,
      },
      {
        id: "2",
        type: "question",
        title: "Dúvida sobre equações diferenciais",
        timestamp: new Date(2023, 10, 14, 9, 45),
        isPinned: false,
        isFavorite: false,
        tags: ["Matemática", "Urgente"],
        isArchived: false,
      },
      {
        id: "3",
        type: "correction",
        title: "Correção da redação sobre meio ambiente",
        timestamp: new Date(2023, 10, 13, 16, 20),
        isPinned: false,
        isFavorite: true,
        tags: ["Redação", "Revisar depois"],
        isArchived: false,
      },
      {
        id: "4",
        type: "content",
        title: "Plano de estudos para o ENEM",
        timestamp: new Date(2023, 10, 12, 11, 15),
        isPinned: false,
        isFavorite: false,
        tags: ["ENEM", "Plano"],
        isArchived: false,
      },
      {
        id: "5",
        type: "question",
        title: "Como funciona a fotossíntese?",
        timestamp: new Date(2023, 10, 11, 13, 50),
        isPinned: false,
        isFavorite: false,
        tags: ["Biologia"],
        isArchived: false,
      },
      {
        id: "6",
        type: "other",
        title: "Ideias para projeto de ciências",
        timestamp: new Date(2023, 10, 10, 10, 30),
        isPinned: false,
        isFavorite: false,
        tags: ["Projeto", "Ciências"],
        isArchived: true,
      },
    ];

    setConversations(mockConversations);
    } catch (error) {
      console.error("Erro ao carregar conversas mock:", error);
      setConversations([]);
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <Book className="w-4 h-4 text-blue-500" />;
      case "question":
        return <Brain className="w-4 h-4 text-purple-500" />;
      case "correction":
        return <Tool className="w-4 h-4 text-orange-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const togglePin = (id: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isFavorite: !conv.isFavorite } : conv
      )
    );
  };

  const toggleArchive = (id: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isArchived: !conv.isArchived } : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  const startEditingTitle = (id: string, currentTitle: string) => {
    setEditingTitleId(id);
    setNewTitle(currentTitle);
  };

  const saveTitle = (id: string) => {
    if (newTitle.trim()) {
      setConversations(
        conversations.map((conv) =>
          conv.id === id ? { ...conv, title: newTitle } : conv
        )
      );
    }
    setEditingTitleId(null);
  };

  const generateAITitle = (id: string) => {
    // Simulate AI generating a better title
    const betterTitles = {
      "1": "Análise Completa da Revolução Francesa (1789-1799)",
      "2": "Resolvendo Equações Diferenciais de Primeira Ordem",
      "3": "Feedback Detalhado: Redação sobre Sustentabilidade Ambiental",
      "4": "Cronograma Estratégico para Aprovação no ENEM 2023",
      "5": "Processo de Fotossíntese: Mecanismos e Importância",
      "6": "Ideias Inovadoras para Feira de Ciências: Energia Renovável",
    };

    const newTitle = betterTitles[id as keyof typeof betterTitles] || "Título gerado por IA";
    
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const addTag = (id: string, tag: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id && !conv.tags.includes(tag)
          ? { ...conv, tags: [...conv.tags, tag] }
          : conv
      )
    );
  };

  const removeTag = (id: string, tagToRemove: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id
          ? { ...conv, tags: conv.tags.filter((tag) => tag !== tagToRemove) }
          : conv
      )
    );
  };

  const filteredConversations = conversations
    .filter(
      (conv) =>
        (activeFilter === "archived" ? conv.isArchived : !conv.isArchived) &&
        (activeFilter === "favorites" ? conv.isFavorite : true) &&
        conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by date (newest first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[80%] max-w-5xl h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold">Histórico de Conversas</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onOpenChange(false)}
                    className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Main Content */}
                <div className="flex h-full">
                  {/* Left Column - Conversation List */}
                  <div className="w-full md:w-1/2 lg:w-2/5 border-r dark:border-gray-700 flex flex-col h-full">
                    {/* Search and Filters */}
                    <div className="p-3 border-b dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          className="pl-9 bg-gray-100 dark:bg-gray-800 border-0"
                          placeholder="Pesquisar conversas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2 mt-2 overflow-x-auto pb-1 scrollbar-thin">
                        <Button
                          variant={activeFilter === null ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setActiveFilter(null)}
                        >
                          Todas
                        </Button>
                        <Button
                          variant={activeFilter === "favorites" ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setActiveFilter(activeFilter === "favorites" ? null : "favorites")}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Favoritas
                        </Button>
                        <Button
                          variant={activeFilter === "archived" ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setActiveFilter(activeFilter === "archived" ? null : "archived")}
                        >
                          <Archive className="w-3 h-3 mr-1" />
                          Arquivadas
                        </Button>
                      </div>
                    </div>

                    {/* Conversation List */}
                    <ScrollArea className="flex-1">
                      <div className="divide-y dark:divide-gray-700">
                        {filteredConversations.length > 0 ? (
                          filteredConversations.map((conv) => (
                            <motion.div
                              key={conv.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 relative group cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 mt-1">
                                    {getTypeIcon(conv.type)}
                                  </div>
                                  <div className="flex-1">
                                    {editingTitleId === conv.id ? (
                                      <div className="flex mb-1">
                                        <Input
                                          value={newTitle}
                                          onChange={(e) => setNewTitle(e.target.value)}
                                          autoFocus
                                          className="text-sm h-7"
                                        />
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-7 px-2 ml-1"
                                          onClick={() => saveTitle(conv.id)}
                                        >
                                          <CheckSquare className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <h3 className="font-medium text-sm">
                                        {conv.title}
                                        {conv.isPinned && (
                                          <Pin className="w-3 h-3 inline ml-2 text-blue-500" />
                                        )}
                                      </h3>
                                    )}
                                    <div className="flex items-center space-x-2 mt-1">
                                      <time className="text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {formatDate(conv.timestamp)}
                                      </time>
                                    </div>
                                    {conv.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {conv.tags.map((tag) => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs py-0 h-5"
                                          >
                                            {tag}
                                            <button
                                              className="ml-1 hover:text-red-500"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeTag(conv.id, tag);
                                              }}
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action buttons that appear on hover */}
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePin(conv.id);
                                    }}
                                    title={conv.isPinned ? "Desafixar" : "Fixar"}
                                  >
                                    <Pin
                                      className={`w-4 h-4 ${
                                        conv.isPinned ? "text-blue-500" : "text-gray-500"
                                      }`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(conv.id);
                                    }}
                                    title={conv.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        conv.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-500"
                                      }`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onContinueConversation?.(conv.id);
                                      onOpenChange(false);
                                    }}
                                    title="Recontinuar conversa"
                                  >
                                    <RefreshCw className="w-4 h-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingTitle(conv.id, conv.title);
                                    }}
                                    title="Editar título"
                                  >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleArchive(conv.id);
                                    }}
                                    title={conv.isArchived ? "Desarquivar" : "Arquivar"}
                                  >
                                    <Archive className="w-4 h-4 text-gray-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteConversation(conv.id);
                                    }}
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>

                              {/* Advanced actions panel (normally hidden) */}
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ 
                                  height: editingTitleId === conv.id ? "auto" : 0,
                                  opacity: editingTitleId === conv.id ? 1 : 0
                                }}
                                className="overflow-hidden"
                              >
                                {editingTitleId === conv.id && (
                                  <div className="mt-2 flex flex-col space-y-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <div className="flex justify-between">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => generateAITitle(conv.id)}
                                        className="text-xs h-7"
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Gerar título com IA
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const tag = prompt("Digite a nova tag:");
                                          if (tag) addTag(conv.id, tag);
                                        }}
                                        className="text-xs h-7"
                                      >
                                        <Tag className="w-3 h-3 mr-1" />
                                        Adicionar tag
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                              Nenhuma conversa encontrada
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right Column - Conversation Detail or Welcome */}
                  <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800">
                    <div className="text-center max-w-md">
                      <History className="w-16 h-16 mx-auto mb-4 text-blue-500 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Seu histórico de conversas</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Selecione uma conversa à esquerda para visualizar, continuar ou gerenciar.
                        Você pode pesquisar, filtrar, fixar, favoritar e organizar suas conversas.
                      </p>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            NOVO
                          </Badge>
                          <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">
                            Renomeie conversas automaticamente com IA
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                            DICA
                          </Badge>
                          <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">
                            Use tags para organizar conversas por temas
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            PRO
                          </Badge>
                          <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">
                            Acesse conversas arquivadas a qualquer momento
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default HistoricoConversasModal;

// Ícones agora são importados diretamente da biblioteca lucide-react
