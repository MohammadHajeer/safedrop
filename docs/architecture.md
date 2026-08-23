# Architecture

SafeDrop is a small monorepo with a Next.js frontend, a FastAPI backend, PostgreSQL persistence, and private S3-compatible object storage. The application deliberately separates account-facing browser traffic from public capability-link traffic.

## Repository boundaries

| Directory              | Responsibility                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| `frontend/app`         | Next.js pages, layouts, and same-origin `/api/*` BFF Route Handlers |
| `frontend/components`  | Public, authenticated, admin, form, and shared UI                   |
| `frontend/hooks`       | TanStack Query keys, queries, mutations, and invalidation           |
| `frontend/lib`         | Browser API clients and server-only authentication/backend helpers  |
| `backend/app/routers`  | FastAPI HTTP endpoints                                              |
| `backend/app/models`   | SQLAlchemy persistence models                                       |
| `backend/app/schemas`  | Pydantic request and response contracts                             |
| `backend/app/services` | Object storage and storage-accounting operations                    |
| `backend/alembic`      | PostgreSQL schema migrations                                        |

## High-level system

```mermaid
flowchart LR
    Browser[Browser]
    Next[Next.js App Router]
    BFF[Next.js BFF\nRoute Handlers]
    API[FastAPI]
    DB[(PostgreSQL)]
    Storage[(Private S3-compatible\nobject storage)]

    Browser -->|pages and assets| Next
    Browser -->|authenticated /api requests| BFF
    BFF -->|Bearer access token| API
    Browser -->|guest creation and recipient access| API
    API --> DB
    API -->|presign, HEAD, copy, delete| Storage
    Browser -->|presigned POST| Storage
```

The two backend URLs serve different consumers:

- `FASTAPI_URL` is server-only. Next.js Route Handlers use it to reach FastAPI.
- `NEXT_PUBLIC_API_URL` is browser-visible. Guest creation, guest file authorization, and recipient access use it directly; Server Components also use this client for recipient rendering.

Consequently, FastAPI CORS policy matters for public and guest browser requests, while authenticated application requests normally remain same-origin from the browser's perspective.

## Component responsibilities

### Next.js frontend

Next.js renders public and application pages, owns the application navigation and responsive design, and supplies the BFF Route Handlers. It does not make account authorization decisions on behalf of FastAPI.

The BFF:

- converts frontend login JSON into FastAPI's form-encoded login request;
- stores the access token in a Next-owned HttpOnly cookie;
- forwards FastAPI's HttpOnly refresh cookie;
- attaches access tokens as bearer credentials to authenticated FastAPI requests;
- performs one refresh-and-retry when a session can be recovered;
- rejects cross-site state-changing requests based on `Sec-Fetch-Site` and `Origin`; and
- normalizes backend responses without exposing access tokens to application JavaScript.

### FastAPI

FastAPI is the security and business-rule boundary. It validates credentials, resolves the current non-deleted user, checks the `admin` role, enforces ownership, hashes capability tokens, serializes view consumption and upload reservations, applies quotas, and generates storage signatures.

### PostgreSQL

PostgreSQL stores users, hashed refresh-token sessions, Drops, and Drop file metadata. Alembic owns schema evolution. The database is also used for row locks during recipient access and file-reservation/finalization paths.

### Object storage

The storage bucket holds file bytes privately. Database `DropFile` rows reserve names, types, sizes, quota, and object keys. FastAPI uses the S3 API to issue presigned POSTs and downloads, inspect uploaded objects, promote pending objects, and delete rejected objects.

## Authenticated API request

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js BFF
    participant F as FastAPI
    participant D as PostgreSQL

    B->>N: Same-origin /api request + HttpOnly cookies
    N->>N: Read safedrop_access_token
    alt access token missing or FastAPI returns 401
        N->>F: POST /refresh + refresh_token cookie
        F->>D: Validate stored hash, expiry, revocation, and user
        F->>D: Revoke old token and store rotated token
        F-->>N: New access token + Set-Cookie refresh_token
    end
    N->>F: Requested endpoint + Authorization: Bearer ...
    F->>D: Validate user and enforce authorization
    D-->>F: Application data
    F-->>N: API response
    N-->>B: Response + updated HttpOnly cookies when refreshed
```

`frontend/proxy.ts` handles early navigation UX: it allows a fresh access cookie, redirects to the refresh Route Handler when a refresh cookie remains, and sends unauthenticated protected-page requests to login. Server layouts also guard admin pages. Neither layer replaces FastAPI's bearer-token and role checks.

## Frontend data strategy

Server Components remain the default page composition model. Interactivity, form state, and authenticated data caching live in Client Components.

Authenticated dashboard and admin data follow one path:

```text
Client Component -> TanStack Query -> Next.js /api Route Handler -> FastAPI
```

TanStack Query centralizes stable query keys, loading/error states, short-lived caching, pagination continuity, and mutation invalidation. Mutations update or invalidate affected Drop lists, details, user data, admin statistics, and storage usage.

Public pages may remain server rendered. The recipient page deliberately performs one uncached FastAPI request from a Server Component because a successful read consumes a view. Automatic retries and background refetching are avoided on that path.

## Direct file upload

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js BFF
    participant F as FastAPI
    participant D as PostgreSQL
    participant S as Object storage

    B->>N: Request upload reservation
    N->>F: Presign request with bearer token
    F->>D: Lock/check owner, Drop state, file counts, and quotas
    F->>D: Create pending DropFile reservation
    F->>S: Generate five-minute presigned POST
    F-->>N: Upload URL, fields, and file ID
    N-->>B: Reservation response
    B->>S: Upload bytes directly to pending/... key
    B->>N: Complete file ID
    N->>F: Completion request with bearer token
    F->>S: HEAD pending object and verify size/type
    F->>S: Copy to drops/... key and delete pending key
    F->>D: Mark uploaded_at and save final key
    F-->>B: Finalized file metadata via BFF
```

Guest uploads omit the BFF authorization path: the browser sends `X-Guest-Management-Token` directly to FastAPI. The reservation, direct upload, verification, and promotion stages otherwise follow the same design.

The backend does not proxy upload bytes. This avoids tying application-worker memory and request duration to file size while preserving backend control over authorization and quotas.

## Recipient access

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js recipient page
    participant F as FastAPI
    participant D as PostgreSQL
    participant S as Object storage

    B->>N: GET /d/{shareToken}
    N->>F: Uncached GET /d/{shareToken}
    F->>F: SHA-256 hash raw share token
    F->>D: Lock matching Drop row
    F->>D: Validate not revoked, expired, or consumed
    F->>D: Load finalized, physically available files
    F->>S: Generate five-minute download URLs
    F->>D: Increment view_count and set last_accessed_at
    F-->>N: Text, expiry, and temporary file URLs
    N-->>B: Render Drop or uniform unavailable page
```

A successful request consumes exactly one view, even if the recipient refreshes the page. Unknown, revoked, expired, and consumed capabilities receive the same `404` response to reduce token-state disclosure.

## Trust and security boundaries

- Raw account passwords, access JWTs, refresh tokens, share tokens, and guest management tokens are capabilities or secrets and must not be logged or persisted unnecessarily.
- Passwords are stored as hashes. Refresh, share-lookup, and guest management tokens are stored as SHA-256 hashes.
- Account-owned share tokens are also encrypted with `DROP_ENCRYPTION_KEY` so an authenticated owner can recover the link. Guest share tokens are not recoverable through an owner endpoint.
- File storage is private, but application and infrastructure operators retain server-side access. SafeDrop is not E2EE or zero-knowledge.
- HTTPS is a deployment requirement; HttpOnly and `SameSite=Lax` do not encrypt traffic.

## Related documentation

- [Authentication](authentication.md)
- [Drops and sharing](drops-and-sharing.md)
- [File storage](file-storage.md)
- [Frontend](frontend.md)
- [Deployment](deployment.md)
