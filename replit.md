# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform focused on personalized learning and streamlining educational workflows for students and teachers. It aims to enhance engagement and efficiency through an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power"). The platform's vision is to revolutionize education with AI, providing tailored content and efficient tools to become a leader in intelligent learning solutions globally.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (Feb 2026)

### Critical Bug Fix: ProfileContext Infinite Loop (Feb 4, 2026)
- **Root Cause**: useEffect in ProfileContext.tsx had `profile?.email` in dependencies, causing infinite re-renders when profile was updated
- **Symptoms**: Dozens of GET /api/perfis requests per second, browser freezing, platform becoming unresponsive
- **Solution**: Implemented useRef pattern to avoid stale closures while keeping empty dependency array
  - Added refs: `profileRef`, `loadProfileRef`, `fetchProfileByEmailRef`, `updatePowersRef`
  - Separate useEffects to keep refs updated when values change
  - Main event listener effect runs once on mount using refs for current values
- **Result**: Reduced from ~50+ API calls/second to 1-2 calls per page load

### Activity Title Display Fix (Feb 4, 2026)
- **Root Cause**: `generateThemeFromObjective()` function was using user's prompt as activity theme/title with minimal cleaning
- **Symptoms**: Activity titles in Chat Jota showing full user prompts like "Criar algumas atividade sobre como escalar campanhas de tráfego pago..."
- **Solution**: Enhanced title generation with intelligent extraction and truncation
  - Improved `generateThemeFromObjective()` in `gerar-conteudo-atividades.ts`:
    - Added more regex patterns to remove command words (crie, gere, monte, elabore, prepare, etc.)
    - Extract key themes from "sobre X" patterns
    - Limit titles to 50 characters maximum
    - Added fallback themes for additional subjects (Marketing, Tráfego Pago, Negócios)
  - Enhanced `getGeneratedTitle()` in `ConstructionInterface.tsx`:
    - Added `cleanTitle()` helper with smart truncation and "sobre X" pattern extraction
    - Preserves word boundaries when truncating to 50 characters
  - Updated `getActivityTitle()` in `ActivityViewModal.tsx`:
    - Added same `cleanActivityTitle()` function with identical logic for consistency
    - Both modal and construction interface now use matching title cleaning (50 char limit)
- **Result**: Activity titles now display clean, professional, max 50-character titles consistently across all views

### Environment Cleanup (Feb 4, 2026)
- Removed unused Python 3.11 module (freed resources)
- Cleaned up obsolete workflows from .replit (from 20+ to 3 essential workflows)

### Performance Optimization v1.1
- **Lazy Loading in App.tsx**: Converted 12+ page imports to dynamic lazy loading (Dashboard, Agenda, Biblioteca, Carteira, MeusPontos, Epictus-IA, etc.)
- **Dev-Only Components Optimization**: DebugPanel (695 lines) and GeminiApiMonitor now load only in development mode via React.lazy conditional
- **Enhanced vite.config.ts**: Function-based manualChunks for better vendor splitting (react, ui, motion, icons, pdf, charts, dnd, particles, utils, forms, supabase)
- **Removed FloatingChatSupport.tsx** (6,459 lines): Fixed "Failed to fetch dynamically imported module" error
- **Removed unused dependencies** (~60MB savings): moment, three, lovable-tagger, tempo-devtools
- **Tree-shaking**: Enabled for production builds

### Performance Baseline (Pre-optimization)
- Lighthouse Score: 29/100
- FCP: 12.8s, LCP: 25.0s, TBT: 750ms
- Unused JavaScript: 9.1MB
- Total Payload: 27MB

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. The School Power Chat Interface uses custom avatar components and ultra-modern glassmorphism designs.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and an in-memory cache.
- **Authentication & User Management**: Hybrid system - Neon PostgreSQL handles user data and sessions via custom API (`/api/perfis/login`, `/api/perfis/register`), while Supabase is used for file storage. Auth state is stored in localStorage (`auth_token`, `neon_authenticated`, `userEmail`).
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
    - **Powers System v4.1 UNIFIED CONTEXT (Feb 2026)**: Virtual currency for AI capabilities with per-action pricing and enterprise-grade synchronization with Neon DB.
      - **ProfileContext Architecture (v4.1)**: Centralized React Context that manages both profile and Powers in a single source of truth.
        - `ProfileContext.tsx` located at `src/contexts/ProfileContext.tsx`
        - **CRITICAL FIX (Feb 2026)**: ProfileContext now uses localStorage for auth detection, NOT Supabase auth
        - Auth detection via: `localStorage.getItem('auth_token')` or `neon_authenticated === 'true'`
        - Email retrieval via: `getUserEmailFromLocalStorage()` with fallbacks (userEmail → powers_user_email → neon_user.email)
        - User ID retrieval via: `getUserIdFromLocalStorage()` with fallbacks (user_id → neon_user.id)
        - Single API call to `/api/perfis?email=...` fetches profile WITH `powers_carteira` included
        - `useProfile()` hook provides: `profile`, `powers`, `isLoading`, `isAuthenticated`, `refreshProfile()`, `updatePowers()`
        - `usePowers()` hook for components that only need Powers data
        - Automatic cache cleanup of legacy localStorage keys on mount
        - Versioned cache system (v4.1) with 5-minute TTL and `powers_carteira` validation
        - Stale-while-revalidate pattern: shows cache immediately, refreshes in background
        - Event-driven updates via `neon-login-success`, `powers:charged`, and `profile-updated` events
      - **useNeonAuth Event System**: Login and register functions dispatch `neon-login-success` event with email and profile for instant sync
        - Both login() and register() save: userEmail, powers_user_email, auth_token, user_id, neon_authenticated
        - Event `neon-login-success` dispatched with { email, profile } after successful auth
        - ProfileContext listens to this event and immediately updates profile/powers state
      - **Simplified PerfilCabecalho**: Now consumes ProfileContext directly instead of complex FAST-PATH/Fallback logic.
        - Reduced from 300 lines to ~200 lines
        - No direct profileService or powersService calls for display
        - Powers display: `powers !== null ? powers : (isLoading ? '...' : '0')`
      - **Centralized Configuration**: All Powers values are configured in `src/config/powers-pricing.ts` (frontend) and `api/config/powers.js` (backend).
      - **New User Provisioning**: New users automatically receive 300 Powers (configurable) upon account creation. The `powers_carteira` column in the `usuarios` table has a DEFAULT of 300.
      - **DB as Single Source of Truth**: Database is authoritative. Cache is only for performance optimization, not source data.
      - **PowersService Role**: Now focused on CHARGES only (deducting Powers), not display. Uses `powers:charged` event to notify ProfileContext of balance changes.
      - **Legacy Cleanup**: Automatic cleanup of old cache keys: `userProfile`, `userProfileCacheTime`, `powers_balance`, `modalGeral_powersData`, `modalGeral_seuUso_lastFetch`.
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