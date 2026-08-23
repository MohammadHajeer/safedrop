# Frontend

The frontend is a Next.js 16 App Router application using React 19 and TypeScript. It combines server-rendered public pages with client-side account data, forms, caching, charts, and responsive navigation.

## Rendering model

Components are Server Components unless they need browser interactivity or a client-only library. Pages compose data boundaries rather than forcing the whole application into one rendering mode.

Typical Server Component responsibilities include:

- page metadata and static marketing content;
- public and authenticated shell composition;
- route parameter and search parameter parsing;
- early redirects based on server-visible session state; and
- the deliberate, uncached recipient Drop fetch.

Client Components handle:

- React Hook Form forms and Zod validation;
- TanStack Query account data;
- uploads and progress;
- dialogs, toasts, charts, navigation state, and theme controls; and
- mutations followed by cache updates or invalidation.

Public pages can mix these modes. For example, `/create` is a Server Component that redirects an already-authenticated visitor and renders a client-side guest form.

## Application shells

`PublicShell` provides the public header, footer, theme toggle, authentication-aware calls to action, and responsive layout used by the home, login, registration, guest creation, recipient, and not-found experiences.

`AuthenticatedShell` provides desktop sidebar and mobile sheet navigation around dashboard, Drop, profile, and admin content. Navigation data comes from `useCurrentUser`; admin links appear only for users whose current data has type `admin`.

`frontend/proxy.ts` performs session-aware navigation handling for `/dashboard`, `/profile`, and `/admin`. The admin layout additionally calls `requireAdminUser`. These are routing and UX controls; FastAPI remains responsible for actual authorization.

## BFF Route Handlers

Authenticated client code calls same-origin endpoints under `frontend/app/api`. These Route Handlers use the server-only `FASTAPI_URL`, read HttpOnly cookies, attach the bearer token, attempt refresh recovery, and forward the FastAPI response.

The BFF also:

- converts login JSON to FastAPI form encoding;
- forwards refresh-token `Set-Cookie` headers;
- keeps the access token out of browser-visible JSON;
- maps the frontend's `POST /api/drops/{id}/revoke` to FastAPI's `DELETE /drops/{id}`; and
- rejects cross-site mutations.

See [Authentication](authentication.md) for the cookie and refresh design.

## Data-fetching paths

### Authenticated dashboard and admin data

```text
Client Component
  -> TanStack Query hook
  -> browser bffFetch('/api/...')
  -> Next.js Route Handler
  -> server-only FASTAPI_URL
  -> FastAPI
```

Dashboard, Drop management, profile, storage usage, and admin data are not SSR-fetched into their pages. Client Components own this server state through TanStack Query.

### Public and guest data

Guest creation and its management-token upload calls use `apiFetch` with `NEXT_PUBLIC_API_URL`, so the browser reaches FastAPI directly. The recipient page is server rendered but uses the same public API client to make one uncached request.

That recipient request consumes a view. It intentionally has no automatic retry, caching, or background refetch behavior.

## TanStack Query conventions

`QueryProvider` creates one client per browser tree with these defaults:

- 30-second stale time;
- one retry;
- no refetch on window focus.

Query keys use feature namespaces and stable detail identifiers:

- `['auth', 'me']`;
- `['drops', 'list', normalizedParameters]`;
- `['drops', 'detail', dropId]`;
- `['drops', 'files', dropId]`;
- `['drops', 'share-token', dropId]`;
- `['storage', 'usage']`; and
- admin user, statistics, and storage keys under `['admin', ...]`.

List parameters are normalized before becoming a key, so omitted defaults and explicit defaults use the same cache entry. Paginated Drop and admin-user lists keep previous data during page changes.

Mutations target affected caches:

- Drop creation invalidates Drop lists and active storage usage;
- Drop updates replace the detail cache and invalidate lists;
- revocation updates the detail optimistically, removes the cached share token, then refreshes lists, detail, and storage usage;
- profile updates replace the current-user cache; and
- admin user mutations invalidate user lists and platform statistics.

Share-token fetching is disabled by default and occurs only when the owner explicitly requests the link.

## Forms and validation

Interactive forms use React Hook Form with Zod schemas and `@hookform/resolvers`. Frontend validation provides immediate feedback for account fields, Drop limits, dates, view counts, and files. FastAPI/Pydantic repeats security- and data-critical validation; frontend schemas are not authoritative.

Uploads use a staged client flow:

1. create the Drop;
2. request each reservation;
3. upload directly to storage;
4. complete each reservation; and
5. report progress or a partial-upload error that retains the created Drop context.

## UI system

The component layer is built with shadcn/ui conventions on `@base-ui/react`, Tailwind CSS 4, class-variance-authority, `tailwind-merge`, Lucide icons, and Recharts.

`app/globals.css` defines semantic color and layout tokens for the SafeDrop design system. Product components consume names such as `background`, `foreground`, `card`, `primary`, `muted`, and `sidebar` instead of hard-coding independent themes.

`next-themes` applies class-based light, dark, or system mode. The root layout enables system preference and suppresses the expected theme hydration difference. Public and authenticated shells both expose a theme toggle.

Responsive behavior is implemented through Tailwind breakpoints and content-aware widths. Public layouts collapse to single columns, tables and controls adapt, the authenticated sidebar becomes a mobile sheet below the large breakpoint, and touch targets remain available on narrow screens.

## Frontend commands

From the repository root:

```powershell
pnpm --dir frontend dev
pnpm --dir frontend lint
pnpm --dir frontend build
pnpm --dir frontend start
```

See [Testing](testing.md) for formatting and full verification commands, and [Deployment](deployment.md) for URL and cookie configuration.
