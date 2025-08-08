import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Eye, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';

interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

// Função para obter ícone baseado no tipo de atividade
const getActivityIcon = (activityId: string) => {
  if (activityId.includes('lista-exercicios')) return BookOpen;
  if (activityId.includes('plano-aula')) return GraduationCap;
  if (activityId.includes('prova')) return FileText;
  if (activityId.includes('jogo')) return GamepadIcon;
  if (activityId.includes('apresentacao')) return Eye;
  if (activityId.includes('redacao')) return PenTool;
  if (activityId.includes('matematica')) return Calculator;
  if (activityId.includes('ciencias')) return Beaker;
  return GraduationCap; // ícone padrão
};

export const ActivityViewModal: React.FC<ActivityViewModalProps> = ({
  isOpen,
  activity,
  onClose
}) => {
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Carregar conteúdo construído quando o modal abrir
  useEffect(() => {
    if (activity && isOpen) {
      console.log(`🔍 [ActivityViewModal] Carregando conteúdo para atividade: ${activity.id}`);
      console.log(`📊 Dados da atividade:`, activity);

      // Verificar se a atividade foi construída
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedContent = localStorage.getItem(`activity_${activity.id}`);

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        activityId: activity.id
      });

      if (constructedActivities[activity.id]?.generatedContent) {
        console.log(`✅ Conteúdo construído encontrado no cache para: ${activity.id}`);
        const content = constructedActivities[activity.id].generatedContent;
        console.log(`📄 Estrutura do conteúdo do cache:`, content);
        setGeneratedContent(content);
        setIsContentLoaded(true);
      } else if (savedContent) {
        console.log(`✅ Conteúdo salvo encontrado para: ${activity.id}`);
        try {
          const parsedContent = JSON.parse(savedContent);
          console.log(`📄 Estrutura do conteúdo salvo:`, parsedContent);
          setGeneratedContent(parsedContent);
          setIsContentLoaded(true);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo salvo:', error);
          console.error('📄 Conteúdo que causou erro:', savedContent);
          setGeneratedContent(null);
          setIsContentLoaded(false);
        }
      } else {
        console.log(`⚠️ Nenhum conteúdo construído encontrado para: ${activity.id}`);
        setGeneratedContent(null);
        setIsContentLoaded(false);
      }
    }
  }, [activity, isOpen]);

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      toast({
        title: "Conteúdo copiado!",
        description: "O conteúdo da atividade foi copiado para a área de transferência.",
      });
    }
  };

  const handleExportPDF = () => {
    // Lógica para exportar PDF será implementada futuramente
    console.log('Exportar PDF em desenvolvimento');
    toast({
      title: "Exportar PDF",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  // Processar dados específicos para lista de exercícios
  const processExerciseListData = (activity: ConstructionActivity, generatedContent?: any) => {
    console.log('🔄 [ActivityViewModal] Processando dados da lista de exercícios:', { activity, generatedContent });

    if (generatedContent && generatedContent.isGeneratedByAI) {
      console.log('✅ Usando conteúdo gerado pela IA');
      try {
        // Extrair questões de diferentes formatos possíveis
        let questoesExtraidas = [];

        if (generatedContent.questoes && Array.isArray(generatedContent.questoes)) {
          questoesExtraidas = generatedContent.questoes;
        } else if (generatedContent.questions && Array.isArray(generatedContent.questions)) {
          questoesExtraidas = generatedContent.questions;
        } else if (generatedContent.content && generatedContent.content.questoes) {
          questoesExtraidas = generatedContent.content.questoes;
        } else if (generatedContent.content && generatedContent.content.questions) {
          questoesExtraidas = generatedContent.content.questions;
        }

        console.log(`📝 Questões extraídas: ${questoesExtraidas.length}`);

        const processedData = {
          titulo: generatedContent.titulo || activity.title || 'Lista de Exercícios',
          disciplina: generatedContent.disciplina || 'Disciplina não especificada',
          tema: generatedContent.tema || 'Tema não especificado',
          tipoQuestoes: generatedContent.tipoQuestoes || 'multipla-escolha',
          numeroQuestoes: questoesExtraidas.length || 5,
          dificuldade: generatedContent.dificuldade || 'medio',
          objetivos: generatedContent.objetivos || '',
          conteudoPrograma: generatedContent.conteudoPrograma || '',
          observacoes: generatedContent.observacoes || '',
          questoes: questoesExtraidas,
          isGeneratedByAI: true,
          generatedAt: generatedContent.generatedAt
        };

        console.log('📊 Dados processados da IA:', processedData);
        return processedData;
      } catch (error) {
        console.error('❌ Erro ao processar conteúdo da IA:', error);
      }
    }

    console.log('⚠️ Usando dados de fallback (sem conteúdo da IA)');
    return {
      titulo: activity.title || 'Lista de Exercícios',
      disciplina: 'Disciplina não especificada',
      tema: 'Tema não especificado',
      tipoQuestoes: 'multipla-escolha',
      numeroQuestoes: 5,
      dificuldade: 'medio',
      objetivos: '',
      conteudoPrograma: '',
      observacoes: '',
      questoes: [],
      isGeneratedByAI: false
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-7xl w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const ActivityIcon = getActivityIcon(activity?.id || '');
                  return <ActivityIcon className="w-6 h-6" />;
                })()}
                <div>
                  <h2 className="text-xl font-bold">Visualizar Atividade - {activity?.title}</h2>
                  <p className="text-orange-100 text-sm">
                    {activity?.isBuilt ? 'Atividade construída e pronta para uso' : 'Atividade ainda não foi construída'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activity?.isBuilt && (
                  <Badge className="bg-green-500 text-white">
                    Construída
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
            <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
              {isContentLoaded && generatedContent ? (
                <>
                  {/* Renderização específica para Plano de Aula */}
                  {activity?.id === 'plano-aula' ? (
                    <PlanoAulaPreview 
                      data={generatedContent}
                      activityData={activity}
                    />
                  ) : activity?.id === 'lista-exercicios' ? (
                    <ExerciseListPreview 
                      data={processExerciseListData(activity, generatedContent)}
                      content={generatedContent}
                      activityData={activity}
                    />
                  ) : (
                    <ActivityPreview 
                      content={generatedContent}
                      activityData={activity}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {activity?.isBuilt ? 'Conteúdo não encontrado' : 'Atividade não construída'}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    {activity?.isBuilt 
                      ? 'O conteúdo desta atividade não pôde ser carregado.'
                      : 'Esta atividade ainda não foi construída. Clique em "Editar" para construí-la.'
                    }
                  </p>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
            {generatedContent && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyContent}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" /> 
                  Copiar Conteúdo
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" /> 
                  Exportar PDF
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityViewModal;