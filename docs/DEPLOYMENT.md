# MediTrack Production Deployment & Operations Guide

This guide outlines the production deployment, database provisioning, operational health monitoring, backup & recovery, and rollback procedures for MediTrack.

---

## 1. Hosting Environment & Infrastructure Prerequisites

### Required Infrastructure
- **Node.js Runtime:** Node.js >= v20.0.0 LTS
- **Database:** Managed PostgreSQL 15+ cluster (e.g. AWS RDS PostgreSQL, Supabase, or Railway Managed Postgres) with SSL enforced (`sslmode=require`).
- **Web Server / Reverse Proxy:** NGINX or Cloudflare with TLS 1.3 termination, HTTP/2, HTTPS enforcing (HSTS enabled).
- **Environment Management:** Secure environment secrets store (AWS Secrets Manager, HashiCorp Vault, or platform environment variables).

---

## 2. Environment Configuration

Ensure environment variables are populated securely in the hosting container or deployment environment. **Never commit `.env` files containing production secrets.**

```env
# Application Core
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://app.meditrack.ng

# Database
DATABASE_URL="postgresql://meditrack_user:SECURE_PASSWORD@postgres.internal:5432/meditrack_db?schema=public&sslmode=require"

# Security Secrets
JWT_SECRET=super-secret-production-key-change-me-1234567890

# Notification Services (SMTP)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.meditrack.ng
SMTP_PASS=SECURE_SMTP_PASSWORD
FROM_EMAIL=no-reply@meditrack.ng
```

---

## 3. Production Build & Startup Instructions

### Build Steps

```bash
# 1. Install workspace dependencies
npm install --production=false

# 2. Build shared packages (@meditrack/shared & @meditrack/database)
npm run build --workspace=@meditrack/shared
npm run build --workspace=@meditrack/database

# 3. Build API and Web applications
npm run build --workspace=@meditrack/api
npm run build --workspace=@meditrack/web
```

### Production Service Startup Commands

```bash
# Start API Server in background / process supervisor (e.g., PM2)
node apps/api/dist/index.js

# Start Web Server
npm run start --workspace=@meditrack/web
```

---

## 4. Database Provisioning & Migration Instructions

1. **Database Provisioning:**
   Ensure PostgreSQL database user has schema creation and table modification permissions.

2. **Schema Generation & Migration Execution:**
   ```bash
   npx prisma generate --schema=packages/database/prisma/schema.prisma
   npx prisma db push --schema=packages/database/prisma/schema.prisma
   ```

3. **Production Data Integrity Verification:**
   Verify generated tables match Prisma schema without losing existing customer tenant data.

---

## 5. Operations, Health Checks & Monitoring

### System Health Monitoring
MediTrack provides standardized REST health check endpoints:
- **Core API Health Check:** `GET https://api.meditrack.ng/api/v1/health`
  - Returns `status: "ok"`, version, and timestamp.
- **Database Readiness Check:** `GET https://api.meditrack.ng/api/v1/readiness`
  - Returns `status: "ready"` and `database: "connected"`. Returns HTTP 503 if database connection drops.

### Pino Structured Logging
Server logs use Pino structured JSON formatting with automatic sensitive parameter redaction (`password`, `passwordHash`, `mfaSecret`, clinical notes). Direct log streams to cloud log aggregators (e.g., Datadog, AWS CloudWatch, Grafana Loki).

---

## 6. Backup & Recovery Procedures

### Database Backup
- **Automated Daily Snapshots:** Configure automated daily PostgreSQL WAL-E/WAL-G physical backups with a 35-day point-in-time recovery (PITR) retention window.
- **Logical Dump Backup:** Run automated nightly logical dumps:
  ```bash
  pg_dump --clean --if-exists --no-owner --no-privileges -h postgres.internal -U meditrack_user -d meditrack_db | gzip > /backups/meditrack_$(date +%Y%m%d_%H%M%S).sql.gz
  ```

### Disaster Recovery
In event of database corruption or hardware failure:
1. Provision a clean PostgreSQL instance.
2. Restore latest logical or physical backup:
   ```bash
   gunzip -c /backups/meditrack_latest.sql.gz | psql -h postgres.internal -U meditrack_user -d meditrack_db
   ```
3. Run `npx prisma generate` and verify system readiness via `/api/v1/readiness`.

---

## 7. Rollback Planning & Troubleshooting

### Rollback Strategy
If a deployment release introduces unexpected regressions:
1. **Container / Code Rollback:** Revert deployment image tag to previous stable Git commit hash.
2. **Database Schema Rollback:** If migration changes are required, execute down migration scripts prior to image rollback to avoid schema mismatch.
3. **Cache / Session Revocation:** If session model changes, flush active sessions or enforce re-authentication.

### Troubleshooting Operational Common Issues
- **Port Conflict / EADDRINUSE:** Kill lingering process on assigned API port before restarting: `kill $(lsof -t -i:3001) 2>/dev/null || true`.
- **Database Connection Pool Exhaustion:** Increase `connection_limit` parameter in `DATABASE_URL` or enable PgBouncer pooler.
- **Cross-Tenant Access Denial Logged:** Verify session `activeOrganizationId` cookie is set and matches client header context.
