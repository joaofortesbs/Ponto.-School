
import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Calendar, MessageCircle, TrendingUp, Clock, Hash } from "lucide-react";
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
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-14 w-14 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300"
          style={{ 
            backgroundColor: grupo.cor,
            boxShadow: `0 8px 20px -6px ${grupo.cor}80`
          }}
        >
          <span className="text-2xl">{grupo.icon || "📚"}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white/90 text-base">{grupo.nome}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {grupo.novoConteudo && (
                  <Badge className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 font-medium">NOVO</Badge>
                )}
                {grupo.tendencia === "alta" && (
                  <Badge className="bg-emerald-500 text-white text-xs flex items-center px-2 py-0.5 font-medium">
                    <TrendingUp className="h-3 w-3 mr-1" /> EM ALTA
                  </Badge>
                )}
              </div>
            </div>
            
            {onEntrar && (
              <Button
                onClick={() => onEntrar(grupo.id)}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                Entrar
              </Button>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{grupo.descricao}</p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
            <span className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5 text-[#FF6B00]/80" />
              {grupo.membros} membros
            </span>
            
            {grupo.disciplina && (
              <span className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-[#FF6B00]/80" />
                {grupo.disciplina}
              </span>
            )}
            
            {grupo.proximaReuniao && (
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#FF6B00]/80" />
                {grupo.proximaReuniao}
              </span>
            )}
            
            {grupo.dataCriacao && (
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-[#FF6B00]/80" />
                {new Date(grupo.dataCriacao).toLocaleDateString('pt-BR')}
              </span>
            )}
            
            {grupo.id && (
              <span className="flex items-center text-[#FF6B00]/80">
                <Hash className="h-3.5 w-3.5 mr-1" />
                {grupo.id.substring(0, 8)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GrupoEstudoCard;
