import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Users, Share2, ExternalLink } from "lucide-react";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  daysLeft?: number;
  status: "em-andamento" | "disponivel" | "concluido" | "encerrado";
  participants?: number;
  type: "individual" | "grupo" | "comunidade";
  difficulty: "iniciante" | "intermediario" | "avancado";
  category: string;
  rewards?: string[];
  featured?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  featured?: boolean;
  onClick: (challenge: Challenge) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  featured = false,
  onClick,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em-andamento":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Em Andamento
          </Badge>
        );
      case "disponivel":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Disponível
          </Badge>
        );
      case "concluido":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
            Concluído
          </Badge>
        );
      case "encerrado":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            Encerrado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-600 dark:text-green-400"
          >
            Iniciante
          </Badge>
        );
      case "intermediario":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-600 dark:text-blue-400"
          >
            Intermediário
          </Badge>
        );
      case "avancado":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-600 dark:text-red-400"
          >
            Avançado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "individual":
        return (
          <Badge
            variant="outline"
            className="border-[#FF6B00] text-[#FF6B00] dark:text-[#FF8C40]"
          >
            Individual
          </Badge>
        );
      case "grupo":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-600 dark:text-purple-400"
          >
            Em Grupo
          </Badge>
        );
      case "comunidade":
        return (
          <Badge
            variant="outline"
            className="border-teal-500 text-teal-600 dark:text-teal-400"
          >
            Comunidade
          </Badge>
        );
      default:
        return null;
    }
  };

  if (featured) {
    return (
      <div
        className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer group"
        onClick={() => onClick(challenge)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/60"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            {getStatusBadge(challenge.status)}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2">
              {getDifficultyBadge(challenge.difficulty)}
              {getTypeBadge(challenge.type)}
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {challenge.description}
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso
              </span>
              <span className="text-sm font-bold text-[#FF6B00]">
                {challenge.progress}%
              </span>
            </div>
            <Progress
              value={challenge.progress}
              className="h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {challenge.completedTasks}/{challenge.totalTasks} tarefas
              </span>
              {challenge.daysLeft !== undefined && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />
                  {challenge.daysLeft > 0
                    ? `${challenge.daysLeft} dias restantes`
                    : "Último dia"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {challenge.participants && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Users className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                {challenge.participants} participantes
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-medium rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                }}
              >
                <Share2 className="h-3.5 w-3.5 mr-1" /> Compartilhar
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                {challenge.status === "em-andamento"
                  ? "Continuar"
                  : challenge.status === "disponivel"
                    ? "Participar"
                    : "Ver Detalhes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-2px] cursor-pointer group"
      onClick={() => onClick(challenge)}
    >
      <div className="flex h-full">
        <div className="w-1/3 relative overflow-hidden">
          <img
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-black/30 dark:to-black/50"></div>
        </div>
        <div className="w-2/3 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                {challenge.title}
              </h3>
              {getStatusBadge(challenge.status)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {getDifficultyBadge(challenge.difficulty)}
              {getTypeBadge(challenge.type)}
              <Badge
                variant="outline"
                className="border-gray-300 text-gray-600 dark:text-gray-300"
              >
                {challenge.category}
              </Badge>
            </div>
          </div>

          <div>
            {challenge.status === "em-andamento" && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Progresso
                  </span>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    {challenge.progress}%
                  </span>
                </div>
                <Progress
                  value={challenge.progress}
                  className="h-1.5 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                {challenge.status === "em-andamento" &&
                  challenge.daysLeft !== undefined && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />
                      {challenge.daysLeft > 0
                        ? `${challenge.daysLeft} dias restantes`
                        : "Último dia"}
                    </span>
                  )}
                {challenge.participants && (
                  <span className="flex items-center ml-3">
                    <Users className="h-3 w-3 mr-1 text-[#FF6B00]" />
                    {challenge.participants} participantes
                  </span>
                )}
              </div>

              <Button
                size="sm"
                className="h-7 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                {challenge.status === "em-andamento"
                  ? "Continuar"
                  : challenge.status === "disponivel"
                    ? "Participar"
                    : "Ver Detalhes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
