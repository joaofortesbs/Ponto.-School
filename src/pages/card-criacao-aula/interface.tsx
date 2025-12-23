import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, LayoutGrid, Palette, Settings, PenTool, Loader2 } from 'lucide-react';
import AgenteProfessorCard from './components/AgenteProfessorCard';
import PersonalizationStepCard from './components/PersonalizationStepCard';
import SchoolToolsContent from './components/SchoolToolsContent';
import StyleDefinitionContent from './components/StyleDefinitionContent';
import { Template, TEMPLATE_SECTIONS } from './components/TemplateDropdown';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';
import { mapAIResponseToAula, validateAIResponse } from '@/utils/aiResponseMapper';
import { orchestratorService } from '@/features/lesson-orchestrator';
import { WorkflowModal } from '@/features/lesson-orchestrator';
import type { WorkflowState, LessonContext as OrchestratorLessonContext, OrchestratorResult } from '@/features/lesson-orchestrator/types';

interface CriacaoAulaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGerarAula: (template: Template | null, generatedData?: GeneratedLessonData) => void;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

const CARD_HEIGHT = 42;
const CARD_MAX_WIDTH = 310;
const CARD_GAP = '24px';

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
  const [assunto, setAssunto] = useState('');
  const [contexto, setContexto] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);

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

  useEffect(() => {
    return () => {
      orchestratorService.disconnectAllSSE();
    };
  }, []);

  const handleGerarAula = async () => {
    console.log('🎯 [INTERFACE] ========================================');
    console.log('🎯 [INTERFACE] INICIANDO GERAÇÃO DE AULA COM ORQUESTRADOR');
    console.log('🎯 [INTERFACE] ========================================');
    console.log('🎯 [INTERFACE] Template:', selectedTemplate?.name || 'Nenhum');
    console.log('🎯 [INTERFACE] Template ID:', selectedTemplate?.id || 'N/A');
    console.log('🎯 [INTERFACE] Assunto:', assunto);
    console.log('🎯 [INTERFACE] Contexto:', contexto || '[não fornecido]');
    
    if (!selectedTemplate) {
      console.log('❌ [INTERFACE] Erro: Nenhum template selecionado');
      setGenerationError('Por favor, selecione um template de aula primeiro.');
      return;
    }
    
    if (!assunto.trim()) {
      console.log('❌ [INTERFACE] Erro: Assunto vazio');
      setGenerationError('Por favor, preencha o assunto da aula.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    setShowWorkflowModal(true);
    setWorkflowState(null);
    
    try {
      const templateSections = TEMPLATE_SECTIONS[selectedTemplate.id] || [];
      const sectionOrder = ['objective', ...templateSections.map(name => {
        const mapping: Record<string, string> = {
          'Contextualização': 'contextualizacao',
          'Exploração': 'exploracao',
          'Apresentação': 'apresentacao',
          'Prática Guiada': 'pratica-guiada',
          'Prática Independente': 'pratica-independente',
          'Fechamento': 'fechamento',
          'Demonstração': 'demonstracao',
          'Avaliação': 'avaliacao',
          'Engajamento': 'engajamento',
          'Colaboração': 'colaboracao',
          'Reflexão': 'reflexao',
          'Desenvolvimento': 'desenvolvimento',
          'Aplicação': 'aplicacao',
          'Materiais Complementares': 'materiais',
          'Observações do Professor': 'observacoes',
          'Critérios BNCC': 'bncc'
        };
        return mapping[name] || name.toLowerCase().replace(/\s+/g, '-');
      })];
      
      console.log('🎯 [INTERFACE] Seções mapeadas:', sectionOrder);
      
      const lessonContext: OrchestratorLessonContext = {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        assunto,
        contexto,
        sectionOrder
      };
      
      console.log('🎯 [INTERFACE] Chamando orquestrador com SSE...');
      
      await orchestratorService.orchestrateLessonWithSSE(
        lessonContext,
        {
          activitiesPerSection: 1,
          skipSections: ['objective', 'materiais', 'observacoes', 'bncc']
        },
        {
          onProgress: (state: WorkflowState) => {
            console.log('🎯 [INTERFACE] Progresso SSE:', state.progress + '%', 'Etapa:', state.currentStep);
            setWorkflowState(state);
          },
          onComplete: (result: OrchestratorResult) => {
            console.log('🎯 [INTERFACE] ========================================');
            console.log('🎯 [INTERFACE] ORQUESTRAÇÃO CONCLUÍDA');
            console.log('🎯 [INTERFACE] Sucesso:', result.success);
            console.log('🎯 [INTERFACE] Atividades geradas:', result.activities?.length || 0);
            console.log('🎯 [INTERFACE] ========================================');
            
            if (result.success && result.lesson) {
              const secoesSimples: Record<string, string> = {};
              
              if (result.lesson.secoes) {
                Object.entries(result.lesson.secoes).forEach(([key, value]) => {
                  secoesSimples[key] = typeof value === 'string' ? value : (value as any).text || '';
                });
              }
              
              const aulaMapeada = mapAIResponseToAula({
                titulo: result.lesson.titulo,
                objetivo: result.lesson.objetivo,
                secoes: secoesSimples
              }, sectionOrder);
              
              console.log('🎯 [INTERFACE] Enviando para construção:', {
                titulo: aulaMapeada.titulo,
                objetivo: aulaMapeada.objetivo?.substring(0, 50),
                secoes: Object.keys(aulaMapeada.sectionTexts).length
              });
              
              setTimeout(() => {
                setShowWorkflowModal(false);
                onGerarAula(selectedTemplate, {
                  titulo: aulaMapeada.titulo,
                  objetivo: aulaMapeada.objetivo,
                  secoes: aulaMapeada.sectionTexts
                });
              }, 1500);
            } else {
              console.log('❌ [INTERFACE] Erro na orquestração:', result.errors);
              setGenerationError('Erro ao gerar aula. Tente novamente.');
              setShowWorkflowModal(false);
            }
            
            setIsGenerating(false);
          },
          onError: (error: string) => {
            console.error('❌ [INTERFACE] Erro SSE:', error);
            setGenerationError('Erro de conexão. Verifique sua internet e tente novamente.');
            setShowWorkflowModal(false);
            setIsGenerating(false);
          }
        }
      );
      
    } catch (error) {
      console.error('❌ [INTERFACE] Erro fatal:', error);
      setGenerationError('Erro de conexão. Verifique sua internet e tente novamente.');
      setShowWorkflowModal(false);
      setIsGenerating(false);
    }
  };

  const handleTemplateChange = (template: Template | null) => {
    setSelectedTemplate(template);
    setIsTemplateCompleted(template !== null);
  };

  const handleCloseWorkflowModal = () => {
    if (!isGenerating) {
      setShowWorkflowModal(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
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
                <StyleDefinitionContent 
                  onCompletionChange={setIsStyleCompleted}
                  onAssuntoChange={setAssunto}
                  onContextoChange={setContexto}
                />
              </PersonalizationStepCard>

              {generationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm"
                >
                  {generationError}
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex justify-end gap-3 pt-4"
              >
                <motion.button
                  whileHover={!isGenerating ? { scale: 1.05 } : {}}
                  whileTap={!isGenerating ? { scale: 0.95 } : {}}
                  onClick={handleGerarAula}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: isGenerating 
                      ? 'linear-gradient(135deg, #666 0%, #888 100%)'
                      : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    boxShadow: isGenerating 
                      ? '0 4px 15px rgba(100, 100, 100, 0.3)'
                      : '0 4px 15px rgba(255, 107, 0, 0.3)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Gerando aula...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Gerar aula</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
            </div>
          </motion.div>
        </>
      )}

      <WorkflowModal
        isOpen={showWorkflowModal}
        onClose={handleCloseWorkflowModal}
        workflowState={workflowState}
        isLoading={isGenerating}
      />
    </AnimatePresence>
  );
};

export default CriacaoAulaPanel;
