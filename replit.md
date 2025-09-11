# Replit.md

## Overview

Ponto. School is an educational platform that transforms teaching through AI-powered tools. This React + TypeScript application, built with Vite, provides comprehensive educational solutions including an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and the core School Power feature for automated lesson planning. The platform serves both students and teachers with personalized learning experiences and modern educational workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and hot module replacement
- **Styling**: Tailwind CSS with custom design system using shadcn/ui components for consistent UI patterns
- **Component Strategy**: Modular component architecture with reusable UI components in shadcn/ui format
- **Build Tool**: Vite with SWC for fast compilation and modern JavaScript features
- **State Management**: Zustand stores for global state management (e.g., schoolPowerStore for School Power workflows)

### Core Features Architecture
- **School Power**: AI-powered lesson planning system with contextualization cards and action plan generation
- **Study Groups**: Real-time chat system with member management and group settings
- **Digital Notebooks**: Note-taking system with AI integration for content generation
- **Smart Worksheets**: Interactive learning materials with AI assistance
- **Daily Login System**: Gamified experience with streaks and rewards

### AI Integration
- **Primary AI**: Google Gemini API for content generation, lesson planning, and educational assistance
- **AI Assistant**: Epictus IA - personalized AI tutor with contextualized responses
- **Content Generation**: Automated creation of educational materials, quizzes, and lesson plans
- **Personalization**: AI-driven content adaptation based on user preferences and learning patterns

### Authentication & User Management
- **Platform**: Supabase for authentication, user sessions, and profile management
- **Session Handling**: Real-time user status tracking with online/offline indicators
- **User Roles**: Support for students, teachers, and administrators with role-based access

### Data Architecture
- **Database**: Supabase PostgreSQL for structured data storage
- **Real-time Features**: Supabase Realtime for live chat, user presence, and collaborative features
- **File Storage**: Supabase Storage for user-generated content, avatars, and educational materials
- **Local Storage**: Browser storage for temporary data and user preferences

### UI/UX Design System
- **Design Framework**: Modern glass-morphism effects with blur backgrounds
- **Color Scheme**: Orange (#FF6B00) primary, blue (#0D00F5) secondary, dark navy (#0A2540) text
- **Typography**: Custom typography system with responsive font scales
- **Animations**: Smooth transitions using CSS animations and micro-interactions
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### Core Services
- **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, real-time subscriptions, and file storage
- **Google Gemini AI**: Primary AI service for content generation, lesson planning, and educational assistance
- **SendGrid**: Email service for notifications and communications (with client-side fallback)

### Development & Build Tools
- **Vite**: Build tool and development server with fast HMR
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **PostCSS**: CSS processing with autoprefixer

### UI Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives for dialogs, dropdowns, forms, and navigation
- **shadcn/ui**: Pre-built component library built on Radix UI with Tailwind styling
- **React Hook Form**: Form handling with validation (@hookform/resolvers)
- **Lucide React**: Icon library (@radix-ui/react-icons)

### Specialized Libraries
- **@dnd-kit**: Drag and drop functionality for interactive UI elements
- **@tsparticles**: Particle effects and animations for enhanced visual appeal
- **React Beautiful DnD**: Additional drag-and-drop capabilities for complex interactions
- **Axios**: HTTP client for API communications

### Development Dependencies
- **ESLint**: Code linting and quality enforcement
- **Font Awesome**: Additional icon library for diverse iconography
- **UUID**: Unique identifier generation for data entities

### Infrastructure
- **Hosting**: Configured for deployment on various platforms
- **Environment Management**: Support for multiple environments (development, production)
- **API Server**: Express.js server for handling email services and API endpoints