# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FMIB Quiz is a modern quiz application built with Next.js 15, TypeScript, and Tailwind CSS v4. The application provides an interactive quiz experience with admin management capabilities and persistent storage using Vercel Blob Storage.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No test framework is currently configured. Consider adding Jest, Vitest, or Playwright if tests are needed.

## Architecture

### Framework & Routing
- **Next.js 15** with Pages Router (not App Router)
- Pages are located in `src/pages/`
- API routes are located in `src/pages/api/`
- Path alias configured: `@/*` maps to `./src/*`

### Storage Architecture
The application uses a dual storage system:
1. **Vercel Blob Storage** (Production) - Persistent across deployments
2. **localStorage** (Development & Fallback) - For session management

Key storage files:
- `src/lib/blob-storage.ts` - Vercel Blob storage client with fallbacks
- `src/lib/storage.ts` - localStorage utilities for session management
- `src/pages/api/blob-questions.ts` - Full CRUD API for blob storage

### Application Structure

#### Main Pages
- `src/pages/index.tsx` - Landing page (auto-redirects to /quiz)
- `src/pages/quiz.tsx` - Main quiz interface with timer and navigation
- `src/pages/admin.tsx` - Admin panel for question management
- `src/pages/certificate.tsx` - Certificate generation

#### Core Services
- `src/lib/quizService.ts` - Quiz business logic, validation, and API interaction
- `src/lib/api.ts` - HTTP API client with error handling
- `src/types/quiz.ts` - TypeScript definitions for quiz data

#### Component Architecture
- `src/components/ui/` - Reusable UI components (shadcn-inspired)
- `src/components/quiz/` - Quiz-specific components
- `src/components/admin/` - Admin-specific components

### Key Features

#### Quiz System
- **Timer System** - 10-minute countdown with auto-submission
- **Session Management** - Progress tracked in localStorage
- **Answer Persistence** - Auto-save on each selection
- **Certificate Generation** - PDF certificates for scores ≥60%

#### Admin Features
- **Question CRUD** - Create, read, update, delete questions
- **Import/Export** - JSON format for question backup
- **Storage Monitoring** - Debug tools for blob storage

### API Routes
- `/api/quiz/questions` - Fetch quiz questions (supports blob and mock data)
- `/api/quiz/submit` - Submit quiz answers for grading
- `/api/blob-questions` - Full CRUD for blob storage management
- `/api/debug-blob` - Debug utilities for storage issues

### Environment Variables
```bash
BLOB_READ_WRITE_TOKEN=your_token_here      # Vercel Blob storage
NEXT_PUBLIC_APP_URL=http://localhost:3000  # App URL
NODE_ENV=development                       # Environment mode
```

### Styling
- **Tailwind CSS v4** with inline theme configuration
- CSS variables for dark/light mode support defined in `src/styles/globals.css`
- Geist font family (sans and mono variants) configured globally
- Responsive design with mobile-first approach

### Development Notes

#### Session Flow
1. User Info Collection → Save to localStorage
2. Quiz Session → Track progress, answers, timer (10-minute countdown)
3. Auto-save → Answers saved on each selection
4. Session Timeout → Automatic submission
5. Results → Certificate generation for passing scores

#### Security Features
- Correct answer masking in API responses
- Session validation with timeout checks
- Input validation for questions and answers
- No authentication system (public interface)

#### Build Configuration
- Uses Turbopack for both development and production builds
- React Strict Mode enabled in configuration
- Standard Next.js build output optimization
- TypeScript with strict compilation

## Working with This Codebase

### Key Entry Points
- Start with `src/pages/quiz.tsx` for main quiz flow
- `src/pages/admin.tsx` for question management
- `src/lib/blob-storage.ts` for storage operations
- `src/lib/quizService.ts` for business logic

### Important Patterns
- Uses Vercel Blob storage with localStorage fallback
- Timer-based auto-submission after 10 minutes
- Session management with localStorage persistence
- Component composition for reusability
- Type-safe API layer with comprehensive error handling

### Configuration Points
- Environment variables in `.env.local`
- Blob storage configuration for production deployment
- Timer and session settings in constants
- UI theming through Tailwind CSS variables