
// Componentes principais
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { default as EditActivity } from './EditActivity';

// Serviços e utilitários
export { generateQuadroInterativoContent } from './QuadroInterativoGenerator';
export { 
  processQuadroInterativoData,
  createQuadroInterativoSummary,
  validateQuadroInterativoForSave
} from './quadroInterativoProcessor';

// Mapeamento de campos
export {
  quadroInterativoFieldMapping,
  defaultQuadroInterativoData,
  mapFormDataToQuadroInterativo,
  validateQuadroInterativoData
} from './fieldMapping';

// Tipos
export type { QuadroInterativoProcessorInput, QuadroInterativoProcessorOutput } from './quadroInterativoProcessor';

// Configuração da atividade
export const quadroInterativoConfig = {
  id: 'quadro-interativo',
  name: 'Quadro Interativo',
  description: 'Gera quadros interativos com apresentações e atividades práticas',
  category: 'interactive',
  fields: [
    'quadroInterativoTitulo',
    'quadroInterativoDescricao', 
    'quadroInterativoMateria',
    'quadroInterativoTema',
    'quadroInterativoAnoEscolar',
    'quadroInterativoNumeroQuestoes',
    'quadroInterativoNivelDificuldade',
    'quadroInterativoModalidadeQuestao',
    'quadroInterativoCampoEspecifico'
  ],
  requiredFields: [
    'quadroInterativoTitulo',
    'quadroInterativoMateria', 
    'quadroInterativoTema'
  ],
  defaultData: defaultQuadroInterativoData
};
