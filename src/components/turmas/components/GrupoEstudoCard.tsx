
import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GrupoEstudoCardProps {
  grupo: {
    id: string;
    nome: string;
    descricao?: string;
    membros: number;
    topico?: string;
    disciplina?: string;
    cor: string;
    icon?: string;
    dataCriacao?: string;
    tendencia?: string;
    novoConteudo?: boolean;
    proximaReuniao?: string;
  };
  onEntrar?: (id: string) => void;
}

const GrupoEstudoCard: React.FC<GrupoEstudoCardProps> = ({ grupo, onEntrar }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10 hover:border-[#3B82F6]/30 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: grupo.cor }}
        >
          <span className="text-xl">{grupo.icon || "📚"}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{grupo.nome}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {grupo.novoConteudo && (
                  <Badge className="bg-[#3B82F6] text-white text-xs">NOVO</Badge>
                )}
                {grupo.tendencia === "alta" && (
                  <Badge className="bg-emerald-500 text-white text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> EM ALTA
                  </Badge>
                )}
              </div>
            </div>
            
            {onEntrar && (
              <Button
                onClick={() => onEntrar(grupo.id)}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm rounded-lg"
                size="sm"
              >
                Entrar
              </Button>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{grupo.descricao}</p>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {grupo.membros} membros
            </span>
            
            {grupo.disciplina && (
              <span className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                {grupo.disciplina}
              </span>
            )}
            
            {grupo.proximaReuniao && (
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {grupo.proximaReuniao}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GrupoEstudoCard;
