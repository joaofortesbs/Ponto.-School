
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BookOpen, 
  FileText, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  Plus, 
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolPowerStore } from '@/store/schoolPowerStore';
import { validateContext } from '@/utils/validators';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ContextualizationForm: React.FC = () => {
  const { 
    contextData, 
    setContextData, 
    setStage, 
    setLoading, 
    setError,
    userMessage,
    isLoading 
  } = useSchoolPowerStore();

  const [localContent, setLocalContent] = useState<string[]>(contextData.content || []);
  const [localMaterials, setLocalMaterials] = useState<string[]>(contextData.materials || []);
  const [localDates, setLocalDates] = useState<string[]>(contextData.dates || []);
  const [localRestrictions, setLocalRestrictions] = useState<string[]>(contextData.restrictions || []);

  const [contentInput, setContentInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');
  const [dateInput, setDateInput] = useState<Date | undefined>(undefined);
  const [restrictionInput, setRestrictionInput] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sugestões pré-definidas
  const contentSuggestions = [
    'Matemática - Equações do 2º grau',
    'História - Segunda Guerra Mundial',
    'Biologia - Sistema digestório',
    'Física - Leis de Newton',
    'Português - Figuras de linguagem',
    'Química - Ligações químicas'
  ];

  const materialSuggestions = [
    'Apresentação em slides',
    'Lista de exercícios',
    'Prova/Avaliação',
    'Atividade prática',
    'Projeto interdisciplinar',
    'Material audiovisual'
  ];

  const restrictionSuggestions = [
    'Turma com dificuldades de aprendizado',
    'Recursos tecnológicos limitados',
    'Tempo reduzido de aula',
    'Turma numerosa',
    'Necessidades especiais',
    'Primeiro contato com o assunto'
  ];

  const addToList = (value: string, list: string[], setList: (list: string[]) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      const newList = [...list, value.trim()];
      setList(newList);
      return true;
    }
    return false;
  };

  const removeFromList = (value: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(item => item !== value));
  };

  const handleAddContent = () => {
    if (addToList(contentInput, localContent, setLocalContent)) {
      setContentInput('');
    }
  };

  const handleAddMaterial = () => {
    if (addToList(materialInput, localMaterials, setLocalMaterials)) {
      setMaterialInput('');
    }
  };

  const handleAddDate = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'dd/MM/yyyy', { locale: ptBR });
      if (addToList(formattedDate, localDates, setLocalDates)) {
        setSelectedDate(undefined);
        setIsDatePickerOpen(false);
      }
    }
  };

  const handleAddRestriction = () => {
    if (addToList(restrictionInput, localRestrictions, setLocalRestrictions)) {
      setRestrictionInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string, list: string[], setList: (list: string[]) => void) => {
    addToList(suggestion, list, setList);
  };

  const handleConfirmContext = async () => {
    const contextToValidate = {
      content: localContent,
      materials: localMaterials,
      dates: localDates,
      restrictions: localRestrictions
    };

    const { isValid, errors } = validateContext(contextToValidate);
    
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setLoading(true);

    try {
      // Salvar dados no estado global
      setContextData(contextToValidate);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Avançar para próxima etapa
      setStage('planning');
      
    } catch (error) {
      console.error('Erro ao processar contexto:', error);
      setError('Erro ao processar contexto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = localContent.length > 0 && localMaterials.length > 0 && localDates.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Contextualização do Plano</h2>
        <p className="text-white/80">
          Vamos personalizar seu plano baseado na sua mensagem:
        </p>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <p className="text-[#FF6B00] font-medium">"{userMessage}"</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conteúdos Principais */}
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#FF6B00]" />
              Conteúdos Principais
            </CardTitle>
            <CardDescription className="text-white/70">
              Quais tópicos devem ser abordados?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Ex: Equações do 2º grau"
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleAddContent()}
              />
              <Button
                onClick={handleAddContent}
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {localContent.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  {item}
                  <button
                    onClick={() => removeFromList(item, localContent, setLocalContent)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/60">Sugestões:</Label>
              <div className="flex flex-wrap gap-1">
                {contentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, localContent, setLocalContent)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Materiais */}
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FF6B00]" />
              Tipos de Materiais
            </CardTitle>
            <CardDescription className="text-white/70">
              Que tipos de materiais você precisa?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                placeholder="Ex: Apresentação em slides"
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMaterial()}
              />
              <Button
                onClick={handleAddMaterial}
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {localMaterials.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  {item}
                  <button
                    onClick={() => removeFromList(item, localMaterials, setLocalMaterials)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/60">Sugestões:</Label>
              <div className="flex flex-wrap gap-1">
                {materialSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, localMaterials, setLocalMaterials)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas Importantes */}
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[#FF6B00]" />
              Datas Importantes
            </CardTitle>
            <CardDescription className="text-white/70">
              Quando o material será usado?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleAddDate}
                size="sm"
                disabled={!selectedDate}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {localDates.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  {item}
                  <button
                    onClick={() => removeFromList(item, localDates, setLocalDates)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restrições Específicas */}
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
              Restrições Específicas
            </CardTitle>
            <CardDescription className="text-white/70">
              Há alguma limitação ou consideração especial?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={restrictionInput}
                onChange={(e) => setRestrictionInput(e.target.value)}
                placeholder="Ex: Turma com dificuldades"
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRestriction()}
              />
              <Button
                onClick={handleAddRestriction}
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {localRestrictions.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  {item}
                  <button
                    onClick={() => removeFromList(item, localRestrictions, setLocalRestrictions)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/60">Sugestões:</Label>
              <div className="flex flex-wrap gap-1">
                {restrictionSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, localRestrictions, setLocalRestrictions)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erros de Validação */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Campos obrigatórios:</span>
            </div>
            <ul className="mt-2 space-y-1 text-red-300">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de Confirmação */}
      <div className="flex justify-center">
        <Button
          onClick={handleConfirmContext}
          disabled={!isFormValid || isLoading}
          className={`
            px-8 py-3 text-lg font-semibold
            ${isFormValid 
              ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90' 
              : 'bg-gray-500 cursor-not-allowed'
            }
            transition-all duration-300
            disabled:opacity-50
          `}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              </motion.div>
              Processando...
            </>
          ) : (
            <>
              Confirmar Contexto
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
