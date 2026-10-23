# MediTrack — Healthcare Appointment & Information Platform

[![MediTrack CI Pipeline](https://github.com/meditrack/meditrack/actions/workflows/ci.yml/badge.svg)](https.github.com/meditrack/meditrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-1%20Foundation%20Complete-green.svg)](#)

MediTrack is an enterprise-grade multi-tenant healthcare appointment scheduling and administrative health information SaaS designed specifically for private clinics, hospitals, diagnostic centers, and patients in Nigeria.

---

## 1. Architecture & Monorepo Structure

The codebase is organized as an npm workspace monorepo:

```
meditrack/
├── apps/
│   ├── api/             # Node.js & Express REST API server (/api/v1)
│   └── web/             # Next.js App Router Web Application & Public Site
├── packages/
│   ├── database/        # Prisma ORM Schema, Client & Migrations
│   └── shared/          # Shared TypeScript DTOs & Zod Validation Schemas
├── docs/                # Architecture, System Design & Security Docs
└── stitch_meditrack_healthcare_portal/ # Approved Google Stitch Design Specifications
```

---

## 2. Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS ("Clinical Clarity" Design System)
- **Backend:** Node.js, Express.js, TypeScript, Pino (Structured Logging with Sensitive Data Redaction), Helmet, CORS
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest, Supertest
- **CI/CD:** GitHub Actions

---

## 3. Getting Started & Local Development

### Prerequisites
- Node.js >= v20.0.0
- npm >= v10.0.0

### Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Build shared packages and apps
npm run build

# 3. Validate Prisma database schema
DATABASE_URL="postgresql://user:pass@localhost:5432/meditrack" npx prisma validate --schema=packages/database/prisma/schema.prisma

# 4. Run test suite
npm test

# 5. Start development servers
npm run dev
```

---

## 4. Public Website Pages (Phase 1 Approved Stitch Designs)

- **Landing Page (`/`):** Hero, value propositions, live status cards.
- **About Us (`/about`):** Mission, responsible AI principles, NDPA 2023 legal notice.
- **Features & Services (`/features`):** Scheduling, multi-tenant isolation, audit trails, subscriptions.
- **FAQ (`/faq`):** Interactive accordion covering onboarding and scope.
- **Contact Us (`/contact`):** Inquiry form connected to API with Zod validation.
- **Legal Draft Pages:**
  - Terms of Service (`/terms`)
  - Privacy Policy (`/privacy`)
  - Cookie Policy (`/cookies`)
  - Consent & Data Use (`/consent`)

---

## 5. Security & Privacy Highlights

- **NDPA 2023 Compliance Readiness:** Draft documentation pending qualified legal review.
- **Multi-Tenant Isolation:** Explicit `organizationId` partitioning across all database models.
- **Data Redaction:** Sensitive parameters (passwords, PHI) are automatically redacted in server logs.
- **Responsible AI Scope:** Restricted to administrative assistance. No autonomous clinical diagnosis or prescribing.
