
import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Calendar, Brain, MessageSquare, Users, Grid, Star, Plus, Library, FileText, BarChart } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { persistAtalhoOrder, getStoredAtalhoOrder } from "@/lib/persistence-utils";

// Interface para os atalhos
interface Atalho {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
  path: string;
}

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoveredAtalho, setHoveredAtalho] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Lista de atalhos pré-definidos
  const defaultAtalhos: Atalho[] = [
    {
      id: 1,
      title: "Biblioteca",
      icon: <Library className="h-5 w-5" />,
      color: "from-blue-600 to-indigo-700",
      gradient: "bg-gradient-to-br from-blue-600/90 to-indigo-700/90",
      description: "Materiais de estudo e livros digitais",
      path: "/biblioteca"
    },
    {
      id: 2,
      title: "Planos de Estudo",
      icon: <FileText className="h-5 w-5" />,
      color: "from-green-600 to-emerald-700",
      gradient: "bg-gradient-to-br from-green-600/90 to-emerald-700/90",
      description: "Organize seu plano de estudos",
      path: "/planos-estudo"
    },
    {
      id: 3,
      title: "Análises",
      icon: <BarChart className="h-5 w-5" />,
      color: "from-purple-600 to-violet-700",
      gradient: "bg-gradient-to-br from-purple-600/90 to-violet-700/90",
      description: "Métricas e desempenho",
      path: "/organizacao"
    },
    {
      id: 4,
      title: "School IA",
      icon: <Brain className="h-5 w-5" />,
      color: "from-cyan-500 to-blue-600",
      gradient: "bg-gradient-to-br from-cyan-500/90 to-blue-600/90",
      description: "Assistente de estudos inteligente",
      path: "/school-ia"
    },
    {
      id: 5,
      title: "Grupos",
      icon: <Users className="h-5 w-5" />,
      color: "from-amber-500 to-orange-600",
      gradient: "bg-gradient-to-br from-amber-500/90 to-orange-600/90",
      description: "Conecte-se com outros estudantes",
      path: "/turmas/grupos"
    },
    {
      id: 6,
      title: "Agenda",
      icon: <Calendar className="h-5 w-5" />,
      color: "from-red-500 to-rose-600",
      gradient: "bg-gradient-to-br from-red-500/90 to-rose-600/90",
      description: "Organize sua rotina",
      path: "/agenda"
    }
  ];

  // Estado para controlar a ordem dos atalhos (com suporte a drag and drop)
  const [atalhos, setAtalhos] = useState<Atalho[]>([...defaultAtalhos]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  
  // Observer para ajustar o tamanho do card de acordo com o card "Seu Foco Hoje"
  useEffect(() => {
    // Função para observar mudanças no card "Seu Foco Hoje"
    const adjustHeight = () => {
      const focoHojeCard = document.querySelector('[data-card-type="foco-hoje"]') as HTMLElement;
      const atalhoCard = cardRef.current;
      
      if (focoHojeCard && atalhoCard) {
        // Atualiza a altura do card para corresponder ao "Seu Foco Hoje"
        const focoHojeHeight = focoHojeCard.offsetHeight;
        atalhoCard.style.height = `${focoHojeHeight}px`;
      }
    };
    
    // Chama a função de ajuste imediatamente
    adjustHeight();
    
    // Cria um observador para monitorar alterações no tamanho
    const resizeObserver = new ResizeObserver(adjustHeight);
    
    // Inicia a observação no card "Seu Foco Hoje"
    const focoHojeCard = document.querySelector('[data-card-type="foco-hoje"]');
    if (focoHojeCard) {
      resizeObserver.observe(focoHojeCard);
    }
    
    // Configura um intervalo de verificação para garantir que o ajuste ocorra mesmo após interações do usuário
    const intervalId = setInterval(adjustHeight, 500);
    
    // Limpa o observador e o intervalo quando o componente é desmontado
    return () => {
      resizeObserver.disconnect();
      clearInterval(intervalId);
    };
  }, []);

  // Carregar ordem personalizada dos atalhos do armazenamento local
  useEffect(() => {
    const storedOrder = getStoredAtalhoOrder();
    if (storedOrder && storedOrder.length === defaultAtalhos.length) {
      // Recria os atalhos na ordem salva pelo usuário
      const orderedAtalhos = storedOrder.map(id => 
        defaultAtalhos.find(atalho => atalho.id === id) || defaultAtalhos[0]
      );
      setAtalhos(orderedAtalhos);
    }
  }, []);

  // Funções para lidar com drag and drop
  const handleDragStart = (id: number) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, dropId: number) => {
    e.preventDefault();
    
    // Se não há item sendo arrastado ou é o mesmo item, não faz nada
    if (draggingId === null || draggingId === dropId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    
    // Reorganiza os atalhos, movendo o item arrastado para a posição alvo
    const draggedIndex = atalhos.findIndex(atalho => atalho.id === draggingId);
    const dropIndex = atalhos.findIndex(atalho => atalho.id === dropId);
    
    if (draggedIndex !== -1 && dropIndex !== -1) {
      const newAtalhos = [...atalhos];
      const [draggedItem] = newAtalhos.splice(draggedIndex, 1);
      newAtalhos.splice(dropIndex, 0, draggedItem);
      
      setAtalhos(newAtalhos);
      
      // Persiste a nova ordem no armazenamento local
      persistAtalhoOrder(newAtalhos.map(atalho => atalho.id));
    }
    
    // Reset estados de drag
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <Card 
      ref={cardRef}
      className={`
        relative overflow-hidden flex flex-col w-full
        ${isLightMode 
          ? 'bg-white/95 border border-gray-200 shadow-lg' 
          : 'bg-[#001e3a]/90 border border-[#1e3a5f] shadow-lg'}
        rounded-xl backdrop-blur-sm transition-all duration-300
      `}
      data-card-type="atalhos-school"
    >
      {/* Fundo com efeito de gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00000005] to-[#00000015] dark:from-[#ffffff05] dark:to-[#ffffff10] opacity-50"></div>
      
      {/* Bolhas de design para efeito visual */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/5 dark:bg-blue-400/10 rounded-full blur-2xl"></div>
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/5 dark:bg-purple-400/10 rounded-full blur-xl"></div>
      
      {/* Cabeçalho do Card */}
      <div className="p-4 flex items-center justify-between relative z-10 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center space-x-2">
          <div className={`
            flex items-center justify-center w-9 h-9 rounded-lg
            ${isLightMode 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm border border-blue-100' 
              : 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-800/30'}
          `}>
            <Grid className={`h-5 w-5 ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`} />
          </div>
          <div>
            <h2 className={`font-medium text-base ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
              Atalhos School
            </h2>
            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Acesso rápido às ferramentas
            </p>
          </div>
        </div>
        <Star className={`h-4 w-4 ${isLightMode ? 'text-amber-400' : 'text-amber-300'}`} />
      </div>
      
      {/* Conteúdo Principal - Grid de Atalhos */}
      <div className="p-4 grid grid-cols-2 gap-3 flex-grow overflow-auto relative z-10">
        {atalhos.map((atalho) => (
          <motion.div
            key={atalho.id}
            className={`
              relative rounded-xl cursor-pointer overflow-hidden
              ${draggingId === atalho.id ? 'opacity-60 scale-95' : 'opacity-100'}
              ${dragOverId === atalho.id ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
              transition-all duration-200 transform
              ${isLightMode 
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm hover:shadow-md border border-gray-200/80' 
                : 'bg-gradient-to-br from-gray-900/40 to-gray-800/40 hover:from-gray-900/60 hover:to-gray-800/60 border border-gray-700/50'}
            `}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            draggable
            onDragStart={() => handleDragStart(atalho.id)}
            onDragOver={(e) => handleDragOver(e, atalho.id)}
            onDrop={(e) => handleDrop(e, atalho.id)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredAtalho(atalho.id)}
            onMouseLeave={() => setHoveredAtalho(null)}
            onClick={() => window.location.href = atalho.path}
          >
            {/* Gradiente de fundo para efeito de destaque no hover */}
            <div 
              className={`
                absolute inset-0 opacity-0 transition-opacity duration-300
                ${hoveredAtalho === atalho.id ? 'opacity-100' : ''}
                ${atalho.gradient}
              `} 
            />
            
            {/* Conteúdo do Atalho */}
            <div className="p-3 flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className={`
                  p-2 rounded-md
                  ${hoveredAtalho === atalho.id 
                    ? 'bg-white/20' 
                    : isLightMode 
                      ? `bg-gradient-to-br ${atalho.color} bg-opacity-10` 
                      : `bg-gradient-to-br ${atalho.color} bg-opacity-20`}
                `}>
                  <div className={`
                    ${hoveredAtalho === atalho.id ? 'text-white' : isLightMode ? 'text-gray-700' : 'text-white'}
                  `}>
                    {atalho.icon}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Indicador de arraste */}
                  <div className="h-4 w-4 rounded-full bg-gray-200/40 dark:bg-gray-700/40 flex items-center justify-center">
                    <span className="text-[8px] text-gray-500 dark:text-gray-400">↕</span>
                  </div>
                </div>
              </div>
              <h3 className={`
                font-medium text-sm mb-1
                ${hoveredAtalho === atalho.id ? 'text-white' : isLightMode ? 'text-gray-800' : 'text-white'}
              `}>
                {atalho.title}
              </h3>
              <p className={`
                text-xs line-clamp-2
                ${hoveredAtalho === atalho.id ? 'text-white/90' : isLightMode ? 'text-gray-500' : 'text-gray-400'}
              `}>
                {atalho.description}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Atalho para adicionar novos atalhos (visual apenas) */}
        <motion.div
          className={`
            rounded-xl cursor-pointer border border-dashed
            flex items-center justify-center p-3
            ${isLightMode 
              ? 'border-gray-300 bg-gray-50/50 hover:bg-gray-100/80' 
              : 'border-gray-700 bg-gray-900/20 hover:bg-gray-800/30'}
            transition-all duration-200
          `}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`
              p-2 rounded-full mb-2
              ${isLightMode ? 'bg-gray-100' : 'bg-gray-800/80'}
            `}>
              <Plus className={`h-4 w-4 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <span className={`text-xs font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Adicionar
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Rodapé com dica de uso */}
      <div className={`
        p-3 text-center text-xs relative z-10 border-t
        ${isLightMode ? 'border-gray-100 text-gray-500' : 'border-gray-800/50 text-gray-500'}
      `}>
        Arraste para personalizar a ordem dos atalhos
      </div>
    </Card>
  );
}
