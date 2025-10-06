import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MessageCircle, Calendar, Bell } from "lucide-react";
import FavoriteStar from "./FavoriteStar";
import NotificationIndicator from "./NotificationIndicator";

interface TurmaCardProps {
  turma: {
    id: string;
    nome: string;
    professor: string;
    imagem: string;
    progresso: number;
    proximaAula: {
      titulo: string;
      data: string;
      hora: string;
      prazoProximo: boolean;
    };
    status: string;
    novasMensagens: number;
    disciplina: string;
    icone: React.ReactNode;
    categoria: string;
    isFavorite?: boolean;
    notificacoes?: {
      mensagens: number;
      tarefas: number;
      materiais: number;
    };
  };
  onClick: (id: string) => void;
  onViewForum: (e: React.MouseEvent, id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const TurmaCard: React.FC<TurmaCardProps> = ({
  turma,
  onClick,
  onViewForum,
  onToggleFavorite = () => {},
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer h-full"
      onClick={() => onClick(turma.id)}
    >
      <div className="flex flex-col h-full">
        <div className="relative h-40 overflow-hidden">
          <img
            src={turma.imagem}
            alt={turma.nome}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-2 right-2">
            <FavoriteStar
              isFavorite={turma.isFavorite || false}
              onToggle={() => onToggleFavorite(turma.id)}
              className="bg-black/30 hover:bg-black/50 backdrop-blur-sm p-1.5 rounded-full"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              {turma.icone}
              <h3 className="text-xl font-bold text-white font-montserrat">
                {turma.nome}
              </h3>
            </div>
            <p className="text-sm text-gray-200 font-open-sans">
              {turma.professor}
            </p>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-montserrat">
                  Progresso
                </span>
                <span className="text-sm font-bold text-[#FF6B00] font-montserrat">
                  {turma.progresso}%
                </span>
              </div>
              <Progress
                value={turma.progresso}
                className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
              />
              <span className="text-xs text-[#FF6B00] font-medium text-right mt-1">
                {turma.progresso}% Completo
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                <span
                  className={
                    turma.proximaAula.prazoProximo
                      ? "text-red-500 dark:text-red-400 font-medium"
                      : ""
                  }
                >
                  {turma.proximaAula.titulo}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-5 mt-1">
                <Calendar className="h-3 w-3 text-[#FF6B00]" />
                <span
                  className={
                    turma.proximaAula.prazoProximo
                      ? "text-red-500 dark:text-red-400 font-medium"
                      : ""
                  }
                >
                  {turma.proximaAula.data}, {turma.proximaAula.hora}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                  Status: {turma.status}
                </Badge>

                <div className="flex items-center gap-1.5">
                  {turma.notificacoes && turma.notificacoes.mensagens > 0 && (
                    <div className="flex items-center">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-500 mr-0.5" />
                      <NotificationIndicator
                        count={turma.notificacoes.mensagens}
                        type="message"
                      />
                    </div>
                  )}

                  {turma.notificacoes && turma.notificacoes.tarefas > 0 && (
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-0.5" />
                      <NotificationIndicator
                        count={turma.notificacoes.tarefas}
                        type="task"
                      />
                    </div>
                  )}

                  {turma.notificacoes && turma.notificacoes.materiais > 0 && (
                    <div className="flex items-center">
                      <Bell className="h-3.5 w-3.5 text-green-500 mr-0.5" />
                      <NotificationIndicator
                        count={turma.notificacoes.materiais}
                        type="material"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onClick(turma.id);
              }}
            >
              Acessar Turma
            </Button>

            <Button
              variant="outline"
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewForum(e, turma.id);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Fórum
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TurmaCard;
