# Authentication Architecture — MediTrack

## 1. Overview
MediTrack implements a unified authentication system supporting multiple onboarding workflows:
- **Patients:** Self-registration (`/auth/register`).
- **Healthcare Organizations:** Application submission (`/organization/apply`) followed by platform admin review and approval (`/admin/organization-applications`).
- **Staff Members:** Invitation dispatch by facility administrators (`/organization/invitations/create`) and single-use acceptance (`/invitations/accept`).

## 2. Authentication Decisions & Protocols
- **Primary Credentials:** Email and password.
- **Password Security:** Hashed using Argon2id (`memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`). Passwords are never stored in plaintext.
- **Session Tokens:** Cryptographically secure random tokens stored as SHA-256 hashes (`Session.tokenHash`).
- **Session Transport:** HttpOnly, SameSite=Lax cookies (`meditrack_session`) or Bearer tokens in headers.
- **Multi-Factor Authentication (MFA):** Enforced for hospital (`FACILITY_ADMIN`) and platform (`SYSTEM_ADMIN`) administrators using TOTP (Time-based One-Time Password) and 8 emergency recovery codes.
- **Email Verification:** Required for sensitive account operations. Tokens are stored as SHA-256 hashes with 24-hour expiration.
- **Password Recovery:** Generic responses on forgot password requests to prevent account enumeration. Password reset tokens expire in 1 hour and are single-use.
