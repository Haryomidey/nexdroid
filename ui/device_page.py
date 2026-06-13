from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader
from ui.theme import APP_BG, SURFACE, SURFACE_MUTED


class DevicePage(ctk.CTkFrame):
    """USB and wireless device connection page."""

    def __init__(self, master: ctk.CTkFrame, adb_service: ADBService) -> None:
        super().__init__(master, fg_color=APP_BG, corner_radius=0)
        self.adb_service = adb_service
        self._build()

    def _build(self) -> None:
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        PageHeader(self, "Devices", "Detect USB devices, manage authorization state, and reconnect ADB.").grid(
            row=0, column=0, padx=28, pady=(26, 18), sticky="ew"
        )

        wireless_panel = ctk.CTkFrame(self, fg_color=SURFACE, corner_radius=14)
        wireless_panel.grid(row=1, column=0, padx=28, pady=(0, 18), sticky="ew")
        wireless_panel.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            wireless_panel,
            text="Wireless ADB",
            font=ctk.CTkFont(size=18, weight="bold"),
        ).grid(row=0, column=0, padx=18, pady=(18, 4), sticky="w")

        ctk.CTkLabel(
            wireless_panel,
            text="Connect once by USB, approve debugging on the phone, then let NexDroid switch it to Wi-Fi.",
        ).grid(row=1, column=0, columnspan=3, padx=18, pady=(0, 14), sticky="w")

        self.ip_entry = ctk.CTkEntry(wireless_panel, placeholder_text="Phone IP address", height=38)
        self.ip_entry.grid(row=2, column=0, padx=18, pady=(0, 16), sticky="ew")

        ctk.CTkButton(
            wireless_panel,
            text="Auto Connect",
            height=38,
            command=self._auto_connect_wireless,
        ).grid(row=2, column=1, padx=(0, 10), pady=(0, 16), sticky="w")

        ctk.CTkButton(
            wireless_panel,
            text="Connect IP",
            height=38,
            fg_color="#2563eb",
            command=self._connect_entered_ip,
        ).grid(row=2, column=2, padx=(0, 18), pady=(0, 16), sticky="e")

        self.wireless_status = ctk.CTkTextbox(wireless_panel, height=92, fg_color=SURFACE_MUTED, corner_radius=10)
        self.wireless_status.grid(row=3, column=0, columnspan=3, padx=18, pady=(0, 18), sticky="ew")
        self._set_wireless_status("Ready. Plug in with USB, then click Auto Connect.\n")

        self.device_list = ctk.CTkTextbox(self, height=260, fg_color=SURFACE, corner_radius=14)
        self.device_list.grid(row=2, column=0, padx=28, sticky="nsew")
        self.device_list.insert("1.0", "Connected devices will appear here.\n")

        refresh = ctk.CTkButton(self, text="Refresh Devices", command=self._refresh)
        refresh.grid(row=3, column=0, padx=28, pady=18, sticky="w")

    def _refresh(self) -> None:
        devices = self.adb_service.list_devices()
        self.device_list.delete("1.0", "end")
        if not devices:
            self.device_list.insert("1.0", "No devices detected.\n")
            return
        for device in devices:
            self.device_list.insert("end", f"{device.serial}\t{device.status}\n")

    def _auto_connect_wireless(self) -> None:
        self._set_wireless_status("Switching connected USB device to wireless ADB...\n")
        threading.Thread(target=self._auto_connect_wireless_background, daemon=True).start()

    def _auto_connect_wireless_background(self) -> None:
        messages: list[str] = []
        messages.append(self.adb_service.enable_wireless_debugging())
        ip_address = self.adb_service.get_wifi_ip()
        if not ip_address:
            messages.append("Could not detect the phone Wi-Fi IP. Type it manually and click Connect IP.")
            self.after(0, lambda: self._set_wireless_status("\n".join(messages) + "\n"))
            return

        messages.append(f"Detected phone IP: {ip_address}")
        messages.append(self.adb_service.connect_wireless(ip_address))
        self.after(0, lambda: self._finish_wireless_connect(ip_address, messages))

    def _connect_entered_ip(self) -> None:
        ip_address = self.ip_entry.get().strip()
        if not ip_address:
            self._set_wireless_status("Enter the phone IP address first.\n")
            return
        self._set_wireless_status(f"Connecting to {ip_address}...\n")
        threading.Thread(target=self._connect_entered_ip_background, args=(ip_address,), daemon=True).start()

    def _connect_entered_ip_background(self, ip_address: str) -> None:
        result = self.adb_service.connect_wireless(ip_address)
        self.after(0, lambda: self._finish_wireless_connect(ip_address, [result]))

    def _finish_wireless_connect(self, ip_address: str, messages: list[str]) -> None:
        self.ip_entry.delete(0, "end")
        self.ip_entry.insert(0, ip_address)
        self._set_wireless_status("\n".join(message for message in messages if message) + "\n")
        self._refresh()

    def _set_wireless_status(self, message: str) -> None:
        self.wireless_status.configure(state="normal")
        self.wireless_status.delete("1.0", "end")
        self.wireless_status.insert("1.0", message)
        self.wireless_status.configure(state="disabled")
