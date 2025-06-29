import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, MessageCircle, Lock, Globe, LogOut } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    nome: string;
    disciplina: string;
    descricao: string;
    membros: number;
    proximaReuniao?: string;
    tags: string[];
    privacidade: string;
    icone: React.ReactNode;
  };
  onClick: () => void;
  view?: string;
  onLeave?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick, view, onLeave }) => {
  const getPrivacyIcon = () => {
    switch (group.privacidade) {
      case "publico":
        return <Globe className="h-3.5 w-3.5 text-[#FF6B00]" />;
      case "restrito":
        return <Users className="h-3.5 w-3.5 text-[#FF6B00]" />;
      case "privado":
        return <Lock className="h-3.5 w-3.5 text-[#FF6B00]" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-[#FF6B00]" />;
    }
  };

  const getPrivacyText = () => {
    switch (group.privacidade) {
      case "publico":
        return "Público";
      case "restrito":
        return "Restrito";
      case "privado":
        return "Privado";
      default:
        return "Público";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
            {group.icone}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
              {group.nome}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                {group.disciplina}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {getPrivacyIcon()}
                <span>{getPrivacyText()}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow">
          {group.descricao}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {group.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
            <span>{group.membros} membros</span>
          </div>

          {group.proximaReuniao && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
              <span>{group.proximaReuniao}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {view === "todos-grupos" ? "Entrar no Grupo" : "Acessar Grupo"}
          </Button>

          {onLeave && (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 font-montserrat text-xs px-3"
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
            >
              Sair
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;