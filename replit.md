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
    - **Multi-Agent Lesson Orchestrator v3.0**: Highly reliable, observable, and self-correcting system. Coordinates AI agents through a 7-step workflow to generate lessons with embedded educational activities. Features:
      - **Step 1**: Context transmission - validates template, subject, and sections
      - **Step 2**: Content generation - AI generates lesson content for all sections
      - **Step 3**: Activity suggestions - external agent analyzes content, reviews schoolPowerActivities.json, generates activity suggestions for each eligible section using multi-model cascade
      - **Step 4**: School Power inputs - generates structured prompts for School Power API with fields: initialMessage, subjects, targetAudience, restrictions, deliveryPeriod, observations
      - **Step 5**: Activity persistence - saves generated activities to Neon database
      - **Step 6**: Block attachment - maps activities to lesson sections
      - **Step 7**: Lesson finalization - completes lesson and makes it available
      - **StepLogger**: Structured logging per step with chronological events, sub-phases, and validation checks. Logs accessible via dropdown in WorkflowModal.
      - **StepValidation**: Blocks step completion until all required sub-phases and validation checks pass. Implements hard lock - lesson cannot finalize until all 7 steps are truly complete.
      - **AutoRecoveryEngine**: Intelligent retry with exponential backoff, error classification, and smart correction. Max 3 retries per step.
      - **Multi-Model Cascade**: All AI-intensive steps use Groq models with Gemini fallback. Steps 3-4 use generateWithCascade() for resilience.
      - Real-time progress via SSE streaming with detailed logs sent to frontend.
      - Integrated into single "Gerar aula" button - generates content AND activities in one flow.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized school points system.
    - **Calendário School**: Comprehensive calendar event management with draggable events, category filters, and templates.
    - **Lesson Publishing System**: Transforms lessons to a published state with confirmation and persistence.

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