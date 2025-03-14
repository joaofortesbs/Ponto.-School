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
} from "lucide-react";
import HelpRequestCard from "./HelpRequestCard";

interface AllMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRequest: (request: any) => void;
  onOpenBid: (request: any) => void;
  requests: any[];
}

const AllMessagesModal: React.FC<AllMessagesModalProps> = ({
  isOpen,
  onClose,
  onOpenRequest,
  onOpenBid,
  requests,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");

  // Filter requests based on search query and active tab
  const filteredRequests = requests.filter((request) => {
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
      return request.isUserRequest === true;
    } else if (currentTab === "em_leilao") {
      return request.status === "em_leilao";
    } else if (currentTab === "respondidos") {
      return request.status === "respondido" || request.status === "resolvido";
    } else if (currentTab === "meus_lances") {
      // In a real app, you would check if the current user has made a bid on this request
      return request.userHasBid === true;
    }

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
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <TabsList className="w-full bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg">
              <TabsTrigger
                value="todos"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#FF6B00] rounded-md px-3 py-1.5 text-sm"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="meus_pedidos"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#FF6B00] rounded-md px-3 py-1.5 text-sm"
              >
                Meus Pedidos
              </TabsTrigger>
              <TabsTrigger
                value="em_leilao"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#FF6B00] rounded-md px-3 py-1.5 text-sm"
              >
                Em Leilão
              </TabsTrigger>
              <TabsTrigger
                value="respondidos"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#FF6B00] rounded-md px-3 py-1.5 text-sm"
              >
                Respondidos
              </TabsTrigger>
              <TabsTrigger
                value="meus_lances"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#FF6B00] rounded-md px-3 py-1.5 text-sm"
              >
                Meus Lances
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="todos" className="m-0 h-full">
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => onOpenRequest(request)}
                      onBid={() => onOpenBid(request)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Não encontramos pedidos de ajuda com os filtros
                      selecionados. Tente ajustar seus filtros ou criar um novo
                      pedido.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="meus_pedidos" className="m-0 h-full">
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => onOpenRequest(request)}
                      onBid={() => onOpenBid(request)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum pedido seu encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Você ainda não criou nenhum pedido de ajuda. Crie seu
                      primeiro pedido para receber ajuda dos experts.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="em_leilao" className="m-0 h-full">
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => onOpenRequest(request)}
                      onBid={() => onOpenBid(request)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                      <DollarSign className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum pedido em leilão
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Não há pedidos em leilão no momento. Crie um novo pedido e
                      ative o sistema de leilão para receber lances dos experts.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="respondidos" className="m-0 h-full">
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => onOpenRequest(request)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum pedido respondido
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Não há pedidos respondidos ou resolvidos no momento. Crie
                      um novo pedido para receber ajuda dos experts.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="meus_lances" className="m-0 h-full">
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => onOpenRequest(request)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                      <DollarSign className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum lance seu encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Você ainda não fez nenhum lance em pedidos de ajuda.
                      Encontre pedidos em leilão e faça seu primeiro lance.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AllMessagesModal;
