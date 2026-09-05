"""Split the approved YUP sprite sheets into transparent web assets."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "design-assets" / "yup" / "sheets"
OUTPUT = ROOT / "public" / "assets" / "yup" / "sprites"

SPRITE_SHEETS = {
    "expressions": {
        "file": "expressions.png",
        "columns": 4,
        "rows": 3,
        "names": [
            "neutral", "smug", "happy", "laughing",
            "angry", "surprised", "confused", "sleepy",
            "crying", "embarrassed", "determined", "suspicious",
        ],
    },
    "actions": {
        "file": "actions.png",
        "columns": 4,
        "rows": 3,
        "names": [
            "walking", "running", "waving", "pointing",
            "typing", "gaming", "holding-coffee", "carrying-box",
            "taking-photo", "thumbs-up", "sitting", "facepalm",
        ],
    },
    "props": {
        "file": "props.png",
        "columns": 5,
        "rows": 2,
        "names": [
            "laptop", "controller", "coffee", "heart", "star",
            "speech-bubble", "robot-companion", "folder", "lightning", "wrench",
        ],
    },
}


def transparent_background(image: Image.Image) -> Image.Image:
    """Remove only pale neutral pixels connected to the crop boundary."""

    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return min(red, green, blue) >= 224 and max(red, green, blue) - min(red, green, blue) <= 12

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if not visited[index] and is_background(x, y):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    # Preserve antialiased contours while removing the checkerboard fringe.
    alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.35))
    rgba.putalpha(alpha)
    return rgba


def remove_sheet_bleed(image: Image.Image) -> Image.Image:
    """Drop small detached components inherited from neighbouring grid cells."""

    alpha = image.getchannel("A")
    width, height = image.size
    source = alpha.load()
    visited = bytearray(width * height)
    clear = Image.new("L", image.size, 0)
    clear_pixels = clear.load()
    minimum_area = max(140, round(width * height * 0.0011))

    for start_y in range(height):
        for start_x in range(width):
            offset = start_y * width + start_x
            if visited[offset] or source[start_x, start_y] < 18:
                continue
            visited[offset] = 1
            queue = deque([(start_x, start_y)])
            component: list[tuple[int, int]] = []
            touches_edge = False
            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                touches_edge = touches_edge or x < 3 or y < 3 or x >= width - 3 or y >= height - 3
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    neighbour = ny * width + nx
                    if not visited[neighbour] and source[nx, ny] >= 18:
                        visited[neighbour] = 1
                        queue.append((nx, ny))

            keep = len(component) >= minimum_area and not (touches_edge and len(component) < width * height * 0.04)
            if keep:
                for x, y in component:
                    clear_pixels[x, y] = source[x, y]

    image.putalpha(clear.filter(ImageFilter.GaussianBlur(0.25)))
    return image


def extract_sheet(category: str, config: dict[str, object]) -> None:
    sheet = Image.open(SHEETS / str(config["file"]))
    columns = int(config["columns"])
    rows = int(config["rows"])
    names = list(config["names"])
    output_dir = OUTPUT / category
    output_dir.mkdir(parents=True, exist_ok=True)

    for index, name in enumerate(names):
        column = index % columns
        row = index // columns
        left = round(column * sheet.width / columns)
        right = round((column + 1) * sheet.width / columns)
        top = round(row * sheet.height / rows)
        bottom = round((row + 1) * sheet.height / rows)
        sprite = sheet.crop((left, top, right, bottom))

        sprite = remove_sheet_bleed(transparent_background(sprite))
        bounds = sprite.getchannel("A").getbbox()
        if bounds:
            sprite = sprite.crop(bounds)

        canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
        max_width = 440
        max_height = 440
        scale = min(max_width / sprite.width, max_height / sprite.height)
        size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
        sprite = sprite.resize(size, Image.Resampling.LANCZOS)
        canvas.alpha_composite(sprite, ((512 - size[0]) // 2, (512 - size[1]) // 2))
        canvas.save(output_dir / f"{name}.png", optimize=True)


def main() -> None:
    for category, config in SPRITE_SHEETS.items():
        extract_sheet(category, config)


if __name__ == "__main__":
    main()
