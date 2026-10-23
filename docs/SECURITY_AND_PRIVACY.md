# Security & Privacy Specification — MediTrack

## Privacy Framework (NDPA 2023)
MediTrack is engineered with privacy-by-design principles aligned with the Nigerian Data Protection Act 2023:
1. **Data Minimization:** Only demographic and administrative details necessary for appointment scheduling and clinical continuity are captured. Sensitive medical details are never collected without explicit patient authorization.
2. **Explicit Consent:** Registration, contact, and profile update forms require explicit consent checkboxes.
3. **Draft Legal Disclaimer:** All legal pages are explicitly marked as draft content pending qualified legal review in Nigeria.
4. **Sensitive Data Redaction:** Passwords, tokens, blood groups, genotypes, and clinical notes are automatically redacted from Pino logs.
5. **Multi-Tenant Isolation:** All data models are strictly partitioned by `organizationId` and patient ID.
6. **Data Correction Framework:** Patients have the statutory right under NDPA 2023 to request or directly perform corrections on their personal demographic, emergency contact, and patient-entered health profile data through `/api/v1/patients/me`.
7. **Data Retention Policy:** In accordance with healthcare standards and NDPA rules, patient records are retained for active operational care and audit log requirements. Audit events (`AuditEvent`) retain immutable timestamps of all access and modification events.
8. **Data Deletion Policy:** Patients may request account or profile deletion. Patient-entered health records (unverified allergies, conditions, medications) can be deleted by the patient at any time via the self-service portal. Clinician-verified health records and appointment history are maintained as statutory medical audit trails in compliance with healthcare regulations.

## Security Architecture Highlights
1. **Password Hashing:** Passwords are hashed with Argon2id (`memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`).
2. **Session Security:** HttpOnly, SameSite=Lax cookies with SHA-256 session token hashing and revocation tracking.
3. **MFA Enforcement:** Mandatory TOTP Multi-Factor Authentication for hospital and platform administrators (`FACILITY_ADMIN`, `SYSTEM_ADMIN`).
4. **Role & Permission Elevation Safety Guard:** Organization administrators (`FACILITY_ADMIN`) are strictly constrained by backend authorization logic and cannot elevate themselves or assign system administration privileges (`SYSTEM_ADMIN`).
5. **PHI Safeguards in Notifications:** Email and application notifications (appointment confirmations, rescheduled appointments, invitations) strictly omit sensitive medical diagnoses, vitals, or clinical notes to prevent sensitive data exposure in external email channels.
6. **Single-Use Tokens:** Verification tokens, reset tokens, and invitation tokens are single-use with explicit expiration timestamps.
7. **Input Validation & Injection Defense:** All incoming HTTP request payloads are strictly validated using Zod schemas with strong type coercion.
8. **Server-Side Authorization:** Every protected route verifies membership and roles on the backend; client-supplied IDs are never trusted as proof of permission.
9. **Administrative Audit Logging:** Administrative actions (settings updates, role modifications, member activations/deactivations, invitation revocations) generate structured `AuditEvent` database logs.
