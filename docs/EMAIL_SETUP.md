# Email Service Setup & Operations — MediTrack

## 1. Email Service Abstraction
MediTrack utilizes a pluggable `EmailService` module (`apps/api/src/services/email.service.ts`):
- **Development & Testing:** Logged safely to server console/logs and recorded in the database `Notification` log table.
- **Production Mode:** Dispatched via configured SMTP provider (e.g. Resend, SendGrid, Amazon SES, or custom SMTP server).

## 2. Environment Configuration
Set the following environment variables in production:
```env
SMTP_HOST="smtp.provider.com"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="secret"
FROM_EMAIL="no-reply@meditrack.ng"
```

## 3. Dispatched Email Types
1. **Verification Email:** Account email verification link (`/auth/verify-email?token=...`).
2. **Password Reset Email:** Password recovery link (`/auth/reset-password?token=...`).
3. **Staff Invitation Email:** Invitation link to join a practice (`/invitations/accept?token=...`).
4. **Organization Status Email:** Notification of organization application approval or rejection.

## 4. Delivery Failure & Retry Handling
- Every dispatch request creates an audit record in the `Notification` table (`recipient`, `channel`, `subject`, `isSent`, `sentAt`).
- Failed deliveries throw structured log events (`Email Dispatch Failed`) without exposing sensitive SMTP credentials.
