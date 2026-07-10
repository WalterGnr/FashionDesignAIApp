from pathlib import Path

from celery import Celery

from fashion_api.config import get_settings

settings = get_settings()
Path(".data").mkdir(parents=True, exist_ok=True)

celery_app = Celery(
    "fashion_design_ai",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["fashion_api.tasks"],
)
celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True,
    broker_transport_options={"visibility_timeout": 900},
    result_backend_transport_options={"visibility_timeout": 900},
    visibility_timeout=900,
    task_track_started=True,
    beat_schedule={
        "dispatch-render-outbox": {
            "task": "fashion.render.dispatch_outbox",
            "schedule": 3.0,
        }
    },
)
