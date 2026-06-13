from __future__ import annotations

from collections.abc import Callable

import customtkinter as ctk

from ui.theme import ACTIVE_NAV, HOVER_NAV, SIDEBAR_BG, TEXT_MUTED, TEXT_NAV


class Sidebar(ctk.CTkFrame):
    """Primary navigation rail."""

    ITEMS = [
        "Dashboard",
        "Devices",
        "Screen Mirror",
        "Apps",
        "Files",
        "Media",
        "Logs",
        "Developer Tools",
        "ADB Terminal",
        "Settings",
    ]

    def __init__(self, master: ctk.CTk, on_select: Callable[[str], None]) -> None:
        super().__init__(master, width=244, fg_color=SIDEBAR_BG, corner_radius=0)
        self.on_select = on_select
        self.buttons: dict[str, ctk.CTkButton] = {}
        self.grid_propagate(False)
        self._build()

    def _build(self) -> None:
        title = ctk.CTkLabel(
            self,
            text="NexDroid",
            font=ctk.CTkFont(size=24, weight="bold"),
        )
        title.grid(row=0, column=0, padx=24, pady=(28, 4), sticky="w")

        subtitle = ctk.CTkLabel(self, text="Control Center", text_color=TEXT_MUTED)
        subtitle.grid(row=1, column=0, padx=24, pady=(0, 26), sticky="w")

        for index, item in enumerate(self.ITEMS, start=2):
            button = ctk.CTkButton(
                self,
                text=item,
                anchor="w",
                height=42,
                corner_radius=10,
                fg_color="transparent",
                hover_color=HOVER_NAV,
                command=lambda value=item: self.on_select(value),
            )
            button.grid(row=index, column=0, padx=14, pady=3, sticky="ew")
            self.buttons[item] = button

        self.grid_columnconfigure(0, weight=1)

    def set_active(self, item: str) -> None:
        for name, button in self.buttons.items():
            if name == item:
                button.configure(fg_color=ACTIVE_NAV, text_color="#ffffff")
            else:
                button.configure(fg_color="transparent", text_color=TEXT_NAV)
