import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityFormData } from '../../types/ActivityTypes';

interface PlanoAulaEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

export const PlanoAulaEditActivity = ({ formData, onFieldChange }: PlanoAulaEditActivityProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Componente Curricular *</Label>
          <Input
            id="subject"
            value={formData.subject || ''}
            onChange={(e) => onFieldChange('subject', e.target.value)}
            placeholder="Ex: Matemática, Português, História"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="theme">Tema ou Tópico Central *</Label>
          <Input
            id="theme"
            value={formData.theme || ''}
            onChange={(e) => onFieldChange('theme', e.target.value)}
            placeholder="Ex: Frações, Revolução Francesa"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schoolYear">Ano/Série Escolar *</Label>
          <Input
            id="schoolYear"
            value={formData.schoolYear || ''}
            onChange={(e) => onFieldChange('schoolYear', e.target.value)}
            placeholder="Ex: 6º Ano - Ensino Fundamental"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="competencies">Habilidades BNCC</Label>
          <Input
            id="competencies"
            value={formData.competencies || ''}
            onChange={(e) => onFieldChange('competencies', e.target.value)}
            placeholder="Ex: EF67MA01, EF67LP02"
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="objectives">Objetivo Geral *</Label>
        <Textarea
          id="objectives"
          value={formData.objectives || ''}
          onChange={(e) => onFieldChange('objectives', e.target.value)}
          placeholder="Descreva o objetivo principal da aula..."
          rows={3}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="materials">Materiais/Recursos *</Label>
        <Textarea
          id="materials"
          value={formData.materials || ''}
          onChange={(e) => onFieldChange('materials', e.target.value)}
          placeholder="Lista de materiais necessários (um por linha)..."
          rows={3}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="context">Perfil da Turma / Contexto *</Label>
        <Textarea
          id="context"
          value={formData.context || ''}
          onChange={(e) => onFieldChange('context', e.target.value)}
          placeholder="Descrição do perfil da turma e contexto da aula..."
          rows={2}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit">Carga Horária / Tempo Estimado</Label>
          <Input
            id="timeLimit"
            value={formData.timeLimit || ''}
            onChange={(e) => onFieldChange('timeLimit', e.target.value)}
            placeholder="Ex: 2 aulas de 50 minutos"
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="difficultyLevel">Tipo de Aula / Metodologia</Label>
          <Select value={formData.difficultyLevel} onValueChange={(value) => onFieldChange('difficultyLevel', value)}>
            <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
              <SelectValue placeholder="Selecione o tipo de aula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Expositiva">Aula Expositiva</SelectItem>
              <SelectItem value="Debate">Debate</SelectItem>
              <SelectItem value="Estudo de Caso">Estudo de Caso</SelectItem>
              <SelectItem value="Resolução de Problemas">Resolução de Problemas</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="evaluation">Observações do Professor / Avaliação</Label>
        <Textarea
          id="evaluation"
          value={formData.evaluation || ''}
          onChange={(e) => onFieldChange('evaluation', e.target.value)}
          placeholder="Observações relevantes para a aula ou critérios de avaliação..."
          rows={2}
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
};
