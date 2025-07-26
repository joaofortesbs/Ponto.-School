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
  Gamepad2, Puzzle, Award, Star, Flag, Compass, Settings,
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
import { ConstructionInterface } from './index';
import atividadesTrilhas from '../data/atividadesTrilhas.json';

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
  duration: string;
  difficulty: string;
  category: string;
  type: string;
  isManual?: boolean;
  approved?: boolean;
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
  const [editingActivity, setEditingActivity] = useState<{id: string, data: any} | null>(null);

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
    }
  }, [actionPlan, step]);

  const handleApproveActionPlan = () => {
    console.log('🎯 CardDeConstrucao: Aprovando plano com atividades:', selectedActivities2);

    if (selectedActivities2.length === 0) {
      console.warn('⚠️ Nenhuma atividade selecionada para aprovação');
      return;
    }

    // Chamar a função de aprovação passada como prop
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
      isManual: true
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
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.95) 0%, 
                  rgba(248, 250, 252, 0.98) 100%
                )
              `,
              ...(typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? {
                    background: `
                  linear-gradient(135deg, 
                    rgba(31, 41, 55, 0.95) 0%, 
                    rgba(17, 24, 39, 0.98) 100%
                  )
                `,
                  }
                : {}),
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
      Settings, Wrench, Target, Compass, Trophy,
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

  const handleEditActivity = (id: string, data: any) => {
    setEditingActivity({ id, data });
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  const handleSaveActivity = (id: string, newData: any) => {
    // Lógica para salvar a atividade editada
    console.log(`Salvando atividade ${id} com os dados:`, newData);
    setEditingActivity(null);
  };

    // Estado para controlar qual atividade está sendo editada
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const activities = getCombinedActivities();
  // Função para lidar com a edição
  const handleEdit = useCallback((activityId: string) => {
    console.log('🔧 Editando atividade:', activityId);
    console.log('🔧 Activities available:', activities.map(a => a.id));
    setEditingActivityId(activityId);
  }, [activities]);

  // Função para fechar a edição
  const handleCloseEdit = useCallback(() => {
    console.log('❌ Fechando edição');
    setEditingActivityId(null);
  }, []);

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
      className="relative backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-[#FF6B00]/30 dark:border-[#FF6B00]/30"
      style={{
        width: "1153px",
        height: "700px",
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.98) 100%
          ),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.06) 0%, transparent 50%)
        `,
        ...(typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? {
              background: `
            linear-gradient(135deg, rgba(10,10,23,0.90) 0%, rgba(15,15,30,0.95) 100%),
            radial-gradient(circle at 20% 20%, rgba(255,107,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,146,72,0.10) 0%, transparent 50%)
          `,
            }
          : {}),
            }}
    >
      {step === 'contextualization' && (
        <Card>
          <CardHeader>
            <CardTitle>Contextualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="materias">Matérias</Label>
                <Input
                  id="materias"
                  value={formData.materias}
                  onChange={(e) => handleInputChange("materias", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="publicoAlvo">Público Alvo</Label>
                <Input
                  id="publicoAlvo"
                  value={formData.publicoAlvo}
                  onChange={(e) => handleInputChange("publicoAlvo", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="restricoes">Restrições</Label>
                <Textarea
                  id="restricoes"
                  value={formData.restricoes}
                  onChange={(e) => handleInputChange("restricoes", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="datasImportantes">Datas Importantes</Label>
                <Input
                  id="datasImportantes"
                  value={formData.datasImportantes}
                  onChange={(e) => handleInputChange("datasImportantes", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                />
              </div>
              <Button disabled={!isContextualizationValid} onClick={handleSubmitContextualization}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  "Gerar Plano de Ação"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'actionPlan' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Plano de Ação</CardTitle>
            <div className="flex items-center space-x-2">
              <GridToggleComponent
                viewMode={viewMode}
                onToggle={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              />
              <FilterComponent
                activities={getCombinedActivities()}
                selectedActivities2={selectedActivities2}
                onFilterApply={handleFilterApply}
              />
              <Button size="sm" onClick={() => setShowAddActivityInterface(true)}>
                Adicionar Atividade Manual
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showTrilhasDebug && (
              <TrilhasDebugPanel 
                selectedActivities={selectedActivities2}
                schoolPowerActivities={schoolPowerActivities}
                atividadesTrilhas={atividadesTrilhas}
              />
            )}

            {viewMode === 'list' ? (
              <div className="space-y-4">
                {getCombinedActivities().length > 0 ? (
                  getCombinedActivities()
                    .filter(activity => filterState === 'all' || (filterState === 'selected' && selectedActivities2.some(item => item.id === activity.id)))
                    .map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="border rounded-md p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          {/* Ícone da atividade */}
                          {React.createElement(getIconByActivityId(activity.id), { className: "w-6 h-6 text-[#FF6B00]" })}

                          <div>
                            <h3 className="text-lg font-semibold">{activity.title}</h3>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(activity.id)}
                              disabled={editingActivityId !== null && editingActivityId !== activity.id}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleActivityToggle(activity)}
                            >
                              {selectedActivities2.some((item) => item.id === activity.id) ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <p>Nenhuma atividade encontrada.</p>
                )}
              </div>
            ) : (
              <ConstructionGrid
                activities={getCombinedActivities()}
                selectedActivities={selectedActivities2}
                onActivityToggle={handleActivityToggle}
                onEditActivity={handleEdit}
                editingActivityId={editingActivityId}
              />
            )}

            {showAddActivityInterface && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Adicionar Atividade Manual</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manual-title">Título</Label>
                      <Input
                        type="text"
                        id="manual-title"
                        value={manualActivityForm.title}
                        onChange={(e) => handleManualFormChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-type">Tipo</Label>
                      <Select onValueChange={(value) => handleManualFormChange('typeId', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um tipo" value={manualActivityForm.typeId} />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolPowerActivities.map(activity => (
                            <SelectItem key={activity.id} value={activity.id}>{activity.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manual-description">Descrição</Label>
                      <Textarea
                        id="manual-description"
                        value={manualActivityForm.description}
                        onChange={(e) => handleManualFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" onClick={() => setShowAddActivityInterface(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddManualActivity}>Adicionar</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={onResetFlow}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div>
                <div className="mb-2 text-sm text-muted-foreground">
                  {selectedTrilhasCount > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <TrilhasBadge {...getTrilhasBadgeProps(selectedTrilhasCount)} />
                      <span>{selectedTrilhasCount} atividades da trilha selecionadas</span>
                    </div>
                  )}
                  Você selecionou {selectedActivities2.length} de {getCombinedActivities().length} atividades.
                </div>
                <Button onClick={handleApproveActionPlan}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      Gerar Atividades
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'generatingActivities' && (
        <Card>
          <CardHeader>
            <CardTitle>Gerando Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Gerando atividades com base no plano de ação...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'construction' && (
        <Card>
          <CardHeader>
            <CardTitle>Construção</CardTitle>
          </CardHeader>
          <CardContent>
            Em construção...
          </CardContent>
        </Card>
      )}

      {step === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            Atividades...
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}