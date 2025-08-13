import React, { useState } from 'react';
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

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isBuilt = false 
}) => {
  console.log('📚 [SEQUENCIA_DIDATICA_PREVIEW] Dados recebidos:', { data, activityData, isBuilt });

  // Estados para visualização
  const [viewMode, setViewMode] = useState('cards');

  // Estado para calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Processar dados da sequência (usar dados reais da IA)
  const sequenciaData = data || activityData || {};

  // Verificar se há dados válidos gerados pela IA
  const hasValidData = sequenciaData && (
    sequenciaData.aulas?.length > 0 ||
    sequenciaData.tituloTemaAssunto ||
    sequenciaData.metadados?.tituloTemaAssunto ||
    sequenciaData.isBuilt ||
    isBuilt
  );

  console.log('🔍 [SEQUENCIA_DIDATICA_PREVIEW] Detalhes da verificação:', {
    temSequenciaData: !!sequenciaData,
    temAulas: sequenciaData?.aulas?.length > 0,
    temTitulo: !!sequenciaData?.tituloTemaAssunto,
    temMetadadosTitulo: !!sequenciaData?.metadados?.tituloTemaAssunto,
    isBuilt: sequenciaData?.isBuilt || isBuilt,
    hasValidData
  });

  console.log('🔍 [SEQUENCIA_DIDATICA_PREVIEW] Verificação de dados:', {
    hasValidData,
    hasAulas: !!sequenciaData.aulas,
    aulaCount: sequenciaData.aulas?.length,
    keys: Object.keys(sequenciaData)
  });

  // Extrair dados dos metadados ou campos diretos
  const metadados = sequenciaData.metadados || sequenciaData;

  const tituloTemaAssunto = metadados.tituloTemaAssunto || 
    sequenciaData.title || 
    'Sequência Didática Personalizada';

  const objetivosAprendizagem = metadados.objetivosAprendizagem || 
    'Desenvolver competências e habilidades educacionais específicas';

  const disciplina = metadados.disciplina || 'Educação Geral';
  const anoSerie = metadados.anoSerie || '6º Ano do Ensino Fundamental';
  const publicoAlvo = metadados.publicoAlvo || 'Estudantes do Ensino Fundamental';

  // Usar dados reais da IA
  const aulasList = sequenciaData.aulas || [];
  const diagnosticosList = sequenciaData.diagnosticos || [];
  const avaliacoesList = sequenciaData.avaliacoes || [];

  const quantidadeAulas = aulasList.length || sequenciaData.quantidadeAulas || 4;
  const quantidadeDiagnosticos = diagnosticosList.length || sequenciaData.quantidadeDiagnosticos || 1;
  const quantidadeAvaliacoes = avaliacoesList.length || sequenciaData.quantidadeAvaliacoes || 2;

  const handleRegenerateSequence = () => {
    console.log('🔄 [SEQUENCIA_DIDATICA_PREVIEW] Regenerando sequência didática...');
    // Implementar lógica de regeneração
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    console.log('👁️ [SEQUENCIA_DIDATICA_PREVIEW] Modo alterado para:', mode);
  };

  // Função para gerar calendário
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    // Gerar dias que terão aulas baseado nas aulas reais
    const aulaDays = [];
    const today = new Date();
    for (let i = 0; i < quantidadeAulas; i++) {
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

  if (!hasValidData) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-600">
            Sequência Didática não construída ainda
          </h3>
          <p className="text-sm text-gray-500 max-w-md text-center">
            Preencha os campos básicos na aba "Editar" e clique em "Construir Atividade" para gerar sua sequência didática personalizada.
          </p>
          <div className="text-xs text-gray-400 mt-2">
            💡 A sequência será gerada automaticamente com aulas, diagnósticos e avaliações
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 overflow-x-auto">
      {/* Cabeçalho Flutuante */}
      <Card className="sticky top-4 z-10 bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
        <CardContent className="p-4">
          {/* Título da Sequência */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-orange-500" size={24} />
              {tituloTemaAssunto}
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Lado Esquerdo - Informações Principais */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Target className="text-orange-500" size={18} />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Objetivos:</span>
                  <p className="text-xs text-gray-600 max-w-xs truncate">
                    {objetivosAprendizagem}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="text-blue-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeAulas} Aulas
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <BarChart3 className="text-green-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeDiagnosticos} Diagnósticos
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <CheckSquare className="text-purple-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeAvaliacoes} Avaliações
                  </Badge>
                </div>
              </div>
            </div>

            {/* Lado Direito - Controles */}
            <div className="flex items-center gap-3">
              {/* Seletor de Visualização */}
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={14} />
                      Cards
                    </div>
                  </SelectItem>
                  <SelectItem value="timeline">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      Timeline
                    </div>
                  </SelectItem>
                  <SelectItem value="grade">
                    <div className="flex items-center gap-2">
                      <List size={14} />
                      Grade
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Calendário Dropdown */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Calendar size={14} />
                    Calendário
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    {/* Cabeçalho do Calendário */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft size={16} />
                      </Button>

                      <h3 className="font-semibold text-lg">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h3>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>

                    {/* Dias da Semana */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                      {weekDays.map(day => (
                        <div key={day} className="p-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grade do Calendário */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendar().map((day, index) => (
                        <div
                          key={index}
                          className={`
                            p-2 text-center text-sm rounded-md cursor-pointer transition-colors relative
                            ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                            ${day.isToday ? 'bg-blue-500 text-white font-bold' : ''}
                            ${day.hasAula && !day.isToday ? 'bg-orange-100 text-orange-700 font-semibold ring-2 ring-orange-300' : ''}
                            ${day.isCurrentMonth && !day.isToday && !day.hasAula ? 'hover:bg-gray-100' : ''}
                          `}
                        >
                          {day.day}
                          {day.hasAula && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full transform translate-x-1 -translate-y-1"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Legenda */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-100 rounded border-2 border-orange-300"></div>
                        <span>Dias com aulas programadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Hoje</span>
                      </div>
                      <p className="text-gray-600 mt-2">
                        <strong>{quantidadeAulas} aulas</strong> distribuídas ao longo do período
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Botão Regenerar */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegenerateSequence}
                className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
              >
                <RefreshCw size={14} />
                Regenerar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === 'cards' && (
          <div className="flex gap-6 pb-4 min-w-max overflow-x-auto">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-max">
            {/* Cards de Aulas - Usando dados reais da IA */}
            {aulasList.map((aula, index) => (
              <Card key={aula.id || `aula-${index + 1}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Calendar size={12} className="mr-1" />
                      Aula {aula.numero || index + 1}
                    </Badge>
                    <span className="text-sm text-gray-500">{aula.tempoEstimado || '50 min'}</span>
                  </div>
                  <CardTitle className="text-lg">{aula.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Específico</h4>
                    <p className="text-sm text-gray-600">{aula.objetivoEspecifico}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Resumo</h4>
                    <p className="text-sm text-gray-600">{aula.resumoContexto}</p>
                  </div>

                  {aula.etapas && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Etapas da Aula</h4>
                      <div className="space-y-2">
                        {aula.etapas.introducao && (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-xs font-medium text-green-700">
                                Introdução ({aula.etapas.introducao.tempo})
                              </span>
                              <p className="text-xs text-gray-600">{aula.etapas.introducao.descricao}</p>
                            </div>
                          </div>
                        )}
                        {aula.etapas.desenvolvimento && (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-xs font-medium text-orange-700">
                                Desenvolvimento ({aula.etapas.desenvolvimento.tempo})
                              </span>
                              <p className="text-xs text-gray-600">{aula.etapas.desenvolvimento.descricao}</p>
                            </div>
                          </div>
                        )}
                        {aula.etapas.fechamento && (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-xs font-medium text-purple-700">
                                Fechamento ({aula.etapas.fechamento.tempo})
                              </span>
                              <p className="text-xs text-gray-600">{aula.etapas.fechamento.descricao}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aula.recursos && aula.recursos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Recursos Necessários</h4>
                      <div className="flex flex-wrap gap-1">
                        {aula.recursos.map((recurso, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{recurso}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aula.atividadesPraticas && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Atividade Prática</h4>
                      <p className="text-xs text-gray-600">{aula.atividadesPraticas.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Cards de Diagnósticos - Usando dados reais da IA */}
            {diagnosticosList.map((diagnostico, index) => (
              <Card key={diagnostico.id || `diagnostico-${index + 1}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <BarChart3 size={12} className="mr-1" />
                      Diagnóstico {diagnostico.numero || index + 1}
                    </Badge>
                    <span className="text-sm text-gray-500">{diagnostico.tempoEstimado || '20 min'}</span>
                  </div>
                  <CardTitle className="text-lg">{diagnostico.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Avaliativo</h4>
                    <p className="text-sm text-gray-600">{diagnostico.objetivoAvaliativo}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Tipo de Avaliação</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">{diagnostico.tipo}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
                      <p className="text-lg font-bold text-green-600">{diagnostico.questoes}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Formato</h4>
                      <p className="text-sm text-gray-600">{diagnostico.formato}</p>
                    </div>
                  </div>

                  {diagnostico.criteriosCorrecao && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Critérios de Correção</h4>
                      <div className="space-y-1 text-xs">
                        {diagnostico.criteriosCorrecao.excelente && (
                          <div className="flex justify-between">
                            <span>Excelente</span>
                            <span className="text-green-600 font-medium">{diagnostico.criteriosCorrecao.excelente}</span>
                          </div>
                        )}
                        {diagnostico.criteriosCorrecao.bom && (
                          <div className="flex justify-between">
                            <span>Bom</span>
                            <span className="text-yellow-600 font-medium">{diagnostico.criteriosCorrecao.bom}</span>
                          </div>
                        )}
                        {diagnostico.criteriosCorrecao.precisaMelhorar && (
                          <div className="flex justify-between">
                            <span>Precisa melhorar</span>
                            <span className="text-red-600 font-medium">{diagnostico.criteriosCorrecao.precisaMelhorar}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Cards de Avaliações - Usando dados reais da IA */}
            {avaliacoesList.map((avaliacao, index) => (
              <Card key={avaliacao.id || `avaliacao-${index + 1}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      <CheckSquare size={12} className="mr-1" />
                      Avaliação {avaliacao.numero || index + 1}
                    </Badge>
                    <span className="text-sm text-gray-500">{avaliacao.tempoEstimado || '45 min'}</span>
                  </div>
                  <CardTitle className="text-lg">{avaliacao.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Avaliativo</h4>
                    <p className="text-sm text-gray-600">{avaliacao.objetivoAvaliativo}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Tipo de Avaliação</h4>
                    <Badge variant="outline" className="bg-red-50 text-red-700">{avaliacao.tipo}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
                      <p className="text-lg font-bold text-purple-600">{avaliacao.questoes}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Valor Total</h4>
                      <p className="text-sm text-gray-600">{avaliacao.valorTotal}</p>
                    </div>
                  </div>

                  {avaliacao.composicao && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Composição</h4>
                      <div className="space-y-1 text-xs">
                        {avaliacao.composicao.multipplaEscolha && (
                          <div className="flex justify-between">
                            <span>{avaliacao.composicao.multipplaEscolha.quantidade} Múltipla escolha</span>
                            <span className="font-medium">{avaliacao.composicao.multipplaEscolha.pontos}</span>
                          </div>
                        )}
                        {avaliacao.composicao.discursivas && (
                          <div className="flex justify-between">
                            <span>{avaliacao.composicao.discursivas.quantidade} Discursivas</span>
                            <span className="font-medium">{avaliacao.composicao.discursivas.pontos}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {avaliacao.gabarito && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Gabarito</h4>
                      <p className="text-xs text-gray-600">{avaliacao.gabarito}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}

        {/* Timeline e Grade views mantidas para compatibilidade */}
        {(viewMode === 'timeline' || viewMode === 'grade') && (
          <div className="text-center p-8">
            <p className="text-gray-500">
              Modo de visualização {viewMode} será implementado em breve com dados da IA.
            </p>
          </div>
        )}
      </div>

      {/* Informações de Geração */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        Sequência didática gerada pela IA em {new Date().toLocaleDateString('pt-BR')} • Modo: {viewMode}
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;