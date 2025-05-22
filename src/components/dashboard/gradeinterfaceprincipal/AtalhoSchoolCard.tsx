
import React, { useState } from "react";
import { Pencil, BookOpen, Calendar, Users, Brain, Settings, MessageSquare, ChevronRight, Grid, Sparkles } from "lucide-react";
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

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full flex flex-col self-stretch`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header elegante com gradiente - estilo igual ao FocoDoDiaCard */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-blue-100' : 'border-blue-500/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'}`}>
              <Grid className={`h-5 w-5 text-blue-500`} />
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
            <button 
              onClick={abrirModal}
              className={`rounded-full p-2 ${isLightMode ? 'bg-blue-50 hover:bg-blue-100' : 'bg-blue-500/10 hover:bg-blue-500/20'} transition-colors`}
            >
              <Pencil className={`h-4 w-4 ${isLightMode ? 'text-blue-500' : 'text-blue-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de atalhos */}
      <div className="p-5">
        {/* Mensagem de recomendação */}
        <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-blue-50' : 'bg-blue-500/5'} border ${isLightMode ? 'border-blue-100' : 'border-blue-500/20'}`}>
          <div className="flex gap-2 items-start">
            <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              <span className="font-medium">Dica:</span> Organize seus atalhos mais usados para maximizar sua produtividade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {atalhos.map((atalho) => (
            <motion.div
              key={atalho.id}
              className={`relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border transition-all ${
                isLightMode 
                  ? 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50' 
                  : 'border-gray-700/30 hover:border-blue-500/30 hover:bg-blue-500/5'
              }`}
              whileHover={{ y: -4, scale: 1.02 }}
              onMouseEnter={() => setHoveredAtalho(atalho.id)}
              onMouseLeave={() => setHoveredAtalho(null)}
              onClick={() => navegarPara(atalho.link)}
            >
              <div className={`flex items-center justify-center p-3 rounded-lg mb-2 ${atalho.bgColor} transition-all duration-300 ${
                hoveredAtalho === atalho.id ? 'scale-110' : 'scale-100'
              }`}>
                <div className={atalho.cor}>
                  {atalho.icone}
                </div>
              </div>
              <span className={`text-sm font-medium text-center ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                {atalho.nome}
              </span>
              
              {/* Indicador de hover */}
              {hoveredAtalho === atalho.id && (
                <motion.div 
                  className="absolute bottom-0 w-1/2 h-0.5 rounded-full"
                  style={{ 
                    backgroundColor: atalho.cor.includes("text-") ? atalho.cor.replace("text-", "bg-") : "bg-blue-500"
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: "50%" }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer com botão de personalização */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-end">
          <motion.button 
            className={`rounded-lg px-4 py-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ${isLightMode ? '' : 'border border-blue-400/40'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={abrirModal}
          >
            Personalizar Atalhos
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
