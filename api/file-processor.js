import express from 'express';
import multer from 'multer';
import crypto from 'crypto';

const router = express.Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown', 'text/html',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const isAllowed =
      ALLOWED_MIME_TYPES.includes(file.mimetype) ||
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('text/');
    if (!isAllowed) {
      return cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

function resolveGeminiKey() {
  return (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
}

function resolveGroqKey() {
  return (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '').trim();
}

function resolveOpenRouterKey() {
  return (process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '').trim();
}

async function callGeminiVision(base64Data, mimeType, promptText) {
  const apiKey = resolveGeminiKey();
  if (!apiKey) return { text: null, method: 'fallback_no_api_key', statusCode: 0 };

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [
        { text: promptText },
        { inline_data: { mime_type: mimeType, data: base64Data } },
      ],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      const code = response.status;
      console.error(`[FileProcessor] Gemini Vision erro ${code}:`, errText.substring(0, 200));
      return { text: null, method: code === 429 ? 'quota_exceeded' : 'fallback_api_error', statusCode: code };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text: text || null, method: 'gemini_vision', statusCode: 200 };
  } catch (err) {
    clearTimeout(timeout);
    console.error('[FileProcessor] Gemini Vision erro de rede:', err.message);
    return { text: null, method: 'fallback_network_error', statusCode: 0 };
  }
}

async function callGroqVision(base64Data, mimeType, promptText) {
  const apiKey = resolveGroqKey();
  if (!apiKey) return { text: null, method: 'fallback_no_api_key' };

  const supportedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const effectiveMime = supportedMimes.includes(mimeType) ? mimeType : 'image/jpeg';
  const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

  const body = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: promptText },
      ],
    }],
    max_tokens: 8192,
    temperature: 0.2,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[FileProcessor] Groq Vision erro ${response.status}:`, errText.substring(0, 200));
      return { text: null, method: 'fallback_groq_error' };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) {
      console.warn('[FileProcessor] Groq Vision retornou resposta vazia');
      return { text: null, method: 'fallback_groq_empty' };
    }
    return { text, method: 'groq_vision' };
  } catch (err) {
    clearTimeout(timeout);
    console.error('[FileProcessor] Groq Vision erro de rede:', err.message);
    return { text: null, method: 'fallback_network_error' };
  }
}

async function callOpenRouterVision(base64Data, mimeType, promptText) {
  const apiKey = resolveOpenRouterKey();
  if (!apiKey) return { text: null, method: 'fallback_no_openrouter_key' };

  const supportedImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const effectiveMime = supportedImageMimes.includes(mimeType) ? mimeType : 'image/jpeg';
  const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

  const body = {
    model: 'openai/gpt-4o-mini',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: promptText },
      ],
    }],
    max_tokens: 8192,
    temperature: 0.2,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pontoschool.app',
        'X-Title': 'Ponto. School',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[FileProcessor] OpenRouter Vision erro ${response.status}:`, errText.substring(0, 200));
      return { text: null, method: 'fallback_openrouter_error' };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) {
      console.warn('[FileProcessor] OpenRouter Vision retornou resposta vazia');
      return { text: null, method: 'fallback_openrouter_empty' };
    }
    return { text, method: 'openrouter_vision' };
  } catch (err) {
    clearTimeout(timeout);
    console.error('[FileProcessor] OpenRouter Vision erro de rede:', err.message);
    return { text: null, method: 'fallback_network_error' };
  }
}

async function callVisionCascade(base64Data, mimeType, promptText) {
  const geminiKey = resolveGeminiKey();
  const groqKey = resolveGroqKey();
  const openRouterKey = resolveOpenRouterKey();

  if (!geminiKey && !groqKey && !openRouterKey) {
    console.warn('[FileProcessor] Nenhuma API de visão configurada');
    return { text: null, method: 'fallback_no_api_key' };
  }

  if (geminiKey) {
    const geminiResult = await callGeminiVision(base64Data, mimeType, promptText);
    if (geminiResult.text) {
      console.log('[FileProcessor] Gemini Vision bem-sucedido');
      return geminiResult;
    }
    const reason = geminiResult.statusCode === 429 ? 'cota esgotada (429)' : geminiResult.method;
    console.warn(`[FileProcessor] Gemini falhou (${reason}) — tentando Groq Vision...`);
  }

  if (groqKey && !mimeType.includes('pdf')) {
    const groqResult = await callGroqVision(base64Data, mimeType, promptText);
    if (groqResult.text) {
      console.log('[FileProcessor] Groq Vision bem-sucedido');
      return groqResult;
    }
    console.warn(`[FileProcessor] Groq Vision falhou (${groqResult.method}) — tentando OpenRouter...`);
  }

  if (openRouterKey && !mimeType.includes('pdf')) {
    const orResult = await callOpenRouterVision(base64Data, mimeType, promptText);
    if (orResult.text) {
      console.log('[FileProcessor] OpenRouter Vision bem-sucedido');
      return orResult;
    }
    console.warn(`[FileProcessor] OpenRouter Vision também falhou: ${orResult.method}`);
  }

  return { text: null, method: 'fallback_quota_exceeded' };
}

async function extractPdfTextFallback(buffer, originalName) {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    await parser.load();
    const result = await parser.getText();
    const extractedText = result?.text?.trim() || '';

    if (!extractedText || extractedText.length < 20) {
      console.warn(`[FileProcessor] pdf-parse extraiu texto insuficiente (${extractedText.length} chars) — PDF provavelmente é escaneado`);
      return null;
    }

    console.log(`[FileProcessor] pdf-parse extraiu ${extractedText.length} chars de texto do PDF`);
    return extractedText;
  } catch (err) {
    console.error('[FileProcessor] pdf-parse falhou:', err.message?.substring(0, 100));
    return null;
  }
}

function parseGeminiJson(rawText, fallbackType = 'documento') {
  if (!rawText) return null;
  try {
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: rawText.substring(0, 200),
      full_content: rawText,
      metadata: {
        language: 'pt-BR',
        document_type: fallbackType,
        subject: '',
        grade_level: '',
        page_count_estimate: 1,
        has_images: false,
        has_tables: false,
        has_formulas: false,
      },
      visual_elements: [],
      pedagogical_context: '',
    };
  }
}

function makeFallbackTranscription(originalName, method) {
  const reasons = {
    fallback_no_api_key: 'Configure GEMINI_API_KEY, GROQ_API_KEY ou OPENROUTER_API_KEY para habilitar leitura de arquivos.',
    fallback_quota_exceeded: 'Cota da API de visão temporariamente esgotada. Tente novamente em alguns minutos.',
    fallback_pdf_no_gemini: 'PDFs requerem a API do Gemini configurada (GEMINI_API_KEY).',
    fallback_api_error: 'Erro na API de visão ao processar o arquivo.',
    fallback_network_error: 'Erro de rede ao contactar a API de visão.',
  };
  const reason = reasons[method] || 'Falha desconhecida ao processar o arquivo.';
  return {
    summary: `${originalName} — leitura indisponível`,
    full_content: `[Arquivo: ${originalName}. ${reason}]`,
    metadata: { language: 'pt-BR', document_type: 'inacessível', subject: '', grade_level: '', page_count_estimate: 1, has_images: false, has_tables: false, has_formulas: false },
    visual_elements: [],
    pedagogical_context: '',
  };
}

const VISION_PROMPT = `Você é um assistente educacional especializado em transcrever e interpretar documentos para professores brasileiros.

Analise esta imagem/documento com atenção e forneça uma transcrição COMPLETA e ESTRUTURADA.

Responda EXATAMENTE no seguinte formato JSON (sem markdown code blocks, apenas o JSON puro):

{
  "summary": "Resumo conciso do conteúdo em 2-3 frases",
  "full_content": "Transcrição completa e detalhada de TODO o texto visível, preservando a estrutura original (títulos, listas, parágrafos, tabelas). Se houver elementos visuais, descreva-os entre [colchetes].",
  "metadata": {
    "language": "idioma principal do documento",
    "document_type": "tipo do documento (prova, exercício, apostila, slide, foto de quadro, diagrama, tabela, foto, imagem etc.)",
    "subject": "disciplina/matéria se identificável",
    "grade_level": "nível de ensino se identificável",
    "page_count_estimate": 1,
    "has_images": true,
    "has_tables": false,
    "has_formulas": false
  },
  "visual_elements": ["lista de elementos visuais encontrados: objetos, pessoas, lugares, gráficos, diagramas, figuras, fotos, etc."],
  "pedagogical_context": "Contexto pedagógico: para que este material pode ser usado, qual o objetivo educacional provável, como um professor poderia aproveitá-lo em sala de aula."
}`;

const PDF_VISION_PROMPT = `Você é um assistente educacional especializado em transcrever PDFs para professores brasileiros.

Analise CADA PÁGINA deste PDF e extraia TODO o conteúdo: texto, tabelas, fórmulas, listas, títulos e elementos visuais relevantes.

Responda EXATAMENTE no seguinte formato JSON (sem markdown code blocks, apenas o JSON puro):

{
  "summary": "Resumo conciso do conteúdo em 2-3 frases",
  "full_content": "Transcrição completa e detalhada de TODO o texto visível em TODAS as páginas, preservando a estrutura original. Separe páginas com --- PÁGINA X ---",
  "metadata": {
    "language": "idioma principal",
    "document_type": "tipo do documento",
    "subject": "disciplina se identificável",
    "grade_level": "nível de ensino se identificável",
    "page_count_estimate": 1,
    "has_images": false,
    "has_tables": false,
    "has_formulas": false
  },
  "visual_elements": ["elementos visuais encontrados"],
  "pedagogical_context": "contexto pedagógico e como um professor pode usar este material"
}`;

const OFFICE_VISION_PROMPT = `Você é um assistente educacional especializado em transcrever apresentações e planilhas para professores brasileiros.

Analise este documento Office (PowerPoint/Excel) e extraia TODO o conteúdo textual e visual de forma organizada.

Responda EXATAMENTE no seguinte formato JSON (sem markdown code blocks, apenas o JSON puro):

{
  "summary": "Resumo conciso do conteúdo em 2-3 frases",
  "full_content": "Transcrição completa e organizada de TODO o conteúdo. Para apresentações: slide por slide. Para planilhas: tabela formatada com todos os dados.",
  "metadata": {
    "language": "idioma principal",
    "document_type": "apresentação ou planilha",
    "subject": "disciplina se identificável",
    "grade_level": "nível de ensino se identificável",
    "page_count_estimate": 1,
    "has_images": false,
    "has_tables": true,
    "has_formulas": false
  },
  "visual_elements": ["elementos visuais encontrados"],
  "pedagogical_context": "contexto pedagógico e como um professor pode usar este material"
}`;

async function processImage(buffer, mimeType, originalName) {
  const base64 = buffer.toString('base64');

  const supportedVisionMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const effectiveMime = supportedVisionMimes.includes(mimeType) ? mimeType : 'image/jpeg';

  const { text: rawText, method } = await callVisionCascade(base64, effectiveMime, VISION_PROMPT);

  if (!rawText) {
    return {
      pages: 1,
      transcription: makeFallbackTranscription(originalName, method),
      method,
    };
  }

  const transcription = parseGeminiJson(rawText, 'imagem');
  return { pages: 1, transcription, method };
}

async function processPDF(buffer, originalName) {
  console.log(`[FileProcessor] PDF: tentando Gemini Vision (${(buffer.length / 1024).toFixed(1)}KB)`);
  const base64 = buffer.toString('base64');

  const geminiResult = await callGeminiVision(base64, 'application/pdf', PDF_VISION_PROMPT);

  if (geminiResult.text) {
    const transcription = parseGeminiJson(geminiResult.text, 'pdf');
    return { pages: transcription?.metadata?.page_count_estimate || 1, transcription, method: 'gemini_vision_pdf' };
  }

  console.warn(`[FileProcessor] Gemini PDF falhou (${geminiResult.method}) — tentando extração de texto via pdf-parse...`);
  const extractedText = await extractPdfTextFallback(buffer, originalName);

  if (extractedText) {
    const transcription = {
      summary: extractedText.substring(0, 250) + (extractedText.length > 250 ? '...' : ''),
      full_content: extractedText,
      metadata: {
        language: 'pt-BR',
        document_type: 'pdf',
        subject: '',
        grade_level: '',
        page_count_estimate: Math.max(1, Math.ceil(extractedText.length / 3000)),
        has_images: false,
        has_tables: false,
        has_formulas: false,
      },
      visual_elements: [],
      pedagogical_context: '',
    };
    return {
      pages: transcription.metadata.page_count_estimate,
      transcription,
      method: 'pdf_text_extract',
    };
  }

  const reason = geminiResult.statusCode === 429 ? 'fallback_quota_exceeded' : (geminiResult.method.startsWith('fallback') ? geminiResult.method : 'fallback_quota_exceeded');
  return {
    pages: 1,
    transcription: makeFallbackTranscription(originalName, reason),
    method: reason,
  };
}

async function processDOCX(buffer, originalName) {
  const mammoth = (await import('mammoth')).default;

  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  const text = textResult.value || '';
  const html = htmlResult.value || '';

  const transcription = {
    summary: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
    full_content: text,
    metadata: {
      language: 'pt-BR',
      document_type: 'docx',
      subject: '',
      grade_level: '',
      page_count_estimate: Math.max(1, Math.ceil(text.length / 3000)),
      has_images: html.includes('<img'),
      has_tables: html.includes('<table'),
      has_formulas: false,
    },
    visual_elements: [],
    pedagogical_context: '',
    html_content: html,
  };

  return { pages: transcription.metadata.page_count_estimate, transcription, method: 'mammoth' };
}

async function processOfficeFile(buffer, mimeType, originalName) {
  const base64 = buffer.toString('base64');
  const { text: rawText, method } = await callVisionCascade(base64, mimeType, OFFICE_VISION_PROMPT);

  if (!rawText) {
    return {
      pages: 1,
      transcription: makeFallbackTranscription(originalName, method),
      method,
    };
  }

  const transcription = parseGeminiJson(rawText, mimeType.includes('presentation') ? 'apresentação' : 'planilha');
  return { pages: 1, transcription, method };
}

async function processTextFile(buffer, mimeType, originalName) {
  const text = buffer.toString('utf-8');

  const transcription = {
    summary: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
    full_content: text,
    metadata: {
      language: 'pt-BR',
      document_type: mimeType === 'text/csv' ? 'csv' : (mimeType === 'text/markdown' ? 'markdown' : 'texto'),
      subject: '',
      grade_level: '',
      page_count_estimate: Math.max(1, Math.ceil(text.length / 3000)),
      has_images: false,
      has_tables: mimeType === 'text/csv',
      has_formulas: false,
    },
    visual_elements: [],
    pedagogical_context: '',
  };

  return { pages: transcription.metadata.page_count_estimate, transcription, method: 'text_direct' };
}

router.post('/process', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, async (req, res) => {
  const startTime = Date.now();
  res.setHeader('Content-Type', 'application/json');

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const originalName = (() => {
      if (req.body?.originalName) return req.body.originalName;
      try { return decodeURIComponent(file.originalname); }
      catch { return file.originalname; }
    })();

    console.log(`[FileProcessor] Processando: ${originalName} (${file.mimetype}, ${(file.size / 1024).toFixed(1)}KB)`);

    const fileId = crypto.randomUUID();
    let result;

    if (file.mimetype.startsWith('image/')) {
      result = await processImage(file.buffer, file.mimetype, originalName);
    } else if (file.mimetype === 'application/pdf') {
      result = await processPDF(file.buffer, originalName);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      result = await processDOCX(file.buffer, originalName);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      result = await processOfficeFile(file.buffer, file.mimetype, originalName);
    } else if (file.mimetype.startsWith('text/')) {
      result = await processTextFile(file.buffer, file.mimetype, originalName);
    } else {
      result = await processTextFile(file.buffer, file.mimetype, originalName);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[FileProcessor] Concluído: ${originalName} em ${processingTime}ms (método: ${result.method})`);

    res.json({
      success: true,
      file_id: fileId,
      original_name: originalName,
      mime_type: file.mimetype,
      file_size: file.size,
      pages: result.pages,
      transcription: result.transcription,
      processing_method: result.method,
      processing_time_ms: processingTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[FileProcessor] Erro:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar arquivo',
      processing_time_ms: processingTime,
    });
  }
});

router.use((err, _req, res, _next) => {
  res.setHeader('Content-Type', 'application/json');
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'Arquivo excede o limite de 25MB' });
    }
    return res.status(400).json({ success: false, error: `Erro de upload: ${err.message}` });
  }
  if (err.message?.includes('Tipo de arquivo não suportado')) {
    return res.status(415).json({ success: false, error: err.message });
  }
  console.error('[FileProcessor] Erro inesperado:', err);
  res.status(500).json({ success: false, error: err.message || 'Erro interno no processamento de arquivo' });
});

export default router;
