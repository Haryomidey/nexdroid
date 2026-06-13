from __future__ import annotations

import customtkinter as ctk

from ui.components import PageHeader
from utils.config import AppConfig


class SettingsPage(ctk.CTkFrame):
    """Application settings page."""

    def __init__(self, master: ctk.CTkFrame, config: AppConfig) -> None:
        super().__init__(master, fg_color="#0b1020", corner_radius=0)
        self.config = config
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        PageHeader(self, "Settings", "Theme, ADB path, folders, wireless debugging, and refresh intervals.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        panel = ctk.CTkFrame(self, fg_color="#111827", corner_radius=14)
        panel.grid(row=1, column=0, padx=28, sticky="ew")
        panel.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(panel, text="ADB Path").grid(row=0, column=0, padx=18, pady=18, sticky="w")
        ctk.CTkEntry(panel).grid(row=0, column=1, padx=18, pady=18, sticky="ew")
        ctk.CTkLabel(panel, text="Theme").grid(row=1, column=0, padx=18, pady=18, sticky="w")
        ctk.CTkOptionMenu(panel, values=["Dark", "Light", "System"]).grid(row=1, column=1, padx=18, pady=18, sticky="w")
