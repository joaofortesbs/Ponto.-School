# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform focused on personalized learning and streamlining educational workflows for students and teachers. It aims to enhance engagement and efficiency through an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The platform's vision is to revolutionize education with AI, providing tailored content and efficient tools to become a leader in intelligent learning solutions globally.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. The School Power Chat Interface uses custom avatar components and ultra-modern glassmorphism designs.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and an in-memory cache.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning managed by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, a 3-layer memory manager, a 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation.
    - **Multi-Turn Conversation System**: Supports unlimited consecutive plan executions within a single chat session.
    - **3-Call Context Architecture**: A unified context management system with specialized AI calls for initial response, development card reflections, and final response generation.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing execution, validation, and context enrichment across key capabilities (`pesquisar`, `decidir`, `gerar`, `criar`, `salvar`).
    - **Database Persistence Pipeline**: The `salvar_atividades_bd` capability persists created activities to the Neon database through a 4-phase architecture: COLLECT, VALIDATE, PERSIST, and VERIFY.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields to the database and emits events for UI updates.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names.
    - **Auto-Build System with ModalBridge**: An event-driven architecture orchestrates the progressive visual construction of activities within the `EditActivityModal`.
    - **StorageSyncService v2.0**: A centralized service for managing activity storage, tracking origin and pipeline metadata, and emitting events for UI synchronization.
    - **StorageOrchestrator Enterprise System**: A 3-layer storage architecture utilizing IndexedDB, Zustand/Memory cache, and localStorage to prevent `QuotaExceededError`, featuring automatic layer selection, garbage collection, emergency cleanup, and global guards.
    - **Activity Version System**: Dual-version system categorizing activities into Interactive and Text Version, with robust AI response parsing and professional fallback content generation.
    - **Component Protection Systems (Blindagem)**: Enterprise-grade isolation for core components with Bounded Context Architecture, protected files, contracts, sanitizers, dedicated storage namespaces, multi-layer pipelines, and rigorous validation. This applies to Interactive Activities (Lista de Exercícios, Flash Cards, Quiz Interativo) and Text-Version Activities (Plano de Aula, Sequência Didática).
    - **Quiz Interativo Unified Pipeline v1.0**: A 6-layer processing pipeline with multi-alias recognition for AI-generated quiz content, ensuring correct loading regardless of schema variations, with normalization to a standard format.
    - **Quiz Interativo Generation Pipeline**: The `generateQuizInterativo` function now properly imports and uses `QuizInterativoGenerator` for structured quiz content generation.
    - **Text-Version Activities Generation Pipeline**: Functions like `generatePlanoAula` and `generateSequenciaDidatica` correctly store content using `storeTextVersionContent()` and emit `text-version:generated` events for UI synchronization.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Powers System v5.0 ENTERPRISE DB-ONLY (Feb 2026)**: Virtual currency for AI capabilities with per-action pricing and enterprise-grade synchronization with Neon DB. 
      - **Centralized Configuration**: All Powers values are configured in `src/config/powers-pricing.ts` (frontend) and `api/config/powers.js` (backend). To change initial Powers for new users, edit `initialPowersForNewUsers` in the config files.
      - **New User Provisioning**: New users automatically receive 300 Powers (configurable) upon account creation. The `powers_carteira` column in the `usuarios` table has a DEFAULT of 300.
      - **DB-ONLY Strategy v3.2 (Feb 2026)**: Database is the SINGLE SOURCE OF TRUTH. localStorage is NEVER used as source of balance data.
        - Cache is automatically cleared in constructor and before each DB fetch
        - `persistBalance()` is blocked until DB sync is confirmed (`dbFetchCompleted=true`)
        - `balanceReady` flag tracks if balance came from DB (UI shows "..." until true)
        - `isBalanceReady()` method for UI components to check if balance is reliable
        - Aggressive retry system (2s, 5s delays) when DB is temporarily unavailable
        - `initialize()` and `forceRefreshFromDatabase()` never fallback to localStorage
        - PerfilCabecalho and SeuUsoSection only display values when `isBalanceReady()=true`
        - **CRITICAL FIX v3.3**: `chargeForCapability()` now FORCES database fetch BEFORE any charge if `balanceReady=false`. If the DB fetch fails or email is unavailable, the charge is **ABORTED** with an error message instead of proceeding with the default value. This guarantees that charges only occur when the DB balance is confirmed.
      - **FAST-PATH Optimization v2.1 (Feb 2026)**: Powers now loaded instantly from profile API response.
        - `findProfileByEmail()` includes `powers_carteira` in query result
        - `setBalanceFromProfile()` method sets Powers instantly without second API call
        - PerfilCabecalho uses FAST-PATH when `profile.powers_carteira` is available
        - Eliminates latency from separate `/api/perfis/powers` call
        - **CRITICAL FIX v2.1**: Fixed cache corruption bug where `useUserInfo.ts` was overwriting `userProfile` cache with partial data (without `powers_carteira`), causing FAST-PATH to fail. Now uses separate cache key `userProfile_schoolpower_cache`.
        - Cache validation now checks for `powers_carteira` presence - cache without it is automatically invalidated and re-fetched from Neon
        - `refreshProfileInBackground()` now fetches from Neon (not Supabase) to ensure `powers_carteira` is included
      - **Race Condition Resolution**: Added `dbFetchCompleted` flag to track if the database fetch succeeded. If `initialize()` is called before email is available, it will re-fetch from DB on subsequent calls when email becomes available.
      - **Synchronization Flow**: (1) `PerfilCabecalho` loads profile with `powers_carteira`, (2) FAST-PATH: `setBalanceFromProfile()` sets Powers instantly, (3) UI shows value immediately. Fallback: calls `forceRefreshFromDatabase(email)`.
      - **Features**: daily allowance, pending transactions queue, 30-second polling system for DB→App sync, synchronous charges for App→DB sync, event-based decoupling (no circular dependencies), lazy polling initialization, auto-initialization on email event, email override in forceRefreshFromDatabase(), automatic polling start on email override, multiple email propagation paths (localStorage cache, event listener, PerfilCabecalho direct call with email parameter), detailed logging for debug, retry on DB failure, and guard against duplicate listeners.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.
    - **Modal Geral da Conta (Account Modal System)**: Centralized user account management modal featuring glassmorphism design, lateral navigation, expandable sections (Perfil, Configurações, Seu Uso), configurable overlay and close button positioning, avatar loading priority chain, real-time avatar sync, and a complete usage statistics interface.

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