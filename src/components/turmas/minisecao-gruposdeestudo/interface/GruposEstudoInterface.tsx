
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, AcademicCap, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";

interface GruposEstudoInterfaceProps {
  className?: string;
}

interface GrupoEstudo {
  id: string;
  nome: string;
  descricao: string;
  materia: string;
  membros: number;
  proximoEncontro?: string;
  imagem?: string;
  isPublico: boolean;
  criador: string;
  tags: string[];
}

const GrupoEstudoCard = ({ 
  grupo, 
  onClick 
}: { 
  grupo: GrupoEstudo; 
  onClick: (id: string) => void; 
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(grupo.id)}
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-lg flex items-center justify-center">
          <AcademicCap className="h-6 w-6 text-[#FF6B00]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white font-montserrat">
            {grupo.nome}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {grupo.descricao}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Users2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{grupo.membros} membros</span>
            </div>
            <div className="text-xs text-[#FF6B00]">
              {grupo.materia}
            </div>
          </div>
          {grupo.proximoEncontro && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Próximo encontro: {grupo.proximoEncontro}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [grupos, setGrupos] = useState<GrupoEstudo[]>([]);

  useEffect(() => {
    // Em uma aplicação real, você buscaria os grupos do backend
    // Usando os dados de mock por enquanto
    setGrupos(gruposEstudo);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGrupoClick = (id: string) => {
    // Navegar para a página de detalhes do grupo
    console.log(`Navegando para o grupo ${id}`);
  };

  const filteredGrupos = grupos.filter(
    (grupo) =>
      grupo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grupo.materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grupo.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar grupo de estudos..."
            className="pl-9 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400 border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {filteredGrupos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGrupos.slice(0, 6).map((grupo) => (
            <GrupoEstudoCard 
              key={grupo.id} 
              grupo={grupo} 
              onClick={handleGrupoClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Nenhum grupo de estudo encontrado</p>
          <p className="text-sm">Tente ajustar sua pesquisa ou crie um novo grupo</p>
        </div>
      )}

      {filteredGrupos.length > 6 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10">
            Ver todos os grupos
          </Button>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoInterface;
