# System Architecture — MediTrack

## 1. Application Layers

### Frontend Layer (`apps/web`)
- Built using Next.js App Router and React 18.
- Styled with Tailwind CSS matching the "Clinical Clarity" design system tokens (`#005c55` primary teal canvas).
- Fully responsive across mobile, tablet, and desktop viewports.
- Integrated authentication screens for sign in, registration, email verification, password recovery, MFA challenge/recovery, onboarding, facility search, organization applications, admin reviews, and staff invitations.

### Backend API Layer (`apps/api`)
- Express.js server providing versioned REST API routes under `/api/v1`.
- Cookie-parser and custom session middleware handling secure, HttpOnly session cookies.
- Argon2id password hashing and SHA-256 token hashing.
- Health check (`/api/v1/health`) and readiness check (`/api/v1/readiness`).
- Centralized error handling preventing sensitive stack traces from leaking to clients.
- Pino logging with sensitive data path redaction (`password`, `token`, `genotype`, `bloodGroup`).

### Data Layer (`packages/database`)
- PostgreSQL database managed via Prisma ORM.
- Multi-tenant separation via strict `organizationId` foreign key relations across models.

## 2. Multi-Tenant Isolation Pattern
Organizations represent tenants. Facilities are locations belonging to organizations. Users and Memberships are decoupled so users can belong to multiple facilities or organizations with specific roles. Server-side middleware validates membership in the target organization before granting access to tenant resources.
