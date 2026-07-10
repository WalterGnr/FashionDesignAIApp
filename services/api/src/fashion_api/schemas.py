from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DressSpecSnapshot(BaseModel):
    model_config = ConfigDict(extra="allow")

    schema_version: str = Field(min_length=1, max_length=40)
    garment_category: Literal["dress"]


class DesignVersionCreate(BaseModel):
    parent_version_id: UUID | None = None
    branch_id: UUID | None = None
    variation_label: str | None = Field(default=None, max_length=120)
    source: Literal["text", "voice", "ui", "system", "import"]
    created_by_actor: str = Field(default="designer", min_length=1, max_length=80)
    raw_input_ref: str | None = Field(default=None, max_length=200)
    change_summary: str = Field(min_length=1, max_length=500)
    spec_snapshot: DressSpecSnapshot
    locked_fields_snapshot: list[dict[str, Any]] = Field(default_factory=list)
    operation_ids: list[str] = Field(default_factory=list)


class DesignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    status: Literal["draft", "active"] = "draft"
    initial_version: DesignVersionCreate


class DesignVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    design_id: UUID
    version_number: int
    parent_version_id: UUID | None
    branch_id: UUID | None
    variation_label: str | None
    source: str
    created_by_actor: str
    raw_input_ref: str | None
    change_summary: str
    spec_snapshot: dict[str, Any]
    locked_fields_snapshot: list[dict[str, Any]]
    operation_ids: list[str]
    created_at: datetime


class DesignRead(BaseModel):
    id: UUID
    owner_user_id: UUID
    name: str
    garment_category: Literal["dress"]
    status: str
    current_version_id: UUID
    current_version: DesignVersionRead
    created_at: datetime
    updated_at: datetime


class DesignSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    garment_category: Literal["dress"]
    status: str
    current_version_id: UUID
    created_at: datetime
    updated_at: datetime


class HealthRead(BaseModel):
    status: Literal["ok"]
    service: str
    version: str
    environment: str
    database: Literal["reachable"]


class RenderCreate(BaseModel):
    design_id: UUID
    design_version_id: UUID
    render_style: Literal["editorial_studio", "technical_studio"] = "editorial_studio"
    view_preset: Literal["front", "three_quarter", "side", "back"] = "three_quarter"
    quality: Literal["low", "medium", "high"] = "medium"
    output_size: Literal["1024x1024", "1024x1536", "1536x1024"] = "1024x1536"
    variation_count: int = Field(default=1, ge=1, le=4)
    client_idempotency_key: str | None = Field(default=None, min_length=8, max_length=120)


class RenderAssetRead(BaseModel):
    id: UUID
    render_job_id: UUID
    content_type: str
    byte_size: int
    sha256: str
    width: int
    height: int
    output_format: str
    download_path: str
    created_at: datetime


class RenderJobRead(BaseModel):
    id: UUID
    design_id: UUID
    design_version_id: UUID
    render_style: str
    view_preset: str
    quality: str
    output_size: str
    status: str
    provider: str
    provider_model: str
    variation_index: int
    attempt_count: int
    max_attempts: int
    safe_error_code: str | None
    safe_error_message: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    updated_at: datetime
    asset: RenderAssetRead | None = None


class RenderBatchRead(BaseModel):
    jobs: list[RenderJobRead]
    reused_existing: bool
