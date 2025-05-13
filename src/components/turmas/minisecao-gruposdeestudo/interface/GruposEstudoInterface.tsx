import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, GraduationCap, Users2, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { obterTodosGrupos, GrupoEstudo } from "@/lib/gruposEstudoStorage";
import { supabase } from "@/lib/supabase";

interface GruposEstudoInterfaceProps {
  className?: string;
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
        <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: grupo.cor ? `${grupo.cor}20` : undefined }}
        >
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
              {grupo.disciplina || grupo.topico || "Geral"}
            </div>
          </div>
          {grupo.codigo && (
            <div className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 inline-block">
              Código: {grupo.codigo}
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
  const [meusGrupos, setMeusGrupos] = useState<GrupoEstudo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar o ID do usuário e os grupos
  useEffect(() => {
    const carregarUsuarioEGrupos = async () => {
      setIsLoading(true);
      
      try {
        // Obter a sessão do usuário
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user?.id;
        
        if (uid) {
          setUserId(uid);
          
          // Carregar grupos com o userId
          const grupos = await obterTodosGrupos(uid);
          console.log(`Carregados ${grupos.length} grupos de estudo`);
          setMeusGrupos(grupos);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarUsuarioEGrupos();
  }, [refreshKey]);

  // Filtrar os grupos com base na busca
  const gruposFiltrados = React.useMemo(() => {
    if (!meusGrupos || meusGrupos.length === 0) return [];
    
    return meusGrupos.filter(grupo => {
      // Garantir que todos os campos existem antes de verificar
      const nomeMatch = grupo.nome && grupo.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const descricaoMatch = grupo.descricao && grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const disciplinaMatch = grupo.disciplina && grupo.disciplina.toLowerCase().includes(searchTerm.toLowerCase());
      const topicoMatch = grupo.topico && grupo.topico.toLowerCase().includes(searchTerm.toLowerCase());
      
      return nomeMatch || descricaoMatch || disciplinaMatch || topicoMatch;
    });
  }, [meusGrupos, searchTerm]);

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

  // Função para atualizar a lista de grupos
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
            onClick={handleRefresh}
          >
            <span className="interface-selector-icon">
              <RefreshCcw className="h-4 w-4" />
            </span>
            <span className="interface-selector-text">Atualizar</span>
          </Button>
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

      <AnimatePresence>
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {gruposFiltrados.length > 0 ? (
              gruposFiltrados.map((grupo, index) => (
                <motion.div
                  key={`${grupo.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: "easeOut", 
                    delay: index * 0.05,
                  }}
                  className="animate-smooth-hover"
                  layout="position"
                >
                  <GrupoEstudoCard grupo={grupo} onClick={handleGroupClick} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {searchTerm 
                  ? "Nenhum grupo encontrado com os termos da busca."
                  : "Você ainda não tem grupos de estudo. Crie um novo grupo para começar!"}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {gruposFiltrados.length > 8 && (
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