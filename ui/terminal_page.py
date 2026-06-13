from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader, Panel, ToolbarButton, themed_entry
from ui.theme import ACCENT, APP_BG, BORDER, PANEL_DEEP, TEXT_SOFT


class TerminalPage(ctk.CTkFrame):
    """Built-in ADB terminal."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        PageHeader(self, "ADB Console", "Run ADB commands with history and output capture.").grid(
            row=0, column=0, padx=24, pady=(22, 16), sticky="ew"
        )
        command_bar = ctk.CTkFrame(self, fg_color="transparent")
        command_bar.grid(row=1, column=0, padx=24, sticky="ew")
        command_bar.grid_columnconfigure(0, weight=1)
        self.command_entry = themed_entry(command_bar, "Example: shell getprop ro.product.model")
        self.command_entry.grid(row=0, column=0, sticky="ew", padx=(0, 12))
        self.command_entry.bind("<Return>", lambda _event: self._run_command())
        ToolbarButton(command_bar, "Run", command=self._run_command, accent=True).grid(row=0, column=1)

        terminal_panel = Panel(self)
        terminal_panel.grid(row=2, column=0, padx=24, pady=18, sticky="nsew")
        terminal_panel.grid_columnconfigure(0, weight=1)
        terminal_panel.grid_rowconfigure(0, weight=1)
        self.output = ctk.CTkTextbox(terminal_panel, fg_color=PANEL_DEEP, corner_radius=10, border_width=1, border_color=BORDER, text_color=TEXT_SOFT, font=ctk.CTkFont(family="Consolas", size=12))
        self.output.grid(row=0, column=0, padx=12, pady=12, sticky="nsew")

    def _run_command(self) -> None:
        command = self.command_entry.get().strip()
        if not command:
            return
        self.output.insert("end", f"\n$ adb {command}\n")
        self.command_entry.delete(0, "end")
        threading.Thread(target=self._run_background, args=(command,), daemon=True).start()

    def _run_background(self, command: str) -> None:
        result = self.adb_service.run_raw(command)
        self.after(0, lambda: self.output.insert("end", result + "\n"))
