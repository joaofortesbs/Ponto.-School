import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, MessageCircle, BookOpen, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isHovered, setIsHovered] = useState(false);
  
  // Função para gerar uma cor de fundo aleatória com base no nome do grupo
  const generateBackgroundGradient = (nome: string) => {
    const hash = nome.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue1 = (hash * 137.5) % 360;
    const hue2 = (hue1 + 20) % 360;
    
    return {
      background: `linear-gradient(135deg, hsla(${hue1}, 80%, 40%, 0.9) 0%, hsla(${hue2}, 95%, 50%, 0.8) 100%)`,
      boxShadow: isHovered ? `0 8px 25px hsla(${hue1}, 90%, 50%, 0.3)` : 'none'
    };
  };

  // Se não houver imagem, usar um gradiente baseado no nome
  const hasValidImage = grupo.imagem && !grupo.imagem.includes('undefined') && !grupo.imagem.includes('null');
  const backgroundStyle = hasValidImage
    ? { backgroundImage: `url(${grupo.imagem})` }
    : generateBackgroundGradient(grupo.nome);

  // Decidir se o grupo é de destaque (novas mensagens e progresso alto)
  const isDestaque = grupo.novasMensagens && grupo.progresso > 60;

  return (
    <Card 
      className={`grupo-estudo-card transition-all duration-300 ease-out cursor-pointer will-change-transform h-full
                  ${isDestaque ? 'featured-topic' : ''} overflow-hidden group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          e.currentTarget.style.transform = "translateY(2px)";
          setTimeout(() => {
            e.currentTarget.style.transform = "";
            onClick(grupo.id);
          }, 100);
        }
      }}
    >
      {/* Header com imagem de capa */}
      <div 
        className={`h-36 w-full bg-cover bg-center relative overflow-hidden`}
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-0"></div>
        
        {/* Overlay superior para nível e novas mensagens */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
          <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white font-medium px-3 py-1 shadow-lg">
            {grupo.nivel}
          </Badge>
          
          {grupo.novasMensagens && (
            <Badge className="bg-green-500/90 text-white px-3 py-1 shadow-md flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>Nova</span>
            </Badge>
          )}
        </div>
        
        {/* Informações no overlay inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-bold text-white text-xl mb-1 line-clamp-2 drop-shadow-md group-hover:text-white/95 transition-all">
            {grupo.nome}
          </h3>
        </div>
      </div>
      
      {/* Corpo do card */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen className="h-4 w-4 text-[#FF6B00]" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {grupo.disciplina}
            <span className="mx-1.5 text-gray-400">•</span>
            <span className="text-[#FF6B00]">{grupo.topico}</span>
          </p>
        </div>
        
        {/* Estatísticas do grupo */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">Membros</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{grupo.membros}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">Próxima</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{grupo.proximaReuniao}</span>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Progresso do grupo</span>
            <div className="flex items-center gap-1">
              {grupo.progresso > 70 && (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              <span className="font-bold text-[#FF6B00]">{grupo.progresso}%</span>
            </div>
          </div>
          <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute h-full left-0 top-0 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"
              style={{ width: `${grupo.progresso}%`, transition: 'width 1s ease-in-out' }}
            />
          </div>
        </div>
        
        {/* Tags do grupo */}
        {grupo.tags && grupo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {grupo.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/30 px-2"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Botão de acesso */}
        <div className="mt-3 text-right">
          <Button 
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg px-4 py-2 text-sm font-medium shadow-md transition-all duration-300 group-hover:shadow-lg flex items-center gap-1"
          >
            Acessar
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GrupoEstudoCard;