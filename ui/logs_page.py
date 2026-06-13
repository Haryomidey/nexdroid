from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader
from ui.theme import APP_BG, DANGER_MUTED, SURFACE_DEEP


class LogsPage(ctk.CTkFrame):
    """ADB log viewer."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        PageHeader(self, "Logs", "Filter, pause, search, save, and clear Android logs.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        toolbar = ctk.CTkFrame(self, fg_color="transparent")
        toolbar.grid(row=1, column=0, padx=28, sticky="ew")
        ctk.CTkButton(toolbar, text="Load Snapshot", command=self._load_logs).grid(row=0, column=0)
        ctk.CTkButton(toolbar, text="Clear", fg_color=DANGER_MUTED, command=lambda: self.log_box.delete("1.0", "end")).grid(
            row=0, column=1, padx=10
        )
        self.log_box = ctk.CTkTextbox(self, fg_color=SURFACE_DEEP, corner_radius=14)
        self.log_box.grid(row=2, column=0, padx=28, pady=18, sticky="nsew")

    def _load_logs(self) -> None:
        self.log_box.delete("1.0", "end")
        self.log_box.insert("1.0", "Loading logcat snapshot...\n")
        threading.Thread(target=self._load_logs_background, daemon=True).start()

    def _load_logs_background(self) -> None:
        output = self.adb_service.logcat_snapshot(lines=200)
        self.after(0, lambda: self._render_logs(output))

    def _render_logs(self, output: str) -> None:
        self.log_box.delete("1.0", "end")
        self.log_box.insert("1.0", output or "No logs available.\n")
