import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";

export default function Skills() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Habilidades
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#29335C] dark:text-white">
              Programação
            </span>
            <span className="text-xs text-[#FF6B00]">Avançado</span>
          </div>
          <Progress value={90} className="h-2 bg-gray-200" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#29335C] dark:text-white">
              Matemática
            </span>
            <span className="text-xs text-[#FF6B00]">Avançado</span>
          </div>
          <Progress value={85} className="h-2 bg-gray-200" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#29335C] dark:text-white">
              Física
            </span>
            <span className="text-xs text-[#FF6B00]">Intermediário</span>
          </div>
          <Progress value={75} className="h-2 bg-gray-200" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#29335C] dark:text-white">
              Química
            </span>
            <span className="text-xs text-[#FF6B00]">Intermediário</span>
          </div>
          <Progress value={70} className="h-2 bg-gray-200" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          JavaScript
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          Python
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          React
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          Node.js
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          SQL
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          Git
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          Docker
        </Badge>
        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
          AWS
        </Badge>
      </div>
    </div>
  );
}
