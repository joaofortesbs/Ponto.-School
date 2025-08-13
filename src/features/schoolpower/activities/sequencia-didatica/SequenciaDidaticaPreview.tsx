
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
  console.log('📚 SequenciaDidaticaPreview - Dados recebidos:', { data, activityData, isBuilt });

  // Estados para edição
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [isEditingQuantities, setIsEditingQuantities] = useState(false);
  const [tempObjectives, setTempObjectives] = useState('');
  const [tempQuantities, setTempQuantities] = useState({
    aulas: 4,
    diagnosticos: 2,
    avaliacoes: 2
  });

  // Estado para visualização
  const [viewMode, setViewMode] = useState('cards');
  
  // Estado para calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Processar dados da sequência
  const sequenciaData = data || activityData || {};
  
  // Verificar se há dados válidos
  const hasValidData = sequenciaData && (
    sequenciaData.tituloTemaAssunto || 
    sequenciaData.title || 
    sequenciaData.aulas?.length > 0 ||
    Object.keys(sequenciaData).length > 5 ||
    isBuilt || // Se foi construído, considera válido
    sequenciaData.conteudo_gerado_ia?.length > 0 ||
    sequenciaData.customFields?.['Título do Tema / Assunto'] ||
    sequenciaData.customFields?.['Objetivos de Aprendizagem']
  );

  console.log('🔍 Verificação de dados válidos:', {
    hasValidData,
    sequenciaDataKeys: Object.keys(sequenciaData),
    hasAulas: !!sequenciaData.aulas,
    aulaCount: sequenciaData.aulas?.length
  });

  // Extrair valores dos campos customizados
  const customFields = sequenciaData.customFields || {};
  
  // Tentar extrair dados de diferentes fontes
  const tituloTemaAssunto = customFields['Título do Tema / Assunto'] || 
    sequenciaData.tituloTemaAssunto || 
    sequenciaData.title || 
    'Sequência Didática';

  const objetivosAprendizagem = customFields['Objetivos de Aprendizagem'] || 
    sequenciaData.objetivosAprendizagem || 
    'Desenvolver competências específicas da disciplina através de metodologias ativas';

  const quantidadeAulas = parseInt(
    customFields['Quantidade de Aulas'] || 
    sequenciaData.quantidadeAulas ||
    sequenciaData.aulas?.length
  ) || 4;
  
  const quantidadeDiagnosticos = parseInt(
    customFields['Quantidade de Diagnósticos'] || 
    sequenciaData.quantidadeDiagnosticos ||
    sequenciaData.diagnosticos?.length
  ) || 2;
  
  const quantidadeAvaliacoes = parseInt(
    customFields['Quantidade de Avaliações'] || 
    sequenciaData.quantidadeAvaliacoes ||
    sequenciaData.avaliacoes?.length
  ) || 2;

  const handleRegenerateSequence = () => {
    console.log('🔄 Regenerando sequência didática...');
    // Implementar lógica de regeneração
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
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    // Gerar dias que terão aulas (simulação baseada nas aulas da sequência)
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
    // Se estamos no modo de visualização (isBuilt), mostrar dados básicos mesmo sem conteúdo
    if (isBuilt) {
      console.log('📄 Sequência didática no modo visualização sem dados completos, mostrando estrutura básica');
    } else {
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
            {/* Cards de Aulas */}
            {[1, 2, 3, 4].map((aulaIndex) => (
              <Card key={`aula-${aulaIndex}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Calendar size={12} className="mr-1" />
                      Aula {aulaIndex}
                    </Badge>
                    <span className="text-sm text-gray-500">50 min</span>
                  </div>
                  <CardTitle className="text-lg">Introdução às Funções do 1º Grau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Específico</h4>
                    <p className="text-sm text-gray-600">Compreender o conceito de função linear e sua representação gráfica.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Resumo</h4>
                    <p className="text-sm text-gray-600">Contextualização sobre situações cotidianas que envolvem relações lineares.</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Etapas da Aula</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <span className="text-xs font-medium text-green-700">Introdução (10 min)</span>
                          <p className="text-xs text-gray-600">Apresentação do conceito através de exemplos práticos</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <span className="text-xs font-medium text-orange-700">Desenvolvimento (30 min)</span>
                          <p className="text-xs text-gray-600">Construção de gráficos e análise de propriedades</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <span className="text-xs font-medium text-purple-700">Fechamento (10 min)</span>
                          <p className="text-xs text-gray-600">Síntese dos conceitos e resolução de dúvidas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Recursos Necessários</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Quadro</Badge>
                      <Badge variant="secondary" className="text-xs">GeoGebra</Badge>
                      <Badge variant="secondary" className="text-xs">Material impresso</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Atividade Prática</h4>
                    <p className="text-xs text-gray-600">Lista de exercícios sobre identificação e construção de gráficos lineares</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Cards de Diagnósticos */}
            {[1, 2].map((diagIndex) => (
              <Card key={`diagnostico-${diagIndex}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <BarChart3 size={12} className="mr-1" />
                      Diagnóstico {diagIndex}
                    </Badge>
                    <span className="text-sm text-gray-500">20 min</span>
                  </div>
                  <CardTitle className="text-lg">Avaliação Diagnóstica - Conhecimentos Prévios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Avaliativo</h4>
                    <p className="text-sm text-gray-600">Identificar conhecimentos prévios sobre álgebra básica e coordenadas cartesianas.</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Tipo de Avaliação</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Quiz Interativo</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
                      <p className="text-lg font-bold text-green-600">8 questões</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Formato</h4>
                      <p className="text-sm text-gray-600">Múltipla escolha</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Critérios de Correção</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Excelente (8-7 acertos)</span>
                        <span className="text-green-600 font-medium">Pronto para avançar</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bom (6-5 acertos)</span>
                        <span className="text-yellow-600 font-medium">Revisão leve</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precisa melhorar (&lt;5)</span>
                        <span className="text-red-600 font-medium">Revisão necessária</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Cards de Avaliações */}
            {[1, 2].map((avalIndex) => (
              <Card key={`avaliacao-${avalIndex}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 min-w-[320px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      <CheckSquare size={12} className="mr-1" />
                      Avaliação {avalIndex}
                    </Badge>
                    <span className="text-sm text-gray-500">45 min</span>
                  </div>
                  <CardTitle className="text-lg">Prova Somativa - Funções Lineares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Objetivo Avaliativo</h4>
                    <p className="text-sm text-gray-600">Avaliar a compreensão dos conceitos de função linear e capacidade de resolução de problemas.</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Tipo de Avaliação</h4>
                    <Badge variant="outline" className="bg-red-50 text-red-700">Prova Escrita</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Questões</h4>
                      <p className="text-lg font-bold text-purple-600">12 questões</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Valor Total</h4>
                      <p className="text-sm text-gray-600">10,0 pontos</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Composição</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>8 Múltipla escolha</span>
                        <span className="font-medium">6,0 pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4 Discursivas</span>
                        <span className="font-medium">4,0 pts</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Gabarito</h4>
                    <p className="text-xs text-gray-600">Disponível após aplicação com critérios detalhados de correção</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-8 overflow-x-auto pb-4">
            {/* Timeline de Sequência Didática */}
            <div className="relative min-w-[800px]">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"></div>
              
              {/* Aulas na Timeline */}
              {[1, 2, 3, 4].map((aulaIndex) => (
                <div key={`timeline-aula-${aulaIndex}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    A{aulaIndex}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-blue-500" size={16} />
                          <span className="font-semibold text-blue-700">Aula {aulaIndex}</span>
                          <Badge variant="secondary">50 min</Badge>
                        </div>
                        <span className="text-sm text-gray-500">Semana {aulaIndex}</span>
                      </div>
                      <CardTitle className="text-xl">Introdução às Funções do 1º Grau</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Objetivo Específico</h4>
                            <p className="text-sm text-gray-600">Compreender o conceito de função linear e sua representação gráfica através de exemplos práticos.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Recursos Necessários</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">Quadro branco</Badge>
                              <Badge variant="outline">GeoGebra</Badge>
                              <Badge variant="outline">Material impresso</Badge>
                              <Badge variant="outline">Calculadora</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Estrutura da Aula</h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                                <div>
                                  <span className="text-sm font-medium text-green-700">Introdução (10 min)</span>
                                  <p className="text-xs text-gray-600">Situações problema do cotidiano</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 flex-shrink-0"></div>
                                <div>
                                  <span className="text-sm font-medium text-orange-700">Desenvolvimento (30 min)</span>
                                  <p className="text-xs text-gray-600">Construção de gráficos e análise</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 flex-shrink-0"></div>
                                <div>
                                  <span className="text-sm font-medium text-purple-700">Fechamento (10 min)</span>
                                  <p className="text-xs text-gray-600">Síntese e esclarecimento de dúvidas</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">Atividade Prática</h4>
                        <p className="text-sm text-gray-600">Lista com 10 exercícios sobre identificação de funções lineares e construção de gráficos</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Diagnósticos na Timeline */}
              {[1, 2].map((diagIndex) => (
                <div key={`timeline-diag-${diagIndex}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    D{diagIndex}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="text-green-500" size={16} />
                          <span className="font-semibold text-green-700">Diagnóstico {diagIndex}</span>
                          <Badge variant="secondary">20 min</Badge>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Quiz</Badge>
                      </div>
                      <CardTitle className="text-xl">Avaliação Diagnóstica - Conhecimentos Prévios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Objetivo</h4>
                          <p className="text-sm text-gray-600">Identificar conhecimentos sobre álgebra básica e coordenadas cartesianas.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Formato</h4>
                          <div className="space-y-1">
                            <p className="text-sm"><strong>8 questões</strong> múltipla escolha</p>
                            <p className="text-sm">Plataforma digital interativa</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Critérios</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-green-600">●</span> 7-8 acertos: Pronto</div>
                            <div><span className="text-yellow-600">●</span> 5-6 acertos: Revisão</div>
                            <div><span className="text-red-600">●</span> &lt;5 acertos: Reforço</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Avaliações na Timeline */}
              {[1, 2].map((avalIndex) => (
                <div key={`timeline-aval-${avalIndex}`} className="relative flex items-start space-x-4 pb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    P{avalIndex}
                  </div>
                  <Card className="flex-1 ml-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="text-purple-500" size={16} />
                          <span className="font-semibold text-purple-700">Avaliação {avalIndex}</span>
                          <Badge variant="secondary">45 min</Badge>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">Prova</Badge>
                      </div>
                      <CardTitle className="text-xl">Prova Somativa - Funções Lineares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Objetivo Avaliativo</h4>
                            <p className="text-sm text-gray-600">Avaliar compreensão dos conceitos de função linear e capacidade de resolução de problemas contextualizados.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Composição</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>8 questões múltipla escolha</span>
                                <span className="font-medium">6,0 pts</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>4 questões discursivas</span>
                                <span className="font-medium">4,0 pts</span>
                              </div>
                              <hr className="my-2" />
                              <div className="flex justify-between text-sm font-bold">
                                <span>Total</span>
                                <span>10,0 pts</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Critérios de Correção</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Questões Objetivas:</span>
                                <p className="text-gray-600">0,75 pontos cada (tudo ou nada)</p>
                              </div>
                              <div>
                                <span className="font-medium">Questões Discursivas:</span>
                                <p className="text-gray-600">Avaliação por etapas de resolução</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Gabarito</h4>
                            <p className="text-sm text-gray-600">Disponibilizado após aplicação com justificativas detalhadas e critérios específicos.</p>
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
            {/* Tabela em Grade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="text-gray-600" size={20} />
                  Visão Geral da Sequência Didática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">Item</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Título</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Objetivo</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Duração</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Tipo</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Recursos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Aulas */}
                      {[1, 2, 3, 4].map((aulaIndex) => (
                        <tr key={`grade-aula-${aulaIndex}`} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                A{aulaIndex}
                              </div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">Aula</Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Introdução às Funções do 1º Grau</h4>
                              <p className="text-sm text-gray-600">Conceitos fundamentais e representação gráfica</p>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-sm text-gray-600">Compreender o conceito de função linear e sua representação gráfica através de exemplos práticos do cotidiano.</p>
                          </td>
                          <td className="p-4">
                            <div className="text-center">
                              <span className="font-bold text-lg">50</span>
                              <p className="text-xs text-gray-500">minutos</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-sm">Expositiva</p>
                              <p className="text-sm">Prática</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">Quadro</Badge>
                              <Badge variant="secondary" className="text-xs">GeoGebra</Badge>
                              <Badge variant="secondary" className="text-xs">Material</Badge>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Diagnósticos */}
                      {[1, 2].map((diagIndex) => (
                        <tr key={`grade-diag-${diagIndex}`} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                D{diagIndex}
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700">Diagnóstico</Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Avaliação Diagnóstica - Conhecimentos Prévios</h4>
                              <p className="text-sm text-gray-600">Quiz sobre álgebra básica e coordenadas</p>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-sm text-gray-600">Identificar conhecimentos prévios dos alunos sobre álgebra básica e sistema de coordenadas cartesianas.</p>
                          </td>
                          <td className="p-4">
                            <div className="text-center">
                              <span className="font-bold text-lg">20</span>
                              <p className="text-xs text-gray-500">minutos</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-sm">Quiz Digital</p>
                              <p className="text-sm font-medium text-green-600">8 questões</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">Computador</Badge>
                              <Badge variant="secondary" className="text-xs">Internet</Badge>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Avaliações */}
                      {[1, 2].map((avalIndex) => (
                        <tr key={`grade-aval-${avalIndex}`} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                P{avalIndex}
                              </div>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">Prova</Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Prova Somativa - Funções Lineares</h4>
                              <p className="text-sm text-gray-600">Avaliação formal dos conhecimentos adquiridos</p>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-sm text-gray-600">Avaliar a compreensão dos conceitos de função linear e capacidade de resolução de problemas contextualizados.</p>
                          </td>
                          <td className="p-4">
                            <div className="text-center">
                              <span className="font-bold text-lg">45</span>
                              <p className="text-xs text-gray-500">minutos</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-sm">Prova Escrita</p>
                              <p className="text-sm font-medium text-purple-600">12 questões</p>
                              <p className="text-xs text-gray-500">8 objetivas + 4 discursivas</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">Papel</Badge>
                              <Badge variant="secondary" className="text-xs">Calculadora</Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Estatístico */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="text-blue-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-blue-600">4</h3>
                  <p className="text-sm text-gray-600">Aulas Planejadas</p>
                  <p className="text-xs text-gray-500">200 min totais</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="text-green-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-green-600">2</h3>
                  <p className="text-sm text-gray-600">Diagnósticos</p>
                  <p className="text-xs text-gray-500">40 min totais</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckSquare className="text-purple-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-purple-600">2</h3>
                  <p className="text-sm text-gray-600">Avaliações</p>
                  <p className="text-xs text-gray-500">90 min totais</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="text-orange-500 mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-2xl text-orange-600">330</h3>
                  <p className="text-sm text-gray-600">Minutos Totais</p>
                  <p className="text-xs text-gray-500">≈ 5,5 horas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Informações de Geração */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        Sequência didática gerada em {new Date().toLocaleDateString('pt-BR')} • Modo de visualização: {viewMode}
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;
