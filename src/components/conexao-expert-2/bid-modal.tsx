import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, DollarSign, Clock, MessageCircle, Info } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidData: any) => void;
  request: any;
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  request,
}) => {
  const [bidAmount, setBidAmount] = useState(
    request?.auction?.currentBid || 20,
  );
  const [message, setMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      requestId: request.id,
      amount: bidAmount,
      message,
      estimatedTime,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-montserrat">
              Fazer Proposta
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2 line-clamp-2">
              {request?.title}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
              {request?.description}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount" className="text-base font-medium">
                Valor da Proposta (School Points)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="bidAmount"
                  type="number"
                  min={5}
                  value={bidAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 5) {
                      setBidAmount(value);
                    }
                  }}
                  className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-base font-medium">
                Tempo Estimado para Resposta
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <select
                  id="estimatedTime"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full pl-9 h-10 rounded-md border border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 bg-transparent text-sm"
                >
                  <option value="1">1 hora</option>
                  <option value="2">2 horas</option>
                  <option value="4">4 horas</option>
                  <option value="8">8 horas</option>
                  <option value="24">24 horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">
                Mensagem ao Estudante
              </Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explique como você pode ajudar com esta dúvida..."
                  className="pl-9 min-h-[120px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Ao enviar sua proposta, você se compromete a responder à
                  dúvida do estudante dentro do prazo estimado.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                Enviar Proposta
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
