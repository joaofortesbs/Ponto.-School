
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, GraduationCap, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { GrupoEstudo } from "@/hooks/useGruposEstudo";

interface GruposEstudoInterfaceProps {
  className?: string;
  grupos: GrupoEstudo[];
  loading: boolean;
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
        <div 
          className="h-12 w-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${grupo.cor}20` }}
        >
          <GraduationCap className="h-6 w-6" style={{ color: grupo.cor }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white font-montserrat">
            {grupo.nome}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {grupo.descricao || 'Sem descrição'}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Users2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{grupo.membros} membros</span>
            </div>
            <div className="text-xs text-[#FF6B00]">
              {grupo.topico || 'Geral'}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Código: {grupo.codigo_unico}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ 
  className, 
  grupos, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedGroups, setDisplayedGroups] = useState<GrupoEstudo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let filtered = grupos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (grupo) =>
          grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (grupo.topico && grupo.topico.toLowerCase().includes(searchTerm.toLowerCase())) ||
          grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayedGroups(filtered);
  }, [searchTerm, grupos]);

  // Function to handle group click with debounce to avoid multiple clicks
  const handleGroupClick = (id: string) => {
    if (isAnimating) return; // Avoid multiple clicks during animation

    setIsAnimating(true);
    console.log(`Group clicked: ${id}`);

    // Reset animation state after 300ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    // Implement navigation or modal opening here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar grupo de estudos..."
            className="pl-9 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {displayedGroups.map((grupo, index) => (
          <motion.div
            key={grupo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.25, 
              ease: "easeOut", 
              delay: index * 0.05, // Stagger animation for each card
              staggerChildren: 0.05 
            }}
            className="animate-smooth-hover"
            layout="position"
            layoutId={`grupo-${grupo.id}`}
          >
            <GrupoEstudoCard grupo={grupo} onClick={handleGroupClick} />
          </motion.div>
        ))}

        {displayedGroups.length === 0 && !loading && (
          <motion.div 
            className="col-span-full text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo criado ainda'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar sua busca ou criar um novo grupo.'
                : 'Crie seu primeiro grupo de estudos para começar.'
              }
            </p>
          </motion.div>
        )}
      </div>

      {displayedGroups.length > 8 && (
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
