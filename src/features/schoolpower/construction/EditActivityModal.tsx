import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ConstructionActivity } from './types';
import { ActivityFormData } from './types/ActivityTypes';
import { useGenerateActivity } from './hooks/useGenerateActivity';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import { CheckCircle2 } from 'lucide-react';

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
export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onUpdateActivity
}) => {
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
    // Novos campos para plano de aula
    disciplina: activity?.customFields?.disciplina || '',
    turma: activity?.customFields?.turma || '',
    professor: activity?.customFields?.professor || '',
    duracao: activity?.customFields?.duracao || '',
    tema: activity?.customFields?.tema || '',
    nivel: activity?.customFields?.nivel || '',
    instituicao: activity?.customFields?.instituicao || '',
    conteudo: activity?.customFields?.conteudo || '',
    metodologia: activity?.customFields?.metodologia || '',
    recursos: activity?.customFields?.recursos || '',
    avaliacao: activity?.customFields?.avaliacao || '',
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
  const [isSaving, setIsSaving] = useState(false);

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
            // Campos específicos do plano de aula
            disciplina: data.disciplina,
            turma: data.turma,
            professor: data.professor,
            duracao: data.duracao,
            temaAula: data.tema,
            nivelEnsino: data.nivel,
            instituicao: data.instituicao,
            conteudoProgramatico: data.conteudo,
            metodologia: data.metodologia,
            recursos: data.recursos,
            avaliacao: data.avaliacao
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

  // Processar dados específicos para lista de exercícios
  const processExerciseListData = (formData: ActivityFormData, generatedContent?: any) => {
    console.log('🔄 Processando dados da lista de exercícios:', { formData, generatedContent });

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
          titulo: generatedContent.titulo || formData.title || 'Lista de Exercícios',
          disciplina: generatedContent.disciplina || formData.subject || 'Disciplina não especificada',
          tema: generatedContent.tema || formData.theme || 'Tema não especificado',
          tipoQuestoes: generatedContent.tipoQuestoes || formData.questionModel || 'multipla-escolha',
          numeroQuestoes: questoesExtraidas.length || parseInt(formData.numberOfQuestions || '5'),
          dificuldade: generatedContent.dificuldade || formData.difficultyLevel || 'medio',
          objetivos: generatedContent.objetivos || formData.objectives || '',
          conteudoPrograma: generatedContent.conteudoPrograma || formData.instructions || '',
          observacoes: generatedContent.observacoes || '',
          questoes: questoesExtraidas,
          isGeneratedByAI: true,
          generatedAt: generatedContent.generatedAt
        };

        console.log('📊 Dados processados da IA:', processedData);
        console.log(`📝 Questões finais: ${processedData.questoes.length}`);

        if (processedData.questoes.length > 0) {
          console.log('📄 Primeira questão processada:', processedData.questoes[0]);
        }

        return processedData;
      } catch (error) {
        console.error('❌ Erro ao processar conteúdo da IA:', error);
      }
    }

    console.log('⚠️ Usando dados de fallback (sem conteúdo da IA)');
    return {
      titulo: formData.title || 'Lista de Exercícios',
      disciplina: formData.subject || 'Disciplina não especificada',
      tema: formData.theme || 'Tema não especificado',
      tipoQuestoes: formData.questionModel || 'multipla-escolha',
      numeroQuestoes: parseInt(formData.numberOfQuestions || '5'),
      dificuldade: formData.difficultyLevel || 'medio',
      objetivos: formData.objectives || '',
      conteudoPrograma: formData.instructions || '',
      observacoes: '',
      questoes: [],
      isGeneratedByAI: false
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

      console.log(`🔎 Estado do localStorage:`, {
        constructedActivities: Object.keys(constructedActivities),
        hasSavedContent: !!savedContent,
        hasPlanoAulaSavedContent: !!planoAulaSavedContent,
        activityId: activity.id
      });

      // Priorizar o conteúdo específico do plano de aula se existir
      let contentToLoad = null;
      if (activity.id === 'plano-aula' && planoAulaSavedContent) {
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
                // Novos campos do plano de aula
                disciplina: consolidatedCustomFields['disciplina'] || customFields['Disciplina'] || '',
                turma: consolidatedCustomFields['turma'] || customFields['Série/Turma'] || '',
                professor: consolidatedCustomFields['professor'] || customFields['Professor(a)'] || '',
                duracao: consolidatedCustomFields['duracao'] || customFields['Duração da Aula'] || '',
                tema: consolidatedCustomFields['tema'] || customFields['Tema da Aula'] || '',
                nivel: consolidatedCustomFields['nivel'] || customFields['Nível de Ensino'] || '',
                instituicao: consolidatedCustomFields['instituicao'] || customFields['Instituição'] || '',
                conteudo: consolidatedCustomFields['conteudo'] || customFields['Conteúdo Programático'] || '',
                metodologia: consolidatedCustomFields['metodologia'] || customFields['Metodologia'] || '',
                recursos: consolidatedCustomFields['recursos'] || customFields['Recursos Necessários'] || '',
                avaliacao: consolidatedCustomFields['avaliacao'] || customFields['Avaliação'] || '',
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
              console.log('  - Disciplina:', enrichedFormData.disciplina);
              console.log('  - Turma:', enrichedFormData.turma);
              console.log('  - Professor:', enrichedFormData.professor);
              console.log('  - Duração:', enrichedFormData.duracao);
              console.log('  - Tema Aula:', enrichedFormData.tema);
              console.log('  - Nível Ensino:', enrichedFormData.nivel);
              console.log('  - Instituição:', enrichedFormData.instituicao);
              console.log('  - Conteúdo Programático:', enrichedFormData.conteudo);
              console.log('  - Metodologia:', enrichedFormData.metodologia);
              console.log('  - Recursos:', enrichedFormData.recursos);
              console.log('  - Avaliação:', enrichedFormData.avaliacao);
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
                // Novos campos do plano de aula
                disciplina: consolidatedCustomFields['disciplina'] || customFields['Disciplina'] || autoFormData.disciplina || '',
                turma: consolidatedCustomFields['turma'] || customFields['Série/Turma'] || autoFormData.turma || '',
                professor: consolidatedCustomFields['professor'] || customFields['Professor(a)'] || autoFormData.professor || '',
                duracao: consolidatedCustomFields['duracao'] || customFields['Duração da Aula'] || autoFormData.duracao || '',
                tema: consolidatedCustomFields['tema'] || customFields['Tema da Aula'] || autoFormData.tema || '',
                nivel: consolidatedCustomFields['nivel'] || customFields['Nível de Ensino'] || autoFormData.nivel || '',
                instituicao: consolidatedCustomFields['instituicao'] || customFields['Instituição'] || autoFormData.instituicao || '',
                conteudo: consolidatedCustomFields['conteudo'] || customFields['Conteúdo Programático'] || autoFormData.conteudo || '',
                metodologia: consolidatedCustomFields['metodologia'] || customFields['Metodologia'] || autoFormData.metodologia || '',
                recursos: consolidatedCustomFields['recursos'] || customFields['Recursos Necessários'] || autoFormData.recursos || '',
                avaliacao: consolidatedCustomFields['avaliacao'] || customFields['Avaliação'] || autoFormData.avaliacao || '',
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
              // Novos campos do plano de aula
              disciplina: activity.originalData?.customFields?.['disciplina'] || '',
              turma: activity.originalData?.customFields?.['turma'] || '',
              professor: activity.originalData?.customFields?.['professor'] || '',
              duracao: activity.originalData?.customFields?.['duracao'] || '',
              tema: activity.originalData?.customFields?.['tema'] || '',
              nivel: activity.originalData?.customFields?.['nivel'] || '',
              instituicao: activity.originalData?.customFields?.['instituicao'] || '',
              conteudo: activity.originalData?.customFields?.['conteudo'] || '',
              metodologia: activity.originalData?.customFields?.['metodologia'] || '',
              recursos: activity.originalData?.customFields?.['recursos'] || '',
              avaliacao: activity.originalData?.customFields?.['avaliacao'] || '',
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
              // Novos campos do plano de aula
              disciplina: customFields['disciplina'] || '',
              turma: customFields['turma'] || '',
              professor: customFields['professor'] || '',
              duracao: customFields['duracao'] || '',
              tema: customFields['tema'] || '',
              nivel: customFields['nivel'] || '',
              instituicao: customFields['instituicao'] || '',
              conteudo: customFields['conteudo'] || '',
              metodologia: customFields['metodologia'] || '',
              recursos: customFields['recursos'] || '',
              avaliacao: customFields['avaliacao'] || '',
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
              // Novos campos do plano de aula (preenchidos com valores padrão se não existirem)
              disciplina: '',
              turma: '',
              professor: '',
              duracao: '',
              tema: '',
              nivel: '',
              instituicao: '',
              conteudo: '',
              metodologia: '',
              recursos: '',
              avaliacao: '',
            };
          }

          setFormData(directFormData);
          console.log('📝 Formulário preenchido com dados diretos:', directFormData);
        }

        // Tentar carregar conteúdo salvo
        if (loadSavedContent) {
          loadSavedContent();
        }
      }
    };

    loadActivityData();
  }, [activity, isOpen, loadSavedContent, onUpdateActivity]);

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
  }, [activity, formData, isGenerating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      // Usar a mesma lógica de geração do sistema de construção automática
      const result = await generateActivityContent(activity.type || activity.id, formData);

      clearInterval(progressTimer);
      setBuildProgress(100);

      if (result.success) {
        console.log('✅ Atividade construída com sucesso:', result.data);

        // Salvar no localStorage com a mesma chave usada pelo sistema
        const storageKey = `schoolpower_${activity.type || activity.id}_content`;
        localStorage.setItem(storageKey, JSON.stringify(result.data));

        // Para plano-aula, também salvar com chave específica para visualização
        if (activity.type === 'plano-aula' || activity.id === 'plano-aula') {
          const viewStorageKey = `constructed_plano-aula_${activity.id}`;
          localStorage.setItem(viewStorageKey, JSON.stringify(result.data));
          console.log('💾 Dados do plano-aula salvos para visualização:', viewStorageKey);
        }

        // Também salvar na lista de atividades construídas
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '[]');
        if (!constructedActivities.includes(activity.id)) {
          constructedActivities.push(activity.id);
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
        }

        setBuiltContent(result.data);
        setActiveTab('preview');

        toast({
          title: "Atividade construída!",
          description: "Sua atividade foi gerada com sucesso.",
        });
      } else {
        throw new Error(result.error || 'Erro na geração da atividade');
      }
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
  }, [activity, formData, isBuilding]); // Adicionado isBuilding e formData

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
    ? formData.disciplina.trim() && // Verifica os campos obrigatórios para plano de aula
      formData.turma.trim() &&
      formData.professor.trim() &&
      formData.duracao.trim() &&
      formData.tema.trim() &&
      formData.nivel.trim() &&
      formData.title.trim() &&
      formData.description.trim() &&
      formData.objectives.trim()
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
      setIsSaving(true);

      // Obter customFields a partir dos dados da atividade
      const customFields = activity.customFields || {};

      // Salvar os dados editados, incluindo os campos específicos do plano de aula
      const updatedActivity = {
        ...activity,
        title: formData.title,
        description: formData.description,
        customFields: {
          ...customFields,
          disciplina: formData.disciplina,
          turma: formData.turma,
          professor: formData.professor,
          duracao: formData.duracao,
          tema: formData.tema,
          nivel: formData.nivel,
          instituicao: formData.instituicao,
          conteudo: formData.conteudo,
          metodologia: formData.metodologia,
          recursos: formData.recursos,
          avaliacao: formData.avaliacao,
          // Mantenha outros campos personalizados existentes
          ...Object.entries(customFields).reduce((acc, [key, value]) => {
            if (!['disciplina', 'turma', 'professor', 'duracao', 'tema', 'nivel', 'instituicao', 'conteudo', 'metodologia', 'recursos', 'avaliacao'].includes(key.toLowerCase())) {
              acc[key] = value;
            }
            return acc;
          }, {}),
        }
      };

      // Chamar a função de atualização passada como prop
      if (onUpdateActivity) {
        await onUpdateActivity(updatedActivity);
      }

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
    } finally {
      setIsSaving(false);
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
      ? formData.disciplina.trim() &&
        formData.turma.trim() &&
        formData.professor.trim() &&
        formData.duracao.trim() &&
        formData.tema.trim() &&
        formData.nivel.trim() &&
        formData.title.trim() &&
        formData.description.trim() &&
        formData.objectives.trim()
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
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Digite o título da atividade"
                          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descrição</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Descreva a atividade..."
                          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Campos específicos para Lista de Exercícios */}
                      {activity?.id === 'lista-exercicios' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="subject" className="text-sm">Disciplina</Label>
                              <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Ex: Português, Matemática, História..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="theme" className="text-sm">Tema</Label>
                              <Input
                                id="theme"
                                name="theme"
                                value={formData.theme}
                                onChange={handleInputChange}
                                placeholder="Ex: Substantivos e Verbos"
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="schoolYear" className="text-sm">Ano de Escolaridade</Label>
                              <Input
                                id="schoolYear"
                                name="schoolYear"
                                value={formData.schoolYear}
                                onChange={handleInputChange}
                                placeholder="Ex: 6º ano, 7º ano, 1º ano EM..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="numberOfQuestions" className="text-sm">Número de Questões</Label>
                              <Input
                                id="numberOfQuestions"
                                name="numberOfQuestions"
                                value={formData.numberOfQuestions}
                                onChange={handleInputChange}
                                placeholder="Ex: 5, 10, 15, 20..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="difficultyLevel" className="text-sm">Nível de Dificuldade</Label>
                              <Input
                                id="difficultyLevel"
                                name="difficultyLevel"
                                value={formData.difficultyLevel}
                                onChange={handleInputChange}
                                placeholder="Ex: Básico, Intermediário, Avançado..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="questionModel" className="text-sm">Modelo de Questões</Label>
                              <Input
                                id="questionModel"
                                name="questionModel"
                                value={formData.questionModel}
                                onChange={handleInputChange}
                                placeholder="Ex: Múltipla Escolha, Dissertativa, Mista..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="sources" className="text-sm">Fontes</Label>
                            <Textarea
                              id="sources"
                              name="sources"
                              value={formData.sources}
                              onChange={handleInputChange}
                              placeholder="Digite as fontes de referência..."
                              className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                          </div>

                          {/* Campos adicionais específicos baseados nos customFields */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="timeLimit" className="text-sm">Tempo Limite</Label>
                              <Input
                                id="timeLimit"
                                name="timeLimit"
                                value={formData.timeLimit || ''}
                                onChange={handleInputChange}
                                placeholder="Ex: 50 minutos, 1 hora..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="context" className="text-sm">Contexto de Aplicação</Label>
                              <Input
                                id="context"
                                name="context"
                                value={formData.context || ''}
                                onChange={handleInputChange}
                                placeholder="Ex: Produção textual, Sala de aula..."
                                className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Campos específicos para Plano de Aula */}
                      {activity?.id === 'plano-aula' && (
                        <>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-5 w-5 text-orange-600" />
                              <h3 className="font-semibold text-orange-800 dark:text-orange-300">Dados para Geração Automática</h3>
                            </div>
                            <p className="text-sm text-orange-700 dark:text-orange-400">
                              Preencha os campos abaixo para que nossa IA gere um plano de aula completo e personalizado.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Disciplina *
                              </label>
                              <Input
                                name="disciplina"
                                value={formData.disciplina || ''}
                                onChange={handleInputChange}
                                placeholder="Ex: Matemática, História, Ciências..."
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Série/Turma *
                              </label>
                              <Input
                                name="turma"
                                value={formData.turma || ''}
                                onChange={handleInputChange}
                                placeholder="Ex: 8º ano, 3ª série, Turma A..."
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Professor(a) *
                              </label>
                              <Input
                                name="professor"
                                value={formData.professor || ''}
                                onChange={handleInputChange}
                                placeholder="Nome completo do professor"
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Duração da Aula *
                              </label>
                              <select
                                name="duracao"
                                value={formData.duracao || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                <option value="">Selecione a duração</option>
                                <option value="30 minutos">30 minutos</option>
                                <option value="45 minutos">45 minutos</option>
                                <option value="50 minutos">50 minutos</option>
                                <option value="1 hora">1 hora</option>
                                <option value="1h30min">1h30min</option>
                                <option value="2 horas">2 horas</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Tema da Aula *
                            </label>
                            <Input
                              name="tema"
                              value={formData.tema || ''}
                              onChange={handleInputChange}
                              placeholder="Ex: Equações de 1º grau, Revolução Industrial, Sistema Digestório..."
                              className="focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Nível de Ensino *
                              </label>
                              <select
                                name="nivel"
                                value={formData.nivel || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                <option value="">Selecione o nível</option>
                                <option value="Educação Infantil">Educação Infantil</option>
                                <option value="Ensino Fundamental I">Ensino Fundamental I (1º ao 5º ano)</option>
                                <option value="Ensino Fundamental II">Ensino Fundamental II (6º ao 9º ano)</option>
                                <option value="Ensino Médio">Ensino Médio</option>
                                <option value="Ensino Superior">Ensino Superior</option>
                                <option value="Pós-graduação">Pós-graduação</option>
                                <option value="Educação de Jovens e Adultos">EJA</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Instituição
                              </label>
                              <Input
                                name="instituicao"
                                value={formData.instituicao || ''}
                                onChange={handleInputChange}
                                placeholder="Nome da escola/universidade"
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Objetivos de Aprendizagem
                            </label>
                            <Textarea
                              name="objetivos"
                              value={formData.objetivos || ''}
                              onChange={handleInputChange}
                              placeholder="Descreva os principais objetivos que os alunos devem alcançar ao final da aula..."
                              rows={3}
                              className="focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Se não preenchido, objetivos serão gerados automaticamente com base no tema e nível.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Conteúdo Programático
                            </label>
                            <Textarea
                              name="conteudo"
                              value={formData.conteudo || ''}
                              onChange={handleInputChange}
                              placeholder="Liste os tópicos e conceitos específicos que devem ser abordados na aula..."
                              rows={4}
                              className="focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Opcional. Se não preenchido, o conteúdo será estruturado automaticamente.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Metodologia Preferida
                            </label>
                            <Textarea
                              name="metodologia"
                              value={formData.metodologia || ''}
                              onChange={handleInputChange}
                              placeholder="Descreva estratégias pedagógicas específicas, metodologias ativas preferidas..."
                              rows={3}
                              className="focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Ex: Aprendizagem baseada em problemas, sala de aula invertida, gamificação...
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Recursos Disponíveis
                              </label>
                              <Textarea
                                name="recursos"
                                value={formData.recursos || ''}
                                onChange={handleInputChange}
                                placeholder="Materiais, equipamentos, tecnologias disponíveis..."
                                rows={3}
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Ex: Projetor, laboratório, tablets, internet...
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Métodos de Avaliação
                              </label>
                              <Textarea
                                name="avaliacao"
                                value={formData.avaliacao || ''}
                                onChange={handleInputChange}
                                placeholder="Como pretende avaliar o aprendizado dos alunos..."
                                rows={3}
                                className="focus:ring-orange-500 focus:border-orange-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Ex: Participação, exercícios, projeto, prova...
                              </p>
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                  Dicas para melhor resultado:
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                  <li>• Seja específico no tema da aula</li>
                                  <li>• Indique o nível de conhecimento prévio dos alunos</li>
                                  <li>• Mencione recursos tecnológicos disponíveis</li>
                                  <li>• Campos obrigatórios (*) garantem melhor personalização</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Campos genéricos para outras atividades */}
                      {activity?.id !== 'lista-exercicios' && activity?.id !== 'plano-aula' && (
                        <>
                          <div>
                            <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
                            <Textarea
                              id="objectives"
                              name="objectives"
                              value={formData.objectives}
                              onChange={handleInputChange}
                              placeholder="Descreva os objetivos que os alunos devem alcançar..."
                              className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
                            <Textarea
                              id="materials"
                              name="materials"
                              value={formData.materials}
                              onChange={handleInputChange}
                              placeholder="Liste os materiais necessários (um por linha)..."
                              className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
                            <Textarea
                              id="instructions"
                              name="instructions"
                              value={formData.instructions}
                              onChange={handleInputChange}
                              placeholder="Descreva como a atividade deve ser executada..."
                              className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                          </div>

                          <div>
                            <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
                            <Textarea
                              id="evaluation"
                              name="evaluation"
                              value={formData.evaluation}
                              onChange={handleInputChange}
                              placeholder="Como a atividade será avaliada..."
                              className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                          </div>
                        </>
                      )}
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
                  disabled={isBuilding || !isFormValid}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding ? (
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
            disabled={isSaving || isGenerating}
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
              disabled={isSaving || isGenerating}
              className="px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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