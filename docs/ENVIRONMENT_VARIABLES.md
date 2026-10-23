# Environment Variables Reference

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | No | `3001` | Express API server listening port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL |
| `JWT_SECRET` | Yes | `dev-secret-key-12345` | Secret key for token signing (min 8 chars) |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed origin for Cross-Origin Resource Sharing |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001/api/v1` | Public API URL endpoint for Next.js web client |
| `SMTP_HOST` | No | - | SMTP server hostname for production emails |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | - | SMTP authentication username |
| `SMTP_PASS` | No | - | SMTP authentication password |
| `FROM_EMAIL` | No | `no-reply@meditrack.ng` | Sender email address for automated dispatches |
