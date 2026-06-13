from __future__ import annotations

import customtkinter as ctk

from ui.icons import get_icon
from ui.theme import ACCENT, BORDER, CARD, CARD_HOVER, PANEL_DEEP, TEXT, TEXT_MUTED, TEXT_SOFT, TEXT_SUBTLE


class StatCard(ctk.CTkFrame):
    """Compact metric card used across dashboard pages."""

    def __init__(self, master: ctk.CTkFrame, label: str, value: str = "-", detail: str = "") -> None:
        super().__init__(master, fg_color=CARD, corner_radius=12, border_width=1, border_color=BORDER)
        self.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(self, text=label, text_color=TEXT_MUTED, font=ctk.CTkFont(size=12, weight="bold")).grid(
            row=0, column=0, padx=16, pady=(14, 4), sticky="w"
        )
        self.value_label = ctk.CTkLabel(self, text=value, text_color=TEXT, font=ctk.CTkFont(size=24, weight="bold"))
        self.value_label.grid(row=1, column=0, padx=16, sticky="w")
        self.detail_label = ctk.CTkLabel(self, text=detail, text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=12))
        self.detail_label.grid(row=2, column=0, padx=16, pady=(4, 14), sticky="w")

    def set_value(self, value: str, detail: str = "") -> None:
        self.value_label.configure(text=value)
        self.detail_label.configure(text=detail)


class Panel(ctk.CTkFrame):
    """Web-app style bordered panel."""

    def __init__(self, master: ctk.CTkFrame, **kwargs: object) -> None:
        super().__init__(
            master,
            fg_color=kwargs.pop("fg_color", CARD),
            corner_radius=12,
            border_width=1,
            border_color=BORDER,
            **kwargs,
        )


class SectionTitle(ctk.CTkFrame):
    """Small section heading with the web app's compact hierarchy."""

    def __init__(self, master: ctk.CTkFrame, title: str, subtitle: str = "") -> None:
        super().__init__(master, fg_color="transparent")
        self.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(self, text=title, text_color=TEXT, font=ctk.CTkFont(size=15, weight="bold")).grid(
            row=0, column=0, sticky="w"
        )
        if subtitle:
            ctk.CTkLabel(self, text=subtitle, text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=11)).grid(
                row=1, column=0, pady=(2, 0), sticky="w"
            )


class ActionTile(ctk.CTkButton):
    """Dashboard-style action tile."""

    def __init__(
        self,
        master: ctk.CTkFrame,
        title: str,
        icon: str,
        accent: bool = False,
        command=None,
        enabled: bool = True,
    ) -> None:
        super().__init__(
            master,
            text=title,
            image=get_icon(icon, size=28, color=ACCENT if accent else TEXT_SOFT),
            compound="top",
            height=92,
            corner_radius=12,
            fg_color=CARD,
            hover_color=CARD_HOVER,
            border_width=1,
            border_color=BORDER,
            text_color=ACCENT if accent else TEXT_SOFT,
            font=ctk.CTkFont(size=12, weight="bold"),
            command=command,
            state="normal" if enabled else "disabled",
        )


class ToolbarButton(ctk.CTkButton):
    """Compact toolbar button matching the web app controls."""

    def __init__(self, master: ctk.CTkFrame, text: str, command=None, accent: bool = False, enabled: bool = True) -> None:
        super().__init__(
            master,
            text=text,
            height=34,
            corner_radius=8,
            fg_color=ACCENT if accent else CARD,
            hover_color="#1a8cd8" if accent else CARD_HOVER,
            border_width=0 if accent else 1,
            border_color=BORDER,
            text_color="#ffffff" if accent else ACCENT,
            font=ctk.CTkFont(size=12, weight="bold"),
            command=command,
            state="normal" if enabled else "disabled",
        )


class EmptyState(ctk.CTkFrame):
    """Centered empty-state content."""

    def __init__(self, master: ctk.CTkFrame, title: str, message: str, icon: str = "N") -> None:
        super().__init__(master, fg_color="transparent")
        ctk.CTkLabel(self, text="", image=get_icon(icon, size=44, color=ACCENT)).grid(
            row=0, column=0, pady=(0, 10)
        )
        ctk.CTkLabel(self, text=title, text_color=TEXT, font=ctk.CTkFont(size=16, weight="bold")).grid(
            row=1, column=0
        )
        ctk.CTkLabel(self, text=message, text_color=TEXT_MUTED, wraplength=420, justify="center").grid(
            row=2, column=0, pady=(6, 0)
        )


class PageHeader(ctk.CTkFrame):
    """Shared page heading."""

    def __init__(self, master: ctk.CTkFrame, title: str, subtitle: str) -> None:
        super().__init__(master, fg_color="transparent")
        ctk.CTkLabel(self, text=title, text_color=TEXT, font=ctk.CTkFont(size=22, weight="bold")).grid(
            row=0, column=0, sticky="w"
        )
        ctk.CTkLabel(self, text=subtitle, text_color=TEXT_MUTED).grid(row=1, column=0, pady=(4, 0), sticky="w")
        ctk.CTkLabel(self, text="ADB CONTROL SURFACE", text_color=ACCENT, font=ctk.CTkFont(size=10, weight="bold")).grid(
            row=0, column=1, padx=16, sticky="e"
        )
        self.grid_columnconfigure(0, weight=1)


def themed_entry(master: ctk.CTkFrame, placeholder: str = "") -> ctk.CTkEntry:
    return ctk.CTkEntry(
        master,
        placeholder_text=placeholder,
        height=38,
        corner_radius=8,
        fg_color=PANEL_DEEP,
        border_color=BORDER,
        text_color=TEXT,
        placeholder_text_color=TEXT_SUBTLE,
    )
