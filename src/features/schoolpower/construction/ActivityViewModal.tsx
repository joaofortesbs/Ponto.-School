import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, BookOpen, ChevronLeft, ChevronRight, FileText, Clock, Star, Users, Calendar, GraduationCap, Calculator, Beaker, PenTool, GamepadIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '@/features/schoolpower/activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '@/features/schoolpower/activities/flash-cards/FlashCardsPreview';
import TeseRedacaoPreview from '@/features/schoolpower/activities/tese-redacao/TeseRedacaoPreview';
import { UniversalActivityHeader } from './components/UniversalActivityHeader';
import { useUserInfo } from './hooks/useUserInfo';
import { downloadActivity, isDownloadSupported, getDownloadFormatLabel } from '../Sistema-baixar-atividades';
import { TextVersionModal } from '../components/Modal-Versao-Texto';
import { isTextVersionActivity } from '../config/activityVersionConfig';
import { retrieveTextVersionContent } from '../activities/text-version/TextVersionGenerator';
import { useChosenActivitiesStore } from '../interface-chat-producao/stores/ChosenActivitiesStore';
import { loadExerciseListData, processExerciseListWithUnifiedPipeline } from '../activities/lista-exercicios';
import { processQuizWithUnifiedPipeline } from '../activities/quiz-interativo';

// Helper function to get activity icon based on activity type
const getActivityIcon = (activityId: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'lista-exercicios': BookOpen,
    'plano-aula': FileText,
    'sequencia-didatica': Calendar,
    'quiz-interativo': GamepadIcon,
    'flash-cards': Star,
    'quadro-interativo': Eye,
    'mapa-mental': Users,
    'prova': BookOpen,
    'jogo': GamepadIcon,
    'apresentacao': Eye,
    'redacao': PenTool,
    'matematica': Calculator,
    'ciencias': Beaker,
    'default': GraduationCap
  };

  return iconMap[activityId] || iconMap['default'];
};


interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const userInfo = useUserInfo();
  const contentRef = useRef<HTMLDivElement>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isInQuestionView, setIsInQuestionView] = useState<boolean>(false);
  const isLightMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [flashCardsContent, setFlashCardsContent] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [stars, setStars] = useState<number>(100);
  const [isContentExtractOpen, setIsContentExtractOpen] = useState<boolean>(false);
  const [textVersionContent, setTextVersionContent] = useState<string>('');
  
  // Ref para rastrear o último timestamp de atualização e evitar re-renders infinitos
  const lastUpdateRef = useRef<string | null>(null);

  // Listener para sincronização instantânea via eventos customizados
  useEffect(() => {
    if (!activity?.id || !isOpen) return;

    const handleDataSync = (event: CustomEvent) => {
      const { activityId, data, timestamp } = event.detail;
      
      if (activityId === activity.id) {
        console.log('⚡ [INSTANT-SYNC] Dados recebidos do modal de edição:', data);
        
        // Atualizar estados instantaneamente
        const contentToUse = data.generatedContent || data;
        
        if (contentToUse) {
          setGeneratedContent(contentToUse);
          
          // Atualizar conteúdos específicos
          if (activity.type === 'quiz-interativo' || activity.id === 'quiz-interativo') {
            setQuizInterativoContent(contentToUse);
          }
          
          // CORREÇÃO: Flash Cards - aceitar cards diretamente do evento
          if (activity.type === 'flash-cards' || activity.id === 'flash-cards') {
            const flashContent = contentToUse.cards 
              ? contentToUse 
              : data.cards 
                ? { ...data, cards: data.cards } 
                : contentToUse;
            
            if (flashContent?.cards?.length > 0) {
              console.log(`🃏 [INSTANT-SYNC] Flash Cards: ${flashContent.cards.length} cards recebidos`);
            }
            setFlashCardsContent(flashContent);
          }
        }
        
        setIsContentLoaded(true);
        
        console.log('✅ [INSTANT-SYNC] Modal de visualização atualizado instantaneamente!');
      }
    };

    // Adicionar listener para eventos de sincronização
    window.addEventListener('activity-data-sync', handleDataSync as EventListener);

    return () => {
      window.removeEventListener('activity-data-sync', handleDataSync as EventListener);
    };
  }, [activity?.id, activity?.type, isOpen]);

  // Auto-reload ao detectar mudanças no localStorage (fallback)
  useEffect(() => {
    if (!activity?.id || !isOpen) return;
    const activityType = activity.type || (typeof activity.id === 'string' ? activity.id.split('-')[0] : '');

    const checkForUpdates = setInterval(() => {
      const latestData = localStorage.getItem(`activity_${activity.id}`);
      if (latestData) {
        try {
          const parsed = JSON.parse(latestData);
          const currentUpdate = parsed.lastUpdate || JSON.stringify(parsed).slice(0, 100);
          
          // Só atualizar se o valor realmente mudou (evita loops infinitos)
          if (currentUpdate && currentUpdate !== lastUpdateRef.current) {
            console.log('🔄 [AUTO-RELOAD] Detectada atualização, recarregando dados...');
            lastUpdateRef.current = currentUpdate;
            
            const contentToUse = parsed.generatedContent || parsed;
            setGeneratedContent(contentToUse);
            
            // CORREÇÃO: Normalizar dados de Flash Cards no auto-reload
            if (activityType === 'flash-cards') {
              const flashContent = contentToUse.cards 
                ? contentToUse 
                : parsed.cards 
                  ? { ...parsed, cards: parsed.cards }
                  : contentToUse;
              
              if (flashContent?.cards?.length > 0) {
                console.log(`🃏 [AUTO-RELOAD] Flash Cards: ${flashContent.cards.length} cards atualizados`);
                setFlashCardsContent(flashContent);
              }
            }
            
            setIsContentLoaded(true);
          }
        } catch (e) {
          console.warn('⚠️ Erro ao verificar atualizações:', e);
        }
      }
    }, 1000); // Verificar a cada 1 segundo para evitar sobrecarga

    return () => clearInterval(checkForUpdates);
  }, [activity?.id, isOpen]);

  // NOTA: A lógica de carregamento de Quiz e Flash Cards foi consolidada no useEffect principal
  // que executa quando o modal abre (ver "Resetar estado do sidebar quando o modal abre")
  // Isso evita duplicação de setState e possíveis conflitos


  const handleDownload = async () => {
    if (!activity) return;

    const activityType = activity.originalData?.type || activity.categoryId || activity.type || '';

    console.log('📥 Iniciando download da atividade:', activityType);

    if (!isDownloadSupported(activityType)) {
      alert(`Download para "${activityType}" ainda não está disponível. Em breve!`);
      return;
    }

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    let downloadData: any = {
      id: activity.id,
      type: activityType,
      title: activity.personalizedTitle || activity.title || storedData.title || 'Atividade',
      description: activity.personalizedDescription || activity.description || storedData.description,
      customFields: {
        ...activity.customFields,
        ...storedFields
      },
      originalData: activity.originalData,
      ...storedData
    };

    if (activityType === 'lista-exercicios') {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        downloadData.deletedQuestionIds = deletedQuestionIds;
      }
      
      // Fallback chain: localStorage → store → originalData
      const listaContent = localStorage.getItem(`constructed_lista-exercicios_${activity.id}`);
      if (listaContent) {
        try {
          const parsed = JSON.parse(listaContent);
          if (parsed.hasFullDataInStore === true) {
            console.log('📥 Download Lista de Exercícios: localStorage tem metadados leves, buscando da store...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              downloadData = { ...downloadData, ...fullData };
            }
          } else {
            downloadData = { ...downloadData, ...(parsed.data || parsed) };
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar lista-exercicios para download:', e);
        }
      }
      
      // Fallback para originalData se ainda não tem questoes
      if (!downloadData.questoes || downloadData.questoes.length === 0) {
        if (activity.originalData?.campos?.questoes || activity.originalData?.questoes) {
          const dbQuestoes = activity.originalData?.campos?.questoes || activity.originalData?.questoes;
          downloadData.questoes = dbQuestoes;
          console.log('📥 Download Lista de Exercícios: Usando questões do banco de dados');
        }
      }
    }

    if (activityType === 'quiz-interativo') {
      const quizContent = localStorage.getItem(`constructed_quiz-interativo_${activity.id}`);
      if (quizContent) {
        try {
          const parsed = JSON.parse(quizContent);
          if (parsed.hasFullDataInStore === true) {
            console.log('📥 Download Quiz: localStorage tem metadados leves, buscando da store...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              downloadData = { ...downloadData, ...fullData };
            }
          } else {
            downloadData = { ...downloadData, ...(parsed.data || parsed) };
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar quiz para download:', e);
        }
      }
      
      // Fallback para originalData
      if (!downloadData.questions || downloadData.questions.length === 0) {
        if (activity.originalData?.campos?.questions || activity.originalData?.questions) {
          const dbQuestions = activity.originalData?.campos?.questions || activity.originalData?.questions;
          downloadData.questions = dbQuestions;
          console.log('📥 Download Quiz: Usando questões do banco de dados');
        }
      }
    }

    if (activityType === 'flash-cards') {
      const flashCardsContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
      if (flashCardsContent) {
        try {
          const parsed = JSON.parse(flashCardsContent);
          if (parsed.hasFullDataInStore === true) {
            console.log('📥 Download Flash Cards: localStorage tem metadados leves, buscando da store...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              downloadData = { ...downloadData, ...fullData };
            }
          } else {
            downloadData = { ...downloadData, ...(parsed.data || parsed) };
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar flash-cards para download:', e);
        }
      }
      
      // Fallback para originalData
      if (!downloadData.cards || downloadData.cards.length === 0) {
        if (activity.originalData?.campos?.cards || activity.originalData?.cards) {
          const dbCards = activity.originalData?.campos?.cards || activity.originalData?.cards;
          downloadData.cards = dbCards;
          console.log('📥 Download Flash Cards: Usando cards do banco de dados');
        }
      }
    }

    if (activityType === 'sequencia-didatica') {
      const sequenciaContent = localStorage.getItem(`constructed_sequencia-didatica_${activity.id}`);
      if (sequenciaContent) {
        try {
          const parsed = JSON.parse(sequenciaContent);
          if (parsed.hasFullDataInStore === true) {
            console.log('📥 Download Sequência Didática: localStorage tem metadados leves, buscando da store...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              downloadData = { ...downloadData, ...fullData };
            }
          } else {
            downloadData = { ...downloadData, ...(parsed.data || parsed) };
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar sequencia-didatica para download:', e);
        }
      }
      
      // Fallback para originalData
      if (!downloadData.aulas && !downloadData.sequenciaDidatica) {
        if (activity.originalData?.campos || activity.originalData) {
          const dbData = activity.originalData?.campos || activity.originalData;
          downloadData = { ...downloadData, ...dbData };
          console.log('📥 Download Sequência Didática: Usando dados do banco de dados');
        }
      }
    }
    
    if (activityType === 'plano-aula') {
      const planoContent = localStorage.getItem(`constructed_plano-aula_${activity.id}`);
      if (planoContent) {
        try {
          const parsed = JSON.parse(planoContent);
          if (parsed.hasFullDataInStore === true) {
            console.log('📥 Download Plano de Aula: localStorage tem metadados leves, buscando da store...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              downloadData = { ...downloadData, ...fullData };
            }
          } else {
            downloadData = { ...downloadData, ...(parsed.data || parsed) };
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar plano-aula para download:', e);
        }
      }
      
      // Fallback para originalData
      if (!downloadData.objetivos && !downloadData.metodologia) {
        if (activity.originalData?.campos || activity.originalData) {
          const dbData = activity.originalData?.campos || activity.originalData;
          downloadData = { ...downloadData, ...dbData };
          console.log('📥 Download Plano de Aula: Usando dados do banco de dados');
        }
      }
    }

    const result = await downloadActivity(downloadData);

    if (result.success) {
      console.log('✅ Download concluído com sucesso!');
    } else {
      alert(result.error || 'Erro ao fazer download. Tente novamente.');
    }
  };

  // Função específica para carregar dados do Plano de Aula
  const loadPlanoAulaData = (activityId: string) => {
    console.log('🔍 ActivityViewModal: Carregando dados específicos do Plano de Aula para:', activityId);

    // Priorizar chave do TextVersionGenerator para versão texto
    const textVersionKey = `text_content_plano-aula_${activityId}`;
    const textVersionData = localStorage.getItem(textVersionKey);
    
    if (textVersionData) {
      try {
        const parsed = JSON.parse(textVersionData);
        console.log(`✅ [Plano de Aula] Dados encontrados em ${textVersionKey}:`, {
          hasTextContent: !!parsed.textContent,
          sectionsCount: parsed.sections?.length || 0
        });
        return parsed;
      } catch (error) {
        console.warn(`⚠️ Erro ao parsear dados de ${textVersionKey}:`, error);
      }
    }

    const cacheKeys = [
      `constructed_plano-aula_${activity.id}`,
      `schoolpower_plano-aula_content`,
      `activity_${activity.id}`,
      `activity_fields_${activity.id}`
    ];

    for (const key of cacheKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log(`✅ Dados encontrados em ${key}:`, parsedData);
          return parsedData;
        } catch (error) {
          console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
        }
      }
    }

    console.log('⚠️ Nenhum dado específico encontrado para plano-aula');
    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 4: DATA INJECTION — Injetar dados do activity prop no localStorage
  // Quando o modal abre via chat card, os dados vêm no customFields/originalData.campos
  // Precisamos garantir que localStorage tem esses dados ANTES do useEffect de carregamento
  // ═══════════════════════════════════════════════════════════════════════
  React.useEffect(() => {
    if (!isOpen || !activity?.id) return;
    
    const activityType = activity.originalData?.type || activity.categoryId || activity.type || '';
    const propsData = activity.originalData?.campos || activity.customFields || {};
    const propsKeys = Object.keys(propsData).filter(k => 
      propsData[k] !== undefined && propsData[k] !== null && propsData[k] !== ''
    );
    
    if (propsKeys.length <= 2 || !activityType) return;
    
    const contentIndicators = ['questoes', 'questions', 'cards', 'etapas', 'sections'];
    const hasRealContentInProps = contentIndicators.some(k => 
      Array.isArray(propsData[k]) && propsData[k].length > 0
    );
    
    if (!hasRealContentInProps && propsKeys.length < 5) return;
    
    const constructedKey = `constructed_${activityType}_${activity.id}`;
    const activityKey = `activity_${activity.id}`;
    
    try {
      const existingRaw = localStorage.getItem(constructedKey);
      let existingHasRealContent = false;
      
      if (existingRaw) {
        try {
          const ep = JSON.parse(existingRaw);
          const ed = ep?.data || ep;
          existingHasRealContent = contentIndicators.some(k => 
            Array.isArray(ed?.[k]) && ed[k].length > 0
          );
        } catch {}
      }
      
      if (!existingHasRealContent) {
        const injectionData = {
          success: true,
          data: propsData,
          injectedAt: new Date().toISOString(),
          source: 'layer4-modal-injection'
        };
        localStorage.setItem(constructedKey, JSON.stringify(injectionData));
        localStorage.setItem(activityKey, JSON.stringify(propsData));
        console.log(`💉 [LAYER4-INJECTION] Dados injetados para ${activityType}_${activity.id}: ${propsKeys.length} campos (hasContent: ${hasRealContentInProps})`);
      }
    } catch (e) {
      console.warn('⚠️ [LAYER4-INJECTION] Erro:', e);
    }
  }, [isOpen, activity?.id]);

  // Resetar estado do sidebar quando o modal abre - com dependência estável
  React.useEffect(() => {
    if (isOpen && activity) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);
      
      // Limpar a ref de atualização para evitar conflitos com dados antigos
      lastUpdateRef.current = null;

      console.log('🔍 ActivityViewModal: Carregando dados para atividade:', activity);

      // Carregar Stars do localStorage ou banco
      const loadStars = async () => {
        // Primeiro, tentar do localStorage
        const stKey = `activity_${activity.id}_stars`;
        const localSTs = localStorage.getItem(stKey);

        if (localSTs) {
          const points = parseInt(localSTs);
          console.log(`💰 Stars carregados do localStorage: ${points} STs`);
          setStars(points);
        } else {
          console.log('💰 Usando valor padrão: 100 STs');
          setStars(100);
        }
      };

      loadStars();
      
      // Determinar o tipo de atividade
      const activityType = activity.originalData?.type || activity.categoryId || activity.type || '';
      
      // Carregar dados de Quiz Interativo usando PIPELINE UNIFICADO v1.0
      if (activityType === 'quiz-interativo') {
        console.log('🔄 [ActivityViewModal] Usando Unified Quiz Pipeline para:', activity.id);
        
        try {
          const pipelineResult = processQuizWithUnifiedPipeline(activity.id, activity.originalData);
          
          if (pipelineResult.success && pipelineResult.questions.length > 0) {
            const loadedContent = {
              title: pipelineResult.title,
              description: pipelineResult.description,
              questions: pipelineResult.questions,
              totalQuestions: pipelineResult.metadata.totalQuestions,
              validQuestions: pipelineResult.metadata.validQuestions,
              theme: pipelineResult.metadata.theme,
              subject: pipelineResult.metadata.subject,
              schoolYear: pipelineResult.metadata.schoolYear,
              isFallback: pipelineResult.metadata.isFallback || false,
              extractionMethod: pipelineResult.metadata.extractionMethod,
              processingTimeMs: pipelineResult.metadata.processingTimeMs,
              isGeneratedByAI: !pipelineResult.metadata.isFallback
            };
            
            console.log(`✅ [ActivityViewModal] Quiz Pipeline: ${pipelineResult.questions.length} questões carregadas via ${pipelineResult.metadata.extractionMethod}`);
            setQuizInterativoContent(loadedContent);
          } else {
            console.warn(`⚠️ [ActivityViewModal] Quiz Pipeline retornou 0 questões válidas`);
            if (pipelineResult.errors?.length) {
              console.warn(`⚠️ [ActivityViewModal] Erros:`, pipelineResult.errors);
            }
            setQuizInterativoContent(null);
          }
        } catch (pipelineError) {
          console.error('❌ [ActivityViewModal] Erro no Quiz Pipeline:', pipelineError);
          setQuizInterativoContent(null);
        }
      } else {
        setQuizInterativoContent(null);
      }
      
      // Carregar dados de Flash Cards
      if (activityType === 'flash-cards') {
        let loadedContent = null;
        
        // Primeiro, tentar localStorage
        const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
        if (flashCardsSavedContent) {
          try {
            const parsedContent = JSON.parse(flashCardsSavedContent);
            
            // CORREÇÃO: Verificar se localStorage tem apenas metadados leves
            if (parsedContent.hasFullDataInStore === true) {
              console.log('📦 [INIT] Flash Cards: localStorage tem metadados leves, buscando da store Zustand...');
              const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
              
              if (storeData) {
                // CORREÇÃO: Buscar em MÚLTIPLOS caminhos possíveis na store
                const fullData = 
                  storeData.dados_construidos?.generated_fields || 
                  storeData.dados_construidos || 
                  storeData.campos_preenchidos || 
                  {};
                
                if (fullData.cards && Array.isArray(fullData.cards) && fullData.cards.length > 0) {
                  const validCards = fullData.cards.filter((card: any) =>
                    card && typeof card === 'object' && card.front && card.back
                  );
                  if (validCards.length > 0) {
                    loadedContent = { ...fullData, cards: validCards };
                    console.log(`✅ Flash Cards: ${validCards.length} cards carregados da store Zustand`);
                  }
                }
              }
            } else {
              // Dados completos no localStorage
              const data = parsedContent.data || parsedContent;
              if (data?.cards?.length > 0) {
                const validCards = data.cards.filter((card: any) =>
                  card && typeof card === 'object' && card.front && card.back
                );
                if (validCards.length > 0) {
                  loadedContent = { ...data, cards: validCards };
                  console.log(`✅ Flash Cards: ${validCards.length} cards carregados do localStorage`);
                }
              }
            }
          } catch (e) {
            console.warn('⚠️ Erro ao parsear Flash Cards do localStorage:', e);
          }
        }
        
        // Fallback 1: store Zustand (se localStorage não tinha dados)
        if (!loadedContent) {
          console.log('📦 [INIT] Flash Cards: Buscando da store Zustand como fallback...');
          const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
          
          if (storeData) {
            // CORREÇÃO: Buscar em MÚLTIPLOS caminhos possíveis na store
            const fullData = 
              storeData.dados_construidos?.generated_fields || 
              storeData.dados_construidos || 
              storeData.campos_preenchidos || 
              {};
            
            console.log('📦 [INIT] Flash Cards: Dados encontrados na store:', {
              hasGeneratedFields: !!storeData.dados_construidos?.generated_fields,
              hasDadosConstruidos: !!storeData.dados_construidos,
              hasCamposPreenchidos: !!storeData.campos_preenchidos
            });
            
            if (fullData.cards && Array.isArray(fullData.cards) && fullData.cards.length > 0) {
              const validCards = fullData.cards.filter((card: any) =>
                card && typeof card === 'object' && card.front && card.back
              );
              if (validCards.length > 0) {
                loadedContent = { ...fullData, cards: validCards };
                console.log(`✅ Flash Cards: ${validCards.length} cards carregados da store Zustand (fallback)`);
              }
            }
          }
        }
        
        // Fallback 2: banco de dados
        if (!loadedContent && activity.originalData) {
          const dbData = activity.originalData.campos || activity.originalData;
          if (dbData?.cards?.length > 0) {
            const validCards = dbData.cards.filter((card: any) =>
              card && typeof card === 'object' && card.front && card.back
            );
            if (validCards.length > 0) {
              loadedContent = {
                ...dbData,
                cards: validCards,
                title: dbData.title || activity.originalData.titulo || 'Flash Cards',
                description: dbData.description || 'Atividade criada na plataforma'
              };
              console.log(`✅ Flash Cards: ${validCards.length} cards carregados do banco de dados`);
            }
          }
        }
        
        setFlashCardsContent(loadedContent);
      } else {
        setFlashCardsContent(null);
      }

      // Se for plano-aula, tentar carregar dados específicos
      if (activityType === 'plano-aula') {
        const planoData = loadPlanoAulaData(activity.id);
        if (planoData) {
          console.log('📚 Dados do plano-aula carregados com sucesso:', planoData);
        }
      }

      // Verificar se é uma atividade do histórico e garantir que os dados estejam sincronizados
      if (activity.isBuilt && activity.originalData) {
        console.log('📋 Carregando dados de atividade do histórico:', activity.originalData);
      }
    }
  }, [isOpen, activity?.id]); // Usar apenas activity.id para evitar loops - type e originalData são acessados via activity

  if (!isOpen || !activity) return null;

  // Função para gerar texto do extrato de conteúdo
  const generateTextExtract = (activityType: string, activityId: string): string => {
    const storedData = JSON.parse(localStorage.getItem(`activity_${activityId}`) || '{}');
    const constructedData = JSON.parse(localStorage.getItem(`constructed_${activityType}_${activityId}`) || '{}');
    
    // Priorizar conteúdo gerado pelo TextVersionGenerator ou salvo pelo ContentExtractModal
    const textVersionKey = `text_content_${activityType}_${activityId}`;
    const textVersionData = localStorage.getItem(textVersionKey);
    
    if (textVersionData) {
      try {
        const parsed = JSON.parse(textVersionData);
        // Aceitar textContent (ContentExtractModal) ou content (legado)
        if (parsed.textContent) {
          console.log('📄 [generateTextExtract] Usando conteúdo salvo (textContent)');
          return parsed.textContent;
        }
        if (parsed.content) {
          console.log('📄 [generateTextExtract] Usando conteúdo salvo (content)');
          return parsed.content;
        }
        // Se tiver sections, formatar como texto
        if (parsed.sections && Array.isArray(parsed.sections)) {
          console.log('📄 [generateTextExtract] Formatando sections como texto');
          return parsed.sections
            .map((s: any) => `${s.title}\n\n${s.content}`)
            .join('\n\n---\n\n');
        }
      } catch (e) {
        // Se não for JSON, pode ser texto puro
        console.log('📄 [generateTextExtract] Usando conteúdo como texto puro');
        return textVersionData;
      }
    }
    
    // Fallback para chave antiga
    const legacyTextContent = localStorage.getItem(`text_content_${activityId}`) || '';
    if (legacyTextContent) {
      return legacyTextContent;
    }
    
    const data = constructedData.data || constructedData || storedData;
    
    let text = '';
    
    if (activityType === 'plano-aula') {
      const titulo = data.titulo || data.title || storedData.titulo || 'Plano de Aula';
      const tema = data.tema || storedData['Tema ou Tópico Central'] || '';
      const disciplina = data.disciplina || storedData['Componente Curricular'] || '';
      const anoEscolar = data.ano_escolar || storedData['Ano Escolar'] || '';
      const duracao = data.duracao || storedData['Duração da Aula'] || '';
      const objetivos = data.objetivos || storedData.objetivos || [];
      const metodologia = data.metodologia || storedData.metodologia || '';
      const desenvolvimento = data.desenvolvimento || [];
      const avaliacao = data.avaliacao || storedData.avaliacao || '';
      const recursos = data.recursos || storedData.recursos || [];
      
      text = `📋 ${titulo}\n\n`;
      if (tema) text += `🎯 Tema: ${tema}\n`;
      if (disciplina) text += `📚 Disciplina: ${disciplina}\n`;
      if (anoEscolar) text += `🎓 Ano Escolar: ${anoEscolar}\n`;
      if (duracao) text += `⏰ Duração: ${duracao}\n`;
      text += '\n';
      
      if (objetivos && (Array.isArray(objetivos) ? objetivos.length > 0 : objetivos)) {
        text += `🎯 OBJETIVOS:\n`;
        if (Array.isArray(objetivos)) {
          objetivos.forEach((obj: any, i: number) => {
            const desc = typeof obj === 'string' ? obj : obj.descricao || obj;
            text += `  ${i + 1}. ${desc}\n`;
          });
        } else {
          text += `  • ${objetivos}\n`;
        }
        text += '\n';
      }
      
      if (metodologia) {
        text += `📖 METODOLOGIA:\n`;
        text += `  ${typeof metodologia === 'string' ? metodologia : metodologia.nome || JSON.stringify(metodologia)}\n\n`;
      }
      
      if (desenvolvimento && Array.isArray(desenvolvimento) && desenvolvimento.length > 0) {
        text += `📝 DESENVOLVIMENTO:\n`;
        desenvolvimento.forEach((etapa: any, i: number) => {
          const nome = etapa.nome || etapa.titulo || `Etapa ${i + 1}`;
          const descricao = etapa.descricao || etapa.atividade || '';
          text += `  ${i + 1}. ${nome}\n`;
          if (descricao) text += `     ${descricao}\n`;
        });
        text += '\n';
      }
      
      if (avaliacao) {
        text += `📊 AVALIAÇÃO:\n`;
        text += `  ${typeof avaliacao === 'string' ? avaliacao : JSON.stringify(avaliacao)}\n\n`;
      }
      
      if (recursos && (Array.isArray(recursos) ? recursos.length > 0 : recursos)) {
        text += `🛠️ RECURSOS:\n`;
        if (Array.isArray(recursos)) {
          recursos.forEach((rec: string) => {
            text += `  • ${rec}\n`;
          });
        } else {
          text += `  • ${recursos}\n`;
        }
      }
    } else if (activityType === 'sequencia-didatica') {
      text = `📚 Sequência Didática\n\n`;
      text += `Este é o extrato de conteúdo da Sequência Didática.\n`;
      text += `Os dados serão formatados quando a geração de texto for implementada.`;
    } else if (activityType === 'tese-redacao') {
      text = `📝 Tese de Redação\n\n`;
      text += `Este é o extrato de conteúdo da Tese de Redação.\n`;
      text += `Os dados serão formatados quando a geração de texto for implementada.`;
    } else {
      text = `Conteúdo em texto para ${activityType} ainda não está disponível.`;
    }
    
    return text;
  };

  // Função de busca inteligente no localStorage
  const smartLocalStorageSearch = (activityId: string): { key: string; content: any } | null => {
    console.log('🔍 [SmartSearch] Iniciando busca inteligente para:', activityId);
    
    // Lista de tipos possíveis para atividades de versão texto
    const textVersionTypes = ['plano-aula', 'sequencia-didatica', 'tese-redacao'];
    
    // ESTRATÉGIA 1: Busca direta por tipos conhecidos
    for (const type of textVersionTypes) {
      const key = `text_content_${type}_${activityId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.textContent && parsed.textContent.length > 50) {
            console.log('✅ [SmartSearch] Encontrado via tipo conhecido:', key);
            return { key, content: parsed };
          }
        } catch (e) {
          if (stored.length > 50) {
            console.log('✅ [SmartSearch] Encontrado como texto puro:', key);
            return { key, content: { textContent: stored } };
          }
        }
      }
    }
    
    // ESTRATÉGIA 2: Varrer localStorage procurando chaves que contenham o activityId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('text_content_') && key.includes(activityId)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.textContent && parsed.textContent.length > 50) {
              console.log('✅ [SmartSearch] Encontrado via varredura:', key);
              return { key, content: parsed };
            }
          } catch (e) {
            if (stored.length > 50) {
              console.log('✅ [SmartSearch] Encontrado como texto puro via varredura:', key);
              return { key, content: { textContent: stored } };
            }
          }
        }
      }
    }
    
    // ESTRATÉGIA 3: Buscar em chaves legacy
    const legacyKey = `text_content_${activityId}`;
    const legacyStored = localStorage.getItem(legacyKey);
    if (legacyStored && legacyStored.length > 50) {
      console.log('✅ [SmartSearch] Encontrado via chave legacy:', legacyKey);
      return { key: legacyKey, content: { textContent: legacyStored } };
    }
    
    // ESTRATÉGIA 4: Buscar chaves onde ID = tipo (fallback do EditActivityModal quando activity?.id era undefined)
    for (const type of textVersionTypes) {
      const wrongIdKey = `text_content_${type}_${type}`;
      const wrongIdStored = localStorage.getItem(wrongIdKey);
      if (wrongIdStored) {
        try {
          const parsed = JSON.parse(wrongIdStored);
          if (parsed.textContent && parsed.textContent.length > 50) {
            console.log('✅ [SmartSearch] Encontrado via chave com ID incorreto:', wrongIdKey);
            return { key: wrongIdKey, content: parsed };
          }
        } catch (e) {
          if (wrongIdStored.length > 50) {
            console.log('✅ [SmartSearch] Encontrado como texto puro (ID incorreto):', wrongIdKey);
            return { key: wrongIdKey, content: { textContent: wrongIdStored } };
          }
        }
      }
    }
    
    console.log('⚠️ [SmartSearch] Nenhum conteúdo encontrado para:', activityId);
    return null;
  };

  // Função para abrir o modal de extrato de conteúdo
  const handleContentExtract = () => {
    // CORRIGIDO: Priorizar activity.originalData?.tipo que é o campo correto do ChosenActivity
    const activityType = activity.originalData?.tipo || activity.originalData?.type || activity.categoryId || activity.type || '';
    const activityId = activity.id;
    
    console.log('📄 [ContentExtract] ===== DEBUG RECUPERAÇÃO =====');
    console.log('📄 [ContentExtract] activityId:', activityId);
    console.log('📄 [ContentExtract] activityType resolvido:', activityType);
    console.log('📄 [ContentExtract] activity.originalData:', JSON.stringify(activity.originalData || {}).substring(0, 200));
    console.log('📄 [ContentExtract] activity.categoryId:', activity.categoryId);
    console.log('📄 [ContentExtract] activity.type:', activity.type);
    console.log('📄 [ContentExtract] Chave esperada: text_content_' + activityType + '_' + activityId);
    
    // PRIORIDADE 1: Usar retrieveTextVersionContent para atividades de versão texto
    if (isTextVersionActivity(activityType)) {
      console.log('📄 [ContentExtract] É atividade de versão texto, tentando recuperar...');
      const textVersionData = retrieveTextVersionContent(activityId, activityType);
      
      if (textVersionData && textVersionData.textContent && textVersionData.textContent.length > 50) {
        console.log('✅ [ContentExtract] Usando retrieveTextVersionContent:', {
          hasTextContent: !!textVersionData.textContent,
          length: textVersionData.textContent.length
        });
        setTextVersionContent(textVersionData.textContent);
        setIsContentExtractOpen(true);
        return;
      } else {
        console.log('⚠️ [ContentExtract] retrieveTextVersionContent retornou vazio ou muito curto');
      }
    }
    
    // PRIORIDADE 2: Busca inteligente no localStorage
    const smartResult = smartLocalStorageSearch(activityId);
    if (smartResult && smartResult.content.textContent) {
      console.log('✅ [ContentExtract] Usando busca inteligente:', smartResult.key);
      setTextVersionContent(smartResult.content.textContent);
      setIsContentExtractOpen(true);
      return;
    }
    
    // PRIORIDADE 3: Fallback para generateTextExtract (busca manual no localStorage)
    const content = generateTextExtract(activityType, activityId);
    setTextVersionContent(content);
    setIsContentExtractOpen(true);
    console.log('📄 [ContentExtract] Usando generateTextExtract fallback para:', activityType);
  };

  // Função para lidar com seleção de questão
  const handleQuestionSelect = (questionIndex: number, questionId: string) => {
    setSelectedQuestionIndex(questionIndex);
    setSelectedQuestionId(questionId);
    setIsInQuestionView(true);
  };

  // Função para rolar para uma questão específica
  const scrollToQuestion = (questionId: string, questionIndex?: number) => {
    setSelectedQuestionId(questionId);
    if (questionIndex !== undefined) {
      setSelectedQuestionIndex(questionIndex);
      setIsInQuestionView(true);
    }
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement && contentRef.current) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Obter questões para o sidebar
  const getQuestionsForSidebar = () => {
    const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

    if (activityType !== 'lista-exercicios') return [];

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const previewData = {
      ...activity.originalData,
      ...storedData,
      customFields: {
        ...activity.customFields,
        ...JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}')
      }
    };

    // Buscar questões em diferentes possíveis localizações
    let questoes = [];
    if (previewData.questoes && Array.isArray(previewData.questoes)) {
      questoes = previewData.questoes;
    } else if (previewData.questions && Array.isArray(previewData.questions)) {
      questoes = previewData.questions;
    } else if (previewData.content && previewData.content.questoes) {
      questoes = previewData.content.questoes;
    } else if (previewData.content && previewData.content.questions) {
      questoes = previewData.content.questions;
    }

    // Aplicar filtro de exclusões
    try {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        questoes = questoes.filter(questao => !deletedQuestionIds.includes(questao.id || `questao-${questoes.indexOf(questao) + 1}`));
        console.log(`🔍 Sidebar: Questões filtradas para navegação. ${questoes.length} questões restantes após exclusões`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao aplicar filtro de exclusões no sidebar:', error);
    }

    return questoes.map((questao, index) => ({
      id: questao.id || `questao-${index + 1}`,
      numero: index + 1,
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tipo: questao.type || questao.tipo || 'multipla-escolha',
      completed: false, // Pode ser expandido para rastrear progresso
      enunciado: questao.enunciado || questao.statement || 'Sem enunciado' // Adicionado para exibição no sidebar
    }));
  };

  const questionsForSidebar = getQuestionsForSidebar();
  const isExerciseList = (activity.originalData?.type || activity.categoryId || activity.type) === 'lista-exercicios';
  const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

  const cleanActivityTitle = (title: string): string => {
    const MAX_TITLE_LENGTH = 50;
    if (!title || typeof title !== 'string') return '';
    let cleaned = title
      .replace(/^(preciso|quero|gostaria de|criar|fazer|desenvolver|crie|gere|monte|elabore|prepare)\s+/gi, '')
      .replace(/^(algumas?|alguns?|as|os|a|o|um|uma|uns|umas)\s+/gi, '')
      .replace(/^(atividades?|exercícios?|plano|planos|aulas?)\s+(de|sobre|para|com)\s+/gi, '')
      .replace(/^próximas?\s+atividades?\s+(de|sobre|para)\s+/gi, '')
      .replace(/^(sobre|para|com|de)\s+/gi, '')
      .replace(/^(como|o que é|quais são|quando|onde)\s+/gi, '')
      .trim();
    
    if (cleaned.length > MAX_TITLE_LENGTH) {
      const sobreMatch = cleaned.match(/sobre\s+(.+?)(?:\s+(?:dentro|para|com|que|e)\s|$)/i);
      if (sobreMatch && sobreMatch[1] && sobreMatch[1].length <= MAX_TITLE_LENGTH) {
        cleaned = sobreMatch[1].trim();
      } else {
        const words = cleaned.split(/\s+/);
        let result = '';
        for (const word of words) {
          if (result.length + word.length + 1 <= MAX_TITLE_LENGTH) {
            result += (result ? ' ' : '') + word;
          } else break;
        }
        cleaned = result || cleaned.substring(0, MAX_TITLE_LENGTH);
      }
    }
    
    cleaned = cleaned.replace(/\.\.\.$/, '').replace(/\.$/, '').trim();
    if (!cleaned || cleaned.length < 3) return title;
    
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const getActivityTitle = () => {
    const customFields = activity.customFields || {};
    const originalData = activity.originalData || {};
    const consolidatedFields = originalData.built_data?._consolidated_fields || {};
    const originalCampos = originalData.campos || {};
    
    const typeLabels: Record<string, string> = {
      'lista-exercicios': 'Lista de Exercícios',
      'plano-aula': 'Plano de Aula',
      'sequencia-didatica': 'Sequência Didática',
      'quiz-interativo': 'Quiz Interativo',
      'flash-cards': 'Flash Cards',
      'redacao': 'Redação',
      'prova': 'Prova',
      'aula': 'Aula'
    };
    
    const normalizeForComparison = (str: string): string => {
      if (!str) return '';
      return str.trim().toLowerCase()
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    
    const genericLabels = new Set([
      ...Object.values(typeLabels).map(normalizeForComparison),
      ...Object.keys(typeLabels).map(normalizeForComparison),
      'atividade'
    ]);
    
    const isGenericLabel = (title: string): boolean => {
      if (!title) return true;
      const normalized = normalizeForComparison(title);
      if (genericLabels.has(normalized)) return true;
      if (normalized === normalizeForComparison(activityType)) return true;
      if (normalized === normalizeForComparison(activity.categoryId || '')) return true;
      if (normalized === normalizeForComparison(activity.categoryName || '')) return true;
      return false;
    };
    
    const storedData = (() => {
      try {
        return JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
      } catch { return {}; }
    })();
    const formData = storedData.formData || storedData.data?.formData || {};
    
    const extractTheme = (): string => {
      const themeKeys = ['theme', 'tema', 'temaRedacao', 'tituloTemaAssunto', 'centralTheme', 'Tema ou Tópico Central', 'Tema da Redação'];
      
      for (const key of themeKeys) {
        if (customFields[key] && typeof customFields[key] === 'string' && customFields[key].trim().length > 3) {
          return customFields[key].trim();
        }
      }
      
      for (const key of themeKeys) {
        if (consolidatedFields[key] && typeof consolidatedFields[key] === 'string' && consolidatedFields[key].trim().length > 3) {
          return consolidatedFields[key].trim();
        }
      }
      
      for (const key of themeKeys) {
        if (originalCampos[key] && typeof originalCampos[key] === 'string' && originalCampos[key].trim().length > 3) {
          return originalCampos[key].trim();
        }
      }
      
      for (const key of themeKeys) {
        if (originalData[key] && typeof originalData[key] === 'string' && originalData[key].trim().length > 3) {
          return originalData[key].trim();
        }
      }
      
      if (originalData.titulo_gerado && typeof originalData.titulo_gerado === 'string' && originalData.titulo_gerado.trim().length > 3) {
        return originalData.titulo_gerado.trim();
      }
      
      for (const key of themeKeys) {
        if (formData[key] && typeof formData[key] === 'string' && formData[key].trim().length > 3) {
          return formData[key].trim();
        }
      }
      
      for (const key of themeKeys) {
        if (storedData[key] && typeof storedData[key] === 'string' && storedData[key].trim().length > 3) {
          return storedData[key].trim();
        }
      }
      
      if (storedData.title && typeof storedData.title === 'string' && storedData.title.trim().length > 3) {
        return storedData.title.trim();
      }
      if (storedData.titulo && typeof storedData.titulo === 'string' && storedData.titulo.trim().length > 3) {
        return storedData.titulo.trim();
      }
      
      return '';
    };
    
    const theme = extractTheme();
    
    if (activityType === 'plano-aula') {
      const baseTitle = storedData.titulo || storedData.title || customFields.titulo || 'Plano de Aula';
      if (theme && !isGenericLabel(theme)) {
        const fullTitle = `${baseTitle}: ${theme}`;
        return cleanActivityTitle(fullTitle);
      }
      return cleanActivityTitle(baseTitle);
    }
    
    if (activity.title && !isGenericLabel(activity.title)) {
      const cleanedTitle = cleanActivityTitle(activity.title);
      if (cleanedTitle && cleanedTitle.length >= 3 && !isGenericLabel(cleanedTitle)) {
        return cleanedTitle;
      }
    }
    
    if (theme && !isGenericLabel(theme)) {
      const cleanedTheme = cleanActivityTitle(theme);
      if (cleanedTheme && cleanedTheme.length >= 3) {
        return cleanedTheme;
      }
    }
    
    return typeLabels[activityType] || activity.categoryName || 'Atividade';
  };

  // Função para obter informações adicionais do Plano de Aula para o cabeçalho
  const getPlanoAulaHeaderInfo = () => {
    if (activityType !== 'plano-aula') return null;

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const disciplina = storedData?.disciplina || storedData?.['Componente Curricular'] || 'Matemática';
    const anoEscolar = storedData?.ano_escolar || storedData?.['Ano Escolar'] || '6° ano';
    const duracao = storedData?.duracao || storedData?.['Duração da Aula'] || '2 aulas de 50 minutos';

    return {
      disciplina,
      anoEscolar,
      duracao
    };
  };

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade.toLowerCase()) {
      case 'facil':
      case 'fácil':
      case 'básico':
      case 'basico':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'medio':
      case 'médio':
      case 'intermediário':
      case 'intermediario':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'dificil':
      case 'difícil':
      case 'avançado':
      case 'avancado':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const renderActivityPreview = () => {
    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    console.log('💾 ActivityViewModal: Dados armazenados:', storedData);
    console.log('🗂️ ActivityViewModal: Campos armazenados:', storedFields);

    // Preparar dados para o preview EXATAMENTE como no modal de edição
    let previewData = {
      ...activity.originalData,
      ...storedData,
      title: activity.personalizedTitle || activity.title || storedData.title,
      description: activity.personalizedDescription || activity.description || storedData.description,
      customFields: {
        ...activity.customFields,
        ...storedFields
      },
      type: activityType,
      // Incluir todos os campos que podem estar no originalData
      exercicios: activity.originalData?.exercicios || storedData.exercicios,
      questions: activity.originalData?.questions || storedData.questions,
      content: activity.originalData?.content || storedData.content
    };

    let contentToLoad = null;

    // --- Carregamento de Conteúdo Específico por Tipo de Atividade ---

    // 1. Tese da Redação
    if (activityType === 'tese-redacao') {
      console.log('📝 ActivityViewModal: Carregando dados para Tese da Redação');

      // PRIORIDADE 1: Verificar resultados salvos em múltiplas chaves
      const resultKeys = [
        `tese_redacao_results_${activity.id}`,
        `activity_${activity.id}_results`,
        `tese_redacao_latest_results`
      ];

      let savedResults = null;
      for (const key of resultKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            savedResults = JSON.parse(data);
            console.log(`✅ Resultados encontrados em ${key}:`, savedResults);
            break;
          } catch (error) {
            console.warn(`⚠️ Erro ao parsear ${key}:`, error);
          }
        }
      }

      if (savedResults && savedResults.feedback) {
        // Usuário já completou a atividade - carregar com resultados
        contentToLoad = {
          ...savedResults,
          id: activity.id,
          title: activity.title || savedResults.temaRedacao || 'Tese da Redação',
          temaRedacao: savedResults.temaRedacao || activity.customFields?.['Tema da Redação'] || activity.customFields?.temaRedacao || '',
          objetivo: activity.customFields?.['Objetivos'] || activity.customFields?.objetivo || '',
          nivelDificuldade: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.nivelDificuldade || 'Médio',
          competenciasENEM: activity.customFields?.['Competências ENEM'] || activity.customFields?.competenciasENEM || '',
          contextoAdicional: activity.customFields?.['Contexto Adicional'] || activity.customFields?.contextoAdicional || '',
          // Incluir etapas padrão caso não existam
          etapas: savedResults.etapas || [
            { id: 1, nome: 'Crie sua tese', tempo: '5:00', descricao: 'Desenvolva uma tese clara' },
            { id: 2, nome: 'Battle de teses', tempo: '5:00', descricao: 'Vote na melhor tese' },
            { id: 3, nome: 'Argumentação', tempo: '8:00', descricao: 'Desenvolva argumento completo' }
          ]
        };

        console.log('🎯 Conteúdo com resultados completos para TeseRedacaoPreview:', contentToLoad);
        return <TeseRedacaoPreview content={contentToLoad} isLoading={false} />;
      }

      // PRIORIDADE 2: Tentar carregar do constructed (gerado pela IA)
      const constructedKey = `constructed_tese-redacao_${activity.id}`;
      const constructedData = localStorage.getItem(constructedKey);

      if (constructedData) {
        try {
          const parsed = JSON.parse(constructedData);
          const teseContent = parsed.data || parsed;

          if (teseContent.temaRedacao || teseContent.etapas || teseContent.etapa2_battleTeses) {
            console.log(`✅ Dados da Tese encontrados em ${constructedKey}:`, teseContent);
            contentToLoad = {
              ...teseContent,
              title: activity.title || teseContent.title || 'Tese da Redação'
            };
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao parsear ${constructedKey}:`, error);
        }
      }

      // PRIORIDADE 3: Tentar activity_<id> (campos do formulário)
      if (!contentToLoad) {
        const activityKey = `activity_${activity.id}`;
        const activityData = localStorage.getItem(activityKey);

        if (activityData) {
          try {
            const parsed = JSON.parse(activityData);
            console.log(`✅ Dados encontrados em ${activityKey}:`, parsed);
            contentToLoad = parsed;
          } catch (error) {
            console.warn(`⚠️ Erro ao parsear ${activityKey}:`, error);
          }
        }
      }

      // FALLBACK: Usar campos customizados da atividade
      if (!contentToLoad) {
        console.log('⚠️ Nenhum cache específico encontrado. Usando customFields da atividade.');
        contentToLoad = {
          title: activity.title || 'Tese da Redação',
          temaRedacao: activity.customFields?.['Tema da Redação'] || activity.customFields?.temaRedacao || '',
          objetivo: activity.customFields?.['Objetivos'] || activity.customFields?.objetivo || '',
          nivelDificuldade: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.nivelDificuldade || 'Médio',
          competenciasENEM: activity.customFields?.['Competências ENEM'] || activity.customFields?.competenciasENEM || '',
          contextoAdicional: activity.customFields?.['Contexto Adicional'] || activity.customFields?.contextoAdicional || '',
          etapas: [
            { id: 1, nome: 'Crie sua tese', tempo: '5:00', descricao: 'Desenvolva uma tese clara' },
            { id: 2, nome: 'Battle de teses', tempo: '5:00', descricao: 'Vote na melhor tese' },
            { id: 3, nome: 'Argumentação', tempo: '8:00', descricao: 'Desenvolva argumento completo' }
          ],
          etapa1_crieTese: {
            instrucoes: 'Desenvolva uma tese clara em até 2 linhas sobre o tema proposto',
            limiteCaracteres: 200,
            dicas: []
          },
          etapa2_battleTeses: {
            instrucoes: 'Escolha a melhor tese e justifique',
            tesesParaComparar: []
          },
          etapa3_argumentacao: {
            instrucoes: 'Desenvolva um argumento completo em 3 sentenças',
            estrutura: {
              afirmacao: 'Apresente sua afirmação',
              dadoExemplo: 'Forneça um dado ou exemplo',
              conclusao: 'Conclua seu argumento'
            },
            dicas: []
          }
        };
      }

      console.log('🎯 Conteúdo final para TeseRedacaoPreview:', contentToLoad);
      return <TeseRedacaoPreview content={contentToLoad} isLoading={false} />;
    }

    // 2. Quiz Interativo - USANDO PIPELINE UNIFICADO v1.0.0
    if (activityType === 'quiz-interativo') {
      console.log(`🔄 [UnifiedQuizPipeline] Processando quiz para ${activity.id}...`);
      
      const pipelineResult = processQuizWithUnifiedPipeline(activity.id, activity.originalData);
      
      if (pipelineResult.success && pipelineResult.questions.length > 0) {
        contentToLoad = {
          title: pipelineResult.title,
          description: pipelineResult.description,
          questions: pipelineResult.questions,
          totalQuestions: pipelineResult.metadata.validQuestions,
          timePerQuestion: 60,
          isGeneratedByAI: !pipelineResult.metadata.isFallback,
          isFallback: pipelineResult.metadata.isFallback,
          theme: pipelineResult.metadata.theme,
          subject: pipelineResult.metadata.subject,
          schoolYear: pipelineResult.metadata.schoolYear
        };
        
        console.log(`✅ [UnifiedQuizPipeline] Quiz carregado com sucesso:`, {
          questions: pipelineResult.questions.length,
          source: pipelineResult.metadata.extractionMethod,
          processingTimeMs: pipelineResult.metadata.processingTimeMs
        });
        
        if (pipelineResult.warnings?.length) {
          console.warn(`⚠️ [UnifiedQuizPipeline] Avisos:`, pipelineResult.warnings);
        }
      } else {
        console.warn('⚠️ [UnifiedQuizPipeline] Nenhuma questão válida encontrada');
        contentToLoad = null;
      }
    }
    // 3. Flash Cards
    else if (activityType === 'flash-cards') {
      const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
      console.log(`🃏 Flash Cards: Verificando conteúdo salvo para ${activity.id}. Existe?`, !!flashCardsSavedContent);

      if (flashCardsSavedContent) {
        try {
          const parsedContent = JSON.parse(flashCardsSavedContent);
          
          // VERIFICAÇÃO: Se localStorage tem apenas metadados leves, buscar da store
          if (parsedContent.hasFullDataInStore === true) {
            console.log('📦 Flash Cards: localStorage tem metadados leves, buscando da store Zustand...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              if (fullData.cards && Array.isArray(fullData.cards) && fullData.cards.length > 0) {
                contentToLoad = fullData;
                console.log(`✅ Flash Cards: ${fullData.cards.length} cards carregados da store Zustand`);
              }
            }
          } else {
            contentToLoad = parsedContent.data || parsedContent;
          }

          console.log('🃏 Flash Cards - Conteúdo parseado no modal de visualização:', contentToLoad);

          // Validar se o conteúdo tem cards válidos
          if (contentToLoad?.cards && Array.isArray(contentToLoad.cards) && contentToLoad.cards.length > 0) {
            const validCards = contentToLoad.cards.filter(card =>
              card && typeof card === 'object' && card.front && card.back
            );

            if (validCards.length > 0) {
              console.log(`✅ Flash Cards carregado com ${validCards.length} cards válidos para: ${activity.id}`);
              contentToLoad.cards = validCards;
            } else {
              console.warn('⚠️ Nenhum card válido encontrado');
              contentToLoad = null;
            }
          } else if (!contentToLoad?.cards) {
            console.warn('⚠️ Conteúdo de Flash Cards sem cards válidos');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao processar conteúdo de Flash Cards:', error);
          contentToLoad = null;
        }
      }
      
      // FALLBACK 1: Buscar dados da store Zustand
      if (!contentToLoad) {
        console.log('📦 Flash Cards: Buscando dados da store Zustand como fallback...');
        const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
        
        if (storeData) {
          // CORREÇÃO: Buscar em MÚLTIPLOS caminhos possíveis na store
          // 1. dados_construidos.generated_fields (setActivityGeneratedFields)
          // 2. dados_construidos diretamente (setActivityBuiltData)
          // 3. campos_preenchidos (formulário)
          const fullData = 
            storeData.dados_construidos?.generated_fields || 
            storeData.dados_construidos || 
            storeData.campos_preenchidos || 
            {};
          
          console.log('📦 Flash Cards: Dados encontrados na store:', {
            hasGeneratedFields: !!storeData.dados_construidos?.generated_fields,
            hasDadosConstruidos: !!storeData.dados_construidos,
            hasCamposPreenchidos: !!storeData.campos_preenchidos,
            fullDataKeys: Object.keys(fullData)
          });
          
          if (fullData.cards && Array.isArray(fullData.cards) && fullData.cards.length > 0) {
            const validCards = fullData.cards.filter(card =>
              card && typeof card === 'object' && card.front && card.back
            );
            if (validCards.length > 0) {
              contentToLoad = { ...fullData, cards: validCards };
              console.log(`✅ Flash Cards: ${validCards.length} cards carregados da store Zustand (fallback)`);
            }
          }
        }
      }
      
      // FALLBACK 2: Se não encontrou na store, usar dados do banco (originalData)
      if (!contentToLoad && activity.originalData) {
        console.log('🃏 Flash Cards: Usando dados do banco (originalData) como fallback');
        const dbData = activity.originalData.campos || activity.originalData;
        
        if (dbData && dbData.cards && Array.isArray(dbData.cards) && dbData.cards.length > 0) {
          const validCards = dbData.cards.filter(card =>
            card && typeof card === 'object' && card.front && card.back
          );
          
          if (validCards.length > 0) {
            contentToLoad = {
              ...dbData,
              cards: validCards,
              title: dbData.title || activity.originalData.titulo || 'Flash Cards',
              description: dbData.description || 'Atividade criada na plataforma'
            };
            console.log(`✅ Flash Cards: ${validCards.length} cards carregados do banco de dados`);
          }
        }
      }
      
      if (!contentToLoad) {
        console.log('ℹ️ Nenhum conteúdo específico encontrado para Flash Cards. Usando dados gerais.');
      }
    }
    // 4. Plano de Aula (com fallback para store e originalData)
    else if (activityType === 'plano-aula') {
      console.log('📚 ActivityViewModal: Processando Plano de Aula');
      
      // PRIORIDADE 1: Verificar localStorage com hasFullDataInStore check
      const planoContent = localStorage.getItem(`constructed_plano-aula_${activity.id}`);
      if (planoContent) {
        try {
          const parsedContent = JSON.parse(planoContent);
          
          // VERIFICAÇÃO: Se localStorage tem apenas metadados leves, buscar da store Zustand
          if (parsedContent.hasFullDataInStore === true) {
            console.log('📦 Plano de Aula: localStorage tem metadados leves, buscando da store Zustand...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              if (fullData.objetivos || fullData.metodologia || fullData.desenvolvimento) {
                contentToLoad = {
                  ...previewData,
                  ...fullData,
                  id: activity.id,
                  type: activityType,
                  title: fullData.titulo || fullData.title || previewData.title,
                  tema: fullData.tema || fullData['Tema ou Tópico Central'] || previewData.tema,
                  disciplina: fullData.disciplina || fullData['Componente Curricular'] || previewData.disciplina,
                  ano_escolar: fullData.ano_escolar || fullData['Ano Escolar'] || previewData.ano_escolar,
                  duracao: fullData.duracao || fullData['Duração da Aula'] || previewData.duracao
                };
                console.log(`✅ Plano de Aula: Dados carregados da store Zustand`);
              }
            }
          } else {
            // Dados completos no localStorage
            const data = parsedContent.data || parsedContent;
            if (data.objetivos || data.metodologia || data.desenvolvimento) {
              contentToLoad = { ...previewData, ...data };
              console.log(`✅ Plano de Aula: Dados carregados do localStorage`);
            }
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar constructed_plano-aula:', e);
        }
      }
      
      // PRIORIDADE 2: Tentar outras chaves do localStorage
      if (!contentToLoad) {
        const planoCacheKeys = [
          `activity_${activity.id}`,
          `schoolpower_plano-aula_content`,
          `activity_fields_${activity.id}`
        ];
        
        for (const key of planoCacheKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.objetivos || parsedData.metodologia || parsedData.desenvolvimento) {
                contentToLoad = { ...previewData, ...parsedData };
                console.log(`✅ Plano de Aula: Dados encontrados em ${key}`);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
            }
          }
        }
      }
      
      // PRIORIDADE 3: Buscar dados da store Zustand (fallback)
      if (!contentToLoad) {
        console.log('📦 Plano de Aula: Buscando dados da store Zustand como fallback...');
        const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
        if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
          const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
          if (fullData.objetivos || fullData.metodologia || fullData.desenvolvimento) {
            contentToLoad = {
              ...previewData,
              ...fullData,
              id: activity.id,
              type: activityType
            };
            console.log(`✅ Plano de Aula: Dados carregados da store Zustand (fallback)`);
          }
        }
      }
      
      // PRIORIDADE 4: Fallback para originalData (banco de dados)
      if (!contentToLoad && activity.originalData) {
        console.log('📊 Plano de Aula: Usando dados do banco (originalData) como fallback');
        const dbData = activity.originalData.campos || activity.originalData;
        
        if (dbData && (dbData.objetivos || dbData.metodologia || dbData.desenvolvimento)) {
          contentToLoad = {
            ...previewData,
            ...dbData,
            id: activity.id,
            type: activityType,
            title: dbData.title || activity.originalData.titulo || 'Plano de Aula',
            description: dbData.description || 'Atividade criada na plataforma'
          };
          console.log(`✅ Plano de Aula: Dados carregados do banco de dados`);
        }
      }
      
      if (!contentToLoad) {
        console.log('ℹ️ Nenhum conteúdo específico encontrado para Plano de Aula. Usando dados gerais.');
      }
    }
    // 5. Lista de Exercícios (BLINDAGEM V2.0 - usando funções centralizadas)
    else if (activityType === 'lista-exercicios') {
      console.log('📝 [ActivityViewModal] Carregando Lista de Exercícios via storage centralizado...');
      
      // PASSO 1: Usar função centralizada para carregar dados
      const storedData = loadExerciseListData(activity.id);
      
      if (storedData && storedData.questoes && storedData.questoes.length > 0) {
        // Dados já processados pela pipeline - usar diretamente
        previewData.questoes = storedData.questoes;
        previewData.titulo = storedData.titulo || previewData.title;
        previewData.disciplina = storedData.disciplina;
        previewData.tema = storedData.tema;
        previewData.isGeneratedByAI = storedData.isGeneratedByAI;
        previewData._processedByPipeline = storedData._processedByPipeline;
        console.log(`✅ Lista de Exercícios: ${storedData.questoes.length} questões carregadas via storage centralizado`);
      } else {
        // FALLBACK PARA STORE: Se storage centralizado não tem dados
        console.log('📦 Lista de Exercícios: Storage centralizado sem dados, tentando store Zustand...');
        
        const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
        if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
          const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
          
          // Processar pela pipeline unificada antes de usar
          if (fullData.questoes && Array.isArray(fullData.questoes) && fullData.questoes.length > 0) {
            console.log('🔄 Lista de Exercícios: Processando dados da store pela pipeline unificada...');
            const processedResult = processExerciseListWithUnifiedPipeline(fullData, {
              id: activity.id,
              tema: fullData.tema || previewData.theme,
              disciplina: fullData.disciplina || previewData.subject,
              titulo: fullData.titulo || previewData.title
            });
            
            if (processedResult.success && processedResult.questoes.length > 0) {
              previewData.questoes = processedResult.questoes as any;
              console.log(`✅ Lista de Exercícios: ${processedResult.questoes.length} questões processadas pela pipeline`);
            }
          }
        }
        
        // FALLBACK 3: Se ainda não tem questões, usar dados do banco (originalData)
        if (!previewData.questoes || previewData.questoes.length === 0) {
          if (activity.originalData) {
            console.log('📊 Lista de Exercícios: Usando dados do banco (originalData) como fallback');
            const dbData = activity.originalData.campos || activity.originalData;
            
            if (dbData && dbData.questoes && Array.isArray(dbData.questoes) && dbData.questoes.length > 0) {
              // Processar pela pipeline unificada
              const processedResult = processExerciseListWithUnifiedPipeline(dbData, {
                id: activity.id,
                tema: dbData.tema || previewData.theme,
                disciplina: dbData.disciplina || previewData.subject,
                titulo: dbData.titulo || previewData.title
              });
              
              if (processedResult.success && processedResult.questoes.length > 0) {
                previewData.questoes = processedResult.questoes as any;
                previewData.title = dbData.title || activity.originalData.titulo || previewData.title;
                previewData.description = dbData.description || previewData.description;
                console.log(`✅ Lista de Exercícios: ${processedResult.questoes.length} questões do banco processadas pela pipeline`);
              }
            }
          }
        }
      }
      
      try {
        const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
        if (deletedQuestionsJson) {
          const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
          console.log(`🔍 ActivityViewModal: Aplicando filtro de exclusões. IDs excluídos:`, deletedQuestionIds);

          // Filtrar questões excluídas em todas as possíveis localizações
          if (previewData.questoes && Array.isArray(previewData.questoes)) {
            previewData.questoes = previewData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questões filtradas na raiz: ${previewData.questoes.length} restantes`);
          }

          if (previewData.content?.questoes && Array.isArray(previewData.content.questoes)) {
            previewData.content.questoes = previewData.content.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questões filtradas no content: ${previewData.content.questoes.length} restantes`);
          }

          if (previewData.questions && Array.isArray(previewData.questions)) {
            previewData.questions = previewData.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questions filtradas: ${previewData.questions.length} restantes`);
          }

          if (previewData.content?.questions && Array.isArray(previewData.content.questions)) {
            previewData.content.questions = previewData.content.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Content questions filtradas: ${previewData.content.questions.length} restantes`);
          }

          // Adicionar os IDs excluídos aos dados para referência
          previewData.deletedQuestionIds = deletedQuestionIds;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao aplicar filtro de exclusões no ActivityViewModal:', error);
      }
    }
    // 5. Sequência Didática (com carregamento de dados da IA)
    else if (activityType === 'sequencia-didatica') {
      console.log('📚 ActivityViewModal: Processando Sequência Didática');

      // PRIORIDADE 1: Verificar localStorage com hasFullDataInStore check
      const sequenciaMainContent = localStorage.getItem(`constructed_sequencia-didatica_${activity.id}`);
      if (sequenciaMainContent) {
        try {
          const parsedContent = JSON.parse(sequenciaMainContent);
          
          // VERIFICAÇÃO: Se localStorage tem apenas metadados leves, buscar da store Zustand
          if (parsedContent.hasFullDataInStore === true) {
            console.log('📦 Sequência Didática: localStorage tem metadados leves, buscando da store Zustand...');
            const storeData = useChosenActivitiesStore.getState().getActivityById(activity.id);
            if (storeData?.campos_preenchidos || storeData?.dados_construidos?.generated_fields) {
              const fullData = storeData.dados_construidos?.generated_fields || storeData.campos_preenchidos || {};
              if (fullData.aulas || fullData.sequenciaDidatica || fullData.cronograma) {
                contentToLoad = {
                  ...previewData,
                  ...fullData,
                  id: activity.id,
                  type: activityType,
                  sequenciaDidatica: fullData.sequenciaDidatica || fullData,
                  metadados: {
                    totalAulas: fullData.quantidadeAulas || fullData.aulas?.length || 0,
                    totalDiagnosticos: fullData.quantidadeDiagnosticos || 0,
                    totalAvaliacoes: fullData.quantidadeAvaliacoes || 0,
                    isGeneratedByAI: true,
                    generatedAt: new Date().toISOString()
                  }
                };
                console.log(`✅ Sequência Didática: Dados carregados da store Zustand`);
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Erro ao processar constructed_sequencia-didatica:', e);
        }
      }

      // PRIORIDADE 2: Verificar múltiplas fontes de dados em ordem de prioridade
      if (!contentToLoad) {
        const sequenciaCacheKeys = [
          `constructed_sequencia-didatica_${activity.id}`,
          `schoolpower_sequencia-didatica_content`,
          `activity_${activity.id}`,
          `activity_fields_${activity.id}`
        ];

        let sequenciaContent = null;
        for (const key of sequenciaCacheKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              // Pular se já foi verificado acima e tem hasFullDataInStore
              if (parsedData.hasFullDataInStore === true) continue;
              
              // Verificar se tem estrutura válida de sequência didática
              if (parsedData.sequenciaDidatica ||
                  parsedData.aulas ||
                  parsedData.diagnosticos ||
                  parsedData.avaliacoes ||
                  parsedData.data?.sequenciaDidatica ||
                  parsedData.success) {
                sequenciaContent = parsedData;
                console.log(`✅ Dados da Sequência Didática encontrados em ${key}:`, parsedData);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
            }
          }
        }

        if (sequenciaContent) {
        // Processar dados de acordo com a estrutura encontrada
        let processedData = sequenciaContent;

        // Se os dados estão dentro de 'data' (resultado da API)
        if (sequenciaContent.data) {
          processedData = sequenciaContent.data;
        }

        // Se tem sucesso e dados estruturados
        if (sequenciaContent.success && sequenciaContent.data) {
          processedData = sequenciaContent.data;
        }

        // Mesclar dados da sequência didática com dados existentes
        contentToLoad = {
          ...previewData,
          ...processedData,
          id: activity.id,
          type: activityType,
          title: processedData.sequenciaDidatica?.titulo ||
                 processedData.titulo ||
                 processedData.title ||
                 previewData.title,
          description: processedData.sequenciaDidatica?.descricaoGeral ||
                      processedData.descricaoGeral ||
                      processedData.description ||
                      previewData.description,
          // Garantir estrutura completa para visualização
          sequenciaDidatica: processedData.sequenciaDidatica || processedData,
          metadados: processedData.metadados || {
            totalAulas: processedData.aulas?.length || 0,
            totalDiagnosticos: processedData.diagnosticos?.length || 0,
            totalAvaliacoes: processedData.avaliacoes?.length || 0,
            isGeneratedByAI: true,
            generatedAt: processedData.generatedAt || new Date().toISOString()
          }
        };
        console.log('📚 Dados da Sequência Didática processados para visualização:', contentToLoad);
        }
      }
      
      // FALLBACK: Se não encontrou no localStorage, usar dados do banco (originalData)
      if (!contentToLoad && activity.originalData) {
        console.log('📚 Sequência Didática: Usando dados do banco (originalData) como fallback');
        const dbData = activity.originalData.campos || activity.originalData;
        
        if (dbData && (dbData.aulas || dbData.cronograma || dbData.objetivosAprendizagem)) {
          contentToLoad = {
            ...previewData,
            ...dbData,
            id: activity.id,
            type: activityType,
            title: dbData.title || activity.originalData.titulo || 'Sequência Didática',
            description: dbData.description || 'Atividade criada na plataforma',
            sequenciaDidatica: dbData,
            metadados: {
              totalAulas: dbData.quantidadeAulas || dbData.aulas?.length || 0,
              totalDiagnosticos: dbData.quantidadeDiagnosticos || 0,
              totalAvaliacoes: dbData.quantidadeAvaliacoes || 0,
              isGeneratedByAI: true,
              generatedAt: new Date().toISOString()
            }
          };
          console.log('✅ Sequência Didática: Dados carregados do banco de dados');
        }
      }
      
      if (!contentToLoad) {
        console.log('⚠️ Nenhum conteúdo específico da Sequência Didática encontrado');
        // Criar estrutura básica a partir dos dados do formulário
        contentToLoad = {
          ...previewData,
          sequenciaDidatica: {
            titulo: previewData.title || 'Sequência Didática',
            descricaoGeral: previewData.description || 'Descrição da sequência didática',
            aulas: [],
            diagnosticos: [],
            avaliacoes: []
          },
          metadados: {
            totalAulas: 0,
            totalDiagnosticos: 0,
            totalAvaliacoes: 0,
            isGeneratedByAI: false,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    // Atualizar previewData com o conteúdo carregado, se aplicável
    if (contentToLoad) {
      if (activityType === 'quiz-interativo') {
        previewData = { ...previewData, ...contentToLoad };
      } else if (activityType === 'flash-cards') {
        previewData = { ...previewData, ...contentToLoad };
      } else if (activityType === 'sequencia-didatica') {
        previewData = contentToLoad; // Sequência didática substitui tudo
      } else {
        // Para outros tipos, mesclar campos relevantes
        previewData = { ...previewData, ...contentToLoad };
      }
    }


    console.log('📊 ActivityViewModal: Dados finais para preview:', previewData);

    switch (activityType) {
      case 'lista-exercicios':
        return (
          <ExerciseListPreview
            data={previewData}
            customFields={previewData.customFields}
            onQuestionSelect={handleQuestionSelect}
          />
        );

      case 'plano-aula':
        console.log('📚 Renderizando PlanoAulaPreview com dados:', previewData);
        return (
          <PlanoAulaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'sequencia-didatica':
        console.log('📚 Renderizando SequenciaDidaticaPreview com dados:', previewData);
        return (
          <SequenciaDidaticaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'quiz-interativo':
        console.log('📚 Renderizando QuizInterativoPreview com dados:', previewData);
        return (
          <QuizInterativoPreview
            content={previewData}
            isLoading={false}
          />
        );

      case 'flash-cards':
        console.log('🃏 Renderizando FlashCardsPreview com dados:', previewData);
        return (
          <FlashCardsPreview
            content={previewData}
            isLoading={false}
          />
        );

      case 'tese-redacao':
        console.log('📝 Renderizando TeseRedacaoPreview com dados:', previewData);
        return (
          <TeseRedacaoPreview
            content={previewData}
            isLoading={false}
          />
        );

      default:
        return (
          <ActivityPreview
            content={previewData}
            activityData={{ type: activityType, customFields: previewData.customFields }}
          />
        );
    }
  };

  // Conteúdo do modal
  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[99999] p-4"
        onClick={onClose}
      >
        <motion.div
          className={`${activityType === 'plano-aula' ? 'max-w-7xl' : 'max-w-6xl'} w-full max-h-[90vh] ${isLightMode ? 'bg-white' : 'bg-gray-800'} rounded-2xl shadow-xl overflow-hidden flex flex-col`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Cabeçalho Universal para todas as atividades */}
          <UniversalActivityHeader
            activityTitle={getActivityTitle()}
            activityIcon={getActivityIcon(activityType)}
            activityId={activity.id}
            activityType={activityType}
            userName={userInfo.displayName || userInfo.name}
            userAvatar={userInfo.avatar}
            stars={stars}
            onStarsChange={(newSTs) => setStars(newSTs)}
            onDownload={handleDownload}
            onContentExtract={isTextVersionActivity(activityType) ? handleContentExtract : undefined}
            onMoreOptions={() => {
              console.log('Menu de opções clicado');
            }}
          />

          {/* Botão de fechar fixo no canto superior direito */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>


          {/* Content Layout */}
          <div className="flex flex-1 overflow-hidden" style={{ height: isExerciseList ? 'calc(100% - 140px)' : 'calc(100% - 100px)' }}>
            {/* Question Navigation Sidebar - Only for Exercise Lists and when showSidebar is true */}
            {isExerciseList && questionsForSidebar.length > 0 && showSidebar && (
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex-shrink-0">
                <div className="p-4 space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-white dark:bg-gray-700 shadow-sm">
                    <CardContent className="p-3">
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Questões:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600 dark:text-gray-300">Total de pontos:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Navegação</h4>
                    {questionsForSidebar.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => scrollToQuestion(question.id, index)}
                        className={`w-full text-left p-2 text-xs rounded transition-colors ${
                          selectedQuestionId === question.id
                            ? 'bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 font-medium text-orange-800 dark:text-orange-200'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium dark:text-white">Questão {index + 1}</div>
                        <div className="text-gray-500 dark:text-gray-400 truncate mt-1">
                          {question.enunciado?.substring(0, 40)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-white dark:bg-gray-900" ref={contentRef}>
                {renderActivityPreview()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Usar Portal para renderizar o modal no body, garantindo que fique por cima de todos os componentes
  // Quando o ContentExtractModal está aberto, não renderizamos o ActivityViewModal para evitar sobreposição
  return (
    <>
      {!isContentExtractOpen && createPortal(modalContent, document.body)}
      
      {/* Modal de Versão em Texto para atividades versão texto */}
      <TextVersionModal
        isOpen={isContentExtractOpen}
        onClose={() => {
          setIsContentExtractOpen(false);
          onClose();
        }}
        activityType={activityType}
        activityTitle={getActivityTitle()}
        textContent={textVersionContent}
        activityData={activity}
      />
    </>
  );
}

// Default export for compatibility
export default ActivityViewModal;