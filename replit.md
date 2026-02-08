# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform providing personalized learning experiences and streamlining educational workflows for students and teachers. It aims to revolutionize education by offering tailored content and efficient tools, aspiring to become a global leader in intelligent learning solutions. Key capabilities include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and an in-memory cache.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage. Auth state managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture (v5.0) — autonomous AI agent that freely decides which capabilities to use based on request context (not a fixed pipeline). Supports activity creation, explanations, text generation, lesson plans, research, and more. Auto-execution flow: plan is created and executed immediately without approval button. Plans are born with 'em_execucao' status.
    - **Mente Orquestradora Architecture**: Replaced fixed 5-step pipeline (PESQUISAR→DECIDIR→CRIAR→SALVAR→CRIAR_ARQUIVO) with autonomous capability selection. Key changes: planning-prompt.ts uses multi-intent examples, planner.ts has intelligent fallback (criar_atividades vs texto_livre), executor.ts uses V2_REGISTRY Map, ChatLayout.tsx auto-executes plans via handleExecutePlanAuto/executeAgentPlanInternal, initial-response-service.ts recognizes 8 intent types. Reflections removed (saves 3-4 AI calls per interaction).
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing key capabilities.
    - **Database Persistence Pipeline**: Persists created activities to the Neon database through a 4-phase architecture (COLLECT, VALIDATE, PERSIST, VERIFY).
    - **Content Generation Pipeline (V2)**: Generates AI content for selected activities.
    - **Activity Creation Pipeline (V2)**: Persists generated activity fields and emits UI update events.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names.
    - **Auto-Build System with ModalBridge**: Event-driven architecture for progressive visual construction of activities within the `EditActivityModal`.
    - **StorageSyncService v2.0**: Centralized service for activity storage, metadata tracking, and UI synchronization events.
    - **StorageOrchestrator Enterprise System**: 3-layer storage architecture (IndexedDB, Zustand/Memory, localStorage) with automatic layer selection, garbage collection, and emergency cleanup.
    - **Activity Version System**: Dual-version system for Interactive and Text Version activities, with AI response parsing and professional fallback content.
    - **Component Protection Systems (Blindagem)**: Enterprise-grade isolation for core components using Bounded Context Architecture, protected files, contracts, sanitizers, dedicated storage namespaces, multi-layer pipelines, and rigorous validation.
    - **Quiz Interativo Unified Pipeline v1.0**: 6-layer processing pipeline with multi-alias recognition for AI-generated quiz content.
    - **Text-Version Activities Generation Pipeline**: Functions correctly store content and emit `text-version:generated` events.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Powers System v4.1 UNIFIED CONTEXT**: Virtual currency for AI capabilities with per-action pricing and enterprise-grade synchronization with Neon DB, managed by `ProfileContext`.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.
    - **Modal Geral da Conta (Account Modal System)**: Centralized user account management modal with glassmorphism design, lateral navigation, and usage statistics.
    - **Activity Title Extraction System v2.0**: Robust title extraction in ActivityViewModal with normalized comparison and prioritized source resolution.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v2.0**: Generates 5 artifact types (`dossie_pedagogico`, `resumo_executivo`, `roteiro_aula`, `relatorio_progresso`, `guia_aplicacao`) via LLM with specialized prompts. `normalizeArtifactType()` maps ~20 free-text AI variations to valid types, preventing crashes when AI sends non-enum values like "explicação das atividades". Includes an ArtifactViewModal for display, featuring Notion/Manus-inspired design, inline horizontal mini-lines TOC, drag-and-drop block reordering, Notion-style floating inline formatting toolbar with "Turn Into" functionality, fullscreen mode toggle, and print functionality.
    - **Text Version Modal (`Modal-Versao-Texto`)**: Replaces the old ContentExtractModal with the ArtifactViewModal interface for text-version activities. Uses a wrapper pattern that converts raw text content into ArtifactData sections and renders via ArtifactViewModal, inheriting all its features (editable blocks, TOC, fullscreen, print, drag-and-drop). Located at `src/features/schoolpower/components/Modal-Versao-Texto/`.
    - **Centralized Overlay Config** (`src/config/overlay.ts`): Shared overlay configuration for all modal backdrops (ArtifactViewModal, ModalGeral). Controls opacity, blur, z-index (9999), and transition settings from a single source of truth.

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