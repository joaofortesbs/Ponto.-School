import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, GraduationCap, Users2, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { GrupoEstudo, salvarGrupoLocal } from "@/lib/gruposEstudoStorage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GrupoConfiguracoesModal from "./GrupoConfiguracoesModal";

interface GruposEstudoInterfaceProps {
  grupos: GrupoEstudo[];
  onGrupoAtualizado?: (grupo: GrupoEstudo) => void;
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
            {grupo.descricao || "Sem descrição"}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Users2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{grupo.membros || 1} membros</span>
            </div>
            <div className="text-xs text-[#FF6B00]">
              {grupo.disciplina || grupo.topico_nome || "Geral"}
            </div>
          </div>
          {grupo.codigo && (
            <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Key className="h-3 w-3 mr-1 text-green-500" />
              <span className="font-mono">
                {grupo.codigo.length > 4 
                  ? `${grupo.codigo.substring(0, 4)} ${grupo.codigo.substring(4)}` 
                  : grupo.codigo}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ 
  grupos, 
  onGrupoAtualizado 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [displayedGroups, setDisplayedGroups] = useState<GrupoEstudo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoEstudo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Atualizar grupos exibidos quando a lista de grupos mudar
  useEffect(() => {
    setDisplayedGroups(grupos);
  }, [grupos]);

  // Filtrar grupos
  useEffect(() => {
    let filtered = grupos;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (grupo) =>
          (grupo.nome && grupo.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (grupo.disciplina && grupo.disciplina.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (grupo.descricao && grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (grupo.topico_nome && grupo.topico_nome.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setDisplayedGroups(filtered);
  }, [searchTerm, selectedFilter, grupos]);

  // Função para lidar com clique no grupo
  const handleGroupClick = (id: string) => {
    if (isAnimating) return; // Evita múltiplos cliques durante animação

    setIsAnimating(true);
    console.log(`Grupo clicado: ${id}`);

    // Encontrar o grupo clicado
    const grupo = grupos.find(g => g.id === id);
    if (grupo) {
      setSelectedGrupo(grupo);
      setIsModalOpen(true);
    }

    // Reset do estado de animação após 300ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Função para atualizar grupos quando são modificados
  const handleSaveGrupo = (grupoAtualizado: GrupoEstudo) => {
    console.log('Grupo atualizado:', grupoAtualizado);
    
    // Atualizar o estado local
    setDisplayedGroups(currentGroups => 
      currentGroups.map(g => g.id === grupoAtualizado.id ? grupoAtualizado : g)
    );
    
    // Salvar no localStorage
    salvarGrupoLocal(grupoAtualizado);
    
    // Notificar o componente pai
    if (onGrupoAtualizado) {
      onGrupoAtualizado(grupoAtualizado);
    }
  };

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
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-9 interface-selector">
            <span className="interface-selector-icon">
              <Plus className="h-4 w-4" />
            </span>
            <span className="interface-selector-text">Criar Grupo</span>
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
              delay: index * 0.05,
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
            className="col-span-full text-center py-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {searchTerm ? 
              "Nenhum grupo encontrado com os filtros selecionados." : 
              "Você ainda não tem grupos de estudo. Clique em 'Criar Grupo' para começar."}
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

      {/* Modal de configurações do grupo */}
      {selectedGrupo && (
        <GrupoConfiguracoesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          grupo={selectedGrupo}
          onSave={handleSaveGrupo}
        />
      )}
    </div>
  );
};

export default GruposEstudoInterface;