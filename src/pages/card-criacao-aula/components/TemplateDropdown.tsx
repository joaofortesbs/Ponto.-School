import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, BookOpen, Heart, Briefcase, Monitor } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

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
            <div className="flex items-center justify-between p-4 border-b border-[#FF6B00]/20">
              <h3 className="text-white font-semibold text-base">Escolha seu template</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '370px' }}>
              {TEMPLATES.map((template) => {
                const IconComponent = template.icon;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTemplate(template)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                          : 'rgba(255, 107, 0, 0.15)'
                      }}
                    >
                      <IconComponent 
                        className={isSelected ? 'text-white' : 'text-[#FF6B00]'} 
                        style={{ width: '20px', height: '20px' }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">{template.name}</h4>
                      <p className="text-white/50 text-xs line-clamp-2 mt-0.5">
                        {template.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dropdownContent, document.body);
};

export default TemplateDropdown;
