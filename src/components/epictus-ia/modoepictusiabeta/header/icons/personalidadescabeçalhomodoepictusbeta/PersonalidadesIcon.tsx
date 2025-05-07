import React, { useState, useEffect } from "react";
import { User, ChevronDown, RefreshCw } from "lucide-react";
import PersonalidadesModal from "../../../../modals/PersonalidadesModal";
import { motion } from "framer-motion";
import Button from "../../../../components/Button"; // Assuming Button component exists

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
      <Button
        variant="ghost"
        onClick={handleOpenModal}
        className={`relative h-10 rounded-full px-4 flex items-center gap-1.5 ${
          isModalOpen
            ? "bg-[#102C51] text-[#4A9FFF] ring-2 ring-[#1E63B4]/50"
            : "bg-[#0A1F38] text-[#7EB6F7] hover:bg-[#0F2A4F] hover:text-[#A9D2FF]"
        } shadow-lg transition-all duration-200 header-icon-button backdrop-blur-sm`}
        style={{
          boxShadow: isModalOpen ? '0 0 10px rgba(28, 100, 242, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.15)',
        }}
      >
        <motion.div
          className="flex items-center"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.03 }}
        >
          <span className="text-sm font-medium">{personalidadeNomes[activePersonalidade] || "Professor"}</span>
          <motion.div
            animate={{ rotate: isModalOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} className="ml-1" />
          </motion.div>
          {isModalOpen && (
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: "linear-gradient(45deg, rgba(28, 100, 242, 0.1), rgba(74, 159, 255, 0.1))",
                zIndex: -1,
                borderRadius: "9999px"
              }}
            />
          )}
        </motion.div>
      </Button>

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