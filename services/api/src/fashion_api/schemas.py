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
    source: Literal["text", "voice", "system", "import"]
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
