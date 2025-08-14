import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Users, Clock, Calendar, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import AulaCard from './components/AulaCard';
import DiagnosticoCard from './components/DiagnosticoCard';
import AvaliacaoCard from './components/AvaliacaoCard';
import SequenciaDidaticaHeader from './components/SequenciaDidaticaHeader';
import { sequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
import { buildSequenciaDidaticaPrompt, SequenciaDidaticaPromptData } from '../../prompts/sequenciaDidaticaPrompt';

// Interfaces para os tipos de aula
interface AulaItem {
  titulo: string;
  objetivo: string;
  resumo: string;
  duracao?: string;
  materiais?: string[];
}

interface DiagnosticoItem {
  titulo: string;
  objetivo: string;
  resumo: string;
  tipo?: string;
  instrumentos?: string[];
}

interface AvaliacaoItem {
  titulo: string;
  objetivo: string;
  resumo: string;
  criterios?: string[];
  peso?: string;
}

interface SequenciaDidaticaGeneratedContent {
  sequenciaDidatica: {
    titulo: string;
    disciplina: string;
    anoSerie?: string;
    cargaHoraria?: string;
    descricaoGeral?: string;
    aulas: AulaItem[];
    diagnosticos: DiagnosticoItem[];
    avaliacoes: AvaliacaoItem[];
  };
  metadados: {
    isGeneratedByAI: boolean;
    generatedAt: string;
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
    competenciasBNCC?: string;
    objetivosGerais?: string;
  };
}

interface SequenciaDidaticaPreviewProps {
  formData: any;
  activityData?: any; // Dados adicionais da atividade
  isViewModal?: boolean; // Indica se está sendo usado no modal de visualização
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  formData, 
  activityData,
  isViewModal = false 
}) => {
  const [generatedContent, setGeneratedContent] = useState<SequenciaDidaticaGeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combinar dados do formData e activityData
  const combinedData = {
    ...formData,
    ...activityData,
    ...activityData?.originalData,
    ...activityData?.customFields
  };

  // Extrair dados do formData combinado
  const promptData: SequenciaDidaticaPromptData = {
    tituloTemaAssunto: combinedData?.tituloTemaAssunto || combinedData?.title || '',
    anoSerie: combinedData?.anoSerie || '',
    disciplina: combinedData?.disciplina || combinedData?.subject || '',
    bnccCompetencias: combinedData?.bnccCompetencias || '',
    publicoAlvo: combinedData?.publicoAlvo || '',
    objetivosAprendizagem: combinedData?.objetivosAprendizagem || combinedData?.description || '',
    quantidadeAulas: combinedData?.quantidadeAulas || '1',
    quantidadeDiagnosticos: combinedData?.quantidadeDiagnosticos || '0',
    quantidadeAvaliacoes: combinedData?.quantidadeAvaliacoes || '0',
    cronograma: combinedData?.cronograma || ''
  };

  // Gerar conteúdo automaticamente quando dados estão disponíveis
  useEffect(() => {
    if (promptData.tituloTemaAssunto && promptData.disciplina && promptData.objetivosAprendizagem) {
      handleGenerate();
    } else if (isViewModal && combinedData) {
      // No modal de visualização, tentar gerar com qualquer dado disponível
      handleGenerate();
    }
  }, [formData, activityData, isViewModal]);

  const handleGenerate = async () => {
    if (!promptData.tituloTemaAssunto && !promptData.disciplina) {
      setError('Dados insuficientes para gerar a sequência didática.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando geração de Sequência Didática...', { 
        promptData, 
        isViewModal,
        combinedData: Object.keys(combinedData)
      });

      const content = await sequenciaDidaticaGenerator.generateSequenciaDidatica(promptData);
      setGeneratedContent(content);
      console.log('✅ Sequência Didática gerada com sucesso:', content);
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      setError(error.message || 'Erro desconhecido na geração');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se temos dados da IA gerados
  const hasGeneratedContent = generatedContent?.sequenciaDidatica && generatedContent?.metadados;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-lg text-indigo-600">Gerando Sequência Didática...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (hasGeneratedContent) {
    const { sequenciaDidatica, metadados } = generatedContent;

    // Combinar todos os itens em uma lista ordenada
    const todosItens = [
      ...(sequenciaDidatica.aulas || []),
      ...(sequenciaDidatica.diagnosticos || []),
      ...(sequenciaDidatica.avaliacoes || [])
    ].sort((a, b) => {
      // Ordenar por ID para manter uma ordem consistente, se disponível, caso contrário, por título
      const idA = typeof a === 'object' && 'id' in a ? a.id : '';
      const idB = typeof b === 'object' && 'id' in b ? b.id : '';
      if (idA && idB) return idA.localeCompare(idB);
      
      const tituloA = typeof a === 'object' && 'titulo' in a ? a.titulo : '';
      const tituloB = typeof b === 'object' && 'titulo' in b ? b.titulo : '';
      return tituloA.localeCompare(tituloB);
    });

    return (
      <div className="space-y-6 p-4">
        {/* Cabeçalho da Sequência */}
        <SequenciaDidaticaHeader 
          sequencia={sequenciaDidatica}
          metadados={metadados}
        />

        {/* Grade de Cards */}
        {todosItens.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Estrutura da Sequência Didática
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todosItens.map((item) => {
                // Adicionar verificação de tipo antes de renderizar
                if (!item || typeof item !== 'object') return null;

                switch (item.tipo) {
                  case 'Aula':
                    return <AulaCard key={item.titulo || item.objetivo} aula={item as AulaItem} />;
                  case 'Diagnostico':
                    return <DiagnosticoCard key={item.titulo || item.objetivo} diagnostico={item as DiagnosticoItem} />;
                  case 'Avaliacao':
                    return <AvaliacaoCard key={item.titulo || item.objetivo} avaliacao={item as AvaliacaoItem} />;
                  default:
                    // Se o item não tiver tipo definido, tentar inferir pelo título ou exibir um placeholder
                    if (item.titulo) {
                      // Tentar inferir o tipo se possível, ou apenas exibir o título
                      return (
                        <Card key={item.titulo}>
                          <CardHeader>
                            <CardTitle>{item.titulo}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{item.resumo}</p>
                            {item.objetivo && <p className="text-sm text-gray-500 mt-2">Objetivo: {item.objetivo}</p>}
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                }
              })}
            </div>
          </div>
        ) : (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Nenhum conteúdo foi gerado ainda. Clique em "Construir Atividade" para gerar a sequência didática.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações Adicionais */}
        {metadados?.competenciasBNCC && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Competências BNCC</h4>
              <p className="text-sm text-gray-600">{metadados.competenciasBNCC}</p>
            </CardContent>
          </Card>
        )}

        {metadados?.objetivosGerais && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Objetivos Gerais</h4>
              <p className="text-sm text-gray-600">{metadados.objetivosGerais}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Fallback para exibição dos dados básicos (modo de compatibilidade) ou quando não há conteúdo gerado
  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho básico */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            {combinedData.tituloTemaAssunto || combinedData.title || 'Sequência Didática'}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {combinedData.disciplina && combinedData.disciplina !== '' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {combinedData.disciplina}
              </span>
            )}
            {combinedData.anoSerie && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                {combinedData.anoSerie}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(combinedData.quantidadeAulas && combinedData.quantidadeAulas !== '0') && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{combinedData.quantidadeAulas}</span>
                <span className="text-sm text-gray-600">Aulas</span>
              </div>
            </CardContent>
          </Card>
        )}

        {(combinedData.quantidadeDiagnosticos && combinedData.quantidadeDiagnosticos !== '0') && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{combinedData.quantidadeDiagnosticos}</span>
                <span className="text-sm text-gray-600">Diagnósticos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {(combinedData.quantidadeAvaliacoes && combinedData.quantidadeAvaliacoes !== '0') && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{combinedData.quantidadeAvaliacoes}</span>
                <span className="text-sm text-gray-600">Avaliações</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Aviso para construir a atividade */}
      {!hasGeneratedContent && (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription>
            {isViewModal
              ? 'Clique em "Gerar Atividade" para visualizar a estrutura detalhada.'
              : 'Para visualizar a estrutura detalhada com as aulas, diagnósticos e avaliações, clique em "Construir Atividade" na aba de edição.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Campos de texto se disponíveis */}
      {combinedData.objetivosAprendizagem && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Objetivos de Aprendizagem</h4>
            <p className="text-sm text-gray-600">{combinedData.objetivosAprendizagem}</p>
          </CardContent>
        </Card>
      )}

      {combinedData.publicoAlvo && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Público-alvo</h4>
            <p className="text-sm text-gray-600">{combinedData.publicoAlvo}</p>
          </CardContent>
        </Card>
      )}

      {combinedData.cronograma && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Cronograma</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{combinedData.cronograma}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;