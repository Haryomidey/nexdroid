from __future__ import annotations

import queue
import threading
import time

from services.adb_service import ADBService


class DeviceWorker:
    """Polls ADB devices without blocking the UI thread."""

    def __init__(self, adb_service: ADBService, events: queue.Queue[dict[str, object]], interval: float = 4.0) -> None:
        self.adb_service = adb_service
        self.events = events
        self.interval = interval
        self._stop_event = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._last_signature: tuple[tuple[str, str], ...] = ()

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()

    def _run(self) -> None:
        while not self._stop_event.is_set():
            devices = self.adb_service.list_devices()
            signature = tuple((device.serial, device.status) for device in devices)
            if signature != self._last_signature:
                self._last_signature = signature
                self.events.put(
                    {
                        "type": "devices_changed",
                        "devices": [{"serial": device.serial, "status": device.status} for device in devices],
                    }
                )
            time.sleep(self.interval)