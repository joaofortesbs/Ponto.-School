import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuccessModal from "./SuccessModal";
import ConfirmExpertModal from "./ConfirmExpertModal";
import ExpertResponseModal from "./ExpertResponseModal";
import { addResponse } from "@/services/responseService";
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
  onChooseExpert?: (expert: any) => void;
  request: any; // Replace with proper type
  errorMessage?: string;
  activeTab?: string;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  onBid,
  onReply,
  onChooseExpert,
  request,
  errorMessage,
  activeTab: initialActiveTab,
}) => {
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState(initialActiveTab || "detalhes");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExpertResponse, setShowExpertResponse] = useState(false);
  const [showPaidResponse, setShowPaidResponse] = useState(false);
  const [paidExpert, setPaidExpert] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

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
            <DollarSign className="h-3 w-3 mr-1" /> Propostas Abertas
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
      // Indicar que está enviando a mensagem
      setIsSending(true);

      // Criar objeto de resposta para salvar no banco de dados
      const responseData = {
        requestId: request.id,
        expertId: "current_user_id", // Substituir pelo ID do usuário atual
        content: replyText,
        timestamp: new Date().toISOString(),
        status: "pending", // Status inicial da proposta
        price: 25, // Valor padrão da proposta em School Points
        responseTime: "< 1 hora", // Tempo estimado de resposta
      };

      try {
        // Salvar resposta no banco de dados
        addResponse(responseData);
        console.log("Resposta salva no banco de dados:", responseData);

        // Simular um pequeno atraso para dar feedback visual
        setTimeout(() => {
          // Enviar a mensagem para o dono da mensagem original
          onReply(replyText);
          setReplyText("");
          setIsSending(false);
          // Mostrar o modal de sucesso com informações de ganhos
          setShowSuccessModal(true);
        }, 800);
      } catch (error) {
        console.error("Erro ao salvar resposta:", error);
        setIsSending(false);
      }
    } else {
      // Mostrar mensagem de erro se o campo estiver vazio
      if (onReply) {
        onReply(""); // Isso vai acionar a validação no componente pai
      }
    }
  };

  const handleChooseExpert = (expert) => {
    setSelectedExpert(expert);
    setShowConfirmModal(true);
  };

  const handleConfirmExpert = () => {
    setShowConfirmModal(false);
    setShowExpertResponse(true);
    if (onChooseExpert) {
      onChooseExpert(selectedExpert);
    }
  };

  const handleViewPaidResponse = (expert) => {
    setPaidExpert(expert);
    setProcessingPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      setShowPaidResponse(true);
    }, 800);
  };

  if (!isOpen || !request) return null;

  if (showSuccessModal) {
    return (
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        request={request}
        onViewRequest={() => {}}
        isMessageSent={true}
      />
    );
  }

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
                  Propostas Abertas
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

              {/* Reply section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Responder
                </h3>
                <Textarea
                  id="replyText"
                  placeholder="Digite sua resposta..."
                  className={`min-h-[120px] mb-1 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errorMessage ? "border-red-500" : ""}`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                {errorMessage && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Paperclip className="h-4 w-4 mr-1" /> Anexar
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                    onClick={handleSubmitReply}
                    disabled={isSending || !replyText.trim()}
                  >
                    {isSending ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" /> Enviar Mensagem
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Attachments section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-[#FF6B00]" /> Anexos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        screenshot.png
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG • 1.2 MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        documento.pdf
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF • 3.5 MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {request.auction && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" /> Propostas
                    em Andamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Proposta Atual
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {request.auction.currentBid} School Points
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
                        Número de Propostas
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {request.auction.bidCount}
                      </span>
                    </div>
                  </div>
                  {onBid && !request.isUserRequest && (
                    <Button
                      className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full md:w-auto"
                      onClick={onBid}
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Fazer Proposta
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="respostas" className="p-6 m-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Respostas dos Experts
                  </h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ml-2">
                    {request.responses?.length || 3} respostas disponíveis
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Escolha um expert para ver sua resposta completa. Após
                  escolher, você poderá interagir diretamente com o expert
                  através do chat privado.
                </p>

                {/* Expert responses list */}
                <div className="space-y-4">
                  {/* Expert 1 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between">
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
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />{" "}
                              Verificado
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" /> 4.9
                              (156 avaliações)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Respondeu há 1 hora
                            </span>
                          </div>
                        </div>
                      </div>
                      {request.isUserRequest ? (
                        <Button
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                          onClick={() =>
                            handleChooseExpert({
                              name: "Prof. Ricardo Oliveira",
                              avatar:
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
                              verified: true,
                              rating: "4.9",
                              ratingCount: "156",
                            })
                          }
                        >
                          Escolher Expert
                        </Button>
                      ) : (
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                          onClick={() =>
                            handleViewPaidResponse({
                              name: "Prof. Ricardo Oliveira",
                              avatar:
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
                              verified: true,
                              rating: "4.9",
                              ratingCount: "156",
                            })
                          }
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Processando...
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-1" /> Ver por 5 SP
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Resposta bloqueada
                      </p>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Resposta completa: 5 parágrafos
                      </span>
                    </div>
                  </div>

                  {/* Expert 2 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between">
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
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" /> 4.7
                              (89 avaliações)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Respondeu há 30
                              minutos
                            </span>
                          </div>
                        </div>
                      </div>
                      {request.isUserRequest ? (
                        <Button
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                          onClick={() =>
                            handleChooseExpert({
                              name: "Maria Oliveira",
                              avatar:
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
                              verified: false,
                              rating: "4.7",
                              ratingCount: "89",
                            })
                          }
                        >
                          Escolher Expert
                        </Button>
                      ) : (
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                          onClick={() =>
                            handleViewPaidResponse({
                              name: "Maria Oliveira",
                              avatar:
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
                              verified: false,
                              rating: "4.7",
                              ratingCount: "89",
                            })
                          }
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Processando...
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-1" /> Ver por 5 SP
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Resposta bloqueada
                      </p>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Resposta completa: 3 parágrafos + exemplo
                      </span>
                    </div>
                  </div>

                  {/* Expert 3 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between">
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
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />{" "}
                              Verificado
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" /> 4.8
                              (112 avaliações)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Respondeu há 2 horas
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                        onClick={() =>
                          handleViewPaidResponse({
                            name: "Carlos Santos",
                            avatar:
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
                            verified: true,
                            rating: "4.8",
                            ratingCount: "112",
                          })
                        }
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Processando...
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1" /> Ver por 5 SP
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Resposta bloqueada (paga)
                      </p>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Resposta completa: 4 parágrafos + código
                      </span>
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
                      <DollarSign className="h-5 w-5 text-blue-500" /> Status
                      das Propostas Abertas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Proposta Atual
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {request.auction.currentBid} School Points
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
                          Número de Propostas
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {request.auction.bidCount}
                        </span>
                      </div>
                    </div>
                    {onBid && !request.isUserRequest && (
                      <Button
                        className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full md:w-auto"
                        onClick={onBid}
                      >
                        <DollarSign className="h-4 w-4 mr-1" /> Fazer Proposta
                      </Button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Histórico de Propostas Abertas
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
                            25 School Points
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Proposta Atual
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
                            20 School Points
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
                            15 School Points
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

        {/* Confirmation Modal */}
        <ConfirmExpertModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmExpert}
          expert={selectedExpert}
        />

        {/* Expert Response Modal */}
        <ExpertResponseModal
          isOpen={showExpertResponse}
          onClose={() => {
            setShowExpertResponse(false);
            onClose(); // Close the parent modal when closing the response modal
          }}
          expert={selectedExpert}
          isPaid={false}
          requestId={request.id}
        />

        {/* Paid Response Modal */}
        <ExpertResponseModal
          isOpen={showPaidResponse}
          onClose={() => setShowPaidResponse(false)}
          expert={paidExpert}
          isPaid={true}
          requestId={request.id}
        />
      </motion.div>
    </div>
  );
};

export default RequestDetailModal;
