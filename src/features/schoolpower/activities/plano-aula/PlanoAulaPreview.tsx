
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Target, 
  CheckCircle, 
  FileText, 
  Lightbulb,
  Edit3,
  Eye,
  Star,
  Calendar,
  GraduationCap,
  Layers,
  Zap,
  Mic,
  Group,
  PlayCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { motion } from 'framer-motion';

interface PlanoAulaPreviewProps {
  data: any;
  activityData?: any;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, activityData }) => {
  const [activeSection, setActiveSection] = useState('visao-geral');
  
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
  }

  // Seções do plano
  const sections = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Eye },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'metodologia', label: 'Metodologia', icon: Lightbulb },
    { id: 'desenvolvimento', label: 'Desenvolvimento', icon: Layers },
    { id: 'atividades', label: 'Atividades', icon: FileText },
    { id: 'avaliacao', label: 'Avaliação', icon: CheckCircle },
    { id: 'recursos', label: 'Recursos Extras', icon: Star }
  ];

  const handleExportPDF = () => {
    toast({
      title: "Exportação em desenvolvimento",
      description: "A funcionalidade de exportar PDF estará disponível em breve.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const renderVisaoGeral = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Informações Básicas</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Disciplina:</span>
              <p className="text-gray-900 dark:text-white">{plano.visao_geral.disciplina}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema:</span>
              <p className="text-gray-900 dark:text-white">{plano.visao_geral.tema}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Série:</span>
              <p className="text-gray-900 dark:text-white">{plano.visao_geral.serie}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Planejamento</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tempo:</span>
              <p className="text-gray-900 dark:text-white">{plano.visao_geral.tempo}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Metodologia:</span>
              <p className="text-gray-900 dark:text-white">{plano.visao_geral.metodologia}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Recursos Necessários</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {plano.visao_geral.recursos.map((recurso: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            >
              {recurso}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderObjetivos = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {plano.objetivos.map((objetivo: any, index: number) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{index + 1}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white mb-2">{objetivo.descricao}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">BNCC:</span> {objetivo.habilidade_bncc}
              </div>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );

  const renderMetodologia = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{plano.metodologia.nome}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{plano.metodologia.descricao}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Metodologias Alternativas:</h4>
            <div className="flex flex-wrap gap-2">
              {plano.metodologia.alternativas.map((alt: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                >
                  {alt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDesenvolvimento = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {plano.desenvolvimento.map((etapa: any, index: number) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Etapa {etapa.etapa}: {etapa.titulo}
            </h3>
            <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              {etapa.tempo_estimado}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{etapa.descricao}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Tipo de Interação:</span>
              <p className="text-gray-900 dark:text-white">{etapa.tipo_interacao}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Recurso:</span>
              <p className="text-gray-900 dark:text-white">{etapa.recurso_gerado}</p>
            </div>
          </div>
          {etapa.nota_privada_professor && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Nota do Professor:</strong> {etapa.nota_privada_professor}
              </p>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );

  const renderAtividades = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {plano.atividades.map((atividade: any, index: number) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{atividade.nome}</h3>
            <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              {atividade.tipo}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{atividade.visualizar_como_aluno}</p>
          {atividade.sugestoes_ia && atividade.sugestoes_ia.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sugestões da IA:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                {atividade.sugestoes_ia.map((sugestao: string, idx: number) => (
                  <li key={idx}>{sugestao}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );

  const renderAvaliacao = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Critérios de Avaliação</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{plano.avaliacao.criterios}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Instrumentos de Avaliação:</h4>
            <div className="flex flex-wrap gap-2">
              {plano.avaliacao.instrumentos.map((instrumento: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                >
                  {instrumento}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderRecursos = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Materiais Complementares</h3>
          <ul className="space-y-2">
            {plano.recursos_extras.materiais_complementares.map((material: string, index: number) => (
              <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                {material}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tecnologias</h3>
          <div className="flex flex-wrap gap-2">
            {plano.recursos_extras.tecnologias.map((tech: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'visao-geral':
        return renderVisaoGeral();
      case 'objetivos':
        return renderObjetivos();
      case 'metodologia':
        return renderMetodologia();
      case 'desenvolvimento':
        return renderDesenvolvimento();
      case 'atividades':
        return renderAtividades();
      case 'avaliacao':
        return renderAvaliacao();
      case 'recursos':
        return renderRecursos();
      default:
        return renderVisaoGeral();
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {plano.titulo}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {plano.descricao}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Imprimir
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex space-x-1 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default PlanoAulaPreview;
