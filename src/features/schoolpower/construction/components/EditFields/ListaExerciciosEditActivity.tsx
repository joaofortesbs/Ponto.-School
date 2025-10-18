import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityFormData } from '../../types/ActivityTypes';

interface ListaExerciciosEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

export const ListaExerciciosEditActivity = ({ formData, onFieldChange }: ListaExerciciosEditActivityProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfQuestions">Número de Questões</Label>
          <Input
            id="numberOfQuestions"
            value={formData.numberOfQuestions}
            onChange={(e) => onFieldChange('numberOfQuestions', e.target.value)}
            placeholder="Ex: 10"
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="difficultyLevel">Nível de Dificuldade</Label>
          <Select value={formData.difficultyLevel} onValueChange={(value) => onFieldChange('difficultyLevel', value)}>
            <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
              <SelectValue placeholder="Selecione a dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="questionModel">Modelo de Questões</Label>
        <Input
          id="questionModel"
          value={formData.questionModel}
          onChange={(e) => onFieldChange('questionModel', e.target.value)}
          placeholder="Ex: Múltipla escolha, discursivas..."
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="sources">Fontes</Label>
        <Textarea
          id="sources"
          value={formData.sources}
          onChange={(e) => onFieldChange('sources', e.target.value)}
          placeholder="Fontes utilizadas para criar as questões..."
          rows={3}
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="objectives">Objetivos</Label>
        <Textarea
          id="objectives"
          value={formData.objectives}
          onChange={(e) => onFieldChange('objectives', e.target.value)}
          placeholder="Objetivos da lista de exercícios..."
          rows={3}
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="materials">Materiais</Label>
        <Textarea
          id="materials"
          value={formData.materials}
          onChange={(e) => onFieldChange('materials', e.target.value)}
          placeholder="Materiais necessários..."
          rows={2}
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit">Tempo Limite</Label>
          <Input
            id="timeLimit"
            value={formData.timeLimit}
            onChange={(e) => onFieldChange('timeLimit', e.target.value)}
            placeholder="Ex: 60 minutos"
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="context">Contexto de Aplicação</Label>
          <Input
            id="context"
            value={formData.context}
            onChange={(e) => onFieldChange('context', e.target.value)}
            placeholder="Ex: Prova final, atividade em sala..."
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};
