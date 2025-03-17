import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
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
  MessageSquare,
} from "lucide-react";
import HelpRequestCard from "@/components/conexao-expert/HelpRequestCard";
import ExpertCard from "@/components/conexao-expert/ExpertCard";
import FilterPanel from "@/components/conexao-expert/FilterPanel";
import NewRequestModal from "@/components/conexao-expert/NewRequestModal";
import RequestDetailModal from "@/components/conexao-expert/RequestDetailModal";
import BidModal from "@/components/conexao-expert/BidModal";
import AllMessagesModal from "@/components/conexao-expert/AllMessagesModal";
import SuccessModal from "@/components/conexao-expert/SuccessModal";
import ExpertSelectionModal from "@/components/conexao-expert/ExpertSelectionModal";

export default function ConexaoExpertPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "list"
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllMessagesModal, setShowAllMessagesModal] = useState(false);
  const [showExpertSelectionModal, setShowExpertSelectionModal] =
    useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [currentTab, setCurrentTab] = useState(tabParam || "todos");
  const [userCoins, setUserCoins] = useState(250); // User's School Points balance
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newRequestData, setNewRequestData] = useState(null);
  const [userBids, setUserBids] = useState([]);

  // Sample data for user bids
  const sampleUserBids = [
    {
      id: "bid1",
      bidAmount: 25,
      date: "Há 1 dia",
      responseTime: "2 horas",
      status: "highest", // highest, outbid, accepted
      request: {
        id: "1",
        title: "Como resolver equações diferenciais de segunda ordem?",
        subject: "Matemática",
        user: {
          name: "João Silva",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
        },
        responses: 3,
        views: 15,
        status: "em_leilao",
      },
    },
    {
      id: "bid2",
      bidAmount: 15,
      date: "Há 2 dias",
      responseTime: "1 hora",
      status: "outbid",
      request: {
        id: "5",
        title: "Dúvida sobre o Princípio da Incerteza de Heisenberg",
        subject: "Física",
        user: {
          name: "Lucas Mendes",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        },
        responses: 4,
        views: 19,
        status: "em_leilao",
      },
    },
    {
      id: "bid3",
      bidAmount: 30,
      date: "Há 3 dias",
      responseTime: "4 horas",
      status: "accepted",
      request: {
        id: "3",
        title: "Interpretação de 'O Cortiço' para trabalho de literatura",
        subject: "Literatura",
        user: {
          name: "Pedro Santos",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
        },
        responses: 5,
        views: 22,
        status: "respondido",
      },
    },
  ];

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
    {
      id: "7",
      title: "Dúvida sobre a Lei de Ohm em circuitos complexos",
      subject: "Física",
      description:
        "Estou estudando circuitos elétricos e tenho dificuldade em aplicar a Lei de Ohm em circuitos com múltiplos resistores em série e paralelo. Alguém poderia me ajudar com um exemplo prático?",
      user: {
        name: "João Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      },
      time: "Há 1 hora",
      responses: 0,
      views: 3,
      status: "em_leilao",
      urgency: false,
      difficulty: "intermediário",
      isUserRequest: true,
      auction: {
        currentBid: 15,
        timeLeft: "23h 45min",
        bidCount: 0,
      },
      tags: ["Física", "Eletricidade", "Circuitos"],
    },
    {
      id: "8",
      title: "Ajuda com redação para o ENEM",
      subject: "Português",
      description:
        "Preciso de dicas para melhorar minha redação para o ENEM. Tenho dificuldade principalmente na conclusão e nas propostas de intervenção. Alguém poderia revisar meu texto e dar sugestões?",
      user: {
        name: "João Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      },
      time: "Há 3 horas",
      responses: 2,
      views: 12,
      status: "respondido",
      urgency: true,
      difficulty: "intermediário",
      isUserRequest: true,
      tags: ["Redação", "ENEM", "Português"],
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

    // Apply active filters if they exist
    if (Object.keys(activeFilters).length > 0) {
      // Filter by subjects (multiple selection)
      if (activeFilters.subjects && activeFilters.subjects.length > 0) {
        const subjectId = request.subject
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_");
        if (!activeFilters.subjects.includes(subjectId)) {
          return false;
        }
      }

      // Filter by levels (multiple selection)
      if (activeFilters.levels && activeFilters.levels.length > 0) {
        let levelMatched = false;
        if (
          request.difficulty === "básico" &&
          activeFilters.levels.includes("ensino_fundamental")
        ) {
          levelMatched = true;
        } else if (
          request.difficulty === "intermediário" &&
          activeFilters.levels.includes("ensino_medio")
        ) {
          levelMatched = true;
        } else if (
          request.difficulty === "avançado" &&
          (activeFilters.levels.includes("graduacao") ||
            activeFilters.levels.includes("pos_graduacao"))
        ) {
          levelMatched = true;
        } else if (activeFilters.levels.includes("outro")) {
          levelMatched = true;
        }

        if (!levelMatched) {
          return false;
        }
      }

      // Filter by statuses (multiple selection)
      if (activeFilters.statuses && activeFilters.statuses.length > 0) {
        if (!activeFilters.statuses.includes(request.status)) {
          return false;
        }
      }

      // Filter by urgency
      if (activeFilters.isUrgent) {
        if (!request.urgency) {
          return false;
        }
      }

      // Filter by attachments
      if (activeFilters.hasAttachments) {
        // In a real app, check if the request has attachments
        // For now, we'll just use a random condition
        if (!request.hasAttachments) {
          return false;
        }
      }

      // Filter by my bids
      if (activeFilters.myBids) {
        if (!request.userHasBid) {
          return false;
        }
      }

      // Filter by paid responses
      if (activeFilters.withPaidResponses) {
        // In a real app, check if the request has paid responses
        // For now, we'll just use a random condition
        if (!request.hasPaidResponses) {
          return false;
        }
      }

      // Filter by bid range
      if (activeFilters.bidRange && request.auction) {
        const [minBid, maxBid] = activeFilters.bidRange;
        if (
          request.auction.currentBid < minBid ||
          request.auction.currentBid > maxBid
        ) {
          return false;
        }
      }

      // Filter by keywords
      if (activeFilters.keywords && activeFilters.keywords.trim() !== "") {
        const keywords = activeFilters.keywords.toLowerCase().split(/\s+/);
        const matchesKeyword = keywords.some(
          (keyword) =>
            request.title.toLowerCase().includes(keyword) ||
            request.description.toLowerCase().includes(keyword) ||
            (request.tags &&
              request.tags.some((tag) => tag.toLowerCase().includes(keyword))),
        );
        if (!matchesKeyword) {
          return false;
        }
      }
    }

    // Filter by tab
    if (currentTab === "meus_pedidos") {
      // Check if the current user is the author
      return request.isUserRequest === true;
    } else if (currentTab === "em_leilao") {
      return request.status === "em_leilao";
    } else if (currentTab === "respondidos") {
      return request.status === "respondido" || request.status === "resolvido";
    } else if (currentTab === "meus_lances") {
      // Check if the user has made a bid on this request
      return request.userHasBid === true;
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
        name: "João Silva", // Current user
        avatar: "/images/tempo-image-20250305T080643776Z.png",
      },
      time: "Agora mesmo",
      responses: 0,
      views: 0,
      status: "em_leilao", // Always use auction system
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

    // Add auction data (always enabled)
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

    // Add the new request to the list
    helpRequests.unshift(newRequest);

    // Store the new request data for the success modal
    setNewRequestData(newRequest);

    // In a real app, you would send this data to your backend
    setShowNewRequestModal(false);
    setShowSuccessModal(true);
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
          auction: {
            ...req.auction,
            currentBid: Math.max(
              req.auction?.currentBid || 0,
              bidData.bidAmount,
            ),
            bidCount: (req.auction?.bidCount || 0) + 1,
          },
        };
      }
      return req;
    });

    // Replace the helpRequests array with the updated one
    helpRequests.length = 0;
    updatedRequests.forEach((req) => helpRequests.push(req));

    // Add the bid to userBids
    const newBid = {
      id: `bid-${Date.now()}`,
      bidAmount: bidData.bidAmount,
      date: "Agora mesmo",
      responseTime:
        bidData.estimatedTime === "1"
          ? "Menos de 1 hora"
          : bidData.estimatedTime === "2"
            ? "1-2 horas"
            : bidData.estimatedTime === "4"
              ? "2-4 horas"
              : bidData.estimatedTime === "8"
                ? "4-8 horas"
                : "Até 24 horas",
      status: "highest",
      request: selectedRequest,
    };

    setUserBids([newBid, ...userBids]);

    // In a real app, you would send this data to your backend
    setShowBidModal(false);
  };

  const handleChooseExpert = (expert) => {
    setSelectedExpert(expert);
    setShowExpertSelectionModal(true);
  };

  const handleConfirmExpertSelection = (expert) => {
    // Update the request status
    const updatedRequests = helpRequests.map((req) => {
      if (req.id === selectedRequest?.id) {
        return {
          ...req,
          status: "respondido",
          selectedExpert: expert,
        };
      }
      return req;
    });

    // Replace the helpRequests array with the updated one
    helpRequests.length = 0;
    updatedRequests.forEach((req) => helpRequests.push(req));

    // Close modals
    setShowRequestDetailModal(false);
    setShowExpertSelectionModal(false);
  };

  // Initialize userBids as empty array
  React.useEffect(() => {
    setUserBids([]);
  }, []);

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
              <span className="font-medium text-[#FF6B00]">{userCoins} SP</span>
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
          <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] rounded-lg px-3 py-1.5 border border-green-500/30 shadow-sm">
            <Trophy className="h-4 w-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ganhos como Expert
              </span>
              <span className="font-medium text-green-500">120 SP</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 ml-1 text-green-500 hover:bg-green-500/10 px-1.5"
              onClick={() => console.log("Ver ganhos como expert")}
            >
              <Eye className="h-3.5 w-3.5" />
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
                <DollarSign className="h-4 w-4" /> Pedidos Disponíveis
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
                <DollarSign className="h-4 w-4" /> Minhas Propostas
              </TabsTrigger>
            </motion.div>
          </TabsList>

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
                  Nenhum pedido disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não há pedidos disponíveis no momento. Crie um novo pedido e
                  ative o sistema de propostas para receber ofertas dos experts.
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
                  onBid={() => handleOpenBidModal(request)}
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

        <TabsContent value="meus_pedidos" className="mt-6">
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
                  <User className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Você ainda não tem pedidos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Crie seu primeiro pedido de ajuda para receber respostas dos
                  experts.
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

        <TabsContent value="meus_lances" className="mt-6">
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
            ) : true ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <DollarSign className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Você ainda não fez propostas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Faça propostas em pedidos de ajuda para aparecerem nesta
                  seção.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20 p-4 max-w-md mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">
                      Como funcionam as propostas?
                    </h4>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    Ao fazer uma proposta em um pedido de ajuda, você está
                    oferecendo seus conhecimentos para resolver a dúvida do
                    usuário.
                  </p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Ofereça um valor em
                      School Points
                    </li>
                    <li className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Indique seu tempo de
                      resposta
                    </li>
                    <li className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" /> Ganhe pontos e
                      reputação ao ter sua proposta aceita
                    </li>
                  </ul>
                </div>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => setCurrentTab("em_leilao")}
                >
                  <DollarSign className="h-4 w-4 mr-1" /> Ver Propostas Abertas
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhuma proposta encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não encontramos propostas com os filtros selecionados. Tente
                  ajustar seus filtros para ver suas propostas.
                </p>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => setActiveFilters({})}
                >
                  <Filter className="h-4 w-4 mr-1" /> Limpar Filtros
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
                <ThumbsUp className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Taxa de Satisfação
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  98%
                </span>
              </div>
            </div>
          </div>
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

      {selectedRequest && showRequestDetailModal && (
        <RequestDetailModal
          isOpen={showRequestDetailModal}
          onClose={() => setShowRequestDetailModal(false)}
          request={selectedRequest}
          onBid={() => {
            setShowRequestDetailModal(false);
            setShowBidModal(true);
          }}
          onChooseExpert={handleChooseExpert}
        />
      )}

      {selectedRequest && showBidModal && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleSubmitBid}
          request={selectedRequest}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          request={newRequestData}
          onViewRequest={() => {
            setShowSuccessModal(false);
            setSelectedRequest(newRequestData);
            setShowRequestDetailModal(true);
          }}
        />
      )}

      {selectedRequest && selectedExpert && showExpertSelectionModal && (
        <ExpertSelectionModal
          isOpen={showExpertSelectionModal}
          onClose={() => setShowExpertSelectionModal(false)}
          expert={selectedExpert}
          request={selectedRequest}
          onConfirm={handleConfirmExpertSelection}
        />
      )}

      {showAllMessagesModal && (
        <AllMessagesModal
          isOpen={showAllMessagesModal}
          onClose={() => setShowAllMessagesModal(false)}
          requests={helpRequests}
          onViewRequest={(request) => {
            setShowAllMessagesModal(false);
            setSelectedRequest(request);
            setShowRequestDetailModal(true);
          }}
        />
      )}
    </div>
  );
}
