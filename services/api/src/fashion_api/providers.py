import base64
import io
import random
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

import openai
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFilter

from fashion_api.config import Settings
from fashion_api.models import RenderJob, RenderJobInput

if TYPE_CHECKING:
    from fashion_api.rendering import GeneratedRender


class RenderProvider(ABC):
    @abstractmethod
    def generate(self, job: RenderJob, job_input: RenderJobInput) -> "GeneratedRender":
        raise NotImplementedError


def _spec_value(spec: dict, path: str, fallback: str) -> str:
    current = spec
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return fallback
        current = current[part]
    if isinstance(current, dict):
        current = current.get("value")
    return str(current or fallback).lower().replace("_", " ")


COLOR_MAP = {
    "black": "#202124",
    "white": "#f4f1ea",
    "ivory": "#eee5d1",
    "red": "#a02f3d",
    "burgundy": "#722a38",
    "navy": "#263851",
    "blue": "#365e82",
    "green": "#2f6957",
    "emerald": "#236348",
    "pink": "#c77f8f",
    "purple": "#655078",
    "gold": "#b78c43",
    "silver": "#9da5a6",
}


def _hex_color(value: str) -> str:
    if value.startswith("#") and len(value) == 7:
        return value
    return COLOR_MAP.get(value, "#8f3945")


def _rgb(hex_color: str) -> tuple[int, int, int]:
    return tuple(int(hex_color[index : index + 2], 16) for index in (1, 3, 5))  # type: ignore[return-value]


def _blend(color: tuple[int, int, int], other: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(channel * (1 - amount) + target * amount) for channel, target in zip(color, other, strict=True))


class MockRenderProvider(RenderProvider):
    def generate(self, job: RenderJob, job_input: RenderJobInput) -> "GeneratedRender":
        width, height = (int(value) for value in job.output_size.split("x"))
        seed = int(job_input.input_hash[:12], 16) + job.variation_index
        randomizer = random.Random(seed)
        image = Image.new("RGB", (width, height), "#ecebe7")
        draw = ImageDraw.Draw(image)

        for y in range(height):
            tone = round(247 - 22 * (y / height))
            draw.line((0, y, width, y), fill=(tone, tone, max(220, tone - 2)))

        shadow_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        shadow = ImageDraw.Draw(shadow_layer)
        center_x = width * (0.49 + randomizer.uniform(-0.015, 0.015))
        floor_y = height * 0.91
        shadow.ellipse(
            (center_x - width * 0.19, floor_y - height * 0.018, center_x + width * 0.19, floor_y + height * 0.025),
            fill=(38, 40, 38, 58),
        )
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(max(10, width // 65)))
        image.paste(shadow_layer, (0, 0), shadow_layer)
        draw = ImageDraw.Draw(image, "RGBA")

        skin = (194, 169, 147, 255)
        dark_skin = (151, 127, 108, 255)
        head_y = height * 0.105
        head_w = width * 0.075
        head_h = height * 0.07
        draw.ellipse((center_x - head_w / 2, head_y, center_x + head_w / 2, head_y + head_h), fill=skin)
        draw.rounded_rectangle(
            (center_x - width * 0.018, head_y + head_h * 0.8, center_x + width * 0.018, head_y + head_h * 1.35),
            radius=width * 0.01,
            fill=dark_skin,
        )

        shoulder_y = height * 0.205
        waist_y = height * 0.405
        hip_y = height * 0.49
        hem_y = height * 0.87
        shoulder_half = width * 0.125
        waist_half = width * 0.07
        hip_half = width * 0.105

        draw.line(
            (center_x - shoulder_half * 0.85, shoulder_y, center_x - width * 0.175, height * 0.56),
            fill=skin,
            width=max(12, width // 43),
        )
        draw.line(
            (center_x + shoulder_half * 0.85, shoulder_y, center_x + width * 0.175, height * 0.56),
            fill=skin,
            width=max(12, width // 43),
        )
        draw.line(
            (center_x - width * 0.045, hem_y - height * 0.015, center_x - width * 0.052, floor_y),
            fill=skin,
            width=max(14, width // 40),
        )
        draw.line(
            (center_x + width * 0.045, hem_y - height * 0.015, center_x + width * 0.052, floor_y),
            fill=skin,
            width=max(14, width // 40),
        )

        color_name = _spec_value(job_input.spec_snapshot, "color.primary_color.name", "burgundy")
        base_color = _rgb(_hex_color(color_name))
        highlight = _blend(base_color, (255, 255, 255), 0.3)
        shadow_color = _blend(base_color, (18, 20, 22), 0.28)
        fabric = _spec_value(job_input.spec_snapshot, "fabric.primary.name", "woven")
        silhouette = _spec_value(job_input.spec_snapshot, "silhouette", "a line")
        skirt_shape = _spec_value(job_input.spec_snapshot, "skirt.shape", silhouette)
        sleeve_type = _spec_value(job_input.spec_snapshot, "sleeves.type", "sleeveless")
        neckline = _spec_value(job_input.spec_snapshot, "neckline.type", "soft scoop")

        bodice = [
            (center_x - shoulder_half, shoulder_y),
            (center_x + shoulder_half, shoulder_y),
            (center_x + waist_half, waist_y),
            (center_x - waist_half, waist_y),
        ]
        draw.polygon(bodice, fill=(*base_color, 255))

        if "sweetheart" in neckline:
            draw.polygon(
                [
                    (center_x - shoulder_half * 0.78, shoulder_y - 1),
                    (center_x - width * 0.02, shoulder_y + height * 0.03),
                    (center_x, shoulder_y + height * 0.015),
                    (center_x + width * 0.02, shoulder_y + height * 0.03),
                    (center_x + shoulder_half * 0.78, shoulder_y - 1),
                ],
                fill=(236, 232, 224, 255),
            )
        elif "off shoulder" in neckline:
            draw.arc(
                (
                    center_x - shoulder_half,
                    shoulder_y - height * 0.012,
                    center_x + shoulder_half,
                    shoulder_y + height * 0.06,
                ),
                10,
                170,
                fill=highlight,
                width=max(8, width // 80),
            )
        else:
            draw.ellipse(
                (
                    center_x - width * 0.045,
                    shoulder_y - height * 0.018,
                    center_x + width * 0.045,
                    shoulder_y + height * 0.042,
                ),
                fill=(235, 231, 224, 255),
            )

        if sleeve_type not in {"sleeveless", "unspecified", "none"}:
            sleeve_length = height * (
                0.24 if any(value in sleeve_type for value in ("long", "bishop", "bell")) else 0.105
            )
            sleeve_width = width * (
                0.06 if any(value in sleeve_type for value in ("puff", "bishop", "bell")) else 0.038
            )
            for direction in (-1, 1):
                shoulder_x = center_x + direction * shoulder_half * 0.88
                draw.polygon(
                    [
                        (shoulder_x - sleeve_width, shoulder_y),
                        (shoulder_x + sleeve_width, shoulder_y),
                        (shoulder_x + direction * width * 0.055 + sleeve_width * 0.45, shoulder_y + sleeve_length),
                        (shoulder_x + direction * width * 0.055 - sleeve_width * 0.45, shoulder_y + sleeve_length),
                    ],
                    fill=(*base_color, 245),
                )

        if any(value in skirt_shape for value in ("column", "shift")):
            hem_half = width * 0.115
        elif "mermaid" in skirt_shape:
            hem_half = width * 0.255
        elif any(value in skirt_shape for value in ("full", "ball")):
            hem_half = width * 0.31
        else:
            hem_half = width * 0.235

        if "mermaid" in skirt_shape:
            skirt = [
                (center_x - waist_half, waist_y),
                (center_x - hip_half, hip_y),
                (center_x - width * 0.075, height * 0.69),
                (center_x - hem_half, hem_y),
                (center_x + hem_half, hem_y),
                (center_x + width * 0.075, height * 0.69),
                (center_x + hip_half, hip_y),
                (center_x + waist_half, waist_y),
            ]
        else:
            skirt = [
                (center_x - waist_half, waist_y),
                (center_x - hem_half, hem_y),
                (center_x + hem_half, hem_y),
                (center_x + waist_half, waist_y),
            ]
        draw.polygon(skirt, fill=(*base_color, 255))

        fold_count = 8 if any(value in skirt_shape for value in ("full", "ball")) else 5
        for index in range(1, fold_count):
            ratio = index / fold_count
            x = center_x - hem_half + ratio * hem_half * 2
            top_x = center_x - waist_half + ratio * waist_half * 2
            fold_color = highlight if index % 2 else shadow_color
            alpha = 100 if "satin" in fabric or "silk" in fabric else 60
            draw.line(
                (top_x, waist_y + height * 0.015, x, hem_y - height * 0.008),
                fill=(*fold_color, alpha),
                width=max(3, width // 180),
            )

        if any(value in fabric for value in ("satin", "silk")):
            sheen = Image.new("RGBA", image.size, (0, 0, 0, 0))
            sheen_draw = ImageDraw.Draw(sheen)
            sheen_draw.polygon(
                [
                    (center_x - waist_half * 0.25, waist_y),
                    (center_x + waist_half * 0.2, waist_y),
                    (center_x + hem_half * 0.08, hem_y),
                    (center_x - hem_half * 0.42, hem_y),
                ],
                fill=(*highlight, 75),
            )
            sheen = sheen.filter(ImageFilter.GaussianBlur(max(6, width // 100)))
            image.paste(sheen, (0, 0), sheen)

        output = io.BytesIO()
        image.save(output, format="PNG", optimize=True)
        from fashion_api.rendering import GeneratedRender

        return GeneratedRender(image_bytes=output.getvalue(), content_type="image/png")


class OpenAIImageProvider(RenderProvider):
    def __init__(self, settings: Settings) -> None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required when RENDER_PROVIDER=openai.")
        self.client = OpenAI(api_key=settings.openai_api_key.get_secret_value())

    def generate(self, job: RenderJob, job_input: RenderJobInput) -> "GeneratedRender":
        from fashion_api.rendering import GeneratedRender, PermanentRenderError, TransientRenderError

        try:
            result = self.client.images.generate(
                model=job.provider_model,
                prompt=job_input.normalized_prompt,
                size=job.output_size,  # type: ignore[arg-type]
                quality=job.quality,  # type: ignore[arg-type]
                output_format="png",
            )
        except (
            openai.APITimeoutError,
            openai.APIConnectionError,
            openai.RateLimitError,
            openai.InternalServerError,
        ) as error:
            raise TransientRenderError("The image provider is temporarily unavailable.") from error
        except openai.BadRequestError as error:
            if getattr(error, "code", None) == "moderation_blocked":
                raise PermanentRenderError("The image provider declined this render request.") from error
            raise PermanentRenderError("The image provider rejected the render input.") from error

        if not result.data or not result.data[0].b64_json:
            raise TransientRenderError("The image provider returned no image data.")
        try:
            image_bytes = base64.b64decode(result.data[0].b64_json, validate=True)
        except ValueError as error:
            raise TransientRenderError("The image provider returned invalid image data.") from error
        return GeneratedRender(
            image_bytes=image_bytes,
            content_type="image/png",
            provider_request_id=getattr(result, "_request_id", None),
        )


def create_render_provider(settings: Settings) -> RenderProvider:
    if settings.render_provider == "openai":
        return OpenAIImageProvider(settings)
    return MockRenderProvider()
