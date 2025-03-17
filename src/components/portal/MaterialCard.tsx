import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Clock,
  Star,
  Video,
  FileText,
  Headphones,
  Link,
  PenTool,
  Network,
  BookText,
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
      return <BookText className={className} />;
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
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const MaterialCard = ({ material }: { material: Material }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="h-40 overflow-hidden">
        <img
          src={material.thumbnail}
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
          >
            <Heart
              className={cn("h-4 w-4", material.isFavorite && "fill-red-500")}
            />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-[#001427] dark:text-white line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
            {material.title}
          </h3>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="mr-2">{material.turma}</span>
          <span>•</span>
          <span className="mx-2">{formatDate(material.date)}</span>
        </div>
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
            variant="ghost"
            className="h-8 px-2 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            Acessar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;
