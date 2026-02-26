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

  let uploadBlob = new Blob([bytes], { type: mimeType });
  let uploadExt = fileName.includes('.') ? fileName.split('.').pop()! : 'bin';

  const isHeic =
    mimeType === 'image/heic' ||
    mimeType === 'image/heif' ||
    fileName.toLowerCase().endsWith('.heic') ||
    fileName.toLowerCase().endsWith('.heif');

  if (isHeic) {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await (heic2any as any)({ blob: uploadBlob, toType: 'image/jpeg', quality: 0.85 });
      uploadBlob = Array.isArray(converted) ? converted[0] : (converted as Blob);
      uploadExt = 'jpg';
    } catch (heicErr) {
      console.warn('[LerArquivos] Conversão HEIC→JPEG falhou, enviando original:', heicErr);
    }
  }

  formData.append('file', uploadBlob, `upload_${Date.now()}.${uploadExt}`);
  formData.append('originalName', fileName);

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

function formatErrorContextForPrompt(errors: Array<{ name: string; error: string }>): string {
  const reason = errors[0]?.error || 'falha desconhecida';
  return `📎 AVISO: ${errors.length} arquivo(s) foram enviados mas não puderam ser lidos.
Motivo: ${reason}
INSTRUÇÃO: Informe ao professor com clareza que não foi possível acessar o conteúdo dos arquivos neste momento e explique o motivo. Não invente conteúdo sobre os arquivos.`;
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

function getExtractionMethod(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Gemini/Groq/OpenRouter Vision (cascade)';
  if (mimeType === 'application/pdf') return 'Gemini Vision PDF (fallback: extração de texto)';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Extração de texto (mammoth)';
  if (mimeType.startsWith('text/')) return 'Leitura direta UTF-8';
  return 'Gemini Vision (cascade)';
}

function isFallbackMethod(method: string): boolean {
  return method?.startsWith('fallback_') || method === 'quota_exceeded';
}

function getFallbackReason(method: string): string {
  const reasons: Record<string, string> = {
    fallback_no_api_key: 'API de visão não configurada (GEMINI_API_KEY, GROQ_API_KEY ou OPENROUTER_API_KEY ausente)',
    fallback_quota_exceeded: 'Cota da API de visão esgotada em todos os provedores (Gemini, Groq, OpenRouter) — tente novamente em alguns minutos',
    fallback_pdf_no_gemini: 'Leitura de PDFs requer GEMINI_API_KEY configurada',
    fallback_api_error: 'Erro na API de visão ao processar o arquivo',
    fallback_network_error: 'Erro de rede ao contactar a API de visão',
    fallback_openrouter_error: 'Erro no OpenRouter ao processar o arquivo',
    fallback_groq_error: 'Erro no Groq ao processar o arquivo',
    fallback_groq_empty: 'Groq Vision retornou resposta vazia',
    fallback_openrouter_empty: 'OpenRouter Vision retornou resposta vazia',
    quota_exceeded: 'Cota da API de visão temporariamente esgotada — tente novamente em alguns minutos',
  };
  return reasons[method] || 'Falha desconhecida ao processar o arquivo';
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
      narrative: `📖 ETAPA 3${fileNum}: Extraindo conteúdo de "${file.name}" via ${getExtractionMethod(file.type)}`,
      technical_data: { file_name: file.name, mime_type: file.type },
    });

    try {
      const result = await processFileViaBackend(
        file.base64,
        file.name,
        file.type,
        file.size
      );

      const fallback = isFallbackMethod(result.processing_method);

      if (fallback) {
        const reason = getFallbackReason(result.processing_method);
        errors.push({ name: file.name, error: reason });

        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `❌ ETAPA 4${fileNum}: Falha ao ler "${file.name}" — ${reason}`,
          technical_data: {
            file_name: file.name,
            processing_method: result.processing_method,
            reason,
          },
        });
      } else {
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
      }
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

  const promptContext = transcriptions.length > 0
    ? formatTranscriptionsForPrompt(transcriptions)
    : errors.length > 0
      ? formatErrorContextForPrompt(errors)
      : '';

  const summaryParts = transcriptions.length > 0
    ? transcriptions.map(t => t.original_name)
    : files.map(f => f.name);

  const allFailed = transcriptions.length === 0 && errors.length > 0;
  const partialSuccess = transcriptions.length > 0 && errors.length > 0;

  let etapa5Type: DebugEntry['type'] = 'confirmation';
  let etapa5Narrative: string;

  if (allFailed) {
    etapa5Type = 'error';
    etapa5Narrative = `❌ ETAPA 5: 0 de ${files.length} documento(s) lido(s) — ${errors[0].error}`;
  } else if (partialSuccess) {
    etapa5Type = 'warning' as DebugEntry['type'];
    etapa5Narrative = `⚠️ ETAPA 5: ${transcriptions.length} de ${files.length} documento(s) lido(s) (${errors.length} falhou) — ${summaryParts.join(', ')} — ${totalTime}ms`;
  } else {
    etapa5Narrative = `✅ ETAPA 5: ${transcriptions.length} documento(s) transcrito(s) com sucesso — ${summaryParts.join(', ')} — ${totalTime}ms`;
  }

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: etapa5Type,
    narrative: etapa5Narrative,
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
    summary: allFailed
      ? `0 arquivo(s) lido(s) — ${errors[0]?.error || 'falha'}`
      : `${transcriptions.length} arquivo(s) lido(s): ${summaryParts.join(', ')}`,
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
          recovery_suggestion: 'Verifique a configuração das chaves de API (GEMINI_API_KEY, OPENROUTER_API_KEY) e tente novamente',
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
      data_source: 'Gemini Vision + Groq Vision + OpenRouter cascade + mammoth',
    },
  };
}
