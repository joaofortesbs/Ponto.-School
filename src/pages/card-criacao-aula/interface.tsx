import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, LayoutGrid, Palette, Settings, PenTool } from 'lucide-react';
import AgenteProfessorCard from './components/AgenteProfessorCard';
import PersonalizationStepCard from './components/PersonalizationStepCard';
import SchoolToolsContent from './components/SchoolToolsContent';
import StyleDefinitionContent from './components/StyleDefinitionContent';
import { Template } from './components/TemplateDropdown';

interface CriacaoAulaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGerarAula: (template: Template | null) => void;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

// Dimensões escaladas proporcionalmente para modal de 900px (redução de 25% do tamanho original)
const CARD_HEIGHT = 42; // Reduzido de 56px (75% do original)
const CARD_MAX_WIDTH = 310; // Reduzido de 450px para 310px (melhor proporção para 3 cards)
const CARD_GAP = '24px'; // Gap entre cards internos
const TEXT_PADDING_LEFT = 50; // Distância do texto "Agente Professor" a partir da esquerda (em pixels)

const CriacaoAulaPanel: React.FC<CriacaoAulaPanelProps> = ({
  isOpen,
  onClose,
  onGerarAula
}) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Professor');
  const [expandedCard, setExpandedCard] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isTemplateCompleted, setIsTemplateCompleted] = useState(false);
  const [isSchoolToolsCompleted, setIsSchoolToolsCompleted] = useState(false);
  const [isStyleCompleted, setIsStyleCompleted] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cachedAvatar = localStorage.getItem('userAvatarUrl');
        const cachedName = localStorage.getItem('userFirstName');
        
        if (cachedAvatar) {
          setUserAvatar(cachedAvatar);
        }
        if (cachedName) {
          setUserName(cachedName);
        }

        const userId = localStorage.getItem('user_id');
        if (userId) {
          const response = await fetch(`/api/perfis?id=${userId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              if (result.data.imagem_avatar) {
                setUserAvatar(result.data.imagem_avatar);
                localStorage.setItem('userAvatarUrl', result.data.imagem_avatar);
              }
              if (result.data.nome_completo) {
                const firstName = result.data.nome_completo.split(' ')[0];
                setUserName(firstName);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleGerarAula = () => {
    console.log('🎯 Gerando aula...');
    onGerarAula(selectedTemplate);
  };

  const handleTemplateChange = (template: Template | null) => {
    setSelectedTemplate(template);
    setIsTemplateCompleted(template !== null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal centralizado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div 
              className="flex flex-col max-h-[90vh] w-full pointer-events-auto transition-all duration-300"
              style={{ 
                background: '#030C2A',
                borderRadius: `${PANEL_BORDER_RADIUS}px`,
                border: '1px solid rgba(255, 107, 0, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 107, 0, 0.1)',
                maxWidth: '900px',
                filter: isTemplateDropdownOpen ? 'blur(4px)' : 'blur(0px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
          <div 
            className="flex items-center justify-between border-b border-[#FF6B00]/20 flex-shrink-0 relative z-50" 
            style={{ 
              padding: `${PANEL_HEADER_PADDING}px ${PANEL_PADDING_HORIZONTAL}px`, 
              background: '#0a1434', 
              borderRadius: `${PANEL_HEADER_BORDER_RADIUS}px ${PANEL_HEADER_BORDER_RADIUS}px 0 0` 
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 107, 0, 0.15)' }}
              >
                <BookOpen className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h2 className="text-lg font-bold text-white">Personalize sua aula</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
            <div className="space-y-6 w-full" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <PersonalizationStepCard
                stepNumber={1}
                title="Personalize o estilo da sua aula:"
                animationDelay={0.1}
                icon={<Palette className="w-5 h-5" />}
                isOpen={expandedCard === 1}
                onToggle={() => setExpandedCard(1)}
                isCompleted={isTemplateCompleted}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: CARD_GAP }}>
                  <AgenteProfessorCard 
                    userAvatar={userAvatar}
                    cardHeight={CARD_HEIGHT}
                    cardMaxWidth={CARD_MAX_WIDTH}
                    cardTitle="Agente Professor"
                    animationDelay={0.15}
                    showUserAvatar={true}
                  />
                  
                  <AgenteProfessorCard 
                    cardHeight={CARD_HEIGHT}
                    cardMaxWidth={CARD_MAX_WIDTH}
                    cardTitle="Add. uma Turma"
                    animationDelay={0.2}
                    showUserAvatar={false}
                  />

                  <AgenteProfessorCard 
                    cardHeight={CARD_HEIGHT}
                    cardMaxWidth={CARD_MAX_WIDTH}
                    cardTitle="Add. um Template"
                    animationDelay={0.25}
                    showUserAvatar={false}
                    customIcon={LayoutGrid}
                    isTemplateCard={true}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={handleTemplateChange}
                    onTemplateDropdownChange={setIsTemplateDropdownOpen}
                  />
                </div>
              </PersonalizationStepCard>

              <PersonalizationStepCard
                stepNumber={2}
                title="Configure as suas School Tools:"
                animationDelay={0.35}
                icon={<Settings className="w-5 h-5" />}
                isOpen={expandedCard === 2}
                onToggle={() => setExpandedCard(2)}
                isCompleted={isSchoolToolsCompleted}
              >
                <SchoolToolsContent onCompletionChange={setIsSchoolToolsCompleted} />
              </PersonalizationStepCard>

              <PersonalizationStepCard
                stepNumber={3}
                title="Defina qual é o objetivo da sua aula:"
                animationDelay={0.4}
                icon={<PenTool className="w-5 h-5" />}
                isOpen={expandedCard === 3}
                onToggle={() => setExpandedCard(3)}
                isCompleted={isStyleCompleted}
              >
                <StyleDefinitionContent onCompletionChange={setIsStyleCompleted} />
              </PersonalizationStepCard>

              {/* Botão Gerar Aula - Fora dos cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex justify-end pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGerarAula}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Gerar aula</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CriacaoAulaPanel;
