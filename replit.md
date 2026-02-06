# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. It aims to revolutionize education by leveraging AI to offer tailored content and efficient tools, aspiring to become a global leader in intelligent learning solutions. Key capabilities include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. The School Power Chat Interface uses custom avatar components and ultra-modern glassmorphism designs.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and an in-memory cache.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions (`/api/perfis/login`, `/api/perfis/register`), and Supabase for file storage. Auth state is managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning managed by a robust, observable, and self-correcting Multi-Agent Lesson Orchestrator (v4.0) through a 7-step workflow.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, 3-layer memory manager, 4-layer Anti-Hallucination System, Rules Engine, Debug System, and Context-aware Content Generation. Supports multi-turn conversations.
    - **3-Call Context Architecture**: Unified context management with specialized AI calls for initial, development card reflection, and final responses.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor` for managing key capabilities (`pesquisar`, `decidir`, `gerar`, `criar`, `salvar`, `criar_arquivo`).
    - **Database Persistence Pipeline**: The `salvar_atividades_bd` capability persists created activities to the Neon database through a 4-phase architecture (COLLECT, VALIDATE, PERSIST, VERIFY).
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields and emits UI update events.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated and form field names.
    - **Auto-Build System with ModalBridge**: Event-driven architecture for progressive visual construction of activities within the `EditActivityModal`.
    - **StorageSyncService v2.0**: Centralized service for activity storage, metadata tracking, and UI synchronization events.
    - **StorageOrchestrator Enterprise System**: 3-layer storage architecture (IndexedDB, Zustand/Memory, localStorage) with automatic layer selection, garbage collection, and emergency cleanup to prevent `QuotaExceededError`.
    - **Activity Version System**: Dual-version system for Interactive and Text Version activities, with AI response parsing and professional fallback content.
    - **Component Protection Systems (Blindagem)**: Enterprise-grade isolation for core components using Bounded Context Architecture, protected files, contracts, sanitizers, dedicated storage namespaces, multi-layer pipelines, and rigorous validation.
    - **Quiz Interativo Unified Pipeline v1.0**: 6-layer processing pipeline with multi-alias recognition for AI-generated quiz content, ensuring correct loading regardless of schema variations.
    - **Text-Version Activities Generation Pipeline**: Functions like `generatePlanoAula` and `generateSequenciaDidatica` correctly store content and emit `text-version:generated` events.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Powers System v4.1 UNIFIED CONTEXT**: Virtual currency for AI capabilities with per-action pricing and enterprise-grade synchronization with Neon DB. Managed by `ProfileContext` (located at `src/contexts/ProfileContext.tsx`), which centralizes user profile and powers data. Authentication is detected via `localStorage.getItem('auth_token')` or `neon_authenticated === 'true'`. New users receive 300 Powers by default.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.
    - **Modal Geral da Conta (Account Modal System)**: Centralized user account management modal with glassmorphism design, lateral navigation, and usage statistics.
    - **Activity Title Extraction System v2.0**: Robust title extraction in ActivityViewModal with normalized comparison, unified theme helper (`extractTheme`), and prioritized source resolution (customFields → consolidatedFields → originalData → localStorage). Handles plano-aula special formatting and filters generic labels via accent/hyphen-normalized comparison.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v2.0**: First-class V2 capability registered under the CRIAR macro-category (pattern: CRIAR/criar_arquivo), appearing in the DevModeCard during execution with full observability. Generates 5 artifact types (`dossie_pedagogico`, `resumo_executivo`, `roteiro_aula`, `relatorio_progresso`, `guia_aplicacao`) via LLM with specialized prompts per type. Intelligent type detection based on context keywords. Architecture: Planner includes `criar_arquivo` as final pipeline step → Executor runs it as V2 capability with CapabilityInput/CapabilityOutput → criarArquivoV2 generates artifact → dispatches `artifact:generated` CustomEvent → ChatLayout listener → addArtifactCard to Zustand chatState → MessageStream renders minimalist ArtifactCard (file icon + title + subtitle, left-aligned) → click opens ArtifactViewModal. Key files: `src/features/schoolpower/agente-jota/capabilities/CRIAR_ARQUIVO/` (types, artifact-generator, criar-arquivo-v2, registry, index), `src/features/schoolpower/interface-chat-producao/components/ArtifactCard.tsx` (minimalist card: FileText icon left, title+subtitle right, no badges/stats/gradients), `src/features/schoolpower/interface-chat-producao/components/ArtifactViewModal.tsx` (full-screen modal with tabbed sidebar navigation, section rendering, copy functionality). Artifact failures are isolated and non-critical (do not break the main pipeline).

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