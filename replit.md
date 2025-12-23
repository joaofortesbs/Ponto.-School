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
- **AI Integration**: Utilizes Google Gemini API and Groq API (Llama 3.3 70B) for content generation, lesson planning, and AI assistance.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profile management.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with 5 dynamic templates (Aula Ativa, Aula Expositiva, Aula Socioemocional, Aula Técnica, Aula SE) that generate custom section structures.
    - **Multi-Agent Lesson Orchestrator**: Coordinates AI agents through a 7-step workflow to generate lessons with embedded educational activities. Uses existing `lesson-generator.js` for content generation (consolidated, no duplication) plus `ActivitySuggestionAgent` and `ActivityGenerationAgent` for activities. Real-time progress via SSE streaming. Integrated into the "Gerar aula" button.
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