from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader, Panel, ToolbarButton, themed_entry
from ui.theme import APP_BG, BORDER, DANGER_MUTED, PANEL_DEEP, TEXT_SOFT


class LogsPage(ctk.CTkFrame):
    """ADB log viewer."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        PageHeader(self, "Log Viewer", "Filter, pause, search, save, and clear Android logs.").grid(
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )
        toolbar = ctk.CTkFrame(self, fg_color="transparent")
        toolbar.grid(row=1, column=0, padx=24, sticky="ew")
        toolbar.grid_columnconfigure(0, weight=1)
        themed_entry(toolbar, "Search logcat output...").grid(row=0, column=0, sticky="ew", padx=(0, 12))
        ToolbarButton(toolbar, "Load Snapshot", command=self._load_logs).grid(row=0, column=1, padx=(0, 8))
        ctk.CTkButton(toolbar, text="Clear", height=34, fg_color=DANGER_MUTED, hover_color="#241417", border_width=1, border_color=BORDER, command=lambda: self.log_box.delete("1.0", "end")).grid(row=0, column=2)

        log_panel = Panel(self)
        log_panel.grid(row=2, column=0, padx=24, pady=18, sticky="nsew")
        log_panel.grid_columnconfigure(0, weight=1)
        log_panel.grid_rowconfigure(0, weight=1)
        self.log_box = ctk.CTkTextbox(log_panel, fg_color=PANEL_DEEP, corner_radius=10, border_width=1, border_color=BORDER, text_color=TEXT_SOFT, font=ctk.CTkFont(family="Consolas", size=12))
        self.log_box.grid(row=0, column=0, padx=12, pady=12, sticky="nsew")

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
