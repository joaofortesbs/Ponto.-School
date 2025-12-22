import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, User, Users, Play, MoreVertical, Share2, Download, Calendar, Lock, BarChart3, ChevronDown, Target, Wrench } from 'lucide-react';
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
        className="mt-[18px] rounded-2xl relative z-10 overflow-hidden cursor-pointer"
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-4">
                <textarea
                  value={objectiveText}
                  onChange={(e) => setObjectiveText(e.target.value)}
                  placeholder="Escreva o objetivo da aula..."
                  className="w-full bg-[#030C2A]/50 border rounded-xl p-3 text-white placeholder-white/40 resize-none focus:outline-none transition-all"
                  style={{
                    minHeight: '100px',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = `${theme.primary}40`;
                    e.target.style.backgroundColor = 'rgba(3, 12, 42, 0.7)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(3, 12, 42, 0.5)';
                  }}
                />

                <div className="flex items-center gap-3 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium text-sm"
                    style={{
                      background: theme.buttonGradient,
                      boxShadow: `0 4px 12px ${theme.shadow}`
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-white/80 font-medium text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
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

      <div className="flex-1 mt-6">
      </div>
    </div>
  );
};

export default AulaResultadoContent;
