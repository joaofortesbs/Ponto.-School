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
- **AI Integration**: A resilient multi-model fallback system primarily uses Groq API (Llama 3.3 70B, Llama 3.1 8B, Llama 4 Scout) and Google Gemini API as a final fallback. This system includes automatic retries, intelligent model switching, in-memory caching, a query complexity classifier, context window optimization, and input validation.
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
    - **Lista de Exercícios Blindagem System (Jan 2026)**: Enterprise-grade isolation and protection system:
      - **Bounded Context Architecture**: Fully isolated module with dedicated contracts and sanitizers
      - **Protected Files**: `ListaExerciciosGenerator.ts`, `unified-exercise-pipeline.ts`, `ExerciseListPreview.tsx`, `useExerciseListSync.ts`
      - **Contracts**: `ExerciseListContract`, `QuestionContract`, `ExerciseListResponseContract` with readonly properties
      - **Sanitizer**: `ExerciseListInputSanitizer` validates ALL external data before processing
      - **Dedicated Storage Namespace**: Uses `sp_le_v2_` prefix to prevent storage collisions
      - **6-Layer Pipeline**: Normalization → Intelligent Extraction (7 fallback methods) → Validation → Synchronization → Testing → Progressive Fallback
      - **Agent Rules File**: `LISTA_EXERCICIOS_RULES.md` contains mandatory guidelines for any modifications
      - **Configuration**: `LISTA_EXERCICIOS_CONFIG` with version tracking and protection flags
    - **Flash Cards Data Flow (Fixed Jan 2026)**: Complete data propagation system for Flash Cards:
      - `buildActivityHelper.ts`: Extracts actual data from wrapper objects (`result.data || result`) before saving
      - Saves complete cards array to localStorage at `constructed_flash-cards_{id}`
      - Dispatches `activity-data-sync` event with full cards data for instant UI sync
      - `autoBuildActivities.ts`: Now calls BOTH `setActivityGeneratedFields` AND `setActivityBuiltData` to ensure data is available in multiple paths
      - Fallback chain in `ActivityViewModal`: localStorage → Zustand store (multi-path: `generated_fields` → `dados_construidos` → `campos_preenchidos`) → originalData (database)
      - ROOT CAUSE FIX: Previously data was saved to `dados_construidos` root but searched in `dados_construidos.generated_fields` - now both paths are populated and searched
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