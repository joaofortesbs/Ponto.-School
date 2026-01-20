# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its core purpose is to enhance educational engagement and efficiency through features like an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects, blur backgrounds, and a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text). It uses custom, responsive typography, smooth CSS animations, and a mobile-first approach. Accessibility features include presentation mode with multi-language translation, dynamic font sizing, and voice reading support.

#### School Power Chat Interface Design (v3.0 - Jan 2026)
- **JotaAvatarChat Component**: Custom avatar component at `src/features/schoolpower/interface-chat-producao/components/JotaAvatarChat.tsx` with entrance animation (scale 0.8→1), gradient border on hover, subtle lift animation, and uses `/images/avatar11-sobreposto-pv.webp`. No constant pulse animation.
- **AssistantMessage**: Free-flowing text without card background, vertically aligned with avatar. Avatar + "Jota" label positioned to the left of message text.
- **NarrativeReflectionCard**: Plain text without container card, icons, or badges. Typewriter effect preserved. Tone-based colors (celebratory=emerald, cautious=amber, explanatory=blue, reassuring=purple). "Ver mais..." expand for long texts.
- **PlanActionCard**: Ultra-modern glassmorphism design with radial gradients, smooth hover micro-interactions on steps, numbered step indicators, and single "Aplicar Plano" button (EDIT button removed).
- **ProgressiveExecutionCard (ObjectiveCard)**: Fully rounded cards with collapse/expand toggle. ChevronDown icon animates on toggle. Click to minimize/expand capabilities.
- **CapabilityCard**: Fully rounded (rounded-full) inline cards with dynamic width (w-fit). Vertically aligned (no ml-8 offset). Uses capability-specific icons from `CapabilityIcons.ts` instead of generic checkmarks.
- **CapabilityIcons.ts**: New file at `src/features/schoolpower/interface-chat-producao/components/CapabilityIcons.ts` maps capability names to Lucide icons with specific colors (Search=blue, Brain=purple, Sparkles=amber, Hammer=orange, etc.).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A resilient multi-model fallback system primarily uses Groq API (Llama 3.3 70B, Llama 3.1 8B, Llama 4 Scout) and Google Gemini API as a final fallback. This system manages content generation, lesson planning, and AI assistance with automatic retries and intelligent model switching.
- **AI Performance Optimizations (Jan 2026)**:
    - **In-Memory Cache**: Response caching with TTL (5 min), max 100 entries, hash-based key generation for query deduplication.
    - **Query Complexity Classifier**: Automatic classification (simple/moderate/complex) routes queries to optimal models for faster responses.
    - **Context Window Optimization**: Memory manager limits context to 8000 chars max, truncates old history intelligently.
    - **Input Validation**: Prompt sanitization, max 4000 chars with truncation, always returns fallback for invalid inputs.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profiles.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with dynamic templates.
    - **Multi-Agent Lesson Orchestrator v4.0**: A robust, observable, and self-correcting system that coordinates AI agents through a 7-step workflow for lesson generation, including educational activities, with built-in StepLogger, StepValidation, and AutoRecoveryEngine.
    - **Agente Jota Chat Interface**: A chat-based interface for School Power featuring an orchestrator, planner, executor, and 3-layer memory manager. It can search, research, decide, generate, and create activities with a 4-layer Anti-Hallucination System, Rules Engine, and an isolated typewriter effect. It includes a Debug System for AI actions, a Construction Interface, and Context-aware Content Generation.
    - **3-Call Context Architecture (Jan 2026)**: A unified context management system with 3 specialized AI calls:
        - **Call 1 - Initial Response**: Exclusive call for user input interpretation and first response generation. Uses `initial-response-service.ts` with specialized prompts for contextual understanding.
        - **Call 2 - Development Card**: Single context window for ALL reflections within the development card. Maintains cumulative context across all steps/objectives for narrative coherence. Uses `development-card-service.ts` with `ContextManager` integration.
        - **Call 3 - Final Response**: Consolidated response analyzing all execution results and reflections. Uses `final-response-service.ts` to generate comprehensive completion messages.
        - **Context Manager**: Central `context-manager.ts` maintains macro context across all calls, storing input interpretation, step results, capability metrics, and progressive summaries. Prevents context overflow with intelligent summarization.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central CapabilityExecutor for managing execution, validation, and context enrichment. A DataConfirmation System ensures critical checks. The V2 capability system uses a `capabilityResultsMap` for data flow between `pesquisar`, `decidir`, `gerar`, and `criar` capabilities, with robust failure handling.
    - **Conversation Context Flow**: The full conversation history is maintained and passed to AI generation for contextualized content.
    - **Content Generation Pipeline (V2)**: The `gerar_conteudo_atividades` capability generates AI content for selected activities, validates and normalizes fields, stores results, and emits debug logs.
    - **Activity Creation Pipeline (V2)**: The `criar_atividade` capability persists generated activity fields to the database and emits events for UI updates on the ConstructionInterface.
    - **Field Synchronization System**: Provides bidirectional mapping between AI-generated field names and form field names, located at `src/features/schoolpower/construction/utils/activity-fields-sync.ts`. It includes a `useActivityAutoLoad` hook for loading generated fields and specific processors for various activity types to handle field conversions.
    - **Type-Safe Field Handling**: Utilizes `safeToString()` and `hasValue()` to manage mixed data types in form fields, preventing runtime errors.
    - **V2 Pipeline Enhancements**: All 4 capabilities are enabled, field names are aligned, `criar_atividade` performs real AI generation per activity, and a 7-Phase Individual Construction process ensures detailed logging and multi-key localStorage persistence.
    - **Auto-Build System with ModalBridge**: An event-driven architecture using `ModalBridge.ts` and `constructionEventBus.ts` orchestrates the build process. A BuildController manages progressive visual construction of activities within the `EditActivityModal`, with visual states indicating progress and errors. Pre-generated content detection skips AI regeneration when sufficient fields are already present. Field normalization unifies naming conventions.
    - **StorageSyncService v2.0**: A centralized service at `src/features/schoolpower/services/storage-sync-service.ts` manages activity storage across multiple key prefixes, tracks origin and pipeline metadata, and provides event emission for UI synchronization.
    - **Activity Catalog**: `schoolPowerActivities.json` defines activity types and required fields, ensuring alignment with content generation schemas.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.

### System Design Choices
The architecture emphasizes a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections. Dynamic section synchronization and isolated lesson creation sessions prevent data conflicts.

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