import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  MessageCircle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";

interface MyBidsSectionProps {
  userBids: any[];
  onViewRequest: (request: any) => void;
  onViewAllBids: () => void;
}

const MyBidsSection: React.FC<MyBidsSectionProps> = ({
  userBids,
  onViewRequest,
  onViewAllBids,
}) => {
  // Always show the empty state for demonstration purposes
  if (true) {
    return (
      <div className="mt-8 bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#FF6B00]" /> Meus Lances
          </h2>
          <Button
            variant="link"
            className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
            onClick={onViewAllBids}
          >
            Ver Todos <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-[#1E293B]/5 dark:bg-[#1E293B]/20 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Você ainda não fez lances
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            Faça lances em pedidos de ajuda para aparecerem nesta seção.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20 p-4 max-w-md mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">
                Como funcionam os lances?
              </h4>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Ao fazer um lance em um pedido de ajuda, você está oferecendo seus
              conhecimentos para resolver a dúvida do usuário.
            </p>
            <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Ofereça um valor em Ponto
                Coins
              </li>
              <li className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Indique seu tempo de resposta
              </li>
              <li className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> Ganhe pontos e
                reputação ao ter seu lance aceito
              </li>
            </ul>
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            onClick={onViewAllBids}
          >
            <DollarSign className="h-4 w-4 mr-1" /> Ver Pedidos em Leilão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#FF6B00]" /> Meus Lances
        </h2>
        <Button
          variant="link"
          className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
          onClick={onViewAllBids}
        >
          Ver Todos <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {userBids.slice(0, 3).map((bid) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)",
            }}
            className="bg-[#1E293B]/5 dark:bg-[#1E293B]/20 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 p-4 hover:border-[#FF6B00]/30 transition-all duration-300 cursor-pointer"
            onClick={() => onViewRequest(bid.request)}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    {bid.request.title}
                  </h3>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{bid.request.subject}</Badge>
                    <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {bid.date}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                      <User className="h-3 w-3" /> {bid.request.user.name}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {bid.request.status === "em_leilao" ? (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <DollarSign className="h-3 w-3 mr-1" /> Em Leilão
                  </Badge>
                ) : bid.request.status === "respondido" ? (
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    <MessageCircle className="h-3 w-3 mr-1" /> Respondido
                  </Badge>
                ) : bid.request.status === "resolvido" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" /> Resolvido
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Clock className="h-3 w-3 mr-1" /> Aberto
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    Seu lance: {bid.bidAmount} Ponto Coins
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <Clock className="h-3 w-3" />
                  <span>Tempo de resposta: {bid.responseTime}</span>
                </div>
              </div>
              {bid.status === "highest" ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Seu lance é o mais alto no momento</span>
                </div>
              ) : bid.status === "outbid" ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Seu lance foi superado</span>
                </div>
              ) : bid.status === "accepted" ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Seu lance foi aceito!</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-white/60">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-[#FF6B00]" />
                  <span>
                    {bid.request.responses}{" "}
                    {bid.request.responses === 1 ? "resposta" : "respostas"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-[#FF6B00]" />
                  <span>{bid.request.views} visualizações</span>
                </div>
              </div>

              <Button
                size="sm"
                className="h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRequest(bid.request);
                }}
              >
                Ver Detalhes
              </Button>
            </div>
          </motion.div>
        ))}

        {userBids.length > 3 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              onClick={onViewAllBids}
            >
              Ver Todos os Lances ({userBids.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBidsSection;
