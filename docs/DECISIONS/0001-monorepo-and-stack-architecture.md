# ADR 0001: Workspace Monorepo and Technology Stack Selection

## Status
Approved

## Context
MediTrack requires a modular, maintainable full-stack architecture for a multi-tenant healthcare appointment platform targeting Nigerian healthcare facilities.

## Decision
1. Use an npm workspace monorepo structure containing `apps/web`, `apps/api`, `packages/database`, and `packages/shared`.
2. Use Next.js App Router for frontend UI, Express.js for backend REST API (`/api/v1`), PostgreSQL with Prisma ORM for database, and Vitest for testing.
3. Use Tailwind CSS with custom color tokens adhering to the "Clinical Clarity" Google Stitch design system.

## Consequences
- Single repository for shared type definitions, database schemas, and web/API applications.
- Strict architectural boundaries between administrative Next.js UI and backend API services.
