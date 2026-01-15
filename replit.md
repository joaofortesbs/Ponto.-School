# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Key capabilities include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning through its "School Power" feature. The platform aims to significantly enhance educational engagement and efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design utilizing glass-morphism effects, blur backgrounds, and a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text). It incorporates custom, responsive typography, smooth CSS animations, and a mobile-first approach. Accessibility features include presentation mode with multi-language translation, dynamic font sizing, and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A resilient multi-model fallback system is used, primarily with Groq API (Llama 3.3 70B, Llama 3.1 8B, Llama 4 Scout, Qwen3 32B) and Google Gemini API as a final fallback. This system handles content generation, lesson planning, and AI assistance with automatic retries, rate limit detection, and intelligent model switching.
- **Authentication & User Management**: Supabase manages authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with 5 dynamic templates that generate custom section structures.
    - **Multi-Agent Lesson Orchestrator v4.0**: A highly reliable, observable, and self-correcting system that coordinates AI agents through a 7-step workflow to generate lessons with embedded educational activities. It includes a StepLogger, StepValidation, and an AutoRecoveryEngine for robust execution.
    - **Agente Jota Chat Interface**: A modern chat-based interface for School Power, replacing the previous card-based contextualization. It features an orchestrator, planner, executor, and 3-layer memory manager. Key capabilities include searching for existing activities, researching available activities from a catalog, deciding which activities to create using AI, generating content for activity fields, and creating new activities. It incorporates a 4-layer Anti-Hallucination System, a Rules Engine, and an isolated typewriter effect for chat responses. New additions include a Debug System for AI actions, a Construction Interface for visualizing activity creation progress, and a Content Generation capability that auto-fills activity fields based on conversation context with real-time UI feedback via Zustand selectors and CustomEvents.
    - **API-First Architecture (V2)**: Standardized contracts (CapabilityInput, CapabilityOutput, DebugEntry) are used with a central CapabilityExecutor that manages execution, validation, and context enrichment. A DataConfirmation System ensures critical checks are passed before proceeding, with detailed logging and UI integration. The V2 capability system uses a `capabilityResultsMap` to pass data between capabilities (pesquisar → decidir → gerar → criar), with proper failure handling that halts the pipeline when critical capabilities fail.
    - **V2 Pipeline Completo**: O pipeline V2 inclui 4 capabilities que se comunicam via `capabilityResultsMap`:
      1. `pesquisar_atividades_disponiveis`: Pesquisa atividades disponíveis no catálogo
      2. `decidir_atividades_criar`: Decide quais atividades criar baseado no contexto
      3. `gerar_conteudo_atividades`: Gera conteúdo AI para os campos obrigatórios
      4. `criar_atividade`: Persiste as atividades no banco de dados
    - **Conversation Context Flow**: O histórico completo da conversa é passado do ChatLayout → executeAgentPlan → executor.setConversationContext → CapabilityInput.context.conversation_context, permitindo que a geração de conteúdo seja contextualizada com toda a discussão.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability receives chosen activities from `decidir_atividades_criar` via `capabilityResultsMap`, generates AI content for each required field using `executeWithCascadeFallback`, validates and normalizes fields using `activity-fields-sync.ts`, stores results in both `ChosenActivitiesStore` and `localStorage` (key: `generated_content_{activityId}`), and emits detailed debug logs that appear in the Debug Panel. The executor processes all V2 `debug_log` entries and displays them in the UI.
    - **Activity Creation Pipeline (V2)**: A capability `criar_atividade` (V2) recebe os campos gerados via `capabilityResultsMap`, persiste no banco de dados via `/api/atividades`, e emite eventos para a ConstructionInterface via `agente-jota-progress` com tipos: `construction:activity_progress`, `construction:activity_completed`, `construction:activity_error`, e `construction:all_completed`.
    - **Field Synchronization System**: Located at `src/features/schoolpower/construction/utils/activity-fields-sync.ts`, this system provides bidirectional mapping between AI-generated field names and form field names. The `syncSchemaToFormData` function converts AI output to modal-compatible format. The `useActivityAutoLoad` hook automatically loads generated fields when editing activities, with enhanced diagnostic logging, fallback search by activity type if direct ID search fails, and multiple localStorage key support including `generated_content_{activityId}`.
    - **V2 Pipeline Status** (Updated Jan 2026):
      - All 4 capabilities are now ENABLED in V2_CAPABILITIES: pesquisar → decidir → gerar → criar
      - Field names are confirmed aligned across: `gerar-conteudo-schema.ts`, `activity-fields-sync.ts`, `EditActivityModal.tsx`, and `schoolPowerActivities.json`
      - The executor now emits `construction:activities_ready` immediately after `decidir_atividades_criar` completes, ensuring the ConstructionInterface receives activities regardless of `criar_atividade` result
      - **criar_atividade** now does NOT save to database - it only marks activities as completed for UI display. Database persistence was removed to prevent failures.
      - Example validated mappings: tese-redacao uses `temaRedacao`, `objetivo`, `nivelDificuldade`, `competenciasENEM`; flash-cards uses `theme`, `topicos`, `numberOfFlashcards`
    - **Activity Catalog**: Located at `src/features/schoolpower/data/schoolPowerActivities.json`, this catalog defines all available activity types with their required/optional fields. The `campos_obrigatorios` field names must match exactly the `requiredFields` names in `gerar-conteudo-schema.ts` for content generation to work correctly.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages the transformation of lessons to a published state.

### System Design Choices
The architecture prioritizes a modular component design using shadcn/ui patterns. Data persistence is managed with Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime enables live features. The system is configured for VM deployment, ensuring backend state maintenance and real-time database connections. A dynamic section system ensures synchronization between template selection and section display, and lesson creation sessions are isolated to prevent data bleed.

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