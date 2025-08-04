import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronLeft, Sparkles, Activity, BookOpen, Users, Target, Calendar, Lightbulb, FileText, Trophy, Zap, Brain, Heart } from 'lucide-react';
import { TrilhasBadge } from '../components/TrilhasBadge';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen, Target, Trash2, Plus, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
  isTrilhasEligible?: boolean;
  customFields?: Record<string, string>;
  duration?: string;
  difficulty?: string;
  category?: string;
  type?: string;
  isManual?: boolean;
}

// Function to get the correct activity name from schoolPowerActivities
const getActivityName = (id: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === id);
  return activity?.name || activity?.title || id;
};

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ actionPlan, onApprove, isLoading = false }: ActionPlanCardProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  console.log('🎯 ActionPlanCard renderizado com:', { actionPlan, isLoading });

  const getIconByActivityId = (id: string) => {
    // Mapeia IDs específicos para ícones apropriados
    const iconMap: { [key: string]: any } = {
      'quiz-contextualizacao': BookOpen,
      'atividades-interativas': Users,
      'projetos-praticos': Target,
      'cronograma-estudos': Calendar,
      'brainstorming': Lightbulb,
      'redacao-tematica': FileText,
      'simulado-preparatorio': Trophy,
      'revisao-intensiva': Zap,
      'mapas-mentais': Brain,
      'autoavaliacao': Heart,
      'estudo-grupo': Users,
      'pesquisa-aprofundada': BookOpen,
      'exercicios-praticos': Target,
      'apresentacao-oral': Users
    };

    // Se o ID específico não for encontrado, usa um padrão baseado em palavras-chave
    const keywordMap = [
      { keywords: ['quiz', 'questao', 'prova', 'simulado'], icon: Trophy },
      { keywords: ['redacao', 'escrita', 'texto'], icon: FileText },
      { keywords: ['grupo', 'time', 'colabora'], icon: Users },
      { keywords: ['cronograma', 'agenda', 'tempo'], icon: Calendar },
      { keywords: ['brainstorm', 'ideia', 'criativ'], icon: Lightbulb },
      { keywords: ['mapa', 'mental', 'visual'], icon: Brain },
      { keywords: ['projeto', 'prático'], icon: Target },
      { keywords: ['revisao', 'revisar'], icon: Zap },
      { keywords: ['autoaval', 'reflexao'], icon: Heart }
    ];

    // Primeiro tenta encontrar por ID exato
    if (iconMap[id]) {
      return iconMap[id];
    }

    // Depois tenta por palavra-chave no ID
    const lowerCaseId = id.toLowerCase();
    for (const mapping of keywordMap) {
      if (mapping.keywords.some(keyword => lowerCaseId.includes(keyword))) {
        return mapping.icon;
      }
    }

    // Fallback para Activity
    return Activity;
  };

  const handleItemToggle = (itemId: string) => {
    // Funcionalidade de seleção removida - apenas log para debug
    console.log('Item clicado:', itemId);
  };

  const handleApprove = () => {
    // Aprova todos os itens do plano de ação
    onApprove(actionPlan);
  };

  const handleBack = () => {
    console.log('🔙 Voltando para o início');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <motion.div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            🤖 Gerando Plano de Ação
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            A IA está analisando seus dados e criando atividades personalizadas...
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#29335C]/10 rounded-lg p-4 border border-[#FF6B00]/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✨ Consultando 137 atividades disponíveis<br/>
              🎯 Personalizando para seu contexto<br/>
              📝 Validando compatibilidade<br/>
              🔍 Finalizando sugestões
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleIconClick = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  return (
    <motion.div 
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#FF6B00]" />
            Plano de Ação Personalizado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selecione as atividades que deseja gerar
          </p>
        </div>

        <div className="w-20"></div>
      </div>

      {/* Lista de Atividades - Scroll Infinito Otimizado */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4" style={{
        maxHeight: 'calc(100vh - 280px)',
        minHeight: '400px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#FF6B00 rgba(255,107,0,0.1)'
      }}>
        <div className="space-y-2">
          {actionPlan.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma atividade disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                Houve um problema ao gerar as atividades personalizadas.
              </p>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8533] transition-colors text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            actionPlan.map((item, index) => {
              const Icon = getIconByActivityId(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md border transition-all duration-200 cursor-pointer hover:shadow-lg border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50"
                  onClick={() => handleItemToggle(item.id)}
                >
                  {isActivityEligibleForTrilhas(item.id) && (
                    <div className="absolute top-2 right-2 z-20">
                      <TrilhasBadge />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Ícone compacto da atividade */}
                        <div 
                          className={`icon-container ${selectedItems.has(item.id) ? 'active' : ''}`}
                          style={{
                            width: '28px',
                            height: '28px',
                            minWidth: '28px',
                            minHeight: '28px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: selectedItems.has(item.id) 
                              ? 'linear-gradient(135deg, #FF6E06, #FF8A39)' 
                              : 'rgba(255, 110, 6, 0.1)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: selectedItems.has(item.id) 
                              ? '0 2px 8px rgba(255, 110, 6, 0.3)' 
                              : 'none',
                            transform: selectedItems.has(item.id) ? 'scale(1.05)' : 'scale(1)'
                          }}
                        >
                          {React.createElement(getIconByActivityId(item.id), {
                            className: `w-3.5 h-3.5 transition-all duration-200 relative z-10`,
                            style: {
                              color: selectedItems.has(item.id) ? 'white' : '#FF6E06'
                            }
                          })}
                        </div>

                        {/* Título compacto da atividade */}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 pr-6">
                          {item.title}
                        </h3>
                      </div>
                      
                      {/* Descrição compacta */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
                        {item.description}
                      </p>

                      {/* Campos personalizados compactos */}
                      {item.customFields && Object.keys(item.customFields).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {Object.entries(item.customFields)
                            .filter(([key, value]) => value && value.toString().trim() !== '')
                            .slice(0, 4) // Limita a 4 badges para economizar espaço
                            .map(([key, value], index) => {
                              const colors = [
                                'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
                                'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-300',
                                'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
                                'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300'
                              ];
                              const colorClass = colors[index % colors.length];

                              return (
                                <div 
                                  key={key} 
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${colorClass}`}
                                  title={`${key}: ${value}`}
                                >
                                  <span className="truncate max-w-[80px]">
                                    {key}: {value.toString().length > 8 ? `${value.toString().substring(0, 8)}...` : value}
                                  </span>
                                </div>
                              );
                            })}
                          {Object.keys(item.customFields).length > 4 && (
                            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400">
                              +{Object.keys(item.customFields).length - 4} mais
                            </div>
                          )}
                        </div>
                      )}

                      {/* ID compacto da atividade */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded text-[10px]">
                          {item.id}
                        </span>
                        {selectedItems.has(item.id) && (
                          <div className="flex items-center gap-1 text-[#FF6B00]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">Selecionado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
      </div>

      {/* Footer com estatísticas e ações */}
      {actionPlan.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedItems.size} de {actionPlan.length} atividades selecionadas
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Gerado com IA Gemini • Validado com School Power
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleApprove}
              className="px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white hover:shadow-lg hover:scale-105 transform"
            >

                <Sparkles className="w-4 h-4 inline mr-2" />
                Gerar Atividades ({actionPlan.length})

            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ActionPlanCard;