from __future__ import annotations

import customtkinter as ctk

from ui.components import EmptyState, PageHeader, Panel, SectionTitle, ToolbarButton
from ui.theme import ACCENT, APP_BG, BORDER, PANEL_DEEP, TEXT_MUTED, TEXT_SUBTLE


class MirrorPage(ctk.CTkFrame):
    """Screen mirroring workspace."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        PageHeader(self, "Mirror", "Live mirroring controls, scaling, rotation, and input simulation.").grid(
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )
        workspace = ctk.CTkFrame(self, fg_color="transparent")
        workspace.grid(row=1, column=0, padx=24, pady=(0, 24), sticky="nsew")
        workspace.grid_columnconfigure(0, weight=1)
        workspace.grid_rowconfigure(0, weight=1)

        preview = Panel(workspace, fg_color=PANEL_DEEP)
        preview.grid(row=0, column=0, padx=(0, 12), sticky="nsew")
        preview.grid_rowconfigure(1, weight=1)
        preview.grid_columnconfigure(0, weight=1)
        SectionTitle(preview, "Device Viewport", "Live frames will render when the mirror backend is attached.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        EmptyState(preview, "Mirror preview offline", "Connect an authorized device and start mirroring to view and control the screen.", "VIEW").grid(
            row=1, column=0
        )

        controls = Panel(workspace)
        controls.grid(row=0, column=1, sticky="nsew")
        controls.grid_columnconfigure(0, weight=1)
        SectionTitle(controls, "Mirror Controls", "Capture, rotate, scale, and record.").grid(
            row=0, column=0, padx=18, pady=(16, 12), sticky="ew"
        )
        for index, label in enumerate(["Start Mirror", "Screenshot", "Record", "Rotate", "Fullscreen", "Scale Fit"], start=1):
            ToolbarButton(controls, label, accent=index == 1).grid(row=index, column=0, padx=18, pady=5, sticky="ew")
        ctk.CTkLabel(
            controls,
            text="Mouse interaction, keyboard typing, and touch simulation will be enabled by the mirror backend.",
            text_color=TEXT_MUTED,
            wraplength=240,
            justify="left",
        ).grid(row=8, column=0, padx=18, pady=(18, 0), sticky="w")
