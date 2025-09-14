import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Target, BarChart3, FileText, Clock, Users, CheckCircle, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import AulaCard from './components/AulaCard';
import DiagnosticoCard from './components/DiagnosticoCard';
import AvaliacaoCard from './components/AvaliacaoCard';
import SequenciaDidaticaHeader from './components/SequenciaDidaticaHeader';

interface SequenciaDidaticaPreviewProps {
  data?: any;
  activityData?: any;
}

export const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ data, activityData }) => {
  console.log('🎯 SequenciaDidaticaPreview: Dados recebidos:', { data, activityData });

  // Função para recuperar dados reais da IA do Gemini
  const getSequenciaDidaticaData = () => {
    console.log('🔍 Buscando dados da Sequência Didática...');
    console.log('📊 Data recebida:', data);
    console.log('📊 ActivityData recebida:', activityData);

    // 1. Prioridade: dados passados como prop que já vieram da IA
    if (data && data.sequenciaDidatica) {
      console.log('✅ Usando dados da prop principal (gerados pela IA)');
      return data;
    }

    // 2. Verificar se data já tem estrutura de sequência didática completa
    if (data && data.metadados && (data.aulas || data.diagnosticos || data.avaliacoes)) {
      console.log('✅ Data já tem estrutura completa de sequência didática');
      return data;
    }

    // 3. Verificar dados da IA no formato direto
    if (data && (data.aulas || data.diagnosticos || data.avaliacoes)) {
      console.log('✅ Convertendo dados diretos da IA');
      return {
        sequenciaDidatica: data,
        metadados: data.metadados || {
          totalAulas: data.aulas?.length || 0,
          totalDiagnosticos: data.diagnosticos?.length || 0,
          totalAvaliacoes: data.avaliacoes?.length || 0,
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        }
      };
    }

    // 4. Verificar se data tem campos de formulário da sequência didática
    if (data && (data.tituloTemaAssunto || data.quantidadeAulas || data.disciplina)) {
      console.log('✅ Usando dados de formulário para estrutura básica');
      return {
        sequenciaDidatica: {
          titulo: data.tituloTemaAssunto || data.title || 'Sequência Didática',
          disciplina: data.disciplina || data.subject || 'Disciplina',
          anoSerie: data.anoSerie || data.schoolYear || 'Ano/Série',
          descricaoGeral: data.objetivosAprendizagem || data.description || 'Objetivos de aprendizagem',
          aulas: [],
          diagnosticos: [],
          avaliacoes: []
        },
        metadados: {
          totalAulas: parseInt(data.quantidadeAulas) || 0,
          totalDiagnosticos: parseInt(data.quantidadeDiagnosticos) || 0,
          totalAvaliacoes: parseInt(data.quantidadeAvaliacoes) || 0,
          isGeneratedByAI: false,
          generatedAt: new Date().toISOString()
        }
      };
    }

    // 3. Buscar no localStorage por dados construídos da IA
    const activityId = activityData?.id || data?.id;
    if (activityId) {
      const storageKeys = [
        `constructed_sequencia-didatica_${activityId}`,
        `schoolpower_sequencia-didatica_content`,
        `activity_${activityId}`
      ];

      for (const key of storageKeys) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log(`✅ Dados encontrados em ${key}:`, parsedData);

            // Verificar se é estrutura de sequência didática válida
            if (parsedData.sequenciaDidatica || parsedData.aulas || parsedData.diagnosticos || parsedData.avaliacoes) {
              return parsedData.sequenciaDidatica ? parsedData : {
                sequenciaDidatica: parsedData,
                metadados: parsedData.metadados || {
                  totalAulas: parsedData.aulas?.length || 0,
                  totalDiagnosticos: parsedData.diagnosticos?.length || 0,
                  totalAvaliacoes: parsedData.avaliacoes?.length || 0,
                  isGeneratedByAI: true,
                  generatedAt: new Date().toISOString()
                }
              };
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
          }
        }
      }
    }

    // 4. Verificar se há dados de formulário para mostrar como placeholder
    if (data && (data.tituloTemaAssunto || data.quantidadeAulas)) {
      console.log('📋 Usando dados do formulário como placeholder');
      return {
        sequenciaDidatica: {
          titulo: data.tituloTemaAssunto || data.titulo || 'Sequência Didática',
          disciplina: data.disciplina || 'Disciplina',
          anoSerie: data.anoSerie || 'Ano/Série',
          descricaoGeral: data.objetivosAprendizagem || 'Objetivos de aprendizagem',
          aulas: [],
          diagnosticos: [],
          avaliacoes: []
        },
        metadados: {
          totalAulas: parseInt(data.quantidadeAulas) || 0,
          totalDiagnosticos: parseInt(data.quantidadeDiagnosticos) || 0,
          totalAvaliacoes: parseInt(data.quantidadeAvaliacoes) || 0,
          isGeneratedByAI: false,
          generatedAt: new Date().toISOString()
        }
      };
    }

    console.log('⚠️ Nenhum dado encontrado');
    return null;
  };

  const sequenciaData = getSequenciaDidaticaData();

  // Se não há dados, mostrar mensagem de carregamento/construção
  if (!sequenciaData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-orange-700 dark:text-orange-300 text-center font-medium">
          Pronto para gerar Sequência Didática
        </p>
        <p className="text-sm text-orange-600 dark:text-orange-400 text-center mt-2">
          Clique em "Construir Atividade" para gerar com IA do Gemini
        </p>
      </div>
    );
  }

  const { sequenciaDidatica, metadados } = sequenciaData;

  // Verificar se tem conteúdo gerado pela IA
  const hasGeneratedContent = sequenciaDidatica && (
    (sequenciaDidatica.aulas && sequenciaDidatica.aulas.length > 0) ||
    (sequenciaDidatica.diagnosticos && sequenciaDidatica.diagnosticos.length > 0) ||
    (sequenciaDidatica.avaliacoes && sequenciaDidatica.avaliacoes.length > 0)
  );

  // Se há conteúdo gerado pela IA, mostrar a estrutura completa
  if (hasGeneratedContent) {
    // Combinar todos os itens em uma lista ordenada
    const todosItens = [
      ...(sequenciaDidatica.aulas || []).map(item => ({ ...item, tipo: 'Aula' })),
      ...(sequenciaDidatica.diagnosticos || []).map(item => ({ ...item, tipo: 'Diagnostico' })),
      ...(sequenciaDidatica.avaliacoes || []).map(item => ({ ...item, tipo: 'Avaliacao' }))
    ].sort((a, b) => {
      // Ordenar por ID para manter uma ordem consistente
      return (a.id || '').localeCompare(b.id || '');
    });

    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Principal */}
        <SequenciaDidaticaHeader 
          sequencia={sequenciaDidatica}
          metadados={metadados}
        />

        {/* Cards de Estatísticas Melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card de Aulas */}
          <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-600 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {metadados.totalAulas}
                </div>
              </div>
              <p className="text-orange-800 dark:text-orange-300 font-semibold text-sm">Aulas</p>
            </CardContent>
          </Card>

          {/* Card de Diagnósticos */}
          <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-600 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metadados.totalDiagnosticos}
                </div>
              </div>
              <p className="text-green-800 dark:text-green-300 font-semibold text-sm">Diagnósticos</p>
            </CardContent>
          </Card>

          {/* Card de Avaliações */}
          <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-600 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {metadados.totalAvaliacoes}
                </div>
              </div>
              <p className="text-purple-800 dark:text-purple-300 font-semibold text-sm">Avaliações</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade de Cards da Sequência */}
        {todosItens.length > 0 ? (
          <div>
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl border border-orange-200 dark:border-orange-700">
              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 rounded-lg shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                Estrutura da Sequência Didática
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todosItens.map((item, index) => {
                const itemKey = item.id || `item-${index}`;

                switch (item.tipo) {
                  case 'Aula':
                    return <AulaCard key={itemKey} aula={item} />;
                  case 'Diagnostico':
                    return <DiagnosticoCard key={itemKey} diagnostico={item} />;
                  case 'Avaliacao':
                    return <AvaliacaoCard key={itemKey} avaliacao={item} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ) : (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              A estrutura da sequência didática foi criada, mas ainda não há conteúdo detalhado.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações Adicionais */}
        <CompetenciasBNCCCard competencias={metadados?.competenciasBNCC} />
        <ObjetivosGeraisCard objetivos={metadados?.objetivosGerais} />
      </div>
    );
  }

  // Fallback: mostrar informações básicas (quando só há dados do formulário)
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Principal */}
      <SequenciaDidaticaHeader 
        sequencia={sequenciaDidatica}
        metadados={metadados}
      />

      {/* Cards de Estatísticas Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Card de Aulas */}
        <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {metadados.totalAulas}
              </div>
            </div>
            <p className="text-orange-800 font-semibold text-sm">Aulas</p>
          </CardContent>
        </Card>

        {/* Card de Diagnósticos */}
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {metadados.totalDiagnosticos}
              </div>
            </div>
            <p className="text-green-800 font-semibold text-sm">Diagnósticos</p>
          </CardContent>
        </Card>

        {/* Card de Avaliações */}
        <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {metadados.totalAvaliacoes}
              </div>
            </div>
            <p className="text-purple-800 font-semibold text-sm">Avaliações</p>
          </CardContent>
        </Card>
      </div>

      {/* Título da Estrutura */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl border border-orange-200 dark:border-orange-700">
        <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          Estrutura da Sequência Didática
        </h3>
      </div>

      {/* Aviso para construir a atividade */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Para visualizar a estrutura detalhada com as aulas, diagnósticos e avaliações, clique em "Construir Atividade" na aba de edição.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Componente para Competências BNCC
const CompetenciasBNCCCard: React.FC<{ competencias?: string }> = ({ competencias }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!competencias) return null;

  return (
    <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-600 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
      <CardContent className="pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/20 -m-2 p-2 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 transition-colors duration-200 hover:text-blue-800 dark:hover:text-blue-200">
            <div className="p-1.5 bg-blue-600 dark:bg-blue-500 rounded-lg shadow-sm">
              <Target className="h-4 w-4 text-white" />
            </div>
            Competências BNCC
          </h4>
          {isExpanded ? 
            <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:text-blue-700 dark:hover:text-blue-300" /> : 
            <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:text-blue-700 dark:hover:text-blue-300" />
          }
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-blue-200 dark:border-blue-600">
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{competencias}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para Objetivos Gerais
const ObjetivosGeraisCard: React.FC<{ objetivos?: string }> = ({ objetivos }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!objetivos) return null;

  return (
    <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-600 dark:from-emerald-900/30 dark:to-emerald-800/30 hover:shadow-lg transition-all duration-300 border-2 rounded-2xl">
      <CardContent className="pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 -m-2 p-2 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <h4 className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 transition-colors duration-200 hover:text-emerald-800 dark:hover:text-emerald-200">
            <div className="p-1.5 bg-emerald-600 dark:bg-emerald-500 rounded-lg shadow-sm">
              <Target className="h-4 w-4 text-white" />
            </div>
            Objetivos Gerais
          </h4>
          {isExpanded ? 
            <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-all duration-200 hover:text-emerald-700 dark:hover:text-emerald-300" /> : 
            <ChevronRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-all duration-200 hover:text-emerald-700 dark:hover:text-emerald-300" />
          }
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-emerald-200 dark:border-emerald-600">
              <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{objetivos}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaPreview;