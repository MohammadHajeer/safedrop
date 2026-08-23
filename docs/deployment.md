# Vercel Services deployment

SafeDrop is prepared for one Vercel project with two independently built services:

```text
Vercel project
├── frontend/  Next.js service
└── backend/   FastAPI service (Vercel Python runtime)

Neon
├── PostgreSQL
└── private Object Storage bucket
```

Do not deploy the backend as a persistent Uvicorn process and do not move it into
`frontend/app/api`. Vercel loads the ASGI application directly from
`backend/app/main.py` as `app.main:app`.

## Repository configuration

The root `vercel.json` uses the current Vercel Services `services` format:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "frontend": {
      "root": "frontend/",
      "framework": "nextjs",
      "bindings": [
        {
          "type": "service",
          "service": "backend",
          "format": "url",
          "env": "FASTAPI_URL"
        }
      ]
    },
    "backend": {
      "root": "backend/",
      "framework": "fastapi",
      "entrypoint": "app.main:app"
    }
  },
  "rewrites": [
    {
      "source": "/svc/api/guest/:path*",
      "destination": { "service": "backend" }
    },
    {
      "source": "/svc/api/d/:path*",
      "destination": { "service": "backend" }
    },
    {
      "source": "/svc/api/health",
      "destination": { "service": "backend" }
    },
    {
      "source": "/(.*)",
      "destination": { "service": "frontend" }
    }
  ]
}
```

The frontend binding is the only internal reachability grant needed. Vercel
injects a deployment-aware absolute backend URL into `FASTAPI_URL` at runtime.
Do not create a manual `FASTAPI_URL` in Vercel and do not expose it as a
`NEXT_PUBLIC_*` variable. Bindings resolve at function runtime, which is where the
Next.js Route Handlers read this variable.

Authenticated traffic remains:

```text
Browser -> Next.js /api Route Handler -> FASTAPI_URL binding -> FastAPI
```

FastAPI remains the authorization and business-rule authority. The access token
stays in the Next-owned HttpOnly cookie; the rotating refresh cookie is issued by
FastAPI and forwarded by Next.js.

## Why three FastAPI route families are public

The existing application has deliberate browser-to-FastAPI calls for guest Drop
creation/upload authorization and recipient Drop retrieval. Refactoring those
flows into the BFF is outside this deployment task. Only these same-origin paths
are publicly rewritten to the backend:

- `/svc/api/guest/*`
- `/svc/api/d/*`
- `/svc/api/health`

Authentication, user, Drop-owner, stats, and admin endpoints have no public
rewrite and are reached through the frontend binding. `/docs`, `/openapi.json`,
and `/health/db` therefore remain internal in Vercel. Local FastAPI `/docs` and
`/openapi.json` continue to work normally.

Vercel preserves the public `/svc/api` path when routing into a service. The
small ASGI middleware in `backend/app/main.py` removes that prefix before FastAPI
route matching and updates `root_path`. Direct local calls such as `/health` and
internal binding calls such as `/login` remain unchanged.

## Python runtime and dependencies

`backend/.python-version` selects Python 3.14. Vercel's current Python runtime
supports 3.12, 3.13, and 3.14, and the complete pinned dependency set is already
installed and tested locally on Python 3.14.7. `backend/requirements.txt` remains
the dependency manifest. No Vercel shim and no Uvicorn start command are needed.

## Environment variables

Set variables on the service that consumes them. Never commit values or copy test
credentials into production.

### Frontend service

| Variable | Source | Value/requirement |
| --- | --- | --- |
| `FASTAPI_URL` | Vercel service binding | Injected automatically; do not define manually |
| `NEXT_PUBLIC_API_URL` | Vercel frontend environment variable | `/svc/api` |
| `NODE_ENV` | Vercel-managed | Vercel sets `production`; do not override it |

`NEXT_PUBLIC_API_URL=/svc/api` is public by design but contains no hostname or
secret. Its relative value works unchanged on production, custom, and Preview
domains and keeps the public API calls same-origin.

### Backend service: required

| Variable | Requirement |
| --- | --- |
| `DATABASE_URL` | Production Neon pooled psycopg URL; use a `-pooler` hostname and TLS query options |
| `JWT_SECRET` | Long random access-token signing secret |
| `JWT_ALGORITHM` | JWT algorithm used by the application, normally `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime as an integer |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Absolute refresh-session lifetime as an integer |
| `COOKIE_SECURE` | `true` on Vercel HTTPS |
| `DROP_ENCRYPTION_KEY` | Stable Fernet key for encrypted owner share tokens |
| `STORAGE_BUCKET` | Private production Neon Object Storage bucket name |
| `AWS_ACCESS_KEY_ID` | Neon Object Storage credential ID |
| `AWS_SECRET_ACCESS_KEY` | Neon Object Storage credential secret |
| `AWS_ENDPOINT_URL_S3` | Branch-specific Neon S3-compatible endpoint |
| `AWS_REGION` | Region reported by Neon Object Storage |

Keep `JWT_SECRET` and `DROP_ENCRYPTION_KEY` stable. Changing the former invalidates
access JWTs; losing the latter prevents recovery of existing encrypted owner
share tokens.

### Backend service: optional or test-only

| Variable | Use |
| --- | --- |
| `CORS_ORIGINS` | Optional JSON array of exact browser origins for a split-host deployment; omit for Vercel Services |
| `TEST_DATABASE_URL` | Test-only destructive database; not required for application startup |
| `TEST_STORAGE_BUCKET` | Test-only isolated bucket |
| `TEST_AWS_ACCESS_KEY_ID` | Test-only storage credential ID |
| `TEST_AWS_SECRET_ACCESS_KEY` | Test-only storage credential secret |
| `TEST_AWS_ENDPOINT_URL_S3` | Test-only storage endpoint |
| `TEST_AWS_REGION` | Test-only storage region |

Do not set any `TEST_*` variable on the production service. The pytest fixtures
create and drop tables/schemas and storage integration tests create/delete real
objects.

## CORS

FastAPI defaults to the two exact local frontend origins:

```text
http://localhost:3000
http://127.0.0.1:3000
```

`CORS_ORIGINS` can override that list using a JSON array, for example
`["https://app.example.com"]`. Do not combine wildcard origins with credentialed
requests. The Vercel deployment does not need a production or Preview origin in
FastAPI CORS because browser-visible API calls use the same deployment origin at
`/svc/api`; normal authenticated calls are server-to-server through the binding.

## Cookies

Production expectations are:

| Cookie | Owner | Attributes and lifetime |
| --- | --- | --- |
| `safedrop_access_token` | Next.js | HttpOnly, Secure in `NODE_ENV=production`, `SameSite=Lax`, path `/`, expiry copied from JWT `exp` |
| `refresh_token` | FastAPI, forwarded by Next.js | HttpOnly, Secure when `COOKIE_SECURE=true`, `SameSite=Lax`, path `/`, absolute expiry from `REFRESH_TOKEN_EXPIRE_DAYS` |

Login and register append FastAPI's refresh `Set-Cookie` before Next.js adds the
access cookie. Refresh appends the rotated refresh cookie and replaces the access
cookie. Logout forwards FastAPI's deletion cookie and also clears both names at
the frontend origin. Header handling uses `Headers.getSetCookie()` and appends
every value, preserving multiple `Set-Cookie` headers. No token or cookie value is
logged.

## Neon PostgreSQL and Alembic

Use a dedicated production Neon branch/database unless sharing development data
is an explicit choice. This repository does not create or modify a Neon branch as
part of deployment preparation.

Use Neon's pooled connection string for `DATABASE_URL` (the hostname contains
`-pooler`) with TLS, normally `sslmode=require&channel_binding=require`. SQLAlchemy
keeps one engine per warm function instance and now checks pooled connections with
`pool_pre_ping=True`, which recovers stale connections after idle/suspend periods.
Each request-scoped session is closed in `finally`. No session or transaction is
stored in process memory.

Alembic reads `DATABASE_URL` through the same settings object and uses `NullPool`
for the migration connection. Migrations are not run at import, startup, or from a
request handler. Run them explicitly from a trusted machine or one-off release
environment with production backend variables loaded:

```bash
cd backend
python -m alembic upgrade head
```

Do this before promoting code that depends on a new schema. Do not run pytest
against the production database.

## Neon Object Storage

The storage architecture is unchanged:

```text
Browser -> Next.js/FastAPI authorization -> presigned POST
Browser -> Neon Object Storage directly
Browser -> completion endpoint -> FastAPI HEAD/copy/delete verification
```

File bytes never pass through Vercel. Keep `safedrop-files` (or the selected
production bucket) private. FastAPI alone receives S3 credentials. Upload POST and
download GET URLs expire after 300 seconds. Finalization verifies object presence,
size, and content type before moving `pending/` objects to `drops/`.

Neon Object Storage is currently beta, and the checked-in `neon.ts` bucket schema
supports bucket existence/access but not bucket CORS rules. Do not run `neon
deploy` merely to prepare Vercel and do not assume it changes the production
branch.

Before production, open the selected production branch in Neon Console, open
Object Storage, select the private production bucket, and verify its browser CORS
configuration permits:

- Allowed origin: the exact production frontend origin, such as
  `https://app.example.com`
- Allowed method: `POST` (presigned form upload)
- Allowed request header: `Content-Type` (or the console's equivalent explicit
  signed-form header allowance)
- Optional allowed methods: `GET` and `HEAD` if downloads are fetched by browser
  JavaScript rather than ordinary navigation
- No public-read access and no storage credentials in browser code

If the current Neon beta Console does not expose bucket CORS controls, use Neon
Support/current Object Storage documentation for that branch; do not substitute a
repository-side CORS header. Preview file uploads require each exact Preview
origin to be allowed by the bucket. Do not weaken the rule to a global wildcard;
without exact Preview entries, non-file Preview flows work but browser uploads may
fail their storage preflight.

## Health and serverless behavior

Public `GET /svc/api/health` maps to FastAPI's lightweight `/health` and performs
no database or storage call. `/health/db` remains available internally/local for
an explicit database round trip and returns `503` on SQLAlchemy failure.

The backend has no startup-only initialization, background tasks, local-file
persistence, or long-running worker. Database-backed refresh tokens and row locks
remain authoritative across instances. The frontend's concurrent refresh
deduplication map is process-local: it reduces duplicate refreshes only within one
warm Next.js instance and must not be treated as cross-instance coordination.
Vercel function instances and memory may disappear at any time.

No automated abandoned-pending-upload cleanup or terminal-Drop physical-file
cleanup job exists. `FILE_CLEANUP_GRACE_MINUTES` is only a constant; there is no
scheduler. Deployment works without a cron, but physical storage can grow until a
reviewed cleanup process is implemented later. No cron is added by this task.

## Manual Vercel setup (do not run during repository preparation)

1. Create/import one Vercel project from the repository root.
2. In Build and Deployment settings, select the **Services** framework preset.
3. Leave the project root at the repository root so Vercel reads `vercel.json`.
4. Confirm the detected services are `frontend` (`frontend/`, Next.js) and
   `backend` (`backend/`, FastAPI, `app.main:app`).
5. Confirm the services graph shows the frontend-to-backend binding named
   `FASTAPI_URL`.
6. Add `NEXT_PUBLIC_API_URL=/svc/api` to the frontend service for Production and
   Preview. Do not manually add `FASTAPI_URL`.
7. Add every required backend variable from the table above to the backend
   service. Set `COOKIE_SECURE=true`. Do not add `TEST_*` variables.
8. Choose the intended production Neon branch/database and use its pooled TLS
   URL and matching branch Object Storage endpoint/credentials. Do not point
   production at the destructive test database or bucket.
9. Configure/verify the private bucket CORS rule for the final production origin.
10. From a trusted environment with production backend variables loaded, run
    `cd backend && python -m alembic upgrade head`.
11. Create a Preview deployment first, verify non-file flows, add that exact
    Preview origin to storage CORS if file tests are required, and complete the
    checklist below.
12. Only after all checks pass, promote/deploy to Production. Repository
    preparation itself must not connect to Vercel or deploy.

## Post-deployment verification checklist

### Public and UI

- [ ] `/` loads with the responsive header.
- [ ] Dark/light mode works and persists as intended.
- [ ] `/login`, `/register`, and `/create` load.
- [ ] `/d/<token>` loads a valid Drop.
- [ ] Unknown routes show the custom 404.
- [ ] Mobile and desktop layouts work.
- [ ] Loading states, unavailable Drop state, and 404 state render correctly.

### Authentication

- [ ] Register succeeds and the response contains both HttpOnly cookies.
- [ ] Login succeeds and the response contains both HttpOnly cookies.
- [ ] Both cookies are `Secure`, `SameSite=Lax`, and path `/` in production.
- [ ] Direct `/dashboard` navigation succeeds after login.
- [ ] A hard refresh remains authenticated.
- [ ] Delete only `safedrop_access_token`; protected navigation rotates the
      refresh token and restores the access cookie.
- [ ] Logout revokes the refresh session and removes both cookies.
- [ ] Authenticated users cannot access `/login` or `/register`.
- [ ] Authenticated `/create` redirects to `/dashboard/drops/new`.

### Drops

- [ ] Create an authenticated text Drop.
- [ ] Create an authenticated Drop with a file.
- [ ] Retrieve the owner Drop, update it, and revoke it.
- [ ] Recipient access returns the Drop once per deliberate request.
- [ ] Maximum-view enforcement works.
- [ ] Expiration behavior works.

### Files

- [ ] Presigned upload returns no storage secret.
- [ ] Browser posts file bytes directly to Neon Object Storage.
- [ ] Completion verifies/finalizes the object.
- [ ] Recipient download works through a temporary URL.
- [ ] The temporary URL expires.
- [ ] Guest file upload and completion work.

### Admin

- [ ] A client role is blocked from admin routes and APIs.
- [ ] An admin can access admin pages and APIs.
- [ ] Admin user management works.
- [ ] Admin stats and storage totals load.

### Storage and limits

- [ ] Authenticated usage updates after upload/completion.
- [ ] Guest file/count/size limits are enforced.
- [ ] User and platform limits are enforced where safely testable.
- [ ] The production bucket is private.
- [ ] No storage credential appears in page source, browser bundles, or network
      responses.

### Service routing and health

- [ ] `/svc/api/health` returns `{"status":"ok","service":"safedrop-api"}`.
- [ ] `/svc/api/docs` is not publicly routed.
- [ ] Browser guest/share calls use relative `/svc/api` URLs.
- [ ] Authenticated browser calls use Next.js `/api` BFF routes.
- [ ] Preview and production logs contain no token, cookie, credential, or
      presigned-URL values.

## References

- [Vercel Services guide](https://vercel.com/kb/guide/vercel-services)
- [Vercel Services announcement and bindings](https://vercel.com/changelog/run-multiple-frameworks-in-one-project-with-vercel-services)
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python)
- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon Object Storage overview](https://neon.com/docs/storage/overview)
