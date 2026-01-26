# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its core purpose is to enhance educational engagement and efficiency through features like an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The project aims to improve educational engagement and efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects, blur backgrounds, and a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text). It uses custom, responsive typography, smooth CSS animations, and a mobile-first approach. Accessibility features include presentation mode with multi-language translation, dynamic font sizing, and voice reading support. The School Power Chat Interface uses custom avatar components, distinct messaging styles, and ultra-modern glassmorphism designs for interactive cards, including `JotaAvatarChat`, `AssistantMessage`, `NarrativeReflectionCard`, `PlanActionCard`, `ProgressiveExecutionCard`, and `CapabilityCard`.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A resilient multi-model fallback system primarily uses Groq API (Llama 3.3 70B, Llama 3.1 8B, Llama 4 Scout) and Google Gemini API as a final fallback. This system manages content generation, lesson planning, and AI assistance with automatic retries and intelligent model switching, incorporating in-memory caching, a query complexity classifier, context window optimization, and input validation.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with dynamic templates, orchestrated by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow with built-in logging, validation, and auto-recovery.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, and a 3-layer memory manager, capable of search, research, decision-making, generation, and activity creation with a 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation.
    - **Multi-Turn Conversation System**: Enables unlimited consecutive plan executions within the same chat session by managing state resets, preserving conversation history, and resetting executors.
    - **3-Call Context Architecture**: A unified context management system with specialized AI calls for initial response, development card reflections, and final response generation, managed by a central `ContextManager` to prevent context overflow.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing execution, validation, and context enrichment, ensuring data flow and robust failure handling across `pesquisar`, `decidir`, `gerar`, `criar`, and `salvar` capabilities.
    - **Database Persistence Pipeline**: The `salvar_atividades_bd` capability persists created activities to the Neon database through a 4-phase architecture: COLLECT, VALIDATE, PERSIST, and VERIFY.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities, validates fields, and stores results.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields to the database and emits events for UI updates.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names, including a `useActivityAutoLoad` hook and specific processors for activity types.
    - **Auto-Build System with ModalBridge**: An event-driven architecture orchestrates the build process, managing progressive visual construction of activities within the `EditActivityModal`, with visual states, pre-generated content detection, and field normalization.
    - **StorageSyncService v2.0**: A centralized service for managing activity storage, tracking origin and pipeline metadata, and emitting events for UI synchronization.
    - **Activity Catalog**: `schoolPowerActivities.json` defines activity types and required fields.
    - **Activity Version System**: Dual-version system categorizing activities into Interactive (fully functional UI) and Text Version (content delivered as formatted text). Interactive activities: `lista-exercicios`, `quiz-interativo`, `flash-cards`. Text version activities: `plano-aula`, `sequencia-didatica`, `tese-redacao`. Managed by `activityVersionConfig.ts` with `TextVersionGenerator.ts` for AI text generation and `ContentExtractModal.tsx` for content display. Features robust AI response parsing with multi-format JSON support, professional 6-section fallback content generation, and consistent localStorage key pattern (`text_content_${activityType}_${activityId}`) for content persistence.
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

## Recent Changes (January 2026)

### Storage Optimization for Heavy Activities
- **Problem Solved**: QuotaExceededError for `lista-exercicios`, `quiz-interativo`, `flash-cards`
- **Solution**: Heavy activities now store only lightweight metadata in `activity_${id}` and skip `generated_content_${id}`. Full payloads are stored exclusively in `constructed_${type}_${id}`.
- **Files Changed**: `buildActivityHelper.ts`, `autoBuildService.ts`, `gerar-conteudo-atividades.ts`, `criar-atividade-v2.ts`

### ContentExtractModal Data Flow Fix
- **Problem Solved**: Plano de Aula modal showing empty content
- **Solution**: `ActivityViewModal` now uses `retrieveTextVersionContent()` as primary method to fetch text-version activity content, with fallback to `generateTextExtract()`.
- **Files Changed**: `ActivityViewModal.tsx`

### Activity Auto-Load Enhancement
- **Enhancement**: `useActivityAutoLoad` now detects activity type via `activity_` metadata before constructing `constructed_${type}_${id}` lookup keys.
- **Files Changed**: `useActivityAutoLoad.ts`

### Heavy Activity Storage Pattern
- Activities classified as "heavy" (large payload): `lista-exercicios`, `quiz-interativo`, `flash-cards`
- Storage pattern for heavy activities:
  - `constructed_${type}_${id}`: Full content (questions, cards, etc.)
  - `activity_${id}`: Metadata only (title, type, questionsCount)
  - `generated_content_${id}`: SKIPPED for heavy activities
- Text-version activities (`plano-aula`, `sequencia-didatica`, `tese-redacao`) use `text_content_${type}_${id}` exclusively.

### Jota Response Sanitization
- **Problem Solved**: Raw JSON arrays being displayed in Jota chat instead of formatted text
- **Solution**: Added sanitization layer to `initial-response-service.ts` using `containsRawJson()` + `sanitizeAiOutput()` to detect and convert JSON to narrative text before displaying to users.
- **Files Changed**: `initial-response-service.ts`
- **Sanitization Flow**: AI Response → `containsRawJson()` detection → `sanitizeAiOutput()` → `jsonToNarrative()` → Clean text for UI