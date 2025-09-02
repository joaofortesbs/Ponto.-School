# Ponto.School Educational Platform

## Overview

Ponto.School is a comprehensive educational platform built with React, TypeScript, and Vite, designed to transform education through intelligent AI-powered tools. The platform focuses on the "School Power" system - an AI-driven educational content generation tool that creates personalized learning materials, lesson plans, and interactive content for teachers and students.

The application features multiple educational modules including AI-powered note-taking (digital notebook), intelligent study group management, personalized action plans, interactive quizzes, and gamified learning experiences with rewards systems. The platform serves both teachers and students, providing tools for lesson planning, content generation, collaborative learning, and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with Radix UI components for consistent, accessible design
- **Component Library**: Custom shadcn/ui components integrated via components.json configuration
- **State Management**: Zustand stores for global state management (evident from schoolPowerStore references)
- **Styling**: CSS variables system for theming with brand colors (orange #FF6B00, blue #0D00F5, black #0A2540)

### Backend Architecture
- **Database**: Supabase as the primary backend-as-a-service solution
- **Real-time Features**: Supabase Realtime for live chat functionality in study groups
- **File Storage**: Supabase Storage for user-generated content (avatars, banners, documents)
- **API Server**: Express.js server (api/server.js) for additional backend functionality
- **Email Service**: SendGrid integration for email notifications and sharing features

### AI Integration
- **Primary AI**: Google Gemini API for educational content generation
- **Use Cases**: 
  - Personalized lesson plan creation
  - Intelligent note generation with specific formatting guidelines
  - Study group content suggestions
  - Interactive quiz generation
  - Action plan personalization based on user context

### Data Architecture
- **Database Tables**: 
  - User management and authentication
  - Study groups with member management
  - Notes and annotations system (caderno_anotacoes, apostila_anotacoes)
  - Messages for real-time chat
  - School Power activities and features tracking
- **Storage Strategy**: Hybrid approach using Supabase for persistent data and LocalStorage for temporary user state
- **File Management**: Organized bucket system for different content types (group-banners, group-photos, user-avatars)

### Key Features Architecture

#### School Power System
- **Input Processing**: Multi-step user input collection (initial message + contextualization quiz)
- **AI Processing**: Structured prompts to Gemini API with user data and available activities
- **Content Generation**: Validates AI responses against predefined activity templates (137 available activities)
- **Output Rendering**: Dynamic action plan cards with checkbox interactions

#### Study Groups System
- **Group Management**: Complete CRUD operations with role-based permissions (owner, admin, member)
- **Real-time Chat**: Supabase Realtime integration for live messaging
- **Member Interface**: Visual member cards with online/offline status tracking
- **Settings Management**: In-app configuration for group properties and permissions

#### Digital Notebook System
- **Note Templates**: Multiple annotation models (Complete Study, Mind Map, Quick Review)
- **Content Integration**: Two-way sync between notebook and intelligent study materials (apostila)
- **AI-Generated Content**: Automated note formatting following specific educational guidelines
- **Export Functionality**: Cross-platform sharing and organization features

### Security and Performance
- **Authentication**: Supabase Auth with session management
- **Data Validation**: Input sanitization and AI response validation
- **Error Handling**: Comprehensive retry mechanisms and fallback systems
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance Optimization**: Lazy loading, component-level state management, and optimized asset delivery

## External Dependencies

### Core Infrastructure
- **Supabase**: Database, authentication, real-time features, and file storage
- **Vercel/Replit**: Hosting and deployment platform
- **Google Gemini AI**: Advanced language model for educational content generation

### Third-Party Services
- **SendGrid**: Email delivery service for notifications and content sharing
- **Font Awesome**: Icon library for consistent UI elements
- **Google Fonts**: Typography system (Inter, Roboto, Poppins)

### Development Tools
- **ESLint + TypeScript**: Code quality and type checking
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Accessible component primitives
- **React Hook Form + Zod**: Form handling and validation
- **Drag and Drop Kit**: Interactive UI components for reordering
- **React Beautiful DnD**: Advanced drag-and-drop functionality

### Optional Integrations
- **Particles.js**: Visual effects and animations
- **UUID**: Unique identifier generation
- **Axios**: HTTP client for API communications
- **Dagre**: Graph layout algorithms for content organization

The application is designed with modularity and scalability in mind, allowing for easy integration of new educational tools and AI capabilities while maintaining a cohesive user experience across all platform features.