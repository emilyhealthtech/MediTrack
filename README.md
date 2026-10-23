# MediTrack — Healthcare Appointment & Information Platform

[![MediTrack CI Pipeline](https://github.com/meditrack/meditrack/actions/workflows/ci.yml/badge.svg)](https.github.com/meditrack/meditrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-5%20Production%20Ready-green.svg)](#)

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
└── prototype/           # Legacy prototype reference
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

# 2. Build shared packages and applications
npm run build

# 3. Validate Prisma database schema & generate client
npx prisma generate --schema=packages/database/prisma/schema.prisma

# 4. Run full test suite
npm test

# 5. Typecheck all workspaces
npm run typecheck

# 6. Start development servers
npm run dev
```

---

## 4. Key Platform Features Across Phases

### Phase 1 & 2 — Authentication, Onboarding & Access Control
- **Patient Self-Registration (`/auth/register`):** Immediate account creation with NDPA consent.
- **Organization Onboarding (`/organization/apply`):** Practice submission with custom slug and CAC RC verification.
- **Platform Admin Review (`/admin/organization-applications`):** Application review, approval, and automated tenant provisioning.
- **Staff Invitation Workflow (`/organization/invitations/create` & `/invitations/accept`):** Token-based staff invitation acceptance.
- **Multi-Factor Authentication (`/auth/mfa/setup`, `/auth/mfa/challenge`, `/auth/mfa/recovery`):** TOTP MFA enforced for hospital and platform administrators.
- **Active Context Switcher (`/select-context`):** Server-side validated active organization/facility context switching.

### Phase 3 & 4 — Patient Records, Appointments & Clinical Encounters
- **Patient Health Profiles (`/patient/health-profile` & `/staff/patients`):** Dual-source health information model distinguishing patient-entered notes from clinician-verified items.
- **Appointment Scheduling & Availability (`/patient/appointments` & `/staff/appointments`):** Multi-mode consultation scheduling (In-Person, Virtual, Telephone), time-zone support, conflict checking, and provider slot management.
- **Clinical Encounter Records (`/patient/clinical-records`):** Encounters with vital signs, SOAP notes, confidential flag, electronic signing, and immutable audit amendment history.

### Phase 5 — Administration, Notifications, Integration & Production Readiness
- **Organization Administration (`/staff/organization`):**
  - Tenant details and settings updates.
  - Membership management (role switching between `FACILITY_STAFF` and `FACILITY_ADMIN`, membership activation/deactivation, member removal).
  - Permission safety enforcement (prevents org admins from granting `SYSTEM_ADMIN` or escalating system privileges).
  - Staff invitation onboarding and pending invitation revocation.
  - Administrative audit history.
- **Operational Reporting & Dashboards (`/staff/organization` -> Reports tab):**
  - Aggregated appointment status summaries (scheduled, confirmed, in-progress, completed, cancelled, no-show).
  - Patient registration totals and membership statistics.
  - Clinical encounter activity metrics with PII protection.
- **Notification Services & Delivery Tracking:**
  - Configurable SMTP integration with fallback mock transport.
  - Delivery status recording (`SENT`, `FAILED`), failure reasons, and automatic retry mechanism.
  - Safeguarded notification templates strictly excluding PHI (diagnoses, vitals, clinical notes).
- **Integration Foundations:**
  - iCalendar (`.ics`) file generation endpoint (`GET /api/v1/appointments/:id/ics`) for calendar service integration.
  - Robust RESTful API contracts with validation and structured error responses.

---

## 5. Operations & Operational Readiness

- **Health & Readiness Endpoints:**
  - `GET /api/v1/health` — Returns core API operational health and version status.
  - `GET /api/v1/readiness` — Returns database readiness and environment status.
- **Logging & Monitoring:** Pino structured JSON logger with automatic redaction of sensitive parameters (passwords, PHI).
- **Deployment & Backup Guides:** Detailed operational guides available in `docs/DEPLOYMENT.md`, `docs/SECURITY_AND_PRIVACY.md`, and `docs/API_OVERVIEW.md`.
