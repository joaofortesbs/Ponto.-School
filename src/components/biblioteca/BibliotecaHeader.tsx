import React from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccessibilityControls } from "./AccessibilityControls";

export function BibliotecaHeader() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-[#001427] dark:text-white font-montserrat">
          Biblioteca
        </h2>
        <div className="flex items-center gap-2">
          <AccessibilityControls />
          <Button
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Material
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Seu universo de conhecimento
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Buscar materiais..." className="pl-10 pr-10 h-10" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
