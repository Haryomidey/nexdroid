import React, { useEffect, useState } from 'react';
import { 
  Smartphone, 
  Cpu, 
  HardDrive, 
  Battery, 
  MenuSquare, 
  FolderOpen, 
  Camera, 
  Video, 
  RefreshCcw, 
  Settings, 
  ShieldAlert,
  DownloadCloud
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNexDroidStore } from '../store';

export default function Dashboard() {
  const { 
    activeDevice, 
    setActiveTab, 
    showToast,
    cpuHistory,
    currentCpu,
    currentRam,
    currentTemp
  } = useNexDroidStore();

  const [screenshotLoading, setScreenshotLoading] = useState(false);

  const takeScreenshotImmediate = async () => {
    if (!activeDevice) return;
    setScreenshotLoading(true);
    showToast('Snapshotting', 'Acquiring active frame slice...', 'info');
    try {
      const res = await fetch('/api/actions/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Capture Complete', 'Screenshot written to archive.', 'success');
        setActiveTab('Screenshots');
      }
    } catch {
      showToast('Error', 'Screen capture communications failed.', 'error');
    } finally {
      setScreenshotLoading(false);
    }
  };

  const executeRebootTrigger = async (type: string) => {
    if (!activeDevice) return;
    showToast('Reboot Dispatch', `Sending ${type} command packet...`, 'warning');
    try {
      const res = await fetch('/api/actions/reboot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id, type })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Command Complete', `Reboot payload accepted successfully.`, 'success');
      }
    } catch {
      showToast('Error', 'Failed to dispatch reboot command signal.', 'error');
    }
  };

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center text-gray-400 bg-[#09090b]">
        <Smartphone className="w-16 h-16 text-[#1da1f2] animate-pulse mb-4" />
        <h3 className="font-display text-lg font-bold text-gray-200">No device connected</h3>
        <p className="max-w-md mt-1.5 text-xs text-gray-400">
          NexDroid has not discovered any active USB or wireless adb devices. Go to the Device manager tab or make sure "Simulation Mode" is running.
        </p>
        <button 
          onClick={() => setActiveTab('Devices')}
          className="mt-5 px-4 py-2 border border-[#1da1f2] hover:bg-[#1da1f2]/10 text-xs font-semibold rounded-lg text-cyan-400 cursor-pointer"
        >
          Open Device Manager
        </button>
      </div>
    );
  }

  // Calculate memory metrics
  const totalRamGb = +(activeDevice.ramUsage.total / 1024).toFixed(1);
  const usedRamGb = +((activeDevice.ramUsage.total * (currentRam / 100)) / 1024).toFixed(1);

  // Storage metrics
  const storageTotal = +(activeDevice.storage.total / 1000).toFixed(0);
  const storageUsed = +(activeDevice.storage.used / 1000).toFixed(1);
  const storagePercent = Math.round((activeDevice.storage.used / activeDevice.storage.total) * 100);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="dashboard-tab-portal">
      
      {/* Device Summary banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#1f2023] bg-[#121215]/40 p-5 glow-card" id="dashboard-device-banner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#1da1f2] uppercase">Active Device Node</span>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white mb-0.5">{activeDevice.model}</h1>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span>Android {activeDevice.androidVersion}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>S/N: <strong className="font-mono text-gray-300">{activeDevice.serialNumber}</strong></span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>SDK Version {activeDevice.sdkVersion}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
              activeDevice.status === 'authorized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
            }`}>
              📡 ADB {activeDevice.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK QUICK ACTION BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="dashboard-action-links">
        {[
          { text: 'Mirror View', icon: Smartphone, tab: 'Mirror', color: 'text-cyan-400' },
          { text: 'Browse File', icon: FolderOpen, tab: 'Files', color: 'text-[#1da1f2]' },
          { text: 'Capture Screen', icon: Camera, click: takeScreenshotImmediate, color: 'text-amber-400', disabled: screenshotLoading },
          { text: 'Apps Hub', icon: MenuSquare, tab: 'Apps', color: 'text-emerald-400' },
          { text: 'ADB Terminal', icon: Cpu, tab: 'ADB Console', color: 'text-[#1da1f2]' },
          { text: 'Reboot Device', icon: RefreshCcw, click: () => executeRebootTrigger('reboot'), color: 'text-rose-400' }
        ].map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <button
              key={idx}
              id={`quick-action-link-${btn.text.toLowerCase().replace(/\s+/g, '-')}`}
              disabled={btn.disabled}
              onClick={() => {
                if (btn.click) btn.click();
                if (btn.tab) setActiveTab(btn.tab);
              }}
              className="flex flex-col items-center justify-center p-4 border border-[#1f2023] bg-[#121215]/50 rounded-xl hover:border-gray-500 hover:bg-[#18181c] transition-all duration-200 cursor-pointer text-center group active:scale-95"
            >
              <div className={`p-2.5 rounded-lg bg-[#0e0e11] mb-2 border border-[#1f2023] group-hover:scale-110 transition-transform ${btn.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-300 group-hover:text-white">{btn.text}</span>
            </button>
          );
        })}
      </div>

      {/* HARDWARE OVERVIEWS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metric-bento">
        {/* CPU */}
        <div className="p-5 rounded-xl border border-[#1f2023] bg-[#121215]/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">Core CPU Usage</p>
            <h4 className="font-display text-3xl font-bold tracking-tight text-white">{currentCpu}%</h4>
            <p className="text-[10px] text-[#1da1f2]">System fluctuate live</p>
          </div>
          <div className="p-3 bg-[#1da1f2]/10 rounded-lg text-[#1da1f2]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* RAM */}
        <div className="p-5 rounded-xl border border-[#1f2023] bg-[#121215]/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">Memory Allocation</p>
            <h4 className="font-display text-3xl font-bold tracking-tight text-white">{currentRam}%</h4>
            <p className="text-[10px] text-gray-400">{usedRamGb} GB of {totalRamGb} GB</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* BATTERY */}
        <div className="p-5 rounded-xl border border-[#1f2023] bg-[#121215]/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">Battery Stat</p>
            <h4 className="font-display text-3xl font-bold tracking-tight text-white">{activeDevice.batteryLevel}%</h4>
            <p className="text-[10px] text-emerald-400">Temp: {currentTemp}°C</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Battery className="w-6 h-6" />
          </div>
        </div>

        {/* STORAGE */}
        <div className="p-5 rounded-xl border border-[#1f2023] bg-[#121215]/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-400 font-medium font-sans">Storage Utilized</p>
              <h4 className="font-display text-xl font-bold text-white mt-1">{storagePercent}% Used</h4>
            </div>
            <span className="text-[11px] font-mono text-gray-400">{storageUsed} / {storageTotal} GB</span>
          </div>
          <div className="w-full bg-[#1e1e24] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#1da1f2] to-cyan-400 h-full rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
        </div>
      </div>

      {/* PLOTTED GRAPHS OF PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-resource-sections">
        {/* Recharts Area Plot */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[#1f2023] bg-[#121215]/10 space-y-4" id="performance-chart-panel">
          <div className="flex justify-between items-center text-sm">
            <h3 className="font-display font-medium text-gray-200">Plotted Core Metrics Logs</h3>
            <span className="text-xs text-[#1da1f2] font-semibold animate-pulse">● Recurrent Poll Active</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1da1f2" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#1da1f2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4b5563" fontSize={9} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#121215', borderColor: '#27272a', color: '#fff', fontSize: 11 }} />
                <Area type="monotone" name="CPU Usage %" dataKey="cpu" stroke="#1da1f2" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" name="Memory alloc %" dataKey="ram" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Build Info Card */}
        <div className="p-5 rounded-xl border border-[#1f2023] bg-[#121215]/10 flex flex-col justify-between" id="device-hardware-details">
          <h3 className="font-display font-medium text-sm text-gray-200 mb-4 pb-2 border-b border-[#1f2023]">Device Information</h3>
          
          <div className="space-y-4 text-xs font-medium flex-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Manufacturer</span>
              <span className="text-gray-200">{activeDevice.manufacturer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Device Model</span>
              <span className="text-gray-200 font-semibold">{activeDevice.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DPI Density</span>
              <span className="text-gray-200">{activeDevice.screenDensity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">USB Debug Port</span>
              <span className="font-mono text-[#1da1f2]">{activeDevice.connectionType === 'USB' ? 'USB /dev/bus/002' : 'TCP/5555'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build Number</span>
              <span className="font-mono text-gray-200">AP1A.240405.002.A1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Security Patch</span>
              <span className="text-emerald-400">2026-06-05</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1f2023] flex items-center gap-2.5 text-[10px] text-gray-400">
            <ShieldAlert className="w-3.5 h-3.5 text-[#1da1f2]" />
            <span>Developer Mode is active over local ADB bridge.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
