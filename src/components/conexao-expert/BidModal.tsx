import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  X,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidData: any) => void;
  request: {
    id: string;
    title: string;
    currentBid?: number;
    timeLeft?: string;
  };
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  request,
}) => {
  const [bidAmount, setBidAmount] = useState(
    request.currentBid ? request.currentBid + 5 : 20,
  );
  const [message, setMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("2");
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState(bidAmount + 20);
  const [error, setError] = useState<string | null>(null);

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setBidAmount(0);
      return;
    }
    setBidAmount(value);
    setError(null);
  };

  const handleMaxAutoBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setMaxAutoBid(0);
      return;
    }
    setMaxAutoBid(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate bid amount
    if (request.currentBid && bidAmount <= request.currentBid) {
      setError(
        `O lance deve ser maior que o lance atual (${request.currentBid} Ponto Coins)`,
      );
      return;
    }

    if (bidAmount < 5) {
      setError("O lance mínimo é de 5 Ponto Coins");
      return;
    }

    if (autoBidEnabled && maxAutoBid <= bidAmount) {
      setError("O lance máximo automático deve ser maior que o lance inicial");
      return;
    }

    onSubmit({
      bidAmount,
      message,
      estimatedTime,
      autoBidEnabled,
      maxAutoBid: autoBidEnabled ? maxAutoBid : null,
    });

    onClose();
  };

  if (!isOpen) return null;

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
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Fazer Lance</h2>
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
            <h3 className="font-medium text-[#29335C] dark:text-white mb-2 line-clamp-2">
              {request.title}
            </h3>
            {request.currentBid && (
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <DollarSign className="h-3 w-3 mr-1" /> Lance Atual:{" "}
                  {request.currentBid} Ponto Coins
                </Badge>
                {request.timeLeft && (
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    <Clock className="h-3 w-3 mr-1" /> Tempo Restante:{" "}
                    {request.timeLeft}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bidAmount" className="text-base font-medium">
                  Seu Lance (Ponto Coins) *
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        type="button"
                      >
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Este é o valor em Ponto Coins que você receberá ao
                        resolver a dúvida do aluno. Lances mais baixos têm mais
                        chances de serem escolhidos.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="bidAmount"
                  type="number"
                  min={5}
                  value={bidAmount}
                  onChange={handleBidAmountChange}
                  className={`pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${error ? "border-red-500" : ""}`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" /> {error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">
                Mensagem para o Aluno
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explique por que você é a melhor pessoa para responder a esta dúvida..."
                className="min-h-[100px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-base font-medium">
                Tempo Estimado para Resposta
              </Label>
              <select
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full rounded-md border border-[#FF6B00]/30 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              >
                <option value="1">Menos de 1 hora</option>
                <option value="2">1-2 horas</option>
                <option value="4">2-4 horas</option>
                <option value="8">4-8 horas</option>
                <option value="24">Até 24 horas</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Você pode ativar o lance automático para aumentar
                  automaticamente seu lance caso alguém ofereça um valor maior,
                  até um limite definido por você.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoBidEnabled"
                checked={autoBidEnabled}
                onCheckedChange={(checked) => setAutoBidEnabled(!!checked)}
                className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="autoBidEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ativar Lance Automático
                </label>
              </div>
            </div>

            {autoBidEnabled && (
              <div className="space-y-2">
                <Label htmlFor="maxAutoBid" className="text-base font-medium">
                  Lance Máximo Automático (Ponto Coins)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="maxAutoBid"
                    type="number"
                    min={bidAmount + 1}
                    value={maxAutoBid}
                    onChange={handleMaxAutoBidChange}
                    className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
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
                <DollarSign className="h-4 w-4 mr-1" /> Fazer Lance
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BidModal;
