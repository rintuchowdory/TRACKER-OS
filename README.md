# TRACKER-OS

## Tests

Backend (pytest, SQLite-backed):

```bash
cd backend
pip install -r requirements-dev.txt
pytest --cov=app --cov-report=term-missing
```

Frontend (vitest):

```bash
cd frontend
npm ci
npm test              # npm run test:coverage for a coverage report
```
