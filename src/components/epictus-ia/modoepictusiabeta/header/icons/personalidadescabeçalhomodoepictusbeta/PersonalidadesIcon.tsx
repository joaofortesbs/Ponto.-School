import React, { useState, useEffect } from "react";
import { User, ChevronDown, RefreshCw } from "lucide-react";
import PersonalidadesModal from "../../../../modals/PersonalidadesModal";
import { motion } from "framer-motion";

// Importando os ícones necessários
import { GraduationCap, BookOpen, Lightbulb, Award } from "lucide-react";

// Mapeamento de IDs para nomes exibidos
const personalidadeNomes: Record<string, string> = {
  "estudante": "Estudante",
  "professor": "Professor",
  "mentor": "Mentor",
  "expert": "Expert",
  "nenhuma": "Personalidades" // Adicionando estado padrão
};

const PersonalidadesIcon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePersonalidade, setActivePersonalidade] = useState("nenhuma");
  const [showPersonalityName, setShowPersonalityName] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Carregar preferência salva, se existir
  useEffect(() => {
    const savedPersonalidade = localStorage.getItem("epictus-personalidade-ativa");
    const savedShowName = localStorage.getItem("epictus-mostrar-nome-personalidade");
    const firstVisitCheck = localStorage.getItem("epictus-first-visit-check");

    if (savedPersonalidade && savedPersonalidade !== "nenhuma") {
      setActivePersonalidade(savedPersonalidade);
    }

    if (savedShowName === "true") {
      setShowPersonalityName(true);
    }

    if (firstVisitCheck) {
      setIsFirstVisit(false);
    } else {
      // Marca que o usuário já visitou esta página
      localStorage.setItem("epictus-first-visit-check", "true");
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectPersonalidade = (personalidadeId: string) => {
    console.log(`Personalidade selecionada: ${personalidadeId}`);
    setActivePersonalidade(personalidadeId);

    // Salvar a preferência
    localStorage.setItem("epictus-personalidade-ativa", personalidadeId);

    // Opcional: fechar o modal após seleção
    // setIsModalOpen(false);
  };

  // Função para resetar a personalidade para o estado padrão
  const resetPersonalidade = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique abra o modal
    setActivePersonalidade("nenhuma");
    localStorage.setItem("epictus-personalidade-ativa", "nenhuma");
    console.log("Personalidade resetada para o estado padrão");
  };

  return (
    <>
      <motion.div 
        className="flex items-center bg-gradient-to-r from-[#0A2472] to-[#0D47A1] px-3.5 py-2 rounded-full cursor-pointer hover:shadow-md transition-all personalidades-root"
        onClick={handleOpenModal}
        style={{ zIndex: 100000 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="bg-white/20 p-1.5 rounded-full mr-2.5">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-white text-sm font-medium">
          {personalidadeNomes[activePersonalidade] || "Personalidades"}
        </span>
        {activePersonalidade !== "nenhuma" && (
          <motion.div 
            className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer"
            onClick={resetPersonalidade}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Reiniciar personalidade"
          >
            <RefreshCw className="h-3.5 w-3.5 text-white/90" />
          </motion.div>
        )}
        <ChevronDown className="h-4 w-4 ml-2 text-white/80" />
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
            icone: <GraduationCap className="h-5 w-5 text-white" />
          },
          {
            id: "professor",
            nome: "Professor",
            descricao: "Explicações detalhadas com exemplos práticos e acompanhamento pedagógico de alto nível.",
            ativa: activePersonalidade === "professor",
            icone: <BookOpen className="h-5 w-5 text-white" />
          },
          {
            id: "mentor",
            nome: "Mentor",
            descricao: "Foco em desenvolvimento pessoal, orientação de carreira e apoio para tomada de decisões.",
            ativa: activePersonalidade === "mentor",
            icone: <Lightbulb className="h-5 w-5 text-white" />
          },
          {
            id: "expert",
            nome: "Expert",
            descricao: "Abordagem técnica avançada com conhecimento especializado e termos específicos da área.",
            ativa: activePersonalidade === "expert",
            icone: <Award className="h-5 w-5 text-white" />
          }
        ]}
      />
    </>
  );
};

export default PersonalidadesIcon;