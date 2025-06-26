
import React, { useState, useRef, useEffect } from "react";
import { Pencil, BookOpen, Calendar, Users, Brain, Settings, MessageSquare, ChevronRight, Grid, Sparkles, Plus, FileText, Lightbulb, Rocket, Star, Network } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import PersonalizarAtalhosModal, { Atalho } from "./PersonalizarAtalhosModal";

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoveredAtalho, setHoveredAtalho] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
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

    // Configura um observador de mutação para detectar mudanças no card "Seu Foco Hoje"
    const observer = new MutationObserver(adjustHeight);
    const focoHojeCard = document.querySelector('[data-card-type="foco-hoje"]');
    
    if (focoHojeCard) {
      observer.observe(focoHojeCard, { 
        attributes: true, 
        childList: true, 
        subtree: true,
        attributeFilter: ['style', 'class']
      });
      
      // Ajusta a altura inicialmente
      adjustHeight();
    }
    
    // Também ajusta a altura quando a janela é redimensionada
    window.addEventListener('resize', adjustHeight);
    
    // Ajusta periodicamente para garantir que está sincronizado
    const intervalId = setInterval(adjustHeight, 500);
    
    // Limpa o observador quando o componente é desmontado
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', adjustHeight);
      clearInterval(intervalId);
    };
  }, []);

  // Get saved atalhos from localStorage or use defaults
  const getSavedAtalhos = (): Atalho[] => {
    const savedAtalhos = localStorage.getItem('userAtalhos');
    if (savedAtalhos) {
      try {
        // Ensure icons are properly converted from string to React elements
        const parsed = JSON.parse(savedAtalhos);
        return parsed.map((atalho: any) => ({
          ...atalho,
          // The icons need to be reconstructed as React components
          icone: getIconComponent(atalho.iconName)
        }));
      } catch (error) {
        console.error("Failed to parse saved atalhos:", error);
        return getDefaultAtalhos();
      }
    }
    return getDefaultAtalhos();
  };

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      "BookOpen": <BookOpen className="h-5 w-5" />,
      "Calendar": <Calendar className="h-5 w-5" />,
      "Users": <Users className="h-5 w-5" />,
      "Brain": <Brain className="h-5 w-5" />,
      "MessageSquare": <MessageSquare className="h-5 w-5" />,
      "Settings": <Settings className="h-5 w-5" />,
      "FileText": <FileText className="h-5 w-5" />,
      "Lightbulb": <Lightbulb className="h-5 w-5" />,
      "Rocket": <Rocket className="h-5 w-5" />,
      "Star": <Star className="h-5 w-5" />,
      "Network": <Network className="h-5 w-5" />,
      "Plus": <Plus className="h-5 w-5" />
    };
    return iconMap[iconName] || <Settings className="h-5 w-5" />;
  };

  // Lista de atalhos padrão
  const getDefaultAtalhos = (): Atalho[] => [
    { id: 1, nome: "Biblioteca", icone: <BookOpen className="h-5 w-5" />, iconName: "BookOpen", cor: "text-blue-500", bgColor: isLightMode ? "bg-blue-100" : "bg-blue-500/10", link: "/biblioteca" },
    { id: 2, nome: "Agenda", icone: <Calendar className="h-5 w-5" />, iconName: "Calendar", cor: "text-[#FF6B00]", bgColor: isLightMode ? "bg-orange-100" : "bg-[#FF6B00]/10", link: "/agenda" },
    { id: 3, nome: "Turmas", icone: <Users className="h-5 w-5" />, iconName: "Users", cor: "text-green-500", bgColor: isLightMode ? "bg-green-100" : "bg-green-500/10", link: "/turmas" },
    { id: 4, nome: "Epictus IA", icone: <Brain className="h-5 w-5" />, iconName: "Brain", cor: "text-purple-500", bgColor: isLightMode ? "bg-purple-100" : "bg-purple-500/10", link: "/epictus-ia" },
    { id: 5, nome: "Conexão Expert", icone: <MessageSquare className="h-5 w-5" />, iconName: "MessageSquare", cor: "text-yellow-500", bgColor: isLightMode ? "bg-yellow-100" : "bg-yellow-500/10", link: "/conexao-expert" },
    { id: 6, nome: "Configurações", icone: <Settings className="h-5 w-5" />, iconName: "Settings", cor: "text-gray-500", bgColor: isLightMode ? "bg-gray-100" : "bg-gray-500/10", link: "/configuracoes" },
  ];

  // Lista completa de todos os atalhos disponíveis
  const getAllAvailableAtalhos = (): Atalho[] => [
    ...getDefaultAtalhos(),
    { id: 7, nome: "Resumos", icone: <FileText className="h-5 w-5" />, iconName: "FileText", cor: "text-cyan-500", bgColor: isLightMode ? "bg-cyan-100" : "bg-cyan-500/10", link: "/epictus-ia?tool=resumos" },
    { id: 8, nome: "Mapas Mentais", icone: <Network className="h-5 w-5" />, iconName: "Network", cor: "text-pink-500", bgColor: isLightMode ? "bg-pink-100" : "bg-pink-500/10", link: "/epictus-ia?tool=mapas-mentais" },
    { id: 9, nome: "Exercícios", icone: <Lightbulb className="h-5 w-5" />, iconName: "Lightbulb", cor: "text-emerald-500", bgColor: isLightMode ? "bg-emerald-100" : "bg-emerald-500/10", link: "/epictus-ia?tool=exercicios" },
    { id: 10, nome: "Planos de Estudo", icone: <Star className="h-5 w-5" />, iconName: "Star", cor: "text-indigo-500", bgColor: isLightMode ? "bg-indigo-100" : "bg-indigo-500/10", link: "/planos-estudo" },
    { id: 11, nome: "Recomendações", icone: <Rocket className="h-5 w-5" />, iconName: "Rocket", cor: "text-red-500", bgColor: isLightMode ? "bg-red-100" : "bg-red-500/10", link: "/epictus-ia?tool=recomendacoes" },
  ];

  const [atalhos, setAtalhos] = useState<Atalho[]>(getSavedAtalhos());

  const abrirModal = () => {
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const salvarAtalhos = (novosAtalhos: Atalho[]) => {
    // Save to state
    setAtalhos(novosAtalhos);

    // Prepare data for storage (convert React elements to strings)
    const storageAtalhos = novosAtalhos.map(atalho => ({
      ...atalho,
      icone: undefined, // Remove the React component as it can't be serialized
      iconName: atalho.iconName // Keep the icon name for reconstruction
    }));

    // Save to localStorage
    localStorage.setItem('userAtalhos', JSON.stringify(storageAtalhos));
  };

  const navegarPara = (link: string) => {
    console.log(`Navegando para ${link}`);
    window.location.href = link;
  };

  // Cards container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Card item variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { 
      y: -8,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <>
      <motion.div 
        ref={cardRef}
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} flex-shrink-0 flex flex-col h-full w-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header com gradiente igual ao card Seu Foco Hoje */}
        <div className={`p-6 relative ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/15 shadow-lg shadow-[#FF6B00]/5 border border-[#FF6B00]/30'}`}>
                <Grid className={`h-5 w-5 text-[#FF6B00]`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Atalhos School
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <span className="font-medium">Acesso rápido às ferramentas</span>
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex">
              <motion.button 
                onClick={abrirModal}
                className={`rounded-full p-2 ${isLightMode ? 'bg-orange-50 hover:bg-orange-100' : 'bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20'} transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pencil className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Grid de atalhos com design sofisticado */}
        <div className="p-5 flex flex-col flex-1">
          {/* Grid de atalhos com animações aprimoradas */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {atalhos.map((atalho) => (
              <motion.div
                key={atalho.id}
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer border transition-all ${
                  isLightMode 
                    ? 'border-gray-100 bg-white/80 hover:border-orange-200 hover:bg-orange-50/50' 
                    : 'border-gray-700/30 bg-gray-800/20 backdrop-blur-md hover:border-[#FF6B00]/30 hover:bg-[#FF6B00]/5'
                } shadow-sm hover:shadow-md`}
                variants={itemVariants}
                whileHover="hover"
                onMouseEnter={() => setHoveredAtalho(atalho.id)}
                onMouseLeave={() => setHoveredAtalho(null)}
                onClick={() => navegarPara(atalho.link)}
              >
                <div className={`flex items-center justify-center p-3.5 rounded-full mb-3 ${atalho.bgColor} transition-all duration-300 ${
                  hoveredAtalho === atalho.id ? 'scale-110 shadow-md' : 'scale-100'
                }`}>
                  <div className={atalho.cor}>
                    {atalho.icone}
                  </div>
                </div>
                <span className={`text-sm font-medium text-center ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                  {atalho.nome}
                </span>
                
                {/* Efeito de destaque ao passar o mouse */}
                {hoveredAtalho === atalho.id && (
                  <motion.div 
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-transparent to-transparent ring-1 ring-inset ring-white/10"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 mx-auto w-10 rounded-full"
                      style={{ 
                        backgroundColor: atalho.cor.includes("text-") ? atalho.cor.replace("text-", "bg-") : "bg-[#FF6B00]"
                      }}
                    ></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
            
            {/* Botão de adicionar novo atalho */}
            {atalhos.length < 6 && (
              <motion.div
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer border border-dashed transition-all ${
                  isLightMode 
                    ? 'border-gray-300 hover:border-orange-300 bg-gray-50/50 hover:bg-orange-50/30' 
                    : 'border-gray-700 hover:border-[#FF6B00]/40 bg-gray-800/10 hover:bg-[#FF6B00]/5'
                }`}
                variants={itemVariants}
                whileHover="hover"
                onClick={abrirModal}
              >
                <div className={`flex items-center justify-center p-3.5 rounded-full mb-3 ${
                  isLightMode ? 'bg-gray-100 hover:bg-orange-100/50' : 'bg-gray-800/30 hover:bg-[#FF6B00]/10'
                }`}>
                  <Plus className={`h-5 w-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-medium text-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Adicionar
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Footer com botão de personalização */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-end"
          >
            <motion.button 
              className={`rounded-lg px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              animate={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              whileHover={{ 
                boxShadow: "0 4px 12px rgba(255, 107, 0, 0.25)",
                scale: 1.03, 
                y: -1 
              }}
              onClick={abrirModal}
            >
              Personalizar Atalhos
              <ChevronRight className="h-4 w-4 opacity-80" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de personalização */}
      <PersonalizarAtalhosModal
        isOpen={isModalOpen}
        onClose={fecharModal}
        atalhos={atalhos}
        onSave={salvarAtalhos}
        disponiveis={getAllAvailableAtalhos()}
      />
    </>
  );
}
