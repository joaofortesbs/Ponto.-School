
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useViewState } from "@/hooks/useViewState";
import { ViewToggle } from "@/components/common/ViewToggle";
import {
  BookOpen,
  FileText,
  Video,
  File,
  ExternalLink,
  Clock,
  Calendar,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: "document" | "video" | "article" | "exercise" | string;
  subject?: string;
  date?: string;
  duration?: string;
  author?: string;
  url?: string;
  thumbnail?: string;
  description?: string;
  [key: string]: any;
}

interface MaterialsDisplayProps {
  materials: Material[];
  emptyMessage?: string;
  onItemClick?: (material: Material) => void;
  showViewToggle?: boolean;
  defaultView?: "grid" | "list";
  className?: string;
}

// Mapeamento de ícones por tipo de material
const typeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-5 w-5 text-blue-500" />,
  video: <Video className="h-5 w-5 text-red-500" />,
  article: <BookOpen className="h-5 w-5 text-purple-500" />,
  exercise: <File className="h-5 w-5 text-green-500" />,
};

/**
 * Componente para exibir materiais em grade ou lista
 */
export function MaterialsDisplay({
  materials,
  emptyMessage = "Nenhum material encontrado",
  onItemClick,
  showViewToggle = true,
  defaultView = "grid",
  className = "",
}: MaterialsDisplayProps) {
  const { view, toggleView } = useViewState({
    defaultView,
    storageKey: "materials_view_preference",
  });

  // Helper para obter o ícone correto para o tipo de material
  const getTypeIcon = (type: string) => {
    return typeIcons[type.toLowerCase()] || <File className="h-5 w-5 text-gray-500" />;
  };

  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showViewToggle && (
        <div className="flex justify-end mb-4">
          <ViewToggle view={view} onToggle={toggleView} />
        </div>
      )}

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onItemClick?.(material)}
            >
              {material.thumbnail && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={material.thumbnail}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(material.type)}
                  {material.subject && (
                    <Badge variant="outline">{material.subject}</Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1 line-clamp-2">{material.title}</h3>
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {material.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  {material.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {material.duration}
                    </span>
                  )}
                  {material.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {material.date}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => onItemClick?.(material)}
            >
              {getTypeIcon(material.type)}
              <div className="flex-grow min-w-0">
                <h3 className="font-medium truncate">{material.title}</h3>
                {material.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {material.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground whitespace-nowrap">
                {material.subject && <Badge variant="outline">{material.subject}</Badge>}
                {material.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {material.duration}
                  </span>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
