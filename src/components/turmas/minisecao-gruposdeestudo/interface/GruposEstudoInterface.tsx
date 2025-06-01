
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, GraduationCap, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useGruposEstudo } from "@/hooks/useGruposEstudo";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";

interface GruposEstudoInterfaceProps {
  className?: string;
}

interface GrupoEstudo {
  id: string;
  nome: string;
  descricao?: string;
  user_id: string;
  codigo_unico: string;
  is_publico: boolean;
  created_at: string;
  membros: number;
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
          {grupo.descricao && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {grupo.descricao}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Users2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{grupo.membros} membros</span>
            </div>
            <div className="text-xs text-[#FF6B00]">
              {grupo.codigo_unico}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Criado em: {new Date(grupo.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { grupos, loading, reloadGrupos } = useGruposEstudo();

  // Filtrar grupos por termo de busca
  const displayedGroups = grupos.filter(
    (grupo) =>
      grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grupo.descricao && grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      grupo.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleCreateGroup = async (formData: any) => {
    console.log('Novo grupo criado:', formData);
    setIsCreateModalOpen(false);
    // Recarregar grupos após criação
    await reloadGrupos();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar grupo de estudos..."
              className="pl-9 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
              disabled
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-gray-600 dark:text-gray-400 border-[#FF6B00]/10 dark:border-[#FF6B00]/20 h-9"
            >
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
            <Button 
              disabled
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-9"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Grupo</span>
            </Button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando grupos...</p>
        </div>
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
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-9 interface-selector"
          >
            <span className="interface-selector-icon">
              <Plus className="h-4 w-4" />
            </span>
            <span className="interface-selector-text">Criar Grupo</span>
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

        {displayedGroups.length === 0 && !loading && (
          <motion.div 
            className="col-span-3 text-center py-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {searchTerm ? "Nenhum grupo encontrado com os filtros selecionados." : "Você ainda não criou nenhum grupo de estudos."}
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

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};

export default GruposEstudoInterface;
