
import React from "react";
import { Book, Users, Calendar, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GroupPreviewProps {
  nome: string;
  disciplina: string;
  participantes: number;
  tags?: string[];
  dataInicio?: string;
  onAcessarGrupo?: () => void;
  cor?: string;
}

const GroupPreview: React.FC<GroupPreviewProps> = ({
  nome,
  disciplina,
  participantes,
  tags = [],
  dataInicio,
  onAcessarGrupo,
  cor = "#FF6B00"
}) => {
  return (
    <div className="bg-[#0B1322] rounded-xl overflow-hidden border border-[#1E293B] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className="h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0" 
            style={{ backgroundColor: cor }}
          >
            <Book className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{nome}</h3>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <span>{disciplina}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{participantes} participantes</span>
                </div>
              </div>
              
              {tags && tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 hover:bg-[#FF6B00]/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic mt-2">
                  Tags aparecerão aqui
                </div>
              )}
              
              {dataInicio && (
                <div className="flex items-center mt-4 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>Data de início: {dataInicio}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-5 flex justify-end">
          <Button 
            onClick={onAcessarGrupo}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
          >
            Acessar Grupo <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupPreview;
