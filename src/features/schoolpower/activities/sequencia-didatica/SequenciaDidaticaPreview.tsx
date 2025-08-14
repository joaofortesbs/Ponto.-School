
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen, Users, Calendar, FileText, BarChart3, Loader2 } from 'lucide-react';
import { AulaCard } from './components/AulaCard';
import { DiagnosticoCard } from './components/DiagnosticoCard';
import { AvaliacaoCard } from './components/AvaliacaoCard';
import { SequenciaDidaticaHeader } from './components/SequenciaDidaticaHeader';
import { SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
import type { SequenciaDidaticaResult, SequenciaDidaticaAula } from './SequenciaDidaticaBuilder';

interface SequenciaDidaticaPreviewProps {
  data: {
    tituloTemaAssunto?: string;
    anoSerie?: string;
    disciplina?: string;
    bnccCompetencias?: string;
    publicoAlvo?: string;
    objetivosAprendizagem?: string;
    quantidadeAulas?: string;
    quantidadeDiagnosticos?: string;
    quantidadeAvaliacoes?: string;
    cronograma?: string;
    // Dados gerados pela IA
    aulas?: SequenciaDidaticaAula[];
    metadados?: any;
  };
  activityData?: any;
  isGenerating?: boolean;
}

export const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isGenerating = false 
}) => {
  const [sequenciaResult, setSequenciaResult] = useState<SequenciaDidaticaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se já temos dados gerados
  const hasGeneratedData = data?.aulas && Array.isArray(data.aulas) && data.aulas.length > 0;

  useEffect(() => {
    const loadOrGenerateSequencia = async () => {
      try {
        // Se já temos dados gerados, usar eles
        if (hasGeneratedData) {
          console.log('📚 Usando dados já gerados:', data);
          setSequenciaResult({
            aulas: data.aulas!,
            metadados: data.metadados || {
              totalAulas: parseInt(data.quantidadeAulas || '3'),
              totalDiagnosticos: parseInt(data.quantidadeDiagnosticos || '1'),
              totalAvaliacoes: parseInt(data.quantidadeAvaliacoes || '1'),
              disciplina: data.disciplina || '',
              anoSerie: data.anoSerie || ''
            }
          });
          return;
        }

        // Tentar carregar do localStorage
        if (activityData?.id) {
          const stored = await SequenciaDidaticaGenerator.loadFromStorage(activityData.id);
          if (stored) {
            console.log('📚 Carregado do localStorage:', stored);
            setSequenciaResult(stored);
            return;
          }
        }

        // Se não temos dados suficientes para gerar, mostrar preview básico
        if (!data.tituloTemaAssunto || !data.quantidadeAulas) {
          console.log('📚 Dados insuficientes para gerar sequência');
          return;
        }

      } catch (error) {
        console.error('❌ Erro ao carregar sequência:', error);
        setError('Erro ao carregar sequência didática');
      }
    };

    loadOrGenerateSequencia();
  }, [data, activityData, hasGeneratedData]);

  const renderAulaCard = (aula: SequenciaDidaticaAula) => {
    switch (aula.tipo) {
      case 'Diagnostico':
        return <DiagnosticoCard key={aula.id} diagnostico={aula} />;
      case 'Avaliacao':
        return <AvaliacaoCard key={aula.id} avaliacao={aula} />;
      default:
        return <AulaCard key={aula.id} aula={aula} />;
    }
  };

  // Loading state
  if (loading || isGenerating) {
    return (
      <div className="space-y-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              <span className="text-orange-700 font-medium">Gerando Sequência Didática...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-700">
              <FileText className="h-12 w-12 mx-auto mb-2 text-red-400" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se temos sequência gerada, mostrar os cards
  if (sequenciaResult?.aulas && sequenciaResult.aulas.length > 0) {
    return (
      <div className="space-y-6">
        <SequenciaDidaticaHeader data={sequenciaResult} formData={data} />
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Plano de Atividades ({sequenciaResult.aulas.length} atividades)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sequenciaResult.aulas
              .sort((a, b) => a.ordem - b.ordem)
              .map(aula => renderAulaCard(aula))
            }
          </div>
        </div>
      </div>
    );
  }

  // Preview básico com dados do formulário
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <BookOpen className="h-5 w-5" />
            {data.tituloTemaAssunto || 'Sequência Didática'}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.disciplina && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {data.disciplina}
              </Badge>
            )}
            {data.anoSerie && (
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                {data.anoSerie}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Informações Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.publicoAlvo && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Público-alvo</span>
              </div>
              <p className="text-sm text-gray-600">{data.publicoAlvo}</p>
            </CardContent>
          </Card>
        )}

        {data.bnccCompetencias && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">BNCC / Competências</span>
              </div>
              <p className="text-sm text-gray-600">{data.bnccCompetencias}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Objetivos de Aprendizagem */}
      {data.objetivosAprendizagem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-orange-600" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {data.objetivosAprendizagem}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.quantidadeAulas && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{data.quantidadeAulas}</span>
                <span className="text-sm text-gray-600">Aulas</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.quantidadeDiagnosticos && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{data.quantidadeDiagnosticos}</span>
                <span className="text-sm text-gray-600">Diagnósticos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.quantidadeAvaliacoes && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{data.quantidadeAvaliacoes}</span>
                <span className="text-sm text-gray-600">Avaliações</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cronograma */}
      {data.cronograma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {data.cronograma}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem para gerar sequência */}
      {data.tituloTemaAssunto && data.quantidadeAulas && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="font-medium mb-1">Sequência Didática Pronta para Gerar</p>
              <p className="text-sm">Clique em "Construir Atividade" para gerar os cards das aulas</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
