# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its core purpose is to enhance educational engagement and efficiency through features like an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The platform aims to revolutionize education through AI, offering tailored content and efficient tools for a global market, aspiring to become a leader in intelligent learning solutions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects, blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading support. The School Power Chat Interface uses custom avatar components and ultra-modern glassmorphism designs for interactive cards.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration - LLM Orchestrator v3.0 Enterprise**: A unified, resilient multi-model cascade system providing a scalable and protected approach to AI content generation using a 5-tier architecture with 7 models. It includes circuit breakers, rate limiters, retry mechanisms with exponential backoff, input sanitization, smart routing, and an in-memory cache system.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning managed by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, a 3-layer memory manager, and a 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation.
    - **Multi-Turn Conversation System**: Enables unlimited consecutive plan executions within the same chat session.
    - **3-Call Context Architecture**: A unified context management system with specialized AI calls for initial response, development card reflections, and final response generation.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing execution, validation, and context enrichment across `pesquisar`, `decidir`, `gerar`, `criar`, and `salvar` capabilities.
    - **Database Persistence Pipeline**: The `salvar_atividades_bd` capability persists created activities to the Neon database through a 4-phase architecture: COLLECT, VALIDATE, PERSIST, and VERIFY.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields to the database and emits events for UI updates.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names.
    - **Auto-Build System with ModalBridge**: An event-driven architecture orchestrates the build process, managing progressive visual construction of activities within the `EditActivityModal`.
    - **StorageSyncService v2.0**: A centralized service for managing activity storage, tracking origin and pipeline metadata, and emitting events for UI synchronization.
    - **StorageOrchestrator Enterprise System**: A 3-layer storage architecture utilizing IndexedDB, Zustand/Memory cache, and localStorage to prevent `QuotaExceededError`. It features automatic layer selection, garbage collection, emergency cleanup, and global guards.
    - **Activity Version System**: Dual-version system categorizing activities into Interactive and Text Version for various activity types, with robust AI response parsing and professional 6-section fallback content generation.
    - **Component Protection Systems (Blindagem)**: Enterprise-grade isolation and protection for core components with Bounded Context Architecture, protected files, contracts, sanitizers, dedicated storage namespaces, multi-layer pipelines, and rigorous validation.
      - **Interactive Activities**: Lista de Exercícios (`sp_le_v2_`), Flash Cards (`sp_fc_v2_`), Quiz Interativo (`sp_qi_v1_`)
      - **Text-Version Activities (NEW - Jan 2026)**: Plano de Aula (`sp_pa_v1_`, `text_content_plano-aula_`) and Sequência Didática (`sp_sd_v1_`, `text_content_sequencia-didatica_`) now have enterprise-grade protection with:
        - Immutable contracts (readonly interfaces): `PlanoAulaInputContract`, `PlanoAulaOutputContract`, `SequenciaDidaticaInputContract`, `SequenciaDidaticaOutputContract`
        - Sanitizers: `PlanoAulaSanitizer`, `SequenciaDidaticaSanitizer`
        - Dedicated storage namespaces with legacy compatibility
        - RULES.md documentation: `PLANO_AULA_RULES.md`, `SEQUENCIA_DIDATICA_RULES.md`
        - Key files: `src/features/schoolpower/activities/plano-aula/contracts.ts`, `src/features/schoolpower/activities/sequencia-didatica/contracts.ts`
    - **Quiz Interativo Unified Pipeline v1.0**: 6-layer processing pipeline with multi-alias recognition (questions/questoes/perguntas/quiz.perguntas) ensuring AI-generated content is correctly loaded regardless of schema variations. Features detailed debug logging and normalization to standard 'questions' format across localStorage, Zustand store, and database sources.
    - **Quiz Interativo Generation Pipeline (CRITICAL FIX)**: The `generateQuizInterativo` function in `generateActivityContent.ts` now properly imports and uses `QuizInterativoGenerator` (same pattern as Flash Cards). Key files:
      - `generateActivityContent.ts` (lines 345-420): Uses dynamic import of `QuizInterativoGenerator`, prepares quiz data, calls `generator.generateQuizContent()`, with fallback content on error.
      - `ActivityViewModal.tsx`: Uses `processQuizWithUnifiedPipeline` for robust multi-source loading with alias normalization.
      - `QuizInterativoGenerator.ts`: Real AI generator that produces structured quiz content.
      - `unified-quiz-pipeline.ts`: 6-layer processing with validation, normalization, and multi-source support.
    - **Text-Version Activities Generation Pipeline (CRITICAL FIX - Jan 2026)**: The `generatePlanoAula` and `generateSequenciaDidatica` functions in `generateActivityContent.ts` now properly store content using `storeTextVersionContent()` and emit `text-version:generated` events to sync UI. This fix ensures auto-generated content (via `criar_atividade` capability) displays correctly in the Text Version Interface, matching the manual "Construir atividade" flow:
      - Key pattern: After successful AI generation, call `storeTextVersionContent(activityId, activityType, generatedResult)` to save in `text_content_{type}_{id}` storage key
      - Emit event: `window.dispatchEvent(new CustomEvent('text-version:generated', { detail: { activityId, activityType, success: true } }))`
      - Return flags: Include `isTextVersion: true` in the return object for proper routing
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Powers System v2.0 (Feb 2026)**: Virtual currency for AI capabilities with per-action pricing, now with database sync:
      - **Daily Allowance**: 300 Powers renewed at 19:00 (America/Sao_Paulo timezone)
      - **Pricing Model**: Per-action charges (not per-base) to support scalable expansion
      - **Current Prices**: `criar_atividade` = 70 Powers/activity, all other capabilities = 0 (free)
      - **Architecture**: Centralized config (`src/config/powers-pricing.ts`) + service (`src/services/powersService.ts`)
      - **Database Sync**: Dual-layer persistence with localStorage cache + Neon DB (`powers_carteira` column in `usuarios` table)
      - **API Endpoints**: 
        - `GET /api/perfis/powers`: Fetch current Powers balance from database
        - `PATCH /api/perfis/powers`: Update Powers with operations (deduct/add/reset)
      - **Event System**: Emits `powers:updated` AND `schoolPointsUpdated` events for reactive UI sync
      - **Persistence**: localStorage for immediate response + background sync to Neon DB
      - **Integration Points**: 
        - `api/perfis.js`: Powers API endpoints
        - `criar-atividade.ts`: Charges after successful activity creation
        - `PerfilCabecalho.tsx`: Header display with real-time Powers balance
        - `SeuUsoSection.tsx`: Displays balance and transaction history (ExtratoAtividadesCard)
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.
    - **Modal Geral da Conta (Account Modal System - Feb 2026)**: Centralized user account management modal replacing the legacy `/profile` page. Features:
      - Glassmorphism design with lateral navigation (SidebarModal)
      - Three expandable sections: Perfil, Configurações, Seu Uso
      - **Configurable Overlay System**: Uses `MODAL_CONFIG.overlay` for precise control over opacity (0.6) and blur (4px) effects
      - **Close Button Positioning**: Configurable via `MODAL_CONFIG.closeButton` (top: 8px, right: 8px) for extreme corner placement
      - **Avatar Loading Priority Chain**: tempAvatarPreview → userAvatarUrl (cache) → profile.imagem_avatar → profile.profile_image → Dicebear fallback
      - **Real-time Avatar Sync**: Listens to `userAvatarUpdated` event for cross-component synchronization
      - **User Profile Display**: Shows nome_completo (title) and nome_usuario (subtitle) from Neon database below banner with instant cache loading
      - **Seu Uso Section (Feb 2026)**: Complete usage statistics interface with:
        - UsageStats interface using `number | null` for proper empty state handling
        - Four stat cards: tempo de uso, atividades criadas, sequência atual, school points
        - New user detection based on actual data presence (activities > 0, streak > 0, or points > 0)
        - Empty state card with encouragement message for new users
        - Member info card with date and plan badge (conditionally rendered)
        - No fake data - shows "--" when real data is null/undefined
      - Logo integration with Ponto. School branding
      - Key files: `src/components/modal-geral/ModalGeral.tsx`, `SidebarModal.tsx`, `sections/PerfilSection.tsx`, `sections/ConfiguracoesSection.tsx`, `sections/SeuUsoSection.tsx`
      - Triggered from PerfilCabecalho dropdown menu

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