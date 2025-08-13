import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  RefreshCw,
  LayoutGrid,
  Clock,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: any;
  activityData?: any;
  isBuilt?: boolean;
}

interface AulaCardProps {
  aula: any;
  index: number;
}

interface DiagnosticoCardProps {
  diagnostico: any;
  index: number;
}

interface AvaliacaoCardProps {
  avaliacao: any;
  index: number;
}

// Componente para exibir uma aula
const AulaCard: React.FC<AulaCardProps> = ({ aula, index }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {index + 1}
      </div>
      <h4 className="text-lg font-semibold text-gray-800">{aula.titulo}</h4>
    </div>

    <p className="text-sm text-gray-600 mb-3">
      <strong>Objetivo:</strong> {aula.objetivoEspecifico}
    </p>

    <p className="text-sm text-gray-600 mb-3">{aula.resumoContexto}</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
      <div className="bg-white p-3 rounded border">
        <strong className="text-green-600">Introdução:</strong>
        <p className="mt-1">{aula.passoAPasso?.introducao}</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <strong className="text-blue-600">Desenvolvimento:</strong>
        <p className="mt-1">{aula.passoAPasso?.desenvolvimento}</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <strong className="text-purple-600">Fechamento:</strong>
        <p className="mt-1">{aula.passoAPasso?.fechamento}</p>
      </div>
    </div>

    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
      <span>⏰ {aula.tempoEstimado}</span>
      <span>📚 {aula.recursos?.length || 0} recursos</span>
      <span>🎯 {aula.atividades?.length || 0} atividades</span>
    </div>
  </div>
);

// Componente para exibir um diagnóstico
const DiagnosticoCard: React.FC<DiagnosticoCardProps> = ({ diagnostico, index }) => (
  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border-l-4 border-orange-500">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
        D{index + 1}
      </div>
      <h5 className="font-semibold text-gray-800">{diagnostico.titulo}</h5>
    </div>

    <p className="text-sm text-gray-600 mb-2">{diagnostico.objetivo}</p>
    <p className="text-xs text-gray-500">
      <strong>Tipo:</strong> {diagnostico.tipo}
    </p>

    {diagnostico.instrumentos && (
      <div className="mt-2">
        <strong className="text-xs text-gray-600">Instrumentos:</strong>
        <div className="flex flex-wrap gap-1 mt-1">
          {diagnostico.instrumentos.map((instrumento: string, idx: number) => (
            <span key={idx} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {instrumento}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Componente para exibir uma avaliação
const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao, index }) => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
        A{index + 1}
      </div>
      <h5 className="font-semibold text-gray-800">{avaliacao.titulo}</h5>
    </div>

    <p className="text-sm text-gray-600 mb-2">{avaliacao.objetivo}</p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span><strong>Tipo:</strong> {avaliacao.tipo}</span>
      <span><strong>Peso:</strong> {avaliacao.peso || 10}</span>
    </div>

    {avaliacao.instrumentos && (
      <div className="mt-2">
        <strong className="text-xs text-gray-600">Instrumentos:</strong>
        <div className="flex flex-wrap gap-1 mt-1">
          {avaliacao.instrumentos.map((instrumento: string, idx: number) => (
            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {instrumento}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData, 
  isBuilt = false 
}) => {
  const [sequenciaData, setSequenciaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSequenciaData = async () => {
      try {
        console.log('🔍 Carregando dados da Sequência Didática:', { data, activityData, isBuilt });

        let loadedData = null;

        // Tentar carregar dados construídos
        if (isBuilt && data) {
          // Se já temos dados construídos
          loadedData = data;
        } else if (activityData?.id) {
          // Tentar carregar do localStorage
          const { SequenciaDidaticaBuilder } = await import('./SequenciaDidaticaBuilder'); // Assumindo que este arquivo existe e exporta SequenciaDidaticaBuilder
          loadedData = await SequenciaDidaticaBuilder.loadSequencia(activityData.id);
        }

        if (!loadedData && data) {
          // Fallback para dados do formulário
          loadedData = data;
        }

        console.log('📋 Dados carregados:', loadedData);
        setSequenciaData(loadedData);

      } catch (err) {
        console.error('❌ Erro ao carregar sequência:', err);
        setError('Erro ao carregar dados da sequência didática');
      } finally {
        setLoading(false);
      }
    };

    loadSequenciaData();
  }, [data, activityData, isBuilt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando sequência didática...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!sequenciaData) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-2">📚</div>
        <p className="text-gray-600">Nenhuma sequência didática encontrada</p>
        <p className="text-sm text-gray-400 mt-2">Construa a atividade para visualizar o conteúdo</p>
      </div>
    );
  }

  // Extrair dados da estrutura
  const metadados = sequenciaData.metadados || sequenciaData;
  const aulas = sequenciaData.aulas || [];
  const diagnosticos = sequenciaData.diagnosticos || [];
  const avaliacoes = sequenciaData.avaliacoes || [];
  const cronograma = sequenciaData.cronogramaSugerido;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          {metadados.tituloTemaAssunto || 'Sequência Didática'}
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            📚 {metadados.disciplina}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            🎓 {metadados.anoSerie}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            ⏰ {aulas.length} aulas
          </span>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-700">Público-alvo:</strong>
            <p className="text-gray-600 mt-1">{metadados.publicoAlvo}</p>
          </div>
          <div>
            <strong className="text-gray-700">Objetivos de Aprendizagem:</strong>
            <p className="text-gray-600 mt-1">{metadados.objetivosAprendizagem}</p>
          </div>
          <div>
            <strong className="text-gray-700">BNCC/Competências:</strong>
            <p className="text-gray-600 mt-1">{metadados.bnccCompetencias}</p>
          </div>
          {cronograma && (
            <div>
              <strong className="text-gray-700">Cronograma:</strong>
              <p className="text-gray-600 mt-1">{cronograma.duracao} - {cronograma.distribuicao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aulas */}
      {aulas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🎓 Aulas ({aulas.length})
          </h3>
          <div className="space-y-4">
            {aulas.map((aula: any, index: number) => (
              <AulaCard key={aula.id || index} aula={aula} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Diagnósticos */}
      {diagnosticos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🔍 Diagnósticos ({diagnosticos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosticos.map((diagnostico: any, index: number) => (
              <DiagnosticoCard key={diagnostico.id || index} diagnostico={diagnostico} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Avaliações */}
      {avaliacoes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📊 Avaliações ({avaliacoes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avaliacoes.map((avaliacao: any, index: number) => (
              <AvaliacaoCard key={avaliacao.id || index} avaliacao={avaliacao} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Rodapé com informações de geração */}
      {sequenciaData.generatedAt && (
        <div className="text-center text-xs text-gray-400 border-t pt-4">
          ✨ Gerado pela IA em {new Date(sequenciaData.generatedAt).toLocaleString('pt-BR')} 
          {sequenciaData.versao && ` • Versão ${sequenciaData.versao}`}
        </div>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;