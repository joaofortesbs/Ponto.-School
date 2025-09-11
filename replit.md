# Overview

Ponto. School is a comprehensive educational platform that transforms how teachers and students interact with learning content. The application serves as an AI-powered learning management system with specialized features for content creation, study group management, gamification, and educational material generation. The platform focuses on personalized learning experiences through the "School Power" feature that uses Google's Gemini AI to generate customized educational content, lesson plans, and study materials.

The application is designed for educators in basic and secondary education, providing tools for automated lesson planning, interactive content creation, study group collaboration, and student engagement through gamified elements like daily login rewards and achievement systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses React 18 with TypeScript built on Vite for fast development and hot module replacement. The UI framework leverages Radix UI components for accessible, headless UI primitives combined with Tailwind CSS for styling and custom CSS variables for theming. The component architecture follows a feature-based organization with shadcn/ui components for consistent design patterns.

The application implements a modern single-page application (SPA) pattern with client-side routing and state management through Zustand stores. Component composition uses compound patterns with extensive use of React hooks for state management and side effects.

## Backend Architecture
The backend is built using Supabase as a Backend-as-a-Service (BaaS) solution, providing PostgreSQL database, real-time subscriptions, authentication, and storage capabilities. The application uses Supabase's real-time features for live chat functionality in study groups and dynamic content updates.

API endpoints are handled through Supabase's auto-generated REST API and real-time subscriptions. The Express.js server (in api/ directory) provides additional endpoints for email functionality using SendGrid integration.

## Database Design
The database schema is designed around educational workflows with tables for:
- User management and profiles
- Study groups (grupos_estudo) with member relationships
- Real-time messaging systems
- Educational content storage (anotacoes, apostilas)
- Gamification elements (daily rewards, achievements)
- AI-generated content tracking

The schema supports complex relationships between users, groups, and educational content with proper foreign key constraints and real-time triggers.

## AI Integration
The core differentiator is the integration with Google's Gemini AI through the @google/generative-ai package. The School Power feature uses structured prompts to generate:
- Personalized lesson plans
- Educational activities from a curated list of 137 available types
- Study materials and notes
- Interactive quizzes and assessments

The AI integration includes validation layers to ensure generated content matches available platform capabilities and user requirements.

## Authentication & Authorization
Authentication is handled through Supabase Auth with support for multiple providers. The system implements role-based access control (RBAC) for study groups with different permission levels (member, admin, owner). User sessions are tracked for real-time features and online status indicators.

## Real-time Features
Real-time functionality is powered by Supabase's real-time engine, enabling:
- Live chat in study groups
- Dynamic member status updates
- Real-time notifications
- Collaborative content editing

## State Management
The application uses Zustand for global state management with feature-specific stores. Local state is managed through React hooks, while persistent data uses localStorage for client-side caching and Supabase for server-side persistence.

## File Upload & Storage
File handling uses Supabase Storage for user-generated content including profile pictures, group banners, and educational materials. The system implements proper file validation, size limits, and organized bucket structures.

# External Dependencies

## Primary Services
- **Supabase**: Complete backend infrastructure including PostgreSQL database, authentication, real-time subscriptions, and file storage
- **Google Gemini AI**: Content generation for educational materials, lesson plans, and personalized learning content
- **SendGrid**: Email delivery service for notifications and content sharing
- **Vercel/Netlify**: Frontend hosting and deployment platform

## Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code linting and quality assurance
- **Tailwind CSS**: Utility-first CSS framework

## UI/UX Libraries
- **Radix UI**: Headless UI components for accessibility and customization
- **shadcn/ui**: Pre-built component library based on Radix UI
- **React Hook Form**: Form handling with validation
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library for consistent iconography

## Specialized Packages
- **@dnd-kit**: Drag and drop functionality for interactive elements
- **@tsparticles**: Particle effects for visual enhancement
- **react-beautiful-dnd**: Enhanced drag and drop for complex layouts
- **dagre**: Graph layout algorithms for visual content organization

## Utility Libraries
- **axios**: HTTP client for API requests
- **uuid**: Unique identifier generation
- **date-fns**: Date manipulation and formatting
- **zod**: Schema validation for type safety

The architecture prioritizes scalability, maintainability, and user experience while leveraging modern web technologies and AI capabilities to create an innovative educational platform.