from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from fashion_api.config import Settings, get_settings
from fashion_api.main import app
from fashion_api.models import OutboxEvent, RenderAsset, RenderJob, RenderJobInput
from fashion_api.providers import MockRenderProvider
from fashion_api.rendering import process_render_job_once
from fashion_api.storage import LocalRenderStorage


def create_design(client: TestClient) -> dict:
    payload = {
        "name": "Concept Render Dress",
        "initial_version": {
            "source": "text",
            "change_summary": "Prepared the dress for concept rendering.",
            "spec_snapshot": {
                "schema_version": "1.0.0",
                "garment_category": "dress",
                "identity": {"dress_type": {"value": "evening_gown", "status": "confirmed", "source": "user"}},
                "silhouette": {"value": "a_line", "status": "confirmed", "source": "user"},
                "skirt": {"shape": {"value": "full", "status": "confirmed", "source": "user"}},
                "fabric": {"primary": {"name": {"value": "satin", "status": "confirmed", "source": "user"}}},
                "color": {"primary_color": {"name": {"value": "red", "status": "confirmed", "source": "user"}}},
            },
            "locked_fields_snapshot": [],
        },
    }
    response = client.post("/designs", json=payload)
    assert response.status_code == 201
    return response.json()


def render_payload(design: dict, variation_count: int = 2) -> dict:
    return {
        "design_id": design["id"],
        "design_version_id": design["current_version_id"],
        "render_style": "editorial_studio",
        "view_preset": "three_quarter",
        "quality": "medium",
        "output_size": "1024x1536",
        "variation_count": variation_count,
        "client_idempotency_key": "desktop-version-1",
    }


def test_render_request_persists_inputs_outbox_and_reuses_idempotent_jobs(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    design = create_design(client)
    first = client.post("/renders", json=render_payload(design))
    second = client.post("/renders", json=render_payload(design))

    assert first.status_code == 202
    assert [job["variation_index"] for job in first.json()["jobs"]] == [1, 2]
    assert second.status_code == 202
    assert second.json()["reused_existing"] is True
    assert [job["id"] for job in second.json()["jobs"]] == [job["id"] for job in first.json()["jobs"]]

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(RenderJob)) == 2
        assert session.scalar(select(func.count()).select_from(RenderJobInput)) == 2
        assert session.scalar(select(func.count()).select_from(OutboxEvent)) == 2
        stored_input = session.scalar(select(RenderJobInput).order_by(RenderJobInput.render_job_id))
        assert stored_input is not None
        assert "red" in stored_input.normalized_prompt
        assert len(stored_input.input_hash) == 64


def test_queued_render_can_be_canceled(client: TestClient) -> None:
    design = create_design(client)
    created = client.post("/renders", json=render_payload(design, variation_count=1)).json()["jobs"][0]

    canceled = client.post(f"/renders/{created['id']}/cancel")

    assert canceled.status_code == 200
    assert canceled.json()["status"] == "canceled"
    assert client.get(f"/renders/{created['id']}").json()["status"] == "canceled"


def test_mock_worker_generates_and_serves_a_traceable_png(
    client: TestClient,
    session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    settings = Settings(render_storage_root=tmp_path, render_max_asset_bytes=25 * 1024 * 1024)
    app.dependency_overrides[get_settings] = lambda: settings
    design = create_design(client)
    created = client.post("/renders", json=render_payload(design, variation_count=1)).json()["jobs"][0]
    storage = LocalRenderStorage(tmp_path, settings.render_max_asset_bytes)

    result = process_render_job_once(
        session_factory,
        UUID(created["id"]),
        "pytest-worker",
        MockRenderProvider(),
        storage,
    )

    assert result == "succeeded"
    completed = client.get(f"/renders/{created['id']}")
    assert completed.status_code == 200
    body = completed.json()
    assert body["status"] == "succeeded"
    assert body["provider"] == "mock"
    assert body["asset"]["width"] == 1024
    assert body["asset"]["height"] == 1536
    assert len(body["asset"]["sha256"]) == 64

    asset_response = client.get(body["asset"]["download_path"])
    assert asset_response.status_code == 200
    assert asset_response.headers["content-type"] == "image/png"

    with session_factory() as session:
        asset = session.scalar(select(RenderAsset).where(RenderAsset.render_job_id == UUID(created["id"])))
        assert asset is not None
        path = storage.path_for(asset.object_key)
        with Image.open(path) as image:
            assert image.size == (1024, 1536)
            assert image.getbbox() is not None
