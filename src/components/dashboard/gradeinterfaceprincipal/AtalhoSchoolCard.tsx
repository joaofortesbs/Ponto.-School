
import React, { useState, useEffect } from "react";
import { Pencil, BookOpen, Calendar, Users, Brain, Settings, MessageSquare, ChevronRight, Grid, Sparkles, Plus } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, Reorder } from "framer-motion";

// Interface para os atalhos
interface Atalho {
  id: number;
  icon: React.ReactNode;
  name: string;
  url: string;
}

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoveredAtalho, setHoveredAtalho] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Estado para armazenar os atalhos que podem ser reordenados
  const [atalhos, setAtalhos] = useState<Atalho[]>([
    { id: 1, icon: <BookOpen className="h-5 w-5" />, name: "Portal do Conhecimento", url: "/portal" },
    { id: 2, icon: <Calendar className="h-5 w-5" />, name: "Agenda", url: "/agenda" },
    { id: 3, icon: <Users className="h-5 w-5" />, name: "Turmas", url: "/turmas" },
    { id: 4, icon: <Brain className="h-5 w-5" />, name: "Epictus IA", url: "/epictus-ia" },
    { id: 5, icon: <MessageSquare className="h-5 w-5" />, name: "Chat IA", url: "/chat-ia" },
    { id: 6, icon: <Grid className="h-5 w-5" />, name: "Organização", url: "/organizacao" },
  ]);

  // Carregar a ordem personalizada do localStorage ao iniciar
  useEffect(() => {
    const savedAtalhos = localStorage.getItem('atalhos-order');
    if (savedAtalhos) {
      try {
        setAtalhos(JSON.parse(savedAtalhos));
      } catch (e) {
        console.error("Erro ao carregar atalhos do localStorage:", e);
      }
    }
  }, []);

  // Salvar a ordem no localStorage quando mudar
  useEffect(() => {
    if (atalhos.length > 0) {
      localStorage.setItem('atalhos-order', JSON.stringify(atalhos));
    }
  }, [atalhos]);

  // Função para alternar o modo de edição
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // Resetar hover quando entrar/sair do modo de edição
    setHoveredAtalho(null);
  };

  return (
    <div 
      className={`
        ${isLightMode ? 'bg-white' : 'bg-[#001e3a]/90'} 
        rounded-xl p-5 shadow-lg border 
        ${isLightMode ? 'border-slate-200' : 'border-white/10'} 
        h-[600px] overflow-hidden relative
      `}
    >
      {/* Cabeçalho com gradiente */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#29335C] to-[#001427] rounded-t-xl">
        <div className="flex justify-between items-center p-4 relative">
          <h3 className="text-white text-lg font-bold flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
            Atalhos School
          </h3>
          <button 
            onClick={toggleEditMode}
            className={`
              p-1.5 rounded-full transition-all duration-200
              ${isEditMode 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white/20 text-white hover:bg-white/30'}
            `}
            title={isEditMode ? "Salvar personalização" : "Personalizar atalhos"}
          >
            {isEditMode ? <Settings className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Espaçamento para o conteúdo ficar abaixo do cabeçalho */}
      <div className="pt-16 pb-2">
        <div className="flex flex-col">
          {/* Mensagem instruindo sobre o modo de edição */}
          {isEditMode && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Arraste os cards para reorganizá-los e clique em <Settings className="h-3 w-3 inline" /> para salvar
              </p>
            </div>
          )}

          {/* Lista de Atalhos usando Reorder do framer-motion quando em modo de edição */}
          {isEditMode ? (
            <Reorder.Group axis="y" values={atalhos} onReorder={setAtalhos} className="space-y-3 flex flex-col">
              {atalhos.map((atalho) => (
                <Reorder.Item 
                  key={atalho.id} 
                  value={atalho}
                  className="cursor-move"
                >
                  <div 
                    className={`
                      flex items-center p-3 rounded-lg transition-all duration-200
                      ${isLightMode 
                        ? 'hover:bg-gray-100 bg-gray-50 border border-gray-200' 
                        : 'hover:bg-[#1a2e48] bg-[#0d1b2a] border border-slate-700'}
                    `}
                  >
                    <div className={`
                      p-2 rounded-full mr-3
                      ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-900/50 text-indigo-400'}
                    `}>
                      {atalho.icon}
                    </div>
                    <span className={`flex-grow font-medium text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {atalho.name}
                    </span>
                    <div className="ml-2 text-gray-400">
                      <Grid className="h-4 w-4" />
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            // Exibição normal quando não estiver em modo de edição
            <div className="space-y-3 grid grid-cols-1 gap-3">
              {atalhos.map((atalho) => (
                <motion.a
                  href={atalho.url}
                  key={atalho.id}
                  className={`
                    flex items-center p-3 rounded-lg transition-all duration-200
                    ${isLightMode 
                      ? 'hover:bg-gray-100 bg-white border border-gray-200' 
                      : 'hover:bg-[#1a2e48] bg-[#0d1b2a] border border-slate-700'}
                  `}
                  onMouseEnter={() => setHoveredAtalho(atalho.id)}
                  onMouseLeave={() => setHoveredAtalho(null)}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`
                    p-2 rounded-full mr-3
                    ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-900/50 text-indigo-400'}
                  `}>
                    {atalho.icon}
                  </div>
                  <span className={`flex-grow font-medium text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    {atalho.name}
                  </span>
                  <div className={`
                    ml-2 transition-all duration-200
                    ${hoveredAtalho === atalho.id ? 'opacity-100' : 'opacity-0'}
                  `}>
                    <ChevronRight className={`h-4 w-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* Botão de Personalizar Atalhos no rodapé */}
          <div className="mt-auto pt-4 flex justify-center">
            <button
              onClick={toggleEditMode}
              className={`
                w-full py-2 px-4 rounded-lg font-medium text-sm transition-all
                ${isLightMode 
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200' 
                  : 'text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/50'}
                ${isEditMode && 'animate-pulse'}
              `}
            >
              {isEditMode 
                ? <span className="flex items-center justify-center"><Settings className="h-4 w-4 mr-2" /> Salvar personalização</span>
                : <span className="flex items-center justify-center"><Pencil className="h-4 w-4 mr-2" /> Personalizar atalhos</span>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
