
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BrainCircuit, 
  Image as ImageIcon, 
  Mic, 
  BookOpen, 
  FileText, 
  GitBranch, 
  FileEdit, 
  FileCheck, 
  FileText2, 
  GraduationCap
} from "lucide-react";

const EpictusIAMainContainer = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [isFocused, setIsFocused] = useState(false);
  
  // Efeito de flutuação suave ao rolar
  const scale = useTransform(scrollY, [0, 300], [1, 1.01]);
  const shadow = useTransform(
    scrollY,
    [0, 300],
    ["0 4px 20px rgba(0, 0, 0, 0.3)", "0 8px 30px rgba(0, 0, 0, 0.4)"]
  );

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const isDark = theme === "dark";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ scale, boxShadow: shadow }}
      className={`w-full px-6 py-6 mt-4 mb-8 rounded-[20px] transition-all duration-300 overflow-hidden
                ${isDark 
                  ? 'bg-gradient-to-br from-[#0a0f1c] to-[#131b2d] border border-gray-800/20' 
                  : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200/50'}`}
    >
      <div className="backdrop-blur-xl">
        {/* Botões superiores: Buscar, Pensar, Gerar Imagem e Espaços de Aprendizado */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
          <Button 
            variant="outline" 
            className={`gap-2 px-5 py-4 h-auto rounded-xl font-medium transition-all duration-300 hover:scale-105
                      ${isDark 
                        ? 'bg-gray-800/60 text-white border-gray-700 hover:bg-gray-700/70' 
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
          >
            <Search className="h-5 w-5 text-blue-500" />
            Buscar
          </Button>
          
          <Button 
            variant="outline" 
            className={`gap-2 px-5 py-4 h-auto rounded-xl font-medium transition-all duration-300 hover:scale-105
                      ${isDark 
                        ? 'bg-gray-800/60 text-white border-gray-700 hover:bg-gray-700/70' 
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
          >
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            Pensar
          </Button>
          
          <Button 
            variant="outline" 
            className={`gap-2 px-5 py-4 h-auto rounded-xl font-medium transition-all duration-300 hover:scale-105
                      ${isDark 
                        ? 'bg-gray-800/60 text-white border-gray-700 hover:bg-gray-700/70' 
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
          >
            <ImageIcon className="h-5 w-5 text-green-500" />
            Gerar Imagem
          </Button>
          
          <Button 
            variant="outline" 
            className={`gap-2 px-5 py-4 h-auto rounded-xl font-medium transition-all duration-300 hover:scale-105 espacos-aprendizado-button
                      ${isDark 
                        ? 'bg-gray-800/60 text-white border-gray-700 hover:bg-gray-700/70' 
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
          >
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            Espaços de aprendizado
          </Button>
        </div>

        {/* Campo de input com botão de microfone */}
        <div className={`relative mb-8 transition-all duration-300 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
          <Input
            placeholder="Digite sua pergunta ou comando aqui..."
            className={`h-14 pl-5 pr-14 rounded-xl text-base bg-opacity-80 backdrop-blur-sm
                      ${isDark 
                        ? 'bg-gray-900/50 text-white border-gray-700 focus:border-purple-500 placeholder:text-gray-400' 
                        : 'bg-white text-gray-800 border-gray-200 focus:border-purple-500 placeholder:text-gray-500'}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        {/* Botões de ações rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: <BookOpen className="h-4 w-4" />, label: "Simulador de Provas", color: "blue" },
            { icon: <FileText className="h-4 w-4" />, label: "Gerar Caderno", color: "emerald" },
            { icon: <GitBranch className="h-4 w-4" />, label: "Criar Fluxograma", color: "purple" },
            { icon: <FileEdit className="h-4 w-4" />, label: "Reescrever Explicação", color: "amber" },
            { icon: <FileCheck className="h-4 w-4" />, label: "Análise de Redação", color: "rose" },
            { icon: <FileText2 className="h-4 w-4" />, label: "Resumir Conteúdo", color: "cyan" },
          ].map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col gap-1.5 h-auto py-4 rounded-xl transition-all hover:scale-105
                        ${isDark 
                          ? 'bg-gray-800/40 hover:bg-gray-700/60 text-white' 
                          : 'bg-white/80 hover:bg-gray-50 text-gray-800'}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 
                              ${btn.color === "blue" ? "bg-blue-500/20 text-blue-500" : 
                                btn.color === "emerald" ? "bg-emerald-500/20 text-emerald-500" :
                                btn.color === "purple" ? "bg-purple-500/20 text-purple-500" :
                                btn.color === "amber" ? "bg-amber-500/20 text-amber-500" :
                                btn.color === "rose" ? "bg-rose-500/20 text-rose-500" :
                                "bg-cyan-500/20 text-cyan-500"}`}
              >
                {btn.icon}
              </div>
              <span className="text-xs font-medium text-center">{btn.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EpictusIAMainContainer;
