# Ponto. School

## Overview
Ponto. School is an AI-powered educational platform designed to provide personalized learning experiences and streamline educational workflows for students and teachers. Built with React and TypeScript, it offers features such as an AI assistant (Epictus), study groups, digital notebooks, smart worksheets, interactive quizzes, and automated lesson planning through its "School Power" feature. The platform aims to enhance educational engagement and efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (December 23, 2025)

### ✅ CRITICAL FIX: State Isolation Between Lesson Creation Sessions
**Issue Resolved:** Previous lesson data was bleeding into new lesson creation when user clicked "+ Criar" without page reload.

**Root Cause:** 
- Parent component (`atividades/interface.tsx`) held state (`selectedAulaTemplate`, `generatedLessonData`, `aulaIdParaCarregar`)
- When `handleOpenPersonalizacaoModal()` was called, these states were NOT being reset
- Child components (`CriacaoAulaPanel`, `ConstrucaoAulaPanel`) retained their internal state

**Architecture Solution:**
1. **Session ID System:**
   - Added `aulaSessionId` state that changes for each new lesson creation
   - Used as `key` prop on child components to force complete remount
   - Format: `session_${Date.now()}_${randomId}`

2. **Reset Function (`resetAulaState()`):**
   - Clears ALL parent-level lesson state when "+ Criar" is clicked
   - Resets: `selectedAulaTemplate`, `generatedLessonData`, `aulaIdParaCarregar`
   - Generates new `aulaSessionId` to force component remounts

3. **Mode Detection in ConstrucaoAulaPanel:**
   - `modoEdicao`: When `aulaIdParaCarregar` is provided (loading existing lesson)
   - `modoCriacao`: When `aulaIdParaCarregar` is undefined (new lesson)
   - useEffect clears `aulaCarregada` when switching to creation mode

**Key Files Modified:**
- `src/pages/minhas-criacoes/atividades/interface.tsx` - Added session ID and reset function
- `src/pages/card-criacao-aula/ConstrucaoAulaPanel.tsx` - Added mode detection and cleanup

**Debug Logs:**
- `[RESET_AULA_STATE]` - When state is being cleared
- `[OPEN_PERSONALIZACAO]` - When modal opens with clean state
- `[CONSTRUCAO_PANEL]` - Mode detection and state changes

**Expected Behavior Now:**
1. User creates Lesson A → publishes → closes
2. User clicks "+ Criar" → ALL state is reset, new session ID generated
3. Modal opens completely clean (no template, no data)
4. User creates Lesson B → completely independent from Lesson A

### ✅ NEW: Lesson Publishing System with Modal Confirmation
**Feature Implemented:** Transform Play button to Publish button with complete save flow and success modal.

**Architecture:**
- **Button Transformation:**
  - Play button now shows as "Publicar aula" (Publish Lesson) icon by default
  - On click, collects all lesson data via `getAulaData()` from AulaResultadoContent
  - During publishing: button shows loading spinner
  - After publishing: button changes to Play icon permanently
  - Button becomes disabled/read-only once published

- **Publishing Flow:**
  1. User clicks "Publicar aula" button
  2. System collects: title, objective, all sections, template info, metadata
  3. `aulasStorageService.salvarAula()` saves with status: 'publicada'
  4. Success modal appears: "Sua aula foi publicada com sucesso! Ela já está disponível na sua nota de aulas."
  5. Modal auto-closes after 3 seconds
  6. Button changes to Play icon (read-only)
  7. Lesson appears in AulasGrid with all saved data

- **State Management:**
  - `isPublished`: Tracks if lesson has been published
  - `showPublishModal`: Controls success modal visibility
  - `isPublishing`: Shows loading state during save

- **Data Persistence:**
  - All lesson data (titulo, objetivo, secoes, sectionOrder) saved to localStorage
  - Status field tracks publication state
  - Cross-tab synchronization via storage event listeners
  - Survives page reload

**Debugging Logs:**
- `[PUBLISH_AULA]` prefix for all publishing operations
- Logs data collection, save operation, and success confirmations

### ✅ NEW: AI-Powered Lesson Generation System (Groq API)
**Feature Implemented:** Automatic content generation for all lesson sections using AI.

**Architecture:**
- **Backend Files:**
  - `api/ai/prompts.js` - Dedicated file for AI prompts with section descriptions
  - `api/ai/lesson-generator.js` - Complete flow with millimetric debugging
- **Frontend Service:**
  - `src/services/lessonGeneratorService.ts` - API client with TypeScript interfaces
- **API Endpoints:**
  - `POST /api/lesson-generator/generate` - Generate complete lesson
  - `POST /api/lesson-generator/regenerate-section` - Regenerate specific section
  - `POST /api/lesson-generator/generate-titles` - Generate title options
  - `GET /api/lesson-generator/test` - Test connection

**Flow:**
1. User opens "Personalize sua aula" modal
2. Selects template (defines section structure)
3. Fills "Assunto" and "Contexto" fields
4. Clicks "Gerar aula" button
5. Backend maps all fields and sections
6. Groq AI generates personalized content for each section
7. Response populates all interface fields automatically

**Debugging System:**
- Request IDs for tracking
- Timestamps on all operations
- Prefixed logs: `[LESSON-GEN:FLOW]`, `[LESSON-GEN:API]`, `[LESSON-GEN:PARSING]`, etc.
- Processing time measurement
- Retry with exponential backoff

### ✅ FIXED: AI Data Flow to UI Components
**Issue Resolved:** AI was generating content successfully but UI remained empty due to missing data propagation.

**Data Flow Architecture:**
1. `atividades/interface.tsx` → stores `generatedData` state from API response
2. `card-criacao-aula/interface.tsx` → receives and passes `generatedData` to `ConstrucaoAulaPanel`
3. `ConstrucaoAulaPanel.tsx` → passes to `AulaResultadoContent`
4. `AulaResultadoContent.tsx` → applies data to states via `useEffect`

**State Application Logic (AulaResultadoContent.tsx):**
- `generatedData.titulo` → `setCurrentAulaName()` + `setEditingAulaName()`
- `generatedData.objetivo` → `setObjectiveText()`
- `generatedData.secoes` → iterates and updates `dynamicSections` state

**JSON Parser Improvements:**
- Two-pass sanitization for robust parsing
- First attempt: replaces line breaks within string values
- Second attempt: removes all control characters (aggressive fallback)
- Handles Groq API responses with embedded newlines

### ✅ FIXED: Dynamic Template Section Synchronization System
**Critical Issue Resolved:** All lessons were displaying identical section sequences regardless of template selection.

**Root Cause:** The `sectionConfigs` was being created with ALL sections from ALL templates, while `sectionOrder` only contained sections for the selected template. This mismatch prevented proper rendering.

**Solution Implemented:**
1. **Refactored `sectionConfigs` to be 100% dynamic:** Now creates configurations ONLY for sections in `sectionOrder`
2. **Simplified section synchronization:** Removed complex state management for old hardcoded sections (preEstudo, introducao, desenvolvimento, etc.)
3. **Perfect template-to-rendering pipeline:**
   - Template selected → `getTemplateSectionOrder()` calculates section IDs
   - `sectionOrder` receives the template's section IDs
   - `sectionConfigs` creates configs ONLY for those IDs
   - Rendering maps `sectionOrder` and finds matching configs

**Implementation Details:**
- Removed 7 hardcoded section states (preEstudo, introducao, desenvolvimento, encerramento, materiais, observacoes, bncc)
- Kept only Objective section as fixed (always appears first)
- All other sections now managed through `dynamicSections` state
- Updated `AulaDraftData` interface to support flexible section storage via Record types

**Result:** Each template now renders EXACTLY the sections it defines, in the correct order, with perfect synchronization.

## System Architecture

### UI/UX Decisions
The platform features a modern design with glass-morphism effects and blur backgrounds. The color scheme includes Primary Orange (#FF6B00), Secondary Blue (#0D00F5), and Dark Navy text (#0A2540). It utilizes custom, responsive typography, smooth CSS animations, and a mobile-first responsive design. Accessibility is a key focus, offering a presentation mode with multi-language translation, dynamic font sizing (12px-24px), and voice reading support.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS with shadcn/ui, and Zustand for state management.
- **Backend**: Express.js handles API endpoints for email, profiles, and activities.
- **AI Integration**: Primarily uses the Google Gemini API for content generation, lesson planning, and the Epictus AI assistant.
- **Authentication & User Management**: Supabase is used for authentication, user sessions, role-based access, and profile management.
- **Core Features**:
    - **School Power**: AI-powered lesson planning with 5 dynamic templates (Aula Ativa, Aula Expositiva, Aula Socioemocional, Aula Técnica, Aula SE) that generate custom section structures
    - **Study Groups**: Real-time chat with member management.
    - **Digital Notebooks & Smart Worksheets**: AI-integrated content generation and interactive materials.
    - **Daily Login System**: Gamified streaks and rewards.
    - **School Points**: Persisted and synchronized school points system.
    - **Calendário School**: Comprehensive calendar event management including draggable events, icon/tag system, class/turma selector, settings menu (share/export/integrations/templates), and an optimized planning modal with category filters and templates.
    - **Lesson Template System**: 5 customizable teaching methodologies with template-based section generation

### System Design Choices
The architecture emphasizes a modular component design using shadcn/ui patterns. Data persistence is managed with Neon PostgreSQL for primary data, Supabase PostgreSQL for authentication, and Supabase Storage for file assets. Supabase Realtime enables live features such as chat. The system is configured for VM deployment, ensuring backend state maintenance and real-time database connections.

**Critical Architecture Decision:** Dynamic sections are now fully decoupled from hardcoded templates. The `sectionConfigs` → `sectionOrder` → rendering pipeline ensures perfect synchronization between template selection and section display.

## External Dependencies

### Core Services
- **Supabase**: Backend-as-a-Service for PostgreSQL database, authentication, real-time capabilities, and file storage.
- **Google Gemini AI**: Main AI service for content generation, lesson planning, and educational assistance.
- **Groq API**: AI service for fast lesson content generation using Llama 3.3 70B model.
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
- **@dnd-kit**: For drag-and-drop functionality with sortable context
- **@tsparticles**: For particle effects.
- **Axios**: HTTP client for API communication.
- **docx**, **jsPDF**, **file-saver**: For generating and downloading activity documents.
- **bcrypt**: For password hashing.
- **Framer Motion**: For smooth animations and transitions.

## Architecture Notes

### Template Section System
- **5 Templates**: Aula Ativa, Aula Expositiva, Aula Socioemocional, Aula Técnica, Aula SE
- **Mandatory Final Sections**: Materiais Complementares, Observações do Professor, Critérios BNCC (appear in all templates)
- **Dynamic Section Generation**: Each template defines its own section sequence in `TEMPLATE_SECTIONS` (TemplateDropdown.tsx)
- **Section Mapping**: `SECTION_NAME_TO_CONFIG` maps template section names to internal IDs with icons and placeholders

### State Management Flow
1. User selects template in UI
2. `selectedTemplate` prop updated
3. `getTemplateSectionOrder(selectedTemplate)` calculates section IDs
4. `sectionOrder` state updated with template's section IDs
5. `dynamicSections` state synchronized to match template (via useEffect)
6. `sectionConfigs` useMemo regenerated with ONLY sections in sectionOrder
7. Rendering loops through sectionOrder and renders matching configs

### Data Persistence
- localStorage stores draft data per lesson (scoped by aulaName)
- Includes: objective text, theme, image, sectionOrder, selectedTemplateId, dynamicSections, customSections
- Auto-save with 1000ms debounce for performance
- Sections state is fully reconstructed from dynamicSections on reload

### AI Lesson Generation Flow
1. **Modal Input:** User fills template + assunto + contexto
2. **Section Mapping:** System maps template sections to IDs via `SECTION_NAME_TO_CONFIG`
3. **Prompt Building:** `buildLessonGenerationPrompt()` creates detailed prompt with section purposes
4. **API Call:** Request to Groq API with retry logic
5. **Response Parsing:** JSON parsing with validation
6. **Interface Population:** Generated data fills titulo, objetivo, and all section textareas

### Backend File Structure (AI)
```
api/
├── ai/
│   ├── prompts.js          # AI prompts and section descriptions
│   └── lesson-generator.js # Main generation logic with debugging
├── groq.js                 # Existing Groq utilities
└── server.js               # API routes including /api/lesson-generator/*
```
