
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Calendar, Filter, ChevronRight, Users2 } from "lucide-react";
import GroupCard from "../../GroupCard";

// Mock data for study groups
const mockGruposEstudo = [
  {
    id: "g1",
    name: "Grupo de Mecânica Quântica",
    members: ["Ana", "Pedro", "Você"],
    nextMeeting: "16/03, 18:00",
    course: "Física Quântica",
    description: "Grupo dedicado ao estudo de Mecânica Quântica, com foco na preparação para o projeto final da disciplina.",
    hasNewMessages: true,
    lastActivity: "Hoje, 14:30",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "g2",
    name: "Preparação para o Projeto Final",
    members: ["Mariana", "João", "Carla", "Você"],
    nextMeeting: "23/03, 19:00",
    course: "Física Quântica",
    description: "Grupo focado na preparação para o projeto final do semestre, com ênfase em aplicações práticas.",
    hasNewMessages: true,
    lastActivity: "Ontem, 20:15",
    coverImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
  },
  {
    id: "g3",
    name: "Grupo de Cálculo Avançado",
    members: ["Roberto", "Luiza", "Você"],
    nextMeeting: "18/03, 17:30",
    course: "Cálculo Avançado",
    description: "Discussões sobre tópicos avançados de cálculo diferencial e integral, com resolução de exercícios.",
    hasNewMessages: false,
    lastActivity: "3 dias atrás",
    coverImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
  },
  {
    id: "g4",
    name: "Programação em Python",
    members: ["Rafael", "Camila", "Gustavo", "Você"],
    nextMeeting: "25/03, 15:00",
    course: "Introdução à Programação",
    description: "Grupo para prática de programação em Python, desenvolvimento de projetos e resolução de desafios.",
    hasNewMessages: false,
    lastActivity: "1 semana atrás",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
];

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGrupos, setFilteredGrupos] = useState(mockGruposEstudo);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter groups based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGrupos(mockGruposEstudo);
    } else {
      const filtered = mockGruposEstudo.filter(
        (grupo) =>
          grupo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grupo.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGrupos(filtered);
    }
  }, [searchQuery]);

  const handleGroupSelect = (group: any) => {
    console.log("Selected group:", group);
    // Navigate to group detail page
    // navigate(`/turmas/grupos/${group.id}`);
  };

  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      {/* Modern Title Section Inspired by Reference */}
      <div className="flex items-start gap-3 mb-6 bg-[#121827] dark:bg-[#0A101E] p-4 rounded-lg">
        <div className="flex-shrink-0 bg-[#FF6B00] rounded-lg p-2 flex items-center justify-center">
          <Users2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-montserrat">
            Grupos de Estudo
          </h2>
          <p className="text-gray-400 text-sm">
            Colabore, aprenda e evolua junto com seus colegas
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#001427] dark:text-white font-montserrat">
          Seus Grupos
        </h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mt-6">
        {filteredGrupos.map((grupo) => (
          <div key={grupo.id}>
            <GroupCard group={grupo} onClick={() => handleGroupSelect(grupo)} />
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
