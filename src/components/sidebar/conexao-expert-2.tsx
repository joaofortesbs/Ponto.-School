import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Filter,
  Clock,
  MessageCircle,
  CheckCircle,
  DollarSign,
  Star,
  Atom,
  BookOpen,
  Calculator,
  Beaker,
  Dna,
  BookText,
  Flame,
  Eye,
  ChevronRight,
  X,
  Info,
  AlertCircle,
  HelpCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Users,
  Shield,
  Award,
  Briefcase,
  Zap,
  FileText,
  Code,
  GraduationCap,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewRequestModal } from "../conexao-expert-2/new-request-modal";
import { RequestDetailModal } from "../conexao-expert-2/request-detail-modal";
import { BidModal } from "../conexao-expert-2/bid-modal";
import { SuccessModal } from "../conexao-expert-2/success-modal";
import { ExpertSelectionModal } from "../conexao-expert-2/expert-selection-modal";
import { FilterPanel } from "../conexao-expert-2/filter-panel";
import AllMessagesModal from "../conexao-expert/AllMessagesModal";
import ConfirmExpertModal from "../conexao-expert/ConfirmExpertModal";
import { addResponse } from "@/services/responseService";

export function ConexaoExpert2() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExpertSelectionModal, setShowExpertSelectionModal] =
    useState(false);
  const [showAllMessagesModal, setShowAllMessagesModal] = useState(false);
  const [showConfirmExpertModal, setShowConfirmExpertModal] = useState(false);
  const [isExpertChosen, setIsExpertChosen] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Mock data for help requests
  const mockRequests = [
    {
      id: "1",
      title: "Como resolver equações diferenciais de segunda ordem?",
      subject: "Matemática",
      description:
        "Estou com dificuldade em entender como resolver equações diferenciais de segunda ordem com coeficientes constantes. Alguém poderia me ajudar com um exemplo passo a passo?",
      user: {
        name: "João Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
      },
      time: "2h atrás",
      responses: 3,
      views: 42,
      status: "em_leilao",
      difficulty: "intermediário",
      auction: {
        currentBid: 15,
        timeLeft: "4h 30min",
        bidCount: 3,
      },
      tags: ["Cálculo", "Equações Diferenciais", "Matemática Avançada"],
    },
    {
      id: "2",
      title: "Dúvida sobre o princípio da incerteza de Heisenberg",
      subject: "Física",
      description:
        "Não estou conseguindo entender completamente o princípio da incerteza de Heisenberg e suas implicações na mecânica quântica. Alguém poderia explicar de forma mais intuitiva?",
      user: {
        name: "Maria Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      },
      time: "5h atrás",
      responses: 1,
      views: 28,
      status: "aberto",
      difficulty: "avançado",
      urgency: true,
      tags: ["Física Quântica", "Mecânica Quântica", "Heisenberg"],
    },
    {
      id: "3",
      title: "Como balancear reações de oxirredução?",
      subject: "Química",
      description:
        "Preciso de ajuda para entender o processo de balanceamento de reações de oxirredução em meio ácido e básico. Quais são as etapas e como identificar os agentes oxidantes e redutores?",
      user: {
        name: "Pedro Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
      },
      time: "1d atrás",
      responses: 5,
      views: 67,
      status: "respondido",
      difficulty: "básico",
      tags: ["Química Inorgânica", "Oxirredução", "Balanceamento"],
    },
    {
      id: "4",
      title:
        "Interpretação do conto 'A Terceira Margem do Rio' de Guimarães Rosa",
      subject: "Literatura",
      description:
        "Estou tendo dificuldade em interpretar o conto 'A Terceira Margem do Rio' de Guimarães Rosa. Quais são os principais símbolos e metáforas presentes no texto e qual a mensagem central do autor?",
      user: {
        name: "Ana Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
      },
      time: "3d atrás",
      responses: 8,
      views: 112,
      status: "resolvido",
      difficulty: "intermediário",
      tags: [
        "Literatura Brasileira",
        "Guimarães Rosa",
        "Interpretação de Texto",
      ],
    },
    {
      id: "5",
      title: "Implementação de algoritmos de ordenação em Python",
      subject: "Programação",
      description:
        "Preciso implementar os algoritmos de ordenação QuickSort, MergeSort e HeapSort em Python e comparar suas eficiências. Alguém poderia me ajudar com exemplos de código e explicações?",
      user: {
        name: "Lucas Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucas",
      },
      time: "6h atrás",
      responses: 2,
      views: 45,
      status: "em_leilao",
      difficulty: "avançado",
      auction: {
        currentBid: 25,
        timeLeft: "12h 15min",
        bidCount: 2,
      },
      tags: ["Python", "Algoritmos", "Estrutura de Dados"],
    },
  ];

  // Mock data for experts
  const mockExperts = [
    {
      id: "1",
      name: "Prof. Carlos Mendes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
      rating: 4.9,
      responseTime: "< 30min",
      specialties: ["Matemática", "Física", "Cálculo"],
      verified: true,
      online: true,
      completedRequests: 342,
      description:
        "Professor de Matemática e Física com mais de 15 anos de experiência. Especialista em cálculo, álgebra linear e física mecânica.",
    },
    {
      id: "2",
      name: "Dra. Juliana Alves",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=juliana",
      rating: 4.8,
      responseTime: "< 1h",
      specialties: ["Química", "Biologia", "Bioquímica"],
      verified: true,
      completedRequests: 189,
      description:
        "Doutora em Bioquímica com experiência em ensino superior. Especialista em química orgânica, biologia celular e bioquímica metabólica.",
    },
    {
      id: "3",
      name: "Prof. Ricardo Sousa",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ricardo",
      rating: 4.7,
      responseTime: "< 2h",
      specialties: ["Literatura", "Redação", "Gramática"],
      online: true,
      completedRequests: 215,
      description:
        "Professor de Literatura e Língua Portuguesa com mestrado em Letras. Especialista em literatura brasileira, redação acadêmica e análise textual.",
    },
  ];

  // Filter requests based on active tab and search query
  const filteredRequests = mockRequests.filter((request) => {
    // Filter by search query
    if (
      searchQuery &&
      !request.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !request.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(
        request.tags &&
        request.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      )
    ) {
      return false;
    }

    // Filter by tab
    if (activeTab === "em_leilao") {
      return request.status === "em_leilao";
    } else if (activeTab === "respondidos") {
      return request.status === "respondido" || request.status === "resolvido";
    } else if (activeTab === "meus_pedidos") {
      // In a real app, you would check if the request was created by the current user
      return request.user.name === "Você";
    } else if (activeTab === "meus_lances") {
      // In a real app, you would check if the current user has made a proposal on this request
      return request.userProposal !== undefined;
    }

    return true;
  });

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetailModal(true);
  };

  const handleBidClick = (request: any) => {
    setSelectedRequest(request);
    setShowBidModal(true);
  };

  const handleBidSubmit = (bidData: any) => {
    console.log("Proposal submitted:", bidData);
    setShowBidModal(false);
    setShowSuccessModal(true);
  };

  const handleNewRequestSubmit = (requestData: any) => {
    console.log("New request submitted:", requestData);
    setShowNewRequestModal(false);
    setShowSuccessModal(true);
  };

  const handleExpertSelection = (expert: any) => {
    setSelectedExpert(expert);
    setShowExpertSelectionModal(false);
    setShowConfirmExpertModal(true);
  };

  const handleConfirmExpert = () => {
    setShowConfirmExpertModal(false);
    setIsExpertChosen(true);
    setShowSuccessModal(true);
  };

  const handleViewAllMessages = () => {
    setShowAllMessagesModal(true);
  };

  const handleRateResponse = () => {
    console.log("Rating response");
    // Implement rating functionality
  };

  const handleReply = (reply) => {
    if (!reply.trim()) {
      setErrorMessage("Por favor, digite uma resposta antes de enviar.");
      return;
    }
    setErrorMessage("");
    
    // Registrar a resposta no banco de dados
    const responseData = {
      requestId: selectedRequest?.id,
      expertId: 'current_user_id', // ID do usuário atual
      content: reply,
      timestamp: new Date().toISOString(),
      status: 'pending',
      price: 25, // Valor padrão da proposta
      responseTime: '< 1 hora'
    };
    
    try {
      addResponse(responseData);
      console.log('Resposta salva no banco de dados:', responseData);
      
      // Atualizar o estado para mostrar que a mensagem foi enviada
      setIsMessageSent(true);
      setShowRequestDetailModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      setErrorMessage("Ocorreu um erro ao enviar sua resposta. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-bold text-[#001427] dark:text-white font-montserrat">
            Conexão Expert
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conecte-se com especialistas
          </p>
        </div>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Novo Pedido
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pedidos..."
            className="pl-8 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pb-2">
        <Tabs
          defaultValue="todos"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-5 h-8">
            <TabsTrigger value="todos" className="text-xs">
              Todos
            </TabsTrigger>
            <TabsTrigger value="em_leilao" className="text-xs">
              Propostas Abertas
            </TabsTrigger>
            <TabsTrigger value="respondidos" className="text-xs">
              Em Andamento
            </TabsTrigger>
            <TabsTrigger value="meus_pedidos" className="text-xs">
              Meus
            </TabsTrigger>
            <TabsTrigger value="meus_lances" className="text-xs">
              Minhas Propostas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 pb-2 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredRequests.length} pedidos encontrados
        </div>
        <Button
          variant="link"
          size="sm"
          className="h-7 px-2 text-xs text-[#FF6B00] hover:text-[#FF8C40]"
          onClick={handleViewAllMessages}
        >
          Ver Todos
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 py-2">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[#FF6B00]/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleRequestClick(request)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-[#29335C] dark