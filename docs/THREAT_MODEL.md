# Security Threat Model — MediTrack Phase 2

## 1. Threat Matrix & Countermeasures

| Threat Vector | Attack Scenario | Countermeasure Implemented in MediTrack |
| :--- | :--- | :--- |
| **Account Enumeration** | Attacker probes password reset form to discover valid user emails. | Generic response on `POST /api/v1/auth/password/forgot`: *"If an account exists for email, password reset instructions have been sent."* |
| **Credential Brute-Force** | Rapid automated sign-in attempts against user accounts. | In-memory rate limiting middleware (`rateLimiter`) restricting auth attempts per IP address window. |
| **Cross-Tenant Data Leakage** | Staff member alters `organizationId` parameter in API request to view another hospital's records. | Server-side authorization (`requireOrgMembership`). Request IDs are never trusted without active membership check. |
| **Session Hijacking / Fixation** | Attacker intercepts or reuses session identifiers. | Secure, HttpOnly cookies (`meditrack_session`) with SameSite=Lax, session token SHA-256 hashing, and rotation on sensitive actions. |
| **Privilege Escalation** | Patient or staff user calls admin endpoints directly. | Server-side role checks (`requireRole('SYSTEM_ADMIN')` or `requireRole('FACILITY_ADMIN')`). Route guards on API layer. |
| **Unverified Clinical Record Linkage** | Impersonator signs up with victim's email/name to gain access to existing health records. | Strict rule: Patient connection requests (`PatientFacilityConnection`) remain `PENDING` until administrator verification. No automatic linking by email alone. |
| **Admin Credential Compromise** | Attacker steals hospital admin password. | Mandatory TOTP Multi-Factor Authentication (MFA) enforced on backend for `FACILITY_ADMIN` and `SYSTEM_ADMIN` roles. |
