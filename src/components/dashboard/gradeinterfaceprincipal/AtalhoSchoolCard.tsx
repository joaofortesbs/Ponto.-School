
import React, { useState } from "react";
import { Pencil, BookOpen, Calendar, Users, Brain, Settings, MessageSquare, ChevronRight, Grid, Sparkles, Plus } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoveredAtalho, setHoveredAtalho] = useState<number | null>(null);

  // Lista de atalhos padrão
  const atalhos = [
    { id: 1, nome: "Biblioteca", icone: <BookOpen className="h-5 w-5" />, cor: "text-blue-500", bgColor: isLightMode ? "bg-blue-100" : "bg-blue-500/10", link: "/biblioteca" },
    { id: 2, nome: "Agenda", icone: <Calendar className="h-5 w-5" />, cor: "text-[#FF6B00]", bgColor: isLightMode ? "bg-orange-100" : "bg-[#FF6B00]/10", link: "/agenda" },
    { id: 3, nome: "Turmas", icone: <Users className="h-5 w-5" />, cor: "text-green-500", bgColor: isLightMode ? "bg-green-100" : "bg-green-500/10", link: "/turmas" },
    { id: 4, nome: "Epictus IA", icone: <Brain className="h-5 w-5" />, cor: "text-purple-500", bgColor: isLightMode ? "bg-purple-100" : "bg-purple-500/10", link: "/epictus-ia" },
    { id: 5, nome: "Conexão Expert", icone: <MessageSquare className="h-5 w-5" />, cor: "text-yellow-500", bgColor: isLightMode ? "bg-yellow-100" : "bg-yellow-500/10", link: "/conexao-expert" },
    { id: 6, nome: "Configurações", icone: <Settings className="h-5 w-5" />, cor: "text-gray-500", bgColor: isLightMode ? "bg-gray-100" : "bg-gray-500/10", link: "/configuracoes" },
  ];

  const abrirModal = () => {
    // Aqui seria implementada a lógica para abrir o modal de personalização
    console.log("Abrir modal de personalização");
  };

  const navegarPara = (link) => {
    // Aqui seria implementada a lógica para navegar para o link
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
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full flex-shrink-0 flex flex-col self-start`}
      style={{ height: 'calc(100% - 2px)', maxHeight: '100%', minHeight: '600px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header elegante com gradiente */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 via-orange-100/70 to-orange-50/40' : 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/15 shadow-lg shadow-[#FF6B00]/5 border border-[#FF6B00]/30'}`}>
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
      <div className="p-5">
        {/* Grid de atalhos com animações aprimoradas */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
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
        </motion.div>

        {/* Footer com botão de personalização */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-end"
        >
          <motion.button 
            className={`rounded-xl px-5 py-2.5 text-xs font-medium bg-gradient-to-r from-[#FF6B00] to-amber-500 text-white shadow-sm hover:shadow-lg transition-all flex items-center gap-2 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px -10px rgba(255, 107, 0, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={abrirModal}
          >
            Personalizar Atalhos
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
