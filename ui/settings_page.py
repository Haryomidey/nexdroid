from __future__ import annotations

from collections.abc import Callable

import customtkinter as ctk

from ui.components import PageHeader
from ui.theme import APP_BG, SURFACE
from utils.config import AppConfig


class SettingsPage(ctk.CTkFrame):
    """Application settings page."""

    def __init__(self, master: ctk.CTkFrame, config: AppConfig, on_theme_change: Callable[[str], None]) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.config = config
        self.on_theme_change = on_theme_change
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        PageHeader(self, "Settings", "Theme, ADB path, folders, wireless debugging, and refresh intervals.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        panel = ctk.CTkFrame(self, fg_color=SURFACE, corner_radius=14)
        panel.grid(row=1, column=0, padx=28, sticky="ew")
        panel.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(panel, text="ADB Path").grid(row=0, column=0, padx=18, pady=18, sticky="w")
        ctk.CTkEntry(panel).grid(row=0, column=1, padx=18, pady=18, sticky="ew")
        ctk.CTkLabel(panel, text="Theme").grid(row=1, column=0, padx=18, pady=18, sticky="w")
        theme_menu = ctk.CTkOptionMenu(
            panel,
            values=["Dark", "Light", "System"],
            command=self.on_theme_change,
        )
        theme_menu.set(self.config.theme.capitalize())
        theme_menu.grid(row=1, column=1, padx=18, pady=18, sticky="w")