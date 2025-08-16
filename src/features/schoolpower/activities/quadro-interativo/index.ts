
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { default as EditActivity } from './EditActivity';
export { default as QuadroInterativoFieldsRenderer } from './QuadroInterativoFieldsRenderer';

export {
  generateQuadroInterativoContent,
  saveQuadroInterativoData,
  getQuadroInterativoData,
  type QuadroInterativoData,
  type QuadroInterativoFieldData
} from './QuadroInterativoGenerator';

export {
  processQuadroInterativoData,
  validateQuadroInterativoData,
  formatQuadroInterativoForDisplay
} from './quadroInterativoProcessor';

export {
  quadroInterativoFieldMapping,
  mapFormDataToQuadroInterativo,
  setNestedValue
} from './fieldMapping';
