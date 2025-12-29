# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform built with React and TypeScript, designed to provide personalized learning experiences and streamline educational workflows. It offers features such as an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning through its "School Power" feature. The platform aims to enhance educational engagement and efficiency for students and teachers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects, blur backgrounds, and a color scheme including Primary Orange (#FF6B00), Secondary Blue (#0D00F5), and Dark Navy text (#0A2540). It utilizes custom, responsive typography, smooth CSS animations, and a mobile-first responsive design. Accessibility features include a presentation mode with multi-language translation, dynamic font sizing (12px-24px), and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js handles API endpoints.
- **AI Integration**: Utilizes a resilient multi-model fallback system with Groq API (4 models in cascade) and Google Gemini API as final fallback for content generation, lesson planning, and AI assistance.
    - **Multi-Model Cascade System** (api/groq.js):
      - Primary: Llama 3.3 70B Versatile
      - Fallback 1: Llama 3.1 8B Instant (fast, high limit)
      - Fallback 2: Llama 4 Scout 17B (preview)
      - Fallback 3: Qwen3 32B (alternative)
      - Final Fallback: Google Gemini 2.0 Flash via REST API
    - Automatic retry with exponential backoff per model
    - Rate limit detection and intelligent model switching
    - Full observability: logs model used, attempts, provider in metadata
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profile management.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with 5 dynamic templates (Aula Ativa, Aula Expositiva, Aula Socioemocional, Aula Técnica, Aula SE) that generate custom section structures.
    - **Multi-Agent Lesson Orchestrator v4.0**: Highly reliable, observable, and self-correcting system. Coordinates AI agents through a 7-step workflow to generate lessons with embedded educational activities. Features:
      - **Step 1**: Context transmission - validates template, subject, and sections
      - **Step 2**: Content generation - AI generates lesson content FOR TEACHERS (guidance, tips, suggestions on how to conduct each section) using conversational tone, addressing teachers directly with tips and strategies
      - **Step 3**: Activity suggestions - external agent analyzes content, reviews schoolPowerActivities.json, generates activity suggestions for each eligible section using multi-model cascade
      - **Step 4**: Consolidated School Power inputs - generates ONE unified input with 6 structured fields:
        - Mensagem inicial (Input) - O que deve ser feito
        - 📚 Matérias e temas serão trabalhados
        - 🎯 Qual o público-alvo
        - ⚠️ Restrições ou preferências específicas
        - 📅 Período de entrega ou datas importantes
        - 📝 Outras observações importantes
      - **Step 5**: Activity persistence - saves generated activities to Neon database
      - **Step 6**: Block attachment - maps activities to lesson sections
      - **Step 7**: Lesson finalization - completes lesson and makes it available
      - **StepLogger**: Structured logging per step with chronological events, sub-phases, and validation checks. Logs accessible via dropdown in WorkflowModal.
      - **StepValidation**: Validates each step with specific checks. Step 4 validates: inputGenerated, inputHasFields, inputIsConsolidated.
      - **AutoRecoveryEngine**: Intelligent retry with exponential backoff, error classification, and smart correction. Max 3 retries per step.
      - **Multi-Model Cascade**: All AI-intensive steps use Groq models (Llama 3.3 70B → Llama 3.1 8B → Llama 4 Scout → Qwen3 32B) with Gemini 2.0 Flash fallback.
      - **Clear Logging**: Step 4 displays only the consolidated School Power input fields with values - no unnecessary debug information.
      - Real-time progress via SSE streaming with detailed logs sent to frontend.
      - Integrated into single "Gerar aula" button - generates content AND activities in one flow.
      - **WorkflowModal**: 
        - Close button (X) disabled during processing - only enabled on completion or error
        - Modal remains open after all 7 steps complete - user must explicitly close it
        - Supports log inspection and review before proceeding
      - **SuggestedActivity Cards**: Section blocks display suggested activity cards with 4 visual states:
        - Pending: dashed border, 60% opacity, gray tones, Sparkles icon
        - Generating: spinner animation, 85% opacity, yellow tones, yellow badge
        - Generated: solid border, full opacity, emerald tones, CheckCircle icon, hover effect enabled
        - Error: red dashed border, full opacity, red tones, AlertCircle icon, error badge
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized school points system.
    - **Calendário School**: Comprehensive calendar event management with draggable events, category filters, and templates.
    - **Lesson Publishing System**: Transforms lessons to a published state with confirmation and persistence.
    - **Agente Jota Chat Interface** (NEW - Dec 2025): Modern chat-based interface for School Power replacing the card-based contextualization flow.
      - **Architecture**: `/features/schoolpower/interface-chat-producao/` for UI, `/agente-jota/` for agent brain
      - **Flow**: idle → chat (on first prompt) → agent creates plan → user approves → step-by-step execution
      - **Components**:
        - ChatLayout: Main container managing the entire chat experience
        - MessageStream: Renders chat messages with animations
        - ExecutionPlanCard: Visual card showing execution plan with step status
        - ContextModal: Shows agent's working memory during execution
      - **Agent Brain** (`/agente-jota/`):
        - orchestrator.ts: Coordinates entire flow, manages sessions
        - planner.ts: Creates structured execution plans from user prompts
        - executor.ts: Executes plan steps by calling capabilities
        - memory-manager.ts: 3-layer memory (working, short-term, long-term)
      - **4 Capabilities Core** (Pipeline obrigatório: BUSCAR → DECIDIR → CRIAR):
        - **Cap 1: pesquisar_atividades_conta** - Busca no Neon PostgreSQL atividades já criadas pelo professor
        - **Cap 2: pesquisar_atividades_disponiveis** - Consulta catálogo JSON local (schoolPowerActivities.json)
        - **Cap 3: decidir_atividades_criar** - IA analisa contexto e decide estrategicamente quais criar
        - **Cap 4: criar_atividade** - Preenche campos com IA e salva no banco
      - **Session Management**: Automatic cleanup of expired sessions (10min interval, 1hr max age)
      - Uses multi-API cascade fallback system for AI calls
      - **Anti-Hallucination System** (3-layer validation):
        - Layer 1: DataValidationService validates turmas/atividades before LLM processing
        - Layer 2: Structured prompts with few-shot examples and strict rules
        - Layer 3: HallucinationLogger for audit trail and post-verification
      - **Rules Engine** (`/agente-jota/regras-orientacoes-ia/`):
        - capability-dependencies.json: Dependency graph between capabilities
        - execution-rules.json: Mandatory, conditional, validation rules
        - common-sequences.json: Pre-defined flows for common objectives
        - RulesEngine class: Query methods for rule application
      - **Isolated Typewriter Effect**:
        - useStableTypewriter hook with refs for state isolation
        - React.memo with custom comparison prevents re-renders
        - Typewriter continues uninterrupted when parent re-renders
        - Adaptive speed: 35ms (short) to 8ms (long) per character
      - **Debug System (NEW - Dec 2025)**:
        - AIDebugEntry types: info, action, decision, discovery, error, warning, reflection
        - DebugStore (Zustand): Manages debug logs per capability
        - DebugIcon: Clickable icon in each capability card with badge
        - DebugModal: Timeline visualization with filters, export, technical data
        - Narrativas em português explicando ações da IA em linguagem humana
      - **Construction Interface (NEW - Dec 2025)**:
        - ConstructionInterface.tsx: Visual card during criar_atividade
        - Shows activities being built with real-time progress
        - ActivityCard: Individual activity with status (waiting/building/completed/error)
        - Auto-start option, progress bars, expandable built data
        - Conditional rendering in ExecutionPlanCardEnhanced

### System Design Choices
The architecture emphasizes a modular component design using shadcn/ui patterns. Data persistence is managed with Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime enables live features. The system is configured for VM deployment, ensuring backend state maintenance and real-time database connections. A critical architectural decision involves the dynamic section system, where `sectionConfigs` are dynamically generated based on `sectionOrder` for each template, ensuring perfect synchronization between template selection and section display. Lesson creation sessions are isolated using a session ID system and state reset functions to prevent data bleed.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini AI**: Main AI service for content generation and assistance.
- **Groq API**: AI service for fast lesson content generation.
- **Neon PostgreSQL**: Managed external PostgreSQL database.
- **SendGrid**: Email service for notifications.

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