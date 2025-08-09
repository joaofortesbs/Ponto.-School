
export interface ActivityData {
  id: string;
  title: string;
  description: string;
  originalData?: any;
  generatedContent?: any;
  desenvolvimento?: any;
  atividades?: any;
  avaliacao?: any;
  metodologia?: any;
  objetivos?: any;
  visaoGeral?: any;
  personalizedTitle?: string;
  personalizedDescription?: string;
  customFields?: Record<string, any>;
  approved?: boolean;
  isBuilt?: boolean;
  builtAt?: Date | null;
}

export interface PlanoAulaData extends ActivityData {
  disciplina?: string;
  tema?: string;
  duracao?: string;
  turma?: string;
  competencias?: string[];
  habilidades?: string[];
}

export default ActivityData;
