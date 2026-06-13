from __future__ import annotations

from collections.abc import Callable

import customtkinter as ctk

from ui.icons import get_icon
from ui.theme import ACCENT, BORDER, CYAN, PANEL, SIDEBAR_BG, TEXT_MUTED, TEXT_NAV


class Sidebar(ctk.CTkFrame):
    """Primary navigation rail."""

    ITEMS = [
        "Dashboard",
        "Devices",
        "Mirror",
        "Apps",
        "Files",
        "Screenshots",
        "Recordings",
        "Logs",
        "Developer Tools",
        "ADB Console",
        "Settings",
    ]

    ICONS = {
        "Dashboard": "dashboard",
        "Devices": "phone",
        "Mirror": "mirror",
        "Apps": "apps",
        "Files": "folder",
        "Screenshots": "camera",
        "Recordings": "record",
        "Logs": "logs",
        "Developer Tools": "dashboard",
        "ADB Console": "terminal",
        "Settings": "settings",
    }

    def __init__(self, master: ctk.CTk, on_select: Callable[[str], None]) -> None:
        super().__init__(master, width=256, fg_color=SIDEBAR_BG, corner_radius=0, border_width=1, border_color=BORDER)
        self.on_select = on_select
        self.buttons: dict[str, ctk.CTkButton] = {}
        self.grid_propagate(False)
        self._build()

    def _build(self) -> None:
        brand = ctk.CTkFrame(self, fg_color="transparent", height=64)
        brand.grid(row=0, column=0, sticky="ew")
        brand.grid_columnconfigure(1, weight=1)

        mark = ctk.CTkLabel(
            brand,
            text="",
            image=get_icon("phone", size=19, color=CYAN),
            width=34,
            height=34,
            corner_radius=9,
            fg_color=PANEL,
        )
        mark.grid(row=0, column=0, padx=(16, 10), pady=15, sticky="w")

        title = ctk.CTkLabel(
            brand,
            text="NEXDROID",
            font=ctk.CTkFont(size=16, weight="bold", family="Segoe UI"),
            text_color="#f4f4f5",
        )
        title.grid(row=0, column=1, pady=18, sticky="w")

        for index, item in enumerate(self.ITEMS, start=1):
            button = ctk.CTkButton(
                self,
                text=item,
                image=get_icon(self.ICONS[item], size=17, color=TEXT_NAV),
                compound="left",
                anchor="w",
                height=40,
                corner_radius=8,
                fg_color="transparent",
                hover_color="#151518",
                text_color=TEXT_NAV,
                font=ctk.CTkFont(size=13, weight="bold"),
                command=lambda value=item: self.on_select(value),
            )
            button.grid(row=index, column=0, padx=10, pady=2, sticky="ew")
            self.buttons[item] = button

        self.footer = ctk.CTkFrame(self, fg_color="#09090b", corner_radius=0, border_width=1, border_color=BORDER)
        self.footer.grid(row=len(self.ITEMS) + 1, column=0, sticky="sew", pady=(12, 0))
        ctk.CTkLabel(
            self.footer,
            text="Scanning device...",
            image=get_icon("refresh", size=15, color=ACCENT),
            compound="left",
            text_color=TEXT_MUTED,
            font=ctk.CTkFont(size=12, weight="bold"),
        ).grid(row=0, column=0, padx=16, pady=14, sticky="w")

        self.grid_rowconfigure(len(self.ITEMS) + 1, weight=1)
        self.grid_columnconfigure(0, weight=1)

    def set_active(self, item: str) -> None:
        for name, button in self.buttons.items():
            if name == item:
                button.configure(
                    fg_color="#0d2230",
                    text_color=ACCENT,
                    image=get_icon(self.ICONS[name], size=17, color=ACCENT),
                    border_width=1,
                    border_color="#12384d",
                )
            else:
                button.configure(
                    fg_color="transparent",
                    text_color=TEXT_NAV,
                    image=get_icon(self.ICONS[name], size=17, color=TEXT_NAV),
                    border_width=0,
                )
