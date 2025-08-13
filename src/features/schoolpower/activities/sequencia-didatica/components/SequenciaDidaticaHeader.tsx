
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  LayoutGrid, 
  List, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  onFieldUpdate: (field: string, value: string | number) => void;
  isLoading?: boolean;
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
  onFieldUpdate,
  isLoading = false
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [tempTitle, setTempTitle] = useState(tituloTemaAssunto);
  const [tempObjectives, setTempObjectives] = useState(objetivosAprendizagem);

  const handleSaveTitle = () => {
    onFieldUpdate('titulo', tempTitle);
    setIsEditingTitle(false);
  };

  const handleSaveObjectives = () => {
    onFieldUpdate('objetivosAprendizagem', tempObjectives);
    setIsEditingObjectives(false);
  };

  const handleCancelEdit = (field: 'title' | 'objectives') => {
    if (field === 'title') {
      setTempTitle(tituloTemaAssunto);
      setIsEditingTitle(false);
    } else {
      setTempObjectives(objetivosAprendizagem);
      setIsEditingObjectives(false);
    }
  };

  return (
    <Card className="sticky top-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-[#FF6B00]/20 shadow-lg">
      <CardContent className="p-6">
        {/* Linha Superior: Título e Controles */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-2xl font-bold"
                  placeholder="Título da Sequência Didática"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelEdit('title')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tituloTemaAssunto}
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-60 hover:opacity-100"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Controles do lado direito */}
          <div className="flex items-center gap-3">
            {/* Seletor de Modo de Visualização */}
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Cards
                  </div>
                </SelectItem>
                <SelectItem value="timeline">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Timeline
                  </div>
                </SelectItem>
                <SelectItem value="grade">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Grade
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Calendário */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-10 h-10 p-0">
                  <Calendar className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-semibold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          text-center text-sm p-2 rounded cursor-pointer
                          ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${day.isToday ? 'bg-blue-500 text-white' : ''}
                          ${day.hasAula ? 'bg-green-100 border border-green-300' : ''}
                          hover:bg-gray-100
                        `}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Botão Regenerar */}
            <Button
              onClick={onRegenerateSequence}
              disabled={isLoading}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Regenerando...' : 'Regenerar'}
            </Button>
          </div>
        </div>

        {/* Linha do Meio: Objetivos de Aprendizagem */}
        <div className="mb-4">
          {isEditingObjectives ? (
            <div className="space-y-2">
              <Textarea
                value={tempObjectives}
                onChange={(e) => setTempObjectives(e.target.value)}
                placeholder="Objetivos de aprendizagem da sequência didática"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveObjectives}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelEdit('objectives')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
                <strong>Objetivos de Aprendizagem:</strong> {objetivosAprendizagem}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingObjectives(true)}
                className="opacity-60 hover:opacity-100 flex-shrink-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Linha Inferior: Estatísticas */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">
              <span className="text-blue-600 font-bold">{quantidadeAulas}</span> Aulas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">
              <span className="text-green-600 font-bold">{quantidadeDiagnosticos}</span> Diagnósticos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">
              <span className="text-purple-600 font-bold">{quantidadeAvaliacoes}</span> Avaliações
            </span>
          </div>

          <div className="ml-auto text-sm text-gray-500">
            Total: {(quantidadeAulas * 50) + (quantidadeDiagnosticos * 20) + (quantidadeAvaliacoes * 45)} minutos
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenciaDidaticaHeader;
