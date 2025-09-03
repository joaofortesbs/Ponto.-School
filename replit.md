# Overview

Ponto. School is an innovative educational platform designed to transform teaching through AI-powered pedagogical tools. The platform serves as a comprehensive ecosystem for educators, featuring the flagship "School Power" system that generates personalized educational materials, plans, and activities. Built with modern web technologies, it provides an interactive, gamified experience for both teachers and students with features like study groups, digital notebooks, intelligent annotations, and AI-driven content creation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite with SWC for fast compilation and hot module replacement
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **State Management**: Zustand for lightweight state management across the application
- **Routing**: Client-side routing with dynamic page transitions
- **Animations**: Custom CSS animations and transitions for enhanced user experience

## Backend Architecture
- **Database**: Supabase (PostgreSQL) for data persistence with real-time capabilities
- **Authentication**: Supabase Auth for user management and session handling
- **Real-time Features**: Supabase Realtime for live chat and collaborative features
- **File Storage**: Supabase Storage for user-generated content and media assets

## AI Integration
- **Primary AI**: Google Gemini API for educational content generation and personalization
- **Content Generation**: Dynamic creation of lesson plans, quizzes, study materials, and annotations
- **Personalization**: Context-aware AI that adapts content based on user preferences and educational needs

## Key Design Patterns
- **Component-Based Architecture**: Modular React components with clear separation of concerns
- **Custom Hooks**: Reusable logic patterns for data fetching, form handling, and UI state
- **Event-Driven Communication**: Real-time updates using Supabase subscriptions
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
- **Mobile-First Responsive Design**: Tailwind breakpoints ensuring cross-device compatibility

## Data Management
- **Schema Design**: Normalized database structure for users, groups, annotations, and educational content
- **Caching Strategy**: Client-side caching for frequently accessed data
- **Validation**: Comprehensive form validation using React Hook Form with Zod schemas
- **Error Handling**: Centralized error management with user-friendly fallbacks

# External Dependencies

## Core Services
- **Supabase**: Primary backend-as-a-service for database, authentication, real-time features, and file storage
- **Google Gemini API**: AI service for educational content generation and intelligent tutoring
- **SendGrid**: Email service for notifications and communication features

## UI and Styling
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide Icons**: Icon library for consistent visual elements
- **Font Awesome**: Additional icon set for specialized educational icons

## Development Tools
- **TypeScript**: Type system for improved developer experience and code reliability
- **ESLint**: Code linting for consistent code quality
- **Vite**: Modern build tool with fast development server
- **PostCSS**: CSS processing for Tailwind CSS compilation

## Interactive Features
- **DND Kit**: Drag and drop functionality for interactive learning components
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation for form schemas
- **Axios**: HTTP client for API communications

## Specialized Libraries
- **TSParticles**: Particle effects for engaging visual experiences
- **React Beautiful DND**: Advanced drag-and-drop for study organization
- **UUID**: Unique identifier generation for data integrity
- **Dagre**: Graph layout algorithms for educational content visualization