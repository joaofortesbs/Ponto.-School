
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {selectedTopic 
            ? `Grupos de ${topicosEstudo.find(t => t.id === selectedTopic)?.nome || 'Estudo'}`
            : 'Todos os Grupos de Estudo'}
        </h3>
        
        {/* Barra de pesquisa sofisticada */}
        <div className="relative flex group max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar por grupos ou temas específicos..."
            className="pl-10 pr-20 py-2 bg-black/30 border border-white/5 hover:border-white/10 focus:border-[#FF6B00]/50 focus:ring-[#FF6B00]/10 h-10 rounded-lg w-full text-white shadow-inner text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md bg-black/30 hover:bg-[#FF6B00]/20 text-white/70 hover:text-white"
              onClick={() => setSelectedFilter(selectedFilter === "tendencia-alta" ? null : "tendencia-alta")}
            >
              <TrendingUp className={`h-4 w-4 ${selectedFilter === "tendencia-alta" ? "text-[#FF6B00]" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md bg-black/30 hover:bg-[#FF6B00]/20 text-white/70 hover:text-white"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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

            {hoveredTopic === grupo.id && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs h-7 rounded-lg">
                    <Users className="h-3 w-3 mr-1" /> Entrar
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs h-7 rounded-lg">
                    <BookOpen className="h-3 w-3 mr-1" /> Detalhes
                  </Button>
                </div>
              </motion.div>
            )}
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
