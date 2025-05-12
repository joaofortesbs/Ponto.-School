import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, UserPlus, GraduationCap, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";

interface GruposEstudoInterfaceProps {
  className?: string;
}

interface GrupoEstudo {
  id: string;
  nome: string;
  descricao: string;
  materia: string;
  membros: number;
  proximoEncontro?: string;
  imagem?: string;
  isPublico: boolean;
  criador: string;
  tags: string[];
}

const GrupoEstudoCard = ({ 
  grupo, 
  onClick 
}: { 
  grupo: GrupoEstudo; 
  onClick: (id: string) => void; 
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(grupo.id)}
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-lg flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-[#FF6B00]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white font-montserrat">
            {grupo.nome}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {grupo.descricao}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Users2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{grupo.membros} membros</span>
            </div>
            <div className="text-xs text-[#FF6B00]">
              {grupo.materia}
            </div>
          </div>
          {grupo.proximoEncontro && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Próximo encontro: {grupo.proximoEncontro}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [displayedGroups, setDisplayedGroups] = useState(gruposEstudo);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let filtered = gruposEstudo;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (grupo) =>
          grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    setDisplayedGroups(filtered);
  }, [searchTerm, selectedFilter]);

  // Função para lidar com clique no grupo com debounce para evitar múltiplos cliques
  const handleGroupClick = (id: string) => {
    if (isAnimating) return; // Evita múltiplos cliques durante animação

    setIsAnimating(true);
    console.log(`Grupo clicado: ${id}`);

    // Reset do estado de animação após 300ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    // Implementar navegação ou abertura de modal aqui
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Grupos de Estudo</h2>
            <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">{displayedGroups.length} grupos</span>
          </div>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg">
            <Plus className="h-4 w-4 mr-1" />
            Criar Grupo
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400 border-[#FF6B00]/10 dark:border-[#FF6B00]/20 h-9 interface-selector"
          >
            <span className="interface-selector-icon">
              <UserPlus className="h-4 w-4" />
            </span>
            <span className="interface-selector-text">Adicionar Grupo</span>
          </Button>
          <div className="relative w-full sm:w-auto max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar grupo de estudos..."
              className="pl-9 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400 border-[#FF6B00]/10 dark:border-[#FF6B00]/20 h-9 interface-selector"
          >
            <span className="interface-selector-icon">
              <Filter className="h-4 w-4" />
            </span>
            <span className="interface-selector-text">Filtrar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mt-4 overflow-x-auto">
        {displayedGroups.map((grupo, index) => (
          <motion.div
            key={grupo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.25, 
              ease: "easeOut", 
              delay: index * 0.05, // Escalonar a animação para cada card
              staggerChildren: 0.05 
            }}
            className="animate-smooth-hover"
            layout="position"
            layoutId={`grupo-${grupo.id}`}
          >
            <GrupoEstudoCard grupo={grupo} onClick={handleGroupClick} />
          </motion.div>
        ))}

        {displayedGroups.length === 0 && (
          <motion.div 
            className="col-span-3 text-center py-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Nenhum grupo encontrado com os filtros selecionados.
          </motion.div>
        )}
      </div>

      {displayedGroups.length > 6 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10">
            Ver todos os grupos
          </Button>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoInterface;