
import React, { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import PersonalidadesModal from "../../../../modals/PersonalidadesModal";
import { motion } from "framer-motion";

const PersonalidadesIcon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePersonalidade, setActivePersonalidade] = useState("estudante");
  
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
            id: "estudante",
            nome: "Estudante",
            descricao: "Respostas didáticas e simplificadas, ideais para aprendizado e revisão de conteúdos acadêmicos.",
            ativa: activePersonalidade === "estudante",
            icone: <GraduationCap className="h-5 w-5" />
          },
          {
            id: "professor",
            nome: "Professor",
            descricao: "Explicações detalhadas com exemplos práticos e acompanhamento pedagógico de alto nível.",
            ativa: activePersonalidade === "professor",
            icone: <BookOpen className="h-5 w-5" />
          },
          {
            id: "mentor",
            nome: "Mentor",
            descricao: "Foco em desenvolvimento pessoal, orientação de carreira e apoio para tomada de decisões.",
            ativa: activePersonalidade === "mentor",
            icone: <Lightbulb className="h-5 w-5" />
          },
          {
            id: "expert",
            nome: "Expert",
            descricao: "Abordagem técnica avançada com conhecimento especializado e termos específicos da área.",
            ativa: activePersonalidade === "expert",
            icone: <Award className="h-5 w-5" />
          }: "Simplificador",
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
import { GraduationCap, BookOpen, Lightbulb, Award } from "lucide-react";

export default PersonalidadesIcon;;
