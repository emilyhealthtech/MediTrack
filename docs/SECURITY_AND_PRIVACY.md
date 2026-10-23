# Security & Privacy Specification — MediTrack

## Privacy Framework (NDPA 2023)
MediTrack is engineered with privacy-by-design principles aligned with the Nigerian Data Protection Act 2023:
1. **Data Minimization:** Only demographic and administrative details necessary for appointment scheduling are captured.
2. **Explicit Consent:** Registration and contact forms require explicit consent checkboxes.
3. **Draft Legal Disclaimer:** All legal pages are explicitly marked as draft content pending qualified legal review in Nigeria.
4. **Sensitive Data Redaction:** Passwords, tokens, blood groups, and genotypes are automatically redacted from Pino logs.
5. **Multi-Tenant Isolation:** All data models are partitioned by `organizationId`.

## Security Architecture Highlights
1. **Password Hashing:** Passwords are hashed with Argon2id (`memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`).
2. **Session Security:** HttpOnly, SameSite=Lax cookies with SHA-256 session token hashing and revocation tracking.
3. **MFA Enforcement:** Mandatory TOTP Multi-Factor Authentication for hospital and platform administrators (`FACILITY_ADMIN`, `SYSTEM_ADMIN`).
4. **Single-Use Tokens:** Verification tokens, reset tokens, and invitation tokens are single-use with expiration timestamps.
5. **Rate Limiting:** Rate limiting on auth routes to prevent brute-force and account enumeration.
6. **Server-Side Authorization:** Every protected route verifies membership and roles on the backend; client-supplied IDs are never trusted as proof of permission.
