# Ponto. School

## SchoolPower Tab Drag-and-Drop + Hover Gradient (Março 2026)
Sistema de reordenação de abas por drag-and-drop com persistência no Neon DB e efeito hover configurável.

### Arquivos alterados
- `api/neon-db.js` — `ALTER TABLE sp_sessions ADD COLUMN IF NOT EXISTS tab_order SMALLINT NOT NULL DEFAULT 0`
- `api/school-power-sessions.js` — `snakeToCamel` inclui `tabOrder`, GET ordena por `tab_order ASC`, PATCH aceita `tabOrder`, novo endpoint `PATCH /sessions-order` para batch reorder
- `src/features/schoolpower/components/tabs/useSessionsApi.ts` — função `reorderSessions()` para batch update
- `src/features/schoolpower/components/tabs/useSchoolPowerTabs.ts` — `handleReorderTabs` conectado ao DB
- `src/features/schoolpower/components/tabs/SchoolPowerShell.tsx` — drag-and-drop nativo (pointer events), hover gradient configurável, fade de conteúdo, prop `onReorderTab`
- `src/sections/SchoolPower/SchoolPowerPage.tsx` — passa `onReorderTab={handleReorderTabs}`

### Comportamento do drag
- Pointer events nativos (sem libs externas): `onPointerDown` → `setPointerCapture` → `onPointerMove` → `onPointerUp`
- Threshold de 5px para distinguir click de drag
- Preview visual em tempo real: tabs não-dragging deslizam suavemente (`transition: left 0.15s ease`)
- SVG path recalculado em tempo real com a ordem de preview
- Drop: chama `reorderTabs` (Zustand/localStorage) + `reorderSessions` (Neon DB)

### Configuração HOVER (em SchoolPowerShell.tsx)
```typescript
const HOVER = {
  TAB_HOVER_COLOR:     [255, 255, 255],  // RGB do gradiente
  TAB_HOVER_INTENSITY:  0.10,             // opacidade máxima no topo (0–1)
  TAB_HOVER_STOP:        65,              // % onde gradiente vira transparente
};
```

### Fade de conteúdo
Ao trocar de aba, o conteúdo faz fade de 120ms (`opacity: 0 → 1`) para transição suave.

### Drag visual — tab body completo (Março 2026 — revisão)
**Problema resolvido**: Antes da correção, apenas o label (texto+ícone) se movia durante o drag; o "entalhe" (notch) do SVG ficava na posição lógica de preview, criando desalinhamento visível.

**Solução (padrão Chrome/Firefox/Edge):**
1. `buildBorderPath(W, H, slots, excludeTabId?)` — quando `excludeTabId` está definido, pula o notch daquela aba e avança `cx` corretamente, deixando um "gap plano" no SVG principal
2. `buildSingleTabOutline(slotW)` — nova função que gera o path SVG de UMA aba em coordenadas locais (largura total = VALLEY_R + slotW + VALLEY_R)
3. SVG flutuante absolutamente posicionado em `left: dragSlotEntry.startX + deltaX - VALLEY_R` — segue o ponteiro em tempo real, filled com `DRAG.TAB_BG_DARK/LIGHT` + stroke border + `filter: drop-shadow(...)` para efeito de elevação
4. Botão da aba arrastada: `background: transparent` (SVG cuida do fundo), `zIndex: 30` (label visível acima do SVG flutuante em z-index 29)

---

## SchoolPower Tab Session Persistence (Março 2026)
Sistema completo de persistência de sessões por aba no SchoolPower (Jota Chat), com banco de dados PostgreSQL como fonte de verdade.

### Arquivos novos/alterados
- `api/neon-db.js` — métodos `createSpSessionsTable`, `createSpMessagesTable`, `initSpTables`
- `api/school-power-sessions.js` — roteador Express com CRUD completo para sessões e mensagens
- `api/server.js` — registra `spSessionsRouter` em `/api/sp` e chama `initSpTables` no startup
- `src/features/schoolpower/components/tabs/useSessionsApi.ts` — hook frontend com todas as chamadas à API
- `src/features/schoolpower/components/tabs/useSchoolPowerTabs.ts` — integração completa com DB
- `src/sections/SchoolPower/SchoolPowerPage.tsx` — passa `userId` para `useSchoolPowerTabs`

### Tabelas no banco
- `sp_sessions` — uma linha por aba/sessão (metadados + estado do fluxo AI)
- `sp_messages` — uma linha por mensagem (com ON DELETE CASCADE para sp_sessions)

### Comportamento
- DB é a fonte de verdade; Zustand/localStorage é cache
- Sessões carregam do DB na montagem (por userId)
- Mensagens novas são salvas automaticamente (debounce 600ms para streaming, imediato para mensagens finais do usuário)
- Troca de abas sincroniza estado com o DB (debounce 800ms)
- Lazy-load de mensagens ao ativar uma aba com histórico vazio no store
- Migração automática: dados existentes do localStorage são migrados para o DB (roda uma vez por userId)
- Sessões fechadas ficam com `is_active = false` (soft-delete, não apagados)
- Layout: `SHELL_TOP_OFFSET_PX = -12` para ajuste fino da altura do container das abas

### Upsert-first para FK safety (fix FK violations)
- Problema original: mensagens chegavam ao backend antes da sessão existir em `sp_sessions` — race condition FK
- Solução: endpoints `POST /sessions/:sessionId/messages` e `POST .../batch` aceitam `userId` no body e executam `INSERT INTO sp_sessions ... ON CONFLICT DO NOTHING` antes de qualquer insert de mensagem
- Frontend: `saveMessage` e `saveMessages` em `useSessionsApi.ts` passam `userId: uid` no body automaticamente
- Padrão "upsert-on-write" — elimina o race condition sem precisar garantir ordem no frontend

### Auto-scroll animado ao restaurar mensagens (troca de aba)
- `ChatLayout.tsx`: detecta restore em bulk (delta de messages > 1) via `prevMsgCountRef`
- Para bulk restore (troca de aba): posiciona no topo (primeiro input visível) → 160ms delay → animação `easeOutCubic` de 950ms até o final da conversa
- `animateScrollToEnd()`: usa `requestAnimationFrame` com `performance.now()` + `easeOutCubic(t) = 1 - (1-t)^3` — acelera e desacelera suavemente ao final
- `scrollContainerRef` aponta para o `div.flex-1.overflow-y-auto` real (não usa `scrollIntoView`) para controle direto do `scrollTop`
- Usa `animFrameRef` + `animTimerRef` para cancelamento seguro na desmontagem ou troca de aba durante animação
- Para mensagens incrementais (delta = 1): mantém `behavior: 'smooth'` padrão via `scrollIntoView`



## Overview
Ponto. School is an AI-powered educational platform providing personalized learning experiences and streamlining educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## Artifact Title & Subtitle Generation v1.0 (Março 2026)
Corrigido o problema de títulos e subtítulos genéricos nos artefatos textuais do `ArtifactViewModal`.

### Arquivo
- `agente-jota/capabilities/CRIAR_ARQUIVO/artifact-generator.ts`

### O que mudou
- **`METADATA_HEADER_INSTRUCTIONS`** (constante): Injetada no início de TODOS os prompts de geração de artefato (antes do BNCC e do template). Instrui a IA a gerar obrigatoriamente: (1) `#` header com título específico do tema (5-12 palavras, sem prefixo de tipo); (2) linha `**Subtítulo:**` imediatamente abaixo (60-120 chars descrevendo tipo + turma + objetivo pedagógico).
- **`extractSubtitleFromMarkdown(rawText)`**: Extrai o `**Subtítulo:**` gerado pela IA. Aceita variações: `Subtítulo`, `Subtitulo`, `Subtitle` (case-insensitive). Limita a 160 chars.
- **`buildSmartSubtitle(routerResult, userRequest, contexto)`**: Fallback inteligente quando a IA não gera subtítulo. Combina `template.nome` + turma + disciplina + tema extraído do `userRequest` (removendo verbos de comando). Formato: "[Tipo] para [turma] de [disciplina] — [tema]".
- **Título universal**: Extração de título da IA agora aplica-se a TODOS os tipos de artefato (antes era só `atividade_textual` e `documento_livre`). Ordem de fallback: IA → template.nome → userRequest truncado → config.nome.
- **`parseMarkdownSections`**: Strips a linha `**Subtítulo:**` além do `#` header antes de parsear seções, evitando que apareça no conteúdo das seções.

## Artifact Export Dropdown v1.1 (Março 2026)
Dropdown de exportação no header do `ArtifactViewModal` (botão Download). Corrigido em v1.1 após bugs críticos na v1.0.

### Arquivos
- `services/artifact-export-service.ts` — serviço central de exportação (única fonte de verdade)
- `components/ExportDropdown.tsx` — dropdown com 3 opções + estados loading/success/error
- `components/export-icons.tsx` — ícones SVG (Markdown, PDF, Docx)

### Funções no serviço
- `parseInlineHtml(text)` — converte `<b>`, `<i>`, `<strong>`, `<em>` em `TextRun[]` para DOCX
- `buildMarkdownContent(...)` — converte blocos EditorJS em Markdown puro (todos os tipos de bloco)
- `buildBodyHtml(...)` — gera HTML com **estilos inline** para o PDF (não usa `<head>/<style>`)
- `exportAsMarkdown(...)` — gera e baixa arquivo `.md`
- `exportAsPDF(...)` — usa `html2pdf.js` com container de estilos inline (corrige bug de estilos perdidos)
- `exportAsDocx(...)` — usa biblioteca `docx` com rich text e tabelas formatadas

### Bugs corrigidos em v1.1
1. **Markdown**: `buildMarkdownContent` havia sido deletada acidentalmente → restaurada completa
2. **PDF**: `container.innerHTML = fullHTMLDoc` descartava os `<style>` do `<head>` → migrado para estilos inline em cada elemento HTML
3. **DOCX**: `stripHtml` removia bold/italic → implementado `parseInlineHtml` que preserva formatação; bordas de tabela reforçadas (`size: 6`), cor de header `C5D8FF`, células com margens internas

## Production Deployment Fix (Março 2026)
Correções para deploy em Railway, Render, Vercel e Replit.

### Problemas corrigidos
- **PORT hardcoded**: `api/server.js` agora usa `process.env.PORT || (isProduction ? 5000 : 3001)` — Railway/Render/Vercel fornecem PORT via env var
- **isProduction detection**: Agora detecta `RAILWAY_ENVIRONMENT`, `RENDER`, `VERCEL` além de `REPLIT_DEPLOYMENT` e `NODE_ENV=production`
- **Procfile criado**: `web: node api/server.js` na raiz para Railway
- **railway.toml criado**: Build e start commands explícitos para Railway (override de auto-detecção Python)
- **package.json "start"**: Aponta para `node api/server.js` diretamente (Railway/Render executam `npm start`)
- **migrateFromLocalStorage**: Adicionado export nomeado em `activitiesApiService.ts` para eliminar warning do Vite build
- **Replit deployment config**: Corrigido para `autoscale` com build `npm run build` e run `node api/server.js`
- **isDeployment duplicado**: Removidas detecções de ambiente duplicadas em server.js, usando a variável global `isProduction`
- **ENV VARS FIX**: `PORT=3001` e `NODE_ENV=development` estavam em `[userenv.shared]` — isso vazava para o deploy, fazendo o servidor escutar na porta 3001 (Replit espera 5000). Movido para `[userenv.development]` apenas.
- **pyproject.toml no .gitignore**: Railway detectava Python ao invés de Node.js por causa desse arquivo
- **REACT PRODUCTION MODE FIX (causa raiz da página em branco)**: `define: { 'process.env': {} }` no vite.config.ts substituía `process.env.NODE_ENV` por `undefined`, causando React a empacotar `react-dom.development.js` (340KB) ao invés de `react-dom.production.min.js` (177KB). Fix: adicionado `'process.env.NODE_ENV': JSON.stringify(mode)` que tem precedência sobre `'process.env': '{}'`
- **Server startup order**: `app.listen()` agora é chamado ANTES de `initializeDatabase()` para que o healthcheck responda imediatamente. SPA fallback middleware movido para fora de `startServer()`

### Arquitetura de deploy
- **Dev**: Vite (porta 5000) + Express API (porta 3001), proxy via vite.config.ts
- **Prod (Replit)**: Express serve static `dist/` + API na porta 5000 (REPLIT_DEPLOYMENT=1)
- **Prod (Railway)**: Express serve static `dist/` + API na porta atribuída pelo Railway (process.env.PORT)
- **Prod (Render/Vercel)**: Mesma lógica, porta do ambiente
- **Frontend API calls**: Todas usam caminhos relativos (`/api/...`) — funciona em qualquer ambiente
- **IMPORTANTE**: Variáveis PORT e NODE_ENV ficam SOMENTE em [userenv.development], NUNCA em [userenv.shared]

## Replit Migration (Março 2026)
Migração concluída do ambiente Replit Agent para Replit.

### O que foi feito
- **Pacotes instalados**: `npm install` executado com sucesso (904 pacotes)
- **Supabase substituído**: O cliente Supabase foi completamente substituído por um stub (`src/integrations/supabase/client.ts`) que roteia auth via localStorage e chamadas DB para o backend Express/Neon. Nenhum dado passa mais pelo Supabase.
- **Backend Neon ativo**: `api/server.js` usa `api/neon-db.js` para conectar ao banco Neon PostgreSQL via `DATABASE_URL`.
- **Variáveis de ambiente**: `DATABASE_URL`, `GROQ_API_KEY`, e várias `VITE_*` API keys já estão configuradas como secrets no Replit.
- **Ambos os workflows rodando**: "App" (Vite dev server na porta 5000) e "Backend" (Express API na porta 3001).

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. All UI elements adhere to a unified design system.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching. The core AI agent, "Mente Orquestradora Architecture v7.0," features autonomous capability selection, a supreme unified context engine (`Context Engine v2.0`), `SessionStore` v2.0 with `InteractionLedger`, `ContextAssembler`, `ConversationCompactor`, `GoalReciter`, and `SmartRouter v1.2`. This includes system message separation for LLMs and a `SmartRouter` for intelligent request routing. Route-specific system prompts are used for various AI tasks.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage.
- **Core Features**:
    - **School Power Tab System v2.0** (Mar 2026): SVG-based tab border system where the card border itself forms the tab shapes — one continuous SVG `<path>` traces the entire card outline (sides + bottom with rounded corners + top with tab "plateaus" that emerge upward). Architecture: `SchoolPowerShell.tsx` — the component is a "shell" wrapping the card content; it uses a `ResizeObserver` to measure its container, then `computeTabSlots()` calculates each tab's `{startX, endX}` based on title text width, and `buildBorderPath(W, H, slots)` generates the SVG `d` attribute with 7 segment types per tab: ①concave quarter-arc valley→left wall, ②straight left wall up, ③rounded TL corner arc, ④flat top, ⑤rounded TR corner arc, ⑥straight right wall down, ⑦concave quarter-arc right wall→valley. All arcs use `sweep=1` (clockwise in screen coords). The SVG path is a floating `<path fill="none" stroke="rgba(255,255,255,0.13)">` layer. Tab labels are absolutely positioned `<button>` elements aligned with the computed tab slots. The card content is in a `position:absolute; top:TAB_H=42px` div that fills the card area. State management: `useTabsStore.ts` (Zustand + `localStorage` `school-power-tabs`, max 6 tabs), `useSchoolPowerTabs.ts` (integration hook: saves/restores `useChatState` + `useSchoolPowerFlow` + `useChosenActivitiesStore` on tab switch). `SchoolPowerPage.tsx` uses `SchoolPowerShell` for desktop (SVG border), falls back to plain rounded div for mobile/quiz mode.
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture, supporting activity creation, explanations, text generation, lesson plans, and research. Includes BNCC curriculum alignment via `pesquisar_bncc` capability and quality reference questions via `pesquisar_banco_questoes` capability. Both are visible RAG capabilities that appear in the development card during activity generation for transparency. **BNCC RAG v2.0**: Complete coverage of all 9 Ensino Fundamental subjects (Matemática, Língua Portuguesa, Ciências, História, Geografia, Arte, Educação Física, Ensino Religioso, Língua Inglesa) with ~1,312 unique habilidades. Data organized in modular files under `bncc-data/` with an index aggregator. All search limits removed (no maxResults, no maxHabilidades caps). Includes backtracking fallback when text filters return 0 results and comprehensive component alias resolution. **BNCC Pipeline Guarantee v1.0** (Feb 2026): `ensureBnccExecution()` auto-executes pesquisar_bncc when the AI planner omits it, guaranteeing 100% BNCC coverage for all EXECUTAR activities. V2 context enrichment injects `bncc_context` into `gerar_conteudo_atividades`, `decidir_atividades_criar`, and `criar_arquivo` capabilities. Artifact Generator now receives and uses BNCC habilidades in document prompts for full textual document coverage. **pesquisar_web (Web Search Educacional) v1.0** (Feb 2026): Intelligent web search capability for Brazilian educators. Two-layer injection system: Planner auto-injects into PESQUISAR stages (mutable flag `pesquisarWebInjetadaAoPlan`), Executor hard-enforces at runtime before any stage with PESQUISAR capabilities. Backend route `POST /api/search/web` uses DuckDuckGo HTML scraping + educational domain re-ranking (alta/media/baixa tiers) with curated fallback URLs for trusted Brazilian educational sources (novaescola.org.br, mec.gov.br, basenacionalcomum.mec.gov.br, portaldoprofessor.mec.gov.br, scielo.br). Emits 5-step narrative progress visible in the development card. Injects `web_search_context` into downstream capabilities (`criar_arquivo`, `criar_plano_aula`, `gerar_conteudo_atividades`). Registered in V2_REGISTRY and PESQUISAR registry. 10 aliases normalized by capability-validator (buscar_web, pesquisa_web, etc.).
    - **Research Enrichment Layer (REL) v1.1** (Feb 2026): Autonomous research system that allows Agente Jota to evaluate whether external web data is needed WITHIN the CONVERSAR and CAPABILITY_DIRETA routes — without touching the EXECUTAR route. Architecture: 3-file module in `research-enrichment-layer/` — `need-detection.ts` (2-layer detector: FastRules regex/heuristics + LLM fallback via cascade), `research-enrichment.ts` (engine that calls `pesquisarWebV2()` directly — zero code duplication), `response-with-sources.ts` (formatter for injecting research context into LLM prompts). **v1.1 fixes (Feb 2026):** (1) Need-detection sensitivity: BLOCK_PATTERNS split into GREETING_BLOCKS (always block) and CREATION_PATTERN (block ONLY when no temporal/factual signal detected). New `hasTemporalOrFactualSignal()` function detects years (2020-2039), Brazilian exams (ENEM/vestibular/SAEB), "tema da redação", reform signals, MEC/INEP regulatory references, and temporal words (atual/recente/último). Creation requests WITH temporal signals (e.g., "Crie arquivo sobre tema do ENEM 2025") now pass through to triggers instead of being blocked. New EXPLICIT_TRIGGERS: "tema da redação" (0.92), "resultado/desempenho do ENEM/SAEB" (0.90). EDUCATION_EXAM_PATTERN + TEMPORAL_WORDS combo trigger (0.85). LLM_NEED_DETECTION_PROMPT updated with explicit exception for temporal creation requests and 5 clear examples. (2) Unified DebugStore pipeline: REL now uses the SAME DebugStore infrastructure as EXECUTAR — `startCapability()`, `createDebugEntry()` for each pesquisarWebV2 `debug_log` entry, `endCapability()`. Uses identical `mapDebugLogType()` mapping. DevModeCard uses `capabilityId` to reference DebugStore entries, so DebugIcon renders the same 5+ narrative entries (ETAPA 1-5) that EXECUTAR shows. Any changes to pesquisar-web.ts automatically reflect in ALL routes. (3) CAPABILITY_DIRETA REL integration: orchestrator runs `executeResearchEnrichment()` BEFORE `executeDirectCapability()`, injects `formattedContext` as `research_context` param. ChatLayout renders REL DevModeCard before capability DevModeCard when both present. (4) Enriched search context: user_id, professor_id, session_id passed to pesquisarWebV2; max_resultados increased to 10; search_depth='advanced' for high-confidence triggers (>=0.85).
    - **Document Intelligence Pipeline (DIP) v2.0** (Feb 2026): Hybrid Capability + Context Memory Layer for file/image understanding. Inspired by ChatGPT/Claude/Perplexity architectures. Teachers can attach PDFs, images, DOCX, TXT, CSV files via paperclip button in chat. **Backend**: `api/file-processor.js` — multer multipart upload (25MB limit), routes by MIME type: images → Gemini 2.5 Flash Vision (`inline_data` base64), PDFs → `pdf-parse` text extraction + Gemini Vision for scanned docs, DOCX → `mammoth` text+HTML extraction, TXT/CSV → direct read. Returns structured JSON: `file_id`, `original_name`, `transcription` (summary, full_content, metadata, visual_elements, pedagogical_context). Registered at `POST /api/files/process`. **Capability**: `LER_ARQUIVOS` V2 (`ler-arquivos-v2.ts`) — 5-step debug narrative (Recebendo → Identificando → Extraindo → Transcrevendo → Confirmação), calls backend per file, generates `prompt_context` for injection. Registered in `V2_REGISTRY` and `capabilities/index.ts`. **Orchestrator Integration**: `processFileAttachments()` runs LER_ARQUIVOS automatically before routing; `sessionFileContexts: Map<string, string>` persists transcriptions per session (cleaned up on session expiry/clear); `getSessionFileContext()` injects "📎 DOCUMENTOS DO PROFESSOR" into `handleDirectResponseWithREL()` prompt; now returns typed `AIDebugEntry[]` debug entries alongside `FileProcessingMeta`. EXECUTAR route is NOT modified. **Frontend Phase 2**: `MessageAttachment` interface added to `message-types.ts` (name, type, size, preview). `addTextMessage()` accepts optional `attachments` parameter. `MessageAttachmentDisplay.tsx` — renders file cards below user message: image thumbnails with names, PDF/doc badges with file size, collapsible "+X anexos" for multiple files. `UserMessage.tsx` — now receives and renders `attachments` prop. `FileProcessingCard.tsx` — replaces "Pensando..." indicator in `MessageStream` when files are being processed (processing → complete → transition to thinking); integrated `DebugIcon` in top-right corner opens `DebugModal` with 5-step capability narrative. `fileProcessingStatus` and `fileDebugEntries` moved to Zustand chatState (not local component state) for cross-component access. `ChatLayout.tsx` — builds `MessageAttachment[]` from `FileAttachment[]` before adding user message, captures `fileDebugEntries` from orchestrator response. **Packages**: `pdf-parse`, `mammoth` (Node.js).
    - **Anti-Hallucination Cross-Verification v1.0** (Feb 2026): Multi-source fact-checking layer in `pesquisar-web.ts` inspired by Perplexity/Genspark architectures. Functions: `isDomainTrusted()` checks against `TRUSTED_DOMAINS` set (gov.br, edu.br, mec.gov.br, inep.gov.br, scielo.br, etc.), `extractKeyClaimsFromResult()` extracts factual claims via regex patterns, `crossVerifyResults()` builds consensus scoring across all sources — claims appearing in 2+ sources get high confidence, single-source claims are flagged. `boostTrustedSources()` elevates official domain scores. `response-with-sources.ts` prompt updated with strict anti-hallucination rules: cite ONLY corroborated data, prefer "não encontrei confirmação" over guessing. System prompt in `system-prompt.ts` reinforced with anti-hallucination directives.
    - **CONVERSAR Instant Streaming v1.0** (Feb 2026): Two-phase response pattern for CONVERSAR+REL flow, matching EXECUTAR UX. Orchestrator's `processUserPrompt()` detects research need upfront via `detectResearchNeed()` and returns `{initialMessage, pendingEnrichment: Promise<PendingEnrichmentResult>}` immediately. ChatLayout shows initial message + "Pesquisando..." dev card instantly (Phase 1), then awaits `pendingEnrichment` to update with enriched response and research metadata (Phase 2). Race condition guard: `pendingEnrichmentRef` tracks active enrichment; new user prompts await any pending enrichment before processing. Cleanup on both success and error paths.
    - **DebugModal Portal Fix v1.0** (Feb 2026): `DebugModal.tsx` refactored to use `createPortal(children, document.body)` to escape all parent container clipping/overflow constraints. z-index elevated to z-[9999]. Modal renders above all platform components regardless of parent container styling.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern.
    - **Structured Response System**: Collects created items using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting activities.
    - **ContentSyncService**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts with intelligent routing.
    - **Artifact Export Dropdown v1.0** (Mar 2026): Full-featured export system integrated into the ArtifactViewModal header's Download button. Clicking the download icon opens an animated dropdown with 6 export options split into two groups: (1) **Download** — Markdown (.md via Blob+saveAs), PDF (html2pdf.js, A4 portrait, scale 2), Docx (docx library with full block type support); (2) **Save to Cloud** — Google Drive (GIS OAuth popup, uploads Markdown via Drive REST API v3, requires `VITE_GOOGLE_DRIVE_CLIENT_ID`), OneDrive Personal and Work/School (MSAL.js browser OAuth popup + Microsoft Graph API `PUT /me/drive/root:/{filename}:/content`, requires `VITE_MICROSOFT_CLIENT_ID`). Architecture: `artifact-export-service.ts` (unified export functions), `google-drive-service.ts` (GIS dynamic script loading), `onedrive-service.ts` (MSAL PublicClientApplication per account type), `export-icons.tsx` (SVG icon components for each option), `ExportDropdown.tsx` (animated dropdown with per-item loading/success/error states, click-outside close, Escape key close, fixed positioning via anchorRef). Cloud options gracefully degrade when env vars are not configured — showing a "Not configured" sub-label instead of failing silently.
    - **Ponto. Flow v2.0**: AI-driven Automatic Package Delivery System that uses Gemini structured output (JSON) for intelligent document selection via MAD methodology (Metodologia de Antecipação de Dor). The AI analyzes teacher context, created activities, and pedagogical needs to strategically choose 2-4 complementary documents. Includes deterministic regex fallback for resilience. Activity classification enforces that activities NEVER appear in the Documentos Complementares section (reserved for artifacts only). Callout post-processing strips emoji callouts from the complementos section.
    - **Powers System v4.1**: Virtual currency for AI capabilities with per-action pricing.
    - **Calendário School Multi-View System**: Portal-rendered calendar panel with 4 view modes, using a Strategy Pattern for event display.
    - **AI Calendar Management (gerenciar_calendario) v1.1**: Comprehensive AI-powered calendar management system with a mini-agent architecture for autonomous decision-making loops for viewing, analyzing availability, editing, deleting, and creating events.
    - **`decidir_atividades_criar` v3.3**: Production-hardened decision capability with a 7-layer architecture. **Key design rules (Feb 2026 audit)**: (1) Format example in prompt uses ONLY abstract structural placeholders (`<ID_EXATO_DO_CATALOGO>`) — never real activity IDs, because ANY real ID in the example biases LLMs to copy it literally. (2) Gemini FC uses the full catalog (all 67+ items, not sliced to 30), with explicit multi-activity quantity requirement. (3) Gemini FC schema enforces `minItems: 2` on `atividades_escolhidas` so the model cannot structurally return only 1 activity. (4) REGRA DE QUANTIDADE handles complex pedagogical requests: "6 aulas disponíveis" or "semana letiva" maps to 4-8 activities, not 1. (5) DECISION_SYSTEM_PROMPT requires VARIEDADE OBRIGATÓRIA and EQUILÍBRIO INTERATIVO-TEXTUAL — forbids single-type packages. (6) pesquisar_web removed from executor auto-injection: it is never forcibly added, only runs when explicitly in the plan. TypeScript errors in executor.ts (`completeCapability` → `endCapability`) and buildActivityHelper.ts (property name mismatches) are fixed. Gemini model references updated to gemini-2.5-flash (was gemini-2.0-flash, which returned 404s).
    - **`gerar_conteudo_atividades` Activity Generation Agent v2.0** (Feb 2026): Transformed into a multi-agent pipeline. Each activity runs in an isolated `executeActivityAgent()` with its own retry loop (3x exponential backoff) and fault isolation (one activity's failure doesn't cascade). Model routing by type: interactive activities (quiz, flash, lista) → JSON-optimized models (gemini-2.5-flash, llama-4-scout); textual activities (planos, sequências) → prose-optimized models (llama-3.3-70b, gemini-2.5-flash). **LLM-as-Judge verification**: after each activity generation, an independent cross-model verification call scores the output 0–10 across alignment, pedagogical adequacy, completeness, quality, and uniqueness. Score <7 triggers one automatic regeneration with issue context. **Package Coherence Check**: final synthesis LLM call after all activities verifies logical sequence, no duplications, and objective coverage, returning coherence_score 0–10. Emits 5 CustomEvents: `activity:verification:started`, `activity:verification:passed`, `activity:verification:failed`, `activity:verification:completed`, `package:coherence:completed`.
    - **LLM Orchestrator v4.0.1 Enterprise** (Feb 2026): Expanded from 2 providers (Groq + Gemini) to 9 providers with 16 models in a 5-tier intelligent cascade. Architecture: single generic `openai-compatible.ts` provider handles OpenRouter, XRoute, Together AI, and DeepInfra; separate `edenai.ts` and `huggingface.ts` for custom API formats. **CASCATA ATIVA (validada em 2026-02-24 via teste direto de API)**: 8 de 16 modelos ativos — Groq p1 llama-3.1-8b-instant ✅ → Groq p2 llama-3.3-70b-versatile ✅ → Groq p4 llama-4-scout-17b ✅ → Gemini p5 gemini-2.5-flash ✅ (requer maxOutputTokens≥2048, modelo "thinking") → Gemini p6 gemini-2.5-flash-lite ✅ → OpenRouter p7 gemma-3-4b-it:free ✅ → OpenRouter p8 gemma-3-12b-it:free ✅ (NOVO, substitui deepseek-r1:free) → Local fallback p9 ✅. **INATIVOS com justificativa**: Groq llama-3.3-70b-specdec (DESCOMISSIONADO pela Groq em fev/2026), OpenRouter deepseek-r1:free (removido do free tier), Together AI (chave inválida), DeepInfra (sem saldo), XRoute (chave inválida — deve começar com xai-), EdenAI (sem créditos), HuggingFace (endpoint migrado, requer investigação). **Backend Proxy**: `/api/ai/status` retorna status de todos os providers; `/api/ai/chat` roteia para Groq/OpenRouter; `/api/ai/gemini` aplica maxOutputTokens mínimo de 2048 automaticamente. Jota (epictusIAService) usa Groq llama-3.3-70b-versatile via proxy, funcionando. Circuit Breaker: failureThreshold=5, recoveryTimeMs=20000. All API keys in Replit Secrets (formato VITE_* com fallback).
    - **ConstructionInterface Verification UI** (Feb 2026): ActivityCard now accepts `verificationStatus` (`pending`|`verified`|`regenerating`|`flagged`) and `verificationScore` props. VerificationBadge component renders context-colored badges (emerald checkmark for verified, spinning orange for regenerating, yellow warning for flagged). Main component listens to `activity:verification:*` events and maintains `verificationStatusMap` and `verificationScoreMap` state. Badges appear progressively as each activity is verified — fully non-blocking (generation continues independently). DeveloperModeCard shows a "Coerência do Pacote" panel at the bottom when `package:coherence:completed` fires, displaying score/10, sequence status, issue list, and verified/flagged activity counts.
    - **pesquisar_web Fully Wired** (Feb 2026): `pesquisar_web` is now visible and executed in every activity creation pipeline. **Root cause diagnosed**: planner has two paths — (1) LLM-generated plan with injection at lines 148–175, and (2) `createFallbackPlan()` at line 662 which is used when LLM plan fails. Confirmed via `cap-cal-fb-` ID prefix in console logs — the fallback was always being used. Fix: added `pesquisar_web` as `cap-0-4-${timestamp}` at ordem 5 in etapa 1 of `createFallbackPlan` (planner.ts lines 776–784) with `parametros: { busca_texto: userPrompt, solicitacao: userPrompt }` so the web search has user context. Web search context is auto-propagated to `gerar_conteudo_atividades`, `decidir_atividades_criar`, and `criar_arquivo` via `extractWebSearchContextFromMap()` (executor.ts line 842). Backend route: `POST /api/search/web` via DuckDuckGo scraping + educational domain re-ranking. **CapabilityIcons.ts**: Globe icon (text-green-400) for `pesquisar_web`; BookOpen (amber) for `pesquisar_bncc`; FileSearch (violet) for `pesquisar_banco_questoes`; Database (sky) for `pesquisar_atividades_conta`. **IMPORTANT**: The planner injection code at lines 148–175 handles LLM-generated plans; `createFallbackPlan` handles the fallback and must be updated separately when adding new capabilities.
    - **SmartRouter v1.3**: Added explicit detection of decision prompts (patterns: `IDs VÁLIDOS:`, `CATÁLOGO COMPLETO`, `atividades_escolhidas`, `REGRA DE QUANTIDADE`, `DECIDIR quais atividades`) to guarantee they always classify as `complex` complexity and route to balanced/powerful tier models instead of ultra-fast Tier 1 models.
    - **Final Response Service v2.0**: Hybrid deterministic and AI-driven final response generation for the EXECUTAR path, classifying activities into pedagogical phases, building structured responses, and using AI for strategic paragraphs with robust fallback mechanisms.

### Security Architecture (Feb 2026 - Completed Migration)
**API Key Security**: All AI provider keys (Groq, Gemini, OpenRouter, XAI, HuggingFace, EdenAI, Together AI, DeepInfra) are now exclusively stored in Replit Secrets server-side. No VITE_* environment variable key exposure to browser bundle. Architecture:
- **Backend AI Proxy** (`api/ai-proxy.js`): Routes `/api/ai/chat`, `/api/ai/gemini`, `/api/ai/huggingface`, `/api/ai/edenai`. All providers use `resolveKey()` to look up from Replit Secrets.
- **Frontend providers**: All 5 LLM providers (groq.ts, gemini.ts, openai-compatible.ts, huggingface.ts, edenai.ts) call backend proxy endpoints — zero VITE_* reads.
- **Auth**: Supabase stub client (`src/integrations/supabase/client.ts`) provides API compatibility using localStorage + backend `/api/perfis/login`.
- **Config**: `config.ts` API key getters return empty strings (keys managed by backend). `isGroqApiKeyConfigured()` returns `true` (backend has keys).

### System Design Choices
The architecture features a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data. The Supabase dependency is fully replaced by the backend proxy for auth and API calls. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini API**: AI service for content generation and assistance.
- **Groq API**: AI service for fast lesson content generation.
- **Together AI**: LLM inference for Llama 3.3 70B Turbo and Qwen 2.5 72B.
- **OpenRouter**: LLM aggregator for Llama 4 Maverick and DeepSeek R1 (free tier).
- **DeepInfra**: Low-cost LLM inference for Llama 3.3 70B and DeepSeek V3.
- **XRoute**: Premium LLM router for Claude 3.5 Haiku access.
- **EdenAI**: Multi-provider AI aggregator for GPT-4o-mini access.
- **HuggingFace Inference API**: Open-source model hosting for Mistral 7B (last resort).
- **Neon PostgreSQL (Replit)**: Primary data store.
- **SendGrid**: Email notification service.

### Search API Orchestrator v3.0 (pesquisar_web)

**Arquitetura:** `api/search-web.js` (orquestrador, 360+ linhas) + `api/search-providers/` (13 arquivos) + capability TypeScript `pesquisar-web.ts` (sub-agente autônomo com gap analysis iterativo)

#### Providers de busca ativos (9 fontes simultâneas)
| Provider | Arquivo | Chave | Modo de ativação |
|---|---|---|---|
| Serper Web + Scholar + News | `serper.js` | `SERPER_API_KEY` ✅ | sempre (se chave) |
| OpenAlex 250M+ artigos | `openalex.js` | `OPEN_ALEX_API_KEY` ✅ | full/academic |
| DOAJ periódicos abertos | `doaj.js` | pública | full/academic |
| CORE 200M+ artigos c/ PDF | `core.js` | `CORE_API_KEY` ✅ | full/academic (se chave) |
| Semantic Scholar 46M papers | `semantic-scholar.js` | pública | full/academic |
| EuropePMC 40M+ artigos | `europepmc.js` | pública | full/academic |
| PubMed NCBI | `pubmed.js` | pública | full (se não quick) |
| OpenLibrary livros PT | `openlibrary.js` | pública | advanced only |
| ArXiv preprints STEM | `arxiv.js` | pública | advanced only |

#### Infraestrutura Backend
- **Circuit Breakers** (`circuit-breaker.js`): Monitora falhas por provider. ≥ 3 falhas em 5 min → OPEN (skip automático). Recovery após 10 min via HALF_OPEN.
- **LLM Query Planning** (`query-planner.js`): Groq `llama-3.1-8b-instant` gera 3 queries educacionais otimizadas. **ATIVO em produção** — frontend envia apenas `query` (não mais extra queries que burlavam o planner).
- **Jina Reader Content Extraction** (`content-extractor.js`): Para top 3 URLs com score ≥ 0.40 em modo `advanced`, faz `GET r.jina.ai/{url}` extraindo até 2500 chars de Markdown real. Gratuito, sem API key. Paralelo com `Promise.allSettled()`, timeout 8s por URL. Response inclui `content_full`, `content_extracted: true`, `content_extracted_count`, `content_extracted_urls`.
- **Query Variants por Provider**: `allInputQueries[0]` → Serper; `intlQuery` (PT→EN, max 5 palavras, só ASCII) → OpenAlex/CORE/Semantic Scholar; `shortIntlQuery` (max 3 palavras) → PubMed; `europePMCQuery` (max 4 palavras, exclui "grade") → EuropePMC; `buildDOAJQuery()` (max 3 keywords PT) → DOAJ.
- **PT→EN Translation Map** (`PT_EN_MAP`): 40+ mapeamentos. Filtro `ASCII_ONLY` remove residuais de acentuação não mapeados.
- **Re-ranking educacional** (`scorer.js`): 39 domínios BR. Pesos: domínio (0.35) + semântica (0.30) + eduBoost (0.20) + keywords pedagógicas (0.15).
- **Deduplicação** (`scorer.js`): Remove duplicatas por URL normalizada + título (60 chars).
- **Fallback estático** (`fallback.js`): 4 links BNCC/Nova Escola/MEC/EducaCAPES como último recurso.

#### Sub-agente Autônomo Frontend (`pesquisar-web.ts`)
A capability agora implementa o padrão de agentes como Manus AI e Genspark:
- **Gap Analysis Iterativo**: Após round 1, calcula `coverage_score` (has_curricular + has_pedagogical + has_academic + has_official) / 4. Se < 0.5 OU < 5 resultados → dispara Rodada 2 com gap query direcionada.
- **Debug transparente (padrão Manus)**: 7 tipos de entrada no debug (ETAPA 1-5 + DECISÃO LLM + RODADA 2 + WARNING):
  - ETAPA 1: Análise de intenção pedagógica
  - ETAPA 2: Consultas preliminares (2 queries estáticas — NOT passed to backend)
  - ETAPA 3: Disparo dos 9 providers em paralelo
  - DECISION: "🧠 PLANO DE BUSCA INTELIGENTE GERADO" com as 3 queries do Groq
  - ETAPA 4: Lista top 5 resultados reais com título/fonte/score/breakdown por provider
  - ACTION: "📄 Conteúdo completo extraído de X fontes via Jina Reader"
  - WARNING: "⚠ LACUNA IDENTIFICADA: [gaps]" (quando coverage < 0.5)
  - ACTION RODADA 2: "🔎 RODADA 2: Refinando pesquisa..."
  - DISCOVERY RODADA 2: Resultados adicionais + merged total
  - CONFIRMATION: Total final com rodadas + conteúdos extraídos + tempo
- **prompt_context enriquecido**: Para resultados com `content_full`, usa primeiros 800 chars em vez de snippet de 400. Adiciona seção "📄 CONTEÚDO COMPLETO EXTRAÍDO" e seção "📚 FONTES CONSULTADAS" com instrução obrigatória de citar.
- **search_depth='advanced' por padrão**: Planner LLM-path inject e fallback-path inject agora passam `search_depth: 'advanced', search_mode: 'full'` nos parametros.

#### Resultados típicos (modo full + advanced, validado em produção)
- **Providers ativos**: 6 consistentemente (serper_web, serper_scholar, openalex, doaj, core, pubmed) + 2 intermitentes (semantic_scholar rate-limited, europepmc rate-limited)
- **Raw results**: 50-55 brutos antes de deduplicação
- **Final**: 8-12 melhores após scoring educacional
- **Jina Reader**: 3 fontes com conteúdo completo extraído (novaescola.org.br, scielo.br, UFAM, etc.)
- **Latência**: ~3-5s sem Jina (basic), ~8-12s com Jina (advanced), ~15-20s com rodada 2 (gap analysis)

#### APIs analisadas e descartadas como search providers
- **OpenCitations**: API de grafo de citações — recebe DOI como input, não texto. Chave existe mas sem endpoint de text search.
- **ORCID**: Perfis de autores, não conteúdo pedagógico.
- **Unpaywall**: Resolve DOI → PDF, não é busca por query.
- **INEP Dados Abertos**: Estatísticas escolares (IDEB, censo) — não é busca de conteúdo.
- **MEC CMDE API**: Gestão escolar (matrículas, turmas) — não é busca de conteúdo.
- **Kaggle**: Datasets científicos com OAuth — sem relevância para planos de aula.

#### Limites de uso
- Serper: 2500 req/mês grátis. Semantic Scholar: rate-limitado sem chave premium (graceful 429). Resto: público e ilimitado.

#### Integração com geração de conteúdo
- `pesquisar-web.ts`: `extractCleanThemeFromPrompt()` extrai tema limpo do prompt bruto do professor
- `gerar-conteudo-atividades.ts`: `buildContentGenerationPrompt()` recebe `webSearchContext` e adiciona bloco "FONTES EDUCACIONAIS REAIS" no prompt do LLM quando `has_real_results: true`