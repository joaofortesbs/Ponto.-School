import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';
import { EditActivityModal } from './EditActivityModal';
import { ActivityViewModal } from './ActivityViewModal';
import { HistoricoAtividadesCriadas } from './HistoricoAtividadesCriadas';
import { useConstructionActivities } from './useConstructionActivities';
import { useEditActivityModal } from './useEditActivityModal';
import { useAutoSync } from './hooks/useAutoSync';
import { ConstructionActivity } from './types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Loader2, CheckCircle, AlertCircle, Building2, History, ArrowLeft, Save } from 'lucide-react';
import { autoBuildService, AutoBuildProgress } from './services/autoBuildService';
import { storageSet, safeSetJSON } from '@/features/schoolpower/services/StorageOrchestrator';
import { ArtifactViewModal } from '@/features/schoolpower/interface-chat-producao/components/ArtifactViewModal';
import type { ArtifactData } from '@/features/schoolpower/agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { isTextVersionActivity } from '@/features/schoolpower/config/activityVersionConfig';
import { retrieveTextVersionContent } from '@/features/schoolpower/activities/text-version/TextVersionGenerator';

interface ConstructionGridProps {
  approvedActivities: any[];
  handleEditActivity?: (activity: any) => void;
  onResetFlow?: () => void;
}

export function ConstructionGrid({ approvedActivities, handleEditActivity: externalHandleEditActivity, onResetFlow }: ConstructionGridProps) {
  console.log('🎯 ==========================================');
  console.log('🎯 CONSTRUÇÃO GRID - DEBUG INICIAL');
  console.log('🎯 ==========================================');
  console.log('🎯 ConstructionGrid renderizado');
  console.log('🎯 Atividades aprovadas recebidas:', approvedActivities?.length || 0);
  console.log('🎯 Atividades aprovadas:', approvedActivities);
  console.log('🎯 ==========================================');

  const { activities: hookActivities, loading, refreshActivities } = useConstructionActivities(approvedActivities);
  const [activities, setActivities] = useState<ConstructionActivity[]>(hookActivities); // Estado local para evitar piscada
  const { isModalOpen, selectedActivity, openModal, closeModal, handleSaveActivity } = useEditActivityModal();
  const { syncActivitiesToNeon } = useAutoSync(); // Hook de sincronização automática
  const [buildProgress, setBuildProgress] = useState<AutoBuildProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // Sincronizar estado local com o hook quando hookActivities mudar
  useEffect(() => {
    setActivities(hookActivities);
  }, [hookActivities]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<ConstructionActivity | null>(null);

  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [artifactData, setArtifactData] = useState<ArtifactData | null>(null);

  const [showHistorico, setShowHistorico] = useState(false);
  
  // Estado para controlar salvamento
  const [isSaving, setIsSaving] = useState(false);

  console.log('🎯 Estado do modal:', { isModalOpen, selectedActivity: selectedActivity?.title });

  // DEBUG AUTOMÁTICO - Executar sempre que atividades mudarem
  useEffect(() => {
    console.log('🚀 ==========================================');
    console.log('🚀 DEBUG AUTOMÁTICO - ESTADO DAS ATIVIDADES');
    console.log('🚀 ==========================================');
    console.log('🚀 Total de atividades processadas:', activities.length);
    console.log('🚀 Loading:', loading);
    
    if (activities.length > 0) {
      console.log('🔍 ANÁLISE DETALHADA DE CADA ATIVIDADE:');
      activities.forEach((activity, index) => {
        console.log(`📋 [${index + 1}] Atividade: ${activity.title}`);
        console.log(`📋     ID: ${activity.id}`);
        console.log(`📋     Status: ${activity.status}`);
        console.log(`📋     isBuilt: ${activity.isBuilt}`);
        console.log(`📋     Progress: ${activity.progress}%`);
        console.log(`📋     Tem título: ${!!activity.title}`);
        console.log(`📋     Tem descrição: ${!!activity.description}`);
        
        const precisa = !activity.isBuilt && 
                       activity.status !== 'completed' && 
                       !!activity.title && 
                       !!activity.description && 
                       activity.progress < 100;
        
        console.log(`📋     PRECISA CONSTRUIR: ${precisa ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`📋     -------------------`);
      });
      
      const atividadesPrecisamConstruir = activities.filter(a => 
        !a.isBuilt && 
        a.status !== 'completed' && 
        !!a.title && 
        !!a.description && 
        a.progress < 100
      );
      
      console.log('🎯 RESUMO FINAL:');
      console.log(`🎯 Total que PRECISAM construir: ${atividadesPrecisamConstruir.length}`);
      console.log(`🎯 Total que JÁ ESTÃO construídas: ${activities.filter(a => a.isBuilt).length}`);
      console.log(`🎯 Total com status "completed": ${activities.filter(a => a.status === 'completed').length}`);
      console.log(`🎯 Total com progress = 100: ${activities.filter(a => a.progress === 100).length}`);
    } else {
      console.log('⚠️ NENHUMA ATIVIDADE ENCONTRADA!');
      console.log('⚠️ Possíveis motivos:');
      console.log('⚠️ - approvedActivities está vazio');
      console.log('⚠️ - Erro na conversão das atividades');
      console.log('⚠️ - Hook ainda está carregando');
    }
    
    console.log('🚀 ==========================================');
  }, [activities, loading]);

  // DEBUG SEGURO - Verificar status do sistema quando necessário
  useEffect(() => {
    // Apenas logs seguros que não vazam dados
    if (!loading && activities.length === 0) {
      console.log('🔍 Sistema carregado mas sem atividades. Verifique se usuário está autenticado.');
    }
  }, [loading, activities]);

  const handleEditActivity = (activity: ConstructionActivity) => {
    console.log('🔧 Abrindo modal para editar atividade:', activity);

    if (externalHandleEditActivity) {
      externalHandleEditActivity(activity);
    } else {
      openModal(activity);
    }
  };

  const buildSmartSubtitleForTextActivity = (
    activityType: string,
    tema: string,
    serie: string,
    disciplina: string
  ): string => {
    const tipoPart = activityType?.trim() ? activityType.trim().toLowerCase() : '';
    const temaPart = tema?.trim() ? `explora ${tema.trim()}` : '';
    const seriePart = serie?.trim() ? `para ${serie.trim()}` : '';
    const disciplinaPart = disciplina?.trim() ? `de ${disciplina.trim()}` : '';
    const contextParts = [seriePart, disciplinaPart].filter(Boolean).join(' ');
    if (temaPart && contextParts) return `Esta atividade ${temaPart} ${contextParts}, promovendo aprendizagem ativa e engajamento pedagógico.`;
    if (temaPart) return `Esta atividade ${temaPart}, promovendo aprendizagem ativa e engajamento pedagógico.`;
    if (contextParts) return `Atividade pedagógica ${contextParts}, promovendo o desenvolvimento de habilidades específicas.`;
    if (tipoPart) return `Esta atividade de ${tipoPart} foi desenvolvida para promover aprendizagem ativa e engajamento dos estudantes.`;
    return 'Atividade pedagógica desenvolvida para promover aprendizagem ativa e engajamento dos estudantes.';
  };

  const handleView = (activity: ConstructionActivity) => {
    console.log('👁️ Abrindo modal de visualização para atividade:', activity.title);
    const activityType = activity.originalData?.tipo || activity.categoryId || activity.type || '';
    
    const isTextByConfig = isTextVersionActivity(activityType);
    const isTextBySignal = activity.customFields?.versionType === 'text' ||
      activity.customFields?.isTextVersion === true ||
      activity.originalData?.versionType === 'text' ||
      activity.originalData?.isTextVersion === true ||
      activity.originalData?.pipeline === 'criar_arquivo_textual';
    
    if (activityType === 'atividade-textual' || isTextByConfig || isTextBySignal) {
      console.log('📄 [ConstructionGrid] Atividade textual detectada, redirecionando para ArtifactViewModal', { activityType, isTextByConfig, isTextBySignal });
      
      const textData = retrieveTextVersionContent(activity.id, activityType);
      const textContent = textData?.textContent || activity.customFields?.textContent || activity.originalData?.textContent || '';
      const sections = textData?.sections || activity.customFields?.sections || activity.originalData?.sections || [];

      const extractMetaFromTextContent = (raw: string) => {
        const lines = raw.split('\n');
        let title = '';
        let subtitle = '';
        const cleanedLines: string[] = [];
        for (const line of lines) {
          const trimmed = line.trim();
          const h1Match = trimmed.match(/^#{1,2}\s+(.+)$/);
          if (!title && h1Match) {
            title = h1Match[1].trim();
            continue;
          }
          const subMatch = trimmed.match(/^\*\*Subt[ií]tulo:\*\*\s*(.+)$/i);
          if (!subtitle && subMatch) {
            subtitle = subMatch[1].replace(/\*\*/g, '').trim();
            continue;
          }
          cleanedLines.push(line);
        }
        return { title, subtitle, cleaned: cleanedLines.join('\n') };
      };
      const { title: extractedTitle, subtitle: extractedSubtitle, cleaned: cleanedContent } = extractMetaFromTextContent(textContent);

      const artifactSections = Array.isArray(sections) ? sections.map((sec: any, idx: number) => ({
        id: sec.id || `section-${idx}`,
        titulo: (sec.titulo || sec.title || `Seção ${idx + 1}`).replace(/^#+\s+/, ''),
        conteudo: sec.conteudo || sec.content || '',
        icone: sec.icone || sec.icon || '',
        ordem: sec.ordem ?? idx,
      })) : [];
      
      if (artifactSections.length === 0 && cleanedContent.trim()) {
        const markdownSections = cleanedContent.split(/^##\s+/m).filter((s: string) => s.trim().length > 0);
        markdownSections.forEach((block: string, idx: number) => {
          const lines = block.split('\n');
          const rawTitle = lines[0]?.trim() || '';
          const title = rawTitle.replace(/^#+\s+/, '') || `Seção ${idx + 1}`;
          const content = lines.slice(1).join('\n').trim();
          if (title || content) {
            artifactSections.push({
              id: `section-${idx}`,
              titulo: title,
              conteudo: content,
              icone: '',
              ordem: idx,
            });
          }
        });
      }
      
      if (artifactSections.length === 0) {
        artifactSections.push({
          id: 'section-0',
          titulo: 'Conteúdo',
          conteudo: cleanedContent || textContent || 'Conteúdo não disponível. Tente gerar novamente.',
          icone: '',
          ordem: 0,
        });
      }

      // Smart title resolution — priority: stored titulo → textContent # heading → template name
      const resolvedTitle = ((textData?.titulo || extractedTitle || '').replace(/^#+\s+/, '').trim())
        || activity.title || 'Atividade em Texto';
      const finalSections = [...artifactSections];

      // Smart subtitle resolution
      const tema = activity.customFields?.theme || activity.customFields?.tema || activity.originalData?.theme || activity.originalData?.tema || '';
      const serie = activity.customFields?.schoolYear || activity.customFields?.serie || activity.originalData?.schoolYear || activity.originalData?.serie || '';
      const disciplina = activity.customFields?.subject || activity.customFields?.disciplina || activity.originalData?.subject || activity.originalData?.disciplina || '';
      const resolvedSubtitulo = (textData as any)?.subtitulo || extractedSubtitle || buildSmartSubtitleForTextActivity(activityType, tema, serie, disciplina);

      const artifact: ArtifactData = {
        id: activity.id,
        metadata: {
          tipo: 'atividade_textual',
          titulo: resolvedTitle,
          subtitulo: resolvedSubtitulo,
          geradoEm: Date.now(),
          sessaoId: activity.id,
          versao: '2.0',
          tags: activity.tags || [],
          estatisticas: {
            palavras: textContent.split(/\s+/).length,
            secoes: finalSections.length,
            tempoGeracao: 0,
          },
        },
        secoes: finalSections,
        resumoPreview: textContent.substring(0, 200) + '...',
      };
      
      setArtifactData(artifact);
      setIsArtifactModalOpen(true);
      return;
    }
    
    setViewActivity(activity);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewActivity(null);
  };

  const closeArtifactModal = () => {
    setIsArtifactModalOpen(false);
    setArtifactData(null);
  };

  const handleShowHistorico = () => {
    console.log('📚 Abrindo histórico de atividades criadas');
    setShowHistorico(true);
  };

  const handleBackFromHistorico = () => {
    console.log('🔙 Voltando do histórico para construção');
    setShowHistorico(false);
  };

  const handleResetFlowWithCleanup = () => {
    console.log('🔄 Resetando fluxo e limpando localStorage de atividades construídas');
    
    // Limpar dados de atividades construídas do localStorage
    try {
      // Remover marcadores de atividades construídas
      localStorage.removeItem('constructedActivities');
      
      // Remover dados específicos de atividades (activity_*)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('activity_') || 
          key.startsWith('constructed_') ||
          key.startsWith('auto_activity_data_')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`✅ Limpeza concluída: ${keysToRemove.length} itens removidos do localStorage`);
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
    
    // Chamar a função de reset do fluxo
    if (onResetFlow) {
      onResetFlow();
    }
  };

  const handleShare = (id: string) => {
    console.log('📤 Compartilhando atividade:', id);
    // TODO: Implementar funcionalidade de compartilhamento
  };

  const handleSaveActivitiesToNeon = async () => {
    if (isSaving) {
      console.log('⚠️ Salvamento já em andamento');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Iniciando salvamento de atividades criadas no Neon...');

      // Importar serviço necessário
      const { atividadesNeonService } = await import('@/services/atividadesNeonService');

      // Obter ID do usuário do localStorage (sistema de autenticação Neon)
      const userId = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('auth_token');
      
      if (!userId || !authToken) {
        alert('❌ Erro: Usuário não autenticado. Faça login para salvar as atividades.');
        console.error('❌ Autenticação não encontrada:', { userId: !!userId, authToken: !!authToken });
        return;
      }

      console.log('👤 Usuário identificado:', userId);

      // Buscar atividades construídas do localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityIds = Object.keys(constructedActivities);

      if (activityIds.length === 0) {
        alert('ℹ️ Nenhuma atividade criada encontrada para salvar.');
        return;
      }

      console.log(`📦 Encontradas ${activityIds.length} atividades criadas`);

      let savedCount = 0;
      let errorCount = 0;

      // Função para gerar código único de 8 dígitos (mesmo sistema do compartilhamento)
      const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const gerarCodigoUnico = (tamanho: number = 8): string => {
        let codigo = "";
        for (let i = 0; i < tamanho; i++) {
          codigo += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
        }
        return codigo;
      };

      // Salvar cada atividade no banco Neon
      for (const activityId of activityIds) {
        try {
          // Buscar dados completos da atividade
          const activityData = localStorage.getItem(`activity_${activityId}`);
          
          if (activityData) {
            const parsedData = JSON.parse(activityData);
            const tipo = constructedActivities[activityId]?.type || activityId;

            // Verificar se já existe um código único salvo para esta atividade
            let codigoUnico = constructedActivities[activityId]?.codigoUnico;
            
            // Se não existe, gerar um novo código único de 8 dígitos
            if (!codigoUnico) {
              codigoUnico = gerarCodigoUnico(8);
              console.log(`🔑 Código único gerado para ${activityId}:`, codigoUnico);
              
              // Salvar código único no localStorage para manter consistência
              constructedActivities[activityId] = {
                ...constructedActivities[activityId],
                codigoUnico: codigoUnico
              };
              storageSet('constructedActivities', constructedActivities, { activityType: 'constructed-activities' });
            } else {
              console.log(`🔑 Usando código único existente para ${activityId}:`, codigoUnico);
            }

            // Buscar Stars do localStorage (padrão 100)
            const stKey = `activity_${activityId}_stars`;
            const stars = parseInt(localStorage.getItem(stKey) || '100');
            
            console.log(`💾 Salvando atividade com código único: ${codigoUnico} e ${stars} STs`);

            // Salvar no banco Neon usando o código único como ID
            const result = await atividadesNeonService.salvarAtividade(
              codigoUnico, // Usar código único como ID
              userId,
              tipo,
              parsedData,
              stars // Incluir Stars
            );

            if (result.success) {
              savedCount++;
              console.log(`✅ Atividade salva com código ${codigoUnico}`);
            } else {
              errorCount++;
              console.error(`❌ Erro ao salvar ${activityId}:`, result.error);
            }
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao processar atividade ${activityId}:`, error);
        }
      }

      // Mostrar resultado
      if (errorCount === 0) {
        alert(`✅ Sucesso! ${savedCount} atividade(s) salva(s) no banco de dados!`);
      } else {
        alert(`⚠️ Salvamento concluído:\n\n✅ ${savedCount} atividade(s) salva(s)\n❌ ${errorCount} erro(s)`);
      }

      console.log(`📊 Resultado final: ${savedCount} salvas, ${errorCount} erros`);

    } catch (error) {
      console.error('❌ Erro ao salvar atividades:', error);
      alert('❌ Erro ao salvar atividades. Verifique o console para mais detalhes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildAll = async () => {
    if (isBuilding) {
      console.log('⚠️ Construção já em andamento, ignorando nova solicitação');
      return;
    }

    console.log('🚀 ==========================================');
    console.log('🚀 INICIANDO DEBUG COMPLETO DE CONSTRUÇÃO');
    console.log('🚀 ==========================================');
    console.log('🚀 Total de atividades recebidas:', activities.length);
    console.log('🚀 Atividades:', activities.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      isBuilt: a.isBuilt,
      progress: a.progress,
      hasTitle: !!a.title,
      hasDescription: !!a.description
    })));

    // Filtrar atividades que precisam ser construídas
    const activitiesToBuild = activities.filter(activity => {
      const checks = {
        notBuilt: !activity.isBuilt,
        notCompleted: activity.status !== 'completed',
        hasTitle: !!activity.title,
        hasDescription: !!activity.description,
        progressLessThan100: activity.progress < 100
      };
      
      const needsBuild = checks.notBuilt && 
                        checks.notCompleted && 
                        checks.hasTitle && 
                        checks.hasDescription && 
                        checks.progressLessThan100;

      console.log(`🔍 [DEBUG] Atividade: ${activity.title || 'SEM TÍTULO'}`);
      console.log(`🔍 [DEBUG]   - ID: ${activity.id}`);
      console.log(`🔍 [DEBUG]   - Status: ${activity.status}`);
      console.log(`🔍 [DEBUG]   - isBuilt: ${activity.isBuilt}`);
      console.log(`🔍 [DEBUG]   - Progress: ${activity.progress}`);
      console.log(`🔍 [DEBUG]   - Checks:`, checks);
      console.log(`🔍 [DEBUG]   - PRECISA CONSTRUIR: ${needsBuild}`);
      console.log(`🔍 [DEBUG]   -------------------`);
      
      return needsBuild;
    });

    console.log('🎯 ==========================================');
    console.log('🎯 RESULTADO DO FILTRO DE CONSTRUÇÃO');
    console.log('🎯 ==========================================');
    console.log('🎯 Total que PRECISAM ser construídas:', activitiesToBuild.length);
    console.log('🎯 Atividades selecionadas para construção:', activitiesToBuild.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status
    })));
    console.log('🎯 ==========================================');

    if (activitiesToBuild.length === 0) {
      console.log('⚠️ ==========================================');
      console.log('⚠️ NENHUMA ATIVIDADE PRECISA SER CONSTRUÍDA!');
      console.log('⚠️ Motivos possíveis:');
      console.log('⚠️ - Todas já estão construídas (isBuilt: true)');
      console.log('⚠️ - Todas já estão com status "completed"');
      console.log('⚠️ - Todas já têm progress = 100');
      console.log('⚠️ - Faltam títulos ou descrições');
      console.log('⚠️ ==========================================');
      alert('NENHUMA ATIVIDADE PRECISA SER CONSTRUÍDA!\n\nVerifique o console para detalhes do debug.');
      return;
    }

    try {
      setIsBuilding(true);
      setShowProgressModal(true);

      // Configurar callbacks CORRETOS para o serviço
      autoBuildService.setProgressCallback((progress) => {
        console.log('📊 Progresso da construção atualizado:', progress);
        setBuildProgress(progress);
      });

      autoBuildService.setOnActivityBuilt((activityId) => {
        console.log(`🎯 Atividade construída automaticamente: ${activityId}`);

        // ✅ Atualizar estado local DIRETAMENTE (sem refresh que causa piscada)
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        setActivities(prevActivities => prevActivities.map(activity => {
          if (activity.id === activityId && constructedActivities[activityId]) {
            return {
              ...activity,
              isBuilt: true,
              builtAt: constructedActivities[activityId].builtAt,
              progress: 100,
              status: 'completed' as const
            };
          }
          return activity;
        }));

        console.log('✅ Atividade atualizada localmente - SEM piscada!');
      });

      // Executar construção automática com a MESMA LÓGICA do modal
      await autoBuildService.buildAllActivities(activitiesToBuild);

      console.log('✅ Construção automática finalizada com sucesso');

    } catch (error) {
      console.error('❌ Erro na construção automática:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      setBuildProgress({
        current: 0,
        total: activitiesToBuild.length,
        currentActivity: 'Erro na construção',
        status: 'error',
        errors: [errorMessage]
      });
    } finally {
      setIsBuilding(false);

      // Aguardar um pouco antes de fechar para mostrar resultado
      setTimeout(() => {
        setShowProgressModal(false);
        setBuildProgress(null);

        // ✅ NÃO forçar refresh - o estado local já foi atualizado
        console.log('✅ Construção completa - estado já atualizado sem reload');
      }, 3000);
    }
  };

  // Listener para atualizações de atividades construídas
  useEffect(() => {
    const handleActivityBuilt = (event: CustomEvent) => {
      console.log('🎯 Evento de atividade construída recebido:', event.detail);

      // ✅ NÃO forçar refresh - o callback setOnActivityBuilt já atualizou o estado
      console.log('✅ Evento recebido - estado já foi atualizado no callback');
    };

    window.addEventListener('activity-built', handleActivityBuilt as EventListener);

    return () => {
      window.removeEventListener('activity-built', handleActivityBuilt as EventListener);
    };
  }, []);

  useEffect(() => {
    console.log('🎯 ConstructionGrid - Verificando status das atividades');

    // Verificar e atualizar status de atividades construídas do localStorage
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    
    // Criar cópia do array para atualizar imutavelmente
    const updatedActivities = activities.map(activity => {
      if (constructedActivities[activity.id] && !activity.isBuilt) {
        console.log(`📝 Atualizando status da atividade ${activity.id} para construída`);
        return {
          ...activity,
          isBuilt: true,
          builtAt: constructedActivities[activity.id].builtAt,
          progress: 100,
          status: 'completed' as const
        };
      }
      return activity;
    });

    // ✅ Atualizar estado React diretamente (SEM reload completo)
    // Compara se realmente houve mudanças antes de setar
    const hasChanges = updatedActivities.some((act, idx) => 
      act.isBuilt !== activities[idx].isBuilt || 
      act.progress !== activities[idx].progress ||
      act.status !== activities[idx].status
    );

    if (hasChanges) {
      console.log('✅ Status atualizado localmente - SEM piscada!');
      setActivities(updatedActivities);
    }
  }, [activities]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-7 w-8" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!approvedActivities || approvedActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhuma atividade para construir
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Aprove algumas atividades no Plano de Ação para começar a construí-las aqui.
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Processando atividades...
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          As atividades aprovadas estão sendo preparadas para construção.
        </p>
      </div>
    );
  }

  const activitiesNeedingBuild = activities.filter(activity =>
    !activity.isBuilt &&
    activity.status !== 'completed' &&
    activity.title &&
    activity.description &&
    activity.progress < 100
  );

  // Se está mostrando histórico, renderizar componente de histórico
  if (showHistorico) {
    return <HistoricoAtividadesCriadas onBack={handleBackFromHistorico} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#D65A00] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {activities.length} {activities.length === 1 ? 'atividade aprovada' : 'atividades aprovadas'} para construção
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {/* Botão Voltar ao Início */}
          <button
            onClick={handleResetFlowWithCleanup}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            title="Voltar ao Início"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Botão Salvar Atividades */}
          <button
            onClick={handleSaveActivitiesToNeon}
            disabled={isSaving}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-green-500/30 text-green-600 hover:bg-green-500/5 hover:border-green-500/50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Salvar Atividades Criadas no Banco de Dados"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>

          {/* Botão de Histórico */}
          <button
            onClick={handleShowHistorico}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/5 hover:border-[#FF6B00]/50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Histórico de Atividades Criadas"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Botão Construir Todas */}
          {activitiesNeedingBuild.length > 0 && (
            <Button
              onClick={handleBuildAll}
              disabled={isBuilding || buildProgress?.status === 'running'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuilding || buildProgress?.status === 'running' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Construindo...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Construir Todas ({activitiesNeedingBuild.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Grid com layout otimizado para os novos cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
        {activities.map((activity) => (
          <ConstructionCard
            key={activity.id}
            id={activity.id}
            title={activity.title}
            description={activity.description}
            progress={activity.progress}
            type={activity.type}
            status={activity.status}
            onEdit={() => {
              console.log('🎯 Abrindo modal para atividade:', activity.title);
              openModal(activity);
            }}
            onView={(activityData) => {
              // Se receber dados da atividade, usar eles; senão, usar a atividade original
              const finalActivity = activityData || activity;
              console.log('👁️ Visualizando atividade:', finalActivity);
              handleView(finalActivity);
            }}
            onShare={handleShare}
          />
        ))}
      </div>

      {/* Modal de Edição */}
      <EditActivityModal
        isOpen={isModalOpen}
        activity={selectedActivity}
        onClose={closeModal}
        onSave={handleSaveActivity}
      />

      {/* Modal de Visualização - Atividades Interativas */}
      <ActivityViewModal
        isOpen={isViewModalOpen}
        activity={viewActivity}
        onClose={closeViewModal}
      />

      {/* Modal de Artefato - Atividades Textuais */}
      {artifactData && (
        <ArtifactViewModal
          artifact={artifactData}
          isOpen={isArtifactModalOpen}
          onClose={closeArtifactModal}
        />
      )}

      {/* Modal de Progresso da Construção Automática */}
      {showProgressModal && buildProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Construção Automática com Lógica do Modal
              </h3>

              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#FF6B00] to-[#D65A00] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {buildProgress.current} de {buildProgress.total} atividades processadas
                </p>
              </div>

              {buildProgress.status === 'running' && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF6B00]" />
                  <span className="text-sm">
                    {buildProgress.currentActivity}
                  </span>
                </div>
              )}

              {buildProgress.status === 'completed' && (
                <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Construção concluída com sucesso!</span>
                </div>
              )}

              {buildProgress.status === 'error' && (
                <div className="flex items-center justify-center gap-2 mb-4 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Construção concluída com alguns erros</span>
                </div>
              )}

              {buildProgress.errors.length > 0 && (
                <div className="text-left mb-4">
                  <p className="text-sm font-medium text-red-600 mb-2">Erros encontrados:</p>
                  <div className="max-h-32 overflow-y-auto">
                    {buildProgress.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-500 mb-1">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {(buildProgress.status === 'completed' || buildProgress.status === 'error') && (
                <Button
                  onClick={() => {
                    setShowProgressModal(false);
                    setBuildProgress(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00]"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}