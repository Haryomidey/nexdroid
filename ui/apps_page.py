from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader


class AppsPage(ctk.CTkFrame):
    """Installed apps manager."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color="#0b1020", corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        PageHeader(self, "Apps", "Search, launch, stop, clear, uninstall, and inspect packages.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        toolbar = ctk.CTkFrame(self, fg_color="transparent")
        toolbar.grid(row=1, column=0, padx=28, sticky="ew")
        toolbar.grid_columnconfigure(0, weight=1)
        ctk.CTkEntry(toolbar, placeholder_text="Search installed apps...", height=38).grid(
            row=0, column=0, sticky="ew", padx=(0, 12)
        )
        ctk.CTkButton(toolbar, text="Load Apps", command=self._load_apps).grid(row=0, column=1)

        self.list_box = ctk.CTkTextbox(self, fg_color="#111827", corner_radius=14)
        self.list_box.grid(row=2, column=0, padx=28, pady=18, sticky="nsew")
        self.list_box.insert("1.0", "Installed packages will appear here.\n")

    def _load_apps(self) -> None:
        self.list_box.delete("1.0", "end")
        self.list_box.insert("1.0", "Loading packages...\n")
        threading.Thread(target=self._load_apps_background, daemon=True).start()

    def _load_apps_background(self) -> None:
        packages = self.adb_service.list_packages()
        self.after(0, lambda: self._render_packages(packages))

    def _render_packages(self, packages: list[str]) -> None:
        self.list_box.delete("1.0", "end")
        if not packages:
            self.list_box.insert("1.0", "No packages found or no authorized device connected.\n")
            return
        self.list_box.insert("1.0", "\n".join(packages))
