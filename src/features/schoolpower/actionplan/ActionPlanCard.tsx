import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronLeft, Sparkles, Activity, BookOpen, Users, Target, Calendar, Lightbulb, FileText, Trophy, Zap, Brain, Heart } from 'lucide-react';

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
}

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
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      console.log(`❌ Atividade ${itemId} desmarcada`);
    } else {
      newSelected.add(itemId);
      console.log(`✅ Atividade ${itemId} selecionada`);
    }
    setSelectedItems(newSelected);
    console.log('📊 Atividades atualmente selecionadas:', Array.from(newSelected));
  };

  const handleApprove = () => {
    const approvedItems = actionPlan
      .filter(item => selectedItems.has(item.id))
      .map(item => ({ ...item, approved: true }));

    console.log('✅ Aprovando atividades selecionadas:', approvedItems);

    if (approvedItems.length > 0) {
      onApprove(approvedItems);
    } else {
      console.warn('⚠️ Nenhuma atividade selecionada para aprovação');
    }
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

      {/* Lista de Atividades */}
      <div className="space-y-4 mb-8">
        {actionPlan.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma atividade disponível
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Houve um problema ao gerar as atividades personalizadas.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8533] transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          actionPlan.map((item, index) => (
            <motion.div
              key={item.id}
              className={`relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                selectedItems.has(item.id)
                  ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 shadow-lg transform scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-[#FF6B00]/50 hover:shadow-md'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleItemToggle(item.id)}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox customizado */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedItems.has(item.id)
                    ? 'border-[#FF6B00] bg-[#FF6B00] shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#FF6B00]/50'
                }`}>
                  {selectedItems.has(item.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Ícone animado da atividade */}
                <div className="flex-shrink-0 mt-1">
                  <div 
                    className={`icon-container ${selectedItems.has(item.id) ? 'active' : ''}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      minHeight: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selectedItems.has(item.id) 
                        ? 'linear-gradient(135deg, #FF6E06, #FF8A39)' 
                        : 'rgba(255, 110, 6, 0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: selectedItems.has(item.id) 
                        ? '0 4px 8px rgba(255, 110, 6, 0.3)' 
                        : 'none'
                    }}
                  >
                    {React.createElement(getIconByActivityId(item.id), {
                      className: `w-5 h-5 transition-all duration-300 relative z-10`,
                      style: {
                        color: selectedItems.has(item.id) ? 'white' : '#FF6E06'
                      }
                    })}
                    <div 
                      className="icon-glow"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '16px',
                        height: '16px',
                        background: 'radial-gradient(circle, rgba(255, 110, 6, 0.5), transparent)',
                        borderRadius: '50%',
                        transform: selectedItems.has(item.id) 
                          ? 'translate(-50%, -50%) scale(2.5)' 
                          : 'translate(-50%, -50%) scale(0)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Conteúdo da atividade */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* ID da atividade (para debug) */}
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                      ID: {item.id}
                    </span>
                  </div>
                </div>

                {/* Indicador visual de seleção */}
                {selectedItems.has(item.id) && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-[#FF6B00] rounded-full animate-pulse shadow-md"></div>
                  </div>
                )}
              </div>

              {/* Borda animada para item selecionado */}
              {selectedItems.has(item.id) && (
                <div className="absolute inset-0 rounded-3xl border-2 border-[#FF6B00] animate-pulse opacity-50 pointer-events-none"></div>
              )}
            </motion.div>
          ))
        )}
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
              disabled={selectedItems.size === 0}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedItems.size > 0
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white hover:shadow-lg hover:scale-105 transform'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedItems.size > 0 ? (
                <>
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Gerar Atividades ({selectedItems.size})
                </>
              ) : (
                'Selecione pelo menos 1 atividade'
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ActionPlanCard;