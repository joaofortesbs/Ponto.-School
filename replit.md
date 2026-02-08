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
    - **School Power**: AI-powered lesson planning managed by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow, accessible via the Agente Jota Chat Interface. This interface includes an orchestrator, planner, executor, 3-layer memory manager, 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation, supporting multi-turn conversations.
    - **3-Call Context Architecture (v1.0 Legacy)**: Unified context management with specialized AI calls for initial, development card reflection, and final responses.
    - **Advanced Hybrid Agent System (v2.0)**: Next-generation agentic architecture located at `src/features/schoolpower/agente-jota/v2/` with 5 pillars:
      - **AgentLoop (ReAct Loop)**: Flexible Pensar→Agir→Observar loop replacing rigid pipeline. Max 10 iterations with stuck detection, timeout guardrails, and parallel action support.
      - **Context Engine**: KV-cache optimized context management with stable prompt prefixes, deterministic serialization, append-only context, and recoverable compression (inspired by Manus AI).
      - **Parallel Executor**: Fan-out/fan-in execution of independent capabilities using Promise.allSettled with dependency graph resolution.
      - **Persistent Memory**: PostgreSQL-backed memory (tables: `agent_memory`, `agent_sessions`) replacing localStorage. Cross-session preferences, auto-learning from interactions. API at `/api/agent-memory`.
      - **Verifier Agent**: Quality verification before delivery with pedagogical coherence checks, completeness validation, and auto-correction retry (inspired by Replit Agent 3).
      - **Orchestrator v2.0**: Unified comprehension (3 calls → 1), ReAct execution loop, verification, and final response. Reduces AI calls from 8-12 to 3-5 per flow.
      - **Feature Flag System**: Toggle v1/v2 via `localStorage` key `agente-jota-v2-enabled`. Console API: `window.__jotaV2.enable()`, `window.__jotaV2.disable()`, `window.__jotaV2.toggle()`.
      - **Adapter/Bridge Layer**: Type-compatible adapter (`v2/adapter.ts`) translating v2 responses to v1 interfaces (ProcessPromptResult, ExecutePlanResult, ProgressUpdate events). Ensures zero regression on v1.
      - **Orchestrator Switch**: Unified entry point (`v2/orchestrator-switch.ts`) imported by ChatLayout.tsx. Routes to v1 or v2 orchestrator based on feature flag state.
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
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v2.0**: Generates 5 artifact types (`dossie_pedagogico`, `resumo_executivo`, `roteiro_aula`, `relatorio_progresso`, `guia_aplicacao`) via LLM with specialized prompts. Includes an ArtifactViewModal for display, featuring Notion/Manus-inspired design, inline horizontal mini-lines TOC, drag-and-drop block reordering, Notion-style floating inline formatting toolbar with "Turn Into" functionality, fullscreen mode toggle, and print functionality.
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