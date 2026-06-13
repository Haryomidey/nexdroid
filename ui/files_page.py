from __future__ import annotations

import customtkinter as ctk

from ui.components import EmptyState, PageHeader, Panel, SectionTitle, ToolbarButton
from ui.theme import ACCENT, APP_BG, BORDER, PANEL_DEEP, TEXT, TEXT_MUTED, TEXT_SOFT, TEXT_SUBTLE


class FilesPage(ctk.CTkFrame):
    """Android file explorer page."""

    def __init__(self, master: ctk.CTkFrame) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        header_row = ctk.CTkFrame(self, fg_color="transparent")
        header_row.grid(row=0, column=0, padx=24, pady=(22, 16), sticky="ew")
        header_row.grid_columnconfigure(0, weight=1)
        PageHeader(header_row, "File Manager", "Browse storage, upload, download, rename, delete, and create folders.").grid(
            row=0, column=0, sticky="ew"
        )
        actions = ctk.CTkFrame(header_row, fg_color="transparent")
        actions.grid(row=0, column=1, sticky="e")
        ToolbarButton(actions, "Upload", enabled=False).grid(row=0, column=0, padx=(0, 8))
        ToolbarButton(actions, "New Folder", accent=True, enabled=False).grid(row=0, column=1)

        explorer = Panel(self)
        explorer.grid(row=1, column=0, padx=24, pady=(0, 24), sticky="nsew")
        explorer.grid_columnconfigure(1, weight=1)
        explorer.grid_rowconfigure(0, weight=1)

        sidebar = ctk.CTkFrame(explorer, fg_color=PANEL_DEEP, corner_radius=8, border_width=1, border_color=BORDER)
        sidebar.grid(row=0, column=0, padx=14, pady=14, sticky="ns")
        SectionTitle(sidebar, "Storage Roots").grid(row=0, column=0, padx=14, pady=(14, 10), sticky="w")
        folders = ["Downloads", "Pictures", "Movies", "Music", "Documents", "DCIM"]
        for index, folder in enumerate(folders, start=1):
            ctk.CTkButton(
                sidebar,
                text=folder,
                width=200,
                height=34,
                anchor="w",
                fg_color="#0d2230" if index == 1 else "transparent",
                hover_color="#18181c",
                text_color=ACCENT if index == 1 else TEXT_MUTED,
                corner_radius=7,
                state="disabled",
            ).grid(row=index, column=0, padx=10, pady=2, sticky="ew")

        file_area = ctk.CTkFrame(explorer, fg_color=PANEL_DEEP, corner_radius=8, border_width=1, border_color=BORDER)
        file_area.grid(row=0, column=1, padx=(0, 14), pady=14, sticky="nsew")
        file_area.grid_columnconfigure(0, weight=1)
        file_area.grid_rowconfigure(1, weight=1)
        SectionTitle(file_area, "Downloads", "Device path: /sdcard/Download").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        EmptyState(file_area, "No file records loaded", "Select an authorized device to browse Android storage.", "folder").grid(
            row=1, column=0
        )
