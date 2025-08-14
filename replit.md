# SmartResume AI - Replit.md

## Overview

SmartResume AI is a sophisticated web-based resume builder application that leverages Natural Language Processing (NLP) and AI algorithms to help users create optimized, ATS-friendly resumes. The application provides intelligent content suggestions, job description analysis, and professional templates to enhance the resume creation process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server code:

- **Frontend**: React-based SPA using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration for user management
- **AI Integration**: OpenAI GPT-4o for content suggestions and job analysis
- **Styling**: Tailwind CSS with shadcn/ui component library

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with Neon PostgreSQL
- **Authentication**: Passport.js with OpenID Connect (Replit Auth)
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
The application uses a comprehensive schema including:
- **Users**: User profiles and authentication data
- **Resumes**: Resume documents with JSON content
- **Templates**: Predefined resume templates
- **Resume Sections**: Structured resume content sections
- **Job Descriptions**: User-uploaded job descriptions for analysis
- **AI Suggestions**: Cached AI-generated content suggestions

### AI Integration
- **OpenAI Service**: GPT-4o integration for content generation
- **Features**: Content suggestions, job description analysis, keyword optimization
- **Caching**: AI suggestions are stored in the database for performance

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth
2. **Resume Creation**: Users create resumes with structured sections
3. **AI Enhancement**: Content is enhanced using OpenAI suggestions
4. **Template Application**: Professional templates are applied to content
5. **Export Generation**: Resumes are exported to PDF/DOCX formats

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: AI content generation
- **passport**: Authentication middleware
- **express-session**: Session management

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Frontend build tool
- **tsx**: TypeScript execution
- **esbuild**: Backend bundling

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon PostgreSQL with migrations via Drizzle

### Production
- **Build Process**: 
  - Frontend: Vite build to static assets
  - Backend: esbuild bundle for Node.js
- **Database**: Drizzle migrations for schema updates
- **Environment**: Replit-optimized with specific plugins and configurations

### Key Design Decisions

1. **Database Choice**: PostgreSQL chosen for relational data integrity and JSON support for resume content
2. **ORM Selection**: Drizzle provides type safety and performance over alternatives like Prisma
3. **Authentication**: Replit Auth simplifies user management in the Replit ecosystem
4. **AI Model**: GPT-4o selected for latest capabilities in content generation
5. **Frontend Architecture**: React + TanStack Query for optimal developer experience and performance
6. **Component Library**: shadcn/ui chosen for customizable, accessible components
7. **Styling Strategy**: Tailwind CSS with CSS variables enables consistent theming