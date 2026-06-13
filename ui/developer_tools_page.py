from __future__ import annotations

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader, Panel, SectionTitle, ToolbarButton
from ui.theme import APP_BG, BORDER, PANEL_DEEP, TEXT_MUTED


class DeveloperToolsPage(ctk.CTkFrame):
    """ADB developer utility launcher."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        body = ctk.CTkScrollableFrame(self, fg_color=APP_BG, corner_radius=0)
        body.grid(row=0, column=0, sticky="nsew")
        body.grid_columnconfigure(0, weight=1)

        PageHeader(body, "Developer Tools", "ADB utilities for reboot, package, logging, and wireless workflows.").grid(
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )

        grid = ctk.CTkFrame(body, fg_color="transparent")
        grid.grid(row=1, column=0, padx=24, pady=(0, 24), sticky="ew")
        grid.grid_columnconfigure((0, 1, 2), weight=1, uniform="tools")

        groups = [
            ("Power Controls", ["Reboot Device", "Reboot Recovery", "Reboot Bootloader"]),
            ("ADB Host", ["Restart ADB Server", "Kill ADB Server", "Wireless Helper"]),
            ("Diagnostics", ["Capture Bug Report", "Open Log Viewer", "Package Manager"]),
        ]
        for column, (title, actions) in enumerate(groups):
            panel = Panel(grid)
            panel.grid(row=0, column=column, padx=6, sticky="nsew")
            panel.grid_columnconfigure(0, weight=1)
            SectionTitle(panel, title, "Commands are enabled as services are implemented.").grid(
                row=0, column=0, padx=18, pady=(16, 12), sticky="ew"
            )
            for row, action in enumerate(actions, start=1):
                enabled = action == "Restart ADB Server"
                command = self._restart_adb if enabled else None
                ToolbarButton(panel, action, command=command, accent=enabled, enabled=enabled).grid(
                    row=row, column=0, padx=18, pady=5, sticky="ew"
                )

        output = Panel(body, fg_color=PANEL_DEEP)
        output.grid(row=2, column=0, padx=24, pady=(0, 24), sticky="ew")
        output.grid_columnconfigure(0, weight=1)
        SectionTitle(output, "Command Output", "Developer tool responses will appear here.").grid(
            row=0, column=0, padx=18, pady=(16, 10), sticky="ew"
        )
        self.output = ctk.CTkTextbox(output, height=140, fg_color="#0a0a0c", border_width=1, border_color=BORDER)
        self.output.grid(row=1, column=0, padx=18, pady=(0, 18), sticky="ew")
        self.output.insert("1.0", "Ready.\n")

    def _restart_adb(self) -> None:
        self.output.insert("end", "\n$ adb kill-server\n")
        self.output.insert("end", self.adb_service.run_raw("kill-server") + "\n")
        self.output.insert("end", "$ adb start-server\n")
        self.output.insert("end", self.adb_service.run_raw("start-server") + "\n")
