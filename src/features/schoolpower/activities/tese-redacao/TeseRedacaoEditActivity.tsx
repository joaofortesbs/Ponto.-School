import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface TeseRedacaoFormData {
  temaRedacao?: string;
  nivelDificuldade?: string;
  objetivo?: string;
  competenciasENEM?: string;
  contextoAdicional?: string;
}

export interface TeseRedacaoEditActivityProps {
  formData: TeseRedacaoFormData & Record<string, any>;
  onFieldChange: (field: string, value: string) => void;
}

export const TeseRedacaoEditActivity = ({ formData, onFieldChange }: TeseRedacaoEditActivityProps) => {
  console.log('%c🎨 [TESE REDAÇÃO] Renderizando formulário com dados:', 'color: #9C27B0; font-weight: bold;', {
    temaRedacao: formData.temaRedacao,
    objetivo: formData.objetivo,
    nivelDificuldade: formData.nivelDificuldade,
    competenciasENEM: formData.competenciasENEM,
    contextoAdicional: formData.contextoAdicional
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="temaRedacao" className="text-sm">Tema da Redação *</Label>
        <Textarea
          id="temaRedacao"
          value={formData.temaRedacao || ''}
          onChange={(e) => {
            console.log('%c✏️ [TESE REDAÇÃO] Campo "Tema da Redação" alterado:', 'color: #FF9800;', e.target.value);
            onFieldChange('temaRedacao', e.target.value);
          }}
          placeholder="Ex: Desafios da Preservação da Cultura Brasileira no século XXI"
          rows={2}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="nivelDificuldade" className="text-sm">Nível de Dificuldade *</Label>
        <Input
          id="nivelDificuldade"
          value={formData.nivelDificuldade || ''}
          onChange={(e) => {
            console.log('%c✏️ [TESE REDAÇÃO] Campo "Nível de Dificuldade" alterado:', 'color: #FF9800;', e.target.value);
            onFieldChange('nivelDificuldade', e.target.value);
          }}
          placeholder="Ex: Fácil, Médio ou Difícil"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="objetivo" className="text-sm">Objetivo *</Label>
        <Textarea
          id="objetivo"
          value={formData.objetivo || ''}
          onChange={(e) => {
            console.log('%c✏️ [TESE REDAÇÃO] Campo "Objetivo" alterado:', 'color: #FF9800;', e.target.value);
            onFieldChange('objetivo', e.target.value);
          }}
          placeholder="Ex: Elaborar teses claras e argumentativas sobre a preservação cultural brasileira"
          rows={3}
          required
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="competenciasENEM" className="text-sm">Competências ENEM *</Label>
        <Input
          id="competenciasENEM"
          value={formData.competenciasENEM || ''}
          onChange={(e) => {
            console.log('%c✏️ [TESE REDAÇÃO] Campo "Competências ENEM" alterado:', 'color: #FF9800;', e.target.value);
            onFieldChange('competenciasENEM', e.target.value);
          }}
          placeholder="Ex: Competência II (compreensão tema) ou Competência III (argumentação)"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="contextoAdicional" className="text-sm">Contexto Adicional</Label>
        <Textarea
          id="contextoAdicional"
          value={formData.contextoAdicional || ''}
          onChange={(e) => {
            console.log('%c✏️ [TESE REDAÇÃO] Campo "Contexto Adicional" alterado:', 'color: #FF9800;', e.target.value);
            onFieldChange('contextoAdicional', e.target.value);
          }}
          placeholder="Ex: Considere aspectos como globalização, políticas públicas culturais e diversidade regional"
          rows={3}
          className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
};
