import React, { useState, useRef } from 'react';
import { 
  Cpu, 
  DownloadCloud, 
  RotateCw, 
  Terminal, 
  Info, 
  ShieldAlert, 
  Zap, 
  FileSymlink, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { useNexDroidStore } from '../store';

export default function DeveloperTools() {
  const { 
    activeDevice, 
    showToast,
    fetchDevices 
  } = useNexDroidStore();

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [installing, setInstalling] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bugreportLoading, setBugreportLoading] = useState(false);

  // APK triggers sideload
  const triggerApkInstallation = async (fileToInstall: File) => {
    if (!activeDevice) return;
    setInstalling(true);
    setApkFile(fileToInstall);
    
    showToast('Uploading APK', `Pushing installer file [${fileToInstall.name}] to cache directory...`, 'info');
    
    // Simulate APK copy and installation process
    setTimeout(async () => {
      try {
        const sizeMb = `${(fileToInstall.size / 1024 / 1024).toFixed(1)} MB`;
        const res = await fetch(`/api/devices/${activeDevice.id}/apps/install`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            apkName: fileToInstall.name,
            apkSize: sizeMb
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Install Succeeded', `${fileToInstall.name} packages registered successfully.`, 'success');
          setApkFile(null);
        }
      } catch {
        showToast('Error', 'Sideload installer pipeline broken.', 'error');
      } finally {
        setInstalling(false);
      }
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHover(true);
  };

  const handleDragLeave = () => {
    setIsHover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHover(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      triggerApkInstallation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerApkInstallation(e.target.files[0]);
    }
  };

  const executeSystemTrigger = async (type: 'recovery' | 'bootloader' | 'bugreport' | 'reboot') => {
    if (!activeDevice) {
      showToast('Error', 'No active device connection available.', 'error');
      return;
    }

    if (type === 'bugreport') {
      setBugreportLoading(true);
      showToast('Compiling Bugreport', 'Pulling internal state lists, window lists, and log summaries into ZIP...', 'info');
      // Simulate compiling zip
      setTimeout(() => {
        setBugreportLoading(false);
        const a = document.createElement('a');
        const simulatedText = `NexDroid Android Bugreport. Build: AP1A.240405.002.A1, Device=${activeDevice.model}`;
        const blob = new Blob([simulatedText], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `bugreport_${activeDevice.model.replace(/\s+/g, '_')}_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Bugreport Compiled', 'Exported ZIP packages.', 'success');
      }, 2500);
    } else {
      if (!window.confirm(`Dispatched ADB command: reboot ${type === 'reboot' ? '' : type}. Are you sure?`)) {
        return;
      }
      showToast('Dispatching Command', `Reboot signal sent [${type.toUpperCase()}]`, 'warning');
      try {
        const res = await fetch('/api/actions/reboot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: activeDevice.id, type })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Reboot complete', `Sent instruction packet to targets.`, 'success');
          fetchDevices();
        }
      } catch {
        showToast('Error', 'Thread dispatching failed.', 'error');
      }
    }
  };

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <Cpu className="w-12 h-12 text-zinc-650 mb-3 animate-pulse" />
        <p className="text-sm">Select active device to access development utilities.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="developer-tools-tab">
      
      {/* HEADER BAR */}
      <div className="pb-4 border-b border-[#1f2023]" id="devtools-header">
        <h1 className="font-display text-xl font-semibold text-white">Developer Command Station</h1>
        <p className="text-xs text-gray-400 font-medium">Sideload application packages, access low-level boot loaders, or compile developer system reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="devtools-layout-grids">
        
        {/* APK SIDELOAD CONSOLE CARD */}
        <div className="space-y-4" id="apk-sideload-container-section">
          <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
            <h3 className="font-display font-semibold text-sm text-gray-200">Sideload APK Installer</h3>
            
            {installing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3.5 fill-cyan-400 bg-zinc-950/40 rounded-xl text-xs border border-zinc-800">
                <DownloadCloud className="w-10 h-10 text-[#1da1f2] animate-bounce" />
                <p className="font-semibold text-gray-200">Installing: {apkFile?.name}</p>
                <span className="text-[10px] text-zinc-500 animate-pulse">Broadcasting PM installation package blocks...</span>
              </div>
            ) : (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
                  isHover 
                    ? 'border-[#1da1f2] bg-[#1da1f2]/5' 
                    : 'border-zinc-850 hover:border-zinc-700 bg-[#0d0d10]'
                }`}
                id="apk-drag-zone"
              >
                <FileSymlink className="w-9 h-9 text-[#1da1f2] mb-3" />
                <p className="font-semibold text-xs text-zinc-300">Drag Android APK packages here or click to browse</p>
                <p className="text-[10px] text-zinc-500 mt-1">Supports standard Dalvik binary executable packages (.apk)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".apk"
                  className="hidden" 
                />
              </div>
            )}
          </div>

          <div className="p-5 border border-[#1da1f2]/10 bg-[#1da1f2]/5 text-xs rounded-xl space-y-2 leading-relaxed text-sky-300" id="wireless-debug-tip">
            <h4 className="font-bold flex items-center gap-1"><Info className="w-4 h-4 text-[#1da1f2] shrink-0" /> Wireless Connection Guidelines:</h4>
            <p>
              By default, physical ADB debugging caches are authorized over port 5555. If your target is running Android 11+ and prompts randomly for pairing codes, utilize the <strong>ADB Console</strong> to submit raw pairing signatures: <strong className="font-mono text-white">adb pair [IP]:[port] [pairing_code]</strong>.
            </p>
          </div>
        </div>

        {/* REBOOTS AND REPORT UTILITIES CARD */}
        <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-5" id="devtools-power-commands-block">
          <h3 className="font-display font-semibold text-sm text-gray-200">System ADB Actions</h3>
          
          <div className="space-y-3" id="power-buttons-grid">
            {/* Bugreport button */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f2023] bg-[#121215]/30">
              <div>
                <strong className="text-xs font-semibold block text-gray-200">Generate Bugreport package</strong>
                <span className="text-[10px] text-gray-500">Compiles a detailed system configurations context diagnostic report.</span>
              </div>
              <button
                onClick={() => executeSystemTrigger('bugreport')}
                disabled={bugreportLoading}
                className="px-3.5 py-1.5 bg-[#1da1f2] hover:bg-[#1a8cd8] text-[11px] font-semibold text-white rounded-lg cursor-pointer transition-all disabled:opacity-50"
              >
                {bugreportLoading ? "Compiling..." : "Generate ZIP"}
              </button>
            </div>

            {/* Reboot device */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f2023] bg-[#121215]/30">
              <div>
                <strong className="text-xs font-semibold block text-gray-200">Soft System Reboot</strong>
                <span className="text-[10px] text-gray-500">Sends standard reboot signature commands directly inside target loops.</span>
              </div>
              <button
                onClick={() => executeSystemTrigger('reboot')}
                className="px-3.5 py-1.5 border border-[#1f2023] hover:bg-[#1f1f25] text-gray-300 text-[11px] font-semibold rounded-lg cursor-pointer"
              >
                Soft Reboot
              </button>
            </div>

            {/* Reboot Recovery */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f2023] bg-[#121215]/30">
              <div>
                <strong className="text-xs font-semibold block text-gray-200">Reboot to Recovery Menu</strong>
                <span className="text-[10px] text-gray-500">Boots Android target device directly into stock or custom recoveries.</span>
              </div>
              <button
                onClick={() => executeSystemTrigger('recovery')}
                className="px-3.5 py-1.5 border border-[#1f2023] hover:bg-orange-600/10 hover:text-orange-400 hover:border-orange-500/15 text-gray-300 text-[11px] font-semibold rounded-lg cursor-pointer"
              >
                Recovery
              </button>
            </div>

            {/* Reboot Bootloader */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f2023] bg-[#121215]/30">
              <div>
                <strong className="text-xs font-semibold block text-gray-200">Reboot to Bootloader (Fastboot/Odin)</strong>
                <span className="text-[10px] text-gray-500">Boot immediately into device loader node for partitioning flashes.</span>
              </div>
              <button
                onClick={() => executeSystemTrigger('bootloader')}
                className="px-3.5 py-1.5 border border-[#1f2023] hover:bg-cyan-600/10 hover:text-cyan-400 hover:border-cyan-500/15 text-gray-300 text-[11px] font-semibold rounded-lg cursor-pointer"
              >
                Bootloader
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
