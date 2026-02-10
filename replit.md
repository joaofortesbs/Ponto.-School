# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **2026-02-10**: Catalog Expansion & Intelligence Pipeline v2.0 — (1) Expanded schoolPowerActivities.json from 6 to 67 entries, adding all 61 text activity templates with `pipeline` field distinction (standard vs criar_arquivo_textual) and `text_activity_template_id` linking. (2) Complete decision intelligence rewrite: `buildDecisionPrompt` now shows all 67 activities grouped by pipeline, with quantity detection and enforcement (trimming + fallback respect). (3) Text activity routing: added `atividade-textual` to TEXT_VERSION_ACTIVITIES config, added field mapping schema, added specialized TextVersionGenerator prompt handler that looks up template-specific prompts from TextActivityRegistry. (4) FASE 6 reinforcement: added mandatory checklist before plan finalization ensuring AI adds complementation steps (rubrica, exit ticket, gabarito). (5) Rich formatting injection: all text activity template prompts get RICH_FORMATTING_INSTRUCTIONS appended via getPromptForRoute (tables, checklists, callouts, code blocks). (6) Ponto Flow false positive fix: tightened all trigger conditions — guia_aplicacao only for ≥2 activities, mensagem_pais only for explicit mentions/week plans/inclusion, relatorio_coordenacao requires stronger signals, mensagem_alunos requires substantial batch + student mention.
- **2026-02-10**: Intelligence Upgrade Phase (MACROs 1-5) — (1) Fixed critical planning-prompt.ts line 202 contradiction that was blocking FASE 6 proactive complementation by clarifying Ponto Flow generates administrative docs only (guia_aplicacao, mensagem_pais, relatorio_coordenacao) while FASE 6 generates pedagogical complements (rubricas, exit tickets, KWL charts). Added EXEMPLO 9 showing full activity + complementation flow. (2) Injected rich formatting instructions into ALL 9 artifact prompt templates in types.ts with type-specific guidance (roteiro_aula uses time tables + material checklists, dossie_pedagogico uses BNCC mapping tables, etc.). (3) Upgraded Ponto Flow with contextual keyword detection: avaliação→mensagem_alunos, projeto/PBL→relatorio_coordenacao, inclusão→mensagem_pais. (4) Enhanced text-activity-detector.ts with synonym expansions (avaliação→prova/simulado, jogo→bingo/caça-palavras, organizador→mapa mental/KWL) and multi-keyword confidence boosting. (5) Architecture audit confirmed solid data flow: orchestrator→executor→capabilities→Ponto Flow with proper error handling. Zero LSP errors.
- **2026-02-10**: Rich Formatting & Proactive Complementation — Comprehensive markdown parser upgrade in artifact-editorjs-converter.ts and text-content-converter.ts adding 8 new block types: markdown tables with header detection, task lists/checklists, code blocks with language detection, callout/alert boxes (emoji-triggered), horizontal rules, headers H4-H6, nested lists with indentation, enhanced inline formatting (strikethrough, highlight, clickable links). ArtifactViewModal enhanced with professional table styling (colored headers, zebra striping, hover effects), code block renderer with copy button, callout box renderer with 6 color variants. Planning prompt upgraded with FASE 5 (Rich Formatting Capabilities teaching AI when to use tables vs lists vs callouts) and FASE 6 (Proactive Complementation with matrix logic for auto-suggesting rubrics, exit tickets, KWL charts). Total parser now supports 16 markdown features (vs 4 previously). Zero compilation errors.
- **2026-02-10**: Pedagogical Variety (Front 3, MACROs 1-5) — Expanded text activity templates from 46 to 61 across 8 categories. Added 15 high-value templates: CER, Think-Pair-Share, Gallery Walk, Socratic Seminar, Jigsaw, SEL, Spiral Review, STEAM, Lab Generator, Report Card Comments, Diagnostic Assessment, Self-Assessment, Anchor Chart, Mentor Text, Presentation Script. Upgraded Planning Prompt to explicitly list all 61+ templates with categorized display and maximum variety principles. Added CER routing example (Example 7). Enhanced Decision System with variety enforcement (never repeat same activity type). Zero compilation errors.
- **2026-02-10**: Content Quality & Pedagogical Depth (Front 2, MACROs 1-4) — Built BNCC Reference module (`bncc-reference.ts`) with 100+ real curriculum codes across 5 subjects (Matemática, Português, Ciências, História, Geografia). Created Quality Prompt Templates system (`quality-prompt-templates.ts`) with Bloom's taxonomy 6-level progression, pedagogical distractor guidelines, SMART objectives, teacher instructions, and type-specific quality directives. Successfully integrated quality templates into ALL 6 generators: buildContentGenerationPrompt (central), QuizInterativoGenerator, ListaExerciciosPrompt, FlashCardsGenerator, PlanoAulaBuilder, SequenciaDidaticaPrompt. Implemented batch progression system (getBatchProgressionPrompt) for automatic pedagogical variety in multi-activity requests with 5-phase progression (Ativação → Exploração → Aprofundamento → Consolidação → Avaliação). Zero compilation errors.
- **2026-02-09**: Anti-Literalism Architecture v2.0 — Major rewrite of Planning Prompt with 4-phase architecture: (1) Intent Deconstruction (QUEM/O_QUE/TEMAS/QUANDO/QUANTO/MODO), (2) Persona Simulation, (3) Anti-Literalism Iron Rule with few-shot examples, (4) Batch Creation support. Updated System Prompt with Executive Intent Protocol. Enhanced Intent Classifier with school-context patterns. Updated planner fallback with school-context regex detection. All changes ensure Jota creates materials instead of explaining how to create them.
- **2026-02-09**: Migrated project to standard Replit environment. Database schema synced with Neon PostgreSQL. Both frontend (Vite on port 5000) and backend (Express on port 3001) workflows running successfully. Supabase migration still pending for auth, storage, and edge functions.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage. Auth state managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture (v5.0), an autonomous AI agent that dynamically selects capabilities based on request context. It supports activity creation, explanations, text generation, lesson plans, and research. Plans are auto-executed, starting with an 'em_execucao' status.
    - **Mente Orquestradora Architecture v7.0**: Autonomous capability selection with a supreme unified context engine. Key components include a 4-layer `Context Engine v2.0` for managing AI context, a `SessionStore` v2.0 with an `InteractionLedger` for permanent fact storage, `ContextAssembler` for optimized context building, `ConversationCompactor` for priority-based semantic compression, `GoalReciter` to prevent context drift, and `IntentClassifier` for routing user prompts.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern for improved step reflection.
    - **Structured Response System**: Collects created items (activities + artifacts) after execution, using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers for structured rendering of results in the UI.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting created activities to Neon DB.
    - **ContentSyncService (Live Sync)**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **ActivityStorageContract**: Centralized module for managing all `localStorage` persistence of activity content.
    - **Activity Content Sync (DB Fallback)**: Prioritizes local sources for activity content, falling back to the database when necessary.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts via LLM, including `documento_livre` and `atividade_textual`. The `atividade_textual` type uses a 3-layer intelligent routing system: Layer 1 detects interactive activities (quiz, flash card) and routes to standard pipeline; Layer 2 matches against 61+ specialized text-activity templates across 8 categories (assessments, games, organizers, writing, planning, communication, differentiation, engagement); Layer 3 auto-evolves new templates on-demand using AI-inferred structure with localStorage persistence. Templates include specialized pedagogical prompts, keyword detection, expected sections, and visual identity. The `TextActivityRegistry` provides smart indexing and the `AutoEvolutionEngine` tracks usage counts to identify most valuable auto-generated activities.
    - **Ponto. Flow**: Automatic Package Delivery System (Layer 6 in orchestrator) that generates ADMINISTRATIVE complementary documents (guia_aplicacao, mensagem_pais, relatorio_coordenacao, mensagem_alunos) based on activity count and contextual keyword detection. Context-aware: avaliação triggers mensagem_alunos, projeto/PBL triggers relatorio_coordenacao, inclusão triggers mensagem_pais. PEDAGOGICAL complements (rubricas, exit tickets, KWL charts, gabaritos) are handled by FASE 6 in the planning prompt, NOT by Ponto Flow. Includes an `ArtifactViewModal` for displaying artifacts with advanced UI features. Supports documento_livre for standalone document generation without prior activities.
    - **Text Version Modal (`Modal-Versao-Texto`)**: Replaces old content modals, leveraging the `ArtifactViewModal` interface for text-version activities.
    - **Centralized Overlay Config**: Shared configuration for all modal backdrops.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Powers System v4.1 UNIFIED CONTEXT**: Virtual currency for AI capabilities with per-action pricing and synchronization with Neon DB.

### System Design Choices
The architecture features a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini API**: AI service for content generation and assistance.
- **Groq API**: AI service for fast lesson content generation.
- **Neon PostgreSQL**: Managed external PostgreSQL database.
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