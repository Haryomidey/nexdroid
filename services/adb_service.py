from __future__ import annotations

import shlex
import subprocess
from dataclasses import dataclass


@dataclass(frozen=True)
class ADBDevice:
    serial: str
    status: str


class ADBService:
    """Thin, testable wrapper around Android Debug Bridge."""

    def __init__(self, adb_path: str = "adb", timeout: int = 12) -> None:
        self.adb_path = adb_path or "adb"
        self.timeout = timeout

    def list_devices(self) -> list[ADBDevice]:
        output = self._run(["devices"], timeout=8)
        devices: list[ADBDevice] = []
        for line in output.splitlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 2:
                devices.append(ADBDevice(serial=parts[0], status=parts[1]))
        return devices

    def shell(self, command: str) -> str:
        return self._run(["shell", command])

    def list_packages(self) -> list[str]:
        output = self.shell("pm list packages -f")
        return [line.strip() for line in output.splitlines() if line.strip()]

    def logcat_snapshot(self, lines: int = 200) -> str:
        return self._run(["logcat", "-d", "-t", str(lines)], timeout=18)

    def run_raw(self, command: str) -> str:
        try:
            args = shlex.split(command, posix=False)
        except ValueError as exc:
            return f"Invalid command: {exc}"
        return self._run(args, timeout=30)

    def _run(self, args: list[str], timeout: int | None = None) -> str:
        try:
            completed = subprocess.run(
                [self.adb_path, *args],
                capture_output=True,
                text=True,
                timeout=timeout or self.timeout,
                check=False,
            )
        except FileNotFoundError:
            return "ADB executable was not found. Install Android Platform Tools or set the ADB path in Settings."
        except subprocess.TimeoutExpired:
            return "ADB command timed out."

        output = completed.stdout.strip()
        error = completed.stderr.strip()
        if completed.returncode != 0 and error:
            return error
        return output
