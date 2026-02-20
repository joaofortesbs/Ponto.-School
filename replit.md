# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The platform aims to become a global leader in intelligent learning solutions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. All UI elements adhere to a unified design system, ensuring consistent typography and spacing.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching. The core AI agent, "Mente Orquestradora Architecture v7.0," features autonomous capability selection, a supreme unified context engine, `Context Engine v2.0`, `SessionStore` v2.0 with `InteractionLedger`, `ContextAssembler`, `ConversationCompactor`, `GoalReciter`, and **SmartRouter v1.1**.
    - **System Message Separation (Feb 2026)**: All LLM providers now support proper system/user message separation. Groq uses `role: 'system'` messages, Gemini uses `systemInstruction` field. The `generateContent()` and `executeWithCascadeFallback()` accept optional `systemPrompt` parameter. When provided, system instructions are sent as dedicated system messages instead of being mixed into user content. This aligns with industry standards (OpenAI, Claude, Manus, Genspark).
    - **SmartRouter v1.2 (Feb 2026)**: Cascade Pattern routing system with compound request detection. Architecture: (1) **Fast Rules Layer** (<1ms) — CONVERSAR patterns first (greetings, thanks, confirmations), then **signal scoring** (executarScore from creation verbs, pedagogical content, school subjects, grade levels) to detect compound requests before calendar keywords. Key change: messages with executarScore >= 3 + calendar keywords route to EXECUTAR, not CAPABILITY_DIRETA. Calendar-only patterns route to CAPABILITY_DIRETA only when no pedagogical signals present; (2) **LLM Layer** (<500ms) with system prompt separation + EXECUTAR override when LLM returns CAPABILITY_DIRETA but executarScore >= 3; (3) **Conflict Resolution** — context-aware: EXECUTAR wins over CAPABILITY_DIRETA for compound requests, CAPABILITY_DIRETA wins only when no pedagogical signals found. Located in `context-engine/smart-router.ts`.
    - **Route-Specific System Prompts**: `SYSTEM_PROMPT_CONVERSAR` (conversational, anti-generic responses), `SYSTEM_PROMPT_ROUTING` (JSON classification), and base `SYSTEM_PROMPT` (general identity). The old "PROTOCOLO DE INTENÇÃO EXECUTIVA" with "NA DÚVIDA = SEMPRE EXECUTIVO" was removed to prevent contradictions with SmartRouter decisions.
    - **handleDirectResponse (CONVERSAR path)**: Uses `buildStructuredContextForFollowUp()` to separate system prompt from user content. Sends `SYSTEM_PROMPT_CONVERSAR` as system message and session context + history + user message as user message. Prevents system prompt leakage and generic responses.
    - **StructuredContext**: New `buildStructuredContext()` and `buildStructuredContextForFollowUp()` functions in `context-gateway.ts` return `{ systemPrompt, userContext }` instead of a mixed string. Original `buildUnifiedContext()` preserved for backward compatibility.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage. Auth state managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture (v5.0), supporting activity creation, explanations, text generation, lesson plans, and research.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern for improved step reflection.
    - **Structured Response System**: Collects created items using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers for structured rendering.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting created activities to Neon DB.
    - **ContentSyncService (Live Sync)**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **ActivityStorageContract**: Centralized module for managing `localStorage` persistence of activity content.
    - **Activity Content Sync (DB Fallback)**: Prioritizes local sources for activity content, falling back to the database.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts via LLM, including `documento_livre` and `atividade_textual`. It features a 3-layer intelligent routing system for `atividade_textual` that detects interactive activities, matches specialized text-activity templates, and auto-evolves new templates on-demand.
    - **Ponto. Flow**: Automatic Package Delivery System (Layer 6 in orchestrator) that generates ADMINISTRATIVE complementary documents based on activity count and contextual keyword detection. Includes an `ArtifactViewModal` for displaying artifacts.
    - **Text Version Modal (`Modal-Versao-Texto`)**: Replaces old content modals, leveraging the `ArtifactViewModal` interface for text-version activities.
    - **Powers System v4.1 UNIFIED CONTEXT**: Virtual currency for AI capabilities with per-action pricing and synchronization with Neon DB.
    - **Calendário School Multi-View System**: Portal-rendered calendar panel with 4 view modes (Day/Week/Month/Year). Uses Strategy Pattern — shared event data with view-specific projection functions. View-aware navigation (±day/±week/±month/±year) and dynamic title formatting. Header bounds detection via `data-header-flutuante` attribute + ResizeObserver for pixel-perfect alignment. Auto-closes on route navigation via useLocation. Events persisted to Neon PostgreSQL via REST API (`/api/calendar/events`). UI loads from Neon on open and listens to `calendar-events-updated` CustomEvent for real-time refresh.
    - **AI Calendar Management (gerenciar_calendario) v1.1**: Comprehensive AI-powered calendar management system replacing the create-only `criar_compromisso_calendario`. Features a mini-agent architecture with autonomous decision-making loop (max 4 iterations) that chains sub-operations based on user intent. Sub-operations: `visualizarEventos` (range/month queries with label filtering), `analisarDisponibilidade` (free/busy day analysis), `editarEvento` (modify any field), `excluirEvento` (delete with refresh), `criarEventos` (delegates to existing V2 batch system). Fast-path optimization skips LLM routing for direct create intents. Backward compatibility: detects old `criar_compromisso_calendario` params and delegates to V2 directly. Backend endpoints: GET `/api/calendar/events/:userId/range`, GET `/api/calendar/events/:userId/availability`, GET `/api/calendar/events/event/:eventId`. Planner detection expanded for view/edit/delete/availability keywords. CustomEvent `calendar-events-updated` triggers instant UI refresh.
    - **CAPABILITY_DIRETA DevModeCard (Feb 2026)**: When capabilities are executed directly (without full execution plan), a DevModeCard is now shown in the chat. The orchestrator returns `DirectCapabilityMeta` with capability name, displayName, status, operations executed, and duration. ChatLayout creates a DevModeCard with the same design system as the standard plan execution card, showing each sub-operation as a capability item with success/error status. This applies to `gerenciar_calendario`, `pesquisar_atividades_conta`, and `pesquisar_atividades_disponiveis`.
    - **Rich Markdown Calendar Responses (Feb 2026)**: All calendar sub-operations now return rich markdown formatted responses with headers (## / ###), bold text, tables, and structured lists. The existing `RichTextMessage` component renders these with proper typography, callouts, and visual hierarchy. Operations: visualizar → grouped by date with headers; analisar → summary table + free/busy sections; criar → success callout with event details; editar → update confirmation with changed fields; excluir → deletion confirmation.
    - **Clean Topic Extraction Pipeline (Feb 2026)**: Structured topic extraction before execution, following industry patterns (Manus, Genspark, MagicSchool). Planner extracts `temas_extraidos`, `disciplina_extraida`, `turma_extraida` from `intencao_desconstruida.temas`. Executor stores these and injects `tema_limpo` into all capability contexts. Content generation (list/quiz/flash/generic) prioritizes clean topics over regex. Decision capability includes clean topic in LLM prompt. `generateThemeFromObjective()` fallback strips instruction sentences (calendar, approach, class metadata) before extraction. `inferDisciplinaFromTemas()` detects subject from topics when not explicitly provided.
    - **Linked Activity ID Resolution (Feb 2026)**: Multi-layer system to resolve built-ID ↔ DB-ID mismatch in calendar events. Activities are created with temporary built IDs (e.g., `built-plano-aula-*`) but stored in DB with short alphanumeric IDs (e.g., `x5CdnRbY`). Resolution chain: (1) V2 calendar enrichment maps built IDs → DB IDs using tipo+titulo matching from `salvar_atividades_bd` results before saving events; (2) Calendar modal fallback searches user activities by tipo+titulo when direct ID lookup fails for legacy events.

### System Design Choices
The architecture features a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini API**: AI service for content generation and assistance.
- **Groq API**: AI service for fast lesson content generation.
- **Neon PostgreSQL (Replit)**: Built-in Replit PostgreSQL database (primary data store).
- **SendGrid**: Email notification service.

### Development & Build Tools
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **Tailwind CSS**: Utility-first CSS framework.

### UI Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Pre-built components.
- **React Hook Form**: For form handling.
- **Lucide React**: Icon library.

### Specialized Libraries
- **@dnd-kit**: For drag-and-drop functionality.
- **Axios**: HTTP client.
- **bcrypt**: For password hashing.
- **Framer Motion**: For animations.