# System Design Document — MediTrack

## 1. System Vision
MediTrack is a multi-tenant SaaS application built for Nigerian healthcare facilities (clinics, hospitals, diagnostic centers) and their patients. The system provides secure facility onboarding, appointment scheduling, patient profiles, and subscription management.

## 2. Monorepo Architecture
The platform is structured as an npm workspaces monorepo:
- `apps/web`: Next.js frontend with Tailwind CSS based on the "Clinical Clarity" Google Stitch design system.
- `apps/api`: Node.js & Express REST API (`/api/v1`) with security headers (Helmet), CORS, Pino logging, and Zod validation.
- `packages/database`: Prisma schema defining PostgreSQL entities for multi-tenant isolation.
- `packages/shared`: Shared TypeScript domain types, DTOs, and Zod schemas.

## 3. High-Level System Diagram
```
  [ Next.js Frontend (apps/web) ]
                 |
                 v (REST API over HTTPS)
  [ Express.js Backend API (apps/api) ]
          |                  |
          v                  v
  [ Pino Logger ]    [ Prisma ORM Client ]
          |                  |
   (Redacted Logs)           v
                     [ PostgreSQL Database ]
```

## 4. Operational Boundaries & AI Scope
MediTrack is restricted to administrative and operational workflows:
- Facility and staff management.
- Patient appointment queueing and status tracking.
- Administrative AI assistance only (e.g. scheduling summaries).
- Strictly NO automated medical diagnosis or clinical decision-making.
