import hashlib
import io
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID

from PIL import Image, UnidentifiedImageError

from fashion_api.rendering import PermanentRenderError


@dataclass(frozen=True)
class StoredRender:
    object_key: str
    content_type: str
    byte_size: int
    sha256: str
    width: int
    height: int
    output_format: str


class LocalRenderStorage:
    def __init__(self, root: Path, max_asset_bytes: int) -> None:
        self.root = root.resolve()
        self.max_asset_bytes = max_asset_bytes
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, object_key: str) -> Path:
        candidate = (self.root / object_key).resolve()
        if not candidate.is_relative_to(self.root):
            raise ValueError("Invalid storage object key.")
        return candidate

    def store(
        self,
        *,
        owner_id: UUID,
        design_id: UUID,
        design_version_id: UUID,
        render_job_id: UUID,
        asset_id: UUID,
        image_bytes: bytes,
        content_type: str,
    ) -> StoredRender:
        if not image_bytes or len(image_bytes) > self.max_asset_bytes:
            raise PermanentRenderError("The generated image exceeds the allowed size.")
        try:
            with Image.open(io.BytesIO(image_bytes)) as image:
                image.verify()
            with Image.open(io.BytesIO(image_bytes)) as image:
                width, height = image.size
                image_format = str(image.format or "").lower()
        except (UnidentifiedImageError, OSError) as error:
            raise PermanentRenderError("The generated file is not a valid image.") from error
        if image_format != "png" or content_type != "image/png":
            raise PermanentRenderError("Only PNG render assets are supported in the MVP.")
        if width <= 0 or height <= 0 or width * height > 8_294_400:
            raise PermanentRenderError("The generated image dimensions are unsupported.")

        # Prefixes keep local Windows paths below legacy MAX_PATH; the full IDs remain in PostgreSQL.
        object_key = (
            f"renders/{owner_id.hex[:12]}/{design_id.hex[:12]}/{design_version_id.hex[:12]}/"
            f"{render_job_id.hex}/{asset_id.hex}.png"
        )
        target = self._path(object_key)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary_path: str | None = None
        try:
            with tempfile.NamedTemporaryFile(dir=target.parent, suffix=".tmp", delete=False) as handle:
                temporary_path = handle.name
                handle.write(image_bytes)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_path, target)
        finally:
            if temporary_path and Path(temporary_path).exists():
                Path(temporary_path).unlink()

        return StoredRender(
            object_key=object_key,
            content_type=content_type,
            byte_size=len(image_bytes),
            sha256=hashlib.sha256(image_bytes).hexdigest(),
            width=width,
            height=height,
            output_format="png",
        )

    def path_for(self, object_key: str) -> Path:
        path = self._path(object_key)
        if not path.is_file():
            raise FileNotFoundError(object_key)
        return path

    def delete(self, object_key: str) -> None:
        path = self._path(object_key)
        path.unlink(missing_ok=True)
