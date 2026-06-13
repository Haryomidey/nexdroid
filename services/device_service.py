from __future__ import annotations

from services.adb_service import ADBDevice, ADBService


class DeviceService:
    """Device-oriented operations composed from ADB primitives."""

    def __init__(self, adb_service: ADBService) -> None:
        self.adb_service = adb_service

    def connected_devices(self) -> list[ADBDevice]:
        return self.adb_service.list_devices()