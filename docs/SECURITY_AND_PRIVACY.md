# Security & Privacy Specification — MediTrack

## Privacy Framework (NDPA 2023)
MediTrack is engineered with privacy-by-design principles aligned with the Nigerian Data Protection Act 2023:
1. **Data Minimization:** Only demographic and administrative details necessary for appointment scheduling and clinical continuity are captured. Sensitive medical details are never collected without explicit patient authorization.
2. **Explicit Consent:** Registration, contact, and profile update forms require explicit consent checkboxes.
3. **Draft Legal Disclaimer:** All legal pages are explicitly marked as draft content pending qualified legal review in Nigeria.
4. **Sensitive Data Redaction:** Passwords, tokens, blood groups, and genotypes are automatically redacted from Pino logs.
5. **Multi-Tenant Isolation:** All data models are partitioned by `organizationId` and patient ID.
6. **Data Correction Framework:** Patients have the statutory right under NDPA 2023 to request or directly perform corrections on their personal demographic, emergency contact, and patient-entered health profile data through `/api/v1/patients/me`.
7. **Data Retention Policy:** In accordance with healthcare standards and NDPA rules, patient records are retained for active operational care and audit log requirements. Audit events (`AuditEvent`) retain immutable timestamps of all access and modification events.
8. **Data Deletion Policy:** Patients may request account or profile deletion. Patient-entered health records (unverified allergies, conditions, medications) can be deleted by the patient at any time via the self-service portal. Clinician-verified health records and appointment history are maintained as statutory medical audit trails in compliance with healthcare regulations.

## Security Architecture Highlights
1. **Password Hashing:** Passwords are hashed with Argon2id (`memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`).
2. **Session Security:** HttpOnly, SameSite=Lax cookies with SHA-256 session token hashing and revocation tracking.
3. **MFA Enforcement:** Mandatory TOTP Multi-Factor Authentication for hospital and platform administrators (`FACILITY_ADMIN`, `SYSTEM_ADMIN`).
4. **Single-Use Tokens:** Verification tokens, reset tokens, and invitation tokens are single-use with expiration timestamps.
5. **Rate Limiting:** Rate limiting on auth routes to prevent brute-force and account enumeration.
6. **Server-Side Authorization:** Every protected route verifies membership and roles on the backend; client-supplied IDs are never trusted as proof of permission.
