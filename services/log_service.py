from __future__ import annotations

from services.adb_service import ADBService


class LogService:
    """Logcat access helpers."""

    def __init__(self, adb_service: ADBService) -> None:
        self.adb_service = adb_service

    def snapshot(self, lines: int = 200) -> str:
        return self.adb_service.logcat_snapshot(lines=lines)
