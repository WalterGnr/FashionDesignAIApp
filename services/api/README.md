# Fashion Design AI API

FastAPI service for durable designs and immutable dress versions.

## Local Setup On Windows

From the repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\python -m pip install -e ".\services\api[dev]"
docker compose up -d postgres
.\.venv\Scripts\alembic -c services/api/alembic.ini upgrade head
.\.venv\Scripts\python -m uvicorn fashion_api.main:app --host 127.0.0.1 --port 8000 --reload
```

API documentation is available at `http://127.0.0.1:8000/docs` while the service is running.

## Verification

```powershell
.\.venv\Scripts\python -m ruff check services/api
.\.venv\Scripts\python -m pytest services/api/tests
```

The default tests use an isolated in-memory database for speed. PostgreSQL remains the production and migration target; run the Alembic migration against the Docker service before considering persistence work complete.

## Implemented Endpoints

- `GET /health`
- `POST /designs`
- `GET /designs`
- `GET /designs/{design_id}`
- `POST /designs/{design_id}/versions`
- `GET /designs/{design_id}/versions`
- `GET /designs/{design_id}/versions/{version_id}`

No endpoint updates a design version. PostgreSQL also enforces immutable version snapshots with a trigger.
