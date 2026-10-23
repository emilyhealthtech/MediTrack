# Local Development Setup Guide

## Prerequisites
- Node.js >= v20.0.0
- npm >= v10.0.0

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meditrack/meditrack.git
   cd meditrack
   ```

2. **Install monorepo dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` or set environment variables:
   ```bash
   DATABASE_URL="postgresql://user:pass@localhost:5432/meditrack"
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Build All Workspace Packages:**
   ```bash
   npm run build
   ```

5. **Validate Database Schema:**
   ```bash
   DATABASE_URL="postgresql://user:pass@localhost:5432/meditrack" npx prisma validate --schema=packages/database/prisma/schema.prisma
   ```

6. **Run Test Suite:**
   ```bash
   npm test
   ```

7. **Start Next.js Web Frontend & API:**
   ```bash
   npm run dev
   ```
   - Web App: `http://localhost:3000`
   - Express API: `http://localhost:3001/api/v1/health`
