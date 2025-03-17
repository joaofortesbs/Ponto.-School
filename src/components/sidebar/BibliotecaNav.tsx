import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  BookText,
  Heart,
  BookMarked,
  ChevronDown,
  ChevronUp,
  FileText,
  Play,
  GraduationCap,
  Layers,
  Clock,
  Lightbulb,
  Rocket,
  Search,
} from "lucide-react";

export default function BibliotecaNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "minhas-turmas",
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isActive = (path: string) => {
    if (path === "/biblioteca") {
      return location.pathname === path && !location.search;
    }
    return location.pathname + location.search === path;
  };

  const bibliotecaItems = [
    {
      name: "Visão Geral",
      path: "/biblioteca",
      icon: <Home className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Minhas Turmas",
      path: "/biblioteca?view=minhas-turmas",
      icon: <GraduationCap className="h-4 w-4 text-[#29335C]" />,
      subItems: [
        {
          name: "Cálculo I",
          path: "/biblioteca?view=minhas-turmas&id=1",
          color: "bg-blue-600",
        },
        {
          name: "Física Quântica",
          path: "/biblioteca?view=minhas-turmas&id=2",
          color: "bg-purple-600",
        },
        {
          name: "Química Orgânica",
          path: "/biblioteca?view=minhas-turmas&id=3",
          color: "bg-green-600",
        },
        {
          name: "Biologia Celular",
          path: "/biblioteca?view=minhas-turmas&id=4",
          color: "bg-amber-600",
        },
      ],
    },
    {
      name: "Livros",
      path: "/biblioteca?view=livros",
      icon: <BookText className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Artigos",
      path: "/biblioteca?view=artigos",
      icon: <FileText className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Vídeos",
      path: "/biblioteca?view=videos",
      icon: <Play className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Disciplinas",
      path: "/biblioteca?view=disciplinas",
      icon: <Layers className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Favoritos",
      path: "/biblioteca?view=favoritos",
      icon: <Heart className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Recentes",
      path: "/biblioteca?view=recentes",
      icon: <Clock className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Recomendados",
      path: "/biblioteca?view=recomendados",
      icon: <Lightbulb className="h-4 w-4 text-[#29335C]" />,
    },
    {
      name: "Trilhas de Aprendizagem",
      path: "/biblioteca?view=trilhas",
      icon: <Rocket className="h-4 w-4 text-[#29335C]" />,
    },
  ];

  return (
    <div className="space-y-1 px-2 py-2">
      <div className="mb-3 px-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar na biblioteca..."
            className="w-full h-8 pl-8 pr-2 text-xs rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#29335C] dark:focus:ring-white"
          />
        </div>
      </div>

      <Button
        variant="ghost"
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-start w-full",
          location.pathname === "/biblioteca"
            ? "bg-[#001427]/10 text-[#001427] dark:bg-[#001427]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) {
            navigate("/biblioteca");
          }
        }}
      >
        <div className="flex items-center">
          <div
            className={cn(
              "mr-3 transition-all duration-300",
              location.pathname === "/biblioteca"
                ? "text-[#001427] dark:text-white"
                : "text-[#001427] dark:text-white group-hover:text-[#001427]",
            )}
          >
            <BookText className="h-5 w-5" />
          </div>
          <span
            className={cn(
              location.pathname === "/biblioteca" &&
                "relative px-2 py-1 rounded-full border border-[#29335C]/50 bg-[#29335C]/10",
            )}
          >
            Biblioteca
          </span>
        </div>
        <div className="text-[#001427] dark:text-white">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300",
            location.pathname === "/biblioteca"
              ? "bg-[#001427]"
              : "bg-transparent group-hover:bg-[#001427]/30",
          )}
        />
      </Button>

      {isExpanded && (
        <div className="ml-2 mt-1 space-y-1">
          {bibliotecaItems.map((item, index) => (
            <div key={index}>
              {item.subItems ? (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between px-2 py-1.5 h-auto text-sm",
                      isActive(item.path) && !expandedSection
                        ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium"
                        : "text-[#001427] hover:bg-[#29335C]/5 dark:text-white dark:hover:bg-[#29335C]/10",
                    )}
                    onClick={() =>
                      toggleSection(item.name.toLowerCase().replace(" ", "-"))
                    }
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {expandedSection ===
                    item.name.toLowerCase().replace(" ", "-") ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedSection ===
                    item.name.toLowerCase().replace(" ", "-") && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem, subIndex) => (
                        <Button
                          key={subIndex}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-2 py-1 h-auto text-xs",
                            isActive(subItem.path)
                              ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium"
                              : "text-[#001427] hover:bg-[#29335C]/5 dark:text-white dark:hover:bg-[#29335C]/10",
                          )}
                          onClick={() => navigate(subItem.path)}
                        >
                          <div className="flex items-center gap-2">
                            {subItem.color && (
                              <div
                                className={`w-2 h-2 rounded-full ${subItem.color}`}
                              ></div>
                            )}
                            <span>{subItem.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full",
                    isActive(item.path)
                      ? "bg-[#001427]/10 text-[#001427] dark:bg-[#001427]/20 dark:text-white font-medium"
                      : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10",
                    "hover:translate-x-1 transition-transform",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
