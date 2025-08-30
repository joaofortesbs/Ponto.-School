
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { default as QuadroInterativoGenerator, QuadroInterativoGenerator as QuadroInterativoGeneratorClass } from './QuadroInterativoGenerator';
export { 
  prepareQuadroInterativoData, 
  processQuadroInterativoData,
  validateQuadroInterativoData,
  type QuadroInterativoProcessedData
} from './quadroInterativoProcessor';
export { quadroInterativoFieldMapping } from './fieldMapping';
export * from './fieldMapping';
export type { QuadroInterativoData, QuadroInterativoContent } from './QuadroInterativoGenerator';
