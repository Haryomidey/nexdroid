from __future__ import annotations

import customtkinter as ctk

from ui.components import PageHeader


class MirrorPage(ctk.CTkFrame):
    """Screen mirroring workspace."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color="#0b1020", corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        PageHeader(self, "Screen Mirror", "Live mirroring controls, scaling, rotation, and input simulation.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        preview = ctk.CTkFrame(self, fg_color="#020617", corner_radius=14)
        preview.grid(row=1, column=0, padx=28, pady=(0, 28), sticky="nsew")
        preview.grid_rowconfigure(0, weight=1)
        preview.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(preview, text="Mirror preview will appear here", text_color="#64748b").grid(row=0, column=0)
