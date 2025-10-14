
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Progress } from '../../ui/progress';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';

interface CardPrimeiroPassosProps {
  isCollapsed?: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  content: string[];
}

export const CardPrimeiroPassos: React.FC<CardPrimeiroPassosProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const [showNumber, setShowNumber] = useState(false);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [dropupPosition, setDropupPosition] = useState({ top: 0, left: 0, width: 0 });
  const [expandedItem, setExpandedItem] = useState<string>('1'); // Primeiro item expandido por padrão
  const cardRef = useRef<HTMLDivElement>(null);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { 
      id: '1', 
      label: 'Personalizar perfil', 
      completed: false,
      content: [
        'Adicione uma foto de perfil',
        'Preencha suas informações pessoais',
        'Defina suas preferências de estudo'
      ]
    },
    { 
      id: '2', 
      label: 'Criar uma atividade', 
      completed: false,
      content: [
        'Acesse o School Power',
        'Escolha o tipo de atividade',
        'Configure e gere sua atividade'
      ]
    },
    { 
      id: '3', 
      label: 'Criar uma Turma', 
      completed: false,
      content: [
        'Vá para a seção Turmas',
        'Clique em "Criar Turma"',
        'Adicione nome e descrição'
      ]
    },
    { 
      id: '4', 
      label: 'Compartilhar uma atividade', 
      completed: false,
      content: [
        'Crie ou selecione uma atividade',
        'Clique no botão compartilhar',
        'Envie o link para seus alunos'
      ]
    },
    { 
      id: '5', 
      label: 'Criar uma Trilha School', 
      completed: false,
      content: [
        'Acesse Trilhas School',
        'Organize suas atividades',
        'Publique sua trilha'
      ]
    },
  ]);

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNumber(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        const dropup = document.getElementById('primeiros-passos-dropup');
        if (dropup && !dropup.contains(event.target as Node)) {
          setIsDropupOpen(false);
        }
      }
    };

    if (isDropupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropupOpen]);

  const handleCardClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDropupPosition({
        top: rect.top - 420, // Aparece bem acima do card
        left: rect.right + 16,
        width: 400
      });
    }
    setIsDropupOpen(!isDropupOpen);
  };

  const toggleChecklistItem = (id: string) => {
    // Se clicar no item já expandido, não faz nada (mantém expandido)
    // Se clicar em outro item, expande esse e fecha o anterior
    setExpandedItem(prev => prev === id ? id : id);
  };

  const markAsCompleted = (id: string, checked: boolean) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: checked } : item
      )
    );
  };

  const handleCriarAtividade = () => {
    navigate('/school-power');
    setIsDropupOpen(false);
  };

  if (isCollapsed) return null;

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-4 mb-4 relative overflow-hidden rounded-2xl cursor-pointer"
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

            {/* Seta para cima */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-orange-600 dark:text-orange-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
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

      {/* Drop-up Portal - Renderizado fora do menu lateral */}
      {isDropupOpen && ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            id="primeiros-passos-dropup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[9999] bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/40 dark:via-gray-900 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-orange-400/50 dark:border-orange-500/40 p-6 backdrop-blur-xl"
            style={{
              top: `${dropupPosition.top}px`,
              left: `${dropupPosition.left}px`,
              width: `${dropupPosition.width}px`
            }}
          >
            {/* Título */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">Primeiros passos</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropupOpen(false);
                }}
                className="text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Barra de progresso com contador */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Progress 
                  value={progress} 
                  className="flex-1 h-3 bg-orange-100 dark:bg-orange-950/30 rounded-full"
                  indicatorClassName="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-lg shadow-orange-500/30"
                />
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                  {completedCount}/{checklist.length}
                </span>
              </div>
            </div>

            {/* Checklist Accordion */}
            <div className="space-y-3">
              {checklist.map((item) => {
                const isExpanded = expandedItem === item.id;
                
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-orange-200 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 transition-all overflow-hidden"
                  >
                    {/* Header do Item */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all"
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => {
                          markAsCompleted(item.id, checked as boolean);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 border-orange-400 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                      />
                      <span className={`text-sm flex-1 font-medium ${item.completed ? 'line-through text-orange-300 dark:text-orange-600' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.label}
                      </span>
                      <motion.svg
                        className="w-4 h-4 text-orange-400 group-hover:text-orange-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </div>

                    {/* Conteúdo Expansível */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-orange-200 dark:border-orange-800/30">
                            {item.content.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                            
                            {/* Botão Criar Atividade apenas no item Personalizar perfil */}
                            {item.id === '1' && (
                              <div className="pt-2">
                                <Button
                                  onClick={handleCriarAtividade}
                                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs py-1 rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300 h-8"
                                >
                                  Criar Atividade
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
