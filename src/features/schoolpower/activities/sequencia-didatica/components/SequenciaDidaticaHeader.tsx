
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface SequenciaDidaticaHeaderProps {
  tituloTemaAssunto: string;
  objetivosAprendizagem: string;
  quantidadeAulas: number;
  quantidadeDiagnosticos: number;
  quantidadeAvaliacoes: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onRegenerateSequence: () => void;
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  calendarDays: any[];
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
}

export const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({
  tituloTemaAssunto,
  objetivosAprendizagem,
  quantidadeAulas,
  quantidadeDiagnosticos,
  quantidadeAvaliacoes,
  viewMode,
  onViewModeChange,
  onRegenerateSequence,
  currentDate,
  onNavigateMonth,
  calendarDays,
  isCalendarOpen,
  setIsCalendarOpen
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
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
            <Select value={viewMode} onValueChange={onViewModeChange}>
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
                      onClick={() => onNavigateMonth('prev')}
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
                      onClick={() => onNavigateMonth('next')}
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
                    {calendarDays.map((day, index) => (
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
              onClick={onRegenerateSequence}
              className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
            >
              <RefreshCw size={14} />
              Regenerar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;
