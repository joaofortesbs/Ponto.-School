import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import {
  Material,
  MaterialTypeBadge,
  formatDate,
  getBackgroundForMaterialType,
  getColorForMaterialType,
  getIconForMaterialType,
} from "./MaterialCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MaterialListItemProps {
  material: Material;
  onClick?: () => void;
}

const MaterialListItem = ({ material, onClick }: MaterialListItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg mr-4",
          getBackgroundForMaterialType(material.type),
          getColorForMaterialType(material.type),
        )}
      >
        {getIconForMaterialType(material.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="text-base font-semibold text-[#001427] dark:text-white group-hover:text-[#FF6B00] transition-colors line-clamp-1">
            {material.title}
          </h3>
          <div className="flex items-center ml-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full",
                material.isFavorite
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
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
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle read status logic would go here
              }}
            >
              <CheckCircle
                className={cn(
                  "h-4 w-4",
                  material.isRead && "text-green-500 fill-green-500",
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Salvar</DropdownMenuItem>
                <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                <DropdownMenuItem>Copiar link</DropdownMenuItem>
                <DropdownMenuItem>Adicionar em trilha</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
          <span className="mr-2">{material.turma}</span>
          <span>•</span>
          <span className="mx-2">{material.disciplina}</span>
          <span>•</span>
          <span className="ml-2">{formatDate(material.date)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
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
          {material.author && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              {material.author}
            </Badge>
          )}
          {material.duration && (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
            >
              <Clock className="h-3 w-3 mr-1" />
              {material.duration}
            </Badge>
          )}
          {material.fileSize && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {material.fileSize}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 self-center">
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
    </motion.div>
  );
};

export default MaterialListItem;
