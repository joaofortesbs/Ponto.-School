# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its core purpose is to enhance educational engagement and efficiency through features like an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The project aims to improve educational engagement and efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects, blur backgrounds, and a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text). It uses custom, responsive typography, smooth CSS animations, and a mobile-first approach. Accessibility features include presentation mode with multi-language translation, dynamic font sizing, and voice reading support. The School Power Chat Interface uses custom avatar components, distinct messaging styles, and ultra-modern glassmorphism designs for interactive cards.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration - LLM Orchestrator v3.0 Enterprise (Jan 2026)**: A unified, resilient multi-model cascade system in `src/services/llm-orchestrator/`:
    - **Architecture**: 10 models organized in 5 tiers for maximum reliability
      - TIER 1 (Ultra-Fast): llama-3.1-8b-instant, gemma2-9b-it
      - TIER 2 (Fast): llama-3.3-70b-versatile, mixtral-8x7b-32768, llama3-70b-8192
      - TIER 3 (Balanced): llama-3-groq-70b-8192-tool-use-preview, llama-4-scout-17b-16e-instruct
      - TIER 4 (Powerful): gemini-2.5-flash-preview-04-17, gemini-2.0-flash
      - TIER 5 (Local Fallback): NUNCA FALHA - gera conteúdo educativo local
    - **Protection Systems**:
      - Circuit Breaker per model (threshold: 5 failures, cooldown: 60s)
      - Rate Limiter per provider (Groq: 30 req/min, Gemini: 15 req/min)
      - Retry with exponential backoff (3 attempts, base: 1000ms, factor: 2x)
      - Input sanitization with 50k char limit
    - **Smart Routing**: Automatic routing based on activity type complexity
    - **Cache System**: In-memory cache with 5min TTL and 200 max entries
    - **API Usage**: `import { generateContent } from '@/services/llm-orchestrator'`
    - **Files**: orchestrator.ts, config.ts, types.ts, providers/groq.ts, providers/gemini.ts, cache.ts, guards.ts, router.ts, fallback.ts
    - **Legacy Wrappers**: 
      - `geminiClient.ts` wraps the orchestrator for backward compatibility with direct generators
      - `controle-APIs-gerais-school-power.ts` wraps the orchestrator maintaining original API for 16+ consumer files
    - **Required Secrets**: `VITE_GROQ_API_KEY` (prefix: gsk_), `VITE_GEMINI_API_KEY` (prefix: AIza)
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning orchestrated by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, and a 3-layer memory manager, capable of search, research, decision-making, generation, and activity creation with a 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation.
    - **Multi-Turn Conversation System**: Enables unlimited consecutive plan executions within the same chat session.
    - **3-Call Context Architecture**: A unified context management system with specialized AI calls for initial response, development card reflections, and final response generation, managed by a central `ContextManager`.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing execution, validation, and context enrichment across `pesquisar`, `decidir`, `gerar`, `criar`, and `salvar` capabilities.
    - **Database Persistence Pipeline**: The `salvar_atividades_bd` capability persists created activities to the Neon database through a 4-phase architecture: COLLECT, VALIDATE, PERSIST, and VERIFY.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields to the database and emits events for UI updates.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names, including a `useActivityAutoLoad` hook.
    - **Auto-Build System with ModalBridge**: An event-driven architecture orchestrates the build process, managing progressive visual construction of activities within the `EditActivityModal`.
    - **StorageSyncService v2.0**: A centralized service for managing activity storage, tracking origin and pipeline metadata, and emitting events for UI synchronization.
    - **StorageOrchestrator Enterprise System**: A 3-layer storage architecture that eliminates localStorage QuotaExceededError:
      - Layer 1: IndexedDB (50MB+ capacity) - primary storage for heavy activities
      - Layer 2: Zustand/Memory cache - fast access for frequently used data
      - Layer 3: localStorage - only for metadata and small flags
      - Features: Automatic layer selection, garbage collection every 5 minutes when usage >80%, emergency cleanup on quota errors, global guard that intercepts all localStorage.setItem calls for large data
      - Heavy activity types (quiz-interativo, flash-cards, lista-exercicios, plano-aula, sequencia-didatica) automatically route to IndexedDB
      - API: `storageSet(key, data, { activityType })`, `storageGet<T>(key)`, `safeSetJSON()`, `initGlobalStorageGuard()`
    - **Activity Version System**: Dual-version system categorizing activities into Interactive (fully functional UI) and Text Version (content delivered as formatted text) for various activity types, with robust AI response parsing and professional 6-section fallback content generation.
    - **Lista de Exercícios Blindagem System v2.1.2 (Jan 2026)**: Enterprise-grade isolation and protection system:
      - **Bounded Context Architecture**: Fully isolated module with dedicated contracts and sanitizers
      - **Protected Files**: `ListaExerciciosGenerator.ts`, `unified-exercise-pipeline.ts`, `ExerciseListPreview.tsx`, `useExerciseListSync.ts`, `exerciseListProcessor.ts`, `questionValidator.ts`
      - **Contracts**: `ExerciseListContract`, `QuestionContract`, `ExerciseListResponseContract` with readonly properties
      - **Sanitizer**: `ExerciseListInputSanitizer` validates ALL external data before processing
      - **Alternative Normalization (v2.1.3 - Jan 2026)**: `normalizeAlternativeToString()` function in contracts.ts applied across ENTIRE pipeline:
        - **Coverage**: Applied in ListaExerciciosGenerator.ts, unified-exercise-pipeline.ts, ExerciseListPreview.tsx (4 locations), exerciseListProcessor.ts, questionValidator.ts
        - Handles: strings, numbers, booleans, null/undefined, nested arrays, objects with 15+ field variants (texto, text, content, value, label, etc.)
        - Fallback: Uses Object.values to find longest string when no known fields match
        - **Eliminates [object Object] bug** in ALL rendering contexts including: question cards, detailed view, edit mode, and validation
      - **Prompt Engineering Fix (v2.1.3)**: All AI prompts now require real educational content:
        - listaExerciciosPrompt.ts: Explicit rule forbidding "Alternativa A/B/C/D" as text
        - QuestionSimulator.tsx: Example alternatives with descriptive content
        - FloatingChatSupport.tsx: Quiz prompts with educational alternative examples
        - All fallback generators use "[Aguardando IA]" placeholder instead of generic alternatives
      - **Dedicated Storage Namespace**: Uses `sp_le_v2_` prefix to prevent storage collisions
      - **6-Layer Pipeline**: Normalization → Intelligent Extraction (7 fallback methods) → Validation → Synchronization → Testing → Progressive Fallback
      - **Agent Rules File**: `LISTA_EXERCICIOS_RULES.md` contains mandatory guidelines for any modifications
      - **Configuration**: `LISTA_EXERCICIOS_CONFIG` with version tracking and protection flags
      - **Schema-Aware JSON Extraction (v2.1.0)**: Bracket matching algorithm that prioritizes blocks containing "questoes" or "enunciado"
      - **Rigorous Validation (v2.1.0)**: Requires enunciado (>=5 chars), respostaCorreta, and alternativas (>=2 for multipla-escolha) with 50% threshold
      - **Execution Rules**: `execution-rules.json` includes rule_016/017 for Lista de Exercícios validation specifications
    - **Flash Cards Blindagem System (Jan 2026)**: Enterprise-grade isolation and protection system:
      - **Bounded Context Architecture**: Fully isolated module with dedicated contracts and sanitizers
      - **Protected Files**: `FlashCardsGenerator.ts`, `FlashCardsPreview.tsx`, `contracts.ts`
      - **Contracts**: `FlashCardContract`, `FlashCardsInputContract`, `FlashCardsOutputContract` with readonly properties
      - **Sanitizer**: `FlashCardsSanitizer` validates ALL external data with methods: `sanitizeInput()`, `sanitizeCards()`, `sanitizeOutput()`
      - **Dedicated Storage Namespace**: Uses `sp_fc_v2_` prefix (with `sp_fc_v2_cache_` for cache) to prevent storage collisions
      - **Legacy Compatibility**: Maintains backward compatibility with `constructed_flash-cards_` prefix
      - **Agent Rules File**: `FLASH_CARDS_RULES.md` contains mandatory guidelines for any modifications
      - **Configuration**: `FLASH_CARDS_CONFIG` with version tracking and protection flags
      - **Data Flow**: External Data → FlashCardsSanitizer.sanitize() → FlashCardsInputContract → FlashCardsGenerator → FlashCardsOutputContract → FlashCardsPreview
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.

### System Design Choices
The architecture emphasizes a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

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
- **PostCSS**: CSS processing.
- **ESLint**: Code linting.

### UI Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Pre-built components.
- **React Hook Form**: For form handling.
- **Lucide React**: Icon library.

### Specialized Libraries
- **@dnd-kit**: For drag-and-drop functionality.
- **@tsparticles**: For particle effects.
- **Axios**: HTTP client.
- **docx**, **jsPDF**, **file-saver**: For document generation and download.
- **bcrypt**: For password hashing.
- **Framer Motion**: For animations.