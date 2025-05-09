
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, TrendingUp, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GrupoEstudo {
  id: number;
  nome: string;
  icon: string;
  cor: string;
  grupos: number;
  tendencia: string;
  novoConteudo: boolean;
}

interface GradeGruposEstudoProps {
  selectedTopic: number | null;
  topicosEstudo: GrupoEstudo[];
}

const GradeGruposEstudo: React.FC<GradeGruposEstudoProps> = ({ 
  selectedTopic, 
  topicosEstudo 
}) => {
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Filtrar grupos baseado no tópico selecionado e busca
  const gruposFiltrados = topicosEstudo.filter(
    (grupo) => {
      const matchesSearch = grupo.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !selectedFilter || 
        (selectedFilter === "tendencia-alta" && grupo.tendencia === "alta") ||
        (selectedFilter === "novo-conteudo" && grupo.novoConteudo);
      const matchesSelectedTopic = !selectedTopic || grupo.id === selectedTopic;
      return matchesSearch && matchesFilter && matchesSelectedTopic;
    }
  );

  // Detectar grupos em destaque (com tendência alta e novo conteúdo)
  const isGrupoFeatured = (grupo: GrupoEstudo) => {
    return grupo.tendencia === "alta" && grupo.novoConteudo;
  };

  return (
    <div className="mt-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {gruposFiltrados.map((grupo) => (
          <motion.div 
            key={grupo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: grupo.id * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 dark:from-gray-800 dark:to-gray-900 
              backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 
              ${isGrupoFeatured(grupo) ? 'featured-topic ring-1 ring-[#FF6B00]/30' : ''}`}
            onMouseEnter={() => setHoveredTopic(grupo.id)}
            onMouseLeave={() => setHoveredTopic(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300" 
                    style={{ 
                      backgroundColor: grupo.cor,
                      boxShadow: hoveredTopic === grupo.id ? `0 0 20px ${grupo.cor}80` : 'none',
                    }}>
                    <span className="text-xl">{grupo.icon}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white/90">{grupo.nome}</h3>
                    {grupo.novoConteudo && (
                      <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 h-4">
                        NOVO
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <Users className="h-3 w-3" />
                      <span>{grupo.grupos} grupos</span>
                    </div>
                    {grupo.tendencia === "alta" && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        <span>Em alta</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-white/70 hover:text-white hover:bg-white/10">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            
          </motion.div>
        ))}

        {gruposFiltrados.length === 0 && (
          <div className="col-span-3 text-center py-8 bg-black/20 rounded-xl border border-white/5">
            <MessageCircle className="h-10 w-10 mx-auto text-white/30 mb-2" />
            <h3 className="text-white/80 text-lg font-medium">Nenhum grupo encontrado</h3>
            <p className="text-white/50 mt-1">Tente outro filtro ou selecione um tópico diferente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeGruposEstudo;
