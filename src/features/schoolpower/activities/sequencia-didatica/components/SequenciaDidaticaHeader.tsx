import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  ChevronRight,
  Edit2,
  Check,
  X
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
  monthNames: string[];
  weekDays: string[];
  onFieldUpdate?: (field: string, value: string | number) => void;
}

const SequenciaDidaticaHeader: React.FC<SequenciaDidaticaHeaderProps> = ({
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
  setIsCalendarOpen,
  monthNames,
  weekDays,
  onFieldUpdate
}) => {
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string | number }>({});

  const handleStartEdit = (field: string, currentValue: string | number) => {
    setEditingFields({ ...editingFields, [field]: true });
    setTempValues({ ...tempValues, [field]: currentValue });
  };

  const handleSaveEdit = (field: string) => {
    if (onFieldUpdate && tempValues[field] !== undefined) {
      onFieldUpdate(field, tempValues[field]);
    }
    setEditingFields({ ...editingFields, [field]: false });
    setTempValues({ ...tempValues, [field]: undefined });
  };

  const handleCancelEdit = (field: string) => {
    setEditingFields({ ...editingFields, [field]: false });
    setTempValues({ ...tempValues, [field]: undefined });
  };

  const renderEditableField = (
    field: string, 
    currentValue: string | number, 
    isTextarea = false,
    isNumber = false
  ) => {
    const isEditing = editingFields[field];

    if (isEditing) {
      return (
        <div className="flex items-center gap-2 flex-1">
          {isTextarea ? (
            <Textarea
              value={tempValues[field] as string || ''}
              onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
              className="min-h-[60px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSaveEdit(field);
                }
                if (e.key === 'Escape') {
                  handleCancelEdit(field);
                }
              }}
            />
          ) : (
            <Input
              type={isNumber ? 'number' : 'text'}
              value={tempValues[field] || ''}
              onChange={(e) => setTempValues({ ...tempValues, [field]: isNumber ? parseInt(e.target.value) || 0 : e.target.value })}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit(field);
                }
                if (e.key === 'Escape') {
                  handleCancelEdit(field);
                }
              }}
              autoFocus
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSaveEdit(field)}
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCancelEdit(field)}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-2 flex-1 group">
        <div className="flex-1">
          {isTextarea ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {currentValue}
            </p>
          ) : (
            <span className="text-sm">{currentValue}</span>
          )}
        </div>
        {onFieldUpdate && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStartEdit(field, currentValue)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="sticky top-4 z-10 bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
      <CardContent className="p-4">
        {/* Título da Sequência */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-orange-500" size={24} />
            {renderEditableField('tituloTemaAssunto', tituloTemaAssunto)}
          </h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Lado Esquerdo - Informações Principais */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={18} />
              <div className="text-sm flex-1">
                <span className="font-medium text-gray-700">Objetivos:</span>
                <div className="group">
                  {renderEditableField('objetivosAprendizagem', objetivosAprendizagem, true)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 group">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  <Calendar className="w-4 h-4 mr-1" />
                  {editingFields['quantidadeAulas'] ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={tempValues['quantidadeAulas'] || quantidadeAulas}
                        onChange={(e) => setTempValues({ ...tempValues, quantidadeAulas: parseInt(e.target.value) || 0 })}
                        className="w-16 h-6 text-xs p-1"
                        min="1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit('quantidadeAulas');
                          if (e.key === 'Escape') handleCancelEdit('quantidadeAulas');
                        }}
                      />
                      <Check 
                        className="w-3 h-3 cursor-pointer text-green-600" 
                        onClick={() => handleSaveEdit('quantidadeAulas')}
                      />
                      <X 
                        className="w-3 h-3 cursor-pointer text-red-600" 
                        onClick={() => handleCancelEdit('quantidadeAulas')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {quantidadeAulas} Aulas
                      {onFieldUpdate && (
                        <Edit2 
                          className="w-3 h-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-1" 
                          onClick={() => handleStartEdit('quantidadeAulas', quantidadeAulas)}
                        />
                      )}
                    </div>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2 group">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  {editingFields['quantidadeDiagnosticos'] ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={tempValues['quantidadeDiagnosticos'] || quantidadeDiagnosticos}
                        onChange={(e) => setTempValues({ ...tempValues, quantidadeDiagnosticos: parseInt(e.target.value) || 0 })}
                        className="w-16 h-6 text-xs p-1"
                        min="1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit('quantidadeDiagnosticos');
                          if (e.key === 'Escape') handleCancelEdit('quantidadeDiagnosticos');
                        }}
                      />
                      <Check 
                        className="w-3 h-3 cursor-pointer text-green-600" 
                        onClick={() => handleSaveEdit('quantidadeDiagnosticos')}
                      />
                      <X 
                        className="w-3 h-3 cursor-pointer text-red-600" 
                        onClick={() => handleCancelEdit('quantidadeDiagnosticos')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {quantidadeDiagnosticos} Diagnósticos
                      {onFieldUpdate && (
                        <Edit2 
                          className="w-3 h-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-1" 
                          onClick={() => handleStartEdit('quantidadeDiagnosticos', quantidadeDiagnosticos)}
                        />
                      )}
                    </div>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2 group">
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  <CheckSquare className="w-4 h-4 mr-1" />
                  {editingFields['quantidadeAvaliacoes'] ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={tempValues['quantidadeAvaliacoes'] || quantidadeAvaliacoes}
                        onChange={(e) => setTempValues({ ...tempValues, quantidadeAvaliacoes: parseInt(e.target.value) || 0 })}
                        className="w-16 h-6 text-xs p-1"
                        min="1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit('quantidadeAvaliacoes');
                          if (e.key === 'Escape') handleCancelEdit('quantidadeAvaliacoes');
                        }}
                      />
                      <Check 
                        className="w-3 h-3 cursor-pointer text-green-600" 
                        onClick={() => handleSaveEdit('quantidadeAvaliacoes')}
                      />
                      <X 
                        className="w-3 h-3 cursor-pointer text-red-600" 
                        onClick={() => handleCancelEdit('quantidadeAvaliacoes')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {quantidadeAvaliacoes} Avaliações
                      {onFieldUpdate && (
                        <Edit2 
                          className="w-3 h-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-1" 
                          onClick={() => handleStartEdit('quantidadeAvaliacoes', quantidadeAvaliacoes)}
                        />
                      )}
                    </div>
                  )}
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