
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Target, BarChart3, FileText } from 'lucide-react';
import AulaCard from './components/AulaCard';
import DiagnosticoCard from './components/DiagnosticoCard';
import AvaliacaoCard from './components/AvaliacaoCard';
import SequenciaDidaticaHeader from './components/SequenciaDidaticaHeader';

interface SequenciaDidaticaPreviewProps {
  data: {
    sequenciaDidatica?: {
      titulo: string;
      disciplina: string;
      anoSerie: string;
      cargaHoraria?: string;
      descricaoGeral?: string;
      aulas?: Array<{
        id: string;
        tipo: 'Aula';
        titulo: string;
        objetivo: string;
        resumo: string;
        duracaoEstimada?: string;
        materiaisNecessarios?: string[];
        metodologia?: string;
        avaliacaoFormativa?: string;
      }>;
      diagnosticos?: Array<{
        id: string;
        tipo: 'Diagnostico';
        titulo: string;
        objetivo: string;
        resumo: string;
        instrumentos?: string[];
        momentoAplicacao?: string;
      }>;
      avaliacoes?: Array<{
        id: string;
        tipo: 'Avaliacao';
        titulo: string;
        objetivo: string;
        resumo: string;
        criteriosAvaliacao?: string[];
        instrumentos?: string[];
        valorPontuacao?: string;
      }>;
    };
    metadados?: {
      totalAulas: number;
      totalDiagnosticos: number;
      totalAvaliacoes: number;
      competenciasBNCC?: string;
      objetivosGerais?: string;
      generatedAt?: string;
      isGeneratedByAI?: boolean;
    };
    // Campos de fallback para compatibilidade
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
  };
}

export const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ data }) => {
  // Verificar se temos dados da IA gerados
  const hasGeneratedContent = data?.sequenciaDidatica && data?.metadados;

  if (hasGeneratedContent) {
    const { sequenciaDidatica, metadados } = data;
    
    // Combinar todos os itens em uma lista ordenada
    const todosItens = [
      ...(sequenciaDidatica.aulas || []),
      ...(sequenciaDidatica.diagnosticos || []),
      ...(sequenciaDidatica.avaliacoes || [])
    ].sort((a, b) => {
      // Ordenar por ID para manter uma ordem consistente
      return a.id.localeCompare(b.id);
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
                switch (item.tipo) {
                  case 'Aula':
                    return <AulaCard key={item.id} aula={item} />;
                  case 'Diagnostico':
                    return <DiagnosticoCard key={item.id} diagnostico={item} />;
                  case 'Avaliacao':
                    return <AvaliacaoCard key={item.id} avaliacao={item} />;
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

  // Fallback para exibição dos dados básicos (modo de compatibilidade)
  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho básico */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            {data.tituloTemaAssunto || 'Sequência Didática'}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.disciplina && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {data.disciplina}
              </span>
            )}
            {data.anoSerie && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                {data.anoSerie}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.quantidadeAulas && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
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

      {/* Aviso para construir a atividade */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Para visualizar a estrutura detalhada com as aulas, diagnósticos e avaliações, clique em "Construir Atividade" na aba de edição.
        </AlertDescription>
      </Alert>

      {/* Campos de texto se disponíveis */}
      {data.objetivosAprendizagem && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Objetivos de Aprendizagem</h4>
            <p className="text-sm text-gray-600">{data.objetivosAprendizagem}</p>
          </CardContent>
        </Card>
      )}

      {data.publicoAlvo && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Público-alvo</h4>
            <p className="text-sm text-gray-600">{data.publicoAlvo}</p>
          </CardContent>
        </Card>
      )}

      {data.cronograma && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Cronograma</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{data.cronograma}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
