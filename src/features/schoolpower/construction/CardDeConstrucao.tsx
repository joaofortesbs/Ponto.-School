
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Lightbulb,
  Target,
  BookOpen,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
  Edit3,
  Eye,
  Play
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ConstructionGrid } from './ConstructionGrid';
import { 
  Wrench, CheckSquare, Filter, 
  Trophy, Zap, Brain, Heart, 
  PenTool, Presentation, Search, MapPin, Calculator, Globe,
  Microscope, Palette, Music, Camera, Video, Headphones,
  Gamepad2, Puzzle, Award, Star, Flag, Compass,
  Download, Upload, Share2, MessageSquare, ThumbsUp,
  Pause, SkipForward, Volume2, Wifi, Battery,
  Shield, Lock, Key, Mail, Phone, Home, Car, Plane,
  TreePine, Sun, Moon, Cloud, Umbrella, Snowflake, Triangle
} from "lucide-react";
import { ContextualizationData } from "../contextualization/ContextualizationCard";
import { ActionPlanItem } from "../actionplan/ActionPlanCard";
import { isActivityEligibleForTrilhas, getTrilhasBadgeProps } from "../data/trilhasActivitiesConfig";
import { TrilhasDebugPanel } from "../components/TrilhasDebugPanel";
import { TrilhasBadge } from "../components/TrilhasBadge";
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';
import atividadesTrilhas from '../data/atividadesTrilhas.json';
import { getCustomFieldsForActivity, hasCustomFields } from '../data/activityCustomFields';
import { AutomationDebugPanel } from './components/AutomationDebugPanel';

// Convert to proper format with name field
const schoolPowerActivities = schoolPowerActivitiesData.map(activity => ({
  ...activity,
  name: activity.name || activity.title || activity.description
}));

export interface ContextualizationData {
  materias: string;
  publicoAlvo: string;
  restricoes: string;
  datasImportantes?: string;
  observacoes?: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  category?: string;
  type?: string;
  approved: boolean;
  isTrilhasEligible?: boolean;
  customFields?: Record<string, string>;
  isManual?: boolean;
}

interface CardDeConstrucaoProps {
  step: 'contextualization' | 'actionPlan' | 'generating' | 'generatingActivities' | 'construction' | 'activities';
  contextualizationData?: ContextualizationData | null;
  actionPlan?: ActionPlanItem[] | null;
  onSubmitContextualization: (data: ContextualizationData) => void;
  onApproveActionPlan: (approvedItems: ActionPlanItem[]) => void;
  onResetFlow: () => void;
  isLoading?: boolean;
}

export function CardDeConstrucao({ 
  step, 
  contextualizationData, 
  actionPlan, 
  onSubmitContextualization, 
  onApproveActionPlan, 
  onResetFlow,
  isLoading 
}: CardDeConstrucaoProps) {
  const [localContextData, setLocalContextData] = useState<ContextualizationData>({
    materias: '',
    publicoAlvo: '',
    restricoes: '',
    datasImportantes: '',
    observacoes: ''
  });

  const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActionPlanItem[]>([]);
  
  // Form data for contextualization
  const [formData, setFormData] = useState<ContextualizationData>({
    materias: "",
    publicoAlvo: "",
    restricoes: "",
    datasImportantes: "",
    observacoes: "",
  });

  // Selected activities for action plan
  const [selectedActivities2, setSelectedActivities2] = useState<ActionPlanItem[]>([]);

  // Filter state for action plan
  const [filterState, setFilterState] = useState<'all' | 'selected'>('all');

  // View mode state (list or grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Debug state for trilhas system
  const [showTrilhasDebug, setShowTrilhasDebug] = useState<boolean>(false);

  // Estado para mostrar a interface de adicionar atividade manual
  const [showAddActivityInterface, setShowAddActivityInterface] = useState(false);

  // Manual activity addition state
  const [manualActivities, setManualActivities] = useState<ActionPlanItem[]>([]);

  // Manual activity form state
  const [manualActivityForm, setManualActivityForm] = useState({
    title: '',
    typeId: '',
    description: ''
  });

  // State for activity building process
  const [isBuilding, setIsBuilding] = useState(false);

  // State for tracking building progress
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    current: string;
    errors: string[];
  } | null>(null);

  // Function to simulate activity building
  const buildActivities = async (activities: ActionPlanItem[], contextData?: any): Promise<boolean> => {
    setIsBuilding(true);
    setProgress({
      total: activities.length,
      completed: 0,
      current: '',
      errors: []
    });

    let allSuccess = true;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      setProgress(prev => ({
        ...prev,
        current: `Construindo ${activity.title} (${i + 1}/${activities.length})`
      }));

      try {
        // Simulate building
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate occasional errors
        if (Math.random() < 0.2) {
          throw new Error(`Falha ao construir ${activity.title}`);
        }

        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1
        }));
      } catch (error: any) {
        console.error(error);
        allSuccess = false;
        setProgress(prev => ({
          ...prev,
          errors: [...prev.errors, error.message]
        }));
      }
    }

    setIsBuilding(false);
    setProgress(prev => ({ ...prev, current: 'Finalizado!' }));
    return allSuccess;
  };

  // Load existing data when component mounts
  useEffect(() => {
    if (contextualizationData) {
      setFormData(contextualizationData);
    }
  }, [contextualizationData]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof ContextualizationData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle contextualization form submission
  const handleSubmitContextualization = () => {
    if (onSubmitContextualization) {
      onSubmitContextualization(formData);
    }
  };

  // Handle activity selection toggle
  const handleActivityToggle = (activity: ActionPlanItem) => {
    setSelectedActivities2((prev) => {
      const isSelected = prev.some((item) => item.id === activity.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== activity.id);
      } else {
        return [...prev, { ...activity, approved: true }];
      }
    });
  };

  useEffect(() => {
    if (actionPlan) {
      console.log('🎯 ActionPlan recebido no CardDeConstrucao:', actionPlan);
      const approved = actionPlan.filter(item => item.approved);
      setSelectedActivities2(approved);

      // Se estivermos na etapa de atividades, também atualizar selectedActivities
      if (step === 'activities') {
        setSelectedActivities(approved);
      }
    }
  }, [actionPlan, step]);

  const handleApproveActionPlan = () => {
    console.log('✅ Plano de ação aprovado! Transitando para interface de construção...');
    console.log('📋 Atividades selecionadas:', selectedActivities2.map(a => a.title));

    // Atualizar estado local imediatamente
    setSelectedActivities(selectedActivities2);

    // Aprovar plano e passar as atividades selecionadas
    onApproveActionPlan(selectedActivities2);
  };

  // Handle manual activity form submission
  const handleAddManualActivity = () => {
    if (!manualActivityForm.title.trim() || !manualActivityForm.typeId || !manualActivityForm.description.trim()) {
      return;
    }

    // Find the activity type from schoolPowerActivities
    const activityType = schoolPowerActivities.find(activity => activity.id === manualActivityForm.typeId);

    const newManualActivity: ActionPlanItem = {
      id: manualActivityForm.typeId,
      title: manualActivityForm.title,
      description: manualActivityForm.description,
      duration: "Personalizado",
      difficulty: "Personalizado", 
      category: activityType?.tags[0] || "manual",
      type: activityType?.name || "Atividade Manual",
      isManual: true,
      approved: false,
      customFields: {} // Atividades manuais também podem ter customFields
    };

    // Add to manual activities list
    setManualActivities(prev => [...prev, newManualActivity]);

    // Clear form
    setManualActivityForm({
      title: '',
      typeId: '',
      description: ''
    });

    // Return to action plan interface
    setShowAddActivityInterface(false);
  };

  // Handle manual activity form changes
  const handleManualFormChange = (field: string, value: string) => {
    setManualActivityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get combined activities (AI suggestions + manual)
  const getCombinedActivities = () => {
    const aiActivities = actionPlan || [];
    const allActivities = [...aiActivities, ...manualActivities];
    return allActivities;
  };

  // Check if contextualization form is valid
  const isContextualizationValid =
    formData.materias.trim() && formData.publicoAlvo.trim();

  // Grid Toggle Component
  const GridToggleComponent = ({ viewMode, onToggle }: {
    viewMode: 'list' | 'grid';
    onToggle: () => void;
  }) => {
    return (
      <button
        onClick={onToggle}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
        title={viewMode === 'list' ? 'Visualização em Grade' : 'Visualização em Lista'}
      >
        {viewMode === 'list' ? (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )}
      </button>
    );
  };

  // Filter Component
  const FilterComponent = ({ activities, selectedActivities2, onFilterApply }: {
    activities: ActionPlanItem[];
    selectedActivities2: ActionPlanItem[];
    onFilterApply: (filterType: string) => void;
  }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          setIsFilterOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
          title="Filtros e Ações"
        >
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" />
        </button>

        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-50 backdrop-blur-sm"
            style={{
              backgroundImage: typeof window !== "undefined" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                ? `linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)`
                : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)`,
            }}
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#FF6B00]" />
                  Filtros e Ações
                </h3>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => {
                    onFilterApply('selectAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <CheckSquare className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Selecionar todos</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('selectRecommended');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Selecionar recomendações</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                <button
                  onClick={() => {
                    onFilterApply('viewSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver apenas selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('clearSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Tirar selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('viewAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-gray-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver todas</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Handle filter actions
  const handleFilterApply = (filterType: string) => {
    const combinedActivities = getCombinedActivities();
    if (combinedActivities.length === 0) return;

    switch (filterType) {
      case 'selectAll':
        setSelectedActivities2([...combinedActivities]);
        setFilterState('all');
        break;
      case 'selectRecommended':
        // Seleciona as 3 primeiras atividades como "recomendadas"
        const recommended = combinedActivities.slice(0, Math.min(3, combinedActivities.length));
        setSelectedActivities2(recommended);
        setFilterState('all');
        break;
      case 'viewSelected':
        setFilterState('selected');
        break;
      case 'clearSelected':
        setSelectedActivities2([]);
        setFilterState('all');
        break;
      case 'viewAll':
        setFilterState('all');
        break;
      default:
        break;
    }
  };

  const getIconByActivityId = (activityId: string) => {
    // Sistema de mapeamento 100% único - cada ID tem seu próprio ícone específico
    const uniqueIconMapping: { [key: string]: any } = {
      "atividade-adaptada": Heart,
      "atividades-contos-infantis": BookOpen,
      "atividades-ia": Brain,
      "atividades-matematica": Target,
      "atividades-ortografia-alfabeto": PenTool,
      "aulas-eletivas": Star,
      "bncc-descomplicada": BookOpen,
      "caca-palavras": Puzzle,
      "capitulo-livro": BookOpen,
      "charadas": Puzzle,
      "chatbot-bncc": MessageSquare,
      "consulta-video": Video,
      "corretor-gramatical": CheckSquare,
      "corretor-provas-feedback": CheckSquare,
      "corretor-provas-papel": FileText,
      "corretor-questoes": PenTool,
      "corretor-redacao": PenTool,
      "criterios-avaliacao": CheckSquare,
      "desenho-simetrico": Puzzle,
      "desenvolvimento-caligrafia": PenTool,
      "dinamicas-sala-aula": Users,
      "emails-escolares": Mail,
      "erros-comuns": Search,
      "exemplos-contextualizados": BookOpen,
      "experimento-cientifico": Microscope,
      "fichamento-obra-literaria": BookOpen,
      "gerador-tracejados": PenTool,
      "historias-sociais": Heart,
      "ideias-atividades": Lightbulb,
      "ideias-aulas-acessiveis": Heart,
      "ideias-avaliacoes-adaptadas": Heart,
      "ideias-brincadeiras-infantis": Play,
      "ideias-confraternizacoes": Users,
      "ideias-datas-comemorativas": Calendar,
      "imagem-para-colorir": Palette,
      "instrucoes-claras": FileText,
      "jogos-educacionais-interativos": Gamepad2,
      "jogos-educativos": Puzzle,
      "lista-exercicios": FileText,
      "lista-vocabulario": BookOpen,
      "maquete": Wrench,
      "mapa-mental": Brain,
      "mensagens-agradecimento": Heart,
      "musica-engajar": Music,
      "niveador-textos": BookOpen,
      "objetivos-aprendizagem": Target,
      "palavras-cruzadas": Puzzle,
      "pei-pdi": Heart,
      "perguntas-taxonomia-bloom": MessageSquare,
      "pergunte-texto": MessageSquare,
      "plano-aula": BookOpen,
      "plano-ensino": BookOpen,
      "plano-recuperacao": Heart,
      "projeto": Wrench,
      "projeto-vida": Star,
      "proposta-redacao": PenTool,
      "prova": CheckSquare,
      "questoes-pdf": FileText,
      "questoes-site": Globe,
      "questoes-texto": FileText,
      "questoes-video": Video,
      "redacao": PenTool,
      "reescritor-texto": PenTool,
      "reflexao-incidente": MessageSquare,
      "relatorio": FileText,
      "relatorio-desempenho": Trophy,
      "resposta-email": Mail,
      "revisor-gramatical": CheckSquare,
      "revisao-guiada": BookOpen,
      "resumo": FileText,
      "resumo-texto": FileText,
      "resumo-video": Video,
      "sequencia-didatica": BookOpen,
      "simulado": CheckSquare,
      "sugestoes-intervencao": Lightbulb,
      "tabela-apoio": Puzzle,
      "tarefa-adaptada": Heart,
      "texto-apoio": BookOpen,
      "gerar-questoes": PenTool,
      "apresentacao-slides": Target,
      "tornar-relevante": Star
    };

    // Verifica se existe mapeamento direto para o ID
    if (uniqueIconMapping[activityId]) {
      return uniqueIconMapping[activityId];
    }

    // Sistema de fallback com hash consistente para IDs não mapeados
    const fallbackIcons = [
      BookOpen, FileText, PenTool, Search, Brain,
      Users, MessageSquare, Presentation, ThumbsUp, Heart,
      Wrench, Target, Compass, Trophy, Edit3,
      Calendar, Clock, CheckSquare, Star, Award,
      Microscope, Calculator, Eye, Globe, MapPin,
      Music, Palette, Camera, Video, Headphones,
      Lightbulb, Zap, Flag, Key, Shield,
      TreePine, Sun, Cloud, Home, Car
    ];

    // Gera hash consistente baseado no ID
    let hash = 0;
    for (let i = 0; i < activityId.length; i++) {
      const char = activityId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const iconIndex = Math.abs(hash) % fallbackIcons.length;
    return fallbackIcons[iconIndex];
  };

  const [selectedTrilhasCount, setSelectedTrilhasCount] = useState(0);

  useEffect(() => {
    const trilhasActivityIds = [
      'projeto-pesquisa',
      'projeto-cientifico',
      'projeto-criativo',
      'projeto-colaborativo',
      'projeto-individual',
      'projeto-inovacao',
      'projeto-sustentabilidade',
      'projeto-social',
      'projeto-tecnologico',
      'projeto-artistico',
      'projeto-empreendedor',
      'projeto-interdisciplinar',
      'projeto-experimental',
      'projeto-aplicado',
      'projeto-extensao',
      'projeto-integrador',
      'projeto-final',
    ];

    const selectedTrilhas = selectedActivities2.filter(activity =>
      trilhasActivityIds.includes(activity.id)
    );

    setSelectedTrilhasCount(selectedTrilhas.length);
  }, [selectedActivities2]);

  // Adicionar preenchimento automático dos campos do modal com dados da IA
  const handleEditActivity = (activity: any) => {
    console.log('🔧 Editando atividade:', activity.id);
    console.log('🔍 Dados completos da atividade:', activity);

    // Buscar dados da atividade no action plan se disponível
    const actionPlanActivity = selectedActivities2?.find(item => item.id === activity.id) || 
                               actionPlan?.find(item => item.id === activity.id);

    // Também verificar nos dados originais da atividade
    const originalData = activity.originalData || activity;

    console.log('📊 Action plan activity encontrada:', actionPlanActivity);
    console.log('📊 Dados originais da atividade:', originalData);

    // Coletar todos os customFields disponíveis
    const customFields = {
      ...originalData?.customFields,
      ...actionPlanActivity?.customFields
    };

    console.log('🗂️ Custom fields consolidados:', customFields);

    if (customFields && Object.keys(customFields).length > 0) {
      console.log('📋 Preenchendo automaticamente com dados da IA:', customFields);

      // Preparar dados automáticos para preenchimento do modal com mapeamento completo
      const autoDataKey = `auto_activity_data_${activity.id}`;
      const autoFormData = {
        title: actionPlanActivity?.title || activity.title || originalData?.title || '',
        description: actionPlanActivity?.description || activity.description || originalData?.description || '',
        subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
        theme: customFields['Tema'] || customFields['tema'] || customFields['Tema das Palavras'] || customFields['Tema do Vocabulário'] || '',
        schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || customFields['ano'] || '',
        numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || customFields['Quantidade de Palavras'] || '10',
        difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || customFields['dificuldade'] || 'Médio',
        questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || customFields['Tipo de Avaliação'] || '',
        sources: customFields['Fontes'] || customFields['fontes'] || customFields['Referencias'] || '',
        objectives: customFields['Objetivos'] || customFields['objetivos'] || customFields['Competências Trabalhadas'] || '',
        materials: customFields['Materiais'] || customFields['materiais'] || customFields['Recursos Visuais'] || '',
        instructions: customFields['Instruções'] || customFields['instrucoes'] || customFields['Estratégias de Leitura'] || customFields['Atividades Práticas'] || '',
        evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || customFields['criteriosAvaliacao'] || '',
        // Campos adicionais específicos
        timeLimit: customFields['Tempo de Prova'] || customFields['Tempo Limite'] || customFields['tempoLimite'] || '',
        context: customFields['Contexto de Aplicação'] || customFields['Contexto de Uso'] || customFields['contexto'] || '',
        textType: customFields['Tipo de Texto'] || customFields['tipoTexto'] || '',
        textGenre: customFields['Gênero Textual'] || customFields['generoTextual'] || '',
        textLength: customFields['Extensão do Texto'] || customFields['extensaoTexto'] || '',
        associatedQuestions: customFields['Questões Associadas'] || customFields['questoesAssociadas'] || '',
        competencies: customFields['Competências Trabalhadas'] || customFields['competencias'] || '',
        readingStrategies: customFields['Estratégias de Leitura'] || customFields['estrategiasLeitura'] || '',
        visualResources: customFields['Recursos Visuais'] || customFields['recursosVisuais'] || '',
        practicalActivities: customFields['Atividades Práticas'] || customFields['atividadesPraticas'] || '',
        wordsIncluded: customFields['Palavras Incluídas'] || customFields['palavrasIncluidas'] || '',
        gridFormat: customFields['Formato da Grade'] || customFields['formatoGrade'] || '',
        providedHints: customFields['Dicas Fornecidas'] || customFields['dicasFornecidas'] || '',
        vocabularyContext: customFields['Contexto de Uso'] || customFields['contextoUso'] || '',
        language: customFields['Idioma'] || customFields['idioma'] || '',
        associatedExercises: customFields['Exercícios Associados'] || customFields['exerciciosAssociados'] || '',
        knowledgeArea: customFields['Área de Conhecimento'] || customFields['areaConhecimento'] || '',
        complexityLevel: customFields['Nível de Complexidade'] || customFields['nivelComplexidade'] || ''
      };

      // Salvar dados automáticos no localStorage para o modal usar
      const autoData = {
        formData: autoFormData,
        customFields: customFields,
        originalActivity: originalData,
        actionPlanActivity: actionPlanActivity,
        timestamp: Date.now()
      };

      localStorage.setItem(autoDataKey, JSON.stringify(autoData));
      console.log('💾 Dados automáticos salvos para:', activity.id);
      console.log('📋 Form data preparado:', autoFormData);
      console.log('🔧 Custom fields salvos:', customFields);
    } else {
      console.warn('⚠️ Nenhum customField encontrado para preenchimento automático');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="relative rounded-2xl p-6 shadow-2xl border border-[#FF6B00]/30 dark:border-[#FF6B00]/30 bg-white dark:bg-[#021321]"
      style={{
        width: "1353px",
        height: "773px"
      }}
      data-theme="adaptive"
    >
      {/* Cabeçalho Persistente Fixo */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] rounded-t-2xl flex items-center justify-between px-6 z-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            {step === "contextualization" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : step === "actionPlan" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">
              {step === "contextualization"
                ? "Quiz de Contextualização"
                : step === "actionPlan"
                  ? "Plano de Ação"
                  : step === "generating"
                    ? "Gerando Conteúdo..."
                    : step === "activities"
                      ? "Construção de Atividades"
                      : "School Power"}
            </h1>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-between w-44">
            {/* Background progress line */}
            <div className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white/30 rounded-full z-0" style={{ left: '16px', right: '16px' }}></div>

            {/* Active progress line */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white rounded-full z-0 transition-all duration-500 ease-out"
              style={{ 
                left: '16px',
                width: `${
                  step === "contextualization" ? "0%" :
                  step === "actionPlan" ? "50%" :
                  (step === "generating" || step === "generatingActivities" || step === "activities") ? "100%" : "0%"
                }`
              }}
            ></div>

            {/* Step indicators */}
            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "contextualization" ? 'bg-white border-white text-[#FF6B00]' : 'bg-[#FF6B00] border-white text-white'
            }`}>
              {step === "contextualization" ? (
                <span className="text-sm font-semibold">1</span>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "actionPlan" ? 'bg-white border-white text-[#FF6B00]' :
              (step === "generating" || step === "generatingActivities" || step === "activities") ? 'bg-[#FF6B00] border-white text-white' :
              'bg-white/20 border-white/30 text-white'
            }`}>
              {step === "actionPlan" ? (
                <span className="text-sm font-semibold">2</span>
              ) : (step === "generating" || step === "generatingActivities" || step === "activities") ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              (step === "generating" || step === "generatingActivities" || step === "activities") ? 'bg-white border-white text-[#FF6B00]' : 'bg-white/20 border-white/30 text-white'
            }`}>
              <span className="text-sm font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renderização condicional baseada no step */}
      {step === "generating" || step === "generatingActivities" ? (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step === "generating"
              ? "🤖 Analisando com IA Gemini"
              : "🎯 Gerando Atividades"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg text-sm sm:text-base">
            {step === "generating"
              ? "A IA está processando sua mensagem e contexto para criar um plano de ação personalizado..."
              : "As atividades aprovadas estão sendo geradas automaticamente pelo School Power..."}
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/20 dark:to-[#29335C]/10 rounded-lg p-3 sm:p-4 mb-4 border border-[#FF6B00]/20 max-w-md w-full">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {step === "generating" ? (
                <>
                  ✨ Consultando 137 atividades disponíveis
                  <br />
                  🎯 Personalizando para seu contexto específico
                  <br />
                  📝 Gerando sugestões inteligentes
                  <br />
                  🔍 Validando compatibilidade das atividades
                </>
              ) : (
                <>
                  ✅ Personalizando conteúdo das atividades
                  <br />
                  🎨 Criando materiais visuais
                  <br />
                  📝 Formatando atividades finais
                  <br />
                  🚀 Preparando download
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            {onResetFlow && (
              <button
                onClick={onResetFlow}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      ) : step === "activities" ? (
        <motion.div
          key="activities-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 h-full flex flex-col pt-16"
        >
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onResetFlow}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Voltar ao início
            </button>
          </div>

          {/* Interface de Construção */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Construção de Atividades
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedActivities.length} atividade{selectedActivities.length !== 1 ? 's' : ''} aprovada{selectedActivities.length !== 1 ? 's' : ''} para construção
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onResetFlow}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Voltar ao início
                </button>
              </div>
            </div>

            {/* Layout com Grid e Debug Panel */}
            <div className="flex-1 flex gap-4">
              {/* Grid Principal */}
              <div className="flex-1">
                <ConstructionGrid
                  activities={selectedActivities}
                  onEdit={handleEditActivity}
                  onPreview={(activity: any) => console.log('Preview:', activity)}
                  isAutoBuilding={false}
                />
              </div>

              {/* Painel de Debug */}
              <div className="w-80">
                <AutomationDebugPanel
                  activities={selectedActivities}
                  isAutoBuilding={false}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
