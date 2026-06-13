import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  Usb, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  CheckCircle, 
  XOctagon, 
  AlertTriangle 
} from 'lucide-react';
import { useNexDroidStore } from '../store';

export default function DeviceManager() {
  const { 
    devices, 
    activeDevice, 
    selectDevice, 
    fetchDevices, 
    showToast 
  } = useNexDroidStore();

  const [ip, setIp] = useState('');
  const [port, setPort] = useState('5555');
  const [customName, setCustomName] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleWifiConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip) {
      showToast('Error', 'IP address is required', 'warning');
      return;
    }

    setConnecting(true);
    showToast('Connecting', `Pinging WiFi debug port at ${ip}:${port}...`, 'info');

    try {
      const res = await fetch('/api/devices/connect-wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port: parseInt(port) || 5555, name: customName })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Connected', `Successfully established wireless bridge to ${ip}:${port}`, 'success');
        setIp('');
        setCustomName('');
        fetchDevices();
      } else {
        showToast('Connection Refused', data.error || 'Check local router isolation or adb toggle on Android.', 'error');
      }
    } catch {
      showToast('Error', 'Failed to reach backend wireless debugging socket parser.', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    showToast('Disconnecting', `Cutting active socket channel to ${name}...`, 'info');
    try {
      const res = await fetch('/api/devices/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Disconnected', `Successfully detached connection slot.`, 'success');
        fetchDevices();
      }
    } catch {
      showToast('Error', 'Failed to dispatch disconnect packet.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="device-manager-panel">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center pb-4 border-b border-[#1f2023]" id="dev-manager-header">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Device Node Manager</h1>
          <p className="text-xs text-gray-400">Manage and establish USB connections or wireless LAN ADB bridges.</p>
        </div>
        <button
          onClick={() => {
            fetchDevices();
            showToast('Scan Triggered', 'Searching active ports for available debug controllers...', 'info');
          }}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#1f2023] bg-[#121215] text-xs text-[#1da1f2] hover:text-white hover:border-gray-500 rounded-lg cursor-pointer transition-all active:scale-95"
          id="refresh-devices-list"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Re-scan Buses
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="device-manager-grid">
        
        {/* NETWORK WIFI FORMS */}
        <div className="space-y-4" id="wireless-bridge-form-block">
          <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1f2023]">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-semibold text-sm">Wireless Debug Link</h3>
            </div>

            <form onSubmit={handleWifiConnect} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400">Target IP Address</label>
                <input 
                  type="text" 
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.135" 
                  className="w-full px-3 py-2 border border-[#1f2023] bg-[#0a0a0c] text-white rounded-lg focus:outline-none focus:border-[#1da1f2] font-mono"
                  id="wifi-ip-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-gray-400">Nickname (Optional)</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Pixel Test" 
                    className="w-full px-3 py-2 border border-[#1f2023] bg-[#0a0a0c] text-white rounded-lg focus:outline-none focus:border-[#1da1f2]"
                    id="wifi-desc-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Port</label>
                  <input 
                    type="text" 
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="5555" 
                    className="w-full px-3 py-2 border border-[#1f2023] bg-[#0a0a0c] text-white rounded-lg focus:outline-none focus:border-[#1da1f2] font-mono text-center"
                    id="wifi-port-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1da1f2] hover:bg-[#1a8cd8] text-white font-semibold rounded-lg text-xs cursor-pointer disabled:opacity-50 border border-[#1da1f2]/20 active:scale-95 transition-all"
                id="wifi-connect-submit"
              >
                <Plus className="w-4 h-4" /> Link Wireless Device
              </button>
            </form>
          </div>

          {/* QUICK ADVICE */}
          <div className="p-4 rounded-xl border border-[#1da1f2]/10 bg-[#1da1f2]/5 text-[11px] leading-relaxed text-sky-300">
            <h4 className="font-bold mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#1da1f2] shrink-0" />
              Wireless Setup Guidance:
            </h4>
            <p className="space-y-1">
              1. Slide down notifications drawer of device, tap Developer Options.<br />
              2. Toggle on <strong>Wireless Debugging</strong>.<br />
              3. Retrieve IPv4 and Port (typically 5555 or dynamic random ports on Android 11+).
            </p>
          </div>
        </div>

        {/* ACTIVE ATTACHMENTS GRID LIST */}
        <div className="lg:col-span-2 space-y-4" id="devices-list-status-block">
          <div className="text-xs text-gray-400 font-semibold mb-2">Discovered Bus Terminals ({devices.length})</div>
          
          <div className="space-y-3" id="devices-nodes-collection">
            {devices.map((device) => {
              const isActive = activeDevice?.id === device.id;
              return (
                <div 
                  key={device.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-[#121215]/30 transition-all ${
                    isActive ? 'border-[#1da1f2] bg-[#121215]/60 shadow-lg' : 'border-[#1f2023] hover:border-gray-700'
                  }`}
                  id={`device-row-${device.id.toLowerCase()}`}
                >
                  <div className="flex items-center gap-4.5">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${
                      device.status === 'authorized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold">{device.name}</strong>
                        {device.connectionType === 'WiFi' ? (
                          <span className="p-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-bold"><Wifi className="w-2.5 h-2.5 inline" /> LAN</span>
                        ) : (
                          <span className="p-0.5 rounded bg-sky-500/10 text-sky-400 text-[9px] font-bold"><Usb className="w-2.5 h-2.5 inline" /> USB</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Android {device.androidVersion}</span>
                        <span className="w-1 m-auto h-1 rounded-full bg-gray-600" />
                        <span className="font-mono text-[10px]">{device.serialNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1f2023]">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        device.status === 'authorized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                      }`}>
                        {device.status === 'authorized' ? <CheckCircle className="w-3 h-3" /> : <XOctagon className="w-3 h-3" />}
                        {device.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isActive && device.status === 'authorized' && (
                        <button
                          onClick={() => selectDevice(device.id)}
                          className="px-3 py-1.5 border border-[#1da1f2]/40 hover:bg-[#1da1f2]/20 text-sky-450 text-xs font-semibold rounded-lg cursor-pointer transition-all"
                        >
                          Select
                        </button>
                      )}
                      
                      {device.connectionType === 'WiFi' && (
                        <button
                          onClick={() => handleDisconnect(device.id, device.name)}
                          className="p-1.5 border border-orange-500/20 hover:bg-orange-500/10 text-orange-400 rounded-lg cursor-pointer transition-all"
                          title="Disconnect wireless linkage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
