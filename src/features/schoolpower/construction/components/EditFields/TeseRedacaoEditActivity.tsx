import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityFormData } from '../../types/ActivityTypes';

interface TeseRedacaoEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

export const TeseRedacaoEditActivity = ({ formData, onFieldChange }: TeseRedacaoEditActivityProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="temaRedacao" className="text-sm">Tema da Redação *</Label>
        <Input
          id="temaRedacao"
          value={formData.temaRedacao || ''}
          onChange={(e) => onFieldChange('temaRedacao', e.target.value)}
          placeholder="Ex: Desafios da mobilidade urbana no Brasil"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="objetivo" className="text-sm">Objetivo da Tese *</Label>
        <Textarea
          id="objetivo"
          value={formData.objetivo || ''}
          onChange={(e) => onFieldChange('objetivo', e.target.value)}
          placeholder="Descreva o objetivo principal que o aluno deve alcançar com esta tese..."
          rows={3}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nivelDificuldade" className="text-sm">Nível de Dificuldade *</Label>
          <Select 
            value={formData.nivelDificuldade || ''} 
            onValueChange={(value) => onFieldChange('nivelDificuldade', value)}
          >
            <SelectTrigger className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fundamental">Ensino Fundamental</SelectItem>
              <SelectItem value="Médio">Ensino Médio</SelectItem>
              <SelectItem value="ENEM">ENEM</SelectItem>
              <SelectItem value="Vestibular">Vestibular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="competenciasENEM" className="text-sm">Competências ENEM *</Label>
          <Input
            id="competenciasENEM"
            value={formData.competenciasENEM || ''}
            onChange={(e) => onFieldChange('competenciasENEM', e.target.value)}
            placeholder="Ex: C1, C2, C3, C4, C5"
            required
            className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contextoAdicional" className="text-sm">Contexto Adicional</Label>
        <Textarea
          id="contextoAdicional"
          value={formData.contextoAdicional || ''}
          onChange={(e) => onFieldChange('contextoAdicional', e.target.value)}
          placeholder="Informações adicionais sobre o contexto histórico, social ou político do tema..."
          rows={3}
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
};
