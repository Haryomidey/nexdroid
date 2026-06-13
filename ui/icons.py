from __future__ import annotations

from functools import lru_cache

import customtkinter as ctk
from PIL import Image, ImageDraw


def _new_icon(size: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


@lru_cache(maxsize=128)
def get_icon(name: str, size: int = 24, color: str = "#1da1f2") -> ctk.CTkImage:
    image, draw = _new_icon(size)
    stroke = max(2, size // 12)
    c = color
    s = size

    if name in {"dashboard", "apps"}:
        gap = s // 9
        cell = (s - gap * 5) // 2
        for x in (gap * 2, gap * 3 + cell):
            for y in (gap * 2, gap * 3 + cell):
                draw.rounded_rectangle((x, y, x + cell, y + cell), radius=3, outline=c, width=stroke)
    elif name in {"devices", "phone", "mirror"}:
        draw.rounded_rectangle((s * 0.30, s * 0.12, s * 0.70, s * 0.88), radius=s // 10, outline=c, width=stroke)
        draw.line((s * 0.43, s * 0.20, s * 0.57, s * 0.20), fill=c, width=stroke)
        draw.ellipse((s * 0.46, s * 0.76, s * 0.54, s * 0.84), fill=c)
        if name == "mirror":
            draw.rounded_rectangle((s * 0.12, s * 0.28, s * 0.52, s * 0.72), radius=s // 12, outline=c, width=stroke)
    elif name in {"files", "folder"}:
        draw.line((s * 0.14, s * 0.32, s * 0.38, s * 0.32, s * 0.45, s * 0.42, s * 0.86, s * 0.42), fill=c, width=stroke)
        draw.rounded_rectangle((s * 0.14, s * 0.38, s * 0.86, s * 0.78), radius=s // 12, outline=c, width=stroke)
    elif name in {"camera", "screenshots"}:
        draw.rounded_rectangle((s * 0.14, s * 0.30, s * 0.86, s * 0.76), radius=s // 10, outline=c, width=stroke)
        draw.rectangle((s * 0.28, s * 0.22, s * 0.48, s * 0.32), outline=c, width=stroke)
        draw.ellipse((s * 0.40, s * 0.42, s * 0.62, s * 0.64), outline=c, width=stroke)
    elif name in {"record", "recordings"}:
        draw.ellipse((s * 0.22, s * 0.22, s * 0.78, s * 0.78), outline=c, width=stroke)
        draw.ellipse((s * 0.38, s * 0.38, s * 0.62, s * 0.62), fill=c)
    elif name in {"terminal", "console"}:
        draw.rounded_rectangle((s * 0.12, s * 0.18, s * 0.88, s * 0.82), radius=s // 12, outline=c, width=stroke)
        draw.line((s * 0.24, s * 0.38, s * 0.36, s * 0.50, s * 0.24, s * 0.62), fill=c, width=stroke)
        draw.line((s * 0.46, s * 0.62, s * 0.68, s * 0.62), fill=c, width=stroke)
    elif name in {"reboot", "refresh"}:
        draw.arc((s * 0.18, s * 0.18, s * 0.82, s * 0.82), 35, 320, fill=c, width=stroke)
        draw.polygon([(s * 0.76, s * 0.20), (s * 0.88, s * 0.26), (s * 0.78, s * 0.36)], fill=c)
    elif name == "logs":
        for y in (0.26, 0.42, 0.58, 0.74):
            draw.line((s * 0.22, s * y, s * 0.80, s * y), fill=c, width=stroke)
            draw.ellipse((s * 0.12, s * y - 1, s * 0.16, s * y + 3), fill=c)
    elif name == "settings":
        draw.ellipse((s * 0.28, s * 0.28, s * 0.72, s * 0.72), outline=c, width=stroke)
        draw.ellipse((s * 0.43, s * 0.43, s * 0.57, s * 0.57), outline=c, width=stroke)
        for angle_point in ((0.50, 0.10, 0.50, 0.24), (0.50, 0.76, 0.50, 0.90), (0.10, 0.50, 0.24, 0.50), (0.76, 0.50, 0.90, 0.50)):
            draw.line(tuple(s * v for v in angle_point), fill=c, width=stroke)
    else:
        draw.ellipse((s * 0.22, s * 0.22, s * 0.78, s * 0.78), outline=c, width=stroke)

    return ctk.CTkImage(light_image=image, dark_image=image, size=(size, size))
