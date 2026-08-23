# Getting started

This guide describes the repository's current local workflow. The root orchestration command is Windows-oriented because it invokes `backend\.venv\Scripts\python.exe` directly.

## Prerequisites

- Node.js compatible with the declared Next.js and tooling dependencies
- pnpm; the root manifest declares `pnpm@11.20.0`
- Python with `venv` support
- A PostgreSQL database for development and a separate PostgreSQL test database
- An S3-compatible private bucket and credentials

The checked-in Neon configuration defines a preview bucket named `safedrop-files`, but the backend works through the generic S3-compatible settings listed below.

## Install JavaScript dependencies

From the repository root:

```powershell
pnpm install
```

The root pnpm workspace includes `frontend` and installs Husky through the root `prepare` script.

## Create the Python environment

### Windows PowerShell

From the repository root:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

This path is required by the checked-in root `dev:backend` and lint-staged commands.

### macOS or Linux

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt
```

The root backend script is not cross-platform. On macOS or Linux, start FastAPI separately from `backend` with `python -m uvicorn app.main:app --reload`.

## Backend environment

Copy `backend/.env.example` to `backend/.env`, then provide deployment-specific values. Settings are loaded from `.env` while the backend working directory is `backend`.

```dotenv
# PostgreSQL
DATABASE_URL=postgresql+psycopg://app-user:replace-me@localhost:5432/safedrop
TEST_DATABASE_URL=postgresql+psycopg://app-user:replace-me@localhost:5432/safedrop_test

# Access and refresh sessions
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=false

# Fernet key used to recover authenticated owners' share tokens
DROP_ENCRYPTION_KEY=replace-with-a-valid-fernet-key

# Application object storage
STORAGE_BUCKET=safedrop-files
AWS_ACCESS_KEY_ID=replace-me
AWS_SECRET_ACCESS_KEY=replace-me
AWS_ENDPOINT_URL_S3=https://replace-with-s3-compatible-endpoint
AWS_REGION=replace-with-region

# Separate storage used by real storage integration tests
TEST_STORAGE_BUCKET=safedrop-files-test
TEST_AWS_ACCESS_KEY_ID=replace-me
TEST_AWS_SECRET_ACCESS_KEY=replace-me
TEST_AWS_ENDPOINT_URL_S3=https://replace-with-test-endpoint
TEST_AWS_REGION=replace-with-region
```

All non-test settings above are required because `Settings` declares them without defaults. `TEST_DATABASE_URL` is also required at settings load time. The five test-storage variables are optional for application startup but are required by the storage integration fixtures.

Generate development secrets without committing the results:

```powershell
backend\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
backend\.venv\Scripts\python.exe -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Use the first output for `JWT_SECRET` and the second for `DROP_ENCRYPTION_KEY`. Keep the Fernet key stable: changing it prevents recovery of existing account-owned share tokens.

## Frontend environment

Copy `frontend/.env.example` to `frontend/.env.local`:

```dotenv
FASTAPI_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

`FASTAPI_URL` is server-only and is used by Next.js Route Handlers. `NEXT_PUBLIC_API_URL` is exposed to browser code and must be browser-reachable; guest creation, guest upload authorization, and recipient access use it. Neither value should end with a slash, although the clients defensively remove one.

## Apply database migrations

From `backend`, with the virtual environment active:

```bash
python -m alembic upgrade head
```

Windows without activation:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m alembic upgrade head
Set-Location ..
```

Alembic reads `DATABASE_URL` through the same backend settings object and manages both the `public` application tables and the `auth.refresh_tokens` table.

## Run everything

On Windows, from the repository root:

```powershell
pnpm dev
```

This starts FastAPI with reload, waits for the health endpoint, and then starts Next.js.

## Run services separately

Frontend, from the repository root:

```powershell
pnpm dev:frontend
```

Backend on Windows, from the repository root:

```powershell
pnpm dev:backend
```

Backend from the `backend` directory on any platform with the environment active:

```bash
python -m uvicorn app.main:app --reload
```

## Local URLs

| Service                  | URL                                  |
| ------------------------ | ------------------------------------ |
| SafeDrop frontend        | `http://localhost:3000`              |
| FastAPI root             | `http://127.0.0.1:8000/`             |
| FastAPI health           | `http://127.0.0.1:8000/health`       |
| FastAPI database health  | `http://127.0.0.1:8000/health/db`    |
| FastAPI Swagger UI       | `http://127.0.0.1:8000/docs`         |
| FastAPI OpenAPI document | `http://127.0.0.1:8000/openapi.json` |

The repository's `docs/` directory and FastAPI's runtime `/docs` route are unrelated.

## Next steps

- Review [Authentication](authentication.md) before changing session handling.
- Review [File storage](file-storage.md) before running real upload tests.
- Use [Testing](testing.md) for automated commands and the manual verification checklist.
