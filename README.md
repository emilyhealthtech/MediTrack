# MediTrack — Healthcare Appointment & Information Platform

[![MediTrack CI Pipeline](https://github.com/meditrack/meditrack/actions/workflows/ci.yml/badge.svg)](https.github.com/meditrack/meditrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-2%20Auth%20%26%20Tenancy%20Complete-green.svg)](#)

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
├── docs/                # Architecture, System Design, Auth & Security Docs
└── stitch_meditrack_healthcare_portal/ # Approved Google Stitch Design Specifications
```

---

## 2. Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS ("Clinical Clarity" Design System)
- **Backend:** Node.js, Express.js, TypeScript, Pino (Structured Logging with Sensitive Data Redaction), Helmet, CORS, Cookie-Parser, Argon2id, otplib
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

# 3. Validate Prisma database schema & generate client
npx prisma generate --schema=packages/database/prisma/schema.prisma

# 4. Run test suite
npm test

# 5. Start development servers
npm run dev
```

---

## 4. Authentication, Onboarding & Access Control Features (Phase 2 Complete)

- **Patient Self-Registration (`/auth/register`):** Immediate account creation with NDPA consent.
- **Organization Onboarding (`/organization/apply`):** Practice submission with custom slug and CAC RC verification.
- **Platform Admin Review (`/admin/organization-applications`):** Application review, approval, and automated tenant provisioning.
- **Staff Invitation Workflow (`/organization/invitations/create` & `/invitations/accept`):** Single-use token invitation acceptance.
- **Multi-Factor Authentication (`/auth/mfa/setup`, `/auth/mfa/challenge`, `/auth/mfa/recovery`):** Enforced for hospital and platform administrators.
- **Active Context Switcher (`/select-context`):** Server-side validated active organization/facility context switching.
- **Facility Directory & Connection Requests (`/facilities`):** Verified facility search and record connection requests.

---

## 5. Security & Privacy Highlights

- **Argon2id Password Hashing:** Password security using Argon2id.
- **HttpOnly Cookie Sessions:** Session management with SHA-256 token hashing, rotation, and revocation.
- **Multi-Tenant Isolation:** Server-side authorization check (`requireOrgMembership`) enforcing strict organization tenant boundaries.
- **NDPA 2023 Compliance Readiness:** Draft documentation pending qualified legal review.
- **Data Redaction:** Sensitive parameters (passwords, PHI) are automatically redacted in server logs.
