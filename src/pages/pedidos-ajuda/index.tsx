import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  Clock,
  MessageCircle,
  CheckCircle,
  DollarSign,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Calendar,
  Image,
  Video,
  FileText,
  User,
  Tag,
  SortAsc,
  SortDesc,
  Lightbulb,
  Brain,
  Sparkles,
  Eye,
  ThumbsUp,
  Bookmark,
  Share2,
  Atom,
  Calculator,
  Beaker,
  Dna,
  BookText,
  Zap,
  BarChart,
  Trophy,
  Star,
  Users,
  HelpCircle,
  Info,
  ChevronRight,
  ArrowRight,
  X,
  Wallet,
  Flag,
} from "lucide-react";
import HelpRequestCard from "@/components/conexao-expert/HelpRequestCard";
import ExpertCard from "@/components/conexao-expert/ExpertCard";
import FilterPanel from "@/components/conexao-expert/FilterPanel";
import NewRequestModal from "@/components/conexao-expert/NewRequestModal";
import RequestDetailModal from "@/components/conexao-expert/RequestDetailModal";
import BidModal from "@/components/conexao-expert/BidModal";
import AllMessagesModal from "@/components/conexao-expert/AllMessagesModal";

export default function ConexaoExpertPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "list"
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllMessagesModal, setShowAllMessagesModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentTab, setCurrentTab] = useState("todos");
  const [userCoins, setUserCoins] = useState(250); // User's Ponto Coins balance

  // Sample data for help requests
  const helpRequests = [
    {
      id: "1",
      title: "Como resolver equações diferenciais de segunda ordem?",
      subject: "Matemática",
      description:
        "Estou com dificuldade para entender como resolver equações diferenciais de segunda ordem, especialmente quando há coeficientes variáveis. Alguém poderia explicar o passo a passo?",
      user: {
        name: "João Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      },
      time: "Há 2 horas",
      responses: 3,
      views: 15,
      status: "em_leilao",
      urgency: true,
      difficulty: "avançado",
      auction: {
        currentBid: 25,
        timeLeft: "5h 30min",
        bidCount: 4,
      },
      tags: ["Cálculo", "Equações Diferenciais", "Matemática Avançada"],
    },
    {
      id: "2",
      title: "Dúvida sobre balanceamento de equações químicas",
      subject: "Química",
      description:
        "Preciso balancear algumas equações químicas para meu trabalho de laboratório, mas estou tendo dificuldade com reações redox. Alguém pode me ajudar?",
      user: {
        name: "Maria Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      },
      time: "Há 5 horas",
      responses: 2,
      views: 10,
      status: "aberto",
      urgency: false,
      difficulty: "intermediário",
      tags: ["Química", "Balanceamento", "Redox"],
    },
    {
      id: "3",
      title: "Interpretação de 'O Cortiço' para trabalho de literatura",
      subject: "Literatura",
      description:
        "Preciso fazer uma análise crítica do livro 'O Cortiço' de Aluísio Azevedo, focando nos aspectos naturalistas. Alguém poderia me ajudar com algumas interpretações?",
      user: {
        name: "Pedro Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      },
      time: "Há 1 dia",
      responses: 5,
      views: 22,
      status: "respondido",
      urgency: false,
      difficulty: "intermediário",
      tags: ["Literatura Brasileira", "Naturalismo", "Análise Literária"],
    },
    {
      id: "4",
      title: "Ajuda com código Python para análise de dados",
      subject: "Programação",
      description:
        "Estou tentando criar um script em Python para analisar um conjunto de dados CSV, mas estou tendo problemas com a biblioteca pandas. Preciso de ajuda para entender como filtrar e agrupar os dados corretamente.",
      user: {
        name: "Ana Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      },
      time: "Há 3 dias",
      responses: 8,
      views: 45,
      status: "resolvido",
      urgency: false,
      difficulty: "intermediário",
      tags: ["Python", "Pandas", "Análise de Dados"],
    },
    {
      id: "5",
      title: "Dúvida sobre o Princípio da Incerteza de Heisenberg",
      subject: "Física",
      description:
        "Estou estudando física quântica e não consigo entender completamente o Princípio da Incerteza de Heisenberg. Alguém poderia explicar de forma mais intuitiva e com exemplos práticos?",
      user: {
        name: "Lucas Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
      },
      time: "Há 6 horas",
      responses: 4,
      views: 19,
      status: "em_leilao",
      urgency: false,
      difficulty: "avançado",
      auction: {
        currentBid: 30,
        timeLeft: "12h 45min",
        bidCount: 3,
      },
      tags: ["Física Quântica", "Heisenberg", "Mecânica Quântica"],
    },
    {
      id: "6",
      title: "Como calcular a área de um polígono irregular?",
      subject: "Matemática",
      description:
        "Preciso calcular a área de um polígono irregular para um projeto de arquitetura. Tentei usar a fórmula de Gauss, mas não estou conseguindo aplicá-la corretamente. Alguém pode me ajudar?",
      user: {
        name: "Carla Rodrigues",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
      },
      time: "Há 2 dias",
      responses: 1,
      views: 8,
      status: "aberto",
      urgency: true,
      difficulty: "intermediário",
      tags: ["Geometria", "Cálculo de Área", "Polígonos"],
    },
  ];

  // Sample data for experts
  const experts = [
    {
      id: "1",
      name: "Prof. Ricardo Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
      rating: 4.9,
      responseTime: "< 1 hora",
      specialties: ["Matemática", "Física", "Cálculo"],
      verified: true,
      online: true,
      completedRequests: 156,
    },
    {
      id: "2",
      name: "Dra. Camila Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
      rating: 4.8,
      responseTime: "2 horas",
      specialties: ["Química", "Biologia", "Bioquímica"],
      verified: true,
      online: false,
      completedRequests: 98,
    },
    {
      id: "3",
      name: "Marcos Pereira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos",
      rating: 4.7,
      responseTime: "3 horas",
      specialties: ["Literatura", "História", "Filosofia"],
      verified: false,
      online: true,
      completedRequests: 72,
    },
  ];

  // Filter requests based on search query and active filters
  const filteredRequests = helpRequests.filter((request) => {
    // Filter by search query
    if (
      searchQuery &&
      !request.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by tab
    if (currentTab === "meus_pedidos") {
      // In a real app, you would check if the current user is the author
      return false; // For demo purposes, no requests are shown in "Meus Pedidos"
    } else if (currentTab === "em_leilao") {
      return request.status === "em_leilao";
    } else if (currentTab === "respondidos") {
      return request.status === "respondido" || request.status === "resolvido";
    } else if (currentTab === "meus_lances") {
      // In a real app, you would check if the current user has made a bid on this request
      return request.status === "em_leilao" && Math.random() > 0.5; // For demo purposes, show random requests
    }

    return true;
  });

  const handleOpenRequestDetail = (request) => {
    setSelectedRequest(request);
    setShowRequestDetailModal(true);
  };

  const handleOpenBidModal = (request) => {
    setSelectedRequest(request);
    setShowBidModal(true);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  const handleSubmitNewRequest = (formData) => {
    console.log("New request submitted:", formData);

    // Create a new request object
    const newRequest = {
      id: `new-${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      user: {
        name: "João Fortes", // Current user
        avatar: "/images/tempo-image-20250305T080643776Z.png",
      },
      time: "Agora mesmo",
      responses: 0,
      views: 0,
      status: formData.useAuction ? "em_leilao" : "aberto",
      urgency: formData.isUrgent,
      difficulty:
        formData.level === "ensino_fundamental"
          ? "básico"
          : formData.level === "ensino_medio"
            ? "intermediário"
            : "avançado",
      isUserRequest: true, // Mark as user's own request
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [],
    };

    // Add auction data if enabled
    if (formData.useAuction) {
      newRequest.auction = {
        currentBid: formData.initialBid,
        timeLeft:
          formData.timeLimit === "6"
            ? "6 horas"
            : formData.timeLimit === "12"
              ? "12 horas"
              : formData.timeLimit === "24"
                ? "24 horas"
                : formData.timeLimit === "48"
                  ? "2 dias"
                  : "3 dias",
        bidCount: 0,
      };
    }

    // Add the new request to the list
    helpRequests.unshift(newRequest);

    // In a real app, you would send this data to your backend
    setShowNewRequestModal(false);
  };

  const handleSubmitBid = (bidData) => {
    console.log("Bid submitted:", bidData);
    // Update user coins by subtracting the bid amount
    setUserCoins((prevCoins) => prevCoins - bidData.bidAmount);

    // Update the request to mark that the user has bid on it
    const updatedRequests = helpRequests.map((req) => {
      if (req.id === selectedRequest?.id) {
        return {
          ...req,
          userHasBid: true,
          userBidAmount: bidData.bidAmount,
        };
      }
      return req;
    });

    // In a real app, you would send this data to your backend
    setShowBidModal(false);
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Conexão Expert
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Conecte-se com especialistas para resolver suas dúvidas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] rounded-lg px-3 py-1.5 border border-[#FF6B00]/30 shadow-sm">
            <Wallet className="h-4 w-4 text-[#FF6B00]" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Saldo
              </span>
              <span className="font-medium text-[#FF6B00]">{userCoins} PC</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 ml-1 text-[#FF6B00] hover:bg-[#FF6B00]/10 px-1.5"
              onClick={() => (window.location.href = "/carteira")}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold"
            onClick={() => setShowNewRequestModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Pedido
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="Buscar pedidos de ajuda..."
              className="pl-10 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              className="h-11 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1 w-full md:w-auto justify-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            {showFilters && (
              <FilterPanel
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApplyFilters={handleApplyFilters}
                activeFilters={activeFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1E293B] p-1.5 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-between animate-gradient-x">
            <motion.div className="contents" layout>
              <TabsTrigger
                value="todos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
              >
                <BookOpen className="h-4 w-4" /> Todos
              </TabsTrigger>
              <TabsTrigger
                value="em_leilao"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4" /> Em Leilão
              </TabsTrigger>
              <TabsTrigger
                value="respondidos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
              >
                <CheckCircle className="h-4 w-4" /> Respondidos
              </TabsTrigger>
              <TabsTrigger
                value="meus_pedidos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
              >
                <User className="h-4 w-4" /> Meus Pedidos
              </TabsTrigger>
              <TabsTrigger
                value="meus_lances"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4" /> Meus Lances
              </TabsTrigger>
            </motion.div>
          </TabsList>

          {currentTab === "todos" && (
            <Button
              variant="outline"
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1"
              onClick={() => {
                // Show all messages modal with all requests
                setShowAllMessagesModal(true);
              }}
            >
              <Eye className="h-4 w-4" />
              <span>Ver Todas as Mensagens</span>
            </Button>
          )}
        </div>

        {/* Tab Content */}
        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleOpenRequestDetail(request)}
                  onBid={() => handleOpenBidModal(request)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não encontramos pedidos de ajuda com os filtros selecionados.
                  Tente ajustar seus filtros ou criar um novo pedido.
                </p>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => setShowNewRequestModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Criar Novo Pedido
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="em_leilao" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleOpenRequestDetail(request)}
                  onBid={() => handleOpenBidModal(request)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <DollarSign className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum pedido em leilão
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não há pedidos em leilão no momento. Crie um novo pedido e
                  ative o sistema de leilão para receber lances dos experts.
                </p>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => setShowNewRequestModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Criar Novo Pedido
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="respondidos" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleOpenRequestDetail(request)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum pedido respondido
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não há pedidos respondidos ou resolvidos no momento. Crie um
                  novo pedido para receber ajuda dos experts.
                </p>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => setShowNewRequestModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Criar Novo Pedido
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Experts Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#FF6B00]" /> Experts em
            Destaque
          </h2>
          <Button
            variant="link"
            className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
          >
            Ver Todos <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onClick={() => console.log("Expert clicked:", expert.id)}
            />
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-8 bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2 mb-6">
          <BarChart className="h-5 w-5 text-[#FF6B00]" /> Estatísticas da
          Plataforma
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total de Pedidos
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  1,250
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pedidos Resolvidos
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  985
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tempo Médio de Resposta
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  2.5h
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avaliação Média
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  4.8
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-8 bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-[#FF6B00]" /> Como Funciona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              1. Crie seu Pedido
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Descreva sua dúvida em detalhes, adicione imagens se necessário e
              escolha a disciplina relacionada.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              2. Conecte-se com Experts
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Receba respostas de experts qualificados ou use o sistema de
              leilão para escolher o melhor expert.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              3. Resolva sua Dúvida
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Interaja com o expert através do chat, receba explicações
              detalhadas e avalie o serviço prestado.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold text-lg animate-gradient-x"
            onClick={() => setShowNewRequestModal(true)}
          >
            Criar Meu Primeiro Pedido
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showNewRequestModal && (
        <NewRequestModal
          isOpen={showNewRequestModal}
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={handleSubmitNewRequest}
        />
      )}

      {showRequestDetailModal && selectedRequest && (
        <RequestDetailModal
          isOpen={showRequestDetailModal}
          onClose={() => setShowRequestDetailModal(false)}
          onBid={() => {
            setShowRequestDetailModal(false);
            setShowBidModal(true);
          }}
          request={selectedRequest}
        />
      )}

      {showBidModal && selectedRequest && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleSubmitBid}
          request={selectedRequest}
        />
      )}

      {showAllMessagesModal && (
        <AllMessagesModal
          isOpen={showAllMessagesModal}
          onClose={() => setShowAllMessagesModal(false)}
          onOpenRequest={(request) => {
            setSelectedRequest(request);
            setShowAllMessagesModal(false);
            setShowRequestDetailModal(true);
          }}
          onOpenBid={(request) => {
            setSelectedRequest(request);
            setShowAllMessagesModal(false);
            setShowBidModal(true);
          }}
          requests={helpRequests}
        />
      )}
    </div>
  );
}
