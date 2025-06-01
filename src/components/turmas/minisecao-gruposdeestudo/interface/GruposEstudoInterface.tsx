
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { GrupoEstudo } from "@/hooks/useGruposEstudo";

interface GruposEstudoInterfaceProps {
  className?: string;
  grupos: GrupoEstudo[];
  loading: boolean;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ 
  className, 
  grupos, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedGroups, setDisplayedGroups] = useState<GrupoEstudo[]>([]);

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
  );
};

export default GruposEstudoInterface;
