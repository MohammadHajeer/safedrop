# API overview

FastAPI is the source of truth for the endpoints below. This page is a human-readable map, not a replacement for generated schemas.

With the backend running locally:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

## Access conventions

| Label         | Requirement                                                               |
| ------------- | ------------------------------------------------------------------------- |
| Public        | No account authentication; endpoint-specific capabilities may still apply |
| Authenticated | `Authorization: Bearer <access-token>` validated by FastAPI               |
| Owner-only    | Authenticated, and the Drop's `owner_id` must match the current user      |
| Admin-only    | Authenticated current database user must have type `admin`                |
| Guest-managed | `X-Guest-Management-Token` must match the guest Drop's stored hash        |

The SafeDrop browser normally reaches authenticated routes through same-origin Next.js `/api/*` Route Handlers. The paths in this document are the underlying FastAPI paths.

## General and health

| Access | Endpoint         | Purpose                                                        |
| ------ | ---------------- | -------------------------------------------------------------- |
| Public | `GET /`          | Return API name, running status, and links to docs and health. |
| Public | `GET /health`    | Return a process-level health response.                        |
| Public | `GET /health/db` | Execute `SELECT 1` and return database connectivity or `503`.  |

## Authentication

| Access                  | Endpoint         | Purpose                                                                                                  |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| Public                  | `POST /register` | Create a `client` account, access JWT, and refresh session.                                              |
| Public                  | `POST /login`    | Authenticate an active user from OAuth2 form fields (`username` contains the email) and issue a session. |
| Refresh cookie          | `POST /refresh`  | Validate and rotate the refresh session, preserving its original absolute expiry.                        |
| Refresh cookie optional | `POST /logout`   | Revoke the matching refresh session when present and clear the refresh cookie.                           |

`/register`, `/login`, and `/refresh` return the raw access token in the FastAPI contract. The Next.js BFF stores it as `safedrop_access_token` and returns only user data to browser application code.

## Users and profile

| Access        | Endpoint                  | Purpose                                                                                                 |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Authenticated | `GET /users/me`           | Return the current non-deleted user.                                                                    |
| Authenticated | `PUT /users/me`           | Update the current user's first and/or last name.                                                       |
| Admin-only    | `POST /users`             | Create a `client` or `admin` account.                                                                   |
| Admin-only    | `GET /users`              | List non-deleted users other than the current admin, with pagination, search, and optional role filter. |
| Admin-only    | `PUT /users/{user_id}`    | Update another active user's name, email, and/or role.                                                  |
| Admin-only    | `DELETE /users/{user_id}` | Soft-delete another user and revoke all of that user's active refresh sessions.                         |

`GET /users` accepts `page`, `page_size` (maximum 100), `search`, and `user_type` (`client` or `admin`). An admin cannot update or delete itself through the parameterized routes.

## Authenticated Drops

| Access        | Endpoint                                         | Purpose                                                                                 |
| ------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Authenticated | `GET /drops`                                     | List the current user's Drops by lifecycle status, with pagination and optional search. |
| Authenticated | `POST /drops`                                    | Create an owned Drop and return its raw share token once.                               |
| Owner-only    | `GET /drops/{drop_id}`                           | Return one owned Drop.                                                                  |
| Owner-only    | `PATCH /drops/{drop_id}`                         | Update title, content, and/or maximum views when lifecycle rules allow.                 |
| Owner-only    | `DELETE /drops/{drop_id}`                        | Revoke an owned Drop idempotently by setting `revoked_at`.                              |
| Owner-only    | `GET /drops/{drop_id}/share-token`               | Decrypt and return an owned Drop's recoverable share token.                             |
| Owner-only    | `GET /drops/{drop_id}/files`                     | List finalized, physically available file metadata for an owned Drop.                   |
| Owner-only    | `POST /drops/{drop_id}/files/presign`            | Validate state and quotas, reserve a pending file, and return a presigned POST.         |
| Owner-only    | `POST /drops/{drop_id}/files/{file_id}/complete` | Verify, promote, and finalize a pending object; safe to retry after success.            |

`GET /drops` accepts `page`, `page_size` (maximum 100), `search`, and `status`. Status is one of `active`, `expired`, `consumed`, or `revoked`; it defaults to `active`.

## Guest Drops

| Access        | Endpoint                                               | Purpose                                                                    |
| ------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| Public        | `POST /guest/drops`                                    | Create a guest Drop and return its share and management capabilities.      |
| Guest-managed | `POST /guest/drops/{drop_id}/files/presign`            | Reserve the guest Drop's single optional file and return a presigned POST. |
| Guest-managed | `POST /guest/drops/{drop_id}/files/{file_id}/complete` | Verify, promote, and finalize the guest's pending object.                  |

The management header is required for both file endpoints:

```http
X-Guest-Management-Token: <raw-management-token>
```

There is no guest list, edit, revoke, or management-token recovery endpoint in the current API.

## Recipient access

| Access                  | Endpoint               | Purpose                                                                                      |
| ----------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| Public share capability | `GET /d/{share_token}` | Atomically consume one view and return text plus temporary download URLs for an active Drop. |

The endpoint hashes the path token, locks the Drop, applies state checks, and increments the view count. Unknown and terminal tokens return the same `404` response. Clients must not automatically retry a successful-capability read because each successful request consumes a view.

## Statistics

| Access        | Endpoint                   | Purpose                                                                     |
| ------------- | -------------------------- | --------------------------------------------------------------------------- |
| Authenticated | `GET /stats/me/storage`    | Return the current user's active-storage usage and 30 MiB limit.            |
| Admin-only    | `GET /admin/stats`         | Return user and Drop counts split by lifecycle and guest/account ownership. |
| Admin-only    | `GET /admin/stats/storage` | Return recorded platform physical-storage usage and the 1 GiB limit.        |

## Browser BFF mapping

The frontend exposes only the authenticated routes it uses under `/api`: authentication, current user/profile, Drops and files, current storage, admin users, and admin statistics. Most preserve the backend method and path. The notable translation is:

```text
POST /api/drops/{id}/revoke -> DELETE /drops/{id}
```

Guest and recipient operations intentionally call FastAPI directly through `NEXT_PUBLIC_API_URL` and therefore are not duplicated as BFF Route Handlers.
