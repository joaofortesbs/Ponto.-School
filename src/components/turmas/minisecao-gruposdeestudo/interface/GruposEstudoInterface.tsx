
import React, { useState, useEffect } from "react";
import { GrupoEstudo } from "@/components/estudos/data/gruposEstudo";
import { ChevronRight, ChevronLeft, Book, Users, Clock, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

// Dados simulados para os grupos de estudo
const gruposEstudoMock: GrupoEstudo[] = [
  {
    id: "matematica-1",
    nome: "Matemática Avançada",
    topico: "Cálculo",
    disciplina: "Matemática",
    membros: 12,
    proximaReuniao: "Hoje, 19:00",
    progresso: 65,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    descricao: "Grupo de estudos focado em matemática avançada e cálculo diferencial e integral."
  },
  {
    id: "fisica-1",
    nome: "Física Quântica",
    topico: "Quântica",
    disciplina: "Física",
    membros: 8,
    proximaReuniao: "Amanhã, 17:30",
    progresso: 45,
    novasMensagens: false,
    nivel: "Avançado",
    imagem: "https://images.unsplash.com/photo-1554475900-0a0350e3fc7b?w=800&q=80",
    descricao: "Estudos sobre física quântica e suas aplicações na atualidade."
  },
  {
    id: "filosofia-1",
    nome: "Filosofia Contemporânea",
    topico: "Filosofia Moderna",
    disciplina: "Filosofia",
    membros: 15,
    proximaReuniao: "Sexta, 18:00",
    progresso: 75,
    novasMensagens: true,
    nivel: "Básico",
    imagem: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
];

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [gruposEstudo, setGruposEstudo] = useState<GrupoEstudo[]>(gruposEstudoMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGrupos, setFilteredGrupos] = useState<GrupoEstudo[]>(gruposEstudoMock);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedNivel, setSelectedNivel] = useState<string>("");
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);

  // Obter lista única de disciplinas
  const disciplinas = React.useMemo(() => {
    const uniqueDisciplinas = Array.from(
      new Set(gruposEstudo.map((grupo) => grupo.disciplina))
    );
    return uniqueDisciplinas;
  }, [gruposEstudo]);

  // Obter lista única de níveis
  const niveis = React.useMemo(() => {
    const uniqueNiveis = Array.from(
      new Set(gruposEstudo.map((grupo) => grupo.nivel))
    );
    return uniqueNiveis;
  }, [gruposEstudo]);

  // Função para filtrar os grupos com base nos critérios
  useEffect(() => {
    let filtered = [...gruposEstudo];
    
    if (searchTerm) {
      filtered = filtered.filter(
        (grupo) =>
          grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.topico.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDisciplina) {
      filtered = filtered.filter((grupo) => grupo.disciplina === selectedDisciplina);
    }
    
    if (selectedNivel) {
      filtered = filtered.filter((grupo) => grupo.nivel === selectedNivel);
    }
    
    setFilteredGrupos(filtered);
  }, [searchTerm, selectedDisciplina, selectedNivel, gruposEstudo]);

  // Função para rolar os cards horizontalmente
  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('gruposContainer');
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Função para organizar grupos por tópico
  const gruposPorTopico = React.useMemo(() => {
    if (!filteredGrupos) return {};
    
    const result: Record<string, GrupoEstudo[]> = {};
    
    filteredGrupos.forEach((grupo) => {
      if (!result[grupo.topico]) {
        result[grupo.topico] = [];
      }
      result[grupo.topico].push(grupo);
    });
    
    return result;
  }, [filteredGrupos]);

  // Função para escolher o ícone com base no tópico
  const getTopicIcon = (topic: string) => {
    switch (topic.toLowerCase()) {
      case 'cálculo':
      case 'matemática':
        return <Book className="h-5 w-5 text-blue-500" />;
      case 'quântica':
      case 'física':
        return <Book className="h-5 w-5 text-purple-500" />;
      default:
        return <Book className="h-5 w-5 text-[#FF6B00]" />;
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Cabeçalho e Filtros */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#001427] dark:text-white">Grupos de Estudo</h2>
            <p className="text-sm text-[#778DA9] dark:text-gray-400">
              Encontre grupos para estudar em conjunto
            </p>
          </div>
          <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white">
            Criar Grupo
          </Button>
        </div>
        
        {/* Filtros e Busca */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-10 py-2 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
            />
          </div>
          
          <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
            <SelectTrigger className="w-[180px] border-[#FF6B00]/30 focus:ring-[#FF6B00]/30">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as disciplinas</SelectItem>
              {disciplinas.map((disciplina) => (
                <SelectItem key={disciplina} value={disciplina}>
                  {disciplina}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedNivel} onValueChange={setSelectedNivel}>
            <SelectTrigger className="w-[150px] border-[#FF6B00]/30 focus:ring-[#FF6B00]/30">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os níveis</SelectItem>
              {niveis.map((nivel) => (
                <SelectItem key={nivel} value={nivel}>
                  {nivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-grow overflow-y-auto">
        <ScrollArea className="h-full">
          {/* Renderizar grupos por tópico */}
          {Object.keys(gruposPorTopico).length > 0 ? (
            Object.entries(gruposPorTopico).map(([topico, grupos]) => (
              <div key={topico} className="mb-8">
                {/* Cabeçalho do tópico */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getTopicIcon(topico)}
                    <h3 className="text-lg font-semibold ml-2 text-[#001427] dark:text-white">
                      {topico} <span className="text-sm font-normal text-gray-500">({grupos.length})</span>
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => scrollContainer('left')}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-[#FF6B00]/30 hover:bg-[#FF6B00]/10"
                    >
                      <ChevronLeft className="h-4 w-4 text-[#FF6B00]" />
                    </Button>
                    <Button
                      onClick={() => scrollContainer('right')}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-[#FF6B00]/30 hover:bg-[#FF6B00]/10"
                    >
                      <ChevronRight className="h-4 w-4 text-[#FF6B00]" />
                    </Button>
                  </div>
                </div>
                
                {/* Cards dos grupos do tópico */}
                <div
                  id={`gruposContainer-${topico}`}
                  className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar"
                >
                  {grupos.map((grupo) => (
                    <div key={grupo.id} className="min-w-[300px] max-w-[300px]">
                      <Card
                        className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedGrupo(grupo.id)}
                      >
                        {grupo.imagem && (
                          <div className="h-32 overflow-hidden">
                            <img
                              src={grupo.imagem}
                              alt={grupo.nome}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {grupo.nome}
                            </h3>
                            {grupo.novasMensagens && (
                              <Badge className="bg-[#FF6B00] text-white">Novo</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                            {grupo.descricao || `Grupo de estudos sobre ${grupo.topico}`}
                          </p>
                          
                          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Tag className="h-4 w-4 mr-1 text-[#FF6B00]" />
                            <span>{grupo.disciplina}</span>
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-1 text-[#FF6B00]" />
                            <span>{grupo.membros} membros</span>
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" />
                            <span>Próxima: {grupo.proximaReuniao}</span>
                          </div>
                          
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/20"
                              size="sm"
                            >
                              Ver detalhes
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-[#778DA9] dark:text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#001427] dark:text-white">
                Nenhum grupo encontrado
              </h3>
              <p className="text-[#778DA9] dark:text-gray-400 mt-2 max-w-md">
                Não encontramos grupos de estudo com os filtros selecionados. Tente outros critérios ou crie seu próprio grupo.
              </p>
              <Button className="mt-4 bg-[#FF6B00] hover:bg-[#FF8C40] text-white">
                Criar um grupo
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default GruposEstudoInterface;
