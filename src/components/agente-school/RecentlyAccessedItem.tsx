import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Material,
  formatDate,
  getBackgroundForMaterialType,
  getColorForMaterialType,
  getIconForMaterialType,
} from "./MaterialCard";

const RecentlyAccessedItem = ({ material }: { material: Material }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors"
    >
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg mr-3",
          getBackgroundForMaterialType(material.type),
          getColorForMaterialType(material.type),
        )}
      >
        {getIconForMaterialType(material.type, "h-4 w-4")}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#001427] dark:text-white group-hover:text-[#FF6B00] transition-colors truncate">
          {material.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {material.turma} • {formatDate(material.date)}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="flex-shrink-0 h-8 px-2 ml-2 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
      >
        Retomar
      </Button>
    </motion.div>
  );
};

export default RecentlyAccessedItem;
