# AutoSlot Backend

Express + Mongoose + JWT + SSE.

1. Copy `.env.example` to `.env` and adjust if needed.
2. Install deps and seed admin.

Commands (PowerShell):

```
npm install
npm run seed
npm run dev
```

Default seed user: admin / admin123

API paths:
- POST /api/auth/login
- GET/POST/PUT/DELETE /api/slots
- POST /api/slots/:id/(checkin|checkout|maintenance/start|maintenance/end)
- GET /api/slots/search/at?at=ISO
- GET /api/reports/analyze?from=ISO&to=ISO
- GET /api/reports/export.csv?from=ISO&to=ISO
- GET /api/reports/export.pdf?from=ISO&to=ISO
- GET /api/sse/subscribe