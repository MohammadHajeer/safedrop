# SafeDrop frontend

This directory contains SafeDrop's Next.js App Router application and backend-for-frontend Route Handlers.

Run frontend commands from the repository root:

```powershell
pnpm --dir frontend dev
pnpm --dir frontend lint
pnpm --dir frontend build
```

The frontend requires `FASTAPI_URL` for server-to-server BFF calls and `NEXT_PUBLIC_API_URL` for browser-reachable guest and recipient calls. Start with `.env.example`; do not commit real credentials.

Project documentation lives in the repository root:

- [Project overview](../README.md)
- [Getting started](../docs/getting-started.md)
- [Frontend architecture](../docs/frontend.md)
- [Authentication](../docs/authentication.md)
- [Deployment](../docs/deployment.md)
