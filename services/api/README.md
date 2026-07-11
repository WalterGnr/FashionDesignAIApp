# Fashion Design AI API

FastAPI service for durable designs, immutable dress versions, asynchronous concept renders, and production tech packs.

## Local Setup On Windows

From the repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\python -m pip install -e ".\services\api[dev]"
docker compose up -d postgres redis
.\.venv\Scripts\alembic -c services/api/alembic.ini upgrade head
$env:RENDER_DISPATCH_ENABLED="true"
$env:RENDER_PROVIDER="mock"
.\.venv\Scripts\python -m uvicorn fashion_api.main:app --host 127.0.0.1 --port 8000 --reload
```

In two additional PowerShell windows, run the worker and scheduler separately:

```powershell
.\.venv\Scripts\python -m celery -A fashion_api.celery_app:celery_app worker --pool=solo --loglevel=INFO
.\.venv\Scripts\python -m celery -A fashion_api.celery_app:celery_app beat --schedule=.data/celerybeat-schedule --loglevel=INFO
```

Celery requires worker and Beat to be separate processes on Windows.

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
- `POST /renders`
- `GET /renders`
- `GET /renders/{render_job_id}`
- `POST /renders/{render_job_id}/cancel`
- `GET /render-assets/{asset_id}`
- `POST /tech-packs/readiness`
- `POST /tech-packs`
- `GET /tech-packs`
- `GET /tech-packs/{tech_pack_job_id}`
- `POST /tech-packs/{tech_pack_job_id}/cancel`
- `GET /tech-pack-assets/{asset_id}`

No endpoint updates a design version, render input, or tech-pack input. PostgreSQL enforces all three immutable snapshots with triggers.
