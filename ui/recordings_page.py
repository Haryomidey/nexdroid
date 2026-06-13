from __future__ import annotations

import customtkinter as ctk

from ui.components import EmptyState, PageHeader, Panel, SectionTitle, ToolbarButton
from ui.theme import APP_BG, BORDER, PANEL_DEEP, TEXT, TEXT_MUTED


class RecordingsPage(ctk.CTkFrame):
    """Screen recording control page."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        body = ctk.CTkScrollableFrame(self, fg_color=APP_BG, corner_radius=0)
        body.grid(row=0, column=0, sticky="nsew")
        body.grid_columnconfigure(0, weight=1)

        PageHeader(body, "Recording Center", "Start, stop, save, and review Android screen recordings.").grid(
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )

        controls = Panel(body)
        controls.grid(row=1, column=0, padx=24, pady=(0, 16), sticky="ew")
        controls.grid_columnconfigure((0, 1, 2), weight=1, uniform="record")
        for col, (title, icon, accent) in enumerate(
            [("Start Recording", "record", True), ("Stop Recording", "record", False), ("Open History", "folder", False)]
        ):
            ToolbarButton(controls, title, accent=accent, enabled=False).grid(row=0, column=col, padx=12, pady=16, sticky="ew")

        grid = ctk.CTkFrame(body, fg_color="transparent")
        grid.grid(row=2, column=0, padx=24, pady=(0, 24), sticky="ew")
        grid.grid_columnconfigure(0, weight=2)
        grid.grid_columnconfigure(1, weight=1)

        session = Panel(grid, fg_color=PANEL_DEEP)
        session.grid(row=0, column=0, padx=(0, 12), sticky="nsew")
        session.grid_rowconfigure(1, minsize=300)
        session.grid_columnconfigure(0, weight=1)
        SectionTitle(session, "Current Session", "Recording status and elapsed time.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        EmptyState(session, "Recorder offline", "Connect an authorized device to enable screen recording.", "record").grid(
            row=1, column=0
        )

        history = Panel(grid)
        history.grid(row=0, column=1, padx=(12, 0), sticky="nsew")
        SectionTitle(history, "Recording History", "Saved MP4 files will appear here.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        ctk.CTkLabel(history, text="No recordings yet", text_color=TEXT_MUTED).grid(row=1, column=0, padx=18, pady=18)
