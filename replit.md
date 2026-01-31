# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Its core purpose is to enhance educational engagement and efficiency through features like an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning ("School Power").

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
    - **Lista de Exercícios Blindagem System v2.1.2**: Enterprise-grade isolation and protection system with a Bounded Context Architecture, protected files, contracts, a sanitizer, dedicated storage namespace, a 6-layer pipeline, and specific rules for modifications. It includes schema-aware JSON extraction and rigorous validation.
    - **Flash Cards Blindagem System**: Enterprise-grade isolation and protection system with a Bounded Context Architecture, protected files, contracts, a sanitizer, dedicated storage namespace, and specific rules for modifications.
    - **Study Groups**: Real-time chat and member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized point system.
    - **Calendário School**: Comprehensive calendar event management.
    - **Lesson Publishing System**: Manages lesson publication.

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

## Component Protection System (Blindagem)

### Protected Components
The following components have protection rules to prevent accidental breakage:

| Component | Rules File | Version |
|-----------|-----------|---------|
| Lista de Exercícios | `src/features/schoolpower/activities/lista-exercicios/LISTA_EXERCICIOS_RULES.md` | v2.1.2 |
| Quiz Interativo | `src/features/schoolpower/activities/quiz-interativo/QUIZ_INTERATIVO_RULES.md` | v1.0.0 |
| Flash Cards | `src/features/schoolpower/activities/flash-cards/FLASH_CARDS_RULES.md` | Active |

### AI Orchestration Guide
- **Location**: `src/features/schoolpower/AI_ORCHESTRATION_GUIDE.md`
- **Purpose**: Provides mandatory guidelines for the Replit Agent when modifying School Power components
- **Key Principle**: Changes to one component should NEVER affect other components

### Required Actions Before Modifying Protected Components
1. Read the component's RULES.md file
2. Follow the modification rules listed
3. Test according to the checklist
4. Document changes in the history section

## Recent Changes (Jan 31, 2026)
- **Critical Fix - Theme Extraction System v2 (Root Cause Identified and Fixed)**:
  - **Problem**: Quiz questions were showing user prompts (e.g., "Crie um quiz de matemática sobre frações") as question text
  - **Root Cause Found**: In `autoBuildService.ts`, when `customFields` didn't have a theme, it fell back to `activity.title` directly, which contained the user's full prompt
  - **Solution**: Created robust theme extraction system with 4 helper functions:
    - `extractThemeFromTitle()` - Main function with multi-pattern detection and extraction
    - `sanitizeTheme()` - Cleans extracted themes (removes years, punctuation)
    - `isValidTheme()` - Validates themes (rejects if contains imperatives, too short/long)
    - `getSubjectDefaultTheme()` - Returns subject-appropriate fallback themes
  - **Handles**: Command verbs, "Quiz de X" patterns, colon/dash formats, multi-word subjects, long titles
  - **Test Cases Supported**:
    - "Crie um quiz de matemática sobre frações para o 6º ano" → "Frações"
    - "Quiz de matemática sobre frações para o 6º ano" → "Frações"
    - "Matemática: frações – 6º ano" → "Frações"
    - "Frações" → "Frações" (valid short theme, used as-is)
  - **Files Modified**: `src/features/schoolpower/construction/services/autoBuildService.ts`
  - **Applied in**: Both quizData preparation and fallback section
- **Critical Fix - Quiz Interativo Persistence Flow**: Fixed issue where quiz questions were not being saved to localStorage
  - Root cause: `syncSchemaToFormData` ignores `questions` field → `persistActivityToStorage` only saves mapped fields → questions lost
  - Solution: Added direct localStorage persistence in `gerar_conteudo_atividades.ts` handler for quiz-interativo
  - Storage structure: `constructed_quiz-interativo_${id}` with `{ success: true, data: { title, questions, totalQuestions, timePerQuestion, ... } }`
  - Also updates `activity_${id}` and `constructedActivities` global for compatibility
- **Improved Fallback System in autoBuildService.ts**: Replaced generic fallback with contextualized question banks
  - Now uses real question banks per subject (Matemática, Português, default) instead of using `activity.title` as question content
  - Prevents issue where user prompts appeared as quiz questions
- **Key Lesson Learned**: 
  - Interactive activities (quiz-interativo, lista-exercicios, flash-cards) require direct persistence of complex data structures (questions, cards, exercicios) that are not handled by the generic `persistActivityToStorage` function
  - User-facing titles/prompts should NEVER be used directly as content themes - always extract or infer the actual topic

## Changes (Jan 30, 2026)
- **Quiz Interativo Blindagem v1.0.0**: Enterprise-grade protection system for Quiz Interativo activity
  - Created QUIZ_INTERATIVO_RULES.md with comprehensive modification rules
  - Implemented robust multi-path JSON parsing (bracket matching, validation, multiple extraction paths)
  - Added contextualized fallback with real question banks per subject (Matemática, Português, História, Ciências, Geografia)
  - Added QuizQuestion interface aliases (texto, alternativas, resposta_correta, feedback) for AI response compatibility
  - Added mandatory generatedAt field for timestamp tracking
  - Updated AI_ORCHESTRATION_GUIDE.md with Quiz Interativo reference
- **Critical Fix - LLM Orchestrator Models**: Corrected invalid Groq model IDs that were causing Agente Jota failures
  - Removed deprecated models: `gemma2-9b-it`, `mixtral-8x7b-32768`, `llama3-70b-8192`, `llama-3-groq-70b-tool-use`
  - Fixed Llama 4 Scout ID: `llama-4-scout-17b-16e-instruct` → `meta-llama/llama-4-scout-17b-16e-instruct`
  - Added `llama-3.3-70b-specdec` and `gemini-2.0-flash-lite`
  - Reduced model count from 10 (with invalid IDs) to 7 valid models
- **Critical Fix - TypeError Crashes**: Fixed two runtime errors causing chat failures
  - Fixed `TypeError: calls.slice is not a function` in DebugPanel.tsx - added safe array validation for localStorage data
  - Fixed `TypeError: this.logs.push is not a function` in geminiDebugLogger.ts - added array validation when restoring logs
  - Fixed type errors in checkAPIStatus function (DebugPanel.tsx)
- **System Status**: LLM Orchestrator v3.0, Agente Jota chat, and Quiz Interativo now functioning correctly

## Previous Changes (Jan 29, 2026)
- **v2.1.2 Lista de Exercícios Blindagem**: Updated with comprehensive protection rules
- **AI Orchestration Guide**: Created to guide Replit Agent on safe modifications
- **Fallback JSON Schema Fix**: Local fallback now generates compatible JSON structure