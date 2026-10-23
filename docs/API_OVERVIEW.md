# API Overview — MediTrack API v1

All API endpoints are versioned under `/api/v1`.

## Endpoints

### Health & Operations
- `GET /api/v1/health`
  - Returns API service status and version information.
  - Response: `{ "status": "ok", "service": "MediTrack Core API", "version": "1.0.0-phase1" }`

- `GET /api/v1/readiness`
  - Returns database readiness status.
  - Response: `{ "status": "ready", "database": "connected" }`

### Public Website
- `POST /api/v1/contact`
  - Processes contact and facility onboarding inquiries.
  - Body: `{ fullName, email, organizationName, phone, subject, message, consent }`
  - Response: `{ success: true, data: { referenceNumber: "MDT-1700000000" } }`
