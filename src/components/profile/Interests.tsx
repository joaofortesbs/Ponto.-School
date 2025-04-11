import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function Interests() {
  return (
    <div className="w-full bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow overflow-hidden"> {/* Added w-full here */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Interesses
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Programação
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Inteligência Artificial
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Matemática
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Física Quântica
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Xadrez
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Ficção Científica
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Astronomia
        </Badge>
        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
          Música
        </Badge>
      </div>
    </div>
  );
}