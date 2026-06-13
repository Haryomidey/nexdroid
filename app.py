from __future__ import annotations

import queue
from typing import Callable

import customtkinter as ctk

from services.adb_service import ADBService
from ui.apps_page import AppsPage
from ui.dashboard import DashboardPage
from ui.device_page import DevicePage
from ui.developer_tools_page import DeveloperToolsPage
from ui.files_page import FilesPage
from ui.logs_page import LogsPage
from ui.mirror_page import MirrorPage
from ui.recordings_page import RecordingsPage
from ui.screenshots_page import ScreenshotsPage
from ui.settings_page import SettingsPage
from ui.sidebar import Sidebar
from ui.terminal_page import TerminalPage
from ui.theme import ACCENT, APP_BG, BADGE_CONNECTED, BADGE_IDLE, BORDER, PANEL, TEXT_MUTED, TOP_BAR_BG
from utils.config import AppConfig
from workers.device_worker import DeviceWorker


class NexDroidApp(ctk.CTk):
    """Main desktop shell for NexDroid Control Center."""

    def __init__(self) -> None:
        self.config_model = AppConfig.load()
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        super().__init__()

        self.title("NexDroid Control Center")
        self.geometry("1280x820")
        self.minsize(1040, 680)
        self._open_fullscreen()

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

    def _open_fullscreen(self) -> None:
        try:
            self.state("zoomed")
        except ctk.tkinter.TclError:
            width = self.winfo_screenwidth()
            height = self.winfo_screenheight()
            self.geometry(f"{width}x{height}+0+0")

    def _build_layout(self) -> None:
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self.sidebar = Sidebar(self, on_select=self.show_page)
        self.sidebar.grid(row=0, column=0, rowspan=2, sticky="nsew")

        self.top_bar = ctk.CTkFrame(
            self,
            height=64,
            fg_color=TOP_BAR_BG,
            corner_radius=0,
            border_width=1,
            border_color=BORDER,
        )
        self.top_bar.grid(row=0, column=1, sticky="ew")
        self.top_bar.grid_columnconfigure(1, weight=1)

        self.device_label = ctk.CTkLabel(
            self.top_bar,
            text="Select Device slot...",
            font=ctk.CTkFont(size=15, weight="bold"),
            text_color="#e5e7eb",
        )
        self.device_label.grid(row=0, column=0, padx=24, pady=18, sticky="w")

        self.search_entry = ctk.CTkEntry(
            self.top_bar,
            placeholder_text="Search apps, files, commands, logs...",
            height=36,
            corner_radius=8,
            fg_color=PANEL,
            border_color=BORDER,
            text_color="#f4f4f5",
            placeholder_text_color=TEXT_MUTED,
        )
        self.search_entry.grid(row=0, column=1, padx=16, pady=14, sticky="ew")

        self.connection_badge = ctk.CTkFrame(
            self.top_bar,
            height=30,
            corner_radius=999,
            fg_color=BADGE_IDLE,
            border_width=1,
            border_color=BORDER,
        )
        self.connection_badge.grid(row=0, column=2, padx=24, pady=16, sticky="e")
        self.connection_badge.grid_propagate(False)

        self.connection_badge_label = ctk.CTkLabel(
            self.connection_badge,
            text="ADB idle",
            text_color=ACCENT,
            font=ctk.CTkFont(size=12, weight="bold"),
        )
        self.connection_badge_label.grid(row=0, column=0, padx=14, pady=4)

        self.content = ctk.CTkFrame(self, fg_color=APP_BG, corner_radius=0)
        self.content.grid(row=1, column=1, sticky="nsew")
        self.content.grid_rowconfigure(0, weight=1)
        self.content.grid_columnconfigure(0, weight=1)

    def _register_pages(self) -> None:
        page_factories: dict[str, Callable[[ctk.CTkFrame], ctk.CTkFrame]] = {
            "Dashboard": lambda parent: DashboardPage(parent, self.adb_service, on_navigate=self.show_page),
            "Devices": lambda parent: DevicePage(parent, self.adb_service),
            "Mirror": lambda parent: MirrorPage(parent),
            "Apps": lambda parent: AppsPage(parent, self.adb_service),
            "Files": lambda parent: FilesPage(parent),
            "Screenshots": lambda parent: ScreenshotsPage(parent),
            "Recordings": lambda parent: RecordingsPage(parent),
            "Logs": lambda parent: LogsPage(parent, self.adb_service),
            "Developer Tools": lambda parent: DeveloperToolsPage(parent, self.adb_service),
            "ADB Console": lambda parent: TerminalPage(parent, self.adb_service),
            "Settings": lambda parent: SettingsPage(parent, self.config_model, on_theme_change=self.set_theme),
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
                    self.connection_badge_label.configure(text=f"{device_count} device(s) - {status}")
                    self.connection_badge.configure(fg_color=BADGE_CONNECTED)
                else:
                    self.device_label.configure(text="No device connected")
                    self.connection_badge_label.configure(text="ADB idle")
                    self.connection_badge.configure(fg_color=BADGE_IDLE)
        self.after(500, self._drain_events)

    def set_theme(self, theme: str) -> None:
        self.config_model.theme = "dark"
        self.config_model.save()
        ctk.set_appearance_mode("dark")

    def _on_close(self) -> None:
        self.device_worker.stop()
        self.destroy()
