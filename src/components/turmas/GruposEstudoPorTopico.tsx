
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";

interface GruposEstudoPorTopicoProps {
  topicoId?: number;
  className?: string;
}

const GruposEstudoPorTopico: React.FC<GruposEstudoPorTopicoProps> = ({ topicoId, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtrar grupos pelo tópico, se especificado
  const gruposDoTopico = topicoId 
    ? gruposEstudo.filter(grupo => grupo.topico.toLowerCase().includes(topicoId.toString())) 
    : gruposEstudo;
  
  // Filtrar grupos pela busca
  const gruposFiltrados = searchTerm 
    ? gruposDoTopico.filter(grupo => 
        grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : gruposDoTopico;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar grupo de estudos..."
            className="pl-9 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400 border-[#FF6B00]/10 dark:border-[#FF6B00]/20 h-9 whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-9 whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gruposFiltrados.map((grupo, index) => (
          <motion.div
            key={grupo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{grupo.nome}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {grupo.disciplina} - {grupo.membros} membros
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {grupo.descricao}
                  </p>
                  
                  <div className="mt-auto flex flex-wrap gap-1">
                    {grupo.tags && grupo.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {gruposFiltrados.length === 0 && (
          <div className="col-span-3 text-center py-8 text-gray-500">
            Nenhum grupo encontrado com os filtros selecionados.
          </div>
        )}
      </div>
      
      {gruposFiltrados.length > 6 && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10">
            Ver todos os grupos
          </Button>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoPorTopico;
