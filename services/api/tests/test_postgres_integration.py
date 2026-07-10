import os
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.exc import DBAPIError

from fashion_api.main import app

POSTGRES_TEST_DATABASE_URL = os.getenv("POSTGRES_TEST_DATABASE_URL")
pytestmark = [
    pytest.mark.postgres,
    pytest.mark.skipif(not POSTGRES_TEST_DATABASE_URL, reason="POSTGRES_TEST_DATABASE_URL is not configured."),
]


def test_postgres_round_trip_and_version_trigger() -> None:
    assert POSTGRES_TEST_DATABASE_URL is not None
    payload = {
        "name": "PostgreSQL Integration Dress",
        "initial_version": {
            "source": "system",
            "change_summary": "Created by the PostgreSQL integration test.",
            "spec_snapshot": {
                "schema_version": "1.0.0",
                "garment_category": "dress",
                "color": {"primary_color": {"name": {"value": "red"}}},
            },
        },
    }

    with TestClient(app) as client:
        assert client.get("/health").status_code == 200
        response = client.post("/designs", json=payload)

    assert response.status_code == 201
    design = response.json()
    design_id = UUID(design["id"])
    version_id = UUID(design["current_version_id"])
    engine = create_engine(POSTGRES_TEST_DATABASE_URL)

    connection = engine.connect()
    transaction = connection.begin()
    try:
        with pytest.raises(DBAPIError, match="design_versions are immutable"):
            connection.execute(
                text("UPDATE design_versions SET change_summary = :summary WHERE id = :version_id"),
                {"summary": "Attempted history rewrite", "version_id": version_id},
            )
    finally:
        transaction.rollback()
        connection.close()

    with engine.begin() as connection:
        summary = connection.scalar(
            text("SELECT change_summary FROM design_versions WHERE id = :version_id"),
            {"version_id": version_id},
        )
        connection.execute(text("DELETE FROM designs WHERE id = :design_id"), {"design_id": design_id})

    engine.dispose()
    assert summary == "Created by the PostgreSQL integration test."
