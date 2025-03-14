import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Eye,
  ThumbsUp,
  Bookmark,
  Atom,
  Calculator,
  Beaker,
  Dna,
  BookText,
  Lightbulb,
  Zap,
  Users,
  Lock,
} from "lucide-react";

interface HelpRequestCardProps {
  request: {
    id: string;
    title: string;
    subject: string;
    subjectIcon?: string;
    description: string;
    user: {
      name: string;
      avatar: string;
    };
    time: string;
    responses: number;
    views: number;
    status: "aberto" | "em_leilao" | "respondido" | "resolvido";
    urgency?: boolean;
    difficulty?: "básico" | "intermediário" | "avançado";
    auction?: {
      currentBid: number;
      timeLeft: string;
      bidCount: number;
    };
    tags?: string[];
  };
  onClick: () => void;
  onBid?: () => void;
}

const HelpRequestCard: React.FC<HelpRequestCardProps> = ({
  request,
  onClick,
  onBid,
}) => {
  // Function to get subject icon
  const getSubjectIcon = () => {
    switch (request.subject.toLowerCase()) {
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
    switch (request.status) {
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

  // Function to get difficulty badge
  const getDifficultyBadge = () => {
    if (!request.difficulty) return null;

    const colors = {
      básico:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      intermediário:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      avançado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <Badge className={colors[request.difficulty]}>{request.difficulty}</Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)" }}
      className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E0E1DD] dark:border-[#29335C]/30 p-4 hover:border-[#FF6B00]/30 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
            {getSubjectIcon()}
          </div>
          <div>
            <h3 className="font-medium text-[#29335C] dark:text-white pr-16">
              {request.title}
              {request.urgency && (
                <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle className="h-3 w-3 mr-1" /> Urgente
                </Badge>
              )}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <Badge variant="outline">{request.subject}</Badge>
              {getDifficultyBadge()}
              <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center">
                <Avatar className="h-4 w-4 mr-1">
                  <AvatarImage src={request.user.avatar} />
                  <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {request.user.name}
              </span>
              <span className="text-xs text-[#64748B] dark:text-white/60">
                •
              </span>
              <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {request.time}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getStatusBadge()}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mt-2 text-gray-400 hover:text-[#FF6B00] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bookmark functionality
            }}
          >
            <Bookmark className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {request.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
          {request.description}
        </p>
      )}

      {request.tags && request.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
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
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {request.auction.currentBid} Ponto Coins
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Clock className="h-3 w-3" />
              <span>{request.auction.timeLeft}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs">
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Users className="h-3 w-3" />
              <span>{request.auction.bidCount} experts participando</span>
            </div>
            {Math.random() > 0.5 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <DollarSign className="h-3 w-3" />
                <span>
                  Seu lance: {Math.floor(request.auction.currentBid * 1.2)} PC
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-white/60">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-[#FF6B00]" />
            <span>
              {request.responses}{" "}
              {request.responses === 1 ? "resposta" : "respostas"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-[#FF6B00]" />
            <span>{request.views} visualizações</span>
          </div>
        </div>

        <div className="flex gap-2">
          {request.status === "em_leilao" && onBid && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onBid();
              }}
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" /> Fazer Lance
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Ver Pedido
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpRequestCard;
