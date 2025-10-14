import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CardPrimeiroPassosProps {
  isCollapsed?: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export const CardPrimeiroPassos: React.FC<CardPrimeiroPassosProps> = ({ isCollapsed = false }) => {
  const [showNumber, setShowNumber] = useState(false);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [dropupPosition, setDropupPosition] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Personalizar perfil', completed: false },
    { id: '2', label: 'Criar uma atividade', completed: false },
    { id: '3', label: 'Criar uma Turma', completed: false },
    { id: '4', label: 'Compartilhar uma atividade', completed: false },
    { id: '5', label: 'Criar uma Trilha School', completed: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNumber(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleCardClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDropupPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: 400
      });
    }
    setIsDropupOpen(!isDropupOpen);
  };

  if (isCollapsed) return null;

  return (
    <div className="mx-4 mb-4 relative">
      {/* Card Principal Clicável */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background com gradiente igual ao WelcomeModal */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50/60 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-gray-900/40" />

        {/* Efeito de vidro */}
        <div className="absolute inset-0 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/30 rounded-2xl" />

        {/* Brilho sutil no topo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

        {/* Conteúdo */}
        <div className="relative p-3 flex items-center justify-between">
          {/* Container esquerdo com ícone de notificação */}
          <div className="flex items-center gap-3">
            {/* Ícone de notificação com animação de alarme */}
            {!showNumber ? (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-orange-600 dark:text-orange-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  rotate: [0, -15, 15, -15, 15, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </motion.svg>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-5 h-5 rounded-full bg-orange-600 dark:bg-orange-400 flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">4</span>
              </motion.div>
            )}

            {/* Texto */}
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent whitespace-nowrap">
              Primeiros Passos
            </h3>

            {/* Seta para cima/baixo */}
            {isDropupOpen ? (
              <ChevronDown className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            )}
          </div>
        </div>

        {/* Efeito de brilho animado */}
        <motion.div
          animate={{
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -right-32 w-48 h-48 bg-orange-400/8 rounded-full blur-3xl pointer-events-none"
        />
      </motion.div>

      {/* Drop-down Portal - Renderizado fora do menu lateral */}
      {isDropupOpen && ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[9999]"
            style={{
              top: `${dropupPosition.top}px`,
              left: `${dropupPosition.left}px`,
              width: `${dropupPosition.width}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50/60 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-gray-900/40 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/30 p-4 rounded-2xl shadow-2xl">
              {/* Título e Progresso */}
              <div className="mb-4">
                <h4 className="text-base font-bold text-gray-800 dark:text-white mb-3">
                  Primeiros passos
                </h4>
                
                {/* Barra de Progresso e Contador */}
                <div className="flex items-center gap-3">
                  <Progress 
                    value={progressPercentage} 
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700"
                    indicatorClassName="bg-gradient-to-r from-orange-600 to-amber-600"
                  />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {completedCount}/{totalCount}
                  </span>
                </div>
              </div>

              {/* Lista de Checkboxes */}
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      item.completed
                        ? 'bg-orange-100/50 dark:bg-orange-900/20'
                        : 'bg-white/50 dark:bg-gray-800/30 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChecklistItem(item.id);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Checkbox Circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {item.completed && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </motion.svg>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm font-medium transition-all ${
                        item.completed
                          ? 'text-gray-500 dark:text-gray-400 line-through'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Ícone de seta à direita */}
                    <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};