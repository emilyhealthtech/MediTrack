# Deployment Guide

## Production Build & Deployment

### Build Monorepo
```bash
npm install
npm run build
```

### Database Migration
Run Prisma database migration in production:
```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### Environment Variables
Ensure all required environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`) are configured securely in server secrets management. Never commit `.env` files.
