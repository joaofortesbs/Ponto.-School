
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GroupCard from "./GroupCard";

interface GruposEstudoPorTopicoProps {
  gruposEstudosPorTopico: Record<string, any[]>;
  getTopicIcon: (topic: string) => React.ReactNode;
  scrollContainer: (containerId: string, direction: 'left' | 'right') => void;
  handleGroupSelect: (group: any) => void;
}

const GruposEstudoPorTopico: React.FC<GruposEstudoPorTopicoProps> = ({
  gruposEstudosPorTopico,
  getTopicIcon,
  scrollContainer,
  handleGroupSelect
}) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
      <h2 className="text-2xl font-bold text-[#001427] dark:text-white mb-6 font-montserrat">Grupos de Estudo por Tópicos</h2>
      
      <div className="space-y-8">
        {Object.entries(gruposEstudosPorTopico).map(([topico, grupos], index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTopicIcon(topico)}
                <h3 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat">{topico}</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-[#FF6B00]/10"
                  onClick={() => scrollContainer(`topic-container-${index}`, 'left')}
                >
                  <ChevronLeft className="h-5 w-5 text-[#FF6B00]" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-[#FF6B00]/10"
                  onClick={() => scrollContainer(`topic-container-${index}`, 'right')}
                >
                  <ChevronRight className="h-5 w-5 text-[#FF6B00]" />
                </Button>
              </div>
            </div>
            
            <div 
              id={`topic-container-${index}`} 
              className="flex overflow-x-auto pb-4 hide-scrollbar gap-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {grupos.map((grupo) => (
                <div key={grupo.id} className="min-w-[300px] max-w-[300px]">
                  <GroupCard group={grupo} onClick={() => handleGroupSelect(grupo)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GruposEstudoPorTopico;
