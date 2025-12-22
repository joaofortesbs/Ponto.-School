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

  const theme = themeColors[themeMode];

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

  const loadUserActivities = async () => {
    setLoadingActivities(true);
    try {
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('userId') || 
                     localStorage.getItem('supabase_user_id') || 
                     localStorage.getItem('neon_user_id');
      
      if (!userId) {
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          const profile = JSON.parse(userProfileStr);
          if (profile.id) {
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
      if (result.success && result.data) {
        setUserActivities(result.data);
      } else {
        setUserActivities([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar atividades:', error);
      setUserActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const removeActivityFromSection = (sectionId: string, activityId: string) => {
    setSectionActivities(prev => prev.filter(a => !(a.sectionId === sectionId && a.activityId === activityId)));
  };

  const SectionActivitiesGrid = React.memo(({ sectionId }: { sectionId: string }) => {
    const activities = sectionActivities.filter(a => a.sectionId === sectionId);
    if (activities.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {activities.map((act) => {
          const activity = act.activityData;
          const activityId = act.activityId;
          const title = activity.id_json?.titulo || activity.id_json?.title || activity.tipo || 'Atividade';
          const type = activity.tipo || 'default';
          const createdDate = activity.id_json?.data_criacao ? new Date(activity.id_json.data_criacao).toLocaleDateString() : null;

          return (
            <motion.div
              key={`${sectionId}-${activityId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="group relative rounded-xl overflow-hidden border cursor-pointer"
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setViewingActivity(activity);
              }}
            >
              <div className="aspect-video bg-slate-800/50 flex items-center justify-center overflow-hidden relative">
                <FileText className="w-10 h-10 text-white/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              </div>

              <div 
                className="p-3 flex flex-col gap-2"
                style={{ 
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
  }, (prevProps, nextProps) => prevProps.sectionId === nextProps.sectionId);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSectionAction = (sectionId: string, action: string) => {
    if (action === 'excluir') {
      const defaultSections = [
        'objective', 'preEstudo', 'introducao', 'desenvolvimento', 
        'encerramento', 'materiais', 'observacoes', 'bncc'
      ];
      
      if (defaultSections.includes(sectionId)) {
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

  const CARD_VERTICAL_SPACING = 14;

  const SortableSectionCard = ({ id, children }: { id: string; children: React.ReactNode }) => {
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
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 50 : 10,
    };

    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 opacity-0 hover:opacity-100 transition-opacity"
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
  };

  const SectionItem = React.memo(({ config, theme, activeMenuSection, setActiveMenuSection, handleSectionAction }: { 
    config: SectionConfig; 
    theme: any; 
    activeMenuSection: string | null;
    setActiveMenuSection: (id: string | null) => void;
    handleSectionAction: (sectionId: string, action: string) => void;
  }) => {
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
  }, (prevProps, nextProps) => {
    return (
      prevProps.config.isExpanded === nextProps.config.isExpanded &&
      prevProps.config.text === nextProps.config.text &&
      prevProps.config.time === nextProps.config.time &&
      prevProps.config.isVisible === nextProps.config.isVisible &&
      prevProps.activeMenuSection === nextProps.activeMenuSection &&
      prevProps.theme === nextProps.theme
    );
  });

  const renderSection = (config: SectionConfig) => {
    return (
      <SectionItem 
        config={config} 
        theme={theme} 
        activeMenuSection={activeMenuSection}
        setActiveMenuSection={setActiveMenuSection}
        handleSectionAction={handleSectionAction}
      />
    );
  };

  const AddSectionDivider = ({ index, onAdd }: { index: number; onAdd: () => void }) => (
    <div 
      className="flex items-center justify-center"
      style={{
        paddingTop: `${CARD_VERTICAL_SPACING}px`,
        paddingBottom: `${CARD_VERTICAL_SPACING}px`,
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

  const AddActivityButton = ({ sectionId }: { sectionId: string }) => (
    <motion.button
      whileHover={{ scale: 1.02, background: theme.buttonGradient }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm shadow-lg transition-all"
      style={{ background: theme.buttonGradient }}
      onClick={(e) => {
        e.stopPropagation();
        setActiveActivityDropdown(activeActivityDropdown === sectionId ? null : sectionId);
      }}
    >
      <Plus className="w-4 h-4" />
      <span>Atividade</span>
      {activeActivityDropdown === sectionId && (
        <ActivityDropdown 
          sectionId={sectionId} 
          onClose={() => setActiveActivityDropdown(null)} 
        />
      )}
    </motion.button>
  );

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
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-orange-500" />
                Minhas Atividades
              </h2>
              <p className="text-slate-400 text-sm">Selecione as atividades para adicionar à seção</p>
            </div>
            <button 
              onClick={() => {
                setShowMyActivitiesPanel(false);
                setMyActivitiesSectionId(null);
                setSelectedActivities([]);
              }}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Buscar atividades..."
                value={activitySearchTerm}
                onChange={(e) => setActivitySearchTerm(e.target.value)}
                className="w-full bg-slate-800 border-0 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {loadingActivities ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-slate-400 animate-pulse">Carregando suas atividades...</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                {filteredActivities.map((activity) => {
                  const isSelected = selectedActivities.includes(activity.id);
                  const title = activity.id_json?.titulo || activity.id_json?.title || activity.tipo || 'Atividade';
                  const type = activity.tipo || 'default';

                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ y: -4 }}
                      className={`group relative rounded-2xl border transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'}`}
                      onClick={() => {
                        setSelectedActivities(prev => 
                          prev.includes(activity.id) ? prev.filter(id => id !== activity.id) : [...prev, activity.id]
                        );
                      }}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold leading-tight line-clamp-2">{title}</h3>
                          <span className="text-slate-500 text-xs mt-1 block uppercase tracking-wider font-semibold">{type}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Nenhuma atividade encontrada</h3>
                  <p className="text-slate-500 max-w-xs">Tente mudar os filtros ou busque por outro termo.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              <span className="text-orange-500 font-bold">{selectedActivities.length}</span> atividades selecionadas
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowMyActivitiesPanel(false);
                  setMyActivitiesSectionId(null);
                  setSelectedActivities([]);
                }}
                className="px-6 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button 
                disabled={selectedActivities.length === 0}
                onClick={() => addActivitiesToSection(myActivitiesSectionId)}
                className="px-8 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none hover:bg-orange-400 transition-all"
              >
                Adicionar Atividades
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const CIRCLE_SIZE = 72;
  const ACTION_CIRCLE_SIZE = 48;

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

  const toggleCustomSectionExpand = (id: string) => {
    setCustomSections(sections => 
      sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s)
    );
  };

  const deleteCustomSection = (id: string) => {
    setCustomSections(sections => sections.filter(s => s.id !== id));
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

  const addCustomSection = (dividerIndex: number, insertAfterOrderIndex?: number) => {
    setCustomSections(prev => {
      const sectionsInDivider = prev.filter(s => s.afterDivider === dividerIndex);
      let newOrderIndex: number;
      if (insertAfterOrderIndex !== undefined) {
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

  const renderCustomSectionsForDivider = (dividerIndex: number) => {
    const sectionsForDivider = customSections
      .filter(s => s.afterDivider === dividerIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    if (sectionsForDivider.length === 0) return null;
    
    return sectionsForDivider.map((section, idx) => (
      <React.Fragment key={section.id}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl relative z-10 cursor-pointer"
          style={{ 
            background: theme.bgGradient, 
            border: `1px solid ${theme.border}`, 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            marginTop: '0px'
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
                  time="10 min"
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
        
        <AddSectionDivider 
          index={dividerIndex} 
          onAdd={() => addCustomSection(dividerIndex, section.orderIndex)} 
        />
      </React.Fragment>
    ));
  };

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
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-2xl overflow-hidden cursor-pointer border-2"
                style={{ borderColor: theme.border }}
                onClick={handleImageUploadClick}
              >
                {aulaImage ? (
                  <img src={aulaImage} alt="Aula" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800/50 flex items-center justify-center">
                    <Image className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{aulaName}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase" style={{ background: theme.tagBg, color: theme.primary, border: `1px solid ${theme.tagBorder}` }}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(createdAt)}</span>
                </div>
                {turmaName && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-400/10 border border-blue-400/20">
                    <Users className="w-3 h-3" />
                    <span>{turmaName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, background: `${theme.primary}20` }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}` }}
              onClick={() => setThemeMode(themeMode === 'orange' ? 'purple' : 'orange')}
            >
              <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
            </motion.button>
            
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, background: `${theme.primary}20` }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}` }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreVertical className="w-5 h-5" style={{ color: theme.primary }} />
              </motion.button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 shadow-2xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
                      border: `1px solid ${theme.menuBorder}`,
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {[
                        { id: 'share', label: 'Compartilhar', icon: Share2 },
                        { id: 'download', label: 'Baixar Aula', icon: Download },
                        { id: 'print', label: 'Imprimir', icon: FileText },
                        { id: 'lock', label: 'Privacidade', icon: Lock }
                      ].map((item) => (
                        <motion.button
                          key={item.id}
                          whileHover={{ x: 4, backgroundColor: `${theme.primary}15` }}
                          onClick={() => handleMenuItemClick(item.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white transition-all rounded-xl text-sm font-medium"
                        >
                          <item.icon className="w-4 h-4" style={{ color: theme.primary }} />
                          {item.label}
                        </motion.button>
                      ))}
                      <div className="h-px mx-3 my-1" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}33, transparent)` }} />
                      <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={() => handleMenuItemClick('delete')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 transition-all rounded-xl text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir Aula
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[60px] rounded-full z-10 opacity-30 pointer-events-none" style={{ background: theme.primary }} />
      </div>

      <div className="mt-8 flex items-center justify-between mb-2">
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
            onClick={() => console.log('Histórico de versões clicado')}
            title="Histórico de alterações"
          >
            <Clock className="w-6 h-6" />
          </motion.button>
        </div>

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

      {renderCustomSectionsForDivider(0)}

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
        
        <DragOverlay>
          {activeDragId && sectionConfigs[activeDragId] ? (
            <div style={{ opacity: 0.8, transform: 'scale(1.02)' }}>
              {renderSection(sectionConfigs[activeDragId])}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        <MyActivitiesPanel />
      </AnimatePresence>

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
