# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project bootstrapped with `create-next-app` using the Pages Router architecture. The project is set up with TypeScript, Tailwind CSS v4, and ESLint configuration.

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

### Styling
- **Tailwind CSS v4** with inline theme configuration
- CSS variables for dark/light mode support defined in `src/styles/globals.css`
- Geist font family (sans and mono variants) configured globally
- Responsive design with mobile-first approach

### Key Files Structure
- `src/pages/index.tsx` - Main homepage component
- `src/pages/_app.tsx` - Next.js app wrapper
- `src/pages/_document.tsx` - HTML document structure
- `src/pages/api/hello.ts` - Example API route
- `src/styles/globals.css` - Global styles and Tailwind configuration
- `next.config.ts` - Next.js configuration with React Strict Mode enabled

### TypeScript Configuration
- Strict mode enabled
- Path aliasing configured for `@/*`
- Target: ES2017
- JSX preserve mode for Next.js compatibility

### ESLint Configuration
- Uses Next.js recommended rules (`next/core-web-vitals`, `next/typescript`)
- Standard ignores for build outputs and dependencies

## Development Notes

### Font Usage
- Geist Sans and Geist Mono fonts are configured as CSS variables
- Font variables: `--font-geist-sans` and `--font-geist-mono`
- Applied through Tailwind's theme configuration

### Dark Mode
- Built-in dark mode support using `prefers-color-scheme`
- CSS variables for background and foreground colors
- Components use `dark:` prefix for dark mode styles

### API Routes
- Follow Next.js Pages Router API route conventions
- Type definitions included for `NextApiRequest` and `NextApiResponse`
- Example route returns JSON at `/api/hello`

### Build System
- Uses Turbopack for both development and production builds
- React Strict Mode enabled in configuration
- Standard Next.js build output optimization