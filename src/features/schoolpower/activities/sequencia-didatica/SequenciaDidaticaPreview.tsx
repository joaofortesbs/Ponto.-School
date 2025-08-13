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

// Importar tipos
import { SequenciaDidaticaCompleta } from './SequenciaDidaticaGenerator';
import { sequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';

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
        sequenciaData = sequenciaDidaticaBuilder.recuperarSequencia(data.id);
      }
      // Verificar activityData
      else if (activityData?.id) {
        console.log('🔍 Tentando carregar activityData do localStorage...');
        sequenciaData = sequenciaDidaticaBuilder.recuperarSequencia(activityData.id);
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

  // Verificar se há dados válidos
  const hasValidData = sequenciaCompleta && (
    sequenciaCompleta.aulas?.length > 0 ||
    sequenciaCompleta.titulo !== 'Sequência Didática' ||
    isBuilt
  );

  console.log('🔍 Verificação de dados válidos:', {
    hasValidData,
    sequenciaCompleta,
    hasAulas: !!sequenciaCompleta?.aulas?.length,
    aulaCount: sequenciaCompleta?.aulas?.length
  });

  const handleRegenerateSequence = async () => {
    console.log('🔄 Regenerando sequência didática...');
    setIsLoading(true);

    try {
      // Implementar regeneração se necessário
      // Por enquanto, apenas simular
      setTimeout(() => {
        setIsLoading(false);
        console.log('✅ Regeneração concluída');
      }, 2000);
    } catch (error) {
      console.error('❌ Erro na regeneração:', error);
      setIsLoading(false);
    }
  };

  const handleFieldUpdate = (field: string, value: string | number) => {
    console.log(`📝 Atualizando campo ${field} com valor:`, value);

    if (sequenciaCompleta) {
      const sequenciaAtualizada = { ...sequenciaCompleta };

      // Atualizar campo específico
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        // Ensure nested structure exists before assignment
        if ((sequenciaAtualizada as any)[parent] && typeof (sequenciaAtualizada as any)[parent] === 'object') {
          (sequenciaAtualizada as any)[parent][child] = value;
        } else {
          console.warn(`Parent field "${parent}" not found or not an object for update.`);
          return; // Prevent assignment if parent structure doesn't exist
        }
      } else {
        (sequenciaAtualizada as any)[field] = value;
      }

      setSequenciaCompleta(sequenciaAtualizada);

      // Salvar no localStorage
      const storageKey = `constructed_sequencia-didatica_${sequenciaCompleta.id}`;
      localStorage.setItem(storageKey, JSON.stringify(sequenciaAtualizada));
    }
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    console.log('👁️ Modo de visualização alterado para:', mode);
  };

  // Função para gerar calendário
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Adjust to the first day of the week (Sunday)
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    // Gerar dias que terão aulas (baseado nas aulas reais da sequência)
    const aulaDays = [];
    const today = new Date();
    const totalAulas = sequenciaCompleta?.resumoEstatistico?.totalAulas || 4;

    for (let i = 0; i < totalAulas; i++) {
      const aulaDate = new Date(today);
      aulaDate.setDate(today.getDate() + (i * 3)); // Aulas a cada 3 dias
      if (aulaDate.getMonth() === month && aulaDate.getFullYear() === year) {
        aulaDays.push(aulaDate.getDate());
      }
    }

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDateObj.getMonth() === month;
      const isToday = currentDateObj.toDateString() === new Date().toDateString();
      const hasAula = isCurrentMonth && aulaDays.includes(currentDateObj.getDate());

      days.push({
        date: new Date(currentDateObj),
        day: currentDateObj.getDate(),
        isCurrentMonth,
        isToday,
        hasAula
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Se não há dados válidos, mostrar estado vazio
  if (!hasValidData && !isBuilt) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-600">
            Nenhum conteúdo gerado ainda
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Configure os campos necessários e gere a sequência didática para visualizar o conteúdo nesta seção.
          </p>
        </div>
      </div>
    );
  }

  // Se não há sequência completa, mostrar loading ou estrutura básica
  if (!sequenciaCompleta) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
          <h3 className="text-lg font-medium text-gray-600">
            Carregando sequência didática...
          </h3>
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
        weekDays={weekDays}
        onFieldUpdate={handleFieldUpdate}
        isLoading={isLoading}
      />

      {/* Área de Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === 'cards' && (
          <div className="flex gap-6 pb-4 min-w-max overflow-x-auto">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-max">
              {/* Cards de Aulas - Usar dados reais se disponíveis */}
              {sequenciaCompleta.aulas && sequenciaCompleta.aulas.length > 0 ? (
                sequenciaCompleta.aulas.map((aula) => (
                  <AulaCard
                    key={aula.id}
                    aulaIndex={aula.numero}
                    titulo={aula.titulo}
                    objetivoEspecifico={aula.objetivoEspecifico}
                    resumo={aula.resumo}
                    etapas={[
                      {
                        tipo: "Introdução",
                        tempo: aula.etapas.introducao.tempo,
                        descricao: aula.etapas.introducao.descricao,
                        cor: aula.etapas.introducao.cor
                      },
                      {
                        tipo: "Desenvolvimento",
                        tempo: aula.etapas.desenvolvimento.tempo,
                        descricao: aula.etapas.desenvolvimento.descricao,
                        cor: aula.etapas.desenvolvimento.cor
                      },
                      {
                        tipo: "Fechamento",
                        tempo: aula.etapas.fechamento.tempo,
                        descricao: aula.etapas.fechamento.descricao,
                        cor: aula.etapas.fechamento.cor
                      }
                    ]}
                    recursos={aula.recursos}
                    atividadePratica={aula.atividadePratica}
                    tempo={aula.tempoTotal}
                    onFieldUpdate={(field, value) => handleFieldUpdate(`aula_${aula.numero}_${field}`, value)}
                  />
                ))
              ) : (
                // Cards padrão se não há dados gerados
                [1, 2, 3, 4].slice(0, sequenciaCompleta.resumoEstatistico.totalAulas).map((aulaIndex) => (
                  <AulaCard
                    key={`aula-default-${aulaIndex}`}
                    aulaIndex={aulaIndex}
                    titulo={`Aula ${aulaIndex}: ${sequenciaCompleta.titulo}`}
                    objetivoEspecifico={`Desenvolver competências específicas da aula ${aulaIndex}`}
                    resumo={`Contextualização sobre ${sequenciaCompleta.titulo} - Aula ${aulaIndex}`}
                    etapas={[
                      {
                        tipo: "Introdução",
                        tempo: "10 min",
                        descricao: "Apresentação do conceito através de exemplos práticos",
                        cor: "green"
                      },
                      {
                        tipo: "Desenvolvimento",
                        tempo: "30 min", 
                        descricao: "Desenvolvimento do conteúdo principal",
                        cor: "orange"
                      },
                      {
                        tipo: "Fechamento",
                        tempo: "10 min",
                        descricao: "Síntese dos conceitos e resolução de dúvidas",
                        cor: "purple"
                      }
                    ]}
                    recursos={["Quadro", "Material didático", "Recursos digitais"]}
                    atividadePratica={`Atividade prática da aula ${aulaIndex}`}
                    tempo="50 min"
                    onFieldUpdate={(field, value) => handleFieldUpdate(`aula_${aulaIndex}_${field}`, value)}
                  />
                ))
              )}

              {/* Cards de Diagnósticos */}
              {sequenciaCompleta.diagnosticos && sequenciaCompleta.diagnosticos.length > 0 ? (
                sequenciaCompleta.diagnosticos.map((diagnostico) => (
                  <DiagnosticoCard
                    key={diagnostico.id}
                    diagIndex={diagnostico.numero}
                    titulo={diagnostico.titulo}
                    objetivoAvaliativo={diagnostico.objetivoAvaliativo}
                    tipoAvaliacao={diagnostico.tipoAvaliacao}
                    quantidadeQuestoes={diagnostico.quantidadeQuestoes}
                    formato={diagnostico.formato}
                    criteriosCorrecao={diagnostico.criteriosCorrecao}
                    tempo={diagnostico.tempo}
                  />
                ))
              ) : (
                [1, 2].slice(0, sequenciaCompleta.resumoEstatistico.totalDiagnosticos).map((diagIndex) => (
                  <DiagnosticoCard
                    key={`diagnostico-default-${diagIndex}`}
                    diagIndex={diagIndex}
                    titulo={`Avaliação Diagnóstica ${diagIndex}`}
                    objetivoAvaliativo={`Identificar conhecimentos prévios sobre ${sequenciaCompleta.titulo}`}
                    tipoAvaliacao="Quiz Interativo"
                    quantidadeQuestoes={8}
                    formato="Múltipla escolha"
                    criteriosCorrecao={[
                      { faixa: "Excelente (8-7 acertos)", resultado: "Pronto para avançar", cor: "text-green-600" },
                      { faixa: "Bom (6-5 acertos)", resultado: "Revisão leve", cor: "text-yellow-600" },
                      { faixa: "Precisa melhorar (<5)", resultado: "Revisão necessária", cor: "text-red-600" }
                    ]}
                    tempo="20 min"
                  />
                ))
              )}

              {/* Cards de Avaliações */}
              {sequenciaCompleta.avaliacoes && sequenciaCompleta.avaliacoes.length > 0 ? (
                sequenciaCompleta.avaliacoes.map((avaliacao) => (
                  <AvaliacaoCard
                    key={avaliacao.id}
                    avalIndex={avaliacao.numero}
                    titulo={avaliacao.titulo}
                    objetivoAvaliativo={avaliacao.objetivoAvaliativo}
                    tipoAvaliacao={avaliacao.tipoAvaliacao}
                    quantidadeQuestoes={avaliacao.quantidadeQuestoes}
                    valorTotal={avaliacao.valorTotal}
                    composicao={avaliacao.composicao}
                    gabarito={avaliacao.gabarito}
                    tempo={avaliacao.tempo}
                  />
                ))
              ) : (
                [1, 2].slice(0, sequenciaCompleta.resumoEstatistico.totalAvaliacoes).map((avalIndex) => (
                  <AvaliacaoCard
                    key={`avaliacao-default-${avalIndex}`}
                    avalIndex={avalIndex}
                    titulo={`Avaliação ${avalIndex}: ${sequenciaCompleta.titulo}`}
                    objetivoAvaliativo={`Avaliar a compreensão dos conceitos de ${sequenciaCompleta.titulo}`}
                    tipoAvaliacao="Prova Escrita"
                    quantidadeQuestoes={12}
                    valorTotal="10,0 pontos"
                    composicao={[
                      { tipo: "Múltipla escolha", quantidade: 8, pontos: "6,0 pts" },
                      { tipo: "Discursivas", quantidade: 4, pontos: "4,0 pts" }
                    ]}
                    gabarito="Disponibilizado após aplicação com critérios detalhados de correção"
                    tempo="45 min"
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Timeline View - implementation similar but using real data */}
        {viewMode === 'timeline' && (
          <div className="space-y-8 overflow-x-auto pb-4">
            <div className="relative min-w-[800px]">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"></div>

              {/* Timeline content using real data */}
              {/* Implementation similar to previous code but with sequenciaCompleta data */}
              {/* Example for AulaCard in timeline */}
              {sequenciaCompleta.aulas?.map((aula) => (
                <div key={`timeline-aula-${aula.numero}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    A{aula.numero}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-blue-500" size={16} />
                          <span className="font-semibold text-blue-700">Aula {aula.numero}</span>
                          <Badge variant="secondary">{aula.tempoTotal}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">{aula.semana || `Semana ${aula.numero}`}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{aula.titulo}</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Objetivo Específico</h4>
                            <p className="text-sm text-gray-600">{aula.objetivoEspecifico}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Recursos Necessários</h4>
                            <div className="flex flex-wrap gap-2">
                              {aula.recursos.map((recurso: string, index: number) => (
                                <Badge key={index} variant="outline">{recurso}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Estrutura da Aula</h4>
                            <div className="space-y-3">
                              {aula.etapas.introducao && (
                                <div className="flex items-start gap-3">
                                  <div className={`w-3 h-3 rounded-full bg-${aula.etapas.introducao.cor}-500 mt-1 flex-shrink-0`}></div>
                                  <div>
                                    <span className={`text-sm font-medium text-${aula.etapas.introducao.cor}-700`}>Introdução ({aula.etapas.introducao.tempo})</span>
                                    <p className="text-xs text-gray-600">{aula.etapas.introducao.descricao}</p>
                                  </div>
                                </div>
                              )}
                              {aula.etapas.desenvolvimento && (
                                <div className="flex items-start gap-3">
                                  <div className={`w-3 h-3 rounded-full bg-${aula.etapas.desenvolvimento.cor}-500 mt-1 flex-shrink-0`}></div>
                                  <div>
                                    <span className={`text-sm font-medium text-${aula.etapas.desenvolvimento.cor}-700`}>Desenvolvimento ({aula.etapas.desenvolvimento.tempo})</span>
                                    <p className="text-xs text-gray-600">{aula.etapas.desenvolvimento.descricao}</p>
                                  </div>
                                </div>
                              )}
                              {aula.etapas.fechamento && (
                                <div className="flex items-start gap-3">
                                  <div className={`w-3 h-3 rounded-full bg-${aula.etapas.fechamento.cor}-500 mt-1 flex-shrink-0`}></div>
                                  <div>
                                    <span className={`text-sm font-medium text-${aula.etapas.fechamento.cor}-700`}>Fechamento ({aula.etapas.fechamento.tempo})</span>
                                    <p className="text-xs text-gray-600">{aula.etapas.fechamento.descricao}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">Atividade Prática</h4>
                        <p className="text-sm text-gray-600">{aula.atividadePratica}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {/* Timeline content for Diagnosticos */}
              {sequenciaCompleta.diagnosticos?.map((diagnostico) => (
                <div key={`timeline-diag-${diagnostico.numero}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    D{diagnostico.numero}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="text-green-500" size={16} />
                          <span className="font-semibold text-green-700">Diagnóstico {diagnostico.numero}</span>
                          <Badge variant="secondary">{diagnostico.tempo}</Badge>
                        </div>
                        <Badge variant="outline" className={`bg-green-50 text-green-700`}>{diagnostico.tipoAvaliacao}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{diagnostico.titulo}</h3>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Objetivo</h4>
                          <p className="text-sm text-gray-600">{diagnostico.objetivoAvaliativo}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Formato</h4>
                          <div className="space-y-1">
                            <p className="text-sm"><strong>{diagnostico.quantidadeQuestoes} questões</strong> {diagnostico.formato}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Critérios</h4>
                          <div className="space-y-1 text-xs">
                            {diagnostico.criteriosCorrecao.map((criterio, index) => (
                              <div key={index} className={criterio.cor}>{criterio.faixa}: {criterio.resultado}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {/* Timeline content for Avaliacoes */}
              {sequenciaCompleta.avaliacoes?.map((avaliacao) => (
                <div key={`timeline-aval-${avaliacao.numero}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    P{avaliacao.numero}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="text-purple-500" size={16} />
                          <span className="font-semibold text-purple-700">Avaliação {avaliacao.numero}</span>
                          <Badge variant="secondary">{avaliacao.tempo}</Badge>
                        </div>
                        <Badge variant="outline" className={`bg-purple-50 text-purple-700`}>{avaliacao.tipoAvaliacao}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{avaliacao.titulo}</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Objetivo Avaliativo</h4>
                            <p className="text-sm text-gray-600">{avaliacao.objetivoAvaliativo}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Composição</h4>
                            <div className="space-y-2">
                              {avaliacao.composicao.map((comp, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{comp.quantidade} {comp.tipo}</span>
                                  <span className="font-medium">{comp.pontos}</span>
                                </div>
                              ))}
                              <hr className="my-2" />
                              <div className="flex justify-between text-sm font-bold">
                                <span>Total</span>
                                <span>{avaliacao.valorTotal}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Critérios de Correção</h4>
                            <div className="space-y-2 text-sm">
                              {avaliacao.gabarito}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'grade' && (
          <div className="space-y-6 overflow-x-auto pb-4">
            {/* Grade de Cards - 4 por linha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Cards de Aulas */}
              {sequenciaCompleta.aulas?.map((aula) => (
                <AulaCard
                  key={`grade-aula-${aula.numero}`}
                  aulaIndex={aula.numero}
                  titulo={aula.titulo}
                  objetivoEspecifico={aula.objetivoEspecifico}
                  resumo={aula.resumo}
                  etapas={[
                    { tipo: "Introdução", tempo: aula.etapas.introducao.tempo, descricao: aula.etapas.introducao.descricao, cor: aula.etapas.introducao.cor },
                    { tipo: "Desenvolvimento", tempo: aula.etapas.desenvolvimento.tempo, descricao: aula.etapas.desenvolvimento.descricao, cor: aula.etapas.desenvolvimento.cor },
                    { tipo: "Fechamento", tempo: aula.etapas.fechamento.tempo, descricao: aula.etapas.fechamento.descricao, cor: aula.etapas.fechamento.cor }
                  ]}
                  recursos={aula.recursos}
                  atividadePratica={aula.atividadePratica}
                  tempo={aula.tempoTotal}
                />
              ))}

              {/* Cards de Diagnósticos */}
              {sequenciaCompleta.diagnosticos?.map((diagnostico) => (
                <DiagnosticoCard
                  key={`grade-diagnostico-${diagnostico.numero}`}
                  diagIndex={diagnostico.numero}
                  titulo={diagnostico.titulo}
                  objetivoAvaliativo={diagnostico.objetivoAvaliativo}
                  tipoAvaliacao={diagnostico.tipoAvaliacao}
                  quantidadeQuestoes={diagnostico.quantidadeQuestoes}
                  formato={diagnostico.formato}
                  criteriosCorrecao={diagnostico.criteriosCorrecao}
                  tempo={diagnostico.tempo}
                />
              ))}

              {/* Cards de Avaliações */}
              {sequenciaCompleta.avaliacoes?.map((avaliacao) => (
                <AvaliacaoCard
                  key={`grade-avaliacao-${avaliacao.numero}`}
                  avalIndex={avaliacao.numero}
                  titulo={avaliacao.titulo}
                  objetivoAvaliativo={avaliacao.objetivoAvaliativo}
                  tipoAvaliacao={avaliacao.tipoAvaliacao}
                  quantidadeQuestoes={avaliacao.quantidadeQuestoes}
                  valorTotal={avaliacao.valorTotal}
                  composicao={avaliacao.composicao}
                  gabarito={avaliacao.gabarito}
                  tempo={avaliacao.tempo}
                />
              ))}
            </div>

            {/* Resumo Estatístico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="text-blue-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-blue-600">{sequenciaCompleta.resumoEstatistico.totalAulas}</h3>
                  <p className="text-sm text-gray-600">Aulas Planejadas</p>
                  <p className="text-xs text-gray-500">{sequenciaCompleta.resumoEstatistico.totalAulas * 50} min totais</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="text-green-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-green-600">{sequenciaCompleta.resumoEstatistico.totalDiagnosticos}</h3>
                  <p className="text-sm text-gray-600">Diagnósticos</p>
                  <p className="text-xs text-gray-500">{sequenciaCompleta.resumoEstatistico.totalDiagnosticos * 20} min totais</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CheckSquare className="text-purple-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-purple-600">{sequenciaCompleta.resumoEstatistico.totalAvaliacoes}</h3>
                  <p className="text-sm text-gray-600">Avaliações</p>
                  <p className="text-xs text-gray-500">{sequenciaCompleta.resumoEstatistico.totalAvaliacoes * 45} min totais</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="text-orange-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-orange-600">{sequenciaCompleta.resumoEstatistico.tempoTotalMinutos}</h3>
                  <p className="text-sm text-gray-600">Minutos Totais</p>
                  <p className="text-xs text-gray-500">≈ {Math.round(sequenciaCompleta.resumoEstatistico.tempoTotalMinutos / 60 * 10) / 10} horas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Informações de Geração */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        Sequência didática gerada em {new Date(sequenciaCompleta.metadados.dataGeracao).toLocaleDateString('pt-BR')} • 
        Modo de visualização: {viewMode} • 
        {sequenciaCompleta.metadados.sistemaGerador}
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;