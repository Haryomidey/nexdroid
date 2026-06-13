from __future__ import annotations

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader, StatCard
from ui.theme import APP_BG, SURFACE


class DashboardPage(ctk.CTkFrame):
    """Device overview and quick actions."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService, title: str = "Dashboard") -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self.cards: dict[str, StatCard] = {}
        self._build(title)

    def _build(self, title: str) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        header = PageHeader(self, title, "Monitor device health, connection state, and common ADB actions.")
        header.grid(row=0, column=0, padx=28, pady=(26, 18), sticky="ew")

        card_grid = ctk.CTkFrame(self, fg_color="transparent")
        card_grid.grid(row=1, column=0, padx=28, sticky="ew")
        for column in range(4):
            card_grid.grid_columnconfigure(column, weight=1, uniform="cards")

        metrics = [
            ("Device", "Not connected", "Waiting for ADB"),
            ("Android", "-", "Version"),
            ("Battery", "-", "Charging state"),
            ("Storage", "-", "Used / total"),
            ("RAM", "-", "Current usage"),
            ("CPU", "-", "Load"),
            ("Temperature", "-", "Battery sensor"),
            ("Security Patch", "-", "Build metadata"),
        ]

        for index, (label, value, detail) in enumerate(metrics):
            card = StatCard(card_grid, label, value, detail)
            card.grid(row=index // 4, column=index % 4, padx=6, pady=6, sticky="nsew")
            self.cards[label] = card

        actions = ctk.CTkFrame(self, fg_color=SURFACE, corner_radius=14)
        actions.grid(row=2, column=0, padx=28, pady=22, sticky="new")
        actions.grid_columnconfigure((0, 1, 2), weight=1, uniform="actions")

        ctk.CTkLabel(actions, text="Quick Actions", font=ctk.CTkFont(size=18, weight="bold")).grid(
            row=0, column=0, columnspan=3, padx=18, pady=(18, 10), sticky="w"
        )

        for index, label in enumerate(
            ["Take Screenshot", "Record Screen", "Open File Explorer", "Install APK", "Mirror Screen", "Restart Device"]
        ):
            button = ctk.CTkButton(actions, text=label, height=42, corner_radius=10)
            button.grid(row=1 + index // 3, column=index % 3, padx=12, pady=8, sticky="ew")