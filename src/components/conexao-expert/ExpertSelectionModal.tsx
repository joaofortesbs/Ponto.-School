import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  X,
  MessageCircle,
  Clock,
  CheckCircle,
  Star,
  DollarSign,
  Send,
  ThumbsUp,
  Flag,
  Copy,
  Languages,
  Share2,
  Trash2,
  Info,
} from "lucide-react";

interface ExpertSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: any;
  request: any;
  onConfirm: (expert: any) => void;
  isUserRequest?: boolean;
}

const ExpertSelectionModal: React.FC<ExpertSelectionModalProps> = ({
  isOpen,
  onClose,
  expert,
  request,
  onConfirm,
  isUserRequest = true,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen) return null;

  // Success modal after sending a message
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Mensagem Enviada com Sucesso!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sua mensagem foi enviada para o aluno. Você receberá uma
                notificação quando houver uma resposta.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 w-full mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Informações de Ganhos
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 text-left">
                  Você receberá <span className="font-bold">85%</span> do valor
                  caso o aluno escolha você como expert para esta resposta.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                Entendi
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // If we're showing the confirmation dialog
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirmar Escolha
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Você escolheu{" "}
                <span className="font-semibold">{expert.name}</span> para
                responder ao seu pedido.
                {request.auction && (
                  <span>
                    {" "}
                    Se quiser escolher outro expert depois para comparar as
                    respostas, terá que enviar mais um valor de School Points
                    para ver mais respostas.
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  onConfirm(expert);
                }}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // If we're showing the expert's response and chat
  if (showResponse) {
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
              <div>
                <h2 className="text-xl font-bold text-white truncate max-w-[500px]">
                  Resposta de {expert.name}
                </h2>
                <div className="flex items-center gap-1">
                  <Badge className="bg-white/20 text-white text-xs">
                    {request.subject}
                  </Badge>
                  <span className="text-xs text-white/80">{request.title}</span>
                </div>
              </div>
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Avatar className="h-12 w-12 border-2 border-[#FF6B00]/20">
                <AvatarImage src={expert.avatar} />
                <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#29335C] dark:text-white text-lg">
                    {expert.name}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verificado
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    <span>4.9 ({expert.completedRequests} avaliações)</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span>Respondeu há 1 hora</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Resposta Completa
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                  nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl
                  eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam
                  nisl nunc quis nisl.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                  nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl
                  eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam
                  nisl nunc quis nisl.
                </p>
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-300">
                    <code>
                      {`function exemplo() {
  const x = 10;
  const y = 20;
  return x + y;
}`}
                    </code>
                  </pre>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                  nunc, quis aliquam nisl nunc quis nisl.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center gap-1"
                >
                  <Languages className="h-3.5 w-3.5" /> Traduzir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center gap-1"
                >
                  <Share2 className="h-3.5 w-3.5" /> Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Deletar
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Chat Privado
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 h-64 mb-4 p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={expert.avatar} />
                      <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                      <p>
                        Olá! Estou à disposição para esclarecer qualquer dúvida
                        adicional sobre a resposta que forneci.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 max-w-[80%] self-end">
                    <div className="bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                      <p>Obrigado pela resposta! Ficou muito claro.</p>
                    </div>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/images/tempo-image-20250305T080643776Z.png" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={() => {
                    if (message.trim()) {
                      setShowSuccessModal(true);
                      setMessage("");
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm"
                >
                  <Flag className="h-4 w-4 mr-1" /> Denunciar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
                >
                  Preciso de Mais Ajuda
                </Button>
                <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-sm">
                  <ThumbsUp className="h-4 w-4 mr-1" /> Marcar como Resolvido
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Initial expert selection modal
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Escolher Expert</h2>
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
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-[#FF6B00]/20">
              <AvatarImage src={expert.avatar} />
              <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {expert.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                    {expert.rating}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {expert.completedRequests} pedidos resolvidos
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {expert.specialties?.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-blue-800 dark:text-blue-300">
                Detalhes do Lance
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Valor
                </p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {expert.bidAmount || request.auction?.currentBid || 25} School
                  Points
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tempo de Resposta
                </p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {expert.responseTime}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Prévia da Resposta
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              Este expert forneceu uma resposta detalhada para sua dúvida. Ao
              escolher este expert, você terá acesso à resposta completa e
              poderá interagir diretamente através do chat privado.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Cancelar
            </Button>
            {isUserRequest ? (
              <Button
                onClick={() => setShowConfirmation(true)}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                Escolher Expert
              </Button>
            ) : (
              <Button
                onClick={() => setShowResponse(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Ver por 5 PC
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertSelectionModal;
