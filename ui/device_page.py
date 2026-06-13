from __future__ import annotations

import threading

import customtkinter as ctk

from services.adb_service import ADBService
from ui.components import PageHeader, Panel, SectionTitle, ToolbarButton, themed_entry
from ui.theme import ACCENT, ACCENT_HOVER, APP_BG, BORDER, CARD, PANEL_DEEP, SUCCESS, TEXT, TEXT_MUTED, TEXT_SOFT, TEXT_SUBTLE


class DevicePage(ctk.CTkFrame):
    """USB and wireless device connection page."""

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

        header_row = ctk.CTkFrame(body, fg_color="transparent")
        header_row.grid(row=0, column=0, padx=24, pady=(22, 16), sticky="ew")
        header_row.grid_columnconfigure(0, weight=1)
        PageHeader(header_row, "Device Node Manager", "Manage USB connections and wireless LAN ADB bridges.").grid(
            row=0, column=0, sticky="ew"
        )
        ToolbarButton(header_row, "Re-scan Buses", command=self._refresh).grid(row=0, column=1, padx=(16, 0), sticky="e")

        grid = ctk.CTkFrame(body, fg_color="transparent")
        grid.grid(row=1, column=0, padx=24, pady=(0, 24), sticky="ew")
        grid.grid_columnconfigure(0, weight=1)
        grid.grid_columnconfigure(1, weight=2)
        grid.grid_rowconfigure(0, weight=1)

        wireless_panel = Panel(grid)
        wireless_panel.grid(row=0, column=0, padx=(0, 12), sticky="nsew")
        wireless_panel.grid_columnconfigure(0, weight=1)

        SectionTitle(wireless_panel, "Wireless Debug Link", "Create a TCP bridge after one USB approval.").grid(
            row=0, column=0, padx=18, pady=(18, 14), sticky="ew"
        )

        ctk.CTkLabel(
            wireless_panel,
            text="Connect once by USB, approve debugging on the phone, then let NexDroid switch it to Wi-Fi.",
            text_color=TEXT_MUTED,
            wraplength=320,
            justify="left",
        ).grid(row=1, column=0, padx=18, pady=(0, 14), sticky="w")

        ctk.CTkLabel(wireless_panel, text="Target IP Address", text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=11)).grid(
            row=2, column=0, padx=18, pady=(0, 5), sticky="w"
        )
        self.ip_entry = themed_entry(wireless_panel, "e.g. 192.168.1.135")
        self.ip_entry.grid(row=3, column=0, padx=18, pady=(0, 12), sticky="ew")

        buttons = ctk.CTkFrame(wireless_panel, fg_color="transparent")
        buttons.grid(row=4, column=0, padx=18, pady=(0, 14), sticky="ew")
        buttons.grid_columnconfigure((0, 1), weight=1, uniform="wifi")
        ToolbarButton(buttons, "Auto Connect", command=self._auto_connect_wireless, accent=True).grid(
            row=0, column=0, padx=(0, 6), sticky="ew"
        )
        ToolbarButton(buttons, "Connect IP", command=self._connect_entered_ip).grid(
            row=0, column=1, padx=(6, 0), sticky="ew"
        )

        guidance = Panel(wireless_panel, fg_color="#071721")
        guidance.grid(row=5, column=0, padx=18, pady=(0, 14), sticky="ew")
        ctk.CTkLabel(
            guidance,
            text="Wireless Setup Guidance",
            text_color=ACCENT,
            font=ctk.CTkFont(size=12, weight="bold"),
        ).grid(row=0, column=0, padx=14, pady=(12, 2), sticky="w")
        ctk.CTkLabel(
            guidance,
            text="Keep phone and PC on the same Wi-Fi network. Android 11+ may use a dynamic wireless debugging port.",
            text_color=TEXT_MUTED,
            wraplength=300,
            justify="left",
        ).grid(row=1, column=0, padx=14, pady=(0, 12), sticky="w")

        self.wireless_status = ctk.CTkTextbox(
            wireless_panel,
            height=110,
            fg_color=PANEL_DEEP,
            corner_radius=8,
            border_width=1,
            border_color=BORDER,
            text_color=TEXT_SOFT,
        )
        self.wireless_status.grid(row=6, column=0, padx=18, pady=(0, 18), sticky="ew")
        self._set_wireless_status("Ready. Plug in with USB, then click Auto Connect.\n")

        list_panel = Panel(grid)
        list_panel.grid(row=0, column=1, padx=(12, 0), sticky="nsew")
        list_panel.grid_columnconfigure(0, weight=1)
        list_panel.grid_rowconfigure(1, weight=1)
        SectionTitle(list_panel, "Discovered Bus Terminals", "Connected USB and Wi-Fi debug sessions.").grid(
            row=0, column=0, padx=18, pady=(18, 10), sticky="ew"
        )
        self.device_rows = ctk.CTkScrollableFrame(list_panel, fg_color="transparent")
        self.device_rows.grid(row=1, column=0, padx=18, pady=(0, 18), sticky="nsew")
        self.device_rows.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(
            self.device_rows,
            text="No devices detected. Connect a phone by USB or use Wireless ADB.",
            text_color=TEXT_MUTED,
            font=ctk.CTkFont(size=13),
        )
        self._refresh()

    def _refresh(self) -> None:
        devices = self.adb_service.list_devices()
        for child in self.device_rows.winfo_children():
            child.destroy()
        if not devices:
            ctk.CTkLabel(
                self.device_rows,
                text="No devices detected. Connect a phone by USB or use Wireless ADB.",
                text_color=TEXT_MUTED,
                font=ctk.CTkFont(size=13),
            ).grid(row=0, column=0, padx=18, pady=36)
            return
        for index, device in enumerate(devices):
            self._add_device_row(index, device.serial, device.status)

    def _add_device_row(self, row: int, serial: str, status: str) -> None:
        is_ready = status == "device"
        row_frame = Panel(self.device_rows, fg_color="#121215")
        row_frame.grid(row=row, column=0, pady=6, sticky="ew")
        row_frame.grid_columnconfigure(1, weight=1)
        badge_color = "#052e24" if is_ready else "#2a1515"
        badge_text = SUCCESS if is_ready else "#fb7185"
        ctk.CTkLabel(row_frame, text="USB" if ":" not in serial else "LAN", text_color=ACCENT, fg_color="#0d2230", corner_radius=6, width=46).grid(
            row=0, column=0, padx=14, pady=14, sticky="w"
        )
        ctk.CTkLabel(row_frame, text=serial, text_color=TEXT, font=ctk.CTkFont(size=14, weight="bold")).grid(
            row=0, column=1, padx=(0, 12), pady=(12, 2), sticky="w"
        )
        ctk.CTkLabel(row_frame, text="Android Debug Bridge endpoint", text_color=TEXT_SUBTLE, font=ctk.CTkFont(size=11)).grid(
            row=1, column=1, padx=(0, 12), pady=(0, 12), sticky="w"
        )
        ctk.CTkLabel(row_frame, text=status.upper(), text_color=badge_text, fg_color=badge_color, corner_radius=999, padx=10, pady=3).grid(
            row=0, column=2, rowspan=2, padx=14, pady=14, sticky="e"
        )

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
