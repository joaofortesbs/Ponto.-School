import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  X,
  MessageCircle,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Filter,
  Eye,
  MessageSquare,
} from "lucide-react";
import HelpRequestCard from "./HelpRequestCard";

interface AllMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests?: any[];
  onOpenRequest?: (request: any) => void;
  onOpenBid?: (request: any) => void;
}

const AllMessagesModal: React.FC<AllMessagesModalProps> = ({
  isOpen,
  onClose,
  requests = [],
  onOpenRequest,
  onOpenBid,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");

  // Mock data for demonstration
  const mockRequests = [
    {
      id: "1",
      title: "Como resolver equações diferenciais de segunda ordem?",
      description:
        "Estou com dificuldade para entender como resolver equações diferenciais de segunda ordem, especialmente quando há coeficientes variáveis. Alguém poderia explicar o passo a passo?",
      subject: "Matemática",
      difficulty: "avançado",
      urgency: true,
      status: "em_leilao",
      time: "Há 2 horas",
      user: {
        name: "João Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JoaoSilva",
      },
      tags: ["Cálculo", "Equações Diferenciais", "Matemática Avançada"],
      responses: 3,
      views: 15,
      isUserRequest: true,
      auction: {
        currentBid: 25,
        timeLeft: "5h 30min",
        bidCount: 4,
      },
    },
    {
      id: "2",
      title: "Dúvida sobre balanceamento de equações químicas",
      description:
        "Preciso balancear algumas equações químicas para meu trabalho de laboratório, mas estou tendo dificuldade com reações redox. Alguém pode me ajudar?",
      subject: "Química",
      difficulty: "intermediário",
      urgency: false,
      status: "aberto",
      time: "Há 5 horas",
      user: {
        name: "Maria Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MariaOliveira",
      },
      tags: ["Química", "Balanceamento", "Redox"],
      responses: 2,
      views: 10,
      isUserRequest: false,
      auction: null,
    },
    {
      id: "3",
      title: "Interpretação de 'O Cortiço' para trabalho de literatura",
      description:
        "Preciso fazer uma análise crítica do livro 'O Cortiço' de Aluísio Azevedo, focando nos aspectos naturalistas. Alguém poderia me ajudar com algumas interpretações?",
      subject: "Literatura",
      difficulty: "intermediário",
      urgency: false,
      status: "respondido",
      time: "Há 1 dia",
      user: {
        name: "Pedro Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PedroSantos",
      },
      tags: ["Literatura Brasileira", "Naturalismo", "Análise Literária"],
      responses: 5,
      views: 22,
      isUserRequest: false,
      auction: null,
    },
  ];

  // Use mock data if no requests are provided
  const allRequests = requests.length > 0 ? requests : mockRequests;

  // Filter messages based on search query and current tab
  const filteredRequests = allRequests.filter((request) => {
    // Filter by search query
    if (
      searchQuery &&
      !request.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by tab
    if (currentTab === "meus_pedidos" && !request.isUserRequest) return false;
    if (currentTab === "em_leilao" && request.status !== "em_leilao")
      return false;
    if (currentTab === "respondidos" && request.status !== "respondido")
      return false;
    if (currentTab === "meus_lances" && !request.userHasBid) return false;

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Todos os Pedidos de Ajuda
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
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
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="bg-transparent h-12 w-full justify-start px-4">
              <TabsTrigger
                value="todos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none px-4 py-3 h-full"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="meus_pedidos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none px-4 py-3 h-full"
              >
                Meus Pedidos
              </TabsTrigger>
              <TabsTrigger
                value="em_leilao"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none px-4 py-3 h-full"
              >
                Em Leilão
              </TabsTrigger>
              <TabsTrigger
                value="respondidos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none px-4 py-3 h-full"
              >
                Respondidos
              </TabsTrigger>
              <TabsTrigger
                value="meus_lances"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none px-4 py-3 h-full"
              >
                Meus Lances
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            {filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <HelpRequestCard
                    key={request.id}
                    request={request}
                    onClick={() => onOpenRequest && onOpenRequest(request)}
                    onBid={() => onOpenBid && onOpenBid(request)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-[#FF6B00]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Não encontramos pedidos que correspondam aos seus critérios de
                  busca. Tente ajustar seus filtros ou criar um novo pedido.
                </p>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={onClose}
                >
                  Voltar
                </Button>
              </div>
            )}
          </div>
        </Tabs>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AllMessagesModal;
