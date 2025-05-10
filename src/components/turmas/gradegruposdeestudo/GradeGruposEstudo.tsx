import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Clock, Globe, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { obterGruposDoStorage } from "@/lib/gruposEstudoStorage";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Grupo {
  id: string;
  nome: string;
  disciplina: string;
  descricao: string;
  membros?: number;
  data_inicio?: string;
  privacidade?: string;
  tags?: string[];
}

interface GradeGruposEstudoProps {
  onGrupoClick: (grupo: Grupo) => void;
}

export default function GradeGruposEstudo({ onGrupoClick }: GradeGruposEstudoProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    const gruposLocalStorage = obterGruposDoStorage();
    setGrupos(gruposLocalStorage);
    console.log("Grupos obtidos do sistema de armazenamento:", gruposLocalStorage);
  }, []);

  const getPrivacyIcon = (privacidade: string) => {
    switch (privacidade?.toLowerCase()) {
      case "privado":
        return <Lock className="h-3.5 w-3.5 text-[#FF6B00]" />;
      case "restrito":
        return <Users className="h-3.5 w-3.5 text-[#FF6B00]" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-[#FF6B00]" />;
    }
  };

  const formatPrivacidade = (privacidade: string) => {
    if (!privacidade) return "Público";

    if (privacidade.includes("Público")) return "Público";
    if (privacidade.includes("Privado")) return "Privado";
    if (privacidade.includes("Restrito")) return "Restrito";

    return privacidade;
  };

  // Função para criar um ícone para a disciplina
  const getDisciplinaIcon = (disciplina: string) => {
    switch (disciplina?.toLowerCase()) {
      case "matemática":
        return "M";
      case "física":
        return "F";
      case "química":
        return "Q";
      case "biologia":
        return "B";
      case "história":
        return "H";
      case "geografia":
        return "G";
      case "inglês":
        return "I";
      case "português":
        return "P";
      default:
        return disciplina?.charAt(0) || "?";
    }
  };

  // Gera uma imagem de avatar aleatória para cada grupo
  const getAvatarUrl = (id: string, index: number) => {
    const seeds = ["Ana", "Pedro", "Maria", "João", "Sofia", "Lucas", "Camila", "Rafael"];
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seeds[index % seeds.length]}_${id}`;
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4">Grupos de Estudo</h2>

      {grupos.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Nenhum grupo de estudos
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Você ainda não possui grupos de estudo. Crie um novo grupo para começar a estudar com seus colegas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo, index) => (
            <motion.div
              key={grupo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer h-full"
              onClick={() => onGrupoClick(grupo)}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                      {grupo.nome}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                        {grupo.disciplina || "Geral"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {getPrivacyIcon(grupo.privacidade || "")}
                        <span>{formatPrivacidade(grupo.privacidade || "")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow">
                  {grupo.descricao || "Sem descrição disponível para este grupo de estudos."}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {grupo.tags && grupo.tags.length > 0 ? (
                    grupo.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      estudo
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span>{grupo.membros || 1} membros</span>
                  </div>

                  {grupo.data_inicio && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                      <span>{grupo.data_inicio}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGrupoClick(grupo);
                    }}
                  >
                    Acessar Grupo
                  </Button>

                  <Button
                    variant="outline"
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Futura implementação do chat
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}