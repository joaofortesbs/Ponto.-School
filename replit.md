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

## Replit Environment Setup

### Development Workflow
- **Workflow Name**: App
- **Command**: `node api/server.js & npm run dev`
- **Port Configuration**: 
  - Frontend: Port 5000 (0.0.0.0) - serves the React application
  - Backend: Port 3001 (localhost) - serves the API endpoints
- **Output Type**: Webview for live preview

### Server Configuration
- **Frontend Server**: Vite dev server configured to:
  - Bind to 0.0.0.0:5000 for Replit proxy compatibility
  - Proxy `/api` requests to backend on localhost:3001
  - Enable HMR (Hot Module Replacement) on port 5000
- **Backend Server**: Express.js configured to:
  - Listen on localhost:3001 (internal only)
  - Handle API routes: email, profiles, activities
  - Initialize Neon database connection on startup

### Deployment Configuration
- **Type**: VM (stateful deployment)
- **Build Command**: `npm run build`
- **Run Command**: `node api/server.js & npm run preview`
- **Reason for VM**: Maintains backend state and supports real-time database connections

### Environment Variables Required
Located in `.env` file:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional)
- `PORT`: Backend server port (default: 3001)
- `SENDGRID_API_KEY`: SendGrid API key for emails (optional)

### Key Files
- `vite.config.ts`: Vite configuration with proxy setup
- `api/server.js`: Backend Express server
- `package.json`: Scripts and dependencies
- `.env`: Environment variables (not committed to git)

### Recent Changes (October 2025)
- Configured Vite to use 0.0.0.0:5000 for Replit compatibility
- Updated backend to bind to localhost:3001
- Set up combined workflow running both frontend and backend
- Configured VM deployment for stateful application