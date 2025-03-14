import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Eye,
  ThumbsUp,
  Send,
  Image,
  FileText,
  Paperclip,
  Download,
  Flag,
  Bookmark,
  Share2,
  Atom,
  Calculator,
  Beaker,
  Dna,
  BookText,
  Lightbulb,
  Lock,
  Star,
  Info,
} from "lucide-react";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBid?: () => void;
  onReply?: (reply: string) => void;
  request: any; // Replace with proper type
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  onBid,
  onReply,
  request,
}) => {
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState("detalhes");

  // Function to get subject icon
  const getSubjectIcon = () => {
    switch (request?.subject?.toLowerCase()) {
      case "física":
        return <Atom className="h-6 w-6 text-[#4361EE]" />;
      case "matemática":
        return <Calculator className="h-6 w-6 text-[#FF6B00]" />;
      case "química":
        return <Beaker className="h-6 w-6 text-[#E85D04]" />;
      case "biologia":
        return <Dna className="h-6 w-6 text-[#DC2F02]" />;
      case "literatura":
        return <BookText className="h-6 w-6 text-[#6D597A]" />;
      default:
        return <Lightbulb className="h-6 w-6 text-[#FF6B00]" />;
    }
  };

  // Function to get status badge
  const getStatusBadge = () => {
    switch (request?.status) {
      case "aberto":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Clock className="h-3 w-3 mr-1" /> Aberto
          </Badge>
        );
      case "em_leilao":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <DollarSign className="h-3 w-3 mr-1" /> Em Leilão
          </Badge>
        );
      case "respondido":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            <MessageCircle className="h-3 w-3 mr-1" /> Respondido
          </Badge>
        );
      case "resolvido":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Resolvido
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSubmitReply = () => {
    if (replyText.trim() && onReply) {
      onReply(replyText);
      setReplyText("");
    }
  };

  if (!isOpen || !request) return null;

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
            <h2 className="text-xl font-bold text-white truncate max-w-[500px]">
              {request.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // Handle bookmark functionality
              }}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // Handle share functionality
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700 px-4 sticky top-0 z-10">
            <TabsList className="bg-transparent border-b-0 justify-start -mb-px">
              <TabsTrigger
                value="detalhes"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                value="respostas"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Respostas ({request.responses?.length || 0})
              </TabsTrigger>
              {request.status === "em_leilao" && (
                <TabsTrigger
                  value="leilao"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
                >
                  Leilão
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="detalhes" className="p-6 m-0">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-10 w-10 border border-[#FF6B00]/20">
                  <AvatarImage src={request.user?.avatar} />
                  <AvatarFallback>
                    {request.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#29335C] dark:text-white">
                      {request.user?.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      •
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {request.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline">{request.subject}</Badge>
                    {request.difficulty && (
                      <Badge
                        className={
                          request.difficulty === "básico"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : request.difficulty === "intermediário"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }
                      >
                        {request.difficulty}
                      </Badge>
                    )}
                    {request.urgency && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <AlertCircle className="h-3 w-3 mr-1" /> Urgente
                      </Badge>
                    )}
                    {getStatusBadge()}
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {request.description}
                </p>
              </div>

              {request.tags && request.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-6">
                  {request.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {request.auction && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" /> Leilão em
                    Andamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Lance Atual
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {request.auction.currentBid} Ponto Coins
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tempo Restante
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {request.auction.timeLeft}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Número de Lances
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {request.auction.bidCount}
                      </span>
                    </div>
                  </div>
                  {onBid && (
                    <Button
                      className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full md:w-auto"
                      onClick={onBid}
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Fazer Lance
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <MessageCircle className="h-4 w-4 text-[#FF6B00]" />
                    <span>
                      {request.responses}{" "}
                      {request.responses === 1 ? "resposta" : "respostas"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Eye className="h-4 w-4 text-[#FF6B00]" />
                    <span>{request.views} visualizações</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Flag className="h-4 w-4 mr-1" /> Denunciar
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="respostas" className="p-6 m-0">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <h3 className="text-base font-medium text-blue-800 dark:text-blue-300">
                      Respostas dos Experts
                    </h3>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {request.responses} respostas disponíveis
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  Escolha um expert para ver sua resposta completa. Após
                  escolher, você poderá interagir diretamente com o expert
                  através do chat privado.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Expert 1 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#FF6B00]/20">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo" />
                          <AvatarFallback>RO</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Prof. Ricardo Oliveira
                            </span>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0">
                              <CheckCircle className="h-3 w-3 mr-1" />{" "}
                              Verificado
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>4.9 (156 avaliações)</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#FF6B00]" />
                              <span>Respondeu há 1 hora</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-xs h-8">
                        Escolher Expert
                      </Button>
                    </div>

                    <div className="mt-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Resposta bloqueada
                          </span>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Resposta completa: 5 parágrafos
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Expert 2 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#FF6B00]/20">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" />
                          <AvatarFallback>MO</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Maria Oliveira
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>4.7 (89 avaliações)</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#FF6B00]" />
                              <span>Respondeu há 30 minutos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-xs h-8">
                        Escolher Expert
                      </Button>
                    </div>

                    <div className="mt-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Resposta bloqueada
                          </span>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Resposta completa: 3 parágrafos + exemplo
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Expert 3 - For other users viewing paid content */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#FF6B00]/20">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" />
                          <AvatarFallback>CS</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Carlos Santos
                            </span>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0">
                              <CheckCircle className="h-3 w-3 mr-1" />{" "}
                              Verificado
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>4.8 (112 avaliações)</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#FF6B00]" />
                              <span>Respondeu há 2 horas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 text-xs h-8 border border-[#FF6B00]/30">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver por 5 PC
                      </Button>
                    </div>

                    <div className="mt-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Resposta bloqueada (paga)
                          </span>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Resposta completa: 4 parágrafos + código
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {request.status === "em_leilao" && (
              <TabsContent value="leilao" className="p-6 m-0">
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-500" /> Status do
                      Leilão
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Lance Atual
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {request.auction.currentBid} Ponto Coins
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Tempo Restante
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {request.auction.timeLeft}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Número de Lances
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {request.auction.bidCount}
                        </span>
                      </div>
                    </div>
                    {onBid && (
                      <Button
                        className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full md:w-auto"
                        onClick={onBid}
                      >
                        <DollarSign className="h-4 w-4 mr-1" /> Fazer Lance
                      </Button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Histórico de Lances
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#FF6B00]/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo" />
                            <AvatarFallback>RO</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Prof. Ricardo Oliveira
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" /> Há 2 horas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#FF6B00]">
                            25 Ponto Coins
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lance Atual
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#FF6B00]/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Camila" />
                            <AvatarFallback>CS</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Dra. Camila Santos
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" /> Há 3 horas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-500 dark:text-gray-400">
                            20 Ponto Coins
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Superado
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#FF6B00]/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos" />
                            <AvatarFallback>MP</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-[#29335C] dark:text-white">
                              Marcos Pereira
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" /> Há 4 horas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-500 dark:text-gray-400">
                            15 Ponto Coins
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Superado
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RequestDetailModal;
