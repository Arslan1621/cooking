# Overview

ChefGPT is a comprehensive AI-powered cooking companion web application that helps users create recipes, track calories, plan meals, and manage their pantry. The application features multiple specialized "Chef" modes including PantryChef (ingredient-based recipes), MasterChef (professional cooking), MacrosChef (nutrition-focused), MealPlanChef (meal planning), and MixologyMaestro (cocktails). It provides both free and premium tiers, with advanced features like AI photo calorie tracking available in the Pro plan.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing Vite as the build tool. The application uses a component-based architecture with Wouter for client-side routing instead of React Router. State management is handled through React Query (TanStack Query) for server state and React hooks for local state. The UI is built with Shadcn/ui components and styled using Tailwind CSS with a custom theme featuring chef-inspired colors (orange primary, red accents).

## Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design pattern. The application uses a modular route structure with separate handlers for different functionalities (recipes, meal plans, calories, etc.). Authentication is handled through Replit's OpenID Connect system with session-based authentication. The server includes middleware for request logging, error handling, and authentication verification.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. Database connections are managed through Neon's serverless PostgreSQL driver. The schema includes tables for users, recipes, saved recipes, calorie entries, meal plans, pantry items, shopping lists, and sessions. Database migrations are handled through Drizzle Kit with a dedicated migrations folder.

## Authentication and Authorization
Authentication is implemented using Replit's OpenID Connect with Passport.js strategy. Sessions are stored in PostgreSQL using connect-pg-simple. The system includes middleware to protect routes and handle unauthorized access. User profiles support detailed information including dietary restrictions, fitness goals, and activity levels.

## External Service Integrations
The application integrates with OpenAI's GPT-4o model for recipe generation and food analysis. There's also configuration for Google's Gemini API as an alternative. The AI services handle recipe creation, meal plan generation, calorie estimation from photos, and cocktail recommendations. The system is designed to work with various AI providers through a unified interface.

# External Dependencies

- **Database**: PostgreSQL via Neon serverless driver for primary data storage
- **Authentication**: Replit OpenID Connect for user authentication
- **AI Services**: OpenAI GPT-4o for recipe generation and food analysis, with Google Gemini as fallback
- **UI Components**: Radix UI primitives via Shadcn/ui for accessible component library
- **Styling**: Tailwind CSS for utility-first styling approach
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **File Processing**: Support for image upload and analysis for calorie tracking
- **Session Storage**: PostgreSQL-based session storage for authentication persistence