# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform providing personalized learning experiences and streamlining educational workflows for students and teachers. Its primary goal is to revolutionize education through tailored content and efficient tools, aiming to become a global leader in intelligent learning solutions. Key features include an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern, glass-morphism inspired design with blur backgrounds, a defined color scheme (Primary Orange, Secondary Blue, Dark Navy text), custom responsive typography, and smooth CSS animations. It adopts a mobile-first approach and includes accessibility features like presentation mode with multi-language translation, dynamic font sizing, and voice reading. All UI elements adhere to a unified design system.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints.
- **AI Integration**: A unified, resilient multi-model cascade system (LLM Orchestrator v3.0 Enterprise) with a 5-tier architecture across 7 models, including circuit breakers, rate limiters, retry mechanisms, input sanitization, smart routing, and in-memory caching. The core AI agent, "Mente Orquestradora Architecture v7.0," features autonomous capability selection, a supreme unified context engine (`Context Engine v2.0`), `SessionStore` v2.0 with `InteractionLedger`, `ContextAssembler`, `ConversationCompactor`, `GoalReciter`, and `SmartRouter v1.2`. This includes system message separation for LLMs and a `SmartRouter` for intelligent request routing. Route-specific system prompts are used for various AI tasks.
- **Authentication & User Management**: Hybrid system using Neon PostgreSQL for user data and sessions, and Supabase for file storage.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with "Mente Orquestradora" architecture, supporting activity creation, explanations, text generation, lesson plans, and research. Includes BNCC curriculum alignment via `pesquisar_bncc` capability and quality reference questions via `pesquisar_banco_questoes` capability. Both are visible RAG capabilities that appear in the development card during activity generation for transparency. **BNCC RAG v2.0**: Complete coverage of all 9 Ensino Fundamental subjects (Matemática, Língua Portuguesa, Ciências, História, Geografia, Arte, Educação Física, Ensino Religioso, Língua Inglesa) with ~1,312 unique habilidades. Data organized in modular files under `bncc-data/` with an index aggregator. All search limits removed (no maxResults, no maxHabilidades caps). Includes backtracking fallback when text filters return 0 results and comprehensive component alias resolution. **BNCC Pipeline Guarantee v1.0** (Feb 2026): `ensureBnccExecution()` auto-executes pesquisar_bncc when the AI planner omits it, guaranteeing 100% BNCC coverage for all EXECUTAR activities. V2 context enrichment injects `bncc_context` into `gerar_conteudo_atividades`, `decidir_atividades_criar`, and `criar_arquivo` capabilities. Artifact Generator now receives and uses BNCC habilidades in document prompts for full textual document coverage.
    - **MenteMaior**: Unified inner monologue using the ReAct pattern.
    - **Structured Response System**: Collects created items using `[[ATIVIDADES]]` and `[[ARQUIVO:titulo]]` markers.
    - **API-First Architecture (V2)**: Uses standardized contracts and a central `CapabilityExecutor`.
    - **Database Persistence Pipeline**: A 4-phase pipeline (COLLECT, VALIDATE, PERSIST, VERIFY) for persisting activities.
    - **ContentSyncService**: In-memory event-driven singleton for real-time synchronization of AI-generated content.
    - **Agentic Artifacts System (CRIAR_ARQUIVO) v5.0**: Generates 10 types of pedagogical artifacts with intelligent routing.
    - **Ponto. Flow v2.0**: AI-driven Automatic Package Delivery System that uses Gemini structured output (JSON) for intelligent document selection via MAD methodology (Metodologia de Antecipação de Dor). The AI analyzes teacher context, created activities, and pedagogical needs to strategically choose 2-4 complementary documents. Includes deterministic regex fallback for resilience. Activity classification enforces that activities NEVER appear in the Documentos Complementares section (reserved for artifacts only). Callout post-processing strips emoji callouts from the complementos section.
    - **Powers System v4.1**: Virtual currency for AI capabilities with per-action pricing.
    - **Calendário School Multi-View System**: Portal-rendered calendar panel with 4 view modes, using a Strategy Pattern for event display.
    - **AI Calendar Management (gerenciar_calendario) v1.1**: Comprehensive AI-powered calendar management system with a mini-agent architecture for autonomous decision-making loops for viewing, analyzing availability, editing, deleting, and creating events.
    - **`decidir_atividades_criar` v3.1**: Production-hardened decision capability for activity creation with a 7-layer architecture: Layer 0 (Gemini Function Calling with schema-enforced structured output), Layer 1 (tolerant JSON parsing with key normalization), Layer 2 (system prompt separation with retry loops + contamination detection), Layer 3 (soft validation + auto-repair), Layer 4 (smart context-aware keyword fallback with interactive activity preference), Layer 5 (pipeline/template field integrity), and a decision-aware local fallback that generates valid JSON decision structures when all APIs are unavailable. Interactive activity preference: when the teacher requests exercises, quiz, or flash cards, the system prioritizes the interactive versions (lista-exercicios, quiz-interativo, flash-cards) and complements with varied textual activities.
    - **Final Response Service v2.0**: Hybrid deterministic and AI-driven final response generation for the EXECUTAR path, classifying activities into pedagogical phases, building structured responses, and using AI for strategic paragraphs with robust fallback mechanisms.

### System Design Choices
The architecture features a modular component design based on shadcn/ui patterns. Data persistence uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime supports live features. The system is designed for VM deployment to maintain backend state and real-time database connections, with dynamic section synchronization and isolated lesson creation sessions.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini API**: AI service for content generation and assistance.
- **Groq API**: AI service for fast lesson content generation.
- **Neon PostgreSQL (Replit)**: Primary data store.
- **SendGrid**: Email notification service.