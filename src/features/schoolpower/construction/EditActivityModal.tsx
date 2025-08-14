import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ConstructionActivity } from './types';
import { ActivityFormData } from './types/ActivityTypes';
import { useGenerateActivity } from './hooks/useGenerateActivity';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import { CheckCircle2 } from 'lucide-react';

// Função para processar dados da lista de exercícios
const processExerciseListData = (formData: ActivityFormData, generatedContent: any) => {
  return {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    schoolYear: formData.schoolYear,
    numberOfQuestions: formData.numberOfQuestions,
    difficultyLevel: formData.difficultyLevel,
    questionModel: formData.questionModel,
    sources: formData.sources,
    objectives: formData.objectives,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    timeLimit: formData.timeLimit,
    context: formData.context,
    questions: generatedContent?.questions || [],
    ...generatedContent
  };
};

interface EditActivityModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
  onSave: (activityData: any) => void;
  onUpdateActivity?: (activity: any) => Promise<void>;
}

// Função para obter ícone baseado no tipo de atividade
const getActivityIcon = (activityId: string) => {
  if (activityId.includes('lista-exercicios')) return BookOpen;
  if (activityId.includes('prova')) return FileText;
  if (activityId.includes('jogo')) return GamepadIcon;
  if (activityId.includes('apresentacao')) return Play;
  if (activityId.includes('redacao')) return PenTool;
  if (activityId.includes('matematica')) return Calculator;
  if (activityId.includes('ciencias')) return Beaker;
  return GraduationCap; // ícone padrão
};

/**
 * Modal de Edição de Atividades com Agente Interno de Execução
 *
 * Este componente inclui um agente automático interno que:
 * - Detecta quando todos os campos foram preenchidos pela IA
 * - Aciona automaticamente o botão "Construir Atividade"
 * - Fecha o modal após a construção (quando apropriado)
 * - Mantém toda a funcionalidade manual original intacta
 */
const EditActivityModal = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onUpdateActivity
}: EditActivityModalProps) => {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<'editar' | 'preview'>('editar');

  // Estados do formulário
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    subject: activity?.customFields?.disciplina || '',
    theme: activity?.customFields?.tema || activity?.personalizedTitle || activity?.title || '',
    schoolYear: activity?.customFields?.anoEscolaridade || '',
    numberOfQuestions: activity?.customFields?.nivelDificuldade?.toLowerCase() || 'medium',
    difficultyLevel: activity?.customFields?.tempoLimite || '',
    questionModel: '',
    sources: '',
    objectives: activity?.description || activity?.personalizedDescription || '',
    materials: activity?.customFields?.fontes || '',
    instructions: activity?.customFields?.contextoAplicacao || '',
    evaluation: activity?.customFields?.modeloQuestoes || '',
    timeLimit: '',
    context: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    // Campos específicos para sequencia-didatica
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: ''
  });

  // Estado para conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Estado para controle de construção da atividade
  const [buildingStatus, setBuildingStatus] = useState({
    isBuilding: false,
    progress: 0,
    currentStep: ''
  });

  // Estado para uso interno da função generateActivityContent (não exposta no hook)
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [builtContent, setBuiltContent] = useState<any>(null); // Adicionado para uso local

  const { toast } = useToast();

  // Hook para geração de atividades
  const {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating,
    // error is now managed locally, so it can be removed from here if needed.
  } = useGenerateActivity({
    activityId: activity?.id || '',
    activityType: activity?.id || ''
  });

  // Função placeholder para gerar conteúdo (deve ser implementada ou vir de um hook)
  // Substitua por uma chamada real à API ou lógica de geração
  const generateActivityContent = async (type: string, data: any) => {
    console.log(`Simulando geração de conteúdo para tipo: ${type} com dados:`, data);
    // Simulação de retorno bem-sucedido
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula latência da API
    if (type === 'plano-aula') {
      return {
        success: true,
        data: {
          ...data, // Usa os dados do formulário como base
          title: data.title || "Plano de Aula Exemplo",
          description: data.description || "Descrição do plano de aula...",
          content: {
            // Simula conteúdo gerado específico para plano de aula
            objetivos: data.objectives,
            materiais: data.materials,
            avaliacao: data.evaluation,
            tempoEstimado: data.timeLimit,
            componenteCurricular: data.subject,
            tema: data.theme,
            anoSerie: data.schoolYear,
            habilidadesBNCC: data.competencies,
            perfilTurma: data.context,
            tipoAula: data.difficultyLevel,
            observacoes: data.evaluation,
          },
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'lista-exercicios') {
      return {
        success: true,
        data: {
          ...data,
          title: data.title || "Lista de Exercícios Exemplo",
          description: data.description || "Descrição da lista de exercícios...",
          questoes: [
            { id: 'q1', enunciado: 'Questão 1?', resposta: 'A', options: ['A', 'B', 'C'], type: 'multipla-escolha' },
            { id: 'q2', enunciado: 'Questão 2?', resposta: 'Verdadeiro', type: 'verdadeiro-falso' },
          ],
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    } else if (type === 'sequencia-didatica') {
      return {
        success: true,
        data: {
          ...data,
          title: data.tituloTemaAssunto || "Sequência Didática Exemplo",
          description: data.objetivosAprendizagem || "Descrição da sequência didática...",
          content: {
            tituloTemaAssunto: data.tituloTemaAssunto,
            anoSerie: data.anoSerie,
            disciplina: data.disciplina,
            bnccCompetencias: data.bnccCompetencias,
            publicoAlvo: data.publicoAlvo,
            objetivosAprendizagem: data.objetivosAprendizagem,
            quantidadeAulas: data.quantidadeAulas,
            quantidadeDiagnosticos: data.quantidadeDiagnosticos,
            quantidadeAvaliacoes: data.quantidadeAvaliacoes,
            cronograma: data.cronograma,
            // Adicionar campos que podem ter sido preenchidos no formData geral
            subject: data.subject,
            theme: data.theme,
            schoolYear: data.schoolYear,
            competencies: data.competencies,
            objectives: data.objectives,
            materials: data.materials,
            instructions: data.instructions,
            evaluation: data.evaluation,
            timeLimit: data.timeLimit,
            context: data.context,
          },
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
        }
      };
    }
    // Simulação de retorno genérico
    return {
      success: true,
      data: {
        ...data,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
      }
    };
  };

  // Regenerar conteúdo específico para lista de exercícios
  const handleRegenerateContent = async () => {
    if (activity?.id === 'lista-exercicios') {
      try {
        const newContent = await generateActivity(formData); // Assumindo que generateActivity pode ser usado aqui
        setGeneratedContent(newContent);
      } catch (error) {
        console.error('Erro ao regenerar conteúdo:', error);
        toast({
          title: "Erro ao regenerar",
          description: "Não foi possível regenerar o conteúdo. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Carregar conteúdo construído quando o modal abrir
  useEffect(() => {
    if (activity && isOpen) {
      console.log(`🔍 Verificando conteúdo construído para atividade: ${activity.id}`);

      // Verificar se a atividade foi construída automaticamente
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedContent = localStorage.getItem(`activity_${activity.id}`);
      const planoAulaSavedContent = localStorage.getItem(`constructed_plano-aula_${activity.id}`); // Chave específica para plano-aula
      const sequenciaDidaticaSavedContent = localStorage.getItem(`constructed_sequencia-didatica_${activity.id}`); // Chave específica para sequencia-didatica

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        hasPlanoAulaSavedContent: !!planoAulaSavedContent,
        hasSequenciaDidaticaSavedContent: !!sequenciaDidaticaSavedContent,
        activityId: activity.id
      });

      // Priorizar o conteúdo específico mais recente
      let contentToLoad = null;
      if (activity.id === 'sequencia-didatica' && sequenciaDidaticaSavedContent) {
        try {
          contentToLoad = JSON.parse(sequenciaDidaticaSavedContent);
          console.log(`✅ Conteúdo específico da Sequência Didática encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico da Sequência Didática:', error);
          console.error('📄 Conteúdo que causou erro:', sequenciaDidaticaSavedContent);
        }
      } else if (activity.id === 'plano-aula' && planoAulaSavedContent) {
        try {
          contentToLoad = JSON.parse(planoAulaSavedContent);
          console.log(`✅ Conteúdo específico do plano-aula encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do plano-aula:', error);
          console.error('📄 Conteúdo que causou erro:', planoAulaSavedContent);
        }
      } else if (constructedActivities[activity.id]?.generatedContent) {
        console.log(`✅ Conteúdo construído encontrado no cache para: ${activity.id}`);
        contentToLoad = constructedActivities[activity.id].generatedContent;
        console.log(`📄 Estrutura do conteúdo do cache:`, {
          hasQuestions: !!contentToLoad?.questions,
          hasContent: !!contentToLoad?.content,
          contentType: typeof contentToLoad,
          keys: contentToLoad ? Object.keys(contentToLoad) : []
        });
      } else if (savedContent) {
        console.log(`✅ Conteúdo salvo encontrado para: ${activity.id}`);
        try {
          contentToLoad = JSON.parse(savedContent);
          console.log(`📄 Estrutura do conteúdo salvo:`, {
            hasQuestions: !!contentToLoad?.questions,
            hasContent: !!contentToLoad?.content,
            contentType: typeof contentToLoad,
            keys: contentToLoad ? Object.keys(contentToLoad) : []
          });
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo salvo:', error);
          console.error('📄 Conteúdo que causou erro:', savedContent);
          contentToLoad = null;
        }
      }

      setGeneratedContent(contentToLoad);
      setIsContentLoaded(!!contentToLoad);
    }
  }, [activity, isOpen]);

  useEffect(() => {
    const loadActivityData = async () => {
      if (activity && isOpen) {
        console.log('🔄 Modal aberto, carregando dados para atividade:', activity.id);
        console.log('📊 Dados completos da atividade recebida:', activity);

        // Verificar se há dados automáticos preenchidos
        const autoDataKey = `auto_activity_data_${activity.id}`;
        const autoData = localStorage.getItem(autoDataKey);

        if (autoData) {
          try {
            const {
              formData: autoFormData,
              customFields: autoCustomFields,
              originalActivity,
              actionPlanActivity
            } = JSON.parse(autoData);

            console.log('📋 Carregando dados automáticos para:', activity.title);
            console.log('🔧 Campos personalizados encontrados:', autoCustomFields);
            console.log('📊 Dados originais:', originalActivity);
            console.log('📊 Action plan activity:', actionPlanActivity);

            // Garantir que todos os dados disponíveis sejam utilizados
            const consolidatedData = {
              ...activity,
              ...originalActivity,
              ...actionPlanActivity
            };

            // Consolidar customFields de todas as fontes
            const consolidatedCustomFields = {
              ...activity?.customFields,
              ...autoCustomFields,
              ...originalActivity?.customFields,
              ...actionPlanActivity?.customFields
            } || {};

            // Garantir que customFields existe para evitar erros
            const customFields = consolidatedCustomFields || {};

            console.log('🔧 Dados consolidados para modal:', {
              activity,
              autoData,
              consolidatedCustomFields,
              customFields
            });

            console.log('🔀 Dados consolidados:', consolidatedData);
            console.log('🗂️ Custom fields consolidados:', consolidatedCustomFields);

            // Processamento específico para Plano de Aula
            let enrichedFormData: ActivityFormData;

            if (activity?.id === 'plano-aula') {
              console.log('📚 Processando dados específicos de Plano de Aula');
              console.log('🗂️ Custom fields consolidados para plano-aula:', consolidatedCustomFields);

              // Processar dados do Plano de Aula com mapeamento completo
              enrichedFormData = {
                title: consolidatedData.personalizedTitle || consolidatedData.title || activity.personalizedTitle || activity.title || '',
                description: consolidatedData.personalizedDescription || consolidatedData.description || activity.personalizedDescription || activity.description || '',
                subject: consolidatedCustomFields['Componente Curricular'] ||
                         consolidatedCustomFields['disciplina'] ||
                         consolidatedCustomFields['Disciplina'] ||
                         'Matemática',
                theme: consolidatedCustomFields['Tema ou Tópico Central'] ||
                       consolidatedCustomFields['Tema Central'] ||
                       consolidatedCustomFields['tema'] ||
                       consolidatedCustomFields['Tema'] || '',
                schoolYear: consolidatedCustomFields['Ano/Série Escolar'] ||
                           consolidatedCustomFields['Público-Alvo'] ||
                           consolidatedCustomFields['anoEscolaridade'] ||
                           consolidatedCustomFields['Ano de Escolaridade'] || '',
                numberOfQuestions: '1', // Não aplicável para plano de aula
                difficultyLevel: consolidatedCustomFields['Tipo de Aula'] ||
                                consolidatedCustomFields['Metodologia'] ||
                                consolidatedCustomFields['tipoAula'] || 'Expositiva',
                questionModel: '', // Não aplicável para plano de aula
                sources: consolidatedCustomFields['Fontes'] ||
                        consolidatedCustomFields['Referencias'] ||
                        consolidatedCustomFields['fontes'] || '',
                objectives: consolidatedCustomFields['Objetivo Geral'] ||
                           consolidatedCustomFields['Objetivos de Aprendizagem'] ||
                           consolidatedCustomFields['Objetivo Principal'] ||
                           consolidatedCustomFields['objetivos'] || '',
                materials: consolidatedCustomFields['Materiais/Recursos'] ||
                          consolidatedCustomFields['Recursos'] ||
                          consolidatedCustomFields['Materiais Necessários'] ||
                          consolidatedCustomFields['materiais'] || '',
                instructions: consolidatedCustomFields['Instruções'] ||
                             consolidatedCustomFields['Metodologia'] ||
                             consolidatedCustomFields['instrucoes'] || '',
                evaluation: consolidatedCustomFields['Observações do Professor'] ||
                           consolidatedCustomFields['Observações'] ||
                           consolidatedCustomFields['Avaliação'] ||
                           consolidatedCustomFields['observacoes'] || '',
                timeLimit: consolidatedCustomFields['Carga Horária'] ||
                          consolidatedCustomFields['Tempo Estimado'] ||
                          consolidatedCustomFields['tempoLimite'] || '',
                context: consolidatedCustomFields['Perfil da Turma'] ||
                        consolidatedCustomFields['Contexto'] ||
                        consolidatedCustomFields['contexto'] || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: consolidatedCustomFields['Habilidades BNCC'] ||
                             consolidatedCustomFields['Competências'] ||
                             consolidatedCustomFields['competencias'] || '',
                readingStrategies: '',
                visualResources: '',
                practicalActivities: '',
                wordsIncluded: '',
                gridFormat: '',
                providedHints: '',
                vocabularyContext: '',
                language: '',
                associatedExercises: '',
                knowledgeArea: '',
                complexityLevel: '',
                // Campos específicos para sequencia-didatica
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || '',
                disciplina: consolidatedCustomFields['Disciplina'] || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || '',
                cronograma: consolidatedCustomFields['Cronograma'] || ''
              };

              console.log('✅ Dados do Plano de Aula processados:', enrichedFormData);
              console.log('📝 Campos mapeados:');
              console.log('  - Título:', enrichedFormData.title);
              console.log('  - Descrição:', enrichedFormData.description);
              console.log('  - Tema:', enrichedFormData.theme);
              console.log('  - Componente Curricular:', enrichedFormData.subject);
              console.log('  - Ano/Série:', enrichedFormData.schoolYear);
              console.log('  - Objetivos:', enrichedFormData.objectives);
              console.log('  - Materiais:', enrichedFormData.materials);
              console.log('  - Carga Horária:', enrichedFormData.timeLimit);
              console.log('  - Habilidades BNCC:', enrichedFormData.competencies);
              console.log('  - Perfil da Turma:', enrichedFormData.context);
              console.log('  - Tipo de Aula:', enrichedFormData.difficultyLevel);
              console.log('  - Observações:', enrichedFormData.evaluation);
            } else if (activity?.id === 'sequencia-didatica') {
              console.log('📚 Processando dados específicos de Sequência Didática');
              console.log('🗂️ Custom fields consolidados para sequencia-didatica:', consolidatedCustomFields);

              enrichedFormData = {
                ...formData, // Começa com os dados base do formulário
                title: consolidatedData.title || autoFormData.title || activity.title || '',
                description: consolidatedData.description || autoFormData.description || activity.description || '',
                // Mapeamento dos campos específicos da Sequência Didática
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || activity?.customFields?.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || '',
                // Mapeamento dos campos gerais que podem ser sobrescritos
                subject: consolidatedCustomFields['Disciplina'] || autoFormData.subject || activity?.customFields?.disciplina || 'Português',
                theme: consolidatedCustomFields['Tema'] || autoFormData.theme || activity?.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || autoFormData.schoolYear || activity?.schoolYear || '',
                competencies: consolidatedCustomFields['Competências'] || autoFormData.competencies || '',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || activity?.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || autoFormData.materials || activity?.materials || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || autoFormData.context || '',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || '',
              };

              console.log('✅ Dados da Sequência Didática processados:', enrichedFormData);

            } else {
              // Mapear todos os campos personalizados para os campos do formulário com prioridade correta
              enrichedFormData = {
                title: consolidatedData.title || autoFormData.title || '',
                description: consolidatedData.description || autoFormData.description || '',
                subject: consolidatedCustomFields['Disciplina'] || consolidatedCustomFields['disciplina'] || autoFormData.subject || 'Português',
                theme: consolidatedCustomFields['Tema'] || consolidatedCustomFields['tema'] || consolidatedCustomFields['Tema das Palavras'] || consolidatedCustomFields['Tema do Vocabulário'] || autoFormData.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || consolidatedCustomFields['anoEscolaridade'] || consolidatedCustomFields['ano'] || autoFormData.schoolYear || '',
                numberOfQuestions: consolidatedCustomFields['Quantidade de Questões'] || consolidatedCustomFields['quantidadeQuestoes'] || consolidatedCustomFields['Quantidade de Palavras'] || autoFormData.numberOfQuestions || '10',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || consolidatedCustomFields['nivelDificuldade'] || consolidatedCustomFields['dificuldade'] || autoFormData.difficultyLevel || 'Médio',
                questionModel: consolidatedCustomFields['Modelo de Questões'] || consolidatedCustomFields['modeloQuestoes'] || consolidatedCustomFields['Tipo de Avaliação'] || autoFormData.questionModel || '',
                sources: consolidatedCustomFields['Fontes'] || consolidatedCustomFields['fontes'] || consolidatedCustomFields['Referencias'] || autoFormData.sources || '',
                objectives: consolidatedCustomFields['Objetivos'] || consolidatedCustomFields['objetivos'] || consolidatedCustomFields['Competências Trabalhadas'] || autoFormData.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || consolidatedCustomFields['materiais'] || consolidatedCustomFields['Recursos Visuais'] || autoFormData.materials || '',
                instructions: consolidatedCustomFields['Instruções'] || consolidatedCustomFields['instrucoes'] || consolidatedCustomFields['Estratégias de Leitura'] || consolidatedCustomFields['Atividades Práticas'] || autoFormData.instructions || '',
                evaluation: consolidatedCustomFields['Critérios de Correção'] || consolidatedCustomFields['Critérios de Avaliação'] || consolidatedCustomFields['criteriosAvaliacao'] || autoFormData.evaluation || '',
                // Campos adicionais específicos
                timeLimit: consolidatedCustomFields['Tempo de Prova'] || consolidatedCustomFields['Tempo Limite'] || consolidatedCustomFields['tempoLimite'] || autoFormData.timeLimit || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || consolidatedCustomFields['Contexto de Uso'] || consolidatedCustomFields['contexto'] || autoFormData.context || '',
                textType: consolidatedCustomFields['Tipo de Texto'] || consolidatedCustomFields['tipoTexto'] || '',
                textGenre: consolidatedCustomFields['Gênero Textual'] || consolidatedCustomFields['generoTextual'] || '',
                textLength: consolidatedCustomFields['Extensão do Texto'] || consolidatedCustomFields['extensaoTexto'] || '',
                associatedQuestions: consolidatedCustomFields['Questões Associadas'] || consolidatedCustomFields['questoesAssociadas'] || '',
                competencies: consolidatedCustomFields['Competências Trabalhadas'] || consolidatedCustomFields['competencias'] || '',
                readingStrategies: consolidatedCustomFields['Estratégias de Leitura'] || consolidatedCustomFields['estrategiasLeitura'] || '',
                visualResources: consolidatedCustomFields['Recursos Visuais'] || consolidatedCustomFields['recursosVisuais'] || '',
                practicalActivities: consolidatedCustomFields['Atividades Práticas'] || consolidatedCustomFields['atividadesPraticas'] || '',
                wordsIncluded: consolidatedCustomFields['Palavras Incluídas'] || consolidatedCustomFields['palavrasIncluidas'] || '',
                gridFormat: consolidatedCustomFields['Formato da Grade'] || consolidatedCustomFields['formatoGrade'] || '',
                providedHints: consolidatedCustomFields['Dicas Fornecidas'] || consolidatedCustomFields['dicasFornecidas'] || '',
                vocabularyContext: consolidatedCustomFields['Contexto de Uso'] || consolidatedCustomFields['contextoUso'] || '',
                language: consolidatedCustomFields['Idioma'] || consolidatedCustomFields['idioma'] || '',
                associatedExercises: consolidatedCustomFields['Exercícios Associados'] || consolidatedCustomFields['exerciciosAssociados'] || '',
                knowledgeArea: consolidatedCustomFields['Área de Conhecimento'] || consolidatedCustomFields['areaConhecimento'] || '',
                complexityLevel: consolidatedCustomFields['Nível de Complexidade'] || consolidatedCustomFields['nivelComplexidade'] || '',
                // Campos específicos para sequencia-didatica
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || ''
              };
            }

            console.log('✅ Formulário será preenchido com:', enrichedFormData);
            setFormData(enrichedFormData);

            // Marcar como preenchido automaticamente pela IA (especialmente para Plano de Aula)
            if (onUpdateActivity) {
              const activityWithAutoFlag = {
                ...activity,
                preenchidoAutomaticamente: true,
                dataSource: activity?.id === 'plano-aula' ? 'action-plan-plano-aula' : 'action-plan-generic'
              };
              onUpdateActivity(activityWithAutoFlag);
              console.log('🏷️ Atividade marcada como preenchida automaticamente');

              if (activity?.id === 'plano-aula') {
                console.log('📚 Plano de Aula configurado com dados específicos do Action Plan');
              }
            }

            // Aguardar um momento antes de limpar para garantir que o estado foi atualizado
            setTimeout(() => {
              localStorage.removeItem(autoDataKey);
              console.log('🗑️ Dados automáticos limpos do localStorage');
            }, 1000);

          } catch (error) {
            console.error('❌ Erro ao carregar dados automáticos:', error);
            console.error('📊 Dados que causaram erro:', autoData);

            // Usar dados da atividade mesmo com erro
            const fallbackData = {
              title: activity.title || activity.originalData?.title || '',
              description: activity.description || activity.originalData?.description || '',
              subject: activity.originalData?.customFields?.['Disciplina'] || 'Português',
              theme: activity.originalData?.customFields?.['Tema'] || '',
              schoolYear: activity.originalData?.customFields?.['Ano de Escolaridade'] || '',
              numberOfQuestions: activity.originalData?.customFields?.['Quantidade de Questões'] || '10',
              difficultyLevel: activity.originalData?.customFields?.['Nível de Dificuldade'] || 'Médio',
              questionModel: activity.originalData?.customFields?.['Modelo de Questões'] || '',
              sources: activity.originalData?.customFields?.['Fontes'] || '',
              objectives: '',
              materials: '',
              instructions: '',
              evaluation: '',
              timeLimit: '',
              context: '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              // Campos específicos para sequencia-didatica
              tituloTemaAssunto: '',
              anoSerie: '',
              disciplina: '',
              bnccCompetencias: '',
              publicoAlvo: '',
              objetivosAprendizagem: '',
              quantidadeAulas: '',
              quantidadeDiagnosticos: '',
              quantidadeAvaliacoes: '',
              cronograma: ''
            };

            setFormData(fallbackData);
            console.log('🔧 Usando dados de fallback:', fallbackData);
          }
        } else {
          console.log('⚠️ Nenhum dado automático encontrado, usando dados da atividade');

          // Carregar dados diretamente da atividade
          const activityData = activity.originalData || activity;
          const customFields = activityData.customFields || {};

          console.log('📊 Dados da atividade para preenchimento:', activityData);
          console.log('🗂️ Custom fields disponíveis:', customFields);

          let directFormData: ActivityFormData;

          if (activity?.id === 'plano-aula') {
            console.log('📚 Processando dados diretos de Plano de Aula');

            directFormData = {
              title: activityData.personalizedTitle || activityData.title || '',
              description: activityData.personalizedDescription || activityData.description || '',
              subject: customFields['Componente Curricular'] ||
                       customFields['disciplina'] ||
                       customFields['Disciplina'] ||
                       'Matemática',
              theme: customFields['Tema ou Tópico Central'] ||
                     customFields['Tema Central'] ||
                     customFields['tema'] ||
                     customFields['Tema'] || '',
              schoolYear: customFields['Ano/Série Escolar'] ||
                         customFields['Público-Alvo'] ||
                         customFields['anoEscolaridade'] ||
                         customFields['Ano de Escolaridade'] || '',
              numberOfQuestions: '1',
              difficultyLevel: customFields['Tipo de Aula'] ||
                              customFields['Metodologia'] ||
                              customFields['tipoAula'] || 'Expositiva',
              questionModel: '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivo Geral'] ||
                         customFields['Objetivos de Aprendizagem'] ||
                         customFields['Objetivo Principal'] ||
                         customFields['objetivos'] || '',
              materials: customFields['Materiais/Recursos'] ||
                        customFields['Recursos'] ||
                        customFields['Materiais Necessários'] ||
                        customFields['materiais'] || '',
              instructions: customFields['Instruções'] ||
                           customFields['Metodologia'] ||
                           customFields['instrucoes'] || '',
              evaluation: customFields['Observações do Professor'] ||
                         customFields['Observações'] ||
                         customFields['Avaliação'] ||
                         customFields['observacoes'] || '',
              timeLimit: customFields['Carga Horária'] ||
                        customFields['Tempo Estimado'] ||
                        customFields['tempoLimite'] || '',
              context: customFields['Perfil da Turma'] ||
                      customFields['Contexto'] ||
                      customFields['contexto'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: customFields['Habilidades BNCC'] ||
                           customFields['Competências'] ||
                           customFields['competencias'] || '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              // Campos específicos para sequencia-didatica
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || ''
            };

            console.log('📝 Dados diretos processados para plano-aula:', directFormData);
          } else {
            // Para outras atividades
            directFormData = {
              title: activityData.title || '',
              description: activityData.description || '',
              subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
              theme: customFields['Tema'] || customFields['tema'] || '',
              schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '',
              numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || '10',
              difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
              questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
              materials: customFields['Materiais'] || customFields['materiais'] || '',
              instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
              evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || '',
              timeLimit: customFields['Tempo Limite'] || '',
              context: customFields['Contexto de Aplicação'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              // Campos específicos para sequencia-didatica
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || ''
            };
          }

          setFormData(directFormData);
          console.log('📝 Formulário preenchido com dados diretos:', directFormData);
        }
      }
    };

    loadActivityData();
  }, [activity, isOpen, loadSavedContent]); // Adicionado loadSavedContent à dependência do useEffect

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Função para construir a atividade
  const handleBuildActivity = useCallback(async () => {
    if (!activity || isBuilding) return;

    console.log('🚀 Iniciando construção da atividade:', activity.title);
    console.log('📊 Dados do formulário:', formData);

    setIsBuilding(true);
    setError(null);
    setBuildProgress(0);

    try {
      // Simular progresso
      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Determinar tipo da atividade
      const activityType = activity.type || activity.id || activity.categoryId;
      console.log('🎯 Tipo de atividade determinado:', activityType);

      // Usar a API de geração de atividades
      const result = await generateActivityContent(activityType, formData);

      clearInterval(progressTimer);
      setBuildProgress(100);

      console.log('✅ Atividade construída com sucesso:', result);

      // Salvar no localStorage com chaves específicas
      const storageKey = `schoolpower_${activityType}_content`;
      localStorage.setItem(storageKey, JSON.stringify(result));

      // Para sequencia-didatica, salvar com chave específica
      if (activityType === 'sequencia-didatica') {
        const viewStorageKey = `constructed_sequencia-didatica_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result));
        console.log('💾 Dados da sequência didática salvos para visualização:', viewStorageKey);
      }

      // Para plano-aula, também salvar com chave específica para visualização
      if (activityType === 'plano-aula') {
        const viewStorageKey = `constructed_plano-aula_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result));
        console.log('💾 Dados do plano-aula salvos para visualização:', viewStorageKey);
      }

      // Também salvar na lista de atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      // Atualizar estados
      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Atividade construída!",
        description: "Sua atividade foi gerada com sucesso pela IA do Gemini.",
      });

    } catch (error) {
      console.error('❌ Erro na construção:', error);
      setError(`Erro ao construir atividade: ${error.message}`);

      toast({
        title: "Erro na construção",
        description: "Houve um problema ao gerar sua atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  }, [activity, formData, isBuilding, toast]);

  // Função para automação - será chamada externamente
  useEffect(() => {
    const handleAutoBuild = () => {
      if (activity && formData.title && formData.description && !isGenerating) {
        console.log('🤖 Construção automática iniciada para:', activity.title);
        handleBuildActivity();
      }
    };

    // Registrar a função no window para acesso externo
    if (activity) {
      (window as any).autoBuildCurrentActivity = handleAutoBuild;
    }

    return () => {
      delete (window as any).autoBuildCurrentActivity;
    };
  }, [activity, formData, isGenerating, handleBuildActivity]);

  const handleSaveChanges = () => {
    const activityData = {
      ...formData,
      generatedContent
    };
    onSave(activityData);
    onClose();
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
    toast({
      title: "Conteúdo copiado!",
      description: "O conteúdo da pré-visualização foi copiado para a área de transferência.",
    });
  };

  const handleExportPDF = () => {
    // Lógica para exportar PDF será implementada futuramente
    console.log('Exportar PDF em desenvolvimento');
  };

  // Verificar se campos obrigatórios estão preenchidos
  const isFormValid = activity?.id === 'lista-exercicios'
    ? formData.title.trim() &&
      formData.description.trim() &&
      formData.subject.trim() &&
      formData.theme.trim() &&
      formData.schoolYear.trim() &&
      formData.numberOfQuestions.trim() &&
      formData.difficultyLevel.trim() &&
      formData.questionModel.trim()
    : activity?.id === 'plano-aula'
    ? formData.title.trim() &&
      formData.description.trim() &&
      formData.theme.trim() &&
      formData.schoolYear.trim() &&
      formData.subject.trim() &&
      formData.objectives.trim() &&
      formData.materials.trim()
    : activity?.id === 'sequencia-didatica'
    ? formData.tituloTemaAssunto?.trim() &&
      formData.anoSerie?.trim() &&
      formData.disciplina?.trim() &&
      formData.publicoAlvo?.trim() &&
      formData.objetivosAprendizagem?.trim() &&
      formData.quantidadeAulas?.trim() &&
      formData.quantidadeDiagnosticos?.trim() &&
      formData.quantidadeAvaliacoes?.trim()
    : formData.title.trim() &&
      formData.description.trim() &&
      formData.objectives.trim();

  // Converter formData em formato para ActivityPreview
  const getActivityPreviewData = () => {
    return {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficultyLevel,
      timeLimit: '45 minutos',
      instructions: formData.instructions,
      materials: formData.materials ? formData.materials.split('\n').filter(m => m.trim()) : [],
      objective: formData.objectives,
      targetAudience: formData.schoolYear,
      rubric: formData.evaluation,
      questions: []
    };
  };

  const handleSave = async () => {
    if (!activity) return;

    try {
      // Obter customFields a partir dos dados da atividade
      const customFields = activity.customFields || {};

      // Salvar os dados editados
      const updatedActivity = {
        ...activity,
        ...formData, // Inclui todos os campos do formData
        customFields: {
          ...customFields,
          // Mapeamento geral
          'Disciplina': formData.subject,
          'Tema': formData.theme,
          'Ano de Escolaridade': formData.schoolYear,
          'Tempo Limite': formData.timeLimit,
          'Competências': formData.competencies,
          'Objetivos': formData.objectives,
          'Materiais': formData.materials,
          'Contexto': formData.context,
          'Nível de Dificuldade': formData.difficultyLevel,
          'Critérios de Avaliação': formData.evaluation,
          // Mapeamento condicional para lista-exercicios
          ...(activity?.id === 'lista-exercicios' && {
            'Quantidade de Questões': formData.numberOfQuestions,
            'Modelo de Questões': formData.questionModel,
            'Fontes': formData.sources,
            'Instruções': formData.instructions
          }),
          // Mapeamento condicional para sequencia-didatica
          ...(activity?.id === 'sequencia-didatica' && {
            'Título do Tema / Assunto': formData.tituloTemaAssunto,
            'Ano / Série': formData.anoSerie,
            'Disciplina': formData.disciplina, // Sobrescreve o geral se for sequencia-didatica
            'BNCC / Competências': formData.bnccCompetencias,
            'Público-alvo': formData.publicoAlvo,
            'Objetivos de Aprendizagem': formData.objetivosAprendizagem,
            'Quantidade de Aulas': formData.quantidadeAulas,
            'Quantidade de Diagnósticos': formData.quantidadeDiagnosticos,
            'Quantidade de Avaliações': formData.quantidadeAvaliacoes,
            'Cronograma': formData.cronograma
          }),
          // Mapeamento condicional para quadro-interativo
          ...(activity?.id === 'quadro-interativo' && {
            'Disciplina': formData.subject,
            'Ano / Série': formData.schoolYear,
            'Tema ou Assunto da aula': formData.theme,
            'Objetivo de aprendizagem da aula': formData.objectives,
            'Nível de Dificuldade': formData.difficultyLevel,
            'Atividade mostrada': formData.practicalActivities,
          })
        }
      };

      // Chamar a função de atualização passada como prop
      if (onUpdateActivity) {
        await onUpdateActivity(updatedActivity);
      }

      // Salvar no localStorage
      localStorage.setItem(`activity_${activity.id}`, JSON.stringify(updatedActivity));
      localStorage.setItem(`activity_fields_${activity.id}`, JSON.stringify(customFields));

      // Para Sequência Didática, salvar também como atividade construída
      if (activity.categoryId === 'sequencia-didatica' || activity.type === 'sequencia-didatica') {
        const constructedKey = `constructed_sequencia-didatica_${activity.id}`;
        localStorage.setItem(constructedKey, JSON.stringify(updatedActivity));
        console.log('📚 Sequência Didática salva como atividade construída');
      }

      console.log('💾 Dados salvos no localStorage:', {
        activity: updatedActivity,
        fields: customFields
      });

      toast({
        title: "Atividade atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
      });
    }
  };



  // Agente Interno de Execução - Automação da Construção de Atividades
  useEffect(() => {
    if (!activity || !isOpen) return;

    // Obter customFields a partir dos dados da atividade
    const customFields = activity.customFields || {};

    // Verificar se a atividade foi preenchida automaticamente pela IA
    const preenchidoPorIA = activity.preenchidoAutomaticamente === true ||
                           Object.keys(customFields).length > 0;

    // Verificar se todos os campos obrigatórios estão preenchidos
    const todosCamposPreenchidos = activity?.id === 'lista-exercicios'
      ? formData.title.trim() &&
        formData.description.trim() &&
        formData.subject.trim() &&
        formData.theme.trim() &&
        formData.schoolYear.trim() &&
        formData.numberOfQuestions.trim() &&
        formData.difficultyLevel.trim() &&
        formData.questionModel.trim()
      : activity?.id === 'plano-aula'
      ? formData.title.trim() &&
        formData.description.trim() &&
        formData.theme.trim() &&
        formData.schoolYear.trim() &&
        formData.subject.trim() &&
        formData.objectives.trim() &&
        formData.materials.trim()
      : activity?.id === 'sequencia-didatica'
      ? formData.tituloTemaAssunto?.trim() &&
        formData.anoSerie?.trim() &&
        formData.disciplina?.trim() &&
        formData.publicoAlvo?.trim() &&
        formData.objetivosAprendizagem?.trim() &&
        formData.quantidadeAulas?.trim() &&
        formData.quantidadeDiagnosticos?.trim() &&
        formData.quantidadeAvaliacoes?.trim()
      : activity?.id === 'quadro-interativo'
      ? formData.disciplina?.trim() &&
        formData.schoolYear?.trim() &&
        formData.theme?.trim() &&
        formData.objectives?.trim() &&
        formData.difficultyLevel?.trim() &&
        formData.practicalActivities?.trim()
      : formData.title.trim() &&
        formData.description.trim() &&
        formData.objectives.trim();

    // Agente automático: Acionar "Construir Atividade" quando preenchido pela IA
    if (todosCamposPreenchidos && preenchidoPorIA && !activity.isBuilt) {
      console.log('🤖 Agente Interno de Execução: Detectados campos preenchidos pela IA');
      console.log('🎯 Acionando construção automática da atividade...');

      // Aguardar pequeno delay para garantir sincronização
      const timer = setTimeout(() => {
        handleBuildActivity();
        console.log('✅ Atividade construída automaticamente pelo agente interno');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [formData, activity, isOpen, handleBuildActivity]);

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
                  <h2 className="text-xl font-bold">Editar Materiais - {activity?.title}</h2>
                  <p className="text-orange-100 text-sm">Configure os materiais e gere o conteúdo da atividade</p>
                </div>
              </div>

              {/* Mini-seções integradas no cabeçalho */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('editar')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'editar' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium text-sm">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'preview' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">Pré-visualização</span>
                </Button>
              </div>

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

          {/* Content */}
          <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
            {activeTab === 'editar' && (
            <div className="flex gap-6 h-full">
              {/* Formulário (100%) */}
              <div className="flex flex-col space-y-4 overflow-y-auto flex-1 pr-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#FF6B00]" />
                      Informações da Atividade
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sm">Título da Atividade</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange(e as any)}
                          placeholder="Digite o título da atividade"
                          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange(e as any)}
                          placeholder="Descreva a atividade..."
                          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Renderizar campos específicos baseados no tipo de atividade */}
                      {(() => {
                        const activityType = activity?.id; // Usar o ID da atividade para determinar o tipo

                        if (activityType === 'quadro-interativo') {
                          return (
                            <>
                              {/* Campos específicos para Quadro Interativo */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Disciplina / Área de conhecimento *
                                  </Label>
                                  <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Ex: Matemática, Português, História..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="schoolYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ano / Série *
                                  </Label>
                                  <Input
                                    id="schoolYear"
                                    name="schoolYear"
                                    value={formData.schoolYear || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Ex: 6º ano, 7º ano, 8º ano..."
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tema ou Assunto da aula *
                                  </Label>
                                  <Input
                                    id="theme"
                                    name="theme"
                                    value={formData.theme || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Digite o tema central da aula"
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="objectives" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Objetivo de aprendizagem da aula *
                                  </Label>
                                  <Textarea
                                    id="objectives"
                                    name="objectives"
                                    value={formData.objectives || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Descreva o que os alunos devem aprender com esta atividade"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="difficultyLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nível de Dificuldade *
                                  </Label>
                                  <Select
                                    name="difficultyLevel"
                                    value={formData.difficultyLevel || ''}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: value }))}
                                  >
                                    <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
                                      <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">Selecione o nível</SelectItem>
                                      <SelectItem value="Básico">Básico</SelectItem>
                                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                                      <SelectItem value="Avançado">Avançado</SelectItem>
                                      <SelectItem value="Fácil">Fácil</SelectItem>
                                      <SelectItem value="Médio">Médio</SelectItem>
                                      <SelectItem value="Difícil">Difícil</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="practicalActivities" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Atividade mostrada *
                                  </Label>
                                  <Textarea
                                    id="practicalActivities"
                                    name="practicalActivities"
                                    value={formData.practicalActivities || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Descreva as atividades que serão mostradas no quadro interativo (jogos, exercícios, apresentações, etc.)"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </>
                          );
                        }

                        if (activityType === 'sequencia-didatica') {
                          return (
                            <>
                              {/* Campos específicos para Sequência Didática */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="tituloTemaAssunto" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Título do Tema / Assunto *
                                  </Label>
                                  <Input
                                    id="tituloTemaAssunto"
                                    name="tituloTemaAssunto"
                                    value={formData.tituloTemaAssunto || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Digite o título do tema ou assunto"
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="anoSerie" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Ano / Série *
                                    </Label>
                                    <Input
                                      id="anoSerie"
                                      name="anoSerie"
                                      value={formData.anoSerie || ''}
                                      onChange={(e) => handleInputChange(e as any)}
                                      placeholder="Ex: 6º ano"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="disciplina" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Disciplina *
                                    </Label>
                                    <Input
                                      id="disciplina"
                                      name="disciplina"
                                      value={formData.disciplina || ''}
                                      onChange={(e) => handleInputChange(e as any)}
                                      placeholder="Ex: Matemática"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="publicoAlvo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Público-alvo *
                                  </Label>
                                  <Textarea
                                    id="publicoAlvo"
                                    name="publicoAlvo"
                                    value={formData.publicoAlvo || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Descreva o público-alvo da sequência didática"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="objetivosAprendizagem" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Objetivos de Aprendizagem *
                                  </Label>
                                  <Textarea
                                    id="objetivosAprendizagem"
                                    name="objetivosAprendizagem"
                                    value={formData.objetivosAprendizagem || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Liste os objetivos de aprendizagem"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="quantidadeAulas" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Quantidade de Aulas *
                                    </Label>
                                    <Input
                                      id="quantidadeAulas"
                                      name="quantidadeAulas"
                                      value={formData.quantidadeAulas || ''}
                                      onChange={(e) => handleInputChange(e as any)}
                                      placeholder="Ex: 10"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="quantidadeDiagnosticos" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Quantidade de Diagnósticos *
                                    </Label>
                                    <Input
                                      id="quantidadeDiagnosticos"
                                      name="quantidadeDiagnosticos"
                                      value={formData.quantidadeDiagnosticos || ''}
                                      onChange={(e) => handleInputChange(e as any)}
                                      placeholder="Ex: 2"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="quantidadeAvaliacoes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Quantidade de Avaliações *
                                    </Label>
                                    <Input
                                      id="quantidadeAvaliacoes"
                                      name="quantidadeAvaliacoes"
                                      value={formData.quantidadeAvaliacoes || ''}
                                      onChange={(e) => handleInputChange(e as any)}
                                      placeholder="Ex: 3"
                                      className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="bnccCompetencias" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    BNCC / Competências
                                  </Label>
                                  <Textarea
                                    id="bnccCompetencias"
                                    name="bnccCompetencias"
                                    value={formData.bnccCompetencias || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Competências e habilidades da BNCC relacionadas"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="cronograma" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cronograma
                                  </Label>
                                  <Textarea
                                    id="cronograma"
                                    name="cronograma"
                                    value={formData.cronograma || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    placeholder="Cronograma detalhado da sequência didática"
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </>
                          );
                        }

                        // Campos padrão para outras atividades
                        return (
                          <>
                            <div>
                              <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
                              <Textarea
                                id="objectives"
                                value={formData.objectives}
                                onChange={(e) => handleInputChange(e as any)}
                                placeholder="Descreva os objetivos que os alunos devem alcançar..."
                                className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
                              <Textarea
                                id="materials"
                                value={formData.materials}
                                onChange={(e) => handleInputChange(e as any)}
                                placeholder="Liste os materiais necessários (um por linha)..."
                                className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
                              <Textarea
                                id="instructions"
                                value={formData.instructions}
                                onChange={(e) => handleInputChange(e as any)}
                                placeholder="Descreva como a atividade deve ser executada..."
                                className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
                              <Textarea
                                id="evaluation"
                                value={formData.evaluation}
                                onChange={(e) => handleInputChange(e as any)}
                                placeholder="Como a atividade será avaliada..."
                                className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  id="build-activity-button"
                  data-testid="build-activity-button"
                  onClick={handleBuildActivity}
                  disabled={buildingStatus.isBuilding || !isFormValid}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buildingStatus.isBuilding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {buildingStatus.currentStep || 'Gerando Atividade...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Construir Atividade
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            {activeTab === 'preview' && (
              <div className="h-full">
                <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
                  {isContentLoaded && generatedContent ? (
                    activity?.id === 'plano-aula' ? (
                      <PlanoAulaPreview
                        data={generatedContent}
                        activityData={activity}
                      />
                    ) : activity?.id === 'lista-exercicios' ? (
                      <ExerciseListPreview
                        data={processExerciseListData(formData, generatedContent)}
                        content={generatedContent}
                        activityData={activity}
                        onRegenerateContent={handleRegenerateContent}
                      />
                    ) : activity?.id === 'sequencia-didatica' ? (
                      <SequenciaDidaticaPreview
                        data={generatedContent || formData}
                      />
                    ) : activity?.id === 'quadro-interativo' ? (
                      <ActivityPreview
                        content={{
                          title: formData.title,
                          description: formData.description,
                          subject: formData.subject,
                          schoolYear: formData.schoolYear,
                          theme: formData.theme,
                          objectives: formData.objectives,
                          difficulty: formData.difficultyLevel,
                          practicalActivities: formData.practicalActivities,
                          // Add other relevant fields from formData
                        }}
                        activityData={activity}
                      />
                    ) : (
                      <ActivityPreview
                        content={generatedContent}
                        activityData={activity}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Nenhuma atividade gerada ainda
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Preencha os campos na aba "Editar" e clique em "Construir Atividade" para gerar o conteúdo
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('editar')}
                        className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                      >
                        Ir para Edição
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
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
                  <Copy className="h-4 w-4 mr-2" /> Copiar Conteúdo
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar PDF
                </Button> */}
              </>
            )}
             {generatedContent && (
              <Button
                variant="outline"
                onClick={clearContent}
                className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Limpar Conteúdo
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditActivityModal;
export { EditActivityModal };