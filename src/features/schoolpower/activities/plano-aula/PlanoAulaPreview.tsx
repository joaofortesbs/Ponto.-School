
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Target, BookOpen, Users, CheckSquare, Lightbulb } from 'lucide-react';
import { VisaoGeralInterface } from './sections/visao-geral/VisaoGeralInterface';
import { ObjetivosInterface } from './sections/objetivos/ObjetivosInterface';
import { DesenvolvimentoInterface } from './sections/desenvolvimento/DesenvolvimentoInterface';
import { MetodologiaInterface } from './sections/metodologia/MetodologiaInterface';
import { AtividadesInterface } from './sections/atividades/AtividadesInterface';
import { AvaliacaoInterface } from './sections/avaliacao/AvaliacaoInterface';

interface PlanoAulaData {
  titulo?: string;
  disciplina?: string;
  anoEscolar?: string;
  duracao?: string;
  objetivos?: Array<{
    id: string;
    texto: string;
    categoria: string;
  }>;
  desenvolvimento?: {
    tempoTotal: number;
    totalEtapas: number;
    status: string;
    etapas: Array<{
      id: string;
      titulo: string;
      descricao: string;
      tempo: number;
      recursos: string;
      observacoes?: string;
    }>;
    observacoesGerais?: string;
  };
  metodologia?: {
    abordagemPedagogica: string;
    estrategiasEnsino: string[];
    recursosDidaticos: string[];
    organizacaoEspaco: string;
  };
  avaliacao?: {
    criterios: string[];
    instrumentos: string[];
    momentos: string[];
    observacoes: string;
  };
}

interface PlanoAulaPreviewProps {
  activity: PlanoAulaData;
  onClose: () => void;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ activity, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'visao-geral',
      name: 'Visão Geral',
      icon: FileText,
      component: VisaoGeralInterface
    },
    {
      id: 'objetivos',
      name: 'Objetivos',
      icon: Target,
      component: ObjetivosInterface
    },
    {
      id: 'desenvolvimento',
      name: 'Desenvolvimento',
      icon: Lightbulb,
      component: DesenvolvimentoInterface
    },
    {
      id: 'metodologia',
      name: 'Metodologia',
      icon: BookOpen,
      component: MetodologiaInterface
    },
    {
      id: 'atividades',
      name: 'Atividades',
      icon: Users,
      component: AtividadesInterface
    },
    {
      id: 'avaliacao',
      name: 'Avaliação',
      icon: CheckSquare,
      component: AvaliacaoInterface
    }
  ];

  const CurrentComponent = sections[activeSection]?.component;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-7xl h-[85vh] flex overflow-hidden"
      >
        {/* Sidebar de Navegação */}
        <div className="w-80 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 border-r border-orange-200 dark:border-gray-600 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-orange-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Plano de Aula
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><span className="font-medium">Título:</span> {activity.titulo || 'Não informado'}</p>
              <p><span className="font-medium">Disciplina:</span> {activity.disciplina || 'Não informada'}</p>
              {activity.anoEscolar && (
                <p><span className="font-medium">Ano:</span> {activity.anoEscolar}</p>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                      activeSection === index
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {React.createElement(sections[activeSection]?.icon || FileText, {
                className: "w-6 h-6 text-orange-500"
              })}
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {sections[activeSection]?.name}
              </h3>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {CurrentComponent && (
                  <CurrentComponent 
                    data={activeSection === 0 ? activity : 
                          activeSection === 1 ? { objetivos: activity.objetivos } :
                          activeSection === 2 ? activity.desenvolvimento :
                          activeSection === 3 ? activity.metodologia :
                          activeSection === 4 ? activity.desenvolvimento : // Para atividades, usa dados do desenvolvimento
                          activeSection === 5 ? activity.avaliacao :
                          activity
                    } 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeSection + 1} de {sections.length}
              </span>
              
              <button
                onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
                disabled={activeSection === sections.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanoAulaPreview;
