import type { CapabilityInput, CapabilityOutput, DebugEntry } from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';

export interface FileTranscription {
  file_id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  pages?: number;
  transcription: {
    summary: string;
    full_content: string;
    metadata: Record<string, any>;
    visual_elements: string[];
    pedagogical_context: string;
  };
  processing_method: string;
  processing_time_ms: number;
}

export interface LerArquivosData {
  arquivos: FileTranscription[];
  count: number;
  prompt_context: string;
  summary: string;
  total_processing_time_ms: number;
}

async function processFileViaBackend(
  fileBase64: string,
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<FileTranscription> {
  const formData = new FormData();

  const binaryStr = atob(fileBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  formData.append('file', blob, fileName);

  const response = await fetch('/api/files/process', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Erro ${response.status} ao processar arquivo`);
  }

  return await response.json();
}

function formatTranscriptionsForPrompt(transcriptions: FileTranscription[]): string {
  if (transcriptions.length === 0) return '';

  const sections = transcriptions.map((t, idx) => {
    const header = transcriptions.length > 1 ? `### Documento ${idx + 1}: ${t.original_name}` : `### ${t.original_name}`;
    const meta = [
      t.mime_type && `Tipo: ${t.mime_type}`,
      t.pages && `Páginas: ${t.pages}`,
      t.transcription.pedagogical_context && `Contexto: ${t.transcription.pedagogical_context}`,
    ].filter(Boolean).join(' | ');

    const visualDesc = t.transcription.visual_elements?.length > 0
      ? `\n**Elementos visuais:** ${t.transcription.visual_elements.join('; ')}`
      : '';

    return `${header}
${meta}${visualDesc}

**Resumo:** ${t.transcription.summary}

**Conteúdo completo:**
${t.transcription.full_content}`;
  });

  return `📎 DOCUMENTOS DO PROFESSOR (${transcriptions.length} arquivo${transcriptions.length > 1 ? 's' : ''})
═══════════════════════════════════════════════════

${sections.join('\n\n---\n\n')}

═══════════════════════════════════════════════════
INSTRUÇÃO: Use o conteúdo acima como referência para responder ao professor.
Cite trechos específicos quando relevante. Nunca invente dados que não estão nos documentos.`;
}

function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📈';
  if (mimeType.startsWith('text/')) return '📃';
  return '📎';
}

export async function lerArquivosV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = input.context || {};

  const files: Array<{
    base64: string;
    name: string;
    type: string;
    size: number;
  }> = params.files || [];

  if (files.length === 0) {
    return {
      success: false,
      capability_id: 'ler_arquivos',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'NO_FILES',
        message: 'Nenhum arquivo foi enviado para leitura',
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Envie pelo menos um arquivo (imagem, PDF, DOCX, TXT, CSV)',
      },
      debug_log,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'none',
      },
    };
  }

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `📎 ETAPA 1: Recebendo ${files.length} arquivo(s) do professor`,
    technical_data: {
      total_files: files.length,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size_kb: Math.round(f.size / 1024),
      })),
    },
  });

  const fileTypeSummary = files.map(f => `${getMimeIcon(f.type)} ${f.name}`).join(', ');
  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'discovery',
    narrative: `🔍 ETAPA 2: Identificando tipos — ${fileTypeSummary}`,
    technical_data: {
      types: files.map(f => f.type),
    },
  });

  const transcriptions: FileTranscription[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileNum = files.length > 1 ? ` (${i + 1}/${files.length})` : '';

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `📖 ETAPA 3${fileNum}: Extraindo conteúdo de "${file.name}" via ${file.type.startsWith('image/') ? 'Gemini Vision' : file.type === 'application/pdf' ? 'PDF Parser + Gemini' : 'Text Extraction'}`,
      technical_data: { file_name: file.name, mime_type: file.type },
    });

    try {
      const result = await processFileViaBackend(
        file.base64,
        file.name,
        file.type,
        file.size
      );
      transcriptions.push(result);

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'discovery',
        narrative: `🧠 ETAPA 4${fileNum}: Transcrição gerada — "${result.transcription.summary.substring(0, 100)}${result.transcription.summary.length > 100 ? '...' : ''}"`,
        technical_data: {
          file_id: result.file_id,
          processing_method: result.processing_method,
          pages: result.pages,
          content_length: result.transcription.full_content.length,
          visual_elements: result.transcription.visual_elements?.length || 0,
          processing_time_ms: result.processing_time_ms,
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push({ name: file.name, error: errorMsg });

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ Erro ao processar "${file.name}": ${errorMsg}`,
        technical_data: { file_name: file.name, error: errorMsg },
      });
    }
  }

  const totalTime = Date.now() - startTime;
  const promptContext = formatTranscriptionsForPrompt(transcriptions);
  const summaryParts = transcriptions.map(t => t.original_name);

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'confirmation',
    narrative: `✅ ETAPA 5: ${transcriptions.length} documento(s) transcrito(s) com sucesso${errors.length > 0 ? ` (${errors.length} erro(s))` : ''} — ${summaryParts.join(', ')} — ${totalTime}ms`,
    technical_data: {
      total_transcribed: transcriptions.length,
      total_errors: errors.length,
      total_time_ms: totalTime,
      content_total_chars: transcriptions.reduce((sum, t) => sum + t.transcription.full_content.length, 0),
    },
  });

  const resultData: LerArquivosData = {
    arquivos: transcriptions,
    count: transcriptions.length,
    prompt_context: promptContext,
    summary: `${transcriptions.length} arquivo(s) lido(s): ${summaryParts.join(', ')}`,
    total_processing_time_ms: totalTime,
  };

  return {
    success: transcriptions.length > 0,
    capability_id: 'ler_arquivos',
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: resultData,
    error: transcriptions.length === 0
      ? {
          code: 'ALL_FILES_FAILED',
          message: `Todos os ${files.length} arquivo(s) falharam: ${errors.map(e => e.error).join('; ')}`,
          severity: 'high',
          recoverable: true,
          recovery_suggestion: 'Verifique se os arquivos são válidos e tente novamente',
        }
      : null,
    debug_log,
    data_confirmation: createDataConfirmation([
      createDataCheck(
        'arquivos_recebidos',
        'Arquivos recebidos',
        files.length > 0,
        files.length,
        'Pelo menos 1 arquivo'
      ),
      createDataCheck(
        'transcricao_gerada',
        'Transcrição gerada com sucesso',
        transcriptions.length > 0,
        transcriptions.length,
        'Pelo menos 1 transcrição'
      ),
      createDataCheck(
        'conteudo_extraido',
        'Conteúdo extraído não vazio',
        transcriptions.some(t => t.transcription.full_content.length > 50),
        transcriptions.reduce((s, t) => s + t.transcription.full_content.length, 0),
        'Conteúdo com mais de 50 caracteres'
      ),
    ]),
    metadata: {
      duration_ms: totalTime,
      retry_count: 0,
      data_source: 'Gemini 2.5 Flash Vision + pdf-parse + mammoth',
    },
  };
}
