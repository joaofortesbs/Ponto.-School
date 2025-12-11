# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform built with React and TypeScript, designed to offer personalized learning experiences and streamline educational workflows. It provides tools for students and teachers, including an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and its core "School Power" feature for automated lesson planning. The platform aims to enhance education through AI integration and a comprehensive suite of features.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Modern glass-morphism effects with blur backgrounds.
- **Color Scheme**: Primary Orange (#FF6B00), Secondary Blue (#0D00F5), Dark Navy text (#0A2540), with a dark background of #000822 and component backgrounds of #030C2A.
- **Typography**: Custom typography with responsive font scales.
- **Animations**: Smooth CSS transitions and micro-interactions.
- **Responsiveness**: Mobile-first approach with adaptive layouts.
- **Accessibility**: Comprehensive presentation mode with multi-language translation, dynamic font sizing (12px-24px), and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints (email, profiles, activities).
- **Core Features**:
    - **School Power**: AI-powered lesson planning with contextualization cards and action plan generation, supporting .docx and PDF downloads.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation and interactive materials.
    - **Daily Login System**: Gamified experience with streaks and rewards.
    - **School Points**: Persisted and editable points system.
    - **Calendário School**: Calendar event management with draggable modals, event persistence, icon/tag system, and class/turma selector.
    - **Optimized Navigation**: Core dashboard pages are eagerly loaded for instant switching; infrequently used pages are lazy-loaded. Authenticated routes use optimistic rendering with background revalidation.
- **AI Integration**: Primarily uses Google Gemini API for content generation, lesson planning, and the Epictus AI assistant.
- **Authentication & User Management**: Supabase handles authentication, user sessions, role-based access, and profile management.

### System Design Choices
- **Modular Component Architecture**: Reusable UI components based on shadcn/ui patterns.
- **Data Persistence**: Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets.
- **Real-time**: Supabase Realtime for live features like chat and user presence.
- **Deployment**: Configured for VM deployment, maintaining backend state and supporting real-time database connections.
- **Performance Optimization**: Includes code splitting, lazy loading for non-critical assets, image optimization (WebP conversion), critical CSS inlining, and optimized cache headers.

## External Dependencies

### Core Services
- **Supabase**: BaaS for PostgreSQL database, authentication, real-time, and file storage.
- **Google Gemini AI**: Primary AI service for content generation, lesson planning, and educational assistance.
- **Neon PostgreSQL**: External managed PostgreSQL database.
- **SendGrid**: Email service for notifications.

### Development & Build Tools
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS**: CSS processing.
- **ESLint**: Code linting.

### UI Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Pre-built components based on Radix UI and Tailwind.
- **React Hook Form**: Form handling and validation.
- **Lucide React**: Icon library.

### Specialized Libraries
- **@dnd-kit** & **React Beautiful DnD**: Drag and drop functionality.
- **@tsparticles**: Particle effects.
- **Axios**: HTTP client for API communication.
- **docx**, **jsPDF**, **file-saver**: For activity download functionality.
- **bcrypt**: For password hashing.