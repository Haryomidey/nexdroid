import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Camera, 
  RotateCw, 
  Trash2, 
  Battery, 
  Wifi, 
  Usb, 
  Terminal, 
  ChevronDown
} from 'lucide-react';
import { useNexDroidStore } from '../store';

export default function TopBar() {
  const { 
    devices, 
    activeDevice, 
    selectDevice, 
    fetchDevices, 
    showToast,
    clearLogs
  } = useNexDroidStore();
  
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  const triggerScreenshot = async () => {
    if (!activeDevice) {
      showToast('Error', 'No active device selected to capture.', 'error');
      return;
    }
    
    setScreenshotLoading(true);
    showToast('Capturing', 'Sending screen capture signal to device viewport...', 'info');
    
    try {
      const res = await fetch('/api/actions/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Screenshot Complete', 'Image file written successfully to screenshot historical log.', 'success');
      } else {
        showToast('Failed Capture', data.error || 'Check active connection protocol.', 'error');
      }
    } catch {
      showToast('Error', 'Failed to communicate with device adb proxy server.', 'error');
    } finally {
      setScreenshotLoading(false);
    }
  };

  const triggerAdbRestart = async () => {
    showToast('Pruning Daemon', 'Rebooting adb server background process...', 'info');
    try {
      const res = await fetch('/api/actions/reboot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'restart-adb' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Daemon Active', 'ADB host socket server successfully connected.', 'success');
        fetchDevices();
      }
    } catch {
      showToast('Error', 'Failed to reboot daemon listener.', 'error');
    }
  };

  return (
    <header 
      className="flex items-center justify-between h-16 px-6 bg-[#09090b]/80 border-b border-[#1f2023] backdrop-blur-md z-25 w-full"
      id="top-dashboard-header"
    >
      {/* Device Connection Dropdown Selector */}
      <div className="relative" id="top-device-selector-boundary">
        <button
          onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
          className="flex items-center gap-3.5 px-3.5 py-1.5 rounded-lg border border-[#1f2023] bg-[#121215] hover:border-gray-600 hover:text-white text-gray-200 transition-all text-sm font-medium cursor-pointer"
          id="top-active-device-picker"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="max-w-[140px] md:max-w-[200px] truncate">
              {activeDevice ? activeDevice.name : "Select Device slot..."}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {deviceDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setDeviceDropdownOpen(false)} 
            />
            <div 
              className="absolute left-0 mt-2 w-72 rounded-lg border border-[#27272a] bg-[#121215] shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-1 px-2.5 duration-100"
              id="top-device-dropdown-box"
            >
              <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase px-2 py-1 border-b border-[#1f2023] mb-1">
                Connected Devices ({devices.length})
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5" id="devices-dropdown-scroller">
                {devices.map((device) => {
                  const isSelect = activeDevice?.id === device.id;
                  return (
                    <button
                      key={device.id}
                      onClick={() => {
                        selectDevice(device.id);
                        setDeviceDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-md font-medium text-xs transition-all text-left ${
                        isSelect 
                          ? 'bg-gradient-to-r from-[#1da1f2]/10 to-[#0c313a]/30 border-l-2 border-[#1da1f2] text-cyan-400' 
                          : 'text-gray-300 hover:bg-[#1f1f23]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold truncate">{device.name}</p>
                        <p className="text-[9px] text-gray-400 truncate mt-0.5">{device.serialNumber}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          device.status === 'authorized' ? 'bg-emerald-500 shadow-xl' : 'bg-red-500'
                        }`} />
                        <span className="text-[9px] text-gray-400 uppercase">{device.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[#1f2023] flex justify-between">
                <button
                  onClick={() => {
                    fetchDevices();
                    setDeviceDropdownOpen(false);
                    showToast('Sync Complete', 'ADB list values refreshed.', 'success');
                  }}
                  className="text-[10px] text-[#1da1f2] hover:text-white font-semibold flex items-center gap-1 px-1 py-0.5"
                >
                  <RotateCw className="w-2.5 h-2.5 animate-spin-reverse" /> Rescan Buses
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Connection & Status Badges */}
      {activeDevice && (
        <div className="hidden lg:flex items-center gap-5 text-gray-400 text-xs border-r border-[#1f2023] pr-6" id="top-quick-badges-rail">
          {/* Connection Mode Status */}
          <div className="flex items-center gap-1.5 bg-[#121215] border border-[#1f2023] px-2.5 py-1 rounded-full">
            {activeDevice.connectionType === 'WiFi' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#1da1f2]" />
                <span>Wi-Fi Debugging ({activeDevice.ipAddress || 'LAN'})</span>
              </>
            ) : (
              <>
                <Usb className="w-3.5 h-3.5 text-cyan-400" />
                <span>USB ADB Cable</span>
              </>
            )}
          </div>

          {/* Device Battery readout */}
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-gray-200">{activeDevice.batteryLevel}%</span>
            <span className="text-[10px] text-gray-500">({activeDevice.batteryTemp}°C)</span>
          </div>
        </div>
      )}

      {/* Global Bar Commands / Screen Actions */}
      <div className="flex items-center gap-2.5" id="top-actions-panel">
        <button
          onClick={triggerScreenshot}
          disabled={screenshotLoading}
          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#1da1f2]/10 hover:bg-[#1da1f2]/25 text-[#1da1f2] text-xs font-semibold cursor-pointer border border-[#1da1f2]/20 active:scale-95 transition-all"
          title="Take Screenshot"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Screen Capture</span>
        </button>

        <button
          onClick={triggerAdbRestart}
          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/10 hover:bg-slate-800/30 text-gray-300 text-xs font-semibold cursor-pointer border border-gray-700/35 transition-all"
          title="Restart ADB Host daemon"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset ADB</span>
        </button>

        <button
          onClick={() => {
            clearLogs();
            showToast('Logs Cleared', 'Active browser logcat stream cleaned.', 'info');
          }}
          className="flex items-center justify-center p-1.5 rounded-lg border border-red-500/15 hover:bg-red-500/10 text-red-400 transition-all cursor-pointer"
          title="Clean active console outputs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
