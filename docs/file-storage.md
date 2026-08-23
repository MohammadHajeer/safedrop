# File storage

SafeDrop stores file metadata in PostgreSQL and file bytes in a private S3-compatible bucket. The checked-in Neon configuration defines a `safedrop-files` preview bucket; runtime access uses generic S3 endpoint, region, bucket, and credential variables.

## `DropFile` records

Each file has a database record containing:

- UUID and parent Drop UUID;
- original filename and content type;
- expected size in bytes;
- private storage key;
- creation time;
- `uploaded_at`, which distinguishes pending from finalized uploads; and
- `storage_deleted_at`, which distinguishes physically available/accounted files from cleaned files.

Storage keys and deletion markers are internal and are not exposed in owner or recipient schemas.

## Upload lifecycle

### 1. Reserve

The browser sends the filename, content type, and byte size to a presign endpoint. FastAPI verifies the account owner or guest management token, checks that the Drop is active, applies all relevant quotas, and creates a pending `DropFile` row.

The initial object key is:

```text
pending/{drop_id}/{file_id}
```

The row is committed before the signature is returned, so the declared bytes immediately reserve quota and a file slot.

### 2. Presign

FastAPI generates an S3 presigned POST valid for 300 seconds. Its conditions require:

- the reserved object key;
- the declared content type; and
- a byte length between 1 and the reserved file size.

The browser receives only the upload URL, required form fields, file ID, and expiry.

### 3. Upload directly

The browser constructs `multipart/form-data` from the returned fields and appends the file. It sends those bytes directly to object storage.

Neither Next.js nor FastAPI proxies the file body. This keeps application requests small and lets object storage handle the transfer while FastAPI remains in control of authorization and reservation.

### 4. Complete and verify

After storage accepts the POST, the browser calls the completion endpoint. FastAPI locks the reservation and treats an already-finalized row as a successful retry.

For a pending row it:

1. checks that the Drop is still active;
2. issues an S3 `HEAD` request;
3. requires the actual content length to equal the reserved size exactly;
4. requires the stored content type to equal the reserved content type;
5. copies the object to `drops/{drop_id}/{file_id}`;
6. deletes the pending object;
7. updates the database key; and
8. sets `uploaded_at`.

If the Drop became inactive or the object metadata is wrong, FastAPI deletes any pending object it can find and removes the reservation row. A missing object leaves the pending reservation in place and returns a conflict so completion can be retried after upload.

## Downloads

On successful recipient access, FastAPI selects only files where `uploaded_at` is set and `storage_deleted_at` is null. It generates a presigned `GET` URL valid for 300 seconds for each file.

The recipient receives the original name, content type, size, and temporary URL. FastAPI does not proxy download bytes, and object keys are not exposed through the API schema.

## Limits

The source constants use binary units (`1 MiB = 1,048,576 bytes`; `1 GiB = 1,073,741,824 bytes`).

| Scope                               |                                               Limit |
| ----------------------------------- | --------------------------------------------------: |
| Guest files per Drop                |                                                   1 |
| Guest file size                     |                                               5 MiB |
| Guest Drop storage                  | 5 MiB effective through the one-file/per-file rules |
| Authenticated files per Drop        |                                                   5 |
| Authenticated file size             |                                              10 MiB |
| Authenticated Drop storage          |                                              20 MiB |
| Authenticated user's active storage |                                              30 MiB |
| Platform recorded physical storage  |                                               1 GiB |

All checks are repeated by FastAPI even though the frontend also validates common authenticated and guest limits for early feedback.

## Reservation and quota accounting

Pending and finalized rows both count while `storage_deleted_at` is null. This prevents parallel reservations from bypassing limits.

Authenticated reservations lock the user row before checking and adding quota. Guest reservations lock the Drop row so concurrent requests cannot both claim the single guest file slot. Recipient access and completion also use row locks for their concurrency-sensitive transitions.

### Active user storage

The 30 MiB user quota sums pending and finalized file sizes only for the user's currently active Drops:

- not revoked;
- expiration still in the future;
- `view_count < max_views`; and
- file not marked physically deleted.

When a Drop becomes expired, consumed, or revoked, its files stop counting toward that user's active quota immediately. Raising an unexpired consumed Drop's maximum views can make its files count again.

### Platform physical storage

The 1 GiB platform calculation sums every pending or finalized `DropFile` whose `storage_deleted_at` is null, regardless of owner or Drop lifecycle. Terminal Drops therefore continue to count until their objects are actually cleaned up and their records are marked accordingly.

This counter is based on database reservations, so an abandoned pending row counts even if its presigned POST was never used. That is conservative for admission control but makes cleanup operationally important.

## Cleanup semantics

The current implementation has no scheduled or command-line cleanup worker. A 30-minute cleanup-grace constant exists in configuration, but no production code currently consumes it.

As a result:

- expiration, consumption, and revocation do not delete objects;
- abandoned pending rows and objects are not automatically reconciled;
- finalized files remain in the bucket after their Drop becomes terminal; and
- `storage_deleted_at` is part of the accounting model but is not set by an implemented cleanup job.

A production operator must provide a safe cleanup process that coordinates object deletion with database updates. Until then, do not describe storage cleanup as automatic.

## Storage test isolation

`backend/tests/test_drop_files.py` performs real S3-compatible operations through a test client and bucket. Configure the `TEST_*` storage variables with isolated credentials; never point these tests at production data. Other backend tests still require a separate `TEST_DATABASE_URL` because the test suite creates and drops schemas and tables.
