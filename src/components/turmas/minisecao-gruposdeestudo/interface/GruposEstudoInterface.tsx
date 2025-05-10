import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, GraduationCap, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";
import GrupoEstudoCard from "./GrupoEstudoCard";

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

// Utilizamos o componente importado

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
            <GrupoEstudoCard 
              grupo={{
                id: grupo.id,
                nome: grupo.nome,
                topico: grupo.tags ? grupo.tags[0] : '',
                disciplina: grupo.materia,
                membros: grupo.membros,
                proximaReuniao: grupo.proximoEncontro || 'A definir',
                progresso: 75, // Valor padrão
                novasMensagens: false,
                nivel: 'Intermediário',
                imagem: grupo.imagem || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
                tags: grupo.tags
              }} 
              onClick={() => handleGroupClick(grupo.id)} 
            />
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