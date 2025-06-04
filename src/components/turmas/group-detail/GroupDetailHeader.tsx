
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

interface GroupDetailHeaderProps {
  group: {
    id: string;
    nome: string;
    descricao?: string;
    membros?: number;
    tags?: string[];
  };
  onBack: () => void;
}

export default function GroupDetailHeader({ group, onBack }: GroupDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onBack}
          className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{group.nome}</h1>
          {group.descricao && (
            <p className="text-gray-300 text-sm mt-1">{group.descricao}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              {group.membros || 0} membros
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
