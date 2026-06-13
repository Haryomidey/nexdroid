from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path


CONFIG_DIR = Path("data")
CONFIG_PATH = CONFIG_DIR / "config.json"


@dataclass
class AppConfig:
    adb_path: str = "adb"
    screenshot_folder: str = "screenshots"
    download_folder: str = "downloads"
    refresh_interval_seconds: int = 4
    theme: str = "dark"

    @classmethod
    def load(cls) -> "AppConfig":
        if not CONFIG_PATH.exists():
            return cls()
        try:
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return cls()
        return cls(**{key: value for key, value in data.items() if key in cls.__dataclass_fields__})

    def save(self) -> None:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        CONFIG_PATH.write_text(json.dumps(asdict(self), indent=2), encoding="utf-8")
