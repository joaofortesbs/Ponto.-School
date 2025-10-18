import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActivityFormData } from '../../types/ActivityTypes';

interface SequenciaDidaticaEditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

/**
 * Componente específico para edição de Sequência Didática
 */
export const SequenciaDidaticaEditActivity: React.FC<SequenciaDidaticaEditActivityProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="tituloTemaAssunto">Título do Tema / Assunto *</Label>
        <Input
          id="tituloTemaAssunto"
          value={formData.tituloTemaAssunto || ''}
          onChange={(e) => onFieldChange('tituloTemaAssunto', e.target.value)}
          placeholder="Ex: Substantivos Próprios e Verbos"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="anoSerie">Ano / Série *</Label>
        <Input
          id="anoSerie"
          value={formData.anoSerie || ''}
          onChange={(e) => onFieldChange('anoSerie', e.target.value)}
          placeholder="Ex: 6º Ano do Ensino Fundamental"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="disciplina">Disciplina *</Label>
        <Input
          id="disciplina"
          value={formData.disciplina || ''}
          onChange={(e) => onFieldChange('disciplina', e.target.value)}
          placeholder="Ex: Língua Portuguesa"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="bnccCompetencias">BNCC / Competências</Label>
        <Input
          id="bnccCompetencias"
          value={formData.bnccCompetencias || ''}
          onChange={(e) => onFieldChange('bnccCompetencias', e.target.value)}
          placeholder="Ex: EF06LP01, EF06LP02"
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="publicoAlvo">Público-alvo *</Label>
      <Textarea
        id="publicoAlvo"
        value={formData.publicoAlvo || ''}
        onChange={(e) => onFieldChange('publicoAlvo', e.target.value)}
        placeholder="Descrição detalhada do público-alvo..."
        rows={2}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div>
      <Label htmlFor="objetivosAprendizagem">Objetivos de Aprendizagem *</Label>
      <Textarea
        id="objetivosAprendizagem"
        value={formData.objetivosAprendizagem || ''}
        onChange={(e) => onFieldChange('objetivosAprendizagem', e.target.value)}
        placeholder="Objetivos específicos que os alunos devem alcançar..."
        rows={3}
        required
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="quantidadeAulas">Quantidade de Aulas *</Label>
        <Input
          id="quantidadeAulas"
          type="number"
          value={formData.quantidadeAulas || ''}
          onChange={(e) => onFieldChange('quantidadeAulas', e.target.value)}
          placeholder="Ex: 4"
          min="1"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="quantidadeDiagnosticos">Quantidade de Diagnósticos *</Label>
        <Input
          id="quantidadeDiagnosticos"
          type="number"
          value={formData.quantidadeDiagnosticos || ''}
          onChange={(e) => onFieldChange('quantidadeDiagnosticos', e.target.value)}
          placeholder="Ex: 1"
          min="0"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div>
        <Label htmlFor="quantidadeAvaliacoes">Quantidade de Avaliações *</Label>
        <Input
          id="quantidadeAvaliacoes"
          type="number"
          value={formData.quantidadeAvaliacoes || ''}
          onChange={(e) => onFieldChange('quantidadeAvaliacoes', e.target.value)}
          placeholder="Ex: 2"
          min="0"
          required
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="cronograma">Cronograma</Label>
      <Textarea
        id="cronograma"
        value={formData.cronograma || ''}
        onChange={(e) => onFieldChange('cronograma', e.target.value)}
        placeholder="Cronograma resumido da sequência didática..."
        rows={3}
        className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  </div>
);
