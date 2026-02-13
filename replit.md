# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **2026-02-13**: Dossiê Pedagógico System — Organized Response Architecture:
  1. **Phase Separators (`[[FASE:titulo|descrição]]`)**: New marker type that creates elegant visual section headers to group activities by pedagogical purpose (Engajamento, Conteúdo, Prática, Avaliação, Complementos). Each phase has auto-detected emoji and color coding.
  2. **Dossiê Summary Card (`[[DOSSIE:titulo]]`)**: Compact overview card at the top of responses showing mission title, activity count, document count, and phase breakdown pills. Gives the teacher instant context before scrolling.
  3. **Parser Enhancements**: `structured-response-parser.ts` now handles 5 marker types: ATIVIDADES, ATIVIDADE:, ARQUIVO:, FASE:, DOSSIE:. Phase detection uses PHASE_CONFIG lookup table for emoji/color mapping.
  4. **UI Components**: `DossieSummaryCard` (gradient background, sparkle icon, count badges, phase pills) and `PhaseSeparator` (icon + title + description + gradient line) in StructuredResponseMessage.tsx.
  5. **Prompt Architecture**: Final response prompt now instructs AI to organize 3+ activities into pedagogical phases (Engajamento → Conteúdo → Prática → Avaliação → Complementos) with dossiê summary at top. Transforms "list of items" into "teaching roadmap".
  KEY INSIGHT: The problem was "Paralysis of the List" — teachers received 7+ activities but didn't know where to start. Solution: organize by pedagogical purpose, not generation order.
- **2026-02-12**: Premium Typography & Design Overhaul (Manus AI-level quality):
  1. **RichTextMessage.tsx Complete Redesign**: Unified Inter font stack across ALL block types (eliminated Georgia serif mixing). Body text 14.5px/1.75 line-height, headers H1:20px/700, H2:17px/700, H3:15px/600 with negative letter-spacing. Max-width 680px constraint for readability. All renderers use inline styles for precise control. CSS-in-JS `<style>` tag handles inline elements (strong, em, code, a). Generous vertical spacing: 14px for special blocks, 6px for paragraphs. Subtle gradient delimiter, polished tables with alternating rows, callouts with 3px left accent border.
  2. **AssistantMessage.tsx + StructuredResponseMessage.tsx**: "Jota" label unified to Inter 14px/700 with -0.01em tracking. Consistent design system across all message types.
  3. **Prompt System Upgrade**: System prompt "FERRAMENTAS DE FORMATAÇÃO RICA" replaced with "FORMATAÇÃO PREMIUM" enforcing: paragraph length limits (2-4 sentences max), heading hierarchy (## and ### only), surgical bold usage (max 30% of text), response-length-adaptive formatting (short=plain, medium=bold+list, long=headings+callouts). Initial-response simplified to 2-4 sentences with minimal formatting. Final-response enforces narrative flow without headers, max 1 callout per response.
  KEY DESIGN TOKENS: Font: Inter/-apple-system/BlinkMacSystemFont. Body: 14.5px/400/1.75/#fff82%. H1: 20px/700/1.35/#fff95%. Code: JetBrains Mono 13px. Max-width: 680px.
- **2026-02-12**: Preset Blocks Grid + Interactive Slot Chips:
  1. **PresetBlocksGrid**: 2-column responsive grid (596px width matching ChatInput) with GRID_CONFIG for precise sizing. Positioned inside 900x617 container via PRESET_GRID_POSITION config.
  2. **Interactive Slot System**: `promptNodes.ts` (PromptNode types, parsePromptToNodes parser, compilePrompt compiler), `SlotChipEditor.tsx` (inline contentEditable chips — no modals/popovers). `[Placeholder]` patterns become inline-editable chips.
  3. **ChatInput Template Mode**: Switches between textarea (normal) and TemplateRenderer (when preset with slots active). Send always enabled — user can send with unfilled slots (placeholder text used as fallback).
  4. **Flow**: Click preset block → parsePromptToNodes → ChatInput template mode → click chips to type inline → compilePrompt → text to AI (unfilled slots use placeholder name).
  Files: `preset-blocks/PresetBlocksGrid.tsx`, `preset-blocks/promptNodes.ts`, `preset-blocks/SlotChipEditor.tsx`, `SchoolPowerPage.tsx`, `ChatInput.tsx`.
- **2026-02-12**: Rich Text Formatting Tools — Unified formatting across text activities and Jota chat:
  1. **RichTextMessage Component**: New read-only renderer that converts markdown to EditorJS blocks (tables, callouts, checklists, code blocks, quotes, headers, lists, delimiters). Uses smart heuristic: strong indicators (headers, tables, callouts) trigger rich rendering immediately; soft indicators (bold, lists) require 2+ matches.
  2. **TextVersionGenerator Prompts**: All 4 text activity prompts (plano-aula, sequencia-didatica, tese-redacao, atividade-textual) now include RICH_FORMATTING_INSTRUCTIONS with detailed guidance for using tables, callouts (> 💡/⚠️/✅/📌), checklists, code blocks, quotes, and separators.
  3. **Chat Formatting**: AssistantMessage and StructuredResponseMessage now use RichTextMessage instead of plain text, enabling formatted rendering in the Jota chat.
  4. **System Prompt**: Added "FERRAMENTAS DE FORMATAÇÃO RICA" section to Jota's system prompt, initial-response-service, and final-response-service so all AI responses leverage rich formatting.
  KEY: Reuses existing `convertTextContentToBlocks` converter from Modal-Versao-Texto — no code duplication.
- **2026-02-11**: Text Activity Cross-Contamination & Persistence COMPLETE FIX — Multiple root causes fixed:
  1. **SALVAR_BD Collection Deduplication**: `activitiesByType` Map was keyed by `tipo` alone, causing ALL text activities with `tipo: "atividade-textual"` to merge into ONE entry. Fixed by using composite keys `${tipo}::${originalId}` across all 4 collection sources (previous_results, ChosenActivitiesStore, constructed_* keys, text_content_* keys).
  2. **ConstructionInterface Retrieval**: Added original catalog ID extraction from built IDs (regex `/^built-(.+)-\d+$/`) and prioritized `retrieveTextVersionContent` calls with the correct original ID first.
  3. **Event Data Enrichment**: Added `origin_activity_id`, `activityType`, `text_activity_template_id` to `construction:activity_completed` events.
  4. **Backend API Fallback**: Enhanced `by-original-id` endpoint to extract catalog ID from built-format IDs (`built-prova-personalizada-{timestamp}` → `prova-personalizada`) when exact match fails.
  CRITICAL LEARNING: The `activitiesByType` Map keyed by `tipo` was the PRIMARY root cause of text activity loss — 7+ text activities collapsed into 1. Composite keys are REQUIRED for same-tipo activities.
- **2026-02-11**: Text Activity Routing COMPLETE FIX — Root cause: Previous fixes were applied to `ConstructionGrid.tsx` but the actual UI in chat is `ConstructionInterface.tsx` (a different component) which had NO text detection. Also `buildActivityHelper.ts` had hardcoded 3-type check. Fix: (1) ConstructionInterface.tsx now has full ArtifactViewModal routing for text activities. (2) buildActivityHelper.ts uses expanded isTextVersionActivity config. (3) Executor multi-key localStorage fallback for text_content. (4) ChatLayout 3-tier content retrieval fallback. CRITICAL LEARNING: Always match screenshots to actual component names before fixing.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage. Auth state managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture (v5.0), an autonomous AI agent that dynamically selects capabilities based on request context, supporting activity creation, explanations, text generation, lesson plans, and research. Plans are auto-executed.
    - **Mente Orquestradora Architecture v7.0**: Autonomous capability selection with a supreme unified context engine, including a 4-layer `Context Engine v2.0`, `SessionStore` v2.0 with `InteractionLedger`, `ContextAssembler`, `ConversationCompactor`, `GoalReciter`, and `IntentClassifier`.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern for improved step reflection.
    - **Structured Response System**: Collects created items using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers for structured rendering.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting created activities to Neon DB.
    - **ContentSyncService (Live Sync)**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **ActivityStorageContract**: Centralized module for managing `localStorage` persistence of activity content.
    - **Activity Content Sync (DB Fallback)**: Prioritizes local sources for activity content, falling back to the database.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts via LLM, including `documento_livre` and `atividade_textual`. It features a 3-layer intelligent routing system for `atividade_textual` that detects interactive activities, matches specialized text-activity templates, and auto-evolves new templates on-demand.
    - **Ponto. Flow**: Automatic Package Delivery System (Layer 6 in orchestrator) that generates ADMINISTRATIVE complementary documents (guia_aplicacao, mensagem_pais, relatorio_coordenacao, mensagem_alunos) based on activity count and contextual keyword detection. PEDAGOGICAL complements are handled by FASE 6 in the planning prompt. Includes an `ArtifactViewModal` for displaying artifacts.
    - **Text Version Modal (`Modal-Versao-Texto`)**: Replaces old content modals, leveraging the `ArtifactViewModal` interface for text-version activities.
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