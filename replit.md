# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage. Auth state managed via localStorage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture (v5.0), an autonomous AI agent that dynamically selects capabilities based on request context. It supports activity creation, explanations, text generation, lesson plans, and research. Plans are auto-executed, starting with an 'em_execucao' status.
    - **Mente Orquestradora Architecture v7.0**: Autonomous capability selection with a supreme unified context engine. Key components include a 4-layer `Context Engine v2.0` for managing AI context, a `SessionStore` v2.0 with an `InteractionLedger` for permanent fact storage, `ContextAssembler` for optimized context building, `ConversationCompactor` for priority-based semantic compression, `GoalReciter` to prevent context drift, and `IntentClassifier` for routing user prompts.
    - **Deep Intent Analyzer (Jota AI Intelligence v2.0)**: Two-Stage Intent Decomposition system (Google Research pattern) with 15+ regex pattern groups extracting structured entities: turma, série, componente curricular, temas, cronograma, quantidade_atividades, BNCC habilidades, and pedagogical keywords. Stage 1 extracts raw entities; Stage 2 infers intenção_real, modo (EXECUTIVO/CONSULTIVO/CONVERSACIONAL), complexidade, tipo_entrega, and contexto_suficiente flag. Integrated into orchestrator → planner → artifact generator flow.
    - **System Prompt v2.0 (Executive Intent Protocol)**: Anti-literalism rules with "Teste do Professor Cansado" meta-rule, 7 execution rules (temas → EXECUTE, série → ADAPTE, cronograma → ORGANIZE), dynamic role assignment by série/componente, persistence rules for complete delivery, and proactivity rules (auto-organize by weekdays, include gabarito automatically).
    - **Gold Standard Library (Few-Shot Learning)**: 30+ creative activity examples organized by componente/série across all subjects (Math, Portuguese, Science, History, Geography, interdisciplinary). Each example has gancho_criativo (real-world hook), bloom_level (Taxonomy), estrutura, diferenciação, and formatação. Multi-stage filtering (component → série → type → themes) with Bloom diversity preference. Injected into both planner and artifact generator prompts.
    - **Planning Prompt v2.0**: Complex real-world scenarios including weekly planning (5 classes by day), bundles (aula+prova+rubrica), differentiation by level, and proactivity rules for automatic quantity/organization decisions.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern for improved step reflection.
    - **Structured Response System**: Collects created items (activities + artifacts) after execution, using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers for structured rendering of results in the UI.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting created activities to Neon DB.
    - **ContentSyncService (Live Sync)**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **ActivityStorageContract**: Centralized module for managing all `localStorage` persistence of activity content.
    - **Activity Content Sync (DB Fallback)**: Prioritizes local sources for activity content, falling back to the database when necessary.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts via LLM, including `documento_livre` and `atividade_textual`. The `atividade_textual` type uses a 3-layer intelligent routing system: Layer 1 detects interactive activities (quiz, flash card) and routes to standard pipeline; Layer 2 matches against 46+ specialized text-activity templates across 8 categories (assessments, games, organizers, writing, planning, communication, differentiation, engagement); Layer 3 auto-evolves new templates on-demand using AI-inferred structure with localStorage persistence. Templates include specialized pedagogical prompts, keyword detection, expected sections, and visual identity. The `TextActivityRegistry` provides smart indexing and the `AutoEvolutionEngine` tracks usage counts to identify most valuable auto-generated activities.
    - **Ponto. Flow**: Automatic Package Delivery System (Layer 6 in orchestrator) that generates complementary documents based on activity count and user context. Includes an `ArtifactViewModal` for displaying artifacts with advanced UI features. Supports documento_livre for standalone document generation without prior activities.
    - **Text Version Modal (`Modal-Versao-Texto`)**: Replaces old content modals, leveraging the `ArtifactViewModal` interface for text-version activities.
    - **Centralized Overlay Config**: Shared configuration for all modal backdrops.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Powers System v4.1 UNIFIED CONTEXT**: Virtual currency for AI capabilities with per-action pricing and synchronization with Neon DB.

### System Design Choices
The architecture features a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

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

### UI Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Pre-built components.
- **React Hook Form**: For form handling.
- **Lucide React**: Icon library.

### Specialized Libraries
- **@dnd-kit**: For drag-and-drop functionality.
- **Axios**: HTTP client.
- **bcrypt**: For password hashing.
- **Framer Motion**: For animations.