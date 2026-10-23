# API Overview — MediTrack API v1

All API endpoints are versioned under `/api/v1`.

## Endpoints Summary

### Health & Operations
- `GET /api/v1/health` — API service status and version information.
- `GET /api/v1/readiness` — Database connectivity status.
- `POST /api/v1/contact` — Public contact form inquiry.

### Authentication & Sessions
- `POST /api/v1/auth/register/patient` — Self-registration for patients.
- `POST /api/v1/auth/login` — Sign in with email and password.
- `POST /api/v1/auth/logout` — Revokes session and clears HttpOnly session cookie.
- `GET /api/v1/auth/session` — Session state, authenticated user, and active memberships.
- `POST /api/v1/auth/email/verify` — Verify account email address with token.
- `POST /api/v1/auth/email/verification/resend` — Resend verification email link.
- `POST /api/v1/auth/password/forgot` — Password recovery request (generic response).
- `POST /api/v1/auth/password/reset` — Reset password with token.
- `POST /api/v1/auth/password/change` — Authenticated password update.

### Multi-Factor Authentication (MFA)
- `POST /api/v1/auth/mfa/setup` — Generate TOTP secret key for setup.
- `POST /api/v1/auth/mfa/verify` — Verify code and activate MFA (returns 8 emergency recovery codes).
- `POST /api/v1/auth/mfa/challenge` — Verify TOTP code during sign in.
- `POST /api/v1/auth/mfa/recovery` — Sign in using emergency recovery code.

### Organizations & Onboarding
- `POST /api/v1/organizations/apply` — Submit healthcare organization application.
- `GET /api/v1/organizations/applications` — List applications (Platform Admin).
- `GET /api/v1/organizations/applications/:id` — Get application details.
- `POST /api/v1/admin/organizations/applications/:id/review` — Approve or reject application.
- `POST /api/v1/organizations/:id/invitations` — Invite staff member (Facility Admin).
- `GET /api/v1/invitations/:token` — Retrieve invitation details by token.
- `POST /api/v1/invitations/accept` — Accept staff invitation and join practice.

### User Memberships & Active Context
- `GET /api/v1/me/memberships` — List organization memberships for authenticated user.
- `POST /api/v1/me/active-context` — Explicitly switch active organization/facility context on session.

### Patient Self-Service Portal
- `GET /api/v1/patients/me` — Retrieve signed-in patient's profile and profile completion percentage.
- `PUT /api/v1/patients/me` — Update permitted demographic and emergency contact profile fields.
- `GET /api/v1/patients/me/dashboard` — Patient dashboard summary (legitimate appointments, notifications, health quick view).
- `GET /api/v1/patients/me/health-profile` — Full health profile (allergies, conditions, medications, history).
- `POST /api/v1/patients/me/health-profile/allergies` — Add patient-entered allergy.
- `DELETE /api/v1/patients/me/health-profile/allergies/:id` — Delete patient-entered allergy.
- `POST /api/v1/patients/me/health-profile/conditions` — Add patient-entered medical condition.
- `DELETE /api/v1/patients/me/health-profile/conditions/:id` — Delete patient-entered condition.
- `POST /api/v1/patients/me/health-profile/medications` — Add patient-entered medication.
- `DELETE /api/v1/patients/me/health-profile/medications/:id` — Delete patient-entered medication.
- `POST /api/v1/patients/me/health-profile/history` — Add patient-entered medical history event.
- `DELETE /api/v1/patients/me/health-profile/history/:id` — Delete patient-entered history event.

### Staff Patient Record Management
- `GET /api/v1/patients` — Search and filter patient records for active organization context.
- `POST /api/v1/patients` — Register new patient record with duplicate record matching rules.
- `GET /api/v1/patients/:id` — View patient profile and demographics for staff.
- `PUT /api/v1/patients/:id` — Update patient record fields by staff.
- `GET /api/v1/patients/:id/health-profile` — View patient health profile for clinical staff.
- `POST /api/v1/patients/:id/health-profile/allergies` — Record clinician-verified allergy.
- `POST /api/v1/patients/:id/health-profile/conditions` — Record clinician-verified medical condition.
- `POST /api/v1/patients/:id/health-profile/medications` — Record clinician-verified medication.
- `POST /api/v1/patients/:id/health-profile/history` — Record clinician-verified medical history.
- `PATCH /api/v1/patients/:id/health-profile/:type/:itemId/verify` — Clinician verification of patient-entered health entry.

### Facility Search & Patient Connections
- `GET /api/v1/public/facilities` — Search verified facilities by query/state.
- `POST /api/v1/patients/facility-connections` — Request patient connection to facility.
- `GET /api/v1/patients/facility-connections` — List patient's facility connection requests.
