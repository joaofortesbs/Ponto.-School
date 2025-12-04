# Replit.md

## Overview
Ponto. School is an AI-powered educational platform built with React and TypeScript. It offers a suite of tools for students and teachers, including an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and the core "School Power" feature for automated lesson planning. The platform aims to provide personalized learning experiences and streamline educational workflows.

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
- **Frontend**: React 18 with TypeScript, Vite for development, and Tailwind CSS with shadcn/ui for styling. Zustand for state management.
- **Backend**: Express.js for API endpoints (email, profiles, activities).
- **Core Features**:
    - **School Power**: AI-powered lesson planning with contextualization cards and action plan generation. Supports activity download in .docx and PDF formats.
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation and interactive materials.
    - **Daily Login System**: Gamified experience with streaks and rewards.
    - **School Points**: Persisted school points system for activities, editable and synchronized with the database.
- **AI Integration**: Primarily uses Google Gemini API for content generation, lesson planning, and the Epictus AI assistant.
- **Authentication & User Management**: Supabase for authentication, user sessions, role-based access, and profile management.

### System Design Choices
- **Modular Component Architecture**: Reusable UI components following shadcn/ui patterns.
- **Data Persistence**: Uses Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets.
- **Real-time**: Supabase Realtime for live features like chat and user presence.
- **Deployment**: Configured for VM deployment, maintaining backend state and supporting real-time database connections.

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

## Recent Changes

### December 2024 - Enhanced Avatar Animation with Typewriter Effect
- **Improved JotaAvatar.tsx Component** - Avatar now appears immediately with delayed hover + rotating text
  - **Avatar Visibility**: Appears INSTANTLY (no hover on load) - scale 0.8→1, opacity 0→1 (0.4s, no delay)
  - **Auto-Hover**: Activated after 600ms delay, providing visual feedback before user interacts
  - **Hover State**: FIXED while user is in School Power section
  - **Text Rotation**: "O que vamos [rotating word?]" with 5 words: Construir?, Programar?, Montar?, Desenvolver?, Projetar?
  - **Typewriter Effect**: Characters animate in sequentially (80ms per character) as word changes
  - **Word Rotation**: Changes every 2.5s (2s display + 0.5s transition)
  - **Cursor Animation**: Blinking cursor (0.7s cycle) shows while typing
- **CSS Enhancements**:
  - Cubic-bezier easing for smooth hover transitions: `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Box-shadow glow effect on hover: `0 8px 16px rgba(255, 111, 50, 0.3)`
  - Separated CSS classes: `.jota-avatar-item`, `.jota-avatar-label`, `.rotating-word`, `.typewriter-cursor`
- **Animation Sequence**:
  1. Avatar enters immediately (0.4s scale animation)
  2. After 600ms, hover effect activates (elevation + gradient)
  3. Label appears with rotating text
  4. Text typing effect starts (80ms per character)
  5. After 2s display time, word rotates and typewriter resets
  6. Cycle repeats infinitely
- **Component Isolation**:
  - Modifications to School Power avatar ONLY affect JotaAvatar.tsx
  - Sales page avatar (ProfileSelector.tsx) remains completely independent
  - Each component independently styled, animated, and modified

### December 2024 - Performance Optimization (PageSpeed)
- **Code Splitting & Lazy Loading**: Implemented React.lazy() for 15+ pages/components
  - Dashboard, Agenda, Biblioteca, SchoolPower, etc. lazy-loaded on demand
  - Reduces initial bundle size significantly
- **Vendor Chunking**: Optimized Vite build configuration with manual chunks
  - vendor-react, vendor-ui, vendor-motion, vendor-utils, vendor-dnd, vendor-charts, vendor-pdf
  - Better caching for third-party libraries
- **Image Optimization Attributes**: Added width, height, loading="lazy", decoding="async" to key images
  - Sales page avatars, flags, stacked cards images
  - Chat component logos
  - Prevents Cumulative Layout Shift (CLS)
  - Enables native lazy loading for below-fold images
- **Critical CSS Inlining**: index.html includes inline critical CSS for faster FCP
- **Resource Hints**: Added DNS prefetch, preconnect, and preload for critical resources
- **Cache Headers**: Configured server with optimized cache-control headers
  - Hashed assets: 1 year immutable cache
  - Static assets: 1 day cache
  - HTML: no-cache for fresh content
- **Font Loading Optimization**: Non-blocking font loading with print media query trick
- **Performance Report Script**: Added `scripts/performance-report.js` for metrics analysis

### December 2024 - Image Optimization (PNG to WebP Conversion)
- **Automated PNG to WebP Conversion**: Added `scripts/convert-images-to-webp.js` script for bulk image conversion
  - Converts all PNG images in `/public/images/` and `/public/lovable-uploads/` to WebP format
  - Achieves ~77% size reduction (15MB → 3.4MB total)
  - Quality setting: 82% for optimal balance between size and quality
- **API Endpoints** (development only, blocked in production):
  - `GET /api/image-conversion-status` - Check conversion status
  - `POST /api/convert-images` - Trigger image conversion
  - `DELETE /api/delete-png-originals` - Remove original PNG files after verification
- **Sharp Library**: Added for high-performance image processing
- **Updated References**: All source files (.tsx, .jsx, .js, .css, .html) updated to use .webp extensions

### December 2024 - Navigation Performance Optimization (FINAL)
- **Removed Lazy Loading for Core Pages**: Dashboard pages now use direct imports for INSTANT navigation
  - Dashboard, Agenda, Biblioteca, SchoolPower, Carteira, Organizacao, Novidades, Configuracoes, PlanosEstudo, ProfilePage, TrilhasSchoolProfessorInterface - all eagerly loaded
  - Only infrequently used pages (Comunidades, PedidosAjuda, Quiz, etc.) remain lazy-loaded
  - Eliminates chunk download delay when navigating between sections
- **ProtectedRoute Optimization**: Implemented optimistic rendering with background revalidation
  - Uses localStorage cache (auth_token, user_id, auth_status) for instant initial render
  - Always performs background auth revalidation to ensure security
  - Clears stale tokens and redirects to login if revalidation fails
- **Removed All Suspense from Dashboard Routes**: Home.tsx now renders Outlet directly
  - No loading fallbacks between section navigations
  - Truly instant section switching
- **Message Sync System**: Seamless message synchronization between sales page and School Power
  - `src/lib/message-sync.ts` handles localStorage-based message persistence with 24h expiry
  - Sales page saves messages and redirects based on login status
  - LoginForm checks for pending messages post-login
  - SchoolPowerPage auto-sends saved messages on load

### December 2024 - Sidebar Menu Reorganization (FINAL)
- **Minhas Criações**: Added new expandable section for Professor users below "School Power" containing:
  - Atividades (disabled/locked)
  - Trilhas School (disabled/locked)
  - Teacher App (disabled/locked)
- **Agente School Removed**: Completely removed "Agente School" from sidebar navigation and deleted all related files (pages, components, routes)
- **Conquistas Removed**: Removed the Conquistas (achievements) section from the sidebar menu and deleted associated files

### December 2024 - Avatar Text, Container Structure & Layout Optimization
- **Avatar Text Refinement**: Updated rotating text to "O que vamos [word?]" with "?" integrated in orange (#FF6B00) for each word
  - Words: Construir?, Programar?, Montar?, Desenvolver?, Projetar?
  - Removed "hoje?" from text to keep it concise and focused
- **Unified Container Structure**: Created wrapper container grouping ChatInput and QuickAccessCards
  - Maintains exact positioning, spacing, and sizing of child components
  - Enables future styling/manipulation of message + cards group as single unit
  - Structure: Parent div (absolute, bottom: 25px) contains ChatInput (marginBottom: 65px) + QuickAccessCards
- **Layout Optimization**: Reduced top spacing on School Power interface
  - Adjusted container position from top-[57%] to top-[48%] (desktop), top-[45%] to top-[42%] (mobile)
  - Reduced TopHeader margin from 7px to 3px (desktop), 4px to 2px (mobile)
  - Result: More compact interface with less empty space at the top