import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Link,
  PenTool,
  Network,
} from "lucide-react";

// Type definitions
export type MaterialType =
  | "video"
  | "pdf"
  | "audio"
  | "link"
  | "exercise"
  | "mindmap";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  turma: string;
  disciplina: string;
  date: string;
  author?: string;
  fileSize?: string;
  duration?: string;
  rating?: number;
  views?: number;
  status?: "new" | "recommended" | "saved";
  isFavorite: boolean;
  isRead: boolean;
  thumbnail?: string;
  description?: string;
}

// Helper functions
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const getIconForMaterialType = (
  type: MaterialType,
  className = "h-5 w-5",
) => {
  switch (type) {
    case "video":
      return <Video className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "audio":
      return <Headphones className={className} />;
    case "link":
      return <Link className={className} />;
    case "exercise":
      return <PenTool className={className} />;
    case "mindmap":
      return <Network className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const getColorForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "text-blue-500";
    case "pdf":
      return "text-red-500";
    case "audio":
      return "text-purple-500";
    case "link":
      return "text-green-500";
    case "exercise":
      return "text-amber-500";
    case "mindmap":
      return "text-cyan-500";
    default:
      return "text-gray-500";
  }
};

export const getBackgroundForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "pdf":
      return "bg-red-50 dark:bg-red-900/20";
    case "audio":
      return "bg-purple-50 dark:bg-purple-900/20";
    case "link":
      return "bg-green-50 dark:bg-green-900/20";
    case "exercise":
      return "bg-amber-50 dark:bg-amber-900/20";
    case "mindmap":
      return "bg-cyan-50 dark:bg-cyan-900/20";
    default:
      return "bg-gray-50 dark:bg-gray-900/20";
  }
};

// Components
export const MaterialTypeIcon = ({
  type,
  className,
}: {
  type: MaterialType;
  className?: string;
}) => {
  const icon = getIconForMaterialType(type, className || "h-5 w-5");
  const color = getColorForMaterialType(type);
  return (
    <div className={cn("flex items-center justify-center", color)}>{icon}</div>
  );
};

export const MaterialTypeBadge = ({ type }: { type: MaterialType }) => {
  const icon = getIconForMaterialType(type, "h-3.5 w-3.5 mr-1");
  const color = getColorForMaterialType(type);
  const background = getBackgroundForMaterialType(type);

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1 px-2 py-0.5", background, color)}
    >
      {icon}
      <span className="capitalize">{type}</span>
    </Badge>
  );
};

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      <svg
        className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
}

const MaterialCard = ({ material, onClick }: MaterialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-pointer"
      onClick={onClick}
    >
      <div className="h-40 overflow-hidden">
        <img
          src={
            material.thumbnail ||
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
          }
          alt={material.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <div
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full",
              getBackgroundForMaterialType(material.type),
              getColorForMaterialType(material.type),
            )}
          >
            {getIconForMaterialType(material.type, "h-4 w-4")}
          </div>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-full backdrop-blur-sm",
              material.isFavorite
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-white/10 text-white hover:bg-white/20",
            )}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle favorite logic would go here
            }}
          >
            <Heart
              className={cn("h-4 w-4", material.isFavorite && "fill-red-500")}
            />
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg line-clamp-1">
            {material.title}
          </h3>
          <div className="flex items-center mt-1 text-white/80 text-sm">
            <span className="mr-2">{material.disciplina}</span>
            <span>•</span>
            <span className="mx-2">{formatDate(material.date)}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <MaterialTypeBadge type={material.type} />
          {material.status === "new" && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
            >
              Novo
            </Badge>
          )}
          {material.status === "recommended" && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400"
            >
              Recomendado
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {material.rating && <StarRating rating={material.rating} />}
            {material.views && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {material.views} visualizações
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Access logic would go here
            }}
          >
            Acessar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;
