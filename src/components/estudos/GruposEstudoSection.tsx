import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, BookOpen, Atom, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GruposEstudoSectionProps {
  onSelectGrupo?: (grupoId: string) => void;
}

const GruposEstudoSection: React.FC<GruposEstudoSectionProps> = ({
  onSelectGrupo = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGrupos, setFilteredGrupos] = useState(mockGrupos);

  // Mock data for study groups
  const mockGrupos = [
    {
      id: "mat-matematica-geral",
      nome: "Matemática Geral",
      topico: "Matemática",
      disciplina: "Matemática",
      membros: 8,
      proximaReuniao: "14/03, 17:00",
      progresso: 75,
      novasMensagens: true,
      nivel: "Avançado",
      imagem:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      curso: "Matemática",
      descricao:
        "Grupo dedicado ao estudo de matemática geral e suas aplicações em diversas áreas do conhecimento.",
      tags: ["matemática", "álgebra", "geometria"],
      dataInicio: "05/01/2023",
      matchScore: 98,
    },
    {
      id: "port-plano-leitura",
      nome: "Plano de Leitura",
      topico: "Literatura",
      disciplina: "Português",
      membros: 3,
      proximaReuniao: "16/03, 18:00",
      progresso: 68,
      novasMensagens: true,
      nivel: "Avançado",
      imagem:
        "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&q=80",
      curso: "Português",
      descricao:
        "Grupo dedicado à leitura e discussão de obras literárias clássicas e contemporâneas.",
      tags: ["leitura", "literatura", "discussão"],
      dataInicio: "10/01/2023",
      matchScore: 92,
    },
    {
      id: "fis-fisica-aplicada",
      nome: "Física Aplicada",
      topico: "Física",
      disciplina: "Física",
      membros: 5,
      proximaReuniao: "18/03, 19:30",
      progresso: 72,
      novasMensagens: true,
      nivel: "Avançado",
      imagem:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      curso: "Física",
      descricao:
        "Grupo dedicado ao estudo de física aplicada e suas aplicações práticas em diversos contextos.",
      tags: ["física", "aplicada", "prática"],
      dataInicio: "15/01/2023",
      matchScore: 95,
    },
    {
      id: "port-lingua-portuguesa-geral",
      nome: "Língua Portuguesa Geral",
      topico: "Gramática",
      disciplina: "Português",
      membros: 6,
      proximaReuniao: "20/03, 16:00",
      progresso: 60,
      novasMensagens: true,
      nivel: "Avançado",
      imagem:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
      curso: "Português",
      descricao:
        "Grupo dedicado ao estudo da língua portuguesa, incluindo gramática, redação e interpretação de texto.",
      tags: ["gramática", "redação", "interpretação"],
      dataInicio: "01/02/2023",
      matchScore: 90,
    },
    {
      id: "cie-ciencias-geral",
      nome: "Ciências Geral",
      topico: "Ciências",
      disciplina: "Ciências",
      membros: 10,
      proximaReuniao: "19/03, 15:30",
      progresso: 65,
      novasMensagens: true,
      nivel: "Avançado",
      imagem:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      curso: "Ciências",
      descricao:
        "Grupo focado no estudo de ciências gerais, abrangendo biologia, química e física básicas.",
      tags: ["ciências", "biologia", "química"],
      dataInicio: "05/02/2023",
      matchScore: 94,
    },
  ];

  // Filter grupos by search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredGrupos(mockGrupos);
    } else {
      const filtered = mockGrupos.filter(
        (grupo) =>
          grupo.nome.toLowerCase().includes(query) ||
          grupo.disciplina.toLowerCase().includes(query) ||
          grupo.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
      setFilteredGrupos(filtered);
    }
  };

  // Get only the first 5 grupos for display
  const displayedGrupos = filteredGrupos.slice(0, 5);

  const getIconForDisciplina = (disciplina: string) => {
    switch (disciplina.toLowerCase()) {
      case "física":
        return <Atom className="h-6 w-6 text-[#FF6B00]" />;
      case "matemática":
        return <Calculator className="h-6 w-6 text-[#FF6B00]" />;
      default:
        return <BookOpen className="h-6 w-6 text-[#FF6B00]" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Grupos de Estudo</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar grupos..."
              className="pl-10 w-64 bg-gray-100 dark:bg-gray-800 border-none"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white gap-1">
            <Plus className="h-4 w-4" /> Criar Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedGrupos.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer h-full"
            onClick={() => onSelectGrupo(grupo.id)}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                  {getIconForDisciplina(grupo.disciplina)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                    {grupo.nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                      {grupo.disciplina}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow">
                {grupo.descricao ||
                  "Grupo de estudos para a disciplina " + grupo.disciplina}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {grupo.tags?.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{grupo.membros} membros</span>
                </div>

                {grupo.proximaReuniao && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{grupo.proximaReuniao}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGrupo(grupo.id);
                  }}
                >
                  Acessar Grupo
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGrupos.length > 5 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            Ver mais grupos
          </Button>
        </div>
      )}

      {filteredGrupos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum grupo encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Não encontramos grupos que correspondam à sua busca. Tente outros
            termos ou crie um novo grupo.
          </p>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoSection;
