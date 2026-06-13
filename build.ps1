$ErrorActionPreference = "Stop"

$AppName = "NexDroid Control Center"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $Root ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    $Python = "python"
}

Set-Location $Root

Write-Host "Building $AppName..." -ForegroundColor Cyan

& $Python -m PyInstaller `
    --noconfirm `
    --clean `
    --windowed `
    --name $AppName `
    --add-data "assets;assets" `
    main.py

if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller build failed."
}

$ExePath = Join-Path $Root "dist\$AppName\$AppName.exe"
if (-not (Test-Path $ExePath)) {
    throw "Built executable was not found at $ExePath"
}

$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "$AppName.lnk"
$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = Split-Path -Parent $ExePath
$Shortcut.Description = "Launch $AppName"
$Shortcut.IconLocation = "$ExePath,0"
$Shortcut.Save()

Write-Host "Build complete." -ForegroundColor Green
Write-Host "Executable: $ExePath"
Write-Host "Desktop shortcut: $ShortcutPath"