import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Search, 
  Calendar, 
  Tag, 
  Star, 
  Clock, 
  MessageSquare, 
  ArrowUpDown, 
  X, 
  Check, 
  ArrowRight 
} from "lucide-react";

const mockConversations = [
  {
    id: 1,
    title: "Dúvidas sobre Gravitação Universal",
    date: "2024-05-15T14:30:00",
    tags: ["Física", "Ensino Médio"],
    isFavorite: true,
    preview: "Como funciona a força gravitacional entre dois corpos?",
    messages: 12
  },
  {
    id: 2,
    title: "Ajuda com Análise Literária",
    date: "2024-05-14T10:15:00",
    tags: ["Literatura", "Português"],
    isFavorite: false,
    preview: "Poderia me ajudar a analisar este trecho de Machado de Assis?",
    messages: 8
  },
  {
    id: 3,
    title: "Revisão para prova de Química",
    date: "2024-05-10T16:45:00",
    tags: ["Química", "Estudos"],
    isFavorite: true,
    preview: "Preciso revisar reações de oxirredução para minha prova.",
    messages: 23
  },
  {
    id: 4,
    title: "Dúvidas sobre História do Brasil",
    date: "2024-05-08T09:20:00",
    tags: ["História", "Brasil"],
    isFavorite: false,
    preview: "Quais foram as principais causas da Proclamação da República?",
    messages: 15
  },
  {
    id: 5,
    title: "Problemas de Matemática",
    date: "2024-05-05T11:30:00",
    tags: ["Matemática", "Álgebra"],
    isFavorite: false,
    preview: "Como resolver esta equação de segundo grau?",
    messages: 7
  }
];

// Componente de cartão de conversa
const ConversationCard = ({ conversation, onClick }) => {
  try {
    const date = new Date(conversation.date);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <div 
        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg mb-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
        onClick={() => onClick(conversation)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white">{conversation.title}</h3>
          {conversation.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{conversation.preview}</p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {conversation.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar cartão de conversa:", error);
    return (
      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg mb-3 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 text-xs">Erro ao carregar conversa</p>
      </div>
    );
  }
};

const HistoricoConversasModal = ({ isOpen, onClose }) => {
  console.log("Renderizando HistoricoConversasModal, isOpen:", isOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todas");
  const [sortOrder, setSortOrder] = useState("recent");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Simular carregamento de dados
  useEffect(() => {
    try {
      console.log("Carregando conversas do histórico");
      setLoading(true);
      setError(null);

      // Simular um carregamento assíncrono
      const timer = setTimeout(() => {
        try {
          setConversations(mockConversations);
          setLoading(false);
        } catch (err) {
          console.error("Erro ao definir conversas:", err);
          setError("Erro ao carregar conversas. Tente novamente.");
          setLoading(false);
        }
      }, 800);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Erro no useEffect de carregamento:", err);
      setError("Erro ao inicializar. Tente novamente.");
      setLoading(false);
    }
  }, [isOpen]);

  // Filtragem e ordenação
  const getFilteredConversations = () => {
    try {
      let filtered = [...conversations];

      // Aplicar filtro por tipo
      if (activeFilter === "favoritas") {
        filtered = filtered.filter(conv => conv.isFavorite);
      }

      // Aplicar pesquisa
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          conv => 
            conv.title.toLowerCase().includes(query) || 
            conv.preview.toLowerCase().includes(query) ||
            conv.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Aplicar ordenação
      filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        return sortOrder === "recent" 
          ? dateB - dateA  // Mais recentes primeiro
          : dateA - dateB; // Mais antigas primeiro
      });

      return filtered;
    } catch (error) {
      console.error("Erro ao filtrar conversas:", error);
      return [];
    }
  };

  const handleConversationClick = (conversation) => {
    try {
      console.log("Conversa selecionada:", conversation.id);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error("Erro ao selecionar conversa:", error);
      setError("Erro ao selecionar conversa. Tente novamente.");
    }
  };

  const handleClose = () => {
    try {
      console.log("Fechando modal de histórico");
      setSelectedConversation(null);
      onClose();
    } catch (error) {
      console.error("Erro ao fechar modal:", error);
    }
  };

  const filteredConversations = getFilteredConversations();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Histórico de Conversas
          </DialogTitle>
          <DialogDescription>
            Acesse, organize e continue suas conversas anteriores com o Epictus IA
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg my-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setError(null);
                setLoading(true);
                // Tentar carregar novamente
                setTimeout(() => {
                  setConversations(mockConversations);
                  setLoading(false);
                }, 800);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Coluna de pesquisa e filtragem */}
            <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-800 pr-4">
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar conversas..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="todas" className="mb-4" onValueChange={setActiveFilter}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="favoritas">Favoritas</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredConversations.length} {filteredConversations.length === 1 ? 'conversa' : 'conversas'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "recent" ? "oldest" : "recent")}
                  className="flex items-center text-xs"
                >
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  {sortOrder === "recent" ? "Mais recentes" : "Mais antigas"}
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhuma conversa encontrada
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(80vh-220px)]">
                  {filteredConversations.map(conversation => (
                    <ConversationCard 
                      key={conversation.id} 
                      conversation={conversation}
                      onClick={handleConversationClick}
                    />
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Coluna de detalhes */}
            <div className="md:col-span-2">
              {selectedConversation ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedConversation.title}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedConversation.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <span className="mx-2">•</span>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {selectedConversation.messages} mensagens
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Continuar
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        {selectedConversation.isFavorite ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Tags:</span>
                    {selectedConversation.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-sm rounded-full flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-hidden">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {selectedConversation.preview}
                      </p>
                    </div>

                    <div className="text-center p-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Selecione "Continuar" para retomar esta conversa
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-center text-gray-500 dark:text-gray-400 max-w-md">
                    Escolha uma conversa do histórico para visualizar detalhes e continuar de onde parou
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;