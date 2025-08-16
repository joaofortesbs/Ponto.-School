
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

export function EditActivity({ formData, onFieldChange }: EditActivityProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Disciplina / Área de conhecimento *</Label>
          <Input
            id="subject"
            value={formData.subject || ''}
            onChange={(e) => onFieldChange('subject', e.target.value)}
            placeholder="Ex: Matemática, Português, Ciências"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="schoolYear">Ano / Série *</Label>
          <Input
            id="schoolYear"
            value={formData.schoolYear || ''}
            onChange={(e) => onFieldChange('schoolYear', e.target.value)}
            placeholder="Ex: 6º Ano, 7º Ano, 8º Ano"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="theme">Tema ou Assunto da aula *</Label>
        <Input
          id="theme"
          value={formData.theme || ''}
          onChange={(e) => onFieldChange('theme', e.target.value)}
          placeholder="Ex: Substantivos e Verbos, Frações, Sistema Solar"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="objectives">Objetivo de aprendizagem da aula *</Label>
        <Textarea
          id="objectives"
          value={formData.objectives || ''}
          onChange={(e) => onFieldChange('objectives', e.target.value)}
          placeholder="Descreva os objetivos específicos que os alunos devem alcançar com esta atividade de quadro interativo..."
          rows={3}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficultyLevel">Nível de Dificuldade *</Label>
          <Input
            id="difficultyLevel"
            value={formData.difficultyLevel || ''}
            onChange={(e) => onFieldChange('difficultyLevel', e.target.value)}
            placeholder="Ex: Básico, Intermediário, Avançado"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="quadroInterativoCampoEspecifico">Atividade mostrada *</Label>
          <Input
            id="quadroInterativoCampoEspecifico"
            value={formData.quadroInterativoCampoEspecifico || ''}
            onChange={(e) => onFieldChange('quadroInterativoCampoEspecifico', e.target.value)}
            placeholder="Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
        <Textarea
          id="materials"
          value={formData.materials || ''}
          onChange={(e) => onFieldChange('materials', e.target.value)}
          placeholder="Liste os materiais necessários (um por linha)..."
          className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
        <Textarea
          id="instructions"
          value={formData.instructions || ''}
          onChange={(e) => onFieldChange('instructions', e.target.value)}
          placeholder="Descreva como a atividade deve ser executada..."
          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
        <Textarea
          id="evaluation"
          value={formData.evaluation || ''}
          onChange={(e) => onFieldChange('evaluation', e.target.value)}
          placeholder="Como a atividade será avaliada..."
          className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}

export default EditActivity;
