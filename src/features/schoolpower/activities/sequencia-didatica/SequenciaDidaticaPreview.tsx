import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  Clock,
  BookOpen, // Added for the initial empty state icon
  LayoutGrid, // Added for view mode selector
  List, // Added for view mode selector
  RefreshCw, // Added for regenerate button
  ChevronLeft, // Added for calendar navigation
  ChevronRight // Added for calendar navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Added for calendar navigation and regenerate button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added for view mode selector
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Added for calendar

// Importar os novos componentes
// Assuming these components are correctly placed in './components'
import { 
  SequenciaDidaticaHeader,
  AulaCard,
  DiagnosticoCard,
  AvaliacaoCard
} from './components';

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

  // Estados para edição (commented out as per the new structure)
  // const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  // const [isEditingQuantities, setIsEditingQuantities] = useState(false);
  // const [tempObjectives, setTempObjectives] = useState('');
  // const [tempQuantities, setTempQuantities] = useState({
  //   aulas: 4,
  //   diagnosticos: 2,
  //   avaliacoes: 2
  // });

  // Estados para visualização
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

  const handleFieldUpdate = (field: string, value: string | number) => {
    console.log(`📝 Atualizando campo ${field} com valor:`, value);
    // Aqui você pode implementar a lógica para salvar os dados atualizados
    // Por exemplo, salvar no localStorage ou enviar para uma API
    
    // Salvar no localStorage temporariamente
    const storageKey = `sequencia_didatica_${data?.id || 'preview'}`;
    const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const updatedData = { ...currentData, [field]: value };
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    // Aqui você poderia também atualizar o estado local se necessário
    // ou disparar um callback para o componente pai
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

  // Dados mock para os cards (kept from original, to be passed to new components)
  const getMockAulaData = (index: number) => ({
    aulaIndex: index,
    titulo: "Introdução às Funções do 1º Grau",
    objetivoEspecifico: "Compreender o conceito de função linear e sua representação gráfica.",
    resumo: "Contextualização sobre situações cotidianas que envolvem relações lineares.",
    etapas: [
      {
        tipo: "Introdução",
        tempo: "10 min",
        descricao: "Apresentação do conceito através de exemplos práticos",
        cor: "green"
      },
      {
        tipo: "Desenvolvimento",
        tempo: "30 min", 
        descricao: "Construção de gráficos e análise de propriedades",
        cor: "orange"
      },
      {
        tipo: "Fechamento",
        tempo: "10 min",
        descricao: "Síntese dos conceitos e resolução de dúvidas",
        cor: "purple"
      }
    ],
    recursos: ["Quadro", "GeoGebra", "Material impresso"],
    atividadePratica: "Lista de exercícios sobre identificação e construção de gráficos lineares",
    tempo: "50 min" // Added tempo from original card
  });

  const getMockDiagnosticoData = (index: number) => ({
    diagIndex: index,
    titulo: "Avaliação Diagnóstica - Conhecimentos Prévios",
    objetivoAvaliativo: "Identificar conhecimentos prévios sobre álgebra básica e coordenadas cartesianas.",
    tipoAvaliacao: "Quiz Interativo",
    quantidadeQuestoes: 8,
    formato: "Múltipla escolha",
    criteriosCorrecao: [
      { faixa: "Excelente (8-7 acertos)", resultado: "Pronto para avançar", cor: "text-green-600" },
      { faixa: "Bom (6-5 acertos)", resultado: "Revisão leve", cor: "text-yellow-600" },
      { faixa: "Precisa melhorar (<5)", resultado: "Revisão necessária", cor: "text-red-600" }
    ],
    tempo: "20 min" // Added tempo from original card
  });

  const getMockAvaliacaoData = (index: number) => ({
    avalIndex: index,
    titulo: "Prova Somativa - Funções Lineares",
    objetivoAvaliativo: "Avaliar a compreensão dos conceitos de função linear e capacidade de resolução de problemas.",
    tipoAvaliacao: "Prova Escrita",
    quantidadeQuestoes: 12,
    valorTotal: "10,0 pontos",
    composicao: [
      { tipo: "Múltipla escolha", quantidade: 8, pontos: "6,0 pts" },
      { tipo: "Discursivas", quantidade: 4, pontos: "4,0 pts" }
    ],
    gabarito: "Disponível após aplicação com critérios detalhados de correção",
    tempo: "45 min" // Added tempo from original card
  });

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
            <BookOpen className="text-gray-400" size={48} /> {/* Changed icon to BookOpen for empty state */}
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
      <SequenciaDidaticaHeader
        tituloTemaAssunto={tituloTemaAssunto}
        objetivosAprendizagem={objetivosAprendizagem}
        quantidadeAulas={quantidadeAulas}
        quantidadeDiagnosticos={quantidadeDiagnosticos}
        quantidadeAvaliacoes={quantidadeAvaliacoes}
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
      />

      {/* Área de Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === 'cards' && (
          <div className="flex gap-6 pb-4 min-w-max overflow-x-auto">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-max">
            {/* Cards de Aulas */}
            {[1, 2, 3, 4].map((aulaIndex) => (
              <AulaCard
                key={`aula-${aulaIndex}`}
                {...getMockAulaData(aulaIndex)}
                onFieldUpdate={(field, value) => handleFieldUpdate(`aula_${aulaIndex}_${field}`, value)}
              />
            ))}

            {/* Cards de Diagnósticos */}
            {[1, 2].map((diagIndex) => (
              <DiagnosticoCard
                key={`diagnostico-${diagIndex}`}
                {...getMockDiagnosticoData(diagIndex)}
              />
            ))}

            {/* Cards de Avaliações */}
            {[1, 2].map((avalIndex) => (
              <AvaliacaoCard
                key={`avaliacao-${avalIndex}`}
                {...getMockAvaliacaoData(avalIndex)}
              />
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
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-blue-500" size={16} />
                          <span className="font-semibold text-blue-700">Aula {aulaIndex}</span>
                          <Badge variant="secondary">50 min</Badge>
                        </div>
                        <span className="text-sm text-gray-500">Semana {aulaIndex}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">Introdução às Funções do 1º Grau</h3>

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
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="text-green-500" size={16} />
                          <span className="font-semibold text-green-700">Diagnóstico {diagIndex}</span>
                          <Badge variant="secondary">20 min</Badge>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Quiz</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-4">Avaliação Diagnóstica - Conhecimentos Prévios</h3>

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
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="text-purple-500" size={16} />
                          <span className="font-semibold text-purple-700">Avaliação {avalIndex}</span>
                          <Badge variant="secondary">45 min</Badge>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">Prova</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-4">Prova Somativa - Funções Lineares</h3>

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
            {/* Grade de Cards - 4 por linha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Cards de Aulas */}
              {[1, 2, 3, 4].map((aulaIndex) => (
                <AulaCard
                  key={`grade-aula-${aulaIndex}`}
                  {...getMockAulaData(aulaIndex)}
                />
              ))}

              {/* Cards de Diagnósticos */}
              {[1, 2].map((diagIndex) => (
                <DiagnosticoCard
                  key={`grade-diagnostico-${diagIndex}`}
                  {...getMockDiagnosticoData(diagIndex)}
                />
              ))}

              {/* Cards de Avaliações */}
              {[1, 2].map((avalIndex) => (
                <AvaliacaoCard
                  key={`grade-avaliacao-${avalIndex}`}
                  {...getMockAvaliacaoData(avalIndex)}
                />
              ))}
            </div>

            {/* Resumo Estatístico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
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