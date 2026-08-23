# Drops and sharing

## What is a Drop?

A Drop is a temporary sharing record containing:

- a title and text message;
- an absolute, timezone-aware expiration;
- a maximum recipient view count;
- the current view count and optional last-access time;
- an optional owner;
- a share-token hash and, for account-owned Drops, an encrypted recoverable token; and
- zero or more `DropFile` records.

Titles contain 3–100 characters and content contains 1–10,000 characters. All Drops require at least one allowed view.

## Authenticated Drops

An authenticated Drop belongs to a `User`. Its owner can:

- create it with an expiration up to 30 days in the future;
- set 1–100 recipient views;
- attach up to five files within the authenticated storage limits;
- list and search owned Drops by lifecycle status;
- inspect Drop and finalized-file metadata;
- recover the share token;
- update title, content, and maximum views while permitted; and
- revoke the Drop.

Ownership checks occur in FastAPI and use the authenticated user's database ID. Another authenticated user receives `404` rather than access to an owner's Drop.

## Guest Drops

A guest Drop has no `owner_id`. It:

- expires no more than one hour after creation;
- allows 1–3 recipient views;
- supports one optional file up to 5 MiB; and
- returns a separate management token at creation.

Guest Drops are not added to an account dashboard. The current guest management capability authorizes only the file presign and completion endpoints; no guest edit or revoke endpoint is implemented.

## Share token

The raw share token is a recipient capability. Anyone who has it can attempt `GET /d/{share_token}`; a valid, active request consumes one view.

FastAPI hashes the supplied token with SHA-256 and performs lookup by the stored hash. The raw lookup token is not stored directly.

For authenticated Drops, FastAPI additionally stores an encrypted copy under `DROP_ENCRYPTION_KEY`. That enables the authenticated owner-only `GET /drops/{drop_id}/share-token` endpoint to recover the existing share link. This is server-side token recovery, not end-to-end encryption. Guest Drops do not store an encrypted recovery copy.

## Guest management token

Guest creation returns a different raw management token. The browser sends it in:

```http
X-Guest-Management-Token: <raw-management-token>
```

FastAPI hashes the value and uses constant-time comparison against `guest_management_token_hash`. A missing token returns `401`; an invalid token or non-guest Drop returns `404`. This capability is separate from the share token and cannot be exchanged for account authentication.

The client keeps the token only long enough to authorize the optional upload flow. Because only a hash is stored and no recovery endpoint exists, losing the raw guest management token means the upload cannot be managed through the current API.

## Lifecycle states

The computed status follows this precedence:

1. `revoked` — `revoked_at` is set;
2. `expired` — expiration is at or before the current time;
3. `consumed` — `view_count` is at least `max_views`;
4. `active` — none of the previous conditions applies.

This ordering is also used for owner list filters and administrative statistics.

| State    | Recipient access              | New files             | Owner behavior                                                                                                                  |
| -------- | ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Active   | Available and consumes a view | Allowed within quotas | View, update, recover link, or revoke                                                                                           |
| Consumed | Unavailable                   | Rejected              | Link remains recoverable; an unexpired Drop may be updated, and increasing `max_views` above `view_count` makes it active again |
| Expired  | Unavailable                   | Rejected              | Link remains recoverable; updates are rejected; it can still be revoked                                                         |
| Revoked  | Unavailable                   | Rejected              | Updates are rejected; repeated revoke is idempotent; link remains recoverable                                                   |

Revocation is soft: it sets `revoked_at` and does not delete the Drop row or its files. Expiration and consumption are derived rather than stored as separate status fields.

## Recipient access

Recipient access is an uncached `GET` request. FastAPI:

1. hashes the raw share token;
2. locks the matching Drop row to serialize concurrent views;
3. rejects unknown, revoked, expired, or consumed Drops;
4. loads finalized file records that are not marked physically deleted;
5. generates temporary download URLs;
6. increments `view_count`; and
7. records `last_accessed_at`.

A successful page load consumes exactly one view. Refreshing the recipient page issues another request and therefore consumes another view if the Drop remains active. The frontend intentionally avoids automatic retries, caching, and client refetching for this endpoint.

The response does not include `view_count`, `max_views`, owner details, internal storage keys, or capability hashes.

## Unavailable-link privacy

Unknown tokens and known but revoked, expired, or consumed Drops all return:

```text
404 Drop not found or no longer available
```

The public page maps these cases to the same unavailable experience. This avoids revealing whether a capability once referred to a real Drop. Server errors are presented separately as service availability problems.

## Limits

| Limit               |           Guest | Authenticated |
| ------------------- | --------------: | ------------: |
| Maximum expiration  |          1 hour |       30 days |
| Recipient views     |             1–3 |         1–100 |
| Files per Drop      |               1 |             5 |
| Per-file size       |           5 MiB |        10 MiB |
| File bytes per Drop | 5 MiB effective |        20 MiB |
| Active user storage |  Not applicable |        30 MiB |

The platform-wide recorded physical-storage limit is 1 GiB. Pending upload reservations count toward file counts and storage limits. See [File storage](file-storage.md) for exact accounting and cleanup behavior.
