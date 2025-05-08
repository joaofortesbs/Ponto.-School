
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import GrupoEstudoCard from "./GrupoEstudoCard";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  const [grupos, setGrupos] = useState(gruposEstudo);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtra os grupos quando o termo de pesquisa mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setGrupos(gruposEstudo);
    } else {
      const filtered = gruposEstudo.filter(
        grupo => 
          grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grupo.topico.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setGrupos(filtered);
    }
  }, [searchTerm]);

  const handleGrupoClick = (id: string) => {
    console.log(`Grupo selecionado: ${id}`);
    // Aqui poderia navegar para a página de detalhes do grupo
  };

  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat relative">
          <span className="relative z-10">Grupos de Estudo Colaborativo</span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-70"></span>
        </h2>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Buscar grupos..." 
              className="pl-9 w-[220px] h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 h-9">
            <Plus className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>
        </div>
      </div>
      
      {grupos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.slice(0, 6).map((grupo) => (
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
      
      {grupos.length > 6 && (
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
