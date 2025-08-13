import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  Clock,
  BookOpen,
  LayoutGrid,
  List,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Importar os componentes
import { 
  SequenciaDidaticaHeader,
  AulaCard,
  DiagnosticoCard,
  AvaliacaoCard
} from './components';

// Importar tipos e builder
import { SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';
import { SequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';

interface SequenciaDidaticaPreviewProps {
  data: any;
  activityData?: any;
  isBuilt?: boolean;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isBuilt = false 
}) => {
  console.log('📚 SequenciaDidaticaPreview - Dados recebidos:', { data, activityData, isBuilt });

  // Estados para visualização
  const [viewMode, setViewMode] = useState('cards');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sequenciaCompleta, setSequenciaCompleta] = useState<SequenciaDidaticaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados da sequência
  useEffect(() => {
    const carregarSequencia = () => {
      console.log('🔄 Carregando dados da sequência...');

      // Primeiro, tentar recuperar dados já processados
      let sequenciaData: SequenciaDidaticaCompleta | null = null;

      // Verificar se data já é uma sequência completa
      if (data && typeof data === 'object' && data.aulas && data.diagnosticos && data.avaliacoes) {
        console.log('✅ Dados já estão no formato completo');
        sequenciaData = data as SequenciaDidaticaCompleta;
      } 
      // Tentar carregar do localStorage
      else if (data?.id) {
        console.log('🔍 Tentando carregar do localStorage...');
        sequenciaData = SequenciaDidaticaBuilder.recuperarSequencia(data.id);
      }
      // Verificar activityData
      else if (activityData?.id) {
        console.log('🔍 Tentando carregar activityData do localStorage...');
        sequenciaData = SequenciaDidaticaBuilder.recuperarSequencia(activityData.id);
      }

      if (sequenciaData) {
        console.log('📋 Sequência carregada:', sequenciaData);
        setSequenciaCompleta(sequenciaData);
      } else {
        console.log('⚠️ Nenhuma sequência completa encontrada');
        // Se ainda assim temos dados básicos, criar estrutura mínima
        if (data || activityData) {
          const dadosBasicos = data || activityData;
          console.log('🔧 Criando estrutura básica com:', dadosBasicos);
          setSequenciaCompleta(criarEstruturaBasica(dadosBasicos));
        }
      }
    };

    carregarSequencia();
  }, [data, activityData, isBuilt]);

  // Função para criar estrutura básica quando não há dados completos
  const criarEstruturaBasica = (dadosBasicos: any): SequenciaDidaticaCompleta => {
    const customFields = dadosBasicos?.customFields || {};

    return {
      id: dadosBasicos?.id || `sequencia-${Date.now()}`,
      titulo: customFields['Título do Tema / Assunto'] || dadosBasicos?.title || 'Sequência Didática',
      disciplina: customFields['Disciplina'] || dadosBasicos?.subject || 'Disciplina',
      anoSerie: customFields['Ano / Série'] || dadosBasicos?.schoolYear || 'Ano/Série',
      objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || dadosBasicos?.objectives || 'Desenvolver competências específicas',
      publicoAlvo: customFields['Público-alvo'] || 'Estudantes do ensino fundamental/médio',
      bnccCompetencias: customFields['BNCC / Competências'] || '',
      cronograma: customFields['Cronograma'] || 'A ser desenvolvido',
      aulas: [],
      diagnosticos: [],
      avaliacoes: [],
      resumoEstatistico: {
        totalAulas: parseInt(customFields['Quantidade de Aulas'] || '4'),
        totalDiagnosticos: parseInt(customFields['Quantidade de Diagnósticos'] || '2'),
        totalAvaliacoes: parseInt(customFields['Quantidade de Avaliações'] || '2'),
        tempoTotalMinutos: 0
      },
      metadados: {
        dataGeracao: new Date().toISOString(),
        versao: "1.0",
        sistemaGerador: "School Power IA"
      }
    };
  };

  // Funções de navegação e interação
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    console.log('🔄 Modo de visualização alterado para:', mode);
  };

  const handleRegenerateSequence = async () => {
    console.log('🔄 Regenerando sequência didática...');
    setIsLoading(true);

    try {
      // Simular regeneração - em produção, chamaria o gerador novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Sequência regenerada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao regenerar sequência:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Estado de loading
  if (!sequenciaCompleta) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Carregando Sequência Didática
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Preparando a visualização da sua sequência didática...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 overflow-x-auto">
      {/* Cabeçalho Flutuante */}
      <SequenciaDidaticaHeader
        tituloTemaAssunto={sequenciaCompleta.titulo}
        objetivosAprendizagem={sequenciaCompleta.objetivosAprendizagem}
        quantidadeAulas={sequenciaCompleta.resumoEstatistico.totalAulas}
        quantidadeDiagnosticos={sequenciaCompleta.resumoEstatistico.totalDiagnosticos}
        quantidadeAvaliacoes={sequenciaCompleta.resumoEstatistico.totalAvaliacoes}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRegenerateSequence={handleRegenerateSequence}
        currentDate={currentDate}
        onNavigateMonth={navigateMonth}
        calendarDays={generateCalendar()}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        monthNames={monthNames}
      />

      {/* Informações Básicas */}
      <Card className="border-l-4 border-l-[#FF6B00]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Disciplina</h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaCompleta.disciplina}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Ano/Série</h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaCompleta.anoSerie}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Público-alvo</h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaCompleta.publicoAlvo}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Cronograma</h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaCompleta.cronograma}</p>
            </div>
          </div>

          {sequenciaCompleta.bnccCompetencias && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Competências BNCC</h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaCompleta.bnccCompetencias}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aulas */}
      {sequenciaCompleta.aulas && sequenciaCompleta.aulas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Aulas ({sequenciaCompleta.aulas.length})
          </h3>
          <div className="grid gap-4">
            {sequenciaCompleta.aulas.map((aula, index) => (
              <AulaCard key={aula.id || index} aula={aula} />
            ))}
          </div>
        </div>
      )}

      {/* Diagnósticos */}
      {sequenciaCompleta.diagnosticos && sequenciaCompleta.diagnosticos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Avaliações Diagnósticas ({sequenciaCompleta.diagnosticos.length})
          </h3>
          <div className="grid gap-4">
            {sequenciaCompleta.diagnosticos.map((diagnostico, index) => (
              <DiagnosticoCard key={diagnostico.id || index} diagnostico={diagnostico} />
            ))}
          </div>
        </div>
      )}

      {/* Avaliações */}
      {sequenciaCompleta.avaliacoes && sequenciaCompleta.avaliacoes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Avaliações ({sequenciaCompleta.avaliacoes.length})
          </h3>
          <div className="grid gap-4">
            {sequenciaCompleta.avaliacoes.map((avaliacao, index) => (
              <AvaliacaoCard key={avaliacao.id || index} avaliacao={avaliacao} />
            ))}
          </div>
        </div>
      )}

      {/* Resumo Estatístico */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Resumo Estatístico
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B00]">
                {sequenciaCompleta.resumoEstatistico.totalAulas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Aulas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sequenciaCompleta.resumoEstatistico.totalDiagnosticos}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Diagnósticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sequenciaCompleta.resumoEstatistico.totalAvaliacoes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avaliações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(sequenciaCompleta.resumoEstatistico.tempoTotalMinutos / 60)}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Tempo Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span>Gerado por: {sequenciaCompleta.metadados.sistemaGerador}</span>
            <span>Data: {new Date(sequenciaCompleta.metadados.dataGeracao).toLocaleDateString('pt-BR')}</span>
            <span>Versão: {sequenciaCompleta.metadados.versao}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SequenciaDidaticaPreview;