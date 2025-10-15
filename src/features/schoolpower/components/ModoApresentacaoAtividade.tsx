import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AtividadeDados } from '../services/data-sync-service';
import activitiesApiService, { ActivityData } from '@/services/activitiesApiService';
import { visitantesService } from '@/services/visitantesService';

// Import dos previews das atividades
import ActivityPreview from '../activities/default/ActivityPreview';
import ExerciseListPreview from '../activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '../activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '../activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '../activities/flash-cards/FlashCardsPreview';
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import MapaMentalPreview from '../activities/mapa-mental/MapaMentalPreview';

export const ModoApresentacaoAtividade: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [atividade, setAtividade] = useState<AtividadeDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarAtividade = async () => {
      if (!uniqueCode) {
        setError('Código da atividade não encontrado');
        setLoading(false);
        return;
      }

      try {
        console.log('🎯 [APRESENTAÇÃO] Carregando atividade:', uniqueCode);
        
        // Carregar atividade usando API service
        const response = await activitiesApiService.getActivityByCode(uniqueCode);
        
        if (!response.success || !response.data) {
          setError('Atividade não encontrada');
          setLoading(false);
          return;
        }

        // Converter ActivityData para AtividadeDados
        // Se response.data é array, pega primeiro item, senão usa direto
        const activityData: ActivityData = Array.isArray(response.data) ? response.data[0] : response.data;
        const atividadeConvertida: AtividadeDados = {
          id: activityData.codigo_unico,
          tipo: activityData.tipo,
          titulo: activityData.titulo || '',
          descricao: activityData.descricao || '',
          dados: activityData.conteudo || {},
          customFields: activityData.conteudo?.customFields || {}
        };

        console.log('✅ [APRESENTAÇÃO] Atividade carregada:', atividadeConvertida);
        setAtividade(atividadeConvertida);
        setLoading(false);
      } catch (err) {
        console.error('❌ [APRESENTAÇÃO] Erro ao carregar atividade:', err);
        setError('Erro ao carregar atividade');
        setLoading(false);
      }
    };

    carregarAtividade();
  }, [uniqueCode]);

  // Registrar visita automaticamente quando atividade é carregada
  useEffect(() => {
    const registrarVisita = async () => {
      if (!atividade || !uniqueCode) return;

      try {
        // Buscar dados do usuário logado (se houver)
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        
        await visitantesService.registrarVisita({
          codigo_atividade: uniqueCode,
          id_usuario_visitante: userId || undefined,
          tipo_visitante: userId ? 'registrado' : 'anonimo'
        });

        console.log('✅ [APRESENTAÇÃO] Visita registrada com sucesso');
      } catch (error) {
        console.error('⚠️ [APRESENTAÇÃO] Erro ao registrar visita (não crítico):', error);
        // Não bloquear a exibição da atividade se falhar o registro
      }
    };

    registrarVisita();
  }, [atividade, uniqueCode]);

  // Função para renderizar a pré-visualização baseada no tipo da atividade
  const renderActivityPreview = () => {
    if (!atividade) return null;

    const activityType = atividade.tipo;
    const activityData = atividade.dados || {};

    console.log('🎯 [APRESENTAÇÃO] Renderizando atividade:', { 
      tipo: activityType, 
      dados: activityData,
      atividade 
    });

    try {
      switch (activityType) {
        case 'lista-exercicios':
          return (
            <ExerciseListPreview
              data={activityData}
              customFields={atividade.customFields}
            />
          );

        case 'plano-aula':
          return (
            <PlanoAulaPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'sequencia-didatica':
          return (
            <SequenciaDidaticaPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'quiz-interativo':
          return (
            <QuizInterativoPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'flash-cards':
          return (
            <FlashCardsPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'quadro-interativo':
          return (
            <QuadroInterativoPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'mapa-mental':
          return (
            <MapaMentalPreview
              data={activityData}
            />
          );

        default:
          return (
            <ActivityPreview
              content={activityData}
              activityData={atividade}
            />
          );
      }
    } catch (error) {
      console.error('❌ [APRESENTAÇÃO] Erro ao renderizar preview:', error);
      return (
        <div className="flex items-center justify-center p-8 text-white">
          <div className="text-center">
            <p className="text-gray-300">Erro ao carregar atividade</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (error || !atividade) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Atividade não encontrada'}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 overflow-auto"
      style={{ isolation: 'isolate' }}
    >
      {/* Header com botão de voltar */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>

      {/* Conteúdo da Atividade em Tela Cheia - Totalmente Funcional */}
      <div className="w-full min-h-screen">
        {renderActivityPreview()}
      </div>
    </div>
  );
};

export default ModoApresentacaoAtividade;
