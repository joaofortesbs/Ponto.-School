
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
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/5 to-[#FF8C40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="flex items-start gap-3 relative z-10">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-all duration-300"
          style={{ backgroundColor: grupo.cor }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-300"></div>
          <span className="text-xl relative z-10">{grupo.icon || "📚"}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{grupo.nome}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {grupo.novoConteudo && (
                  <Badge className="bg-[#FF6B00] text-white text-xs">NOVO</Badge>
                )}
                {grupo.tendencia === "alta" && (
                  <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> EM ALTA
                  </Badge>
                )}
              </div>
            </div>
            
            {onEntrar && (
              <Button
                onClick={() => onEntrar(grupo.id)}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-sm rounded-lg shadow-lg transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-105"
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
