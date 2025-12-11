# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Built with React and TypeScript, it offers features such as an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning through its "School Power" feature. The platform aims to enhance educational engagement and efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects and blur backgrounds. The color scheme includes Primary Orange (#FF6B00), Secondary Blue (#0D00F5), and Dark Navy text (#0A2540). It utilizes custom, responsive typography, smooth CSS animations, and a mobile-first responsive design. Accessibility is a key focus, offering a presentation mode with multi-language translation, dynamic font sizing (12px-24px), and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js handles API endpoints for email, profiles, and activities.
- **AI Integration**: Primarily uses the Google Gemini API for content generation, lesson planning, and the Epictus AI assistant.
- **Authentication & User Management**: Supabase is used for authentication, user sessions, role-based access, and profile management.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with contextualization cards and action plan generation, supporting .docx and PDF downloads.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation and interactive materials.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized school points system.
    - **Calendário School**: Comprehensive calendar event management including draggable events, icon/tag system, class/turma selector, settings menu (share/export/integrations/templates), and an optimized planning modal with category filters and templates.

### System Design Choices
The architecture emphasizes a modular component design using shadcn/ui patterns. Data persistence is managed with Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime enables live features such as chat. The system is configured for VM deployment, ensuring backend state maintenance and real-time database connections.

## External Dependencies

### Core Services
- **Supabase**: Backend-as-a-Service for PostgreSQL database, authentication, real-time capabilities, and file storage.
- **Google Gemini AI**: Main AI service for content generation, lesson planning, and educational assistance.
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
- **shadcn/ui**: Pre-built components leveraging Radix UI and Tailwind.
- **React Hook Form**: For form handling and validation.
- **Lucide React**: Icon library.

### Specialized Libraries
- **@dnd-kit** & **React Beautiful DnD**: For drag-and-drop functionality.
- **@tsparticles**: For particle effects.
- **Axios**: HTTP client for API communication.
- **docx**, **jsPDF**, **file-saver**: For generating and downloading activity documents.
- **bcrypt**: For password hashing.