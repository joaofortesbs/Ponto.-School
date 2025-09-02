# Overview

Ponto. School is a comprehensive educational platform built with React, TypeScript, and Vite. The platform focuses on transforming education through AI-powered tools, featuring intelligent lesson planning, note-taking systems, study groups, and gamified learning experiences. The application serves both students and teachers with personalized learning materials and automated educational content generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite with SWC for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI design
- **Component Structure**: Feature-based organization with modular components under `/src/features/`
- **State Management**: Zustand for global state management (evident from store patterns in attached files)
- **Routing**: Client-side routing for single-page application navigation

## Key Features & Components
- **School Power**: AI-powered lesson planning and educational content generation system
- **Digital Notebook**: Smart note-taking with AI-generated summaries and study materials
- **Study Groups**: Real-time collaborative learning spaces with chat functionality
- **Gamification**: Points system, daily login rewards, and interactive elements
- **Profile Management**: User authentication and personalized learning experiences

## Data Layer
- **Primary Database**: Supabase for user data, groups, notes, and real-time features
- **Real-time Features**: Supabase Realtime for live chat and collaboration
- **Local Storage**: Browser storage for temporary data and user preferences
- **File Storage**: Supabase Storage for user-uploaded content and assets

## AI Integration
- **Primary AI Service**: Google Gemini API for content generation and educational assistance
- **Use Cases**: Lesson plan creation, note summarization, personalized learning recommendations
- **Data Processing**: Structured prompts and validation systems for consistent AI outputs

## Authentication & Security
- **Auth Provider**: Supabase Auth for user management and session handling
- **Access Control**: Role-based permissions for different user types (students, teachers, admins)
- **Data Validation**: Client-side and server-side validation for form inputs and API requests

## Performance Optimizations
- **Code Splitting**: Component-level lazy loading for reduced initial bundle size
- **Asset Optimization**: Optimized images and static assets through Vite
- **Caching Strategy**: Browser caching and API response caching where appropriate

# External Dependencies

## Core Infrastructure
- **Supabase**: Backend-as-a-Service providing database, authentication, real-time subscriptions, and file storage
- **Vercel/Hosting Platform**: Deployment and hosting environment for the frontend application

## AI & Machine Learning
- **Google Gemini API**: Advanced language model for educational content generation, lesson planning, and intelligent tutoring
- **Content Processing**: Structured prompt engineering for consistent educational outputs

## Communication Services
- **SendGrid**: Email delivery service for notifications, sharing features, and user communications
- **Real-time Communication**: Supabase Realtime for live chat and collaborative features

## UI & User Experience
- **Radix UI**: Headless component library providing accessible, customizable UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Font Awesome**: Icon library for consistent iconography throughout the application
- **Google Fonts**: Web font service for typography (Inter/Poppins family)

## Development & Build Tools
- **TypeScript**: Static type checking for enhanced developer experience and code reliability
- **Vite**: Modern build tool with hot module replacement and optimized production builds
- **ESLint**: Code linting for maintaining code quality and consistency

## Interactive Features
- **DND Kit**: Drag-and-drop functionality for interactive learning components
- **React Hook Form**: Form state management with validation
- **Particles.js**: Interactive background animations for enhanced user engagement

## Validation & Processing
- **Zod**: Schema validation for form inputs and API data
- **Axios**: HTTP client for API communications with interceptors and error handling