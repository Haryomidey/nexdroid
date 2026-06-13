from __future__ import annotations

import queue
import threading

from services.adb_service import ADBService


class LogWorker:
    """Captures logcat output in a background thread."""

    def __init__(self, adb_service: ADBService, events: queue.Queue[dict[str, object]]) -> None:
        self.adb_service = adb_service
        self.events = events

    def snapshot(self, lines: int = 200) -> None:
        threading.Thread(target=self._snapshot, args=(lines,), daemon=True).start()

    def _snapshot(self, lines: int) -> None:
        self.events.put({"type": "logs", "output": self.adb_service.logcat_snapshot(lines=lines)})