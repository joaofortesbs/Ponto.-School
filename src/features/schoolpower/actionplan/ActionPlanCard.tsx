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
import { toast } from "@/components/ui/use-toast";

// Dummy types for demonstration, replace with actual types if available
type ActionPlanActivity = {
  id: string;
  title: string;
  description: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  customFields?: Record<string, string>;
  approved?: boolean;
  isBuilt?: boolean;
  builtAt?: Date | null;
};

type ConstructionActivity = {
  id: string;
  title: string;
  description: string;
  customFields?: Record<string, string>;
  approved: boolean;
  isTrilhasEligible?: boolean;
  isBuilt: boolean;
  builtAt: Date | null;
};

// Mock activities state and onApprove handler for compilation
// In a real scenario, these would be passed as props or managed by a parent component
const activities: ActionPlanActivity[] = [];
const onApprove = (activity: ConstructionActivity) => {};
let setActivities: React.Dispatch<React.SetStateAction<ActionPlanActivity[]>>;

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

// Função para renderizar campos específicos do plano-aula
const renderPlanoAulaFields = (customFields: Record<string, string>) => {
  console.log('🎯 [ActionPlanCard] Renderizando campos plano-aula:', customFields);

  const tema = customFields['Tema ou Tópico Central'] || customFields['Tema Central'] || customFields['Tema'];
  const anoSerie = customFields['Ano/Série Escolar'] || customFields['Público-Alvo'];
  const componenteCurricular = customFields['Componente Curricular'] || customFields['Disciplina'];
  const cargaHoraria = customFields['Carga Horária'] || customFields['Tempo Estimado'];
  const habilidadesBNCC = customFields['Habilidades BNCC'];
  const objetivoGeral = customFields['Objetivo Geral'] || customFields['Objetivos de Aprendizagem'];
  const materiaisRecursos = customFields['Materiais/Recursos'] || customFields['Recursos'];
  const perfilTurma = customFields['Perfil da Turma'];
  const tipoAula = customFields['Tipo de Aula'] || customFields['Metodologia'];
  const observacoes = customFields['Observações do Professor'] || customFields['Observações'];

  return (
    <div className="space-y-3">
      {/* Tema Central em destaque */}
      {tema && (
        <div className="w-full">
          <div className="text-xs font-semibold text-[#FF6B00] mb-1">Tema ou Tópico Central</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gradient-to-r from-[#FF6B00]/10 to-orange-50 dark:to-gray-700 px-3 py-2 rounded-lg border border-[#FF6B00]/20">{tema}</div>
        </div>
      )}

      {/* Informações básicas */}
      <div className="grid grid-cols-2 gap-2">
        {componenteCurricular && (
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Componente Curricular</div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{componenteCurricular}</div>
          </div>
        )}
        {anoSerie && (
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ano/Série Escolar</div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{anoSerie}</div>
          </div>
        )}
      </div>

      {objetivoGeral && (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Objetivo Geral</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{objetivoGeral}</div>
        </div>
      )}

      {materiaisRecursos && (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Materiais/Recursos</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{materiaisRecursos}</div>
        </div>
      )}

      {perfilTurma && (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Perfil da Turma</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{perfilTurma}</div>
        </div>
      )}

      {/* Tags e informações complementares */}
      <div className="space-y-2">
        {(cargaHoraria || tipoAula) && (
          <div className="flex flex-wrap gap-2 w-full">
            {cargaHoraria && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                ⏱️ {cargaHoraria}
              </Badge>
            )}
            {tipoAula && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700">
                📚 {tipoAula}
              </Badge>
            )}
          </div>
        )}

        {habilidadesBNCC && (
          <div className="w-full">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Habilidades BNCC</div>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-50 border-purple-200 text-purple-700">
              🎯 {habilidadesBNCC}
            </Badge>
          </div>
        )}

        {observacoes && (
          <div className="w-full">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Observações do Professor</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded italic">{observacoes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Função para renderizar campos específicos da sequencia-didatica
const renderSequenciaDidaticaFields = (customFields: Record<string, string>) => {
  console.log('📚 [ActionPlanCard] Renderizando campos sequencia-didatica:', customFields);

  // Campos obrigatórios conforme especificação - usar chaves exatas
  const tituloTemaAssunto = customFields['Título do Tema / Assunto'] || '';
  const anoSerie = customFields['Ano / Série'] || '';
  const disciplina = customFields['Disciplina'] || '';
  const bnccCompetencias = customFields['BNCC / Competências'] || '';
  const publicoAlvo = customFields['Público-alvo'] || '';
  const objetivosAprendizagem = customFields['Objetivos de Aprendizagem'] || '';
  const quantidadeAulas = customFields['Quantidade de Aulas'] || '';
  const quantidadeDiagnosticos = customFields['Quantidade de Diagnósticos'] || '';
  const quantidadeAvaliacoes = customFields['Quantidade de Avaliações'] || '';
  const cronograma = customFields['Cronograma'] || '';
  
  console.log('📊 Campos extraídos:', {
    tituloTemaAssunto,
    anoSerie,
    disciplina,
    bnccCompetencias,
    publicoAlvo,
    objetivosAprendizagem,
    quantidadeAulas,
    quantidadeDiagnosticos,
    quantidadeAvaliacoes,
    cronograma
  });

  return (
    <div className="space-y-3">
      {/* Título do Tema / Assunto em destaque */}
      {tituloTemaAssunto && (
        <div className="w-full">
          <div className="text-xs font-semibold text-[#FF6B00] mb-1">Título do Tema / Assunto</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gradient-to-r from-[#FF6B00]/10 to-orange-50 dark:to-gray-700 px-3 py-2 rounded-lg border border-[#FF6B00]/20">{tituloTemaAssunto}</div>
        </div>
      )}

      {/* Informações básicas obrigatórias */}
      <div className="grid grid-cols-2 gap-2">
        {anoSerie && (
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ano / Série</div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{anoSerie}</div>
          </div>
        )}
        {disciplina && (
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Disciplina</div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{disciplina}</div>
          </div>
        )}
      </div>

      {/* Público-alvo obrigatório */}
      {publicoAlvo && (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Público-alvo</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{publicoAlvo}</div>
        </div>
      )}

      {/* Objetivos de Aprendizagem obrigatório */}
      {objetivosAprendizagem && (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Objetivos de Aprendizagem</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{objetivosAprendizagem}</div>
        </div>
      )}

      {/* Badges com quantidades obrigatórias */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 w-full">
          {quantidadeAulas && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
              📖 {quantidadeAulas} aulas
            </Badge>
          )}
          {quantidadeDiagnosticos && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700">
              🔍 {quantidadeDiagnosticos} diagnósticos
            </Badge>
          )}
          {quantidadeAvaliacoes && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-50 border-purple-200 text-purple-700">
              ✅ {quantidadeAvaliacoes} avaliações
            </Badge>
          )}
        </div>

        {/* BNCC / Competências (opcional) */}
        {bnccCompetencias && (
          <div className="w-full">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">BNCC / Competências</div>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-orange-50 border-orange-200 text-orange-700">
              🎯 {bnccCompetencias}
            </Badge>
          </div>
        )}

        {/* Cronograma (opcional) */}
        {cronograma && (
          <div className="w-full">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cronograma</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded italic">{cronograma}</div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ actionPlan, onApprove, isLoading = false }: ActionPlanCardProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  // Estado local para atividades, usado para o handleApproveActivity
  const [activitiesState, setActivitiesState] = useState<ActionPlanActivity[]>(actionPlan as ActionPlanActivity[]);


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

  // Funcao para processar a aprovacao de uma atividade e salvar dados para preenchimento automatico
  const handleApproveActivity = (activity: ActionPlanActivity) => {
      console.log('✅ Aprovando atividade:', activity);

      // Buscar dados completos da atividade
      const fullActivity = activitiesState.find(a => a.id === activity.id);
      if (!fullActivity) {
        console.error('❌ Atividade não encontrada:', activity.id);
        return;
      }

      const approvedActivity: ConstructionActivity = {
        id: activity.id,
        title: activity.personalizedTitle || activity.title,
        description: activity.personalizedDescription || activity.description,
        customFields: fullActivity.customFields || {},
        approved: true,
        isTrilhasEligible: true,
        isBuilt: false,
        builtAt: null
      };

      console.log('📊 Atividade aprovada com dados completos:', approvedActivity);

      // Salvar dados específicos para preenchimento automático
      if (activity.id === 'plano-aula') {
        console.log('📚 Salvando dados específicos do Plano de Aula para preenchimento automático');

        const autoDataKey = `auto_activity_data_${activity.id}`;
        const autoData = {
          formData: {
            title: activity.personalizedTitle || activity.title,
            description: activity.personalizedDescription || activity.description,
            subject: fullActivity.customFields?.['Componente Curricular'] || fullActivity.customFields?.['Disciplina'] || 'Português',
            theme: fullActivity.customFields?.['Tema ou Tópico Central'] || fullActivity.customFields?.['Tema'] || '',
            schoolYear: fullActivity.customFields?.['Ano/Série Escolar'] || fullActivity.customFields?.['Ano de Escolaridade'] || '',
            timeLimit: fullActivity.customFields?.['Carga Horária'] || fullActivity.customFields?.['Tempo Limite'] || '',
            competencies: fullActivity.customFields?.['Habilidades BNCC'] || fullActivity.customFields?.['Competências'] || '',
            objectives: fullActivity.customFields?.['Objetivo Geral'] || fullActivity.customFields?.['Objetivos'] || '',
            materials: fullActivity.customFields?.['Materiais/Recursos'] || fullActivity.customFields?.['Materiais'] || '',
            context: fullActivity.customFields?.['Perfil da Turma'] || fullActivity.customFields?.['Contexto'] || '',
            difficultyLevel: fullActivity.customFields?.['Tipo de Aula'] || '',
            evaluation: fullActivity.customFields?.['Observações do Professor'] || fullActivity.customFields?.['Observações'] || ''
          },
          customFields: fullActivity.customFields || {},
          originalActivity: fullActivity,
          actionPlanActivity: activity,
          activityType: 'plano-aula',
          timestamp: Date.now()
        };

        localStorage.setItem(autoDataKey, JSON.stringify(autoData));
        console.log('💾 Dados salvos para preenchimento automático:', autoData);
      }

      // Salvar no localStorage
      const existingActivities = JSON.parse(localStorage.getItem('approvedActivities') || '[]');
      const updatedActivities = [...existingActivities.filter((a: any) => a.id !== activity.id), approvedActivity];
      localStorage.setItem('approvedActivities', JSON.stringify(updatedActivities));

      // Atualizar estado local
      onApprove(approvedActivity);

      // Remover da lista de atividades pendentes
      setActivitiesState(prev => prev.filter(a => a.id !== activity.id));

      toast({
        title: "Atividade aprovada!",
        description: `${approvedActivity.title} foi adicionada à grade de construção.`,
      });
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

      {/* Lista de Atividades */}
      <div className="space-y-3 mb-8 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}>
        {activitiesState.length === 0 ? (
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
          activitiesState.map((item, index) => {
            const Icon = getIconByActivityId(item.id);


            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50"
                onClick={() => {
                  handleItemToggle(item.id);
                  // Chama handleApproveActivity quando o item é clicado para aprovação
                  handleApproveActivity(item);
                }}
                style={{ minHeight: '120px' }}
              >
                {isActivityEligibleForTrilhas(item.id) && (
                    <div className="absolute top-4 right-4 z-20">
                      <TrilhasBadge />
                    </div>
                  )}
                <div className="flex items-start gap-4">
                  {/* Checkbox customizado */}
                  {/* Conteúdo da atividade */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Ícone animado da atividade */}
                      <div
                        className={`icon-container ${selectedItems.has(item.id) ? 'active' : ''}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          minHeight: '40px',
                          borderRadius: '14px',
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
                            ? '0 6px 12px rgba(255, 110, 6, 0.3)'
                            : 'none',
                          transform: selectedItems.has(item.id) ? 'scale(1.05)' : 'scale(1)'
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
                            width: '20px',
                            height: '20px',
                            background: 'radial-gradient(circle, rgba(255, 110, 6, 0.5), transparent)',
                            borderRadius: '50%',
                            transform: selectedItems.has(item.id)
                              ? 'translate(-50%, -50%) scale(2.2)'
                              : 'translate(-50%, -50%) scale(0)',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </div>

                      {/* Título da atividade */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 text-sm">
                      {item.description}
                    </p>

                    {/* Custom fields como badges - específico para cada tipo de atividade */}
                    {item.customFields && Object.keys(item.customFields).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.id === 'plano-aula' ? (
                          renderPlanoAulaFields(item.customFields)
                        ) : item.id === 'sequencia-didatica' ? (
                          renderSequenciaDidaticaFields(item.customFields)
                        ) : (
                          Object.entries(item.customFields).map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs px-2 py-1"
                            >
                              {key}: {String(value).substring(0, 30)}{String(value).length > 30 ? '...' : ''}
                            </Badge>
                          ))
                        )}
                      </div>
                    )}

                    {/* ID da atividade (para debug) */}
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                        ID: {item.id}
                      </span>
                    </div>
                  </div>

                  {/* Indicador visual de seleção */}

                </div>

                {/* Borda animada para item selecionado */}

              </motion.div>
            )
          })
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