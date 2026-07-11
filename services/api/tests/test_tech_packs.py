from io import BytesIO
from pathlib import Path
from uuid import UUID
from zipfile import ZipFile

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from fashion_api.config import Settings, get_settings
from fashion_api.main import app
from fashion_api.models import OutboxEvent, TechPackAsset, TechPackInput, TechPackJob
from fashion_api.tech_pack_renderers import render_pdf, render_xlsx
from fashion_api.tech_pack_storage import LocalTechPackStorage
from fashion_api.tech_packs import TransientTechPackError, process_tech_pack_once


def complete_spec() -> dict:
    value = lambda item: {"value": item, "status": "confirmed", "source": "user"}  # noqa: E731
    measurement = lambda item, unit="in": {  # noqa: E731
        "value": item,
        "unit": unit,
        "status": "confirmed",
        "source": "user",
    }
    return {
        "schema_version": "1.0.0",
        "garment_category": "dress",
        "identity": {"dress_type": value("evening_gown"), "occasion": value("formal")},
        "silhouette": value("a_line"),
        "neckline": {"type": value("v_neck"), "depth": value("medium")},
        "sleeves": {"type": value("sleeveless"), "length_category": value("none")},
        "bodice": {"fit": value("fitted"), "waistline": value("natural")},
        "skirt": {"shape": value("full")},
        "length": {"category": value("floor")},
        "fabric": {
            "primary": {
                "name": value("silk_satin"),
                "fiber_content": value("100% silk"),
                "weight": value("19 momme"),
                "drape": value("fluid"),
                "stretch": value("none"),
                "sheerness": value("opaque"),
                "finish": value("lustrous"),
            }
        },
        "color": {
            "primary_color": {"name": value("oxblood")},
            "secondary_colors": value([]),
            "colorway_name": value("Oxblood No. 1"),
            "pattern_or_print": value("solid"),
            "finish": value("satin"),
        },
        "closures": {"type": value("invisible_zipper"), "placement": value("center_back")},
        "lining": {"coverage": value("full"), "fabric": {"name": value("silk_habotai")}},
        "measurements": {
            "bust": measurement(36),
            "waist": measurement(28),
            "hip": measurement(39),
            "dress_length": measurement(58),
        },
        "construction_notes": [
            {
                "id": "note-1",
                "text": '=HYPERLINK("https://unsafe.example","do not execute")',
                "status": "confirmed",
                "source": "user",
            }
        ],
        "pattern_notes": [],
        "assumptions": [],
        "warnings": [],
    }


def create_design(client: TestClient, spec: dict) -> dict:
    response = client.post(
        "/designs",
        json={
            "name": "Oxblood Gala Dress",
            "initial_version": {
                "source": "text",
                "change_summary": "Production details confirmed.",
                "spec_snapshot": spec,
                "locked_fields_snapshot": [],
            },
        },
    )
    assert response.status_code == 201
    return response.json()


def test_blocked_readiness_requires_explicit_draft_acknowledgement(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    design = create_design(
        client,
        {"schema_version": "1.0.0", "garment_category": "dress"},
    )
    ids = {"design_id": design["id"], "design_version_id": design["current_version_id"]}

    readiness = client.post("/tech-packs/readiness", json=ids)
    blocked = client.post("/tech-packs", json={**ids, "formats": ["pdf", "xlsx"]})

    assert readiness.status_code == 200
    assert readiness.json()["status"] == "blocked"
    assert any(item["code"] == "missing_measurement_bust" for item in readiness.json()["issues"])
    assert blocked.status_code == 202
    assert blocked.json()["job"]["status"] == "blocked"
    assert blocked.json()["job"]["format_statuses"] == {"pdf": "blocked", "xlsx": "blocked"}

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(TechPackInput)) == 1
        assert session.scalar(select(func.count()).select_from(OutboxEvent)) == 0


def test_worker_generates_traceable_pdf_and_safe_workbook(
    client: TestClient,
    session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    settings = Settings(tech_pack_storage_root=tmp_path)
    app.dependency_overrides[get_settings] = lambda: settings
    design = create_design(client, complete_spec())
    payload = {
        "design_id": design["id"],
        "design_version_id": design["current_version_id"],
        "formats": ["pdf", "xlsx"],
        "page_size": "letter",
        "client_idempotency_key": "production-pack-v1",
    }

    created = client.post("/tech-packs", json=payload)
    duplicate = client.post("/tech-packs", json=payload)
    assert created.status_code == 202
    assert duplicate.json()["reused_existing"] is True
    job = created.json()["job"]
    assert job["readiness_status"] == "ready_with_warnings"
    assert job["status"] == "queued"

    with session_factory() as session:
        stored_input = session.get(TechPackInput, UUID(job["id"]))
        assert stored_input is not None
        first_pdf = render_pdf(stored_input.snapshot, stored_input.readiness_issues, "letter")
        second_pdf = render_pdf(stored_input.snapshot, stored_input.readiness_issues, "letter")
        first_xlsx = render_xlsx(stored_input.snapshot, stored_input.readiness_issues)
        second_xlsx = render_xlsx(stored_input.snapshot, stored_input.readiness_issues)
        assert first_pdf == second_pdf
        assert first_xlsx == second_xlsx

    result = process_tech_pack_once(
        session_factory,
        UUID(job["id"]),
        "pytest-tech-pack-worker",
        LocalTechPackStorage(tmp_path, settings.tech_pack_max_asset_bytes),
    )
    assert result == "succeeded"

    completed = client.get(f"/tech-packs/{job['id']}").json()
    assert completed["status"] == "succeeded"
    assert completed["format_statuses"] == {"pdf": "succeeded", "xlsx": "succeeded"}
    assert {asset["format"] for asset in completed["assets"]} == {"pdf", "xlsx"}

    files = {}
    for asset in completed["assets"]:
        response = client.get(asset["download_path"])
        assert response.status_code == 200
        files[asset["format"]] = response.content

    pdf = PdfReader(BytesIO(files["pdf"]))
    text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    assert "PRODUCTION TECH PACK" in text
    assert "Oxblood Gala Dress" in text
    assert design["current_version_id"] in text

    with ZipFile(BytesIO(files["xlsx"])) as archive:
        workbook_xml = archive.read("xl/workbook.xml").decode("utf-8")
        all_xml = "".join(
            archive.read(name).decode("utf-8")
            for name in archive.namelist()
            if name.startswith("xl/") and name.endswith(".xml")
        )
    sheet_names = [
        "Overview",
        "Measurements",
        "Bill of Materials",
        "Colorways",
        "Construction Notes",
        "Warnings",
        "Revision Log",
    ]
    positions = [workbook_xml.index(f'name="{name}"') for name in sheet_names]
    assert positions == sorted(positions)
    assert "<f>HYPERLINK" not in all_xml
    assert "unsafe.example" in all_xml

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(TechPackJob)) == 1
        assert session.scalar(select(func.count()).select_from(TechPackAsset)) == 2


def test_worker_retries_a_transient_storage_failure(
    client: TestClient,
    session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    settings = Settings(tech_pack_storage_root=tmp_path)
    app.dependency_overrides[get_settings] = lambda: settings
    design = create_design(client, complete_spec())
    created = client.post(
        "/tech-packs",
        json={
            "design_id": design["id"],
            "design_version_id": design["current_version_id"],
            "formats": ["pdf"],
            "client_idempotency_key": "transient-storage-retry",
        },
    ).json()["job"]

    class FailingStorage(LocalTechPackStorage):
        def write(self, job_id: UUID, output_format: str, content: bytes):  # type: ignore[no-untyped-def]
            raise OSError("Temporary storage outage.")

    with pytest.raises(TransientTechPackError, match="Temporary storage outage"):
        process_tech_pack_once(
            session_factory,
            UUID(created["id"]),
            "pytest-failing-worker",
            FailingStorage(tmp_path, settings.tech_pack_max_asset_bytes),
        )

    with session_factory() as session:
        retrying = session.get(TechPackJob, UUID(created["id"]))
        assert retrying is not None
        assert retrying.status == "retrying"
        assert retrying.attempt_count == 1

    result = process_tech_pack_once(
        session_factory,
        UUID(created["id"]),
        "pytest-recovery-worker",
        LocalTechPackStorage(tmp_path, settings.tech_pack_max_asset_bytes),
    )
    assert result == "succeeded"
