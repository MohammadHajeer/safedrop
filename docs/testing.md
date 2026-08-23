# Testing and quality

Run commands from the repository root unless a section says otherwise. Backend commands require a configured `backend/.env`; the test suite also requires an isolated PostgreSQL database through `TEST_DATABASE_URL`.

## Backend tests

From `backend` with the virtual environment active:

```bash
python -m pytest
```

Windows without activation:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pytest
```

Useful focused runs follow normal pytest file and node selectors:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_auth.py
.\.venv\Scripts\python.exe -m pytest tests\test_drop_files.py
.\.venv\Scripts\python.exe -m pytest tests\test_admin.py::test_client_cannot_list_users
.\.venv\Scripts\python.exe -m pytest unit_tests\test_admin_storage.py
```

The suite covers health, registration/login/refresh/logout, admin authorization and user management, owner data isolation, active-storage semantics, and authenticated and guest upload flows.

### Test infrastructure warning

The session fixture creates application tables in `TEST_DATABASE_URL`, then drops them and the `auth` schema at the end. Use a dedicated test database only.

`tests/test_drop_files.py` performs real object operations against the configured test S3-compatible bucket. It requires all five `TEST_*` storage variables and deletes the test objects it creates. Use isolated test credentials and never point the fixture at a production bucket.

## Ruff

From `backend`:

```powershell
.\.venv\Scripts\python.exe -m ruff check app tests unit_tests
.\.venv\Scripts\python.exe -m ruff format --check app tests unit_tests
```

To apply Python formatting intentionally:

```powershell
.\.venv\Scripts\python.exe -m ruff format app tests unit_tests
```

## Frontend checks

From the repository root:

```powershell
pnpm --dir frontend lint
pnpm --dir frontend exec prettier --check .
pnpm --dir frontend build
```

`lint` runs ESLint with Next.js core-web-vitals and TypeScript rules. `build` performs the production Next.js compilation and associated type validation. Prettier is installed in the frontend workspace.

To intentionally format frontend source:

```powershell
pnpm --dir frontend exec prettier --write .
```

## Husky and lint-staged

Installing root dependencies runs the Husky `prepare` script. The pre-commit hook executes:

```powershell
pnpm exec lint-staged
```

For staged files it currently applies:

- ESLint fix and Prettier write to `frontend/**/*.{js,jsx,ts,tsx}`;
- Ruff fix and Ruff format to `backend/{app,tests}/**/*.py`.

The hook does not currently include Markdown, backend `unit_tests`, CSS, or other file types. Run the explicit checks above when those areas change.

## Documentation verification

Prettier can check the project documentation from the frontend workspace:

```powershell
pnpm --dir frontend exec prettier --check ..\README.md "..\docs\**\*.md" README.md
```

Also verify relative links and code paths when files move; Markdown formatting alone does not validate targets or endpoint accuracy.

## Manual verification checklist

Use a development database and non-production storage bucket.

- [ ] Create a guest Drop without a file and open its recipient link.
- [ ] Create a guest Drop with one file, completing the presign/direct-upload/finalize flow.
- [ ] Confirm recipient access displays text and a working temporary download link.
- [ ] Confirm a recipient refresh consumes another view and a consumed link becomes unavailable.
- [ ] Register and log in as a normal `client`.
- [ ] Remove or expire the access cookie while retaining a valid refresh cookie; confirm BFF recovery and refresh rotation.
- [ ] Create an authenticated Drop with multiple valid files and observe upload progress.
- [ ] Confirm owner lists, search, detail, share-link recovery, and permitted updates.
- [ ] Revoke an owned Drop and confirm recipient access becomes uniformly unavailable.
- [ ] Update the profile and confirm current-user UI refreshes.
- [ ] Confirm active-storage usage changes after uploads and terminal lifecycle transitions.
- [ ] Confirm a client receives `403` from admin-only FastAPI endpoints.
- [ ] As an admin, verify platform statistics and create, edit, role-change, and soft-delete another user.
- [ ] Log out and confirm protected navigation returns to login and the refresh session cannot be reused.
- [ ] Check both light and dark themes, including system-theme selection.
- [ ] Check public, recipient, dashboard, Drop, profile, and admin layouts on narrow and wide viewports.
