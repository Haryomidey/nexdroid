from __future__ import annotations

import shlex
import subprocess
from dataclasses import dataclass
import re


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

    def enable_wireless_debugging(self, port: int = 5555) -> str:
        return self._run(["tcpip", str(port)], timeout=12)

    def connect_wireless(self, host: str, port: int = 5555) -> str:
        target = host if ":" in host else f"{host}:{port}"
        return self._run(["connect", target], timeout=15)

    def disconnect_wireless(self, host: str, port: int = 5555) -> str:
        target = host if ":" in host else f"{host}:{port}"
        return self._run(["disconnect", target], timeout=12)

    def get_wifi_ip(self) -> str | None:
        output = self.shell("ip addr show wlan0")
        match = re.search(r"inet\s+(\d+\.\d+\.\d+\.\d+)/", output)
        if match:
            return match.group(1)

        output = self.shell("ifconfig wlan0")
        match = re.search(r"inet(?: addr:)?\s*(\d+\.\d+\.\d+\.\d+)", output)
        if match:
            return match.group(1)
        return None

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