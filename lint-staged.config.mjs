export default {
  "frontend/**/*.{js,jsx,ts,tsx}": ["pnpm --dir frontend exec eslint --fix"],

  "backend/{app,tests}/**/*.py": [
    "backend/.venv/Scripts/python.exe -m ruff check --fix",
    "backend/.venv/Scripts/python.exe -m ruff format",
  ],
};
