from __future__ import annotations

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader


class DevicePage(ctk.CTkFrame):
    """USB and wireless device connection page."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color="#0b1020", corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        PageHeader(self, "Devices", "Detect USB devices, manage authorization state, and reconnect ADB.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )
        self.device_list = ctk.CTkTextbox(self, height=360, fg_color="#111827", corner_radius=14)
        self.device_list.grid(row=1, column=0, padx=28, sticky="nsew")
        self.device_list.insert("1.0", "Connected devices will appear here.\n")

        refresh = ctk.CTkButton(self, text="Refresh Devices", command=self._refresh)
        refresh.grid(row=2, column=0, padx=28, pady=18, sticky="w")

    def _refresh(self) -> None:
        devices = self.adb_service.list_devices()
        self.device_list.delete("1.0", "end")
        if not devices:
            self.device_list.insert("1.0", "No devices detected.\n")
            return
        for device in devices:
            self.device_list.insert("end", f"{device.serial}\t{device.status}\n")
