
// DEPRECATED: Este arquivo foi mantido para compatibilidade.
// A migração para Mistral/HuggingFace foi concluída.
// Use mistralClient.ts para novas implementações.

export { 
  MistralClient as GeminiClient, 
  mistralClient as geminiClient,
  type MistralRequest as GeminiRequest,
  type MistralResponse as GeminiResponse
} from './mistralClient';
