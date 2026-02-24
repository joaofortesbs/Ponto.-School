# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform providing personalized learning experiences and streamlining educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. All UI elements adhere to a unified design system.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching. The core AI agent, "Mente Orquestradora Architecture v7.0," features autonomous capability selection, a supreme unified context engine (`Context Engine v2.0`), `SessionStore` v2.0 with `InteractionLedger`, `ContextAssembler`, `ConversationCompactor`, `GoalReciter`, and `SmartRouter v1.2`. This includes system message separation for LLMs and a `SmartRouter` for intelligent request routing. Route-specific system prompts are used for various AI tasks.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture, supporting activity creation, explanations, text generation, lesson plans, and research. Includes BNCC curriculum alignment via `pesquisar_bncc` capability and quality reference questions via `pesquisar_banco_questoes` capability. Both are visible RAG capabilities that appear in the development card during activity generation for transparency. **BNCC RAG v2.0**: Complete coverage of all 9 Ensino Fundamental subjects (Matemática, Língua Portuguesa, Ciências, História, Geografia, Arte, Educação Física, Ensino Religioso, Língua Inglesa) with ~1,312 unique habilidades. Data organized in modular files under `bncc-data/` with an index aggregator. All search limits removed (no maxResults, no maxHabilidades caps). Includes backtracking fallback when text filters return 0 results and comprehensive component alias resolution. **BNCC Pipeline Guarantee v1.0** (Feb 2026): `ensureBnccExecution()` auto-executes pesquisar_bncc when the AI planner omits it, guaranteeing 100% BNCC coverage for all EXECUTAR activities. V2 context enrichment injects `bncc_context` into `gerar_conteudo_atividades`, `decidir_atividades_criar`, and `criar_arquivo` capabilities. Artifact Generator now receives and uses BNCC habilidades in document prompts for full textual document coverage. **pesquisar_web (Web Search Educacional) v1.0** (Feb 2026): Intelligent web search capability for Brazilian educators. Two-layer injection system: Planner auto-injects into PESQUISAR stages (mutable flag `pesquisarWebInjetadaAoPlan`), Executor hard-enforces at runtime before any stage with PESQUISAR capabilities. Backend route `POST /api/search/web` uses DuckDuckGo HTML scraping + educational domain re-ranking (alta/media/baixa tiers) with curated fallback URLs for trusted Brazilian educational sources (novaescola.org.br, mec.gov.br, basenacionalcomum.mec.gov.br, portaldoprofessor.mec.gov.br, scielo.br). Emits 5-step narrative progress visible in the development card. Injects `web_search_context` into downstream capabilities (`criar_arquivo`, `criar_plano_aula`, `gerar_conteudo_atividades`). Registered in V2_REGISTRY and PESQUISAR registry. 10 aliases normalized by capability-validator (buscar_web, pesquisa_web, etc.).
    - **Research Enrichment Layer (REL) v1.0** (Feb 2026): Autonomous research system that allows Agente Jota to evaluate whether external web data is needed WITHIN the CONVERSAR and CAPABILITY_DIRETA routes — without touching the EXECUTAR route. Architecture: 3-file module in `research-enrichment-layer/` — `need-detection.ts` (2-layer detector: FastRules regex/heuristics + LLM fallback via cascade), `research-enrichment.ts` (engine that calls `pesquisarWebV2()` directly — zero code duplication), `response-with-sources.ts` (formatter for injecting research context into LLM prompts). The REL evaluates every CONVERSAR message: explicit triggers (pesquise, busque, temporal signals like "em 2025") activate with ≥0.90 confidence; implicit triggers (legislation, statistics, methodology questions) delegate to LLM for confirmation. When activated: generates initial message ("Vou pesquisar..."), executes pesquisar_web (same 9 providers, same scorer, same gap analysis), injects formatted sources into SYSTEM_PROMPT_CONVERSAR context, LLM generates response with real citations. UI shows: initial message → DevModeCard mini (pesquisar_web status) → enriched final response. CAPABILITY_DIRETA also enhanced with initial messages before execution. Research facts persisted to SessionStore via `addLedgerFact()` with category 'research' for cross-conversation memory. System prompt updated: removed false "cannot access internet" claim, added source usage instructions.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern.
    - **Structured Response System**: Collects created items using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting activities.
    - **ContentSyncService**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts with intelligent routing.
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