import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, LogOut, Eye, Settings } from "lucide-react";
import GrupoSairModal from "./GrupoSairModal";

interface GrupoEstudoCardProps {
  grupo: {
    id: string;
    nome: string;
    topico: string;
    disciplina: string;
    membros: number;
    proximaReuniao: string;
    progresso: number;
    novasMensagens: boolean;
    nivel: string;
    imagem: string;
    tags?: string[];
  };
  onClick?: (id: string) => void;
}

const GrupoEstudoCard: React.FC<GrupoEstudoCardProps> = ({ grupo, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showSairModal, setShowSairModal] = React.useState(false);

  // Funções para lidar com as ações do grupo
  const handleSairGrupo = (grupoId: string) => {
    console.log(`Saindo do grupo ${grupoId}`);
    // Aqui você implementa a lógica para sair do grupo
  };

  const handleExcluirGrupo = (grupoId: string) => {
    console.log(`Excluindo grupo ${grupoId}`);
    // Aqui você implementa a lógica para excluir o grupo
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] cursor-pointer border-[#f0f0f0] dark:border-[#2a2a2a] h-full will-change-transform relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) {
            // Aplicar efeito visual ao clicar
            e.currentTarget.style.transform = "translateY(1px)";
            setTimeout(() => {
              e.currentTarget.style.transform = "";
              onClick(grupo.id);
            }, 100);
          }
        }}
      >
        {/* Botões de ação que aparecem no hover */}
        {isHovered && (
          <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
            <button 
              className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
              title="Sair do Grupo"
              onClick={(e) => {
                e.stopPropagation();
                setShowSairModal(true);
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button 
              className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
              title="Visualizar Grupo"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Visualizando grupo ${grupo.id}`);
                // Implementar navegação para a visualização detalhada do grupo
              }}
            >
              <Eye className="h-4 w-4" />
            </button>

            <button 
              className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
              title="Configurações do Grupo"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Configurações do grupo ${grupo.id}`);
                // Implementar abertura do modal de configurações do grupo
              }}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}

      <div 
        className="h-32 w-full bg-cover bg-center rounded-t-lg" 
        style={{ backgroundImage: `url(${grupo.imagem})` }}
      >
        <div className="w-full h-full bg-gradient-to-b from-transparent to-black/70 rounded-t-lg flex items-end p-3">
          <Badge className="bg-[#FF6B00] text-white">{grupo.nivel}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
            {grupo.nome}
          </h3>
          {grupo.novasMensagens && (
            <Badge className="bg-green-500 text-white text-xs">Nova mensagem</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{grupo.disciplina} - {grupo.topico}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300 interface-menu-item">
              <span className="interface-menu-item-icon">
                <Users className="h-4 w-4" />
              </span>
              <span className="interface-menu-item-text">{grupo.membros} membros</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 interface-menu-item">
              <span className="interface-menu-item-icon">
                <Calendar className="h-4 w-4" />
              </span>
              <span className="interface-menu-item-text">{grupo.proximaReuniao}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">Progresso</span>
              <span className="font-medium text-[#FF6B00]">{grupo.progresso}%</span>
            </div>
            <Progress className="h-2" value={grupo.progresso} />
          </div>
          {grupo.tags && grupo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {grupo.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Modal para sair/excluir grupo */}
    <GrupoSairModal
      isOpen={showSairModal}
      onClose={() => setShowSairModal(false)}
      grupoId={grupo.id}
      grupoNome={grupo.nome}
      onSair={handleSairGrupo}
      onExcluir={handleExcluirGrupo}
    />
    </>
  );
};

export default GrupoEstudoCard;