from __future__ import annotations

import customtkinter as ctk


class StatCard(ctk.CTkFrame):
    """Compact metric card used across dashboard pages."""

    def __init__(self, master: ctk.CTkFrame, label: str, value: str = "-", detail: str = "") -> None:
        super().__init__(master, fg_color="#111827", corner_radius=14)
        self.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(self, text=label, text_color="#93a4b7", font=ctk.CTkFont(size=12)).grid(
            row=0, column=0, padx=16, pady=(14, 4), sticky="w"
        )
        self.value_label = ctk.CTkLabel(self, text=value, font=ctk.CTkFont(size=20, weight="bold"))
        self.value_label.grid(row=1, column=0, padx=16, sticky="w")
        self.detail_label = ctk.CTkLabel(self, text=detail, text_color="#6b7280", font=ctk.CTkFont(size=12))
        self.detail_label.grid(row=2, column=0, padx=16, pady=(4, 14), sticky="w")

    def set_value(self, value: str, detail: str = "") -> None:
        self.value_label.configure(text=value)
        self.detail_label.configure(text=detail)


class PageHeader(ctk.CTkFrame):
    """Shared page heading."""

    def __init__(self, master: ctk.CTkFrame, title: str, subtitle: str) -> None:
        super().__init__(master, fg_color="transparent")
        ctk.CTkLabel(self, text=title, font=ctk.CTkFont(size=28, weight="bold")).grid(
            row=0, column=0, sticky="w"
        )
        ctk.CTkLabel(self, text=subtitle, text_color="#93a4b7").grid(row=1, column=0, pady=(4, 0), sticky="w")
