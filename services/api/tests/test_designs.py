from copy import deepcopy

from fastapi.testclient import TestClient


def minimal_spec(color: str | None = None) -> dict:
    return {
        "schema_version": "1.0.0",
        "garment_category": "dress",
        "identity": {"dress_type": {"value": "evening_gown", "status": "confirmed", "source": "user"}},
        "color": {"primary_color": {"name": {"value": color, "status": "confirmed", "source": "user"}}},
    }


def design_payload() -> dict:
    return {
        "name": "Red Satin Study",
        "status": "draft",
        "initial_version": {
            "source": "text",
            "created_by_actor": "designer",
            "raw_input_ref": "desktop-command-1",
            "change_summary": "Created the initial dress.",
            "spec_snapshot": minimal_spec("red"),
            "locked_fields_snapshot": [],
            "operation_ids": ["operation-1"],
        },
    }


def test_create_design_persists_initial_immutable_version(client: TestClient) -> None:
    response = client.post("/designs", json=design_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["garment_category"] == "dress"
    assert body["current_version"]["version_number"] == 1
    assert body["current_version"]["spec_snapshot"]["color"]["primary_color"]["name"]["value"] == "red"
    assert body["current_version_id"] == body["current_version"]["id"]


def test_new_version_advances_current_pointer_without_rewriting_history(client: TestClient) -> None:
    created = client.post("/designs", json=design_payload()).json()
    original_version = deepcopy(created["current_version"])
    next_payload = {
        "parent_version_id": original_version["id"],
        "source": "voice",
        "created_by_actor": "designer",
        "raw_input_ref": "voice-event-2",
        "change_summary": "Changed the dress to black.",
        "spec_snapshot": minimal_spec("black"),
        "locked_fields_snapshot": [],
        "operation_ids": ["operation-2"],
    }

    version_response = client.post(f"/designs/{created['id']}/versions", json=next_payload)
    design_response = client.get(f"/designs/{created['id']}")
    history_response = client.get(f"/designs/{created['id']}/versions")

    assert version_response.status_code == 201
    assert version_response.json()["version_number"] == 2
    assert design_response.json()["current_version_id"] == version_response.json()["id"]
    history = history_response.json()
    assert [version["version_number"] for version in history] == [1, 2]
    assert history[0] == original_version
    assert history[1]["spec_snapshot"]["color"]["primary_color"]["name"]["value"] == "black"


def test_parent_version_must_belong_to_design(client: TestClient) -> None:
    first = client.post("/designs", json=design_payload()).json()
    second_payload = design_payload()
    second_payload["name"] = "Second Dress"
    second = client.post("/designs", json=second_payload).json()
    next_payload = {
        "parent_version_id": second["current_version_id"],
        "source": "text",
        "change_summary": "Invalid cross-design parent.",
        "spec_snapshot": minimal_spec("black"),
    }

    response = client.post(f"/designs/{first['id']}/versions", json=next_payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Parent version does not belong to this design."


def test_mvp_rejects_non_dress_spec(client: TestClient) -> None:
    payload = design_payload()
    payload["initial_version"]["spec_snapshot"]["garment_category"] = "jacket"

    response = client.post("/designs", json=payload)

    assert response.status_code == 422


def test_design_versions_expose_no_mutation_endpoint(client: TestClient) -> None:
    created = client.post("/designs", json=design_payload()).json()
    version_url = f"/designs/{created['id']}/versions/{created['current_version_id']}"

    assert client.patch(version_url, json={"change_summary": "Rewrite history"}).status_code == 405
    assert client.delete(version_url).status_code == 405
