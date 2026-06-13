# NexDroid Control Center

NexDroid Control Center is a modern desktop Android device management companion built with Python, CustomTkinter, SQLite, background workers, and Android Debug Bridge.

The goal is to make common ADB workflows feel simple, visual, and reliable without requiring a companion app on the phone.

## Features

- Dark and light theme support
- USB device detection
- Simplified Wireless ADB connection flow
- Device status dashboard shell
- Installed apps package viewer
- Logcat snapshot viewer
- Built-in ADB terminal
- Modular services, workers, UI pages, and database layers

## Requirements

- Python 3.10 or newer
- Android Platform Tools
- ADB available on your `PATH`
- USB debugging enabled on the Android device

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
python main.py
```

## Connect A Device

### USB

1. Enable Developer Options on your Android phone.
2. Enable USB Debugging.
3. Connect the phone with a USB cable.
4. Approve the debugging prompt on the phone.
5. Open NexDroid and go to `Devices`.
6. Click `Refresh Devices`.

### Wireless ADB

NexDroid includes a simplified wireless helper.

1. Connect the phone with USB once.
2. Approve USB debugging on the phone.
3. Open `Devices`.
4. Click `Auto Connect` in the Wireless ADB panel.

The app will switch ADB to TCP mode, detect the phone Wi-Fi IP, and connect automatically. If IP detection fails, enter the phone IP manually and click `Connect IP`.

## Device Statuses

- `device`: connected and authorized
- `unauthorized`: unlock the phone and approve the debugging prompt
- `offline`: reconnect the cable, restart ADB, or reconnect wireless ADB
- no device: ADB may be missing, USB debugging may be off, or the cable may be charge-only

## Project Structure

```text
nexdroid/
  main.py
  app.py
  ui/
  services/
  workers/
  database/
  utils/
  assets/
    icons/
    themes/
    images/
```

## Development Notes

Heavy ADB operations should run in background threads so the UI remains responsive. Keep UI code in `ui/`, ADB and business logic in `services/`, long-running work in `workers/`, and persistence concerns in `database/`.
