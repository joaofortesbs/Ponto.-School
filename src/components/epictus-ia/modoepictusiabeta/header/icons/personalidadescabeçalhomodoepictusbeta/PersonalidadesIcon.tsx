
import React, { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import PersonalidadesModal from "../../../../modals/PersonalidadesModal";
import { motion } from "framer-motion";

const PersonalidadesIcon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePersonalidade, setActivePersonalidade] = useState("padrao");
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectPersonalidade = (personalidadeId: string) => {
    console.log(`Personalidade selecionada: ${personalidadeId}`);
    setActivePersonalidade(personalidadeId);
    // Opcional: fechar o modal após seleção
    // setIsModalOpen(false);
  };

  return (
    <>
      <motion.div 
        className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1.5 rounded-full cursor-pointer hover:shadow-md transition-all personalidades-root"
        onClick={handleOpenModal}
        style={{ zIndex: 100000 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="bg-white/20 p-1 rounded-full mr-2">
          <User className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-white text-sm font-medium">Personalidades</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1.5 text-white/80" />
      </motion.div>

      <PersonalidadesModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onPersonalidadeSelect={handleSelectPersonalidade}
        personalidades={[
          {
            id: "padrao",
            nome: "Padrão",
            descricao: "O assistente Epictus IA com comportamento padrão, equilibrando formalidade e conversação natural.",
            ativa: activePersonalidade === "padrao",
            icone: <User className="h-5 w-5" />
          },
          {
            id: "professor",
            nome: "Professor",
            descricao: "Explicações didáticas e completas, focando em exemplos e analogias para facilitar o aprendizado.",
            ativa: activePersonalidade === "professor",
            icone: <GraduationCap className="h-5 w-5" />
          },
          {
            id: "cientista",
            nome: "Cientista",
            descricao: "Abordagem analítica e baseada em evidências, com referências a pesquisas e maior profundidade técnica.",
            ativa: activePersonalidade === "cientista",
            icone: <Brain className="h-5 w-5" />
          },
          {
            id: "mentor",
            nome: "Mentor",
            descricao: "Foco em orientação e desenvolvimento pessoal, com perguntas reflexivas e estímulo ao pensamento crítico.",
            ativa: activePersonalidade === "mentor",
            icone: <Lightbulb className="h-5 w-5" />
          },
          {
            id: "simplificador",
            nome: "Simplificador",
            descricao: "Explicações extremamente simplificadas e diretas, ideal para entendimento rápido de conceitos complexos.",
            ativa: activePersonalidade === "simplificador",
            icone: <Zap className="h-5 w-5" />
          },
        ]}
      />
    </>
  );
};

// Importando os ícones necessários
import { GraduationCap, Brain, Lightbulb, Zap } from "lucide-react";

export default PersonalidadesIcon;;
