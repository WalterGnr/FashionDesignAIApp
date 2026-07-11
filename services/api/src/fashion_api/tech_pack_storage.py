import hashlib
import os
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID


@dataclass(frozen=True)
class StoredTechPack:
    object_key: str
    byte_size: int
    sha256: str


class LocalTechPackStorage:
    def __init__(self, root: Path, max_asset_bytes: int) -> None:
        self.root = root.resolve()
        self.max_asset_bytes = max_asset_bytes
        self.root.mkdir(parents=True, exist_ok=True)

    def write(self, job_id: UUID, output_format: str, content: bytes) -> StoredTechPack:
        signatures = {"pdf": b"%PDF-", "xlsx": b"PK\x03\x04"}
        if output_format not in signatures or not content.startswith(signatures[output_format]):
            raise ValueError(f"Invalid {output_format} output.")
        if not content or len(content) > self.max_asset_bytes:
            raise ValueError("Tech-pack asset size is outside the configured limit.")

        object_key = f"{job_id}/{job_id}.{output_format}"
        target = self.path_for(object_key, must_exist=False)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(f".{output_format}.tmp")
        temporary.write_bytes(content)
        os.replace(temporary, target)
        return StoredTechPack(
            object_key=object_key,
            byte_size=len(content),
            sha256=hashlib.sha256(content).hexdigest(),
        )

    def path_for(self, object_key: str, *, must_exist: bool = True) -> Path:
        path = (self.root / object_key).resolve()
        if self.root not in path.parents:
            raise ValueError("Invalid tech-pack object key.")
        if must_exist and not path.is_file():
            raise FileNotFoundError(object_key)
        return path
