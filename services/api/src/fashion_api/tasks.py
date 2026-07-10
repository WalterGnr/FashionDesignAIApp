import socket
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select

from fashion_api.celery_app import celery_app
from fashion_api.config import get_settings
from fashion_api.database import SessionLocal
from fashion_api.models import OutboxEvent
from fashion_api.providers import create_render_provider
from fashion_api.rendering import TransientRenderError, process_render_job_once
from fashion_api.storage import LocalRenderStorage


@celery_app.task(name="fashion.render.dispatch_outbox")
def dispatch_render_outbox() -> int:
    published = 0
    with SessionLocal() as session:
        with session.begin():
            events = session.scalars(
                select(OutboxEvent)
                .where(
                    OutboxEvent.event_type == "render_job_requested",
                    OutboxEvent.delivered_at.is_(None),
                )
                .order_by(OutboxEvent.created_at)
                .limit(25)
                .with_for_update(skip_locked=True)
            ).all()
            for event in events:
                process_render_job.delay(str(event.aggregate_id))
                event.attempt_count += 1
                event.delivered_at = datetime.now(UTC)
                published += 1
    return published


@celery_app.task(bind=True, name="fashion.render.process_job", max_retries=3)
def process_render_job(self, render_job_id: str) -> str:  # type: ignore[no-untyped-def]
    settings = get_settings()
    provider = create_render_provider(settings)
    storage = LocalRenderStorage(settings.render_storage_root, settings.render_max_asset_bytes)
    worker_id = f"{socket.gethostname()}:{self.request.id}"
    try:
        return process_render_job_once(
            SessionLocal,
            UUID(render_job_id),
            worker_id,
            provider,
            storage,
        )
    except TransientRenderError as error:
        countdown = min(60, 2 ** max(1, self.request.retries + 1))
        raise self.retry(exc=error, countdown=countdown) from error


def wake_render_dispatcher() -> None:
    dispatch_render_outbox.delay()
