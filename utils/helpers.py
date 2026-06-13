from __future__ import annotations

from datetime import datetime
from pathlib import Path


def timestamped_filename(prefix: str, suffix: str) -> str:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{stamp}.{suffix.lstrip('.')}"


def ensure_directory(path: str | Path) -> Path:
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory