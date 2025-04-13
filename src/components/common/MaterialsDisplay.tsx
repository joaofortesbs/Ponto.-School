
import React from "react";
import { MaterialCard } from "../portal/MaterialCard";
import { MaterialListItem } from "../portal/MaterialListItem";

interface Material {
  id: string;
  title: string;
  type: string;
  date: string;
  // Add other properties as needed
  [key: string]: any;
}

interface MaterialsDisplayProps {
  materials: Material[];
  viewMode: "grid" | "list";
  onMaterialClick?: (material: Material) => void;
}

/**
 * Reusable component to display materials in either grid or list view
 */
export function MaterialsDisplay({ 
  materials, 
  viewMode, 
  onMaterialClick 
}: MaterialsDisplayProps) {
  const handleClick = (material: Material) => {
    if (onMaterialClick) {
      onMaterialClick(material);
    }
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {materials.map((material) => (
          <div
            key={material.id}
            onClick={() => handleClick(material)}
            className="cursor-pointer"
          >
            <MaterialCard material={material} />
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
        {materials.map((material) => (
          <div
            key={material.id}
            onClick={() => handleClick(material)}
            className="cursor-pointer pt-4 first:pt-0"
          >
            <MaterialListItem material={material} />
          </div>
        ))}
      </div>
    );
  }
}
