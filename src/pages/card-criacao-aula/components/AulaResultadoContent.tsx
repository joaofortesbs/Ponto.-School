import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, User, Users, Play, MoreVertical, Share2, Download, Calendar, Lock, BarChart3, ChevronDown, Target, Wrench, BookOpen, Lightbulb, Layers, CheckCircle, FileText, MessageSquare, Award, Trash2, Edit3, Layout } from 'lucide-react';
import { Template } from './TemplateDropdown';

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

  const theme = themeColors[themeMode];

  useEffect(() => {
    const cachedAvatar = localStorage.getItem('userAvatarUrl');
    const cachedName = localStorage.getItem('userFirstName');
    
    if (cachedAvatar) {
      setUserAvatar(cachedAvatar);
    }
    if (cachedName) {
      setUserName(cachedName);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); deleteCustomSection(section.id); }}
                className="p-1 rounded-full hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </motion.button>
              <motion.div animate={{ rotate: section.isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
              </motion.div>
            </div>
          </div>
          <AnimatePresence>
            {section.isExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 pb-4">
                  <textarea 
                    value={section.text} 
                    onChange={(e) => updateCustomSectionText(section.id, e.target.value)} 
                    placeholder="Escreva o conteúdo desta seção..." 
                    className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" 
                    style={{ minHeight: '100px' }} 
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" 
                      style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} 
                      onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Seção personalizada'); }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar atividade</span>
                    </motion.button>
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

  // Constante para espaçamento vertical milimétrico entre cards
  // Este valor é usado para garantir posicionamento exato e simétrico do botão
  const CARD_VERTICAL_SPACING = 14; // 14px = espaçamento total entre cards
  
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
        {/* Botão de Templates de Blocos */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05, background: `${theme.primary}20` }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
            style={{ 
              background: `${theme.primary}10`,
              border: `1px solid ${theme.primary}33`,
              color: theme.primary
            }}
            onClick={() => console.log('Templates de blocos clicado')}
          >
            <Layout className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Edição de blocos - Templates</span>
          </motion.button>
        </div>

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
                <textarea
                  value={objectiveText}
                  onChange={(e) => setObjectiveText(e.target.value)}
                  placeholder="Escreva o objetivo da aula..."
                  className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all"
                  style={{
                    minHeight: '100px',
                  }}
                />

                <div className="flex items-center gap-3 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors"
                    style={{
                      background: `${theme.primary}1A`,
                      border: `1px solid ${theme.primary}33`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Adicionar atividade clicado');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar atividade</span>
                  </motion.button>

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

      {/* Divider 0 - Após Objetivo da Aula */}
      <AddSectionDivider index={0} onAdd={() => addCustomSection(0)} />
      {renderCustomSectionsForDivider(0)}

      {/* Card Pré-estudo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          background: theme.bgGradient,
          borderColor: theme.border
        }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{
          background: theme.bgGradient,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setIsPreEstudoExpanded(!isPreEstudoExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Pré-estudo</span>
          </div>
          <motion.div animate={{ rotate: isPreEstudoExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isPreEstudoExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-4">
                <textarea
                  value={preEstudoText}
                  onChange={(e) => setPreEstudoText(e.target.value)}
                  placeholder="Descreva as atividades de pré-estudo..."
                  className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all"
                  style={{ minHeight: '100px' }}
                />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors"
                    style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }}
                    onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Pré-estudo'); }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar atividade</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors"
                    style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }}
                    onClick={(e) => { e.stopPropagation(); console.log('Tools - Pré-estudo'); }}
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

      {/* Divider 1 - Após Pré-estudo */}
      <AddSectionDivider index={1} onAdd={() => addCustomSection(1)} />
      {renderCustomSectionsForDivider(1)}

      {/* Card Introdução */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsIntroducaoExpanded(!isIntroducaoExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Introdução</span>
          </div>
          <motion.div animate={{ rotate: isIntroducaoExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isIntroducaoExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={introducaoText} onChange={(e) => setIntroducaoText(e.target.value)} placeholder="Descreva a introdução da aula..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Introdução'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - Introdução'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider 2 - Após Introdução */}
      <AddSectionDivider index={2} onAdd={() => addCustomSection(2)} />
      {renderCustomSectionsForDivider(2)}

      {/* Card Desenvolvimento */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsDesenvolvimentoExpanded(!isDesenvolvimentoExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Desenvolvimento</span>
          </div>
          <motion.div animate={{ rotate: isDesenvolvimentoExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isDesenvolvimentoExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={desenvolvimentoText} onChange={(e) => setDesenvolvimentoText(e.target.value)} placeholder="Descreva o desenvolvimento da aula..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Desenvolvimento'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - Desenvolvimento'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider 3 - Após Desenvolvimento */}
      <AddSectionDivider index={3} onAdd={() => addCustomSection(3)} />
      {renderCustomSectionsForDivider(3)}

      {/* Card Encerramento */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsEncerramentoExpanded(!isEncerramentoExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Encerramento</span>
          </div>
          <motion.div animate={{ rotate: isEncerramentoExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isEncerramentoExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={encerramentoText} onChange={(e) => setEncerramentoText(e.target.value)} placeholder="Descreva o encerramento da aula..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Encerramento'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - Encerramento'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider 4 - Após Encerramento */}
      <AddSectionDivider index={4} onAdd={() => addCustomSection(4)} />
      {renderCustomSectionsForDivider(4)}

      {/* Card Materiais Complementares */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.75, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsMateriaisExpanded(!isMateriaisExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Materiais Complementares</span>
          </div>
          <motion.div animate={{ rotate: isMateriaisExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isMateriaisExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={materiaisText} onChange={(e) => setMateriaisText(e.target.value)} placeholder="Liste os materiais complementares..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Materiais'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - Materiais'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider 5 - Após Materiais Complementares */}
      <AddSectionDivider index={5} onAdd={() => addCustomSection(5)} />
      {renderCustomSectionsForDivider(5)}

      {/* Card Observações do Professor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsObservacoesExpanded(!isObservacoesExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Observações do Professor</span>
          </div>
          <motion.div animate={{ rotate: isObservacoesExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isObservacoesExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={observacoesText} onChange={(e) => setObservacoesText(e.target.value)} placeholder="Adicione suas observações..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - Observações'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - Observações'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider 6 - Após Observações */}
      <AddSectionDivider index={6} onAdd={() => addCustomSection(6)} />
      {renderCustomSectionsForDivider(6)}

      {/* Card Critérios BNCC */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, background: theme.bgGradient, borderColor: theme.border }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="mb-6 rounded-2xl relative z-10 cursor-pointer"
        style={{ background: theme.bgGradient, border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        onClick={() => setIsBnccExpanded(!isBnccExpanded)}
      >
        <div className="p-4 flex items-center justify-between" style={{ height: '62px' }}>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5" style={{ color: theme.primary }} />
            <span className="text-white font-bold text-lg">Critérios BNCC</span>
          </div>
          <motion.div animate={{ rotate: isBnccExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.primary }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isBnccExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pb-4">
                <textarea value={bnccText} onChange={(e) => setBnccText(e.target.value)} placeholder="Descreva os critérios da BNCC..." className="w-full bg-transparent border-0 p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all" style={{ minHeight: '100px' }} />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Adicionar atividade - BNCC'); }}><Plus className="w-4 h-4" /><span>Adicionar atividade</span></motion.button>
                  <motion.button whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}26` }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm transition-colors" style={{ background: `${theme.primary}1A`, border: `1px solid ${theme.primary}33` }} onClick={(e) => { e.stopPropagation(); console.log('Tools - BNCC'); }}><Wrench className="w-4 h-4" /><span>Tools</span></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AulaResultadoContent;
