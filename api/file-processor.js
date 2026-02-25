import express from 'express';
import multer from 'multer';
import crypto from 'crypto';

const router = express.Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
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

function resolveKey(primary, fallback) {
  return (process.env[primary] || process.env[fallback] || '').trim();
}

async function callGeminiVision(base64Data, mimeType, promptText) {
  const apiKey = resolveKey('GEMINI_API_KEY', 'VITE_GEMINI_API_KEY');
  if (!apiKey) throw new Error('Chave Gemini não configurada');

  const model = 'gemini-2.5-flash-preview-05-20';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [
        { text: promptText },
        { inline_data: { mime_type: mimeType, data: base64Data } },
      ],
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
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
      throw new Error(`Gemini API error ${response.status}: ${errText.substring(0, 500)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

const VISION_PROMPT = `Você é um assistente educacional especializado em transcrever e interpretar documentos para professores brasileiros.

Analise este documento/imagem com atenção e forneça uma transcrição COMPLETA e ESTRUTURADA.

Responda EXATAMENTE no seguinte formato JSON (sem markdown code blocks, apenas o JSON puro):

{
  "summary": "Resumo conciso do conteúdo em 2-3 frases",
  "full_content": "Transcrição completa e detalhada de TODO o texto visível, preservando a estrutura original (títulos, listas, parágrafos, tabelas). Se houver elementos visuais, descreva-os entre [colchetes].",
  "metadata": {
    "language": "idioma principal do documento",
    "document_type": "tipo do documento (prova, exercício, apostila, slide, foto de quadro, diagrama, tabela, etc.)",
    "subject": "disciplina/matéria se identificável",
    "grade_level": "nível de ensino se identificável",
    "page_count_estimate": 1,
    "has_images": false,
    "has_tables": false,
    "has_formulas": false
  },
  "visual_elements": ["lista de elementos visuais encontrados: gráficos, diagramas, figuras, fotos, etc."],
  "pedagogical_context": "Contexto pedagógico: para que este material pode ser usado, qual o objetivo educacional provável, como um professor poderia aproveitá-lo em sala de aula."
}`;

const PDF_VISION_PROMPT = `Você é um assistente educacional especializado em transcrever PDFs escaneados para professores brasileiros.

Este é um PDF que parece ser escaneado (pouco texto extraível por OCR convencional). Analise CADA PÁGINA como imagem e transcreva TODO o conteúdo visível.

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

async function processImage(buffer, mimeType, originalName) {
  const base64 = buffer.toString('base64');
  const rawText = await callGeminiVision(base64, mimeType, VISION_PROMPT);

  let transcription;
  try {
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    transcription = JSON.parse(cleaned);
  } catch {
    transcription = {
      summary: rawText.substring(0, 200),
      full_content: rawText,
      metadata: { language: 'pt-BR', document_type: 'imagem', subject: '', grade_level: '', page_count_estimate: 1, has_images: true, has_tables: false, has_formulas: false },
      visual_elements: [],
      pedagogical_context: '',
    };
  }

  return { pages: 1, transcription, method: 'gemini_vision' };
}

async function processPDF(buffer, originalName) {
  let extractedText = '';
  let pageCount = 1;

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);
    extractedText = (pdfData.text || '').trim();
    pageCount = pdfData.numpages || 1;
  } catch (err) {
    console.warn(`[FileProcessor] pdf-parse falhou para ${originalName}:`, err.message);
  }

  const MIN_TEXT_THRESHOLD = 100;
  const isScanned = extractedText.length < MIN_TEXT_THRESHOLD;

  if (isScanned) {
    console.log(`[FileProcessor] PDF parece escaneado (${extractedText.length} chars), usando Gemini Vision`);
    const base64 = buffer.toString('base64');
    const rawText = await callGeminiVision(base64, 'application/pdf', PDF_VISION_PROMPT);

    let transcription;
    try {
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      transcription = JSON.parse(cleaned);
    } catch {
      transcription = {
        summary: rawText.substring(0, 200),
        full_content: rawText,
        metadata: { language: 'pt-BR', document_type: 'pdf_escaneado', subject: '', grade_level: '', page_count_estimate: pageCount, has_images: true, has_tables: false, has_formulas: false },
        visual_elements: [],
        pedagogical_context: '',
      };
    }

    return { pages: pageCount, transcription, method: 'gemini_vision_pdf' };
  }

  console.log(`[FileProcessor] PDF com texto extraível (${extractedText.length} chars, ${pageCount} páginas)`);

  if (extractedText.length > 500) {
    const base64 = buffer.toString('base64');
    const enrichPrompt = `Você é um assistente educacional. Analise este PDF e o texto extraído abaixo. Gere uma transcrição estruturada completa.

TEXTO EXTRAÍDO POR OCR:
${extractedText.substring(0, 15000)}

Responda EXATAMENTE no seguinte formato JSON (sem markdown code blocks, apenas o JSON puro):

{
  "summary": "Resumo conciso em 2-3 frases",
  "full_content": "Conteúdo completo e bem formatado, corrigindo erros de OCR e preservando estrutura",
  "metadata": {
    "language": "idioma",
    "document_type": "tipo",
    "subject": "disciplina",
    "grade_level": "nível",
    "page_count_estimate": ${pageCount},
    "has_images": false,
    "has_tables": false,
    "has_formulas": false
  },
  "visual_elements": [],
  "pedagogical_context": "contexto pedagógico"
}`;

    try {
      const rawText = await callGeminiVision(base64, 'application/pdf', enrichPrompt);
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const transcription = JSON.parse(cleaned);
      return { pages: pageCount, transcription, method: 'pdf_parse_plus_gemini' };
    } catch {
      // fall through to text-only
    }
  }

  const transcription = {
    summary: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''),
    full_content: extractedText,
    metadata: { language: 'pt-BR', document_type: 'pdf', subject: '', grade_level: '', page_count_estimate: pageCount, has_images: false, has_tables: false, has_formulas: false },
    visual_elements: [],
    pedagogical_context: '',
  };

  return { pages: pageCount, transcription, method: 'pdf_parse_text' };
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

router.post('/process', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    console.log(`[FileProcessor] Processando: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)}KB)`);

    const fileId = crypto.randomUUID();
    let result;

    if (file.mimetype.startsWith('image/')) {
      result = await processImage(file.buffer, file.mimetype, file.originalname);
    } else if (file.mimetype === 'application/pdf') {
      result = await processPDF(file.buffer, file.originalname);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      result = await processDOCX(file.buffer, file.originalname);
    } else if (file.mimetype.startsWith('text/') || file.mimetype === 'text/csv') {
      result = await processTextFile(file.buffer, file.mimetype, file.originalname);
    } else {
      result = await processTextFile(file.buffer, file.mimetype, file.originalname);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[FileProcessor] Concluído: ${file.originalname} em ${processingTime}ms (método: ${result.method})`);

    res.json({
      success: true,
      file_id: fileId,
      original_name: file.originalname,
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
  res.status(500).json({ success: false, error: 'Erro interno no processamento de arquivo' });
});

export default router;
