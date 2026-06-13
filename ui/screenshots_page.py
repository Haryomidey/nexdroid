from __future__ import annotations

import customtkinter as ctk

from ui.components import EmptyState, PageHeader, Panel, SectionTitle, ToolbarButton
from ui.theme import APP_BG, BORDER, PANEL_DEEP, TEXT_MUTED


class ScreenshotsPage(ctk.CTkFrame):
    """Screenshot capture and archive page."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        body = ctk.CTkScrollableFrame(self, fg_color=APP_BG, corner_radius=0)
        body.grid(row=0, column=0, sticky="nsew")
        body.grid_columnconfigure(0, weight=1)

        header = ctk.CTkFrame(body, fg_color="transparent")
        header.grid(row=0, column=0, padx=24, pady=(22, 16), sticky="ew")
        header.grid_columnconfigure(0, weight=1)
        PageHeader(header, "Screenshot Center", "Capture, preview, copy, save, and review screenshots.").grid(
            row=0, column=0, sticky="ew"
        )
        ToolbarButton(header, "Capture Screen", accent=True, enabled=False).grid(row=0, column=1, padx=(16, 0))

        grid = ctk.CTkFrame(body, fg_color="transparent")
        grid.grid(row=1, column=0, padx=24, pady=(0, 24), sticky="ew")
        grid.grid_columnconfigure(0, weight=2)
        grid.grid_columnconfigure(1, weight=1)

        preview = Panel(grid, fg_color=PANEL_DEEP)
        preview.grid(row=0, column=0, padx=(0, 12), sticky="nsew")
        preview.grid_columnconfigure(0, weight=1)
        preview.grid_rowconfigure(1, minsize=360)
        SectionTitle(preview, "Preview Frame", "Latest capture appears here.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        EmptyState(preview, "No screenshot captured", "Connect an authorized device to enable screen capture.", "camera").grid(
            row=1, column=0
        )

        history = Panel(grid)
        history.grid(row=0, column=1, padx=(12, 0), sticky="nsew")
        history.grid_columnconfigure(0, weight=1)
        SectionTitle(history, "Capture History", "Timestamped screenshots will be listed here.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        for row, text in enumerate(["Copy to Clipboard", "Save As", "Open Folder", "Batch Capture"], start=1):
            ToolbarButton(history, text, enabled=False).grid(row=row, column=0, padx=18, pady=5, sticky="ew")
        ctk.CTkLabel(
            history,
            text="Actions are disabled until screenshot capture is connected to ADB.",
            text_color=TEXT_MUTED,
            wraplength=260,
            justify="left",
        ).grid(row=6, column=0, padx=18, pady=(18, 0), sticky="w")
