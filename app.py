from __future__ import annotations

import queue
from typing import Callable

import customtkinter as ctk

from services.adb_service import ADBService
from ui.apps_page import AppsPage
from ui.dashboard import DashboardPage
from ui.device_page import DevicePage
from ui.files_page import FilesPage
from ui.logs_page import LogsPage
from ui.mirror_page import MirrorPage
from ui.settings_page import SettingsPage
from ui.sidebar import Sidebar
from ui.terminal_page import TerminalPage
from utils.config import AppConfig
from workers.device_worker import DeviceWorker


class NexDroidApp(ctk.CTk):
    """Main desktop shell for NexDroid Control Center."""

    def __init__(self) -> None:
        super().__init__()
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.title("NexDroid Control Center")
        self.geometry("1280x820")
        self.minsize(1040, 680)

        self.config_model = AppConfig.load()
        self.event_queue: queue.Queue[dict[str, object]] = queue.Queue()
        self.adb_service = ADBService(adb_path=self.config_model.adb_path)
        self.device_worker = DeviceWorker(self.adb_service, self.event_queue)
        self.pages: dict[str, ctk.CTkFrame] = {}

        self._build_layout()
        self._register_pages()
        self.show_page("Dashboard")
        self.device_worker.start()
        self.after(250, self._drain_events)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_layout(self) -> None:
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self.sidebar = Sidebar(self, on_select=self.show_page)
        self.sidebar.grid(row=0, column=0, rowspan=2, sticky="nsew")

        self.top_bar = ctk.CTkFrame(self, height=64, fg_color="#111827", corner_radius=0)
        self.top_bar.grid(row=0, column=1, sticky="ew")
        self.top_bar.grid_columnconfigure(1, weight=1)

        self.device_label = ctk.CTkLabel(
            self.top_bar,
            text="No device connected",
            font=ctk.CTkFont(size=15, weight="bold"),
        )
        self.device_label.grid(row=0, column=0, padx=24, pady=18, sticky="w")

        self.search_entry = ctk.CTkEntry(
            self.top_bar,
            placeholder_text="Search apps, files, commands, logs...",
            height=36,
            corner_radius=10,
        )
        self.search_entry.grid(row=0, column=1, padx=16, pady=14, sticky="ew")

        self.connection_badge = ctk.CTkLabel(
            self.top_bar,
            text="ADB idle",
            height=30,
            corner_radius=16,
            fg_color="#1f2937",
            padx=14,
        )
        self.connection_badge.grid(row=0, column=2, padx=24, pady=16, sticky="e")

        self.content = ctk.CTkFrame(self, fg_color="#0b1020", corner_radius=0)
        self.content.grid(row=1, column=1, sticky="nsew")
        self.content.grid_rowconfigure(0, weight=1)
        self.content.grid_columnconfigure(0, weight=1)

    def _register_pages(self) -> None:
        page_factories: dict[str, Callable[[ctk.CTkFrame], ctk.CTkFrame]] = {
            "Dashboard": lambda parent: DashboardPage(parent, self.adb_service),
            "Devices": lambda parent: DevicePage(parent, self.adb_service),
            "Screen Mirror": lambda parent: MirrorPage(parent),
            "Apps": lambda parent: AppsPage(parent, self.adb_service),
            "Files": lambda parent: FilesPage(parent),
            "Media": lambda parent: DashboardPage(parent, self.adb_service, title="Media"),
            "Logs": lambda parent: LogsPage(parent, self.adb_service),
            "Developer Tools": lambda parent: DashboardPage(parent, self.adb_service, title="Developer Tools"),
            "ADB Terminal": lambda parent: TerminalPage(parent, self.adb_service),
            "Settings": lambda parent: SettingsPage(parent, self.config_model),
        }

        for name, factory in page_factories.items():
            page = factory(self.content)
            page.grid(row=0, column=0, sticky="nsew")
            self.pages[name] = page

    def show_page(self, name: str) -> None:
        self.sidebar.set_active(name)
        page = self.pages.get(name)
        if page is not None:
            page.tkraise()

    def _drain_events(self) -> None:
        while True:
            try:
                event = self.event_queue.get_nowait()
            except queue.Empty:
                break
            if event.get("type") == "devices_changed":
                devices = event.get("devices", [])
                device_count = len(devices) if isinstance(devices, list) else 0
                if device_count:
                    first = devices[0]
                    serial = first.get("serial", "Unknown") if isinstance(first, dict) else "Unknown"
                    status = first.get("status", "device") if isinstance(first, dict) else "device"
                    self.device_label.configure(text=f"{serial}")
                    self.connection_badge.configure(text=f"{device_count} device(s) - {status}", fg_color="#064e3b")
                else:
                    self.device_label.configure(text="No device connected")
                    self.connection_badge.configure(text="ADB idle", fg_color="#1f2937")
        self.after(500, self._drain_events)

    def _on_close(self) -> None:
        self.device_worker.stop()
        self.destroy()
