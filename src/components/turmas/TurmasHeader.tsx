import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BookOpen, Users2 } from "lucide-react";

interface TurmasHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddTurma?: () => void;
}

const TurmasHeader: React.FC<TurmasHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onAddTurma,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
            Minhas Turmas
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Seu centro de estudos personalizado
            </p>
            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
              {6} turmas ativas
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative turma-search">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Buscar turmas..."
            className="pl-9 w-[250px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold add-turma-button"
            onClick={onAddTurma}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Turma
          </Button>
          <Button
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] font-montserrat font-semibold"
            onClick={() => (window.location.href = "/turmas/criar-grupo")}
          >
            <Users2 className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>
        </div>
      </div>
    </div>
  );
};

import TurmasTabsNav from "./TurmasTabsNav";

const TurmasHeaderWithNav: React.FC<TurmasHeaderProps> = (props) => {
  return (
    <div className="space-y-4">
      <TurmasTabsNav />
      <TurmasHeader {...props} />
    </div>
  );
};

export default TurmasHeaderWithNav;
