import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Flag,
  Image,
  Info,
  Lock,
  MessageCircle,
  Paperclip,
  Star,
  X,
  ThumbsUp,
  ThumbsDown,
  Send,
  AlertCircle,
} from "lucide-react";

interface ExpertResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: any;
  isPaid?: boolean;
  requestId?: string;
}

const ExpertResponseModal: React.FC<ExpertResponseModalProps> = ({
  isOpen,
  onClose,
  expert,
  isPaid = false,
  requestId,
}) => {
  const [isResolved, setIsResolved] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleMarkAsResolved = () => {
    setIsResolved(true);
    // In a real app, you would send this to your backend
    console.log("Marked as resolved");
  };

  const handleSubmitRating = () => {
    // In a real app, you would send this to your backend
    console.log("Rating submitted:", { rating, comment: ratingComment });
    setRatingSubmitted(true);
    setShowRatingModal(false);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      setErrorMessage("Por favor, digite uma mensagem antes de enviar.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    // Simular envio da mensagem para o expert
    setTimeout(() => {
      console.log("Mensagem enviada para o expert:", {
        expertId: expert.id || "expert-id",
        requestId: requestId || "request-id",
        message,
        timestamp: new Date().toISOString(),
      });

      setMessage("");
      setIsSending(false);
      // Mostrar feedback de sucesso
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    }, 800);
  };

  const handleFeedback = (isPositive: boolean) => {
    // Registrar feedback no banco de dados
    console.log("Feedback registrado:", {
      expertId: expert.id || "expert-id",
      requestId: requestId || "request-id",
      isPositive,
      timestamp: new Date().toISOString(),
    });

    // Mostrar feedback de sucesso
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  // Rating modal
  const RatingModal = () => (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#29335C] dark:text-white">
            Avaliar Expert
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowRatingModal(false)}
            className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12 border border-[#FF6B00]/20">
              <AvatarImage
                src={
                  expert?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert?.name}`
                }
              />
              <AvatarFallback>{expert?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-[#29335C] dark:text-white">
                {expert?.name}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avaliação
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comentário (opcional)
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] min-h-[100px]"
              placeholder="Deixe um comentário sobre sua experiência com este expert..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
            onClick={() => setShowRatingModal(false)}
          >
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            onClick={handleSubmitRating}
          >
            Enviar Avaliação
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white truncate max-w-[500px]">
              Resposta de {expert?.name || "Expert"}
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

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12 border border-[#FF6B00]/20">
              <AvatarImage
                src={
                  expert?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert?.name}`
                }
              />
              <AvatarFallback>{expert?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#29335C] dark:text-white">
                  {expert?.name}
                </span>
                {expert?.verified && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verificado
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />{" "}
                  {expert?.rating || "4.8"}({expert?.ratingCount || "120"}{" "}
                  avaliações)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Respondeu há 1 hora
                </span>
              </div>
            </div>
          </div>

          {isResolved && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700 dark:text-green-300 font-medium">
                Você marcou esta resposta como resolvida
              </p>
              {ratingSubmitted && (
                <Badge className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />{" "}
                  Avaliado
                </Badge>
              )}
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none mb-6">
            <h4 className="text-lg font-bold text-[#29335C] dark:text-white mb-3">
              Resposta Completa
            </h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
              dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed
              auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
            </p>
            <p>
              Ut in nulla enim. Phasellus molestie magna non est bibendum non
              venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.
              Mauris iaculis porttitor posuere.
            </p>
            <p>
              Praesent id metus massa, ut blandit odio. Proin quis tortor orci.
              Etiam at risus et justo dignissim congue. Donec congue lacinia
              dui, a porttitor lectus condimentum laoreet.
            </p>

            {/* Código de exemplo */}
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">
                {`function exemplo() {
  const x = 10;
  const y = 20;
  return x + y;
}`}
              </code>
            </pre>

            <p>
              Nulla facilisi. Duis aliquet egestas purus in blandit. Curabitur
              vulputate, ligula lacinia scelerisque tempor, lacus lacus ornare
              ante, ac egestas est urna sit amet arcu.
            </p>
          </div>

          {/* Anexos */}
          <div className="mt-6">
            <h5 className="text-md font-bold text-[#29335C] dark:text-white mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-[#FF6B00]" /> Anexos
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    imagem_exemplo.png
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
                    documento_solucao.pdf
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF • 2.5 MB
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

          {/* Avaliação da resposta */}
          <div className="mb-6 mt-6">
            <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-3">
              Avalie esta resposta
            </h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => handleFeedback(true)}
              >
                <ThumbsUp className="h-4 w-4" /> Útil
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleFeedback(false)}
              >
                <ThumbsDown className="h-4 w-4" /> Não Útil
              </Button>
            </div>
            {feedbackSent && (
              <p className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Feedback enviado com
                sucesso!
              </p>
            )}
          </div>

          {/* Enviar mensagem */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-bold text-[#29335C] dark:text-white mb-3">
              Enviar mensagem para {expert.name.split(" ")[0]}
            </h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                className="min-h-[80px] border-gray-300 dark:border-gray-600 focus:ring-[#FF6B00] dark:bg-gray-700 dark:text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {errorMessage && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={handleSendMessage}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" /> Enviar
                    </>
                  )}
                </Button>
              </div>
              {feedbackSent && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Mensagem enviada com
                  sucesso!
                </p>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          {!isPaid && (
            <div className="mt-6 flex flex-wrap gap-3">
              {!isResolved ? (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleMarkAsResolved}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Marcar como Resolvido
                </Button>
              ) : (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setShowRatingModal(true)}
                  disabled={ratingSubmitted}
                >
                  <Star className="h-4 w-4 mr-1" />{" "}
                  {ratingSubmitted ? "Avaliado" : "Avaliar Expert"}
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ml-auto"
              >
                <Flag className="h-4 w-4 mr-1" /> Denunciar
              </Button>
            </div>
          )}

          {/* Nota para visualizações pagas */}
          {isPaid && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
              Você desbloqueou esta resposta por 5 School Points. Para escolher
              este expert e iniciar um chat, você precisará criar um novo
              pedido.
            </div>
          )}
        </div>
      </div>

      {showRatingModal && <RatingModal />}
    </div>
  );
};

export default ExpertResponseModal;
