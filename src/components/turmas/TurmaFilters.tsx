import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  FolderKanban, 
  Users2,
  BookOpen,
  Globe,
  Lock
} from "lucide-react";

interface TurmaFiltersProps {
  filteredCount?: number;
  totalCount?: number;
}

const TurmaFilters: React.FC<TurmaFiltersProps> = ({ 
  filteredCount = 0, 
  totalCount = 0 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "todas";

  const handleViewChange = (view: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    if (view === "todas") {
      newSearchParams.delete("view");
    } else {
      newSearchParams.set("view", view);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const filters = [
    {
      id: "todas",
      label: "Todas as Turmas",
      icon: <BookOpen className="h-4 w-4" />,
      count: totalCount || 0,
    },
    {
      id: "oficiais",
      label: "Turmas Oficiais",
      icon: <GraduationCap className="h-4 w-4" />,
      count: 0, // Será calculado dinamicamente se necessário
    },
    {
      id: "projetos",
      label: "Projetos Interdisciplinares",
      icon: <FolderKanban className="h-4 w-4" />,
      count: 0, // Será calculado dinamicamente se necessário
    },
    {
      id: "proprias",
      label: "Minhas Turmas",
      icon: <Users2 className="h-4 w-4" />,
      count: 0, // Será calculado dinamicamente se necessário
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(filters || []).map((filter) => (
          <Button
            key={filter.id}
            variant={currentView === filter.id ? "default" : "outline"}
            onClick={() => handleViewChange(filter.id)}
            className={`${
              currentView === filter.id
                ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
                : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            } font-montserrat flex items-center gap-2`}
          >
            {filter.icon}
            {filter.label}
            {filter.count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 bg-white/20 text-inherit"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {currentView !== "todas" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredCount || 0} de {totalCount || 0} turmas
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">Públicas</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-gray-500">Privadas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurmaFilters;