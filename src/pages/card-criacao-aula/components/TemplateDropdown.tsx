import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, BookOpen, Heart, Briefcase, Monitor, LayoutGrid, ChevronLeft, Check } from 'lucide-react';

// Lista de ícones disponíveis para templates
const AVAILABLE_ICONS = [
  { name: 'Zap', icon: Zap },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Heart', icon: Heart },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Monitor', icon: Monitor },
];

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  sections?: string[];
}

interface TemplateWithSections extends Template {
  sections: string[];
}

const TEMPLATE_SECTIONS: Record<string, string[]> = {
  'aula-ativa': [
    'Contextualização',
    'Exploração',
    'Apresentação',
    'Prática Guiada',
    'Prática Independente',
    'Fechamento'
  ],
  'aula-expositiva': [
    'Objetivos',
    'Contextualização',
    'Apresentação',
    'Demonstração',
    'Avaliação',
    'Fechamento'
  ],
  'aula-socioemocional': [
    'Objetivos',
    'Contextualização',
    'Apresentação',
    'Engajamento',
    'Colaboração',
    'Reflexão',
    'Fechamento'
  ],
  'aula-tecnica': [
    'Objetivos',
    'Contextualização',
    'Apresentação',
    'Demonstração',
    'Desenvolvimento',
    'Aplicação',
    'Avaliação',
    'Fechamento'
  ],
  'aula-se': [
    'Objetivos',
    'Contextualização',
    'Exploração',
    'Engajamento',
    'Desenvolvimento',
    'Colaboração',
    'Fechamento'
  ]
};

export const TEMPLATES: Template[] = [
  {
    id: 'aula-ativa',
    name: 'Aula Ativa',
    description: 'Os alunos participam ativamente, realizando atividades práticas e projetos colaborativos.',
    icon: Zap
  },
  {
    id: 'aula-expositiva',
    name: 'Aula Expositiva',
    description: 'O professor apresenta o conteúdo de forma direta, enquanto os alunos assimilam e fazem anotações.',
    icon: BookOpen
  },
  {
    id: 'aula-socioemocional',
    name: 'Aula Socioemocional',
    description: 'Combina conteúdo escolar com habilidades socioemocionais, como empatia e trabalho em equipe.',
    icon: Heart
  },
  {
    id: 'aula-tecnica',
    name: 'Aula Técnica',
    description: 'Mostra como o conteúdo se aplica a profissões reais, preparando para desafios do mercado.',
    icon: Briefcase
  },
  {
    id: 'aula-se',
    name: 'Aula SE',
    description: 'Integra recursos digitais e interatividade, aproximando o conteúdo da realidade dos alunos.',
    icon: Monitor
  }
];

interface TemplateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  selectedTemplate: Template | null;
  anchorRef: React.RefObject<HTMLDivElement>;
}

const TemplateDropdown: React.FC<TemplateDropdownProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplate,
  anchorRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateInstructions, setTemplateInstructions] = useState('');
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [viewingSections, setViewingSections] = useState<TemplateWithSections | null>(null);

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 369;
      const dropdownHeight = 431;
      
      setPosition({
        top: rect.top + (rect.height / 2) - (dropdownHeight / 2),
        left: rect.left - dropdownWidth - 12
      });
    }
  }, [isOpen, anchorRef]);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleViewSections = (template: Template) => {
    const sections = TEMPLATE_SECTIONS[template.id] || [];
    setViewingSections({ ...template, sections });
  };

  const handleBackFromSections = () => {
    setViewingSections(null);
  };

  const handleCreateTemplate = () => {
    if (templateName.trim() === '' || templateInstructions.trim() === '') {
      return;
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: templateInstructions,
      icon: AVAILABLE_ICONS[selectedIconIndex].icon
    };

    setCustomTemplates(prev => [newTemplate, ...prev]);
    setTemplateName('');
    setTemplateInstructions('');
    setSelectedIconIndex(0);
    setIsCreating(false);
  };

  const handleBackFromCreation = () => {
    setIsCreating(false);
    setTemplateName('');
    setTemplateInstructions('');
    setSelectedIconIndex(0);
  };

  const allTemplates = [...customTemplates, ...TEMPLATES];

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed"
            style={{
              zIndex: 9999,
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: '369px',
              maxHeight: '431px',
              background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {viewingSections ? (
                <motion.div
                  key="sections-mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#FF6B00]/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackFromSections}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <h3 className="text-white font-semibold text-base">
                      {viewingSections.name}
                    </h3>
                  </div>

                  {/* Content - Blocos de Seções */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {viewingSections.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="p-3 rounded-lg border border-[#FF6B00]/30 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF6B00]/5 cursor-pointer transition-all"
                        >
                          <h4 className="text-white font-medium text-xs text-center">
                            {section}
                          </h4>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : isCreating ? (
                <motion.div
                  key="creation-mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#FF6B00]/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackFromCreation}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <h3 className="text-white font-semibold text-base">Criar template</h3>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    
                    {/* Nome e Ícone na mesma linha */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 uppercase tracking-wide">Nome</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Ex: Meu Template"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF6B00] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Seletor de Ícone */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 uppercase tracking-wide">Ícone</label>
                      <div className="flex gap-2">
                        {AVAILABLE_ICONS.map((item, index) => {
                          const IconComponent = item.icon;
                          const isSelected = selectedIconIndex === index;
                          return (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedIconIndex(index)}
                              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                              style={{
                                background: isSelected
                                  ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                                  : 'rgba(255, 107, 0, 0.15)',
                                border: isSelected
                                  ? '1px solid #FF6B00'
                                  : '1px solid rgba(255, 107, 0, 0.3)'
                              }}
                            >
                              <IconComponent 
                                className={isSelected ? 'text-white' : 'text-[#FF6B00]'} 
                                style={{ width: '18px', height: '18px' }}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Instruções */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 uppercase tracking-wide">Instruções</label>
                      <textarea
                        value={templateInstructions}
                        onChange={(e) => setTemplateInstructions(e.target.value)}
                        placeholder="Descreva como este template funciona..."
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF6B00] focus:outline-none transition-all resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Botão Adicionar */}
                  <div className="px-4 py-3 border-t border-[#FF6B00]/20 bg-black/20">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateTemplate}
                      disabled={!templateName.trim() || !templateInstructions.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all"
                      style={{
                        background: templateName.trim() && templateInstructions.trim()
                          ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                          : 'rgba(255, 107, 0, 0.3)',
                        cursor: templateName.trim() && templateInstructions.trim() ? 'pointer' : 'not-allowed',
                        opacity: templateName.trim() && templateInstructions.trim() ? 1 : 0.6
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="selection-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#FF6B00]/20">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="text-white font-semibold text-base">Escolha seu template</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsCreating(true)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div 
                    className="px-3 py-2 space-y-1.5 overflow-y-auto hide-scrollbar flex-1 flex flex-col"
                    style={{ 
                      maxHeight: '380px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    
                    {/* Templates Customizados */}
                    {customTemplates.length > 0 && (
                      <>
                        {customTemplates.map((template) => {
                          const IconComponent = template.icon;
                          const isSelected = selectedTemplate?.id === template.id;
                          
                          return (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleSelectTemplate(template)}
                              onMouseEnter={() => setHoveredTemplateId(template.id)}
                              onMouseLeave={() => setHoveredTemplateId(null)}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all relative"
                              style={{
                                background: isSelected 
                                  ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 107, 0, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected 
                                  ? '1px solid rgba(255, 107, 0, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              <div 
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: isSelected 
                                    ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                                    : 'rgba(255, 107, 0, 0.15)'
                                }}
                              >
                                <IconComponent 
                                  className={isSelected ? 'text-white' : 'text-[#FF6B00]'} 
                                  style={{ width: '18px', height: '18px' }}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm">{template.name}</h4>
                                <p className="text-white/50 text-xs line-clamp-1 mt-0.5">
                                  {template.description}
                                </p>
                              </div>

                              {hoveredTemplateId === template.id && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSections(template);
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                                  style={{
                                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                                  }}
                                >
                                  <LayoutGrid 
                                    className="text-white" 
                                    style={{ width: '14px', height: '14px' }}
                                  />
                                </motion.button>
                              )}
                            </motion.div>
                          );
                        })}
                        
                        {/* Linha separadora */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent my-2" />
                      </>
                    )}

                    {/* Templates Padrão */}
                    {TEMPLATES.map((template) => {
                      const IconComponent = template.icon;
                      const isSelected = selectedTemplate?.id === template.id;
                      
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectTemplate(template)}
                          onMouseEnter={() => setHoveredTemplateId(template.id)}
                          onMouseLeave={() => setHoveredTemplateId(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all relative"
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 107, 0, 0.1) 100%)'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected 
                              ? '1px solid rgba(255, 107, 0, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isSelected 
                                ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                                : 'rgba(255, 107, 0, 0.15)'
                            }}
                          >
                            <IconComponent 
                              className={isSelected ? 'text-white' : 'text-[#FF6B00]'} 
                              style={{ width: '18px', height: '18px' }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm">{template.name}</h4>
                            <p className="text-white/50 text-xs line-clamp-1 mt-0.5">
                              {template.description}
                            </p>
                          </div>

                          {hoveredTemplateId === template.id && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSections(template);
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                              style={{
                                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                              }}
                            >
                              <LayoutGrid 
                                className="text-white" 
                                style={{ width: '14px', height: '14px' }}
                              />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dropdownContent, document.body);
};

export default TemplateDropdown;
