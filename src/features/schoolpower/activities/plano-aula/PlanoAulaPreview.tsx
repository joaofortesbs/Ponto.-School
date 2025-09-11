import React, { useState, useEffect, useMemo } from 'react';
// Imports não são mais necessários - interface simplificada
// Import apenas necessário para estado vazio
import { BookOpen } from 'lucide-react';

// Importar apenas a interface de Desenvolvimento
import DesenvolvimentoInterface from './sections/desenvolvimento/DesenvolvimentoInterface';

// Importar o integrador de desenvolvimento
import { DesenvolvimentoIntegrator } from './sections/desenvolvimento/DesenvolvimentoIntegrator';


interface PlanoAulaPreviewProps {
  data: any;
  activityData?: any;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData }) => {
  // Estados para a interface de desenvolvimento

  // Integrador para sincronização de dados de desenvolvimento
  const [desenvolvimentoData, setDesenvolvimentoData] = useState<any>(null);
  const [planoId] = useState(() => activityData?.id || `plano-${Date.now()}`);

  console.log('🔍 PlanoAulaPreview - Data recebida:', data);
  console.log('🔍 PlanoAulaPreview - ActivityData recebida:', activityData);

  // Tenta usar data primeiro, depois activityData, e por último dados padrão
  const planoData = data || activityData;

  console.log('📚 PlanoAulaPreview - Estrutura dos dados:', {
    hasData: !!planoData,
    hasVisaoGeral: planoData?.visao_geral,
    hasTitle: planoData?.titulo || planoData?.title,
    dataStructure: planoData ? Object.keys(planoData) : [],
    fullData: planoData
  });

  console.log('🎯 PlanoAulaPreview - Análise detalhada dos dados:');
  console.log('  - Título:', planoData?.titulo || planoData?.title);
  console.log('  - Descrição:', planoData?.descricao || planoData?.description);
  console.log('  - Disciplina:', planoData?.disciplina || planoData?.visao_geral?.disciplina);
  console.log('  - Tema:', planoData?.tema || planoData?.theme || planoData?.titulo || planoData?.title);
  console.log('  - Série:', planoData?.serie || planoData?.visao_geral?.serie);
  console.log('  - Tempo:', planoData?.tempo || planoData?.visao_geral?.tempo);
  console.log('  - Metodologia:', planoData?.metodologia || planoData?.visao_geral?.metodologia);
  console.log('  - Recursos:', planoData?.recursos || planoData?.visao_geral?.recursos);
  console.log('  - Objetivos:', planoData?.objetivos);
  console.log('  - Materiais:', planoData?.materiais);
  console.log('  - Observações:', planoData?.observacoes);
  console.log('  - Competências:', planoData?.competencias);
  console.log('  - Contexto:', planoData?.contexto);

  if (!planoData || (typeof planoData === 'object' && Object.keys(planoData).length === 0)) {
    console.log('⚠️ PlanoAulaPreview - Dados vazios ou inválidos, exibindo estado vazio');
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Plano de Aula não gerado
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Preencha os campos e clique em "Construir Atividade" para gerar o plano de aula
        </p>
      </div>
    );
  }

  // Se não tem estrutura de plano completo, cria uma estrutura básica
  let plano = planoData;
  if (!plano || !plano.visao_geral) {
    console.log('🔨 PlanoAulaPreview - Criando estrutura básica do plano');

    // Garantir que plano existe
    if (!plano) {
      plano = {};
    }

    plano = {
      titulo: plano.titulo || plano.title || 'Plano de Aula',
      descricao: plano.descricao || plano.description || 'Descrição do plano de aula',
      visao_geral: {
        disciplina: plano.disciplina || plano.subject || 'Disciplina',
        tema: plano.tema || plano.theme || plano.titulo || plano.title || 'Tema',
        serie: plano.serie || plano.anoEscolaridade || plano.schoolYear || 'Série',
        tempo: plano.tempo || plano.tempoLimite || plano.timeLimit || 'Tempo',
        metodologia: plano.metodologia || plano.tipoAula || plano.difficultyLevel || 'Metodologia',
        recursos: plano.recursos && Array.isArray(plano.recursos) ? plano.recursos : (plano.materiais ? [plano.materiais] : ['Recursos não especificados']),
        sugestoes_ia: ['Plano de aula personalizado']
      },
      objetivos: plano.objetivos && Array.isArray(plano.objetivos) && plano.objetivos.length > 0 ? plano.objetivos.map(obj => ({
        descricao: typeof obj === 'string' ? obj : (obj && obj.descricao) || obj || 'Objetivo não especificado',
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      })) : plano.objetivos && typeof plano.objetivos === 'string' ? [{
        descricao: plano.objetivos,
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      }] : [{
        descricao: 'Objetivo não especificado',
        habilidade_bncc: plano.competencias || 'BNCC não especificada',
        sugestao_reescrita: '',
        atividade_relacionada: ''
      }],
      metodologia: {
        nome: (plano.metodologia && typeof plano.metodologia === 'string' ? plano.metodologia : '') || plano.tipoAula || plano.difficultyLevel || 'Metodologia Ativa',
        descricao: plano.descricaoMetodologia || plano.descricao || plano.description || 'Descrição da metodologia',
        alternativas: ['Aula expositiva', 'Atividades práticas'],
        simulacao_de_aula: 'Simulação disponível',
        explicacao_em_video: 'Video explicativo disponível'
      },
      desenvolvimento: plano.desenvolvimento && Array.isArray(plano.desenvolvimento) && plano.desenvolvimento.length > 0 ? plano.desenvolvimento : [
        {
          etapa: 1,
          titulo: 'Introdução',
          descricao: 'Apresentação do tema',
          tipo_interacao: 'Exposição',
          tempo_estimado: '15 min',
          recurso_gerado: 'Slides',
          nota_privada_professor: 'Contextualizar o tema'
        },
        {
          etapa: 2,
          titulo: 'Desenvolvimento',
          descricao: 'Explicação do conteúdo principal',
          tipo_interacao: 'Interativa',
          tempo_estimado: '25 min',
          recurso_gerado: 'Material didático',
          nota_privada_professor: 'Verificar compreensão'
        },
        {
          etapa: 3,
          titulo: 'Finalização',
          descricao: 'Síntese e avaliação',
          tipo_interacao: 'Avaliativa',
          tempo_estimado: '10 min',
          recurso_gerado: 'Atividade de fixação',
          nota_privada_professor: 'Aplicar avaliação'
        }
      ],
      atividades: plano.atividades && Array.isArray(plano.atividades) && plano.atividades.length > 0 ? plano.atividades : [
        {
          nome: 'Atividade Principal',
          tipo: 'Prática',
          ref_objetivos: [1],
          visualizar_como_aluno: 'Atividade interativa',
          sugestoes_ia: ['Personalize conforme necessário']
        }
      ],
      avaliacao: {
        criterios: plano.avaliacao || plano.observacoes || plano.evaluation || 'Critérios não especificados',
        instrumentos: ['Observação', 'Participação'],
        feedback: 'Feedback personalizado'
      },
      recursos_extras: {
        materiais_complementares: plano.materiais && typeof plano.materiais === 'string' ? [plano.materiais] : plano.materiais && Array.isArray(plano.materiais) ? plano.materiais : ['Material não especificado'],
        tecnologias: ['Quadro', 'Projetor'],
        referencias: ['Bibliografia básica']
      }
    };

    console.log('✅ PlanoAulaPreview - Estrutura básica criada:', plano);
  };

  // Funções removidas - agora só temos a interface de Desenvolvimento

  const handleUpdateApproval = (approved: boolean) => {
    console.log('🔄 Atualização de aprovação:', approved);
  };

  // Handler para mudanças nos dados de desenvolvimento
  const handleDesenvolvimentoChange = (data: any) => {
    console.log('🔄 Dados de desenvolvimento alterados:', data);
    setDesenvolvimentoData(data);

    // Sincronizar com outras seções
    DesenvolvimentoIntegrator.sincronizarComOutrasSecoes(data, planoId);
  };

  // Preparar contexto completo para as seções
  const contextoCompleto = useMemo(() => {
    return DesenvolvimentoIntegrator.coletarContextoCompleto(activityData, data);
  }, [activityData, data]);

  // Efeito para inicializar dados da seção
  useEffect(() => {
    if (activityData?.originalData) {
      console.log('📊 PlanoAulaPreview: Inicializando com dados da atividade', activityData.originalData);

      // Processar dados de desenvolvimento se disponível
      if (activityData.originalData.desenvolvimento) {
        const dadosProcessados = DesenvolvimentoIntegrator.processarDados(
          activityData.originalData,
          planoId
        );
        setDesenvolvimentoData(dadosProcessados);
        console.log('🔄 PlanoAulaPreview: Dados de desenvolvimento processados', dadosProcessados);
      }
    }
  }, [activityData, planoId]);

  // Efeito para reprocessar dados quando desenvolvimento mudar
  useEffect(() => {
    if (desenvolvimentoData && activityData?.originalData) {
      console.log('🔄 PlanoAulaPreview: Reprocessando dados após mudança no desenvolvimento');

      // Reprocessar dados para garantir sincronização
      const dadosAtualizados = DesenvolvimentoIntegrator.processarDados(
        {
          ...activityData.originalData,
          desenvolvimento: desenvolvimentoData
        },
        planoId
      );

      console.log('✅ PlanoAulaPreview: Dados sincronizados', dadosAtualizados);
    }
  }, [desenvolvimentoData, activityData, planoId]);


  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Layout Principal - Agora apenas com a interface de Desenvolvimento */}
      <div className="flex-1 h-full">
        {/* Renderizar diretamente a interface de Desenvolvimento da Aula */}
        <DesenvolvimentoInterface
          data={data}
          contextoPlano={contextoCompleto}
          onDataChange={handleDesenvolvimentoChange}
        />
      </div>
    </div>
  );
};

export default PlanoAulaPreview;