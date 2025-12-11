## Overview

Ponto. School is an AI-powered educational platform built with React and TypeScript, designed to offer personalized learning experiences and streamline educational workflows. It provides a comprehensive suite of tools for students and teachers, including an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and the core "School Power" feature for automated lesson planning. The platform aims to enhance learning through technology and intelligent automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Modern glass-morphism effects with blur backgrounds.
- **Color Scheme**: Primary Orange (#FF6B00), Secondary Blue (#0D00F5), Dark Navy text (#0A2540).
- **Typography**: Custom typography with responsive font scales.
- **Animations**: Smooth CSS transitions and micro-interactions.
- **Responsiveness**: Mobile-first approach with adaptive layouts.
- **Accessibility**: Comprehensive presentation mode with multi-language translation (via Google Gemini), dynamic font sizing (12px-24px), and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js for API endpoints (email, profiles, activities).
- **Core Features**:
    - **School Power**: AI-powered lesson planning with contextualization cards and action plan generation, supporting .docx and PDF exports.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation and interactive materials.
    - **Daily Login System**: Gamified experience with streaks and rewards.
    - **School Points**: Persisted, editable, and synchronized school points system.
    - **Calendário School**: Calendar event management with draggable modals, event persistence, icon/tag system, and full edit/drag-to-move functionality.
    - **AI Integration**: Primarily uses Google Gemini API for content generation, lesson planning, and the Epictus AI assistant.
- **Authentication & User Management**: Supabase for authentication, user sessions, role-based access, and profile management.

### System Design Choices
- **Modular Component Architecture**: Reusable UI components following shadcn/ui patterns.
- **Data Persistence**: Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets.
- **Real-time**: Supabase Realtime for live features like chat and user presence.
- **Deployment**: Configured for VM deployment, maintaining backend state and supporting real-time database connections.
- **Performance Optimization**: Code splitting, vendor chunking, image optimization (WebP conversion), critical CSS inlining, resource hints, and optimized cache headers.
- **Navigation Optimization**: Direct imports for core pages for instant navigation, optimistic rendering with background revalidation for protected routes, and removal of Suspense from dashboard routes.

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
- **Sharp**: High-performance image processing.

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