from __future__ import annotations

from collections.abc import Callable

import customtkinter as ctk

from ui.components import PageHeader, Panel, SectionTitle, themed_entry
from ui.theme import APP_BG, BORDER, PANEL_DEEP, TEXT, TEXT_MUTED, TEXT_SUBTLE
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
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )
        panel = Panel(self)
        panel.grid(row=1, column=0, padx=24, sticky="ew")
        panel.grid_columnconfigure(1, weight=1)

        SectionTitle(panel, "General Preferences", "Match NexDroid behavior to your local Android tooling.").grid(
            row=0, column=0, columnspan=2, padx=18, pady=(18, 12), sticky="ew"
        )

        ctk.CTkLabel(panel, text="ADB Path", text_color=TEXT_MUTED).grid(row=1, column=0, padx=18, pady=12, sticky="w")
        adb_entry = themed_entry(panel, "adb")
        adb_entry.insert(0, self.config.adb_path)
        adb_entry.grid(row=1, column=1, padx=18, pady=12, sticky="ew")

        ctk.CTkLabel(panel, text="Theme", text_color=TEXT_MUTED).grid(row=2, column=0, padx=18, pady=12, sticky="w")
        theme_menu = ctk.CTkOptionMenu(
            panel,
            values=["Dark", "Light", "System"],
            command=self.on_theme_change,
            fg_color=PANEL_DEEP,
            button_color="#1da1f2",
            button_hover_color="#1a8cd8",
            text_color=TEXT,
            dropdown_fg_color=PANEL_DEEP,
            dropdown_text_color=TEXT,
            dropdown_hover_color="#18181c",
        )
        theme_menu.set(self.config.theme.capitalize())
        theme_menu.grid(row=2, column=1, padx=18, pady=12, sticky="w")

        folders = Panel(self)
        folders.grid(row=2, column=0, padx=24, pady=18, sticky="ew")
        folders.grid_columnconfigure(1, weight=1)
        SectionTitle(folders, "Local Folders", "Default output locations for captures and transfers.").grid(
            row=0, column=0, columnspan=2, padx=18, pady=(18, 12), sticky="ew"
        )
        for row, (label, value) in enumerate(
            [("Screenshots", self.config.screenshot_folder), ("Downloads", self.config.download_folder)],
            start=1,
        ):
            ctk.CTkLabel(folders, text=label, text_color=TEXT_MUTED).grid(row=row, column=0, padx=18, pady=12, sticky="w")
            entry = themed_entry(folders, value)
            entry.insert(0, value)
            entry.grid(row=row, column=1, padx=18, pady=12, sticky="ew")
