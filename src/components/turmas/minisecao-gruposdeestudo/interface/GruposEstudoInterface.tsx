
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Calendar, Filter, ChevronRight } from "lucide-react";
import GroupCard from "../../GroupCard";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";
import SimpleGroupCard from "../../SimpleGroupCard";

// Estrutura adaptada para o formato do GroupCard
const adaptedGrupos = gruposEstudo.map(grupo => ({
  id: grupo.id,
  name: grupo.nome,
  members: [`${grupo.membros} membros`],
  nextMeeting: grupo.proximaReuniao,
  course: grupo.disciplina,
  description: grupo.descricao || `Grupo de estudos sobre ${grupo.topico}`,
  hasNewMessages: grupo.novasMensagens,
  lastActivity: `Progresso: ${grupo.progresso}%`,
  coverImage: grupo.imagem,
  topico: grupo.topico,
  nivel: grupo.nivel
}));

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<string | null>(null);
  const [filteredGrupos, setFilteredGrupos] = useState(adaptedGrupos);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Obter disciplinas e níveis únicos para filtros
  const disciplinas = Array.from(new Set(gruposEstudo.map(grupo => grupo.disciplina)));
  const niveis = Array.from(new Set(gruposEstudo.map(grupo => grupo.nivel)));

  // Filtrar grupos com base na pesquisa e filtros selecionados
  useEffect(() => {
    let filtered = adaptedGrupos;
    
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (grupo) =>
          grupo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grupo.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (grupo.description && grupo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedDisciplina && selectedDisciplina !== "todas") {
      filtered = filtered.filter((grupo) => grupo.course === selectedDisciplina);
    }
    
    if (selectedNivel && selectedNivel !== "todos") {
      filtered = filtered.filter((grupo) => grupo.nivel === selectedNivel);
    }
    
    setFilteredGrupos(filtered);
  }, [searchQuery, selectedDisciplina, selectedNivel]);

  const handleGroupSelect = (group: any) => {
    console.log("Selected group:", group);
    // Navigate to group detail page
    // navigate(`/turmas/grupos/${group.id}`);
  };

  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat relative">
          <span className="relative z-10">Grupos de Estudo Colaborativo</span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-70"></span>
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar grupos..."
              className="pl-9 w-[250px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-gray-100 dark:bg-gray-800 flex items-center">
            <Filter className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Filtros:</span>
          </Badge>
        </div>
        
        <div className="flex items-center">
          <select
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-[#FF6B00] focus:border-[#FF6B00] p-1.5"
            value={selectedDisciplina || "todas"}
            onChange={(e) => setSelectedDisciplina(e.target.value === "todas" ? null : e.target.value)}
          >
            <option value="todas">Todas as disciplinas</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina} value={disciplina}>
                {disciplina}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <select
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-[#FF6B00] focus:border-[#FF6B00] p-1.5"
            value={selectedNivel || "todos"}
            onChange={(e) => setSelectedNivel(e.target.value === "todos" ? null : e.target.value)}
          >
            <option value="todos">Todos os níveis</option>
            {niveis.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrupos.map((grupo) => (
          <div key={grupo.id} className="min-w-[300px]">
            <GroupCard 
              group={grupo} 
              onClick={() => handleGroupSelect(grupo)} 
            />
          </div>
        ))}
      </div>

      {filteredGrupos.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Nenhum grupo encontrado
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Não encontramos grupos de estudo correspondentes à sua busca. Tente com outros termos ou crie um novo grupo.
          </p>
          <Button
            className="mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoInterface;
