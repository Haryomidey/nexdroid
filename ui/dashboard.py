from __future__ import annotations

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import ActionTile, PageHeader, Panel, SectionTitle, StatCard
from ui.theme import ACCENT, APP_BG, BORDER, CARD, PANEL_DEEP, TEXT, TEXT_MUTED, TEXT_SOFT, TEXT_SUBTLE


class DashboardPage(ctk.CTkFrame):
    """Device overview and quick actions."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService, title: str = "Dashboard") -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self.cards: dict[str, StatCard] = {}
        self._build(title)

    def _build(self, title: str) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(4, weight=1)

        header = PageHeader(self, title, "Monitor device health, connection state, and common ADB actions.")
        header.grid(row=0, column=0, padx=24, pady=(22, 16), sticky="ew")

        banner = Panel(self)
        banner.grid(row=1, column=0, padx=24, pady=(0, 16), sticky="ew")
        banner.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(
            banner,
            text="ACTIVE DEVICE NODE",
            text_color=ACCENT,
            font=ctk.CTkFont(size=10, weight="bold"),
        ).grid(row=0, column=0, padx=18, pady=(16, 0), sticky="w")
        ctk.CTkLabel(
            banner,
            text="No device connected",
            text_color=TEXT,
            font=ctk.CTkFont(size=24, weight="bold"),
        ).grid(row=1, column=0, padx=18, pady=(2, 2), sticky="w")
        ctk.CTkLabel(
            banner,
            text="NexDroid has not discovered an active USB or wireless ADB device yet.",
            text_color=TEXT_MUTED,
            font=ctk.CTkFont(size=12),
        ).grid(row=2, column=0, padx=18, pady=(0, 16), sticky="w")
        ctk.CTkLabel(
            banner,
            text="ADB IDLE",
            text_color=ACCENT,
            fg_color="#0d2230",
            corner_radius=999,
            padx=12,
            pady=4,
            font=ctk.CTkFont(size=11, weight="bold"),
        ).grid(row=1, column=1, padx=18, sticky="e")

        actions = ctk.CTkFrame(self, fg_color="transparent")
        actions.grid(row=2, column=0, padx=24, pady=(0, 16), sticky="ew")
        for column in range(6):
            actions.grid_columnconfigure(column, weight=1, uniform="actions")

        quick_actions = [
            ("Mirror View", "MV", True),
            ("Browse Files", "BF", True),
            ("Capture Screen", "CS", False),
            ("Apps Hub", "AH", False),
            ("ADB Console", "AC", True),
            ("Reboot Device", "RD", False),
        ]
        for index, (label, icon, accent) in enumerate(quick_actions):
            ActionTile(actions, title=label, icon=icon, accent=accent).grid(
                row=0, column=index, padx=5, sticky="ew"
            )

        card_grid = ctk.CTkFrame(self, fg_color="transparent")
        card_grid.grid(row=3, column=0, padx=24, sticky="ew")
        for column in range(4):
            card_grid.grid_columnconfigure(column, weight=1, uniform="cards")

        metrics = [
            ("Core CPU Usage", "0%", "System fluctuate live"),
            ("Memory Allocation", "0%", "0 GB of 0 GB"),
            ("Battery Stat", "-", "Temp: -"),
            ("Storage Utilized", "-", "Used / total"),
        ]

        for index, (label, value, detail) in enumerate(metrics):
            card = StatCard(card_grid, label, value, detail)
            card.grid(row=0, column=index, padx=6, pady=6, sticky="nsew")
            self.cards[label] = card

        lower = ctk.CTkFrame(self, fg_color="transparent")
        lower.grid(row=4, column=0, padx=24, pady=(16, 24), sticky="nsew")
        lower.grid_columnconfigure(0, weight=2)
        lower.grid_columnconfigure(1, weight=1)
        lower.grid_rowconfigure(0, weight=1)

        graph = Panel(lower)
        graph.grid(row=0, column=0, padx=(0, 8), sticky="nsew")
        graph.grid_columnconfigure(0, weight=1)
        SectionTitle(graph, "Plotted Core Metrics Logs", "Live CPU and RAM polling will render here.").grid(
            row=0, column=0, padx=18, pady=(16, 12), sticky="ew"
        )
        ctk.CTkFrame(graph, fg_color=PANEL_DEEP, corner_radius=10, border_width=1, border_color=BORDER).grid(
            row=1, column=0, padx=18, pady=(0, 18), sticky="nsew"
        )
        graph.grid_rowconfigure(1, weight=1)

        info = Panel(lower)
        info.grid(row=0, column=1, padx=(8, 0), sticky="nsew")
        SectionTitle(info, "Device Information", "Build and debug channel details.").grid(
            row=0, column=0, padx=18, pady=(16, 12), sticky="ew"
        )
        rows = [
            ("Manufacturer", "-"),
            ("Device Model", "-"),
            ("DPI Density", "-"),
            ("ADB Debug Port", "USB / TCP"),
            ("Build Number", "-"),
            ("Security Patch", "-"),
        ]
        for index, (name, value) in enumerate(rows, start=1):
            ctk.CTkLabel(info, text=name, text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=12)).grid(
                row=index, column=0, padx=18, pady=7, sticky="w"
            )
            ctk.CTkLabel(info, text=value, text_color=TEXT_SOFT, font=ctk.CTkFont(size=12, weight="bold")).grid(
                row=index, column=1, padx=18, pady=7, sticky="e"
            )
        info.grid_columnconfigure(1, weight=1)
