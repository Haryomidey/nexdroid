from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import EmptyState, PageHeader, Panel, ToolbarButton, themed_entry
from ui.theme import ACCENT, APP_BG, BORDER, CARD, PANEL_DEEP, TEXT, TEXT_MUTED, TEXT_SOFT, TEXT_SUBTLE


class AppsPage(ctk.CTkFrame):
    """Installed apps manager."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        header_row = ctk.CTkFrame(self, fg_color="transparent")
        header_row.grid(row=0, column=0, padx=24, pady=(22, 16), sticky="ew")
        header_row.grid_columnconfigure(0, weight=1)
        PageHeader(header_row, "Application Manager", "Launch packages, force stop processes, and inspect APK records.").grid(
            row=0, column=0, sticky="ew"
        )
        ToolbarButton(header_row, "Refresh Registry", command=self._load_apps).grid(row=0, column=1, padx=(16, 0), sticky="e")

        toolbar = ctk.CTkFrame(self, fg_color="transparent")
        toolbar.grid(row=1, column=0, padx=24, sticky="ew")
        toolbar.grid_columnconfigure(0, weight=1)
        themed_entry(toolbar, "Search by application title or reverseDNS package label...").grid(
            row=0, column=0, sticky="ew", padx=(0, 12)
        )

        pills = ctk.CTkFrame(toolbar, fg_color=CARD, corner_radius=8, border_width=1, border_color=BORDER)
        pills.grid(row=0, column=1, sticky="e")
        for index, label in enumerate(["ALL", "USER", "SYSTEM"]):
            ctk.CTkButton(
                pills,
                text=label,
                width=72,
                height=28,
                corner_radius=6,
                fg_color=ACCENT if index == 0 else "transparent",
                hover_color="#1a8cd8" if index == 0 else "#18181c",
                text_color="#ffffff" if index == 0 else TEXT_MUTED,
                command=None,
            ).grid(row=0, column=index, padx=3, pady=3)

        self.list_panel = Panel(self)
        self.list_panel.grid(row=2, column=0, padx=24, pady=18, sticky="nsew")
        self.list_panel.grid_rowconfigure(0, weight=1)
        self.list_panel.grid_columnconfigure(0, weight=1)

        self.rows = ctk.CTkScrollableFrame(self.list_panel, fg_color="transparent")
        self.rows.grid(row=0, column=0, padx=12, pady=12, sticky="nsew")
        self.rows.grid_columnconfigure(0, weight=1)
        EmptyState(self.rows, "No application records", "Load packages from an authorized device to populate the registry.", "APP").grid(
            row=0, column=0, pady=48
        )

    def _load_apps(self) -> None:
        self._clear_rows()
        EmptyState(self.rows, "Loading registry", "Reading package records from ADB...", "ADB").grid(row=0, column=0, pady=48)
        threading.Thread(target=self._load_apps_background, daemon=True).start()

    def _load_apps_background(self) -> None:
        packages = self.adb_service.list_packages()
        self.after(0, lambda: self._render_packages(packages))

    def _render_packages(self, packages: list[str]) -> None:
        self._clear_rows()
        if not packages:
            EmptyState(self.rows, "No active application records", "No packages were returned, or no authorized device is connected.", "APP").grid(
                row=0, column=0, pady=48
            )
            return
        for index, package in enumerate(packages):
            self._add_package_row(index, package)

    def _clear_rows(self) -> None:
        for child in self.rows.winfo_children():
            child.destroy()

    def _add_package_row(self, index: int, package: str) -> None:
        display = package.removeprefix("package:")
        app_name = display.split("=")[-1].split("/")[-1] if "=" in display else display.split(".")[-1]
        row = Panel(self.rows, fg_color="#121215")
        row.grid(row=index, column=0, pady=5, sticky="ew")
        row.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(row, text="APP", text_color=ACCENT, fg_color="#0d2230", corner_radius=8, width=52).grid(
            row=0, column=0, rowspan=2, padx=14, pady=14
        )
        ctk.CTkLabel(row, text=app_name or "Android Package", text_color=TEXT, font=ctk.CTkFont(size=14, weight="bold")).grid(
            row=0, column=1, padx=(0, 12), pady=(12, 2), sticky="w"
        )
        ctk.CTkLabel(row, text=display, text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=11, family="Consolas")).grid(
            row=1, column=1, padx=(0, 12), pady=(0, 12), sticky="w"
        )
        for column, label in enumerate(["Run", "Stop", "Info"], start=2):
            ctk.CTkButton(
                row,
                text=label,
                width=54,
                height=30,
                corner_radius=7,
                fg_color=PANEL_DEEP,
                hover_color="#18181c",
                border_width=1,
                border_color=BORDER,
                text_color=TEXT_SOFT if label != "Run" else ACCENT,
            ).grid(row=0, column=column, rowspan=2, padx=(0, 8), pady=14)
