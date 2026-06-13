from __future__ import annotations

from services.adb_service import ADBService


class FileService:
    """Android storage operations."""

    def __init__(self, adb_service: ADBService) -> None:
        self.adb_service = adb_service
