# Deployment Guide

## Production Build & Deployment

### Build Monorepo
```bash
npm install
npm run build
```

### Database Migration & Schema Generation
Run Prisma client generation and schema push in production:
```bash
npx prisma generate --schema=packages/database/prisma/schema.prisma
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### Environment Variables
Ensure all required environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) are configured securely in server secrets management. Never commit `.env` files.
