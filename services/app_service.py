from __future__ import annotations

from services.adb_service import ADBService


class AppService:
    """Installed package operations."""

    def __init__(self, adb_service: ADBService) -> None:
        self.adb_service = adb_service

    def packages(self) -> list[str]:
        return self.adb_service.list_packages()