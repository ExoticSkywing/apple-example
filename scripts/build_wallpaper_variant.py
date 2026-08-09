from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
FRAME_DIR = ROOT / 'RECON/wallpaper-variant/frames'
OUT_DIR = ROOT / 'RECON/wallpaper-variant/composited-frames'
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 880, 768
SCREEN_POLY = [(440, 219), (638, 242), (651, 768), (430, 768)]
ISLAND_POLY = [(445, 188), (637, 210), (637, 298), (444, 278)]
TIME_POLY = [(451, 286), (638, 310), (645, 676), (445, 660)]

# The icon rail in the source timeline selects Silent, Translate and Shazam in
# three broad beats. We synchronize wallpaper families to those same beats.
MODES = (
    ('silent', (0, 49)),
    ('translate', (50, 99)),
    ('recognize', (100, 149)),
)


def mode_for_frame(index: int) -> str:
    for name, (start, end) in MODES:
        if start <= index <= end:
            return name
    return 'recognize'


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def palette(mode: str) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]:
    return {
        'silent': ((35, 42, 50), (85, 101, 116), (196, 209, 216)),
        'translate': ((22, 77, 105), (42, 146, 156), (207, 237, 211)),
        'recognize': ((34, 27, 86), (42, 111, 214), (71, 203, 229)),
    }[mode]


def make_wallpaper(mode: str, frame_index: int) -> Image.Image:
    low = Image.new('RGB', (220, 192))
    px = low.load()
    if px is None:
        raise RuntimeError('Unable to access wallpaper pixels')
    c0, c1, c2 = palette(mode)
    drift = math.sin(frame_index / 18) * 0.04
    for y in range(low.height):
        for x in range(low.width):
            nx = x / (low.width - 1)
            ny = y / (low.height - 1)
            wave = 0.5 + 0.5 * math.sin((nx * 3.8 + ny * 1.6 + drift) * math.pi)
            glow = max(0.0, 1.0 - math.hypot(nx - 0.58, ny - 0.34) * 1.7)
            t = max(0.0, min(1.0, 0.48 * ny + 0.30 * wave + 0.32 * glow))
            if t < 0.55:
                u = t / 0.55
                color = tuple(round(a + (b - a) * u) for a, b in zip(c0, c1))
            else:
                u = (t - 0.55) / 0.45
                color = tuple(round(a + (b - a) * u) for a, b in zip(c1, c2))
            px[x, y] = color

    canvas = low.resize((W, H), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
    draw = ImageDraw.Draw(canvas, 'RGBA')
    cx, cy = 610, 435
    accent = (255, 255, 255, 24)
    for radius in range(90, 640, 48):
        bbox = (cx - radius * 1.15, cy - radius, cx + radius * 1.15, cy + radius)
        draw.arc(bbox, 203, 350, fill=accent, width=8)
    for angle in range(-76, 79, 22):
        rad = math.radians(angle)
        ex = cx + math.cos(rad) * 620
        ey = cy + math.sin(rad) * 620
        draw.line((cx, cy, ex, ey), fill=(255, 255, 255, 18), width=6)
    return canvas.filter(ImageFilter.GaussianBlur(0.8))


def main() -> None:
    frame_paths = sorted(FRAME_DIR.glob('*.png'))
    if len(frame_paths) != 150:
        raise SystemExit(f'Expected 150 frames, found {len(frame_paths)}')

    # Freeze the island/clock layer at the official Silent state. The left rail
    # can continue its source animation, but the on-device notification no
    # longer changes with it; the wallpaper is now the synchronized response.
    overlay_source = Image.open(frame_paths[28]).convert('RGB')

    for zero_index, path in enumerate(frame_paths):
        source = Image.open(path).convert('RGB')
        mode = mode_for_frame(zero_index)
        wallpaper = make_wallpaper(mode, zero_index)

        mask = Image.new('L', (W, H), 0)
        ImageDraw.Draw(mask).polygon(SCREEN_POLY, fill=218)
        mask = mask.filter(ImageFilter.GaussianBlur(2.2))

        overlay_keep = Image.new('L', (W, H), 0)
        overlay_draw = ImageDraw.Draw(overlay_keep)
        overlay_draw.polygon(ISLAND_POLY, fill=255)
        overlay_draw.polygon(TIME_POLY, fill=255)
        overlay_keep = overlay_keep.filter(ImageFilter.GaussianBlur(1.2))
        inverse_overlay = Image.eval(overlay_keep, lambda p: 255 - p)
        mask = Image.composite(mask, Image.new('L', (W, H), 0), inverse_overlay)

        result = Image.composite(wallpaper, source, mask)
        # Re-paste one fixed official island/clock state so icon switching is
        # expressed by wallpaper changes instead of notification changes.
        result = Image.composite(overlay_source, result, overlay_keep)
        result.save(OUT_DIR / path.name, compress_level=3)

    print(f'generated={len(frame_paths)} output={OUT_DIR}')


if __name__ == '__main__':
    main()
