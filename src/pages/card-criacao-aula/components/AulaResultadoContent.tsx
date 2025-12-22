import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, User, Users, Play, MoreVertical, Share2, Download, Calendar, Lock, BarChart3, ChevronDown, Target, Wrench, BookOpen, Lightbulb, Layers, CheckCircle, FileText, MessageSquare, Award, Trash2, Edit3, Layout, Sparkles, MoreHorizontal, Clock, Copy, Wand2, FolderOpen, Globe, Upload, Search, Filter, X, Check, LayoutGrid, List, Star, GripVertical } from 'lucide-react';
import { Template } from './TemplateDropdown';
import { atividadesNeonService, AtividadeNeon } from '@/services/atividadesNeonService';
import { ActivityViewModal } from '@/features/schoolpower/construction/ActivityViewModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AulaResultadoContentProps {
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
  createdAt?: Date;
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

// Componente de TextArea com redimensionamento automático otimizado para evitar travamentos
const AutoResizeTextarea = React.memo(({ value, onChange, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-transparent border-0 text-white/90 placeholder-white/30 focus:outline-none resize-none overflow-hidden min-h-[100px] py-2"
      style={{ lineHeight: '1.6' }}
    />
  );
});

const AulaResultadoContent: React.FC<AulaResultadoContentProps> = ({
  aulaName = 'Minha Nova Aula',
  selectedTemplate = null,
  turmaImage = null,
  turmaName = null,
  createdAt = new Date()
}) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Professor');
  const [aulaImage, setAulaImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('orange');
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(false);
  const [objectiveText, setObjectiveText] = useState('');
  const [preEstudoText, setPreEstudoText] = useState('');
  const [introducaoText, setIntroducaoText] = useState('');
  const [desenvolvimentoText, setDesenvolvimentoText] = useState('');
  const [encerramentoText, setEncerramentoText] = useState('');
  const [materiaisText, setMateriaisText] = useState('');
  const [observacoesText, setObservacoesText] = useState('');
  const [bnccText, setBnccText] = useState('');
  const [isPreEstudoExpanded, setIsPreEstudoExpanded] = useState(true);
  const [isIntroducaoExpanded, setIsIntroducaoExpanded] = useState(true);
  const [isDesenvolvimentoExpanded, setIsDesenvolvimentoExpanded] = useState(true);
  const [isEncerramentoExpanded, setIsEncerramentoExpanded] = useState(true);
  const [isMateriaisExpanded, setIsMateriaisExpanded] = useState(true);
  const [isObservacoesExpanded, setIsObservacoesExpanded] = useState(true);
  const [isBnccExpanded, setIsBnccExpanded] = useState(true);

  // Estados de visibilidade para seções padrão (para exclusão completa)
  const [isObjectiveVisible, setIsObjectiveVisible] = useState(true);
  const [isPreEstudoVisible, setIsPreEstudoVisible] = useState(true);
  const [isIntroducaoVisible, setIsIntroducaoVisible] = useState(true);
  const [isDesenvolvimentoVisible, setIsDesenvolvimentoVisible] = useState(true);
  const [isEncerramentoVisible, setIsEncerramentoVisible] = useState(true);
  const [isMateriaisVisible, setIsMateriaisVisible] = useState(true);
  const [isObservacoesVisible, setIsObservacoesVisible] = useState(true);
  const [isBnccVisible, setIsBnccVisible] = useState(true);

  // Estado para ordem das seções (drag and drop)
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'objective', 'preEstudo', 'introducao', 'desenvolvimento',
    'encerramento', 'materiais', 'observacoes', 'bncc'
  ]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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
    afterDivider: number; // Índice do divisor após o qual a seção aparece
    orderIndex: number; // Índice de ordem dentro do mesmo divider (para inserção entre seções)
  }
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [hoveredDividerIndex, setHoveredDividerIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);

  const [preEstudoTime, setPreEstudoTime] = useState('10 min');
  const [introducaoTime, setIntroducaoTime] = useState('10 min');
  const [desenvolvimentoTime, setDesenvolvimentoTime] = useState('10 min');
  const [encerramentoTime, setEncerramentoTime] = useState('10 min');
  const [materiaisTime, setMateriaisTime] = useState('10 min');
  const [observacoesTime, setObservacoesTime] = useState('10 min');
  const [bnccTime, setBnccTime] = useState('10 min');

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
  const [sectionActivities, setSectionActivities] = useState<SectionActivity[]>([]);

  // Handlers memoizados para os campos de texto (performance)
  const handleObjectiveChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setObjectiveText(e.target.value), []);
  const handlePreEstudoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setPreEstudoText(e.target.value), []);
  const handleIntroducaoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setIntroducaoText(e.target.value), []);
  const handleDesenvolvimentoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setDesenvolvimentoText(e.target.value), []);
  const handleEncerramentoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setEncerramentoText(e.target.value), []);
  const handleMateriaisChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setMateriaisText(e.target.value), []);
  const handleObservacoesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacoesText(e.target.value), []);
  const handleBnccChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setBnccText(e.target.value), []);

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

  const sectionConfigs = useMemo((): Record<string, SectionConfig> => ({
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
    preEstudo: {
      id: 'preEstudo',
      title: 'Pré-estudo',
      icon: BookOpen,
      isVisible: isPreEstudoVisible,
      setVisible: setIsPreEstudoVisible,
      isExpanded: isPreEstudoExpanded,
      setExpanded: setIsPreEstudoExpanded,
      text: preEstudoText,
      onChange: handlePreEstudoChange,
      placeholder: 'Descreva as atividades de pré-estudo...',
      time: preEstudoTime,
      setTime: setPreEstudoTime,
      menuId: 'pre-estudo',
      dividerIndex: 1,
      delay: 0.55,
    },
    introducao: {
      id: 'introducao',
      title: 'Introdução',
      icon: Lightbulb,
      isVisible: isIntroducaoVisible,
      setVisible: setIsIntroducaoVisible,
      isExpanded: isIntroducaoExpanded,
      setExpanded: setIsIntroducaoExpanded,
      text: introducaoText,
      onChange: handleIntroducaoChange,
      placeholder: 'Descreva a introdução da aula...',
      time: introducaoTime,
      setTime: setIntroducaoTime,
      menuId: 'introducao',
      dividerIndex: 2,
      delay: 0.6,
    },
    desenvolvimento: {
      id: 'desenvolvimento',
      title: 'Desenvolvimento',
      icon: Layers,
      isVisible: isDesenvolvimentoVisible,
      setVisible: setIsDesenvolvimentoVisible,
      isExpanded: isDesenvolvimentoExpanded,
      setExpanded: setIsDesenvolvimentoExpanded,
      text: desenvolvimentoText,
      onChange: handleDesenvolvimentoChange,
      placeholder: 'Descreva o desenvolvimento da aula...',
      time: desenvolvimentoTime,
      setTime: setDesenvolvimentoTime,
      menuId: 'desenvolvimento',
      dividerIndex: 3,
      delay: 0.65,
    },
    encerramento: {
      id: 'encerramento',
      title: 'Encerramento',
      icon: CheckCircle,
      isVisible: isEncerramentoVisible,
      setVisible: setIsEncerramentoVisible,
      isExpanded: isEncerramentoExpanded,
      setExpanded: setIsEncerramentoExpanded,
      text: encerramentoText,
      onChange: handleEncerramentoChange,
      placeholder: 'Descreva o encerramento da aula...',
      time: encerramentoTime,
      setTime: setEncerramentoTime,
      menuId: 'encerramento',
      dividerIndex: 4,
      delay: 0.7,
    },
    materiais: {
      id: 'materiais',
      title: 'Materiais Complementares',
      icon: FileText,
      isVisible: isMateriaisVisible,
      setVisible: setIsMateriaisVisible,
      isExpanded: isMateriaisExpanded,
      setExpanded: setIsMateriaisExpanded,
      text: materiaisText,
      onChange: handleMateriaisChange,
      placeholder: 'Liste os materiais complementares...',
      time: materiaisTime,
      setTime: setMateriaisTime,
      menuId: 'materiais',
      dividerIndex: 5,
      delay: 0.75,
    },
    observacoes: {
      id: 'observacoes',
      title: 'Observações do Professor',
      icon: MessageSquare,
      isVisible: isObservacoesVisible,
      setVisible: setIsObservacoesVisible,
      isExpanded: isObservacoesExpanded,
      setExpanded: setIsObservacoesExpanded,
      text: observacoesText,
      onChange: handleObservacoesChange,
      placeholder: 'Adicione suas observações...',
      time: observacoesTime,
      setTime: setObservacoesTime,
      menuId: 'observacoes',
      dividerIndex: 6,
      delay: 0.8,
    },
    bncc: {
      id: 'bncc',
      title: 'Critérios BNCC',
      icon: Award,
      isVisible: isBnccVisible,
      setVisible: setIsBnccVisible,
      isExpanded: isBnccExpanded,
      setExpanded: setIsBnccExpanded,
      text: bnccText,
      onChange: handleBnccChange,
      placeholder: 'Descreva os critérios da BNCC...',
      time: bnccTime,
      setTime: setBnccTime,
      menuId: 'bncc',
      dividerIndex: 6,
      delay: 0.85,
    },
  }), [
    isObjectiveVisible, isObjectiveExpanded, objectiveText, handleObjectiveChange,
    isPreEstudoVisible, isPreEstudoExpanded, preEstudoText, handlePreEstudoChange, preEstudoTime,
    isIntroducaoVisible, isIntroducaoExpanded, introducaoText, handleIntroducaoChange, introducaoTime,
    isDesenvolvimentoVisible, isDesenvolvimentoExpanded, desenvolvimentoText, handleDesenvolvimentoChange, desenvolvimentoTime,
    isEncerramentoVisible, isEncerramentoExpanded, encerramentoText, handleEncerramentoChange, encerramentoTime,
    isMateriaisVisible, isMateriaisExpanded, materiaisText, handleMateriaisChange, materiaisTime,
    isObservacoesVisible, isObservacoesExpanded, observacoesText, handleObservacoesChange, observacoesTime,
    isBnccVisible, isBnccExpanded, bnccText, handleBnccChange, bnccTime,
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
        setAulaImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        // Para seções padrão, escondemos completamente o card
        switch (sectionId) {
          case 'objective': setIsObjectiveVisible(false); break;
          case 'preEstudo': setIsPreEstudoVisible(false); break;
          case 'introducao': setIsIntroducaoVisible(false); break;
          case 'desenvolvimento': setIsDesenvolvimentoVisible(false); break;
          case 'encerramento': setIsEncerramentoVisible(false); break;
          case 'materiais': setIsMateriaisVisible(false); break;
          case 'observacoes': setIsObservacoesVisible(false); break;
          case 'bncc': setIsBnccVisible(false); break;
        }
      } else {
        // Seção personalizada - remove completamente
        deleteCustomSection(sectionId);
      }
    } else if (action === 'duplicar') {
      const defaultSectionsData: Record<string, { title: string, text: string }> = {
        'objective': { title: 'Objetivos', text: objectiveText },
        'preEstudo': { title: 'Pré-estudo', text: preEstudoText },
        'introducao': { title: 'Introdução', text: introducaoText },
        'desenvolvimento': { title: 'Desenvolvimento', text: desenvolvimentoText },
        'encerramento': { title: 'Encerramento', text: encerramentoText },
        'materiais': { title: 'Materiais', text: materiaisText },
        'observacoes': { title: 'Observações', text: observacoesText },
        'bncc': { title: 'BNCC', text: bnccText }
      };

      let sourceTitle = '';
      let sourceText = '';
      let afterDivider = 0;

      if (defaultSectionsData[sectionId]) {
        sourceTitle = defaultSectionsData[sectionId].title;
        sourceText = defaultSectionsData[sectionId].text;
        // Mapear seção padrão para o divisor correspondente
        const mapping: Record<string, number> = {
          'objective': 0, 'preEstudo': 1, 'introducao': 2, 'desenvolvimento': 3,
          'encerramento': 4, 'materiais': 5, 'observacoes': 6, 'bncc': 6
        };
        afterDivider = mapping[sectionId] || 0;
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
              <h2 className="text-white font-bold text-xl">{aulaName}</h2>
              
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
              transition={{ delay: 0.35, duration: 0.3 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                animate={{
                  background: userAvatar ? 'transparent' : theme.circleBg,
                  borderColor: theme.circleBorder
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: userAvatar 
                    ? 'transparent' 
                    : theme.circleBg,
                  border: `2px solid ${theme.circleBorder}`
                }}
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7" style={{ color: `${theme.primary}99` }} />
                )}
              </motion.div>
            </motion.div>

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

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 cursor-pointer"
              title="Modo Apresentação de atividade"
            >
              <motion.div
                animate={{ 
                  background: theme.buttonGradient,
                  borderColor: `${theme.primary}99`
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: theme.buttonGradient,
                  border: `2px solid ${theme.primary}99`,
                  boxShadow: `0 4px 12px ${theme.shadow}`
                }}
              >
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </motion.div>
            </motion.div>
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
          {sectionOrder.filter(id => id !== 'objective').map((sectionId, index) => {
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
    </div>
  );
};

export default AulaResultadoContent;
