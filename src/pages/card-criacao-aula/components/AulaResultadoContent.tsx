import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, User, Users, Play, MoreVertical, Share2, Download, Calendar, Lock, BarChart3, ChevronDown, Target, Wrench, BookOpen, Lightbulb, Layers, CheckCircle, FileText, MessageSquare, Award, Trash2, Edit3, Layout, Sparkles, MoreHorizontal, Clock, Copy, Wand2, FolderOpen, Globe, Upload, Search, Filter, X, Check, LayoutGrid, List, Star, GripVertical, GitBranch, GraduationCap, Upload as PublishIcon } from 'lucide-react';
import { Template, TEMPLATE_SECTIONS } from './TemplateDropdown';
import { atividadesNeonService, AtividadeNeon } from '@/services/atividadesNeonService';
import { ActivityViewModal } from '@/features/schoolpower/construction/ActivityViewModal';
import { aulasStorageService } from '@/services/aulasStorageService';
import { aulasIndexedDBService } from '@/services/aulasIndexedDBService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Zap, Heart, Briefcase, Monitor, PenTool, Users as UsersIcon, Brain, Compass, Presentation, HandHelping, Rocket } from 'lucide-react';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';

// ====================================================================
// SISTEMA DE MAPEAMENTO DE SEÇÕES DO TEMPLATE
// ====================================================================
// Este sistema converte os nomes das seções definidas em TEMPLATE_SECTIONS
// para IDs internos usados pelo componente, com ícones e configurações.
//
// COMO FUNCIONA:
// 1. O usuário seleciona um template (ex: "Aula Ativa")
// 2. O sistema busca as seções desse template em TEMPLATE_SECTIONS
// 3. Cada seção é mapeada para um ID interno com ícone e placeholder
// 4. As seções são renderizadas dinamicamente abaixo do card Objetivos
//
// PARA ADICIONAR NOVA SEÇÃO:
// 1. Adicione a seção em TEMPLATE_SECTIONS no TemplateDropdown.tsx
// 2. Adicione o mapeamento aqui em SECTION_NAME_TO_CONFIG
// ====================================================================

interface SectionMappingConfig {
  id: string;           // ID interno único da seção
  title: string;        // Título exibido no card
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  placeholder: string;  // Placeholder do textarea
}

// Mapeamento de nomes de seção (do template) para configuração interna
const SECTION_NAME_TO_CONFIG: Record<string, SectionMappingConfig> = {
  // Seções comuns a múltiplos templates
  'Objetivos': { id: 'objective', title: 'Objetivo da Aula', icon: Target, placeholder: 'Escreva o objetivo da aula...' },
  'Contextualização': { id: 'contextualizacao', title: 'Contextualização', icon: Compass, placeholder: 'Descreva a contextualização da aula...' },
  'Exploração': { id: 'exploracao', title: 'Exploração', icon: Zap, placeholder: 'Descreva as atividades de exploração...' },
  'Apresentação': { id: 'apresentacao', title: 'Apresentação', icon: Presentation, placeholder: 'Descreva a apresentação do conteúdo...' },
  'Prática Guiada': { id: 'pratica-guiada', title: 'Prática Guiada', icon: HandHelping, placeholder: 'Descreva as atividades de prática guiada...' },
  'Prática Independente': { id: 'pratica-independente', title: 'Prática Independente', icon: PenTool, placeholder: 'Descreva as atividades de prática independente...' },
  'Fechamento': { id: 'fechamento', title: 'Fechamento', icon: CheckCircle, placeholder: 'Descreva o fechamento da aula...' },
  'Demonstração': { id: 'demonstracao', title: 'Demonstração', icon: Monitor, placeholder: 'Descreva a demonstração prática...' },
  'Avaliação': { id: 'avaliacao', title: 'Avaliação', icon: Award, placeholder: 'Descreva os critérios de avaliação...' },
  'Engajamento': { id: 'engajamento', title: 'Engajamento', icon: Rocket, placeholder: 'Descreva as estratégias de engajamento...' },
  'Colaboração': { id: 'colaboracao', title: 'Colaboração', icon: UsersIcon, placeholder: 'Descreva as atividades colaborativas...' },
  'Reflexão': { id: 'reflexao', title: 'Reflexão', icon: Brain, placeholder: 'Descreva o momento de reflexão...' },
  'Desenvolvimento': { id: 'desenvolvimento', title: 'Desenvolvimento', icon: Layers, placeholder: 'Descreva o desenvolvimento da aula...' },
  'Aplicação': { id: 'aplicacao', title: 'Aplicação', icon: Briefcase, placeholder: 'Descreva as atividades de aplicação prática...' },
  // ====================================================================
  // SEÇÕES FINAIS OBRIGATÓRIAS (aparecem em TODOS os templates)
  // ====================================================================
  'Materiais Complementares': { id: 'materiais', title: 'Materiais Complementares', icon: FileText, placeholder: 'Liste os materiais complementares necessários para a aula...' },
  'Observações do Professor': { id: 'observacoes', title: 'Observações do Professor', icon: BookOpen, placeholder: 'Adicione observações e notas importantes sobre a aula...' },
  'Critérios BNCC': { id: 'bncc', title: 'Critérios BNCC', icon: GraduationCap, placeholder: 'Indique os critérios e competências da BNCC abordados...' },
};

// Seções padrão quando nenhum template é selecionado
// FIXO: Removidas seções inválidas (preEstudo, introducao, desenvolvimento, encerramento)
// Essas seções não existem em SECTION_NAME_TO_CONFIG
const DEFAULT_SECTION_ORDER = ['objective', 'materiais', 'observacoes', 'bncc'];

// Função helper para obter as seções baseadas no template
const getTemplateSectionOrder = (template: Template | null): string[] => {
  if (!template || !template.id) {
    console.log('📋 [TEMPLATE_SECTIONS] Nenhum template selecionado, usando seções padrão');
    return DEFAULT_SECTION_ORDER;
  }

  const templateSections = TEMPLATE_SECTIONS[template.id];
  if (!templateSections) {
    console.log(`📋 [TEMPLATE_SECTIONS] Template "${template.id}" não encontrado, usando seções padrão`);
    return DEFAULT_SECTION_ORDER;
  }

  // Sempre incluir 'objective' primeiro, depois as seções do template
  const sectionIds = ['objective'];
  
  for (const sectionName of templateSections) {
    const config = SECTION_NAME_TO_CONFIG[sectionName];
    if (config && config.id !== 'objective') {
      sectionIds.push(config.id);
    } else if (!config) {
      // Se não existe mapeamento, cria um ID baseado no nome
      const generatedId = sectionName.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      sectionIds.push(generatedId);
      console.log(`📋 [TEMPLATE_SECTIONS] Seção "${sectionName}" não mapeada, usando ID gerado: ${generatedId}`);
    }
  }

  console.log(`📋 [TEMPLATE_SECTIONS] Template "${template.name}" carregado com seções:`, sectionIds);
  return sectionIds;
};

interface AulaResultadoContentProps {
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
  createdAt?: Date;
  generatedData?: GeneratedLessonData | null;
}

export interface AulaResultadoContentRef {
  getAulaData: () => {
    titulo: string;
    objetivo: string;
    duracao: string;
    secoes: Record<string, { id: string; text: string; time?: string }>;
    sectionOrder: string[];
  };
}

type ThemeMode = 'orange' | 'purple';

const themeColors = {
  orange: {
    primary: '#FF6B00',
    secondary: '#FF8533',
    bgGradient: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.03) 100%)',
    border: 'rgba(255, 107, 0, 0.2)',
    circleBg: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
    circleBorder: 'rgba(255, 107, 0, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
    tagBg: 'rgba(255, 107, 0, 0.1)',
    tagBorder: 'rgba(255, 107, 0, 0.2)',
    shadow: 'rgba(255, 107, 0, 0.4)',
    shadowLight: 'rgba(255, 107, 0, 0.1)',
    menuBorder: 'rgba(255, 107, 0, 0.3)',
    analyticsBg: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.08) 100%)',
    analyticsBorder: 'rgba(255, 107, 0, 0.3)'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)',
    border: 'rgba(139, 92, 246, 0.2)',
    circleBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
    circleBorder: 'rgba(139, 92, 246, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    tagBg: 'rgba(139, 92, 246, 0.1)',
    tagBorder: 'rgba(139, 92, 246, 0.2)',
    shadow: 'rgba(139, 92, 246, 0.4)',
    shadowLight: 'rgba(139, 92, 246, 0.1)',
    menuBorder: 'rgba(139, 92, 246, 0.3)',
    analyticsBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
    analyticsBorder: 'rgba(139, 92, 246, 0.3)'
  }
};

// Componente de TextArea com redimensionamento automático otimizado
const AutoResizeTextarea = React.memo(({ value, onChange, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza o valor local apenas quando o valor externo muda via props (carregamento inicial ou reset)
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce a atualização do estado global para evitar re-renderizações pesadas a cada caractere
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Mantemos uma referência estável do evento ou apenas passamos o valor
    const event = { ...e, target: { ...e.target, value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
    
    timeoutRef.current = setTimeout(() => {
      onChange(event);
    }, 300); // 300ms de debounce é imperceptível para o salvamento mas ótimo para performance
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue]);

  // Limpa o timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={handleLocalChange}
      placeholder={placeholder}
      className="w-full bg-transparent border-0 text-white/90 placeholder-white/30 focus:outline-none resize-none overflow-hidden min-h-[100px] py-2"
      style={{ lineHeight: '1.6' }}
    />
  );
});

// Interface for saved draft data
interface AulaDraftData {
  aulaName: string;
  themeMode: ThemeMode;
  aulaImage: string | null;
  selectedTemplateId?: string | null; // ID do template selecionado
  sectionTexts: {
    objective: string;
    [key: string]: string;
  };
  sectionExpanded: {
    objective: boolean;
    [key: string]: boolean;
  };
  sectionVisible: {
    objective: boolean;
    [key: string]: boolean;
  };
  sectionTimes: Record<string, string>;
  sectionOrder: string[];
  // ====================================================================
  // SEÇÕES DINÂMICAS DO TEMPLATE (PERSISTÊNCIA)
  // ====================================================================
  // Armazena o estado de todas as seções dinâmicas geradas pelo template.
  // Isso permite que os dados sejam preservados entre recarregamentos.
  // ====================================================================
  dynamicSections?: Record<string, {
    id: string;
    text: string;
    isExpanded: boolean;
    isVisible: boolean;
    time: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    text: string;
    isExpanded: boolean;
    afterDivider: number;
    orderIndex: number;
  }>;
  sectionActivities: Array<{
    sectionId: string;
    activityId: string;
    activityData: any;
  }>;
  lastSaved: string;
}

// Helper function to generate storage key scoped by aula name
const getAulaStorageKey = (aulaName: string): string => {
  const sanitizedName = aulaName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `ponto_school_aula_draft_${sanitizedName}`;
};

// Helper function to load saved draft (browser-safe)
const loadSavedDraft = (aulaName: string): AulaDraftData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const key = getAulaStorageKey(aulaName);
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved) as AulaDraftData;
      if (data.aulaName === aulaName) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar rascunho salvo:', error);
    return null;
  }
};

const AulaResultadoContent = forwardRef<AulaResultadoContentRef, AulaResultadoContentProps>(({
  aulaName = 'Minha Nova Aula',
  selectedTemplate = null,
  turmaImage = null,
  turmaName = null,
  createdAt = new Date(),
  generatedData = null
}, ref) => {
  // Load saved draft on component mount (browser-safe)
  const savedDraft = useMemo(() => loadSavedDraft(aulaName), [aulaName]);
  
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Professor');
  const [aulaImage, setAulaImage] = useState<string | null>(savedDraft?.aulaImage ?? null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(savedDraft?.themeMode ?? 'orange');
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(savedDraft?.sectionExpanded?.objective ?? false);
  const [objectiveText, setObjectiveText] = useState(savedDraft?.sectionTexts?.objective ?? '');
  const [isPublished, setIsPublished] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // ====================================================================
  // ESTADO DINÂMICO PARA SEÇÕES DO TEMPLATE
  // ====================================================================
  // Estas seções são geradas dinamicamente baseado no template selecionado.
  // Cada seção tem seu próprio estado de texto, expansão e visibilidade.
  // ====================================================================
  interface DynamicSectionState {
    id: string;
    text: string;
    isExpanded: boolean;
    isVisible: boolean;
    time: string;
  }

  const [dynamicSections, setDynamicSections] = useState<Record<string, DynamicSectionState>>(() => {
    // ====================================================================
    // INICIALIZAÇÃO DAS SEÇÕES DINÂMICAS
    // ====================================================================
    // 1. Se existe um draft salvo com dynamicSections, usa os dados salvos
    // 2. Caso contrário, inicializa baseado no template selecionado
    // ====================================================================
    
    // Primeiro, verifica se há dados salvos
    if (savedDraft?.dynamicSections) {
      console.log('📋 [DYNAMIC_SECTIONS] Carregando seções do draft salvo:', Object.keys(savedDraft.dynamicSections));
      return savedDraft.dynamicSections;
    }
    
    // Caso contrário, inicializa baseado no template
    const sections: Record<string, DynamicSectionState> = {};
    const templateId = selectedTemplate?.id;
    
    if (templateId && TEMPLATE_SECTIONS[templateId]) {
      TEMPLATE_SECTIONS[templateId].forEach((sectionName) => {
        const config = SECTION_NAME_TO_CONFIG[sectionName];
        if (config && config.id !== 'objective') {
          sections[config.id] = {
            id: config.id,
            text: '',
            isExpanded: true,
            isVisible: true,
            time: '10 min'
          };
        }
      });
    }
    
    console.log('📋 [DYNAMIC_SECTIONS] Seções dinâmicas inicializadas:', Object.keys(sections));
    return sections;
  });

  // Handlers para seções dinâmicas
  const updateDynamicSection = useCallback((sectionId: string, updates: Partial<DynamicSectionState>) => {
    setDynamicSections(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...updates }
    }));
  }, []);

  // ====================================================================
  // SINCRONIZAÇÃO DE SEÇÕES DINÂMICAS COM TEMPLATE
  // ====================================================================
  // Este efeito garante que as seções dinâmicas sejam reconstruídas
  // sempre que o template selecionado mudar, mantendo dados existentes.
  // ====================================================================
  useEffect(() => {
    if (!selectedTemplate?.id) return;
    
    const templateSections = TEMPLATE_SECTIONS[selectedTemplate.id];
    if (!templateSections) return;

    setDynamicSections(prevSections => {
      const newSections: Record<string, DynamicSectionState> = {};
      
      templateSections.forEach((sectionName) => {
        const config = SECTION_NAME_TO_CONFIG[sectionName];
        if (config && config.id !== 'objective') {
          // Preserva dados existentes se a seção já existia
          if (prevSections[config.id]) {
            newSections[config.id] = prevSections[config.id];
          } else {
            // Cria nova seção
            newSections[config.id] = {
              id: config.id,
              text: '',
              isExpanded: true,
              isVisible: true,
              time: '10 min'
            };
          }
        }
      });
      
      console.log('📋 [DYNAMIC_SECTIONS] Template mudou, seções atualizadas:', Object.keys(newSections));
      return newSections;
    });
  }, [selectedTemplate?.id]);

  const [isEditingAulaName, setIsEditingAulaName] = useState(false);
  const [editingAulaName, setEditingAulaName] = useState(aulaName);
  const [currentAulaName, setCurrentAulaName] = useState(aulaName);

  // ====================================================================
  // APLICAÇÃO DOS DADOS GERADOS PELA IA
  // ====================================================================
  // Este efeito aplica os dados gerados pela IA nos estados corretos
  // quando o componente recebe dados do gerador de aulas.
  // ====================================================================
  useEffect(() => {
    if (!generatedData) {
      console.log('🤖 [AI_DATA] Nenhum dado gerado recebido');
      return;
    }
    
    console.log('🤖 [AI_DATA] ========================================');
    console.log('🤖 [AI_DATA] APLICANDO DADOS GERADOS PELA IA');
    console.log('🤖 [AI_DATA] ========================================');
    console.log('🤖 [AI_DATA] Título:', generatedData.titulo);
    console.log('🤖 [AI_DATA] Objetivo:', generatedData.objetivo?.substring(0, 100) + '...');
    console.log('🤖 [AI_DATA] Seções recebidas:', Object.keys(generatedData.secoes || {}));
    
    // Atualiza o nome da aula (título)
    if (generatedData.titulo) {
      console.log('🤖 [AI_DATA] Aplicando título:', generatedData.titulo);
      setCurrentAulaName(generatedData.titulo);
      setEditingAulaName(generatedData.titulo);
    }
    
    // Atualiza o objetivo
    if (generatedData.objetivo) {
      console.log('🤖 [AI_DATA] Aplicando objetivo (primeiros 100 chars):', generatedData.objetivo.substring(0, 100));
      setObjectiveText(generatedData.objetivo);
    }
    
    // Atualiza as seções dinâmicas
    if (generatedData.secoes && Object.keys(generatedData.secoes).length > 0) {
      console.log('🤖 [AI_DATA] Aplicando seções dinâmicas...');
      
      setDynamicSections(prev => {
        const updated = { ...prev };
        
        Object.entries(generatedData.secoes).forEach(([sectionId, content]) => {
          if (sectionId === 'objective') {
            // Objetivo já foi tratado acima
            return;
          }
          
          if (updated[sectionId]) {
            console.log(`🤖 [AI_DATA] Seção "${sectionId}" atualizada: ${(content as string).substring(0, 50)}...`);
            updated[sectionId] = {
              ...updated[sectionId],
              text: content as string
            };
          } else {
            // Se a seção não existe, cria uma nova
            console.log(`🤖 [AI_DATA] Seção "${sectionId}" criada: ${(content as string).substring(0, 50)}...`);
            updated[sectionId] = {
              id: sectionId,
              text: content as string,
              isExpanded: true,
              isVisible: true,
              time: '10 min'
            };
          }
        });
        
        console.log('🤖 [AI_DATA] Seções dinâmicas atualizadas:', Object.keys(updated));
        return updated;
      });
    }
    
    console.log('🤖 [AI_DATA] ========================================');
    console.log('🤖 [AI_DATA] DADOS APLICADOS COM SUCESSO');
    console.log('🤖 [AI_DATA] ========================================');
  }, [generatedData]);

  // Estado de visibilidade para seção Objetivo (única seção fixa)
  const [isObjectiveVisible, setIsObjectiveVisible] = useState(savedDraft?.sectionVisible?.objective ?? true);

  // Estado para ordem das seções (drag and drop)
  // ====================================================================
  // SEÇÕES DINÂMICAS BASEADAS NO TEMPLATE
  // ====================================================================
  // O sectionOrder é inicializado com base no template selecionado.
  // Se houver um draft salvo, usa as seções do draft.
  // Caso contrário, gera as seções baseadas no template selecionado.
  // ====================================================================
  const initialSectionOrder = useMemo(() => {
    if (savedDraft?.sectionOrder) {
      console.log('📋 [SECTION_ORDER] Usando ordem do draft salvo:', savedDraft.sectionOrder);
      return savedDraft.sectionOrder;
    }
    return getTemplateSectionOrder(selectedTemplate);
  }, [savedDraft, selectedTemplate]);

  const [sectionOrder, setSectionOrder] = useState<string[]>(initialSectionOrder);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Handler de publicação da aula
  const handlePublishAula = useCallback(async () => {
    try {
      console.log('[PUBLISH_AULA_START] Iniciando publicação...');
      
      // 1. Validar estado: já publicado?
      if (isPublished) {
        console.log('[PUBLISH_AULA_ERROR] Aula já foi publicada');
        return;
      }

      // 2. Iniciar loading
      setIsPublishing(true);
      console.log('[PUBLISH_AULA_LOADING] isPublishing = true');

      // 3. Coletar dados
      const aulaData = {
        titulo: currentAulaName,
        objetivo: objectiveText,
        duracao: '60 min',
        secoes: Object.fromEntries(
          Object.entries(dynamicSections).map(([id, section]) => [
            id,
            { id: section.id, text: section.text, time: section.time }
          ])
        ),
        sectionOrder
      };
      console.log('[PUBLISH_AULA_DATA] Dados coletados:', aulaData);

      // 4. Validar dados
      if (!aulaData || !aulaData.titulo || aulaData.titulo.trim() === '') {
        console.error('[PUBLISH_AULA_ERROR] ❌ Título vazio ou ausente');
        setIsPublishing(false);
        alert('❌ Por favor, preencha o título da aula antes de publicar');
        return;
      }

      // 5. Tentar salvar via localStorage primeiro
      console.log('[PUBLISH_AULA_SAVING] Tentando salvar em localStorage...');
      let aulaSalva;
      
      try {
        aulaSalva = aulasStorageService.salvarAula({
          titulo: aulaData.titulo,
          objetivo: aulaData.objetivo || '',
          templateId: selectedTemplate?.id || 'unknown',
          templateName: selectedTemplate?.name || 'Template',
          turmaName: turmaName,
          turmaImage: turmaImage,
          duracao: aulaData.duracao,
          status: 'publicada',
          secoes: aulaData.secoes,
          sectionOrder: aulaData.sectionOrder
        });
        console.log('[PUBLISH_AULA_STORAGE] ✅ Salvo em localStorage:', aulaSalva);
      } catch (localStorageErr) {
        // Se localStorage falhar, usa IndexedDB como fallback
        console.warn('[PUBLISH_AULA_FALLBACK] localStorage cheio, usando IndexedDB...');
        aulaSalva = {
          id: `aula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          titulo: aulaData.titulo,
          objetivo: aulaData.objetivo || '',
          templateId: selectedTemplate?.id || 'unknown',
          templateName: selectedTemplate?.name || 'Template',
          turmaName: turmaName,
          turmaImage: turmaImage,
          duracao: aulaData.duracao,
          status: 'publicada' as const,
          secoes: aulaData.secoes,
          sectionOrder: aulaData.sectionOrder,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        
        await aulasIndexedDBService.salvarAulaIndexedDB(aulaSalva);
        console.log('[PUBLISH_AULA_INDEXED_DB] ✅ Salvo em IndexedDB:', aulaSalva);
      }

      // 6. Atualizar estado
      setIsPublished(true);
      setIsPublishing(false);
      console.log('[PUBLISH_AULA_SUCCESS] ✅ isPublished = true, isPublishing = false');

      // 7. Disparar evento para atualizar a grade na mesma aba
      console.log('[PUBLISH_TRIGGER] Disparando evento "aulasPublicadas"');
      window.dispatchEvent(new Event('aulasPublicadas'));

      // 8. Mostrar modal
      setShowPublishModal(true);
      console.log('[PUBLISH_AULA_MODAL] Modal de sucesso aberto');

      // 9. Auto-fechar modal
      setTimeout(() => {
        setShowPublishModal(false);
        console.log('[PUBLISH_AULA_MODAL_CLOSED] Modal fechado automaticamente');
      }, 3000);
    } catch (error) {
      console.error('[PUBLISH_AULA_CATCH] ❌ ERRO NA PUBLICAÇÃO:', error);
      setIsPublishing(false);
      alert(`❌ Erro ao publicar: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  }, [currentAulaName, objectiveText, dynamicSections, sectionOrder, selectedTemplate, turmaName, turmaImage, isPublished]);

  // ====================================================================
  // EXPOSIÇÃO DE MÉTODOS VIA REF (useImperativeHandle)
  // ====================================================================
  // Expõe o método getAulaData para que o componente pai possa obter
  // os dados da aula para salvamento.
  // ====================================================================
  useImperativeHandle(ref, () => ({
    getAulaData: () => {
      console.log('📤 [GET_AULA_DATA] Coletando dados da aula para salvamento...');
      
      const secoes: Record<string, { id: string; text: string; time?: string }> = {};
      Object.entries(dynamicSections).forEach(([id, section]) => {
        secoes[id] = {
          id: section.id,
          text: section.text,
          time: section.time
        };
      });
      
      const data = {
        titulo: currentAulaName,
        objetivo: objectiveText,
        duracao: '60 min',
        secoes,
        sectionOrder
      };
      
      console.log('📤 [GET_AULA_DATA] Dados coletados:', data);
      console.log('📤 [GET_AULA_DATA] Validando titulo:', { titulo: data.titulo, isEmpty: !data.titulo || data.titulo.trim() === '' });
      
      // VALIDAÇÃO: Se título está vazio, retorna null
      if (!data.titulo || data.titulo.trim() === '') {
        console.error('[GET_AULA_DATA_VALIDATION] ❌ Título vazio, bloqueando publicação');
        return null;
      }
      
      return data;
    }
  }), [currentAulaName, objectiveText, dynamicSections, sectionOrder]);

  // ====================================================================
  // SINCRONIZAÇÃO SIMPLIFICADA DE sectionOrder QUANDO O TEMPLATE MUDA
  // ====================================================================
  // REGRA SIMPLES: Sempre que o selectedTemplate.id mudar, recalcula
  // as seções. A ordem inicial já foi definida pelo initialSectionOrder.
  // Este efeito só roda após a primeira renderização (mudanças reais).
  // ====================================================================
  const previousTemplateIdRef = useRef<string | null>(selectedTemplate?.id ?? null);
  
  // ====================================================================
  // SINCRONIZAÇÃO TAMBÉM NA INICIALIZAÇÃO
  // Quando template é selecionado, update sectionOrder imediatamente
  // ====================================================================
  useEffect(() => {
    if (!selectedTemplate?.id) {
      console.log('🔴 [PONTO 1] NENHUM TEMPLATE SELECIONADO');
      return;
    }
    
    const newOrder = getTemplateSectionOrder(selectedTemplate);
    console.log('🔴 [PONTO 1] TEMPLATE SELECIONADO');
    console.log('   Template ID:', selectedTemplate.id);
    console.log('   Template Name:', selectedTemplate.name);
    console.log('   sectionOrder NOVO:', newOrder);
    setSectionOrder(newOrder);
    previousTemplateIdRef.current = selectedTemplate.id;
  }, [selectedTemplate?.id]);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler para quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };
  
  // Estado para seções personalizadas adicionadas pelo usuário
  interface CustomSection {
    id: string;
    title: string;
    text: string;
    isExpanded: boolean;
    afterDivider: number;
    orderIndex: number;
  }
  const [customSections, setCustomSections] = useState<CustomSection[]>(savedDraft?.customSections ?? []);
  const [hoveredDividerIndex, setHoveredDividerIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);


  // Estados para o dropdown de atividades
  const [activeActivityDropdown, setActiveActivityDropdown] = useState<string | null>(null);
  const [showMyActivitiesPanel, setShowMyActivitiesPanel] = useState(false);
  const [myActivitiesSectionId, setMyActivitiesSectionId] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<AtividadeNeon[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estado para o modal de visualização de atividade
  const [viewingActivity, setViewingActivity] = useState<AtividadeNeon | null>(null);

  // Interface para atividades adicionadas às seções
  interface SectionActivity {
    sectionId: string;
    activityId: string;
    activityData: AtividadeNeon;
  }
  const [sectionActivities, setSectionActivities] = useState<SectionActivity[]>(savedDraft?.sectionActivities ?? []);

  // Auto-save to localStorage with debounce (scoped by aulaName)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const draftData: AulaDraftData = {
        aulaName,
        themeMode,
        aulaImage,
        sectionTexts: {
          objective: objectiveText,
        },
        sectionExpanded: {
          objective: isObjectiveExpanded,
        },
        sectionVisible: {
          objective: isObjectiveVisible,
        },
        sectionTimes: {},
        sectionOrder,
        selectedTemplateId: selectedTemplate?.id ?? null,
        dynamicSections,
        customSections,
        sectionActivities: sectionActivities.map(sa => ({
          sectionId: sa.sectionId,
          activityId: sa.activityId,
          activityData: sa.activityData,
        })),
        lastSaved: new Date().toISOString(),
      };
      
      try {
        const storageKey = getAulaStorageKey(aulaName);
        localStorage.setItem(storageKey, JSON.stringify(draftData));
        console.log('💾 Rascunho salvo automaticamente para:', aulaName);
        console.log('💾 [DYNAMIC_SECTIONS] Seções dinâmicas salvas:', Object.keys(dynamicSections));
      } catch (error) {
        console.error('Erro ao salvar rascunho:', error);
      }
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    aulaName, themeMode, aulaImage, selectedTemplate,
    objectiveText, isObjectiveExpanded, isObjectiveVisible,
    sectionOrder, customSections, sectionActivities, dynamicSections,
  ]);

  // Handlers memoizados para campos de texto (performance)
  const handleObjectiveChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setObjectiveText(e.target.value), []);

  // Configuração das seções para drag and drop
  type SectionConfig = {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    isVisible: boolean;
    setVisible: (v: boolean) => void;
    isExpanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    time: string;
    setTime: (t: string) => void;
    menuId: string;
    dividerIndex: number;
    delay: number;
  };

  // ====================================================================
  // CONFIGURAÇÃO DE SEÇÕES - SÍNCRONIZAÇÃO PERFEITA COM TEMPLATE
  // ====================================================================
  // CRÍTICO: sectionConfigs é criado APENAS com as seções em sectionOrder.
  // Isso garante sincronização 100% perfeita entre template → sectionOrder → renderização.
  //
  // Fluxo:
  // 1. Template selecionado → getTemplateSectionOrder retorna os IDs
  // 2. sectionOrder recebe os IDs das seções do template
  // 3. sectionConfigs cria configs APENAS para esses IDs
  // 4. Renderização mapeia sectionOrder e encontra config em sectionConfigs
  //
  // Resultado: Seções sempre sincronizadas com o template!
  // ====================================================================
  const sectionConfigs = useMemo((): Record<string, SectionConfig> => {
    console.log('🟡 [PONTO 2] MONTANDO sectionConfigs');
    console.log('   sectionOrder:', sectionOrder);
    console.log('   dynamicSections keys:', Object.keys(dynamicSections));
    
    const configs: Record<string, SectionConfig> = {
      // Seção de Objetivo - SEMPRE PRESENTE E FIXA
      objective: {
        id: 'objective',
        title: 'Objetivo da Aula',
        icon: Target,
        isVisible: isObjectiveVisible,
        setVisible: setIsObjectiveVisible,
        isExpanded: isObjectiveExpanded,
        setExpanded: setIsObjectiveExpanded,
        text: objectiveText,
        onChange: handleObjectiveChange,
        placeholder: 'Escreva o objetivo da aula...',
        time: '',
        setTime: () => {},
        menuId: 'objective',
        dividerIndex: 0,
        delay: 0.5,
      },
    };

    // ====================================================================
    // CRIAR CONFIGS APENAS PARA SEÇÕES EM sectionOrder
    // ====================================================================
    // Itera APENAS sobre os IDs em sectionOrder (que vêm do template)
    // e cria configurações para cada seção, buscando no dynamicSections.
    // ====================================================================
    sectionOrder.forEach((sectionId) => {
      if (sectionId === 'objective') return; // Já foi criada acima

      // Procura a configuração do mapeamento
      const mappingConfig = Object.values(SECTION_NAME_TO_CONFIG).find(
        config => config.id === sectionId
      );

      if (!mappingConfig) {
        console.warn(`⚠️ [SECTION_CONFIGS] Seção "${sectionId}" não tem mapeamento em SECTION_NAME_TO_CONFIG`);
        return;
      }

      const dynamicState = dynamicSections[sectionId];

      // Cria a configuração baseada no estado dinâmico
      configs[sectionId] = {
        id: sectionId,
        title: mappingConfig.title,
        icon: mappingConfig.icon,
        isVisible: dynamicState?.isVisible ?? true,
        setVisible: (v: boolean) => updateDynamicSection(sectionId, { isVisible: v }),
        isExpanded: dynamicState?.isExpanded ?? true,
        setExpanded: ((v: boolean | ((prev: boolean) => boolean)) => {
          if (typeof v === 'function') {
            setDynamicSections(prev => ({
              ...prev,
              [sectionId]: { 
                ...prev[sectionId], 
                isExpanded: v(prev[sectionId]?.isExpanded ?? true) 
              }
            }));
          } else {
            updateDynamicSection(sectionId, { isExpanded: v });
          }
        }) as React.Dispatch<React.SetStateAction<boolean>>,
        text: dynamicState?.text ?? '',
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
          updateDynamicSection(sectionId, { text: e.target.value }),
        placeholder: mappingConfig.placeholder,
        time: dynamicState?.time ?? '10 min',
        setTime: (t: string) => updateDynamicSection(sectionId, { time: t }),
        menuId: sectionId,
        dividerIndex: 0,
        delay: 0.6,
      };
    });

    console.log('📋 [SECTION_CONFIGS] Sincronizadas com sectionOrder:', Object.keys(configs));
    return configs;
  }, [
    sectionOrder,
    isObjectiveVisible, isObjectiveExpanded, objectiveText, handleObjectiveChange,
    dynamicSections, updateDynamicSection,
  ]);

  // Carregar atividades do usuário
  const loadUserActivities = async () => {
    setLoadingActivities(true);
    try {
      // Tentar obter o ID do usuário de várias fontes comuns no projeto
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('userId') || 
                     localStorage.getItem('supabase_user_id') || 
                     localStorage.getItem('neon_user_id');
      
      console.log('🔍 [MyActivitiesPanel] Buscando atividades para userId:', userId);
      
      if (!userId) {
        console.log('⚠️ [MyActivitiesPanel] userId não encontrado no localStorage');
        // Tentar buscar do perfil se não houver ID direto
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          const profile = JSON.parse(userProfileStr);
          if (profile.id) {
            console.log('✅ [MyActivitiesPanel] ID encontrado no perfil:', profile.id);
            const result = await atividadesNeonService.buscarAtividadesUsuario(profile.id);
            if (result.success && result.data) {
              setUserActivities(result.data);
            }
            return;
          }
        }
        setLoadingActivities(false);
        return;
      }

      const result = await atividadesNeonService.buscarAtividadesUsuario(userId);
      console.log('📋 [MyActivitiesPanel] Resultado da busca:', result);
      
      if (result.success && result.data) {
        console.log('✅ [MyActivitiesPanel] Atividades carregadas:', result.data.length);
        setUserActivities(result.data);
      } else {
        console.log('⚠️ [MyActivitiesPanel] Nenhuma atividade encontrada ou erro:', result.error);
        setUserActivities([]); // Garante que a lista não fique undefined
      }
    } catch (error) {
      console.error('❌ [MyActivitiesPanel] Erro ao carregar atividades:', error);
      setUserActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Filtrar atividades
  const filteredActivities = (userActivities || []).filter(activity => {
    if (!activity) return false;
    
    const titulo = activity.id_json?.titulo || activity.id_json?.title || '';
    const tipo = activity.tipo || '';
    
    const matchesSearch = activitySearchTerm === '' || 
      titulo.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
      tipo.toLowerCase().includes(activitySearchTerm.toLowerCase());
      
    const matchesType = activityTypeFilter === 'all' || activity.tipo === activityTypeFilter;
    
    return matchesSearch && matchesType;
  });

  // Adicionar atividades selecionadas a uma seção
  const addActivitiesToSection = (sectionId: string) => {
    const newActivities = selectedActivities.map(actId => {
      const activity = userActivities.find(a => a.id === actId);
      return {
        sectionId,
        activityId: actId,
        activityData: activity!
      };
    }).filter(a => a.activityData);
    
    setSectionActivities(prev => [...prev, ...newActivities]);
    setSelectedActivities([]);
    setShowMyActivitiesPanel(false);
    setMyActivitiesSectionId(null);
  };

  // Componente ActivityDropdown - Dropdown para cima com as 4 opções
  const ActivityDropdown = ({ sectionId, onClose, position }: { sectionId: string; onClose: () => void, position?: { bottom: number, left: number } }) => {
    const dropdownOptions = [
      { id: 'minhas', icon: FolderOpen, label: 'Minhas atividades', color: theme.primary },
      { id: 'gerar', icon: Wand2, label: 'Gerar nova', color: '#10B981' },
      { id: 'comunidade', icon: Globe, label: 'Comunidade', color: '#3B82F6' },
      { id: 'subir', icon: Upload, label: 'Subir materiais', color: '#8B5CF6' }
    ];

    const handleOptionClick = (optionId: string) => {
      if (optionId === 'minhas') {
        setMyActivitiesSectionId(sectionId);
        setShowMyActivitiesPanel(true);
        loadUserActivities();
      } else if (optionId === 'gerar') {
        console.log('Gerar nova atividade para seção:', sectionId);
      } else if (optionId === 'comunidade') {
        console.log('Buscar na comunidade para seção:', sectionId);
      } else if (optionId === 'subir') {
        console.log('Subir materiais para seção:', sectionId);
      }
      onClose();
    };

    const style: React.CSSProperties = position 
      ? {
          position: 'fixed',
          bottom: position.bottom,
          left: position.left,
          background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
          border: `1px solid ${theme.menuBorder}`,
          boxShadow: `0 -10px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${theme.shadowLight}`,
          minWidth: '200px',
          zIndex: 9999
        }
      : {
          background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
          border: `1px solid ${theme.menuBorder}`,
          boxShadow: `0 -10px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${theme.shadowLight}`,
          minWidth: '200px'
        };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={position ? "rounded-xl overflow-hidden" : "absolute bottom-full left-0 mb-2 rounded-xl overflow-hidden z-[70]"}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-2">
          {dropdownOptions.map((option, index) => (
            <React.Fragment key={option.id}>
              <motion.button
                whileHover={{ x: 4, backgroundColor: `${option.color}1A` }}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
              >
                <option.icon className="w-4 h-4" style={{ color: option.color }} />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
              {index < dropdownOptions.length - 1 && (
                <div 
                  className="h-px mx-3 my-0.5"
                  style={{
                    background: `linear-gradient(to right, transparent, ${theme.primary}22, transparent)`
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    );
  };

  // Componente MyActivitiesPanel - Painel maior para selecionar atividades
  const MyActivitiesPanel = () => {
    if (!showMyActivitiesPanel || !myActivitiesSectionId) return null;

    const activityTypes = ['all', ...new Set(userActivities.map(a => a.tipo).filter(Boolean))];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={() => {
          setShowMyActivitiesPanel(false);
          setMyActivitiesSectionId(null);
          setSelectedActivities([]);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
            border: `1px solid ${theme.menuBorder}`,
            boxShadow: `0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px ${theme.shadowLight}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ 
              borderBottom: `1px solid ${theme.border}`,
              background: `linear-gradient(135deg, ${theme.primary}15 0%, transparent 100%)`
            }}
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5" style={{ color: theme.primary }} />
              <h3 className="text-white font-bold text-lg">Minhas Atividades</h3>
              {selectedActivities.length > 0 && (
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: theme.primary, color: 'white' }}
                >
                  {selectedActivities.length} selecionada{selectedActivities.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowMyActivitiesPanel(false);
                setMyActivitiesSectionId(null);
                setSelectedActivities([]);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>

          {/* Filters */}
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${theme.border}20` }}>
            <div 
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Search className="w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar atividades..."
                value={activitySearchTerm}
                onChange={(e) => setActivitySearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white text-sm placeholder-white/40 focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 rounded-lg text-white text-sm font-medium cursor-pointer focus:outline-none"
                style={{ 
                  background: `${theme.primary}20`, 
                  border: `1px solid ${theme.primary}40` 
                }}
              >
                <option value="all">Todos os tipos</option>
                {activityTypes.filter(t => t !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: theme.primary }} />
            </div>

            {/* Alternância de Visualização */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                style={{ color: viewMode === 'grid' ? theme.primary : undefined }}
                title="Visualização em Blocos"
              >
                <LayoutGrid className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                style={{ color: viewMode === 'list' ? theme.primary : undefined }}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Activities List */}
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 180px)' }}>
            {loadingActivities ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="text-white/50 text-sm">
                  {userActivities.length === 0 
                    ? 'Você ainda não tem atividades salvas' 
                    : 'Nenhuma atividade encontrada com esses filtros'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View (Blocos) */
              <div className="grid grid-cols-2 gap-4">
                {filteredActivities.map(activity => {
                  const isSelected = selectedActivities.includes(activity.id);
                  const title = activity.id_json?.titulo || activity.id_json?.title || activity.tipo || 'Atividade sem título';
                  const type = activity.tipo || 'Geral';
                  
                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedActivities(prev => 
                          isSelected 
                            ? prev.filter(id => id !== activity.id)
                            : [...prev, activity.id]
                        );
                      }}
                      className="relative flex flex-col h-36 rounded-2xl cursor-pointer overflow-hidden transition-all group"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: `1px solid ${isSelected ? theme.primary : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected ? `0 8px 20px ${theme.shadow}44` : 'none'
                      }}
                    >
                      {/* Borda decorativa lateral baseada no tipo */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1" 
                        style={{ background: theme.primary }}
                      />

                      {/* Conteúdo do Card */}
                      <div className="p-3 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <div 
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isSelected ? theme.primary : 'rgba(255,255,255,0.05)',
                              border: `1.5px solid ${isSelected ? theme.primary : 'rgba(255,255,255,0.2)'}`
                            }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span 
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: `${theme.primary}20`, color: theme.primary }}
                          >
                            {type}
                          </span>
                        </div>

                        <h4 className="text-white font-bold text-xs line-clamp-2 mb-auto group-hover:text-primary-orange transition-colors">
                          {title}
                        </h4>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          {activity.stars ? (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-[10px] text-white/50">{activity.stars}</span>
                            </div>
                          ) : <div />}
                          
                          {activity.created_at && (
                            <span className="text-[10px] text-white/30">
                              {new Date(activity.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Overlay de Seleção */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-orange/5 pointer-events-none" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* List View (Lista) */
              <div className="space-y-2">
                {filteredActivities.map(activity => {
                  const isSelected = selectedActivities.includes(activity.id);
                  const title = activity.id_json?.titulo || activity.id_json?.title || activity.tipo || 'Atividade sem título';
                  
                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => {
                        setSelectedActivities(prev => 
                          isSelected 
                            ? prev.filter(id => id !== activity.id)
                            : [...prev, activity.id]
                        );
                      }}
                      className="p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isSelected ? `${theme.primary}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? theme.primary : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: isSelected ? theme.primary : 'transparent',
                            border: `2px solid ${isSelected ? theme.primary : 'rgba(255,255,255,0.3)'}`
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: `${theme.primary}20`, color: theme.primary }}
                            >
                              {activity.tipo || 'Geral'}
                            </span>
                            {activity.stars && (
                              <span className="text-xs text-white/40">{activity.stars} estrelas</span>
                            )}
                            {activity.created_at && (
                              <span className="text-xs text-white/40">
                                {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with action button */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ 
              borderTop: `1px solid ${theme.border}`,
              background: `linear-gradient(135deg, transparent 0%, ${theme.primary}10 100%)`
            }}
          >
            <span className="text-white/50 text-sm">
              {filteredActivities.length} atividade{filteredActivities.length !== 1 ? 's' : ''} encontrada{filteredActivities.length !== 1 ? 's' : ''}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={selectedActivities.length === 0}
              onClick={() => addActivitiesToSection(myActivitiesSectionId)}
              className="px-6 py-2.5 rounded-full text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: selectedActivities.length > 0 ? theme.buttonGradient : 'rgba(255,255,255,0.1)',
                boxShadow: selectedActivities.length > 0 ? `0 4px 15px ${theme.shadow}` : 'none'
              }}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar {selectedActivities.length > 0 ? `(${selectedActivities.length})` : ''}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Botão de adicionar atividade reutilizável
  const AddActivityButton = ({ sectionId }: { sectionId: string }) => {
    const isOpen = activeActivityDropdown === sectionId;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ bottom: number, left: number } | null>(null);

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          bottom: window.innerHeight - rect.top + 8,
          left: rect.left
        });
      }
    }, [isOpen]);

    return (
      <div className="relative">
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors"
          style={{
            background: `${theme.primary}1A`,
            border: `1px solid ${theme.primary}33`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveActivityDropdown(isOpen ? null : sectionId);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar atividade</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && dropdownPosition && (
            <div className="fixed inset-0 z-[9998]" onClick={() => setActiveActivityDropdown(null)}>
              <ActivityDropdown 
                sectionId={sectionId} 
                onClose={() => setActiveActivityDropdown(null)} 
                position={dropdownPosition}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Fechar dropdown de atividade ao clicar fora
  useEffect(() => {
    const handleClickOutsideActivityDropdown = (event: MouseEvent) => {
      if (activeActivityDropdown) {
        setActiveActivityDropdown(null);
      }
    };

    if (activeActivityDropdown) {
      document.addEventListener('click', handleClickOutsideActivityDropdown);
    }
    return () => document.removeEventListener('click', handleClickOutsideActivityDropdown);
  }, [activeActivityDropdown]);

  // Remover atividade de uma seção
  const removeActivityFromSection = (sectionId: string, activityId: string) => {
    setSectionActivities(prev => prev.filter(a => !(a.sectionId === sectionId && a.activityId === activityId)));
  };

  // Componente para exibir atividades adicionadas em uma seção (estilo grade igual à sub-seção de Atividades)
  // Memorizado com React.memo para evitar re-renderizações desnecessárias e reinício de animações
  const SectionActivitiesGrid = React.memo(({ sectionId }: { sectionId: string }) => {
    const activitiesForSection = sectionActivities.filter(a => a.sectionId === sectionId);
    
    if (activitiesForSection.length === 0) return null;

    // Configurações profissionais de proporção (Exato: 208x260)
    const CARD_WIDTH = 208;
    const CARD_HEIGHT = 260;

    return (
      <div className="mt-4 flex flex-wrap gap-4 max-w-full">
        {activitiesForSection.map(({ activityId, activityData }) => {
          const title = activityData.id_json?.titulo || activityData.id_json?.title || activityData.tipo || 'Atividade sem título';
          const type = activityData.tipo || 'Geral';
          const createdDate = activityData.created_at 
            ? new Date(activityData.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : null;

          return (
            <motion.div
              key={activityId}
              layoutId={`activity-${activityId}-${sectionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -4, boxShadow: `0 12px 24px rgba(0,0,0,0.3)` }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer flex flex-col"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onClick={() => setViewingActivity(activityData)}
            >
              {/* Área do Ícone - Proporção Superior */}
              <div 
                className="flex items-center justify-center flex-1"
                style={{ background: 'rgba(0, 0, 0, 0.2)' }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${theme.primary}15`, border: `1px solid ${theme.primary}30` }}
                >
                  <FileText className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
              </div>

              {/* Informações da Atividade - Proporção Inferior */}
              <div 
                className="p-5 flex flex-col justify-between"
                style={{ 
                  height: '110px',
                  background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(30, 41, 59, 0.8) 100%)',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div className="space-y-1.5">
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{title}</h4>
                  <span 
                    className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${theme.primary}20`, color: theme.primary }}
                  >
                    {type}
                  </span>
                </div>
                
                {createdDate && (
                  <div className="flex items-center gap-1.5 text-white/30 text-[10px] mt-auto">
                    <Clock className="w-3 h-3" />
                    <span>{createdDate}</span>
                  </div>
                )}
              </div>

              {/* Botão de Remover (Profissional) */}
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  removeActivityFromSection(sectionId, activityId);
                }}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Comparação personalizada para garantir que só re-renderize se o sectionId mudar
    // O sectionActivities é acessado via closure, o que pode ser um problema se não usarmos o padrão correto.
    // Para simplificar e ser efetivo no Fast Mode, usaremos o memo básico primeiro.
    return prevProps.sectionId === nextProps.sectionId;
  });

  const SectionControls = ({ time, onTimeChange, onMoreClick }: { time: string, onTimeChange: (val: string) => void, onMoreClick: (e: React.MouseEvent) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTime, setTempTime] = useState(time.replace(' min', ''));

    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <div 
          className="flex items-center gap-2 px-4 h-8 rounded-full transition-all border"
          style={{ 
            background: `${theme.primary}1A`, 
            borderColor: `${theme.primary}4D`,
            backdropFilter: 'blur(8px)' 
          }}
        >
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                className="w-8 bg-transparent border-0 text-white text-xs font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  onTimeChange(`${tempTime || '0'} min`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                    onTimeChange(`${tempTime || '0'} min`);
                  }
                }}
              />
              <span style={{ color: `${theme.primary}99` }} className="text-xs font-semibold">min</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                setTempTime(time.replace(' min', ''));
                setIsEditing(true);
              }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span className="text-white text-xs font-semibold whitespace-nowrap">{time}</span>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1, background: `${theme.primary}33` }}
          whileTap={{ scale: 0.9 }}
          onClick={onMoreClick}
          data-section-more-button
          className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
          style={{ 
            background: `${theme.primary}1A`, 
            borderColor: `${theme.primary}4D`,
            backdropFilter: 'blur(8px)' 
          }}
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: theme.primary }} />
        </motion.button>
      </div>
    );
  };

  const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuSection) {
        // If there's an active menu, we can check if the click was outside the trigger/menu
        // However, since we're using a simple implementation, let's just close all menus on any click outside
        // that isn't the button itself (which is handled by propagation stop)
        setActiveMenuSection(null);
      }
    };

    if (activeMenuSection) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuSection]);

  const SectionMenu = ({ sectionId, onClose, onAction }: { sectionId: string, onClose: () => void, onAction: (action: string) => void }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-[60]"
        style={{
          background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
          border: `1px solid ${theme.menuBorder}`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${theme.shadowLight}`,
          minWidth: '160px'
        }}
      >
        <div className="py-2">
          <motion.button
            whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
            onClick={() => { onAction('duplicar'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm font-medium">Duplicar</span>
          </motion.button>

          <motion.button
            whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
            onClick={() => { onAction('adaptar'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
          >
            <Wand2 className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm font-medium">Adaptar</span>
          </motion.button>

          <div 
            className="h-px mx-3 my-1"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.primary}33, transparent)`
            }}
          />

          <motion.button
            whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            onClick={() => { onAction('excluir'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Excluir</span>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      // Fechar menu de seção ao clicar fora
      if (activeMenuSection) {
        const moreButtons = document.querySelectorAll('[data-section-more-button]');
        let clickedOnButton = false;
        moreButtons.forEach(btn => {
          if (btn.contains(event.target as Node)) clickedOnButton = true;
        });
        
        if (!clickedOnButton) {
          setActiveMenuSection(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuSection]);

  const theme = themeColors[themeMode];

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setAulaImage(imageData);
        // Salva a imagem imediatamente no localStorage
        if (typeof window !== 'undefined') {
          try {
            const storageKey = getAulaStorageKey(currentAulaName);
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const data = JSON.parse(saved) as AulaDraftData;
              data.aulaImage = imageData;
              localStorage.setItem(storageKey, JSON.stringify(data));
              console.log('📸 Imagem da aula salva no localStorage');
            }
          } catch (error) {
            console.error('Erro ao salvar imagem:', error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAulaName = (newName: string) => {
    if (newName.trim()) {
      setCurrentAulaName(newName);
      setEditingAulaName(newName);
      
      // Salva o novo nome no localStorage
      if (typeof window !== 'undefined') {
        try {
          const oldKey = getAulaStorageKey(aulaName);
          const newKey = getAulaStorageKey(newName);
          
          // Carrega o draft antigo
          const oldSaved = localStorage.getItem(oldKey);
          if (oldSaved) {
            const data = JSON.parse(oldSaved) as AulaDraftData;
            data.aulaName = newName;
            
            // Salva com a nova chave
            localStorage.setItem(newKey, JSON.stringify(data));
            
            // Opcionalmente, remove a chave antiga se diferente
            if (oldKey !== newKey) {
              localStorage.removeItem(oldKey);
            }
            console.log('💾 Nome da aula atualizado e salvo:', newName);
          }
        } catch (error) {
          console.error('Erro ao salvar nome da aula:', error);
        }
      }
    }
  };

  const handleMenuItemClick = (action: string) => {
    console.log(`Ação selecionada: ${action}`);
    setIsMenuOpen(false);
  };

  // Função para adicionar seção personalizada com suporte a inserção entre seções existentes
  // dividerIndex: índice do divisor principal (0-6)
  // insertAfterOrderIndex: se fornecido, insere após a seção com esse orderIndex (para inserir entre seções)
  const addCustomSection = (dividerIndex: number, insertAfterOrderIndex?: number) => {
    setCustomSections(prev => {
      // Filtra seções do mesmo divider para calcular orderIndex
      const sectionsInDivider = prev.filter(s => s.afterDivider === dividerIndex);
      
      let newOrderIndex: number;
      
      if (insertAfterOrderIndex !== undefined) {
        // Inserindo entre seções existentes
        // Encontra todas as seções com orderIndex maior que insertAfterOrderIndex e incrementa
        const updatedSections = prev.map(s => {
          if (s.afterDivider === dividerIndex && s.orderIndex > insertAfterOrderIndex) {
            return { ...s, orderIndex: s.orderIndex + 1 };
          }
          return s;
        });
        newOrderIndex = insertAfterOrderIndex + 1;
        
        const newSection: CustomSection = {
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: '',
          text: '',
          isExpanded: true,
          afterDivider: dividerIndex,
          orderIndex: newOrderIndex
        };
        
        return [...updatedSections, newSection];
      } else {
        // Adicionando ao final (comportamento padrão - clicou no divisor principal)
        const maxOrderIndex = sectionsInDivider.length > 0 
          ? Math.max(...sectionsInDivider.map(s => s.orderIndex)) 
          : -1;
        newOrderIndex = maxOrderIndex + 1;
        
        const newSection: CustomSection = {
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: '',
          text: '',
          isExpanded: true,
          afterDivider: dividerIndex,
          orderIndex: newOrderIndex
        };
        
        return [...prev, newSection];
      }
    });
    setHoveredDividerIndex(null);
  };

  // Função para renderizar seções personalizadas após um divisor específico
  // Inclui botões "Adicionar seção" entre cada seção personalizada
  const renderCustomSectionsForDivider = (dividerIndex: number) => {
    const sectionsForDivider = customSections
      .filter(s => s.afterDivider === dividerIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex); // Ordena por orderIndex
    
    if (sectionsForDivider.length === 0) return null;
    
    return sectionsForDivider.map((section, idx) => (
      <React.Fragment key={section.id}>
        {/* Card da seção personalizada */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl relative z-10 cursor-pointer"
          style={{ 
            background: theme.bgGradient, 
            border: `1px solid ${theme.border}`, 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            marginTop: '0px' // Sem margin-top, o espaçamento é controlado pelo divisor
          }}
          onClick={() => toggleCustomSectionExpand(section.id)}
        >
          <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
            <div className="flex items-center gap-3 flex-1">
              <Edit3 className="w-5 h-5" style={{ color: theme.primary }} />
              <input
                type="text"
                value={section.title}
                onChange={(e) => { e.stopPropagation(); updateCustomSectionTitle(section.id, e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Digite o título da seção..."
                className="bg-transparent border-0 text-white font-bold text-lg placeholder-white/40 focus:outline-none flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SectionControls 
                  time="10 min" // Default time for custom sections
                  onTimeChange={() => {}} 
                  onMoreClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuSection(activeMenuSection === section.id ? null : section.id);
                  }} 
                />
                <AnimatePresence>
                  {activeMenuSection === section.id && (
                    <SectionMenu 
                      sectionId={section.id} 
                      onClose={() => setActiveMenuSection(null)} 
                      onAction={(action) => handleSectionAction(section.id, action)} 
                    />
                  )}
                </AnimatePresence>
              </div>
              <motion.div animate={{ rotate: section.isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
              </motion.div>
            </div>
          </div>
          <AnimatePresence>
            {section.isExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 pb-4">
                  <AutoResizeTextarea 
                    value={section.text} 
                    onChange={(e) => updateCustomSectionText(section.id, e.target.value)} 
                    placeholder="Escreva o conteúdo desta seção..." 
                  />
                  <SectionActivitiesGrid sectionId={section.id} />
                  <div className="flex items-center gap-3 mt-3">
                    <AddActivityButton sectionId={section.id} />
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" 
                      style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} 
                      onClick={(e) => { e.stopPropagation(); console.log('Tools - Seção personalizada'); }}
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Tools</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Botão "Adicionar seção" APÓS cada seção personalizada (para inserir entre seções) */}
        <AddSectionDivider 
          index={dividerIndex} 
          onAdd={() => addCustomSection(dividerIndex, section.orderIndex)} 
        />
      </React.Fragment>
    ));
  };

  const updateCustomSectionTitle = (id: string, title: string) => {
    setCustomSections(sections => 
      sections.map(s => s.id === id ? { ...s, title } : s)
    );
  };

  const updateCustomSectionText = (id: string, text: string) => {
    setCustomSections(sections => 
      sections.map(s => s.id === id ? { ...s, text } : s)
    );
  };

  const toggleCustomSectionExpand = (id: string) => {
    setCustomSections(sections => 
      sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s)
    );
  };

  const deleteCustomSection = (id: string) => {
    setCustomSections(sections => sections.filter(s => s.id !== id));
  };

  const handleSectionAction = (sectionId: string, action: string) => {
    if (action === 'excluir') {
      // Identificar se é uma seção padrão ou personalizada
      const defaultSections = [
        'objective', 'preEstudo', 'introducao', 'desenvolvimento', 
        'encerramento', 'materiais', 'observacoes', 'bncc'
      ];
      
      if (defaultSections.includes(sectionId)) {
        // Esconde a seção dinâmica
        if (sectionId === 'objective') {
          setIsObjectiveVisible(false);
        } else {
          updateDynamicSection(sectionId, { isVisible: false });
        }
      } else {
        // Seção personalizada - remove completamente
        deleteCustomSection(sectionId);
      }
    } else if (action === 'duplicar') {
      let sourceTitle = '';
      let sourceText = '';
      let afterDivider = 0;

      // Obter dados da seção (padrão ou personalizada)
      if (sectionId === 'objective') {
        sourceTitle = 'Objetivos';
        sourceText = objectiveText;
        afterDivider = 0;
      } else if (dynamicSections[sectionId]) {
        const config = sectionConfigs[sectionId];
        sourceTitle = config?.title || sectionId;
        sourceText = dynamicSections[sectionId].text;
        // Obter ordem da seção no sectionOrder para determinar o divisor
        const sectionIndex = sectionOrder.indexOf(sectionId);
        afterDivider = Math.max(0, sectionIndex);
      } else {
        const custom = customSections.find(s => s.id === sectionId);
        if (custom) {
          sourceTitle = custom.title;
          sourceText = custom.text;
          afterDivider = custom.afterDivider;
        }
      }

      if (sourceTitle || sourceText) {
        setCustomSections(prev => {
          const sectionsInDivider = prev.filter(s => s.afterDivider === afterDivider);
          const maxOrderIndex = sectionsInDivider.length > 0 
            ? Math.max(...sectionsInDivider.map(s => s.orderIndex)) 
            : -1;
          
          return [...prev, {
            id: `section-${Date.now()}`,
            title: `${sourceTitle} (Cópia)`,
            text: sourceText,
            isExpanded: true,
            afterDivider,
            orderIndex: maxOrderIndex + 1
          }];
        });
      }
    }
  };

  // Constante para espaçamento vertical milimétrico entre cards
  // Este valor é usado para garantir posicionamento exato e simétrico do botão
  const CARD_VERTICAL_SPACING = 14; // 14px = espaçamento total entre cards

  // Componente para seção arrastável com handle de drag
  const SortableSectionCard = React.memo(({ id, children }: { id: string; children: React.ReactNode }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0 : 1, // Esconde o card original enquanto arrasta
      zIndex: isDragging ? 0 : 10,
    };

    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 opacity-0 hover:opacity-100 transition-opacity rounded-l-2xl"
          style={{
            background: `linear-gradient(to right, ${theme.primary}15, transparent)`,
          }}
          title="Arraste para reordenar"
        >
          <GripVertical className="w-5 h-5" style={{ color: theme.primary }} />
        </div>
        {children}
      </div>
    );
  });

  // Função para renderizar uma seção baseada na configuração
  const renderSection = (config: SectionConfig) => {
    const IconComponent = config.icon;
    const isObjective = config.id === 'objective';
    const extraClass = config.id === 'bncc' ? 'mb-6' : '';
    
    return (
      <motion.div
        layout
        initial={false}
        animate={{ 
          background: theme.bgGradient,
          borderColor: theme.border
        }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl relative z-10 cursor-pointer ${extraClass}`}
        style={{
          background: theme.bgGradient,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => config.setExpanded(!config.isExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <IconComponent className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">{config.title}</span>
          </div>
          <div className="flex items-center gap-3">
            {!isObjective && (
              <div className="relative">
                <SectionControls 
                  time={config.time} 
                  onTimeChange={config.setTime} 
                  onMoreClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuSection(activeMenuSection === config.menuId ? null : config.menuId);
                  }} 
                />
                <AnimatePresence>
                  {activeMenuSection === config.menuId && (
                    <SectionMenu 
                      sectionId={config.menuId} 
                      onClose={() => setActiveMenuSection(null)}
                      onAction={(action) => handleSectionAction(config.id, action)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
            <motion.div
              animate={{ rotate: config.isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {config.isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-4">
                <AutoResizeTextarea
                  value={config.text}
                  onChange={config.onChange}
                  placeholder={config.placeholder}
                />

                <SectionActivitiesGrid sectionId={config.menuId} />

                <div className="flex items-center gap-3 mt-3">
                  <AddActivityButton sectionId={config.menuId} />

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors"
                    style={{
                      background: `${theme.primary}1A`,
                      border: `1px solid ${theme.primary}33`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Tools - ${config.title}`);
                    }}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Tools</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };
  
  const AddSectionDivider = ({ index, onAdd }: { index: number; onAdd: () => void }) => (
    <div 
      className="flex items-center justify-center"
      style={{
        // Espaçamento milimétrico: padding vertical simétrico para centralização perfeita
        paddingTop: `${CARD_VERTICAL_SPACING}px`,
        paddingBottom: `${CARD_VERTICAL_SPACING}px`,
        // Garante que o botão fique exatamente no centro vertical entre os cards
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5
      }}
    >
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="flex items-center gap-2 px-6 py-2 rounded-full cursor-pointer transition-all duration-200"
        style={{
          background: `${theme.primary}15`,
          border: `1px dashed ${theme.primary}50`,
        }}
        whileHover={{ 
          scale: 1.02,
          background: `${theme.primary}25`,
          borderColor: theme.primary
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-5 h-5" style={{ color: theme.primary }} />
        <span className="text-sm font-medium" style={{ color: theme.primary }}>
          Adicionar seção
        </span>
      </motion.button>
    </div>
  );

  const CIRCLE_SIZE = 72;
  const ACTION_CIRCLE_SIZE = 48;

  return (
    <div className="w-full h-full flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <div className="relative">
        <motion.div
          ref={summaryCardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            background: theme.bgGradient,
            borderColor: theme.border
          }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 flex items-center justify-between relative z-20"
          style={{
            background: theme.bgGradient,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center gap-5 flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                animate={{
                  background: aulaImage ? 'transparent' : theme.circleBg,
                  borderColor: theme.circleBorder
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: aulaImage 
                    ? 'transparent'
                    : theme.circleBg,
                  border: `2px solid ${theme.circleBorder}`
                }}
              >
                {aulaImage ? (
                  <img 
                    src={aulaImage} 
                    alt="Imagem da aula"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-7 h-7" style={{ color: `${theme.primary}99` }} />
                )}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageUploadClick}
                animate={{ background: theme.buttonGradient }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: theme.buttonGradient,
                  border: '2px solid #030C2A',
                  boxShadow: `0 2px 8px ${theme.shadow}`
                }}
              >
                <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                {isEditingAulaName ? (
                  <input
                    type="text"
                    value={editingAulaName}
                    onChange={(e) => setEditingAulaName(e.target.value)}
                    onBlur={() => {
                      handleSaveAulaName(editingAulaName);
                      setIsEditingAulaName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveAulaName(editingAulaName);
                        setIsEditingAulaName(false);
                      }
                      if (e.key === 'Escape') {
                        setEditingAulaName(currentAulaName);
                        setIsEditingAulaName(false);
                      }
                    }}
                    autoFocus
                    className="text-white font-bold text-xl bg-white/10 border-b-2 border-white/30 focus:border-white px-2 py-1 rounded outline-none"
                  />
                ) : (
                  <>
                    <h2 
                      className="text-white font-bold text-xl transition-all duration-300 hover:underline hover:underline-offset-4 cursor-pointer"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        if (!isEditingAulaName) {
                          e.currentTarget.style.textDecoration = 'none';
                        }
                      }}
                    >
                      {currentAulaName}
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditingAulaName(true)}
                      className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                      title="Editar nome da aula"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    background: theme.tagBg,
                    borderColor: theme.tagBorder
                  }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{
                    background: theme.tagBg,
                    border: `1px solid ${theme.tagBorder}`
                  }}
                >
                  {selectedTemplate?.icon && (
                    <selectedTemplate.icon 
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primary }}
                    />
                  )}
                  <span className="text-white/80 text-xs font-medium">
                    {selectedTemplate?.name || 'Sem template'}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="text-white/60 text-xs font-medium">
                    {formatDate(createdAt)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                animate={{
                  background: turmaImage ? 'transparent' : theme.circleBg,
                  borderColor: theme.circleBorder
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: turmaImage 
                    ? 'transparent' 
                    : theme.circleBg,
                  border: `2px solid ${theme.circleBorder}`
                }}
              >
                {turmaImage ? (
                  <img 
                    src={turmaImage} 
                    alt={turmaName || 'Turma'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-7 h-7" style={{ color: `${theme.primary}99` }} />
                )}
              </motion.div>
              {!turmaImage && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ background: theme.buttonGradient }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: theme.buttonGradient,
                    border: '2px solid #030C2A',
                    boxShadow: `0 2px 8px ${theme.shadow}`
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="relative flex-shrink-0"
              title="Fluxo de Integração"
            >
              <motion.div
                animate={{
                  background: theme.circleBg,
                  borderColor: theme.circleBorder
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: theme.circleBg,
                  border: `2px solid ${theme.circleBorder}`
                }}
              >
                <GitBranch className="w-7 h-7" style={{ color: `${theme.primary}99` }} />
              </motion.div>
            </motion.div>

            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="cursor-pointer"
              >
                <motion.div
                  animate={{
                    background: isMenuOpen 
                      ? `${theme.primary}4D`
                      : `${theme.primary}26`,
                    borderColor: theme.circleBorder
                  }}
                  transition={{ duration: 0.3 }}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: `${CIRCLE_SIZE}px`,
                    height: `${CIRCLE_SIZE}px`,
                    background: isMenuOpen 
                      ? `${theme.primary}4D`
                      : `${theme.primary}26`,
                    border: `2px solid ${theme.circleBorder}`
                  }}
                >
                  <MoreVertical className="w-6 h-6" style={{ color: theme.primary }} />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-4 rounded-xl overflow-hidden z-50"  // Changed mt-2 to mt-4 to move down
                    style={{
                      background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
                      border: `1px solid ${theme.menuBorder}`,
                      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${theme.shadowLight}`,
                      minWidth: '200px'
                    }}
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
                        onClick={() => handleMenuItemClick('compartilhar')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Share2 className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-sm font-medium">Compartilhar</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
                        onClick={() => handleMenuItemClick('baixar')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-sm font-medium">Baixar</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
                        onClick={() => handleMenuItemClick('adicionar-calendario')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Calendar className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-sm font-medium">Add. ao calendário</span>
                      </motion.button>

                      <div 
                        className="h-px mx-3 my-1"
                        style={{
                          background: `linear-gradient(to right, transparent, ${theme.primary}33, transparent)`
                        }}
                      />

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
                        onClick={() => handleMenuItemClick('tornar-privada')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Lock className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-sm font-medium">Tornar privada</span>
                      </motion.button>

                      <div 
                        className="h-px mx-3 my-1"
                        style={{
                          background: `linear-gradient(to right, transparent, ${theme.primary}33, transparent)`
                        }}
                      />

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: `${theme.primary}1A` }}
                        onClick={() => {
                          setThemeMode(prev => prev === 'orange' ? 'purple' : 'orange');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-sm font-medium">
                          {themeMode === 'orange' ? 'Ativar modo análise' : 'Desativar modo análise'}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={!isPublished && !isPublishing ? { scale: 1.05 } : {}}
              whileTap={!isPublished && !isPublishing ? { scale: 0.95 } : {}}
              onClick={handlePublishAula}
              disabled={isPublished || isPublishing}
              className="flex-shrink-0 border-0 bg-transparent p-0 pointer-events-auto"
              style={{ cursor: isPublished || isPublishing ? 'not-allowed' : 'pointer' }}
              title={isPublished ? "Aula publicada" : "Publicar aula"}
            >
              <motion.div
                animate={{ 
                  background: theme.buttonGradient,
                  borderColor: `${theme.primary}99`
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center relative"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: theme.buttonGradient,
                  border: `2px solid ${theme.primary}99`,
                  boxShadow: `0 4px 12px ${theme.shadow}`
                }}
              >
                {isPublishing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5"
                  >
                    <PublishIcon className="w-5 h-5 text-white" />
                  </motion.div>
                ) : isPublished ? (
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                ) : (
                  <PublishIcon className="w-5 h-5 text-white" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          background: theme.bgGradient,
          borderColor: theme.border
        }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-[18px] rounded-2xl relative z-10 cursor-pointer"
        style={{
          background: theme.bgGradient,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setIsObjectiveExpanded(!isObjectiveExpanded)}
      >
        <div 
          className="p-4 flex items-center justify-between"
          style={{ height: '62px' }}
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Objetivo da Aula</span>
          </div>
          <motion.div
            animate={{ rotate: isObjectiveExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>

        <AnimatePresence>
          {isObjectiveExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-4">
                <AutoResizeTextarea
                  value={objectiveText}
                  onChange={handleObjectiveChange}
                  placeholder="Escreva o objetivo da aula..."
                />

                <SectionActivitiesGrid sectionId="objetivo" />

                <div className="flex items-center gap-3 mt-3">
                  <AddActivityButton sectionId="objetivo" />

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors"
                    style={{
                      background: `${theme.primary}1A`,
                      border: `1px solid ${theme.primary}33`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Tools clicado');
                    }}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Tools</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Espaçador e Botões de Ação - Após Objetivo da Aula */}
      <div className="relative flex items-center justify-between mt-16 mb-4 h-12">
        {/* Botão School Tools (Canto Esquerdo) */}
        <div className="relative z-30 translate-y-[10%]">
          <motion.button
            whileHover={{ scale: 1.1, background: `${theme.primary}20` }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-xl"
            style={{ 
              background: `${theme.primary}15`,
              border: `2px solid ${theme.primary}50`,
              color: theme.primary,
              backdropFilter: 'blur(12px)'
            }}
            onClick={() => console.log('School Tools clicado')}
            title="School Tools"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Botão de Templates (Canto Direito) */}
        <div className="relative z-30 translate-y-[10%]">
          <motion.button
            whileHover={{ scale: 1.1, background: `${theme.primary}20` }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-xl"
            style={{ 
              background: `${theme.primary}15`,
              border: `2px solid ${theme.primary}50`,
              color: theme.primary,
              backdropFilter: 'blur(12px)'
            }}
            onClick={() => console.log('Templates de blocos clicado')}
            title="Edição de blocos - Templates"
          >
            <Layout className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Divider 0 - Após Objetivo */}
      {renderCustomSectionsForDivider(0)}

      {/* Seções arrastáveis com DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionOrder.filter(id => id !== 'objective')} strategy={verticalListSortingStrategy}>
          {(() => {
            const renderArray = sectionOrder.filter(id => id !== 'objective');
            console.log('🟢 [PONTO 3] RENDERIZANDO SEÇÕES');
            console.log('   Array final para renderizar:', renderArray);
            console.log('   sectionConfigs keys disponíveis:', Object.keys(sectionConfigs));
            renderArray.forEach(id => {
              console.log(`     - Seção "${id}": config existe?`, !!sectionConfigs[id]);
            });
            return renderArray;
          })().map((sectionId, index) => {
            const config = sectionConfigs[sectionId];
            if (!config || !config.isVisible) return null;
            
            const dynamicDividerIndex = index + 1;
            
            return (
              <React.Fragment key={sectionId}>
                <AnimatePresence mode="popLayout">
                  <SortableSectionCard id={sectionId}>
                    {renderSection(config)}
                  </SortableSectionCard>
                </AnimatePresence>
                <AddSectionDivider index={dynamicDividerIndex} onAdd={() => addCustomSection(dynamicDividerIndex)} />
                {renderCustomSectionsForDivider(dynamicDividerIndex)}
              </React.Fragment>
            );
          })}
        </SortableContext>
        
        <DragOverlay dropAnimation={null}>
          {activeDragId && sectionConfigs[activeDragId] ? (
            <div style={{ 
              transform: 'scale(1.02)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'grabbing'
            }}>
              {renderSection(sectionConfigs[activeDragId])}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* MyActivitiesPanel - Modal para selecionar atividades */}
      <AnimatePresence>
        <MyActivitiesPanel />
      </AnimatePresence>

      {/* Modal de Visualização de Atividade */}
      <AnimatePresence>
        {viewingActivity && (
          <ActivityViewModal 
            isOpen={!!viewingActivity}
            activity={{
              id: viewingActivity.id,
              title: viewingActivity.id_json?.titulo || viewingActivity.id_json?.title || viewingActivity.tipo || 'Atividade',
              description: viewingActivity.id_json?.descricao || viewingActivity.id_json?.description || '',
              categoryId: viewingActivity.tipo || 'default',
              categoryName: viewingActivity.tipo || 'Atividade',
              icon: 'FileText',
              tags: [],
              difficulty: 'medium',
              estimatedTime: '30min',
              type: viewingActivity.tipo || 'default',
              status: 'completed',
              originalData: viewingActivity.id_json
            }}
            onClose={() => setViewingActivity(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Publicação */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={() => setShowPublishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A2B3C] border border-[#FF6B00]/30 rounded-2xl p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-[#FF6B00]/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-[#FF6B00]" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h3 className="text-white font-bold text-xl mb-2">
                    Aula publicada com sucesso!
                  </h3>
                  <p className="text-white/70 text-sm">
                    Ela já está disponível na sua nota de aulas.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AulaResultadoContent;
