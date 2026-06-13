from __future__ import annotations

import customtkinter as ctk

from ui.components import PageHeader
from ui.theme import APP_BG, SURFACE, SURFACE_MUTED


class FilesPage(ctk.CTkFrame):
    """Android file explorer page."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        PageHeader(self, "Files", "Browse storage, upload, download, rename, delete, and create folders.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        explorer = ctk.CTkFrame(self, fg_color=SURFACE, corner_radius=14)
        explorer.grid(row=1, column=0, padx=28, pady=(0, 28), sticky="nsew")
        explorer.grid_columnconfigure(1, weight=1)
        explorer.grid_rowconfigure(0, weight=1)
        ctk.CTkTextbox(explorer, width=220, fg_color=SURFACE_MUTED, corner_radius=10).grid(
            row=0, column=0, padx=14, pady=14, sticky="ns"
        )
        ctk.CTkTextbox(explorer, fg_color=SURFACE_MUTED, corner_radius=10).grid(
            row=0, column=1, padx=(0, 14), pady=14, sticky="nsew"
        )