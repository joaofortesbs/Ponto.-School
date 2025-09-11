import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Target, BarChart3, FileText, Clock, Users, CheckCircle, GraduationCap } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Card de Aulas */}
          <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 border-2">
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
          <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 border-2">
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
          <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 border-2">
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

          {/* Card de Disciplina */}
          <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 border-2">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-blue-800 font-semibold text-sm mb-1">Disciplina</p>
              <p className="text-blue-600 font-bold text-xs">{sequenciaDidatica.disciplina}</p>
            </CardContent>
          </Card>

          {/* Card de Ano/Série */}
          <Card className="border-teal-300 bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300 border-2">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="h-6 w-6 text-teal-600" />
              </div>
              <p className="text-teal-800 font-semibold text-sm mb-1">Ano/Série</p>
              <p className="text-teal-600 font-bold text-xs">{sequenciaDidatica.anoSerie}</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade de Cards da Sequência */}
        {todosItens.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Estrutura da Sequência Didática
            </h3>
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
        {metadados?.competenciasBNCC && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Competências BNCC
              </h4>
              <p className="text-sm text-gray-600">{metadados.competenciasBNCC}</p>
            </CardContent>
          </Card>
        )}

        {metadados?.objetivosGerais && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objetivos Gerais
              </h4>
              <p className="text-sm text-gray-600">{metadados.objetivosGerais}</p>
            </CardContent>
          </Card>
        )}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {/* Card de Aulas */}
        <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 border-2">
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
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 border-2">
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
        <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 border-2">
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

        {/* Card de Disciplina */}
        <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 border-2">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-blue-800 font-semibold text-sm mb-1">Disciplina</p>
            <p className="text-blue-600 font-bold text-xs">{sequenciaDidatica.disciplina}</p>
          </CardContent>
        </Card>

        {/* Card de Ano/Série */}
        <Card className="border-teal-300 bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300 border-2">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-teal-800 font-semibold text-sm mb-1">Ano/Série</p>
            <p className="text-teal-600 font-bold text-xs">{sequenciaDidatica.anoSerie}</p>
          </CardContent>
        </Card>
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

export default SequenciaDidaticaPreview;