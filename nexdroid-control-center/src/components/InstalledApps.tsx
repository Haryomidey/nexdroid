import React, { useEffect, useState } from 'react';
import { 
  AppWindow, 
  Search, 
  Play, 
  Ban, 
  Trash2, 
  DownloadCloud, 
  Compass, 
  RotateCw,
  Info
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { InstalledApp } from '../types';

export default function InstalledApps() {
  const { 
    activeDevice, 
    showToast 
  } = useNexDroidStore();

  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'system'>('all');
  
  const fetchApps = async () => {
    if (!activeDevice) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/devices/${activeDevice.id}/apps?search=${search}`);
      const data = await res.json();
      setApps(data);
    } catch {
      showToast('Error', 'Failed to retrieve application registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [activeDevice?.id]);

  const triggerAppAction = async (packageName: string, action: 'launch' | 'stop' | 'uninstall') => {
    if (!activeDevice) return;
    
    // Optimistic offline simulations
    if (action === 'launch') {
      showToast('Launching', `Booting launcher activity for ${packageName}...`, 'info');
    } else if (action === 'stop') {
      showToast('Force Stopping', `Killing app processes for ${packageName}...`, 'warning');
    } else if (action === 'uninstall') {
      showToast('Uninstalling', `Pruning package contents for ${packageName}...`, 'warning');
    }

    try {
      const res = await fetch(`/api/devices/${activeDevice.id}/apps/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast('App Status Updated', `Successfully dispatched ${action} to Android thread.`, 'success');
        fetchApps();
      }
    } catch {
      showToast('Action Failed', 'Failed to execute instructions on device.', 'error');
    }
  };

  const handleExtractApk = (appName: string, pack: string) => {
    showToast('Extracting APK', `Backing up Android APK packages [${pack}]`, 'info');
    setTimeout(() => {
      // Create instant mock download link for the APK
      const text = `NexDroid Simulator Extracted Bundle: Name=${appName}, Package=${pack}`;
      const blob = new Blob([text], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pack}_backup.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Backup Saved', `${appName} APK wrapper exported successfully.`, 'success');
    }, 1500);
  };

  const filteredApps = apps.filter((app) => {
    if (filter === 'user' && app.isSystem) return false;
    if (filter === 'system' && !app.isSystem) return false;
    return app.appName.toLowerCase().includes(search.toLowerCase()) || 
           app.packageName.toLowerCase().includes(search.toLowerCase());
  });

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <AppWindow className="w-12 h-12 text-zinc-600 animate-bounce mb-3" />
        <p className="text-sm">Select an active device to explore installed app files.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="apps-registry-tab">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2023]" id="apps-header">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Application Manager</h1>
          <p className="text-xs text-gray-400">Launch package instances, force stop background background threads, or extract raw compiled APK files.</p>
        </div>
        
        <button
          onClick={fetchApps}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f2023] bg-[#121215] text-xs text-[#1da1f2] hover:text-white rounded-lg cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Registry
        </button>
      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between" id="apps-filter-toolbar">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by application title or reverseDNS package label (e.g. settings)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#1f2023] bg-[#121215]/50 text-white rounded-lg focus:outline-none focus:border-[#1da1f2]"
            id="app-dns-filter-input"
          />
        </div>

        {/* Tab category pills */}
        <div className="flex items-center gap-1 bg-[#121215]/80 p-1 border border-[#1f2023] rounded-lg text-xs" id="apps-type-pills">
          {(['all', 'user', 'system'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all uppercase text-[10px] ${
                filter === opt 
                  ? 'bg-[#1da1f2] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt} Packages
            </button>
          ))}
        </div>
      </div>

      {/* APPLICATIONS LIST CARD */}
      <div className="border border-[#1f2023] bg-[#121215]/10 rounded-xl overflow-hidden" id="apps-grid-box">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-gray-500" id="apps-empty-view">
            <Compass className="w-10 h-10 text-zinc-650 mx-auto animate-spin-reverse mb-3" />
            <p className="text-xs font-semibold">No active application records matched query parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f2023]" id="apps-rows-root">
            {filteredApps.map((app) => (
              <div 
                key={app.packageName}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#121215]/20 hover:bg-[#121215]/50 transition-all gap-4"
                id={`app-item-${app.packageName.replace(/\./g, '-')}`}
              >
                {/* Left meta information */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    app.isSystem ? 'bg-zinc-800/40 border-[#27272a] text-zinc-400' : 'bg-[#1da1f2]/10 border-[#1da1f2]/10 text-[#1da1f2]'
                  }`}>
                    <AppWindow className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-gray-200">{app.appName}</strong>
                      <span className="text-[9px] font-mono text-gray-400">v{app.versionName}</span>
                      
                      {app.status === 'running' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Active background thread is running" />
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-400 mt-1">{app.packageName}</p>
                    <div className="flex gap-2 items-center mt-1.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        app.isSystem ? 'bg-zinc-800 text-zinc-400' : 'bg-[#1da1f2]/20 text-[#1da1f2]'
                      }`}>
                        {app.isSystem ? 'System Node' : 'Third Party'}
                      </span>
                      <span className="text-gray-500 font-mono">Size: {app.size}</span>
                    </div>
                  </div>
                </div>

                {/* Right Control actions */}
                <div className="flex items-center gap-2 border-t md:border-t-0 border-[#1f2023] pt-3 md:pt-0 justify-end">
                  {/* Launch */}
                  <button
                    onClick={() => triggerAppAction(app.packageName, 'launch')}
                    className="p-1.5 border border-[#1f2023] hover:bg-emerald-500/15 hover:text-emerald-400 text-gray-400 hover:border-emerald-500/20 rounded-md cursor-pointer transition-all"
                    title="Launch App Activity"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  {/* Force Stop */}
                  {app.status === 'running' && (
                    <button
                      onClick={() => triggerAppAction(app.packageName, 'stop')}
                      className="p-1.5 border border-[#1f2023] hover:bg-amber-500/15 hover:text-amber-400 text-gray-400 hover:border-amber-500/20 rounded-md cursor-pointer transition-all"
                      title="Force Kill App Process"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}

                  {/* Extract APK */}
                  <button
                    onClick={() => handleExtractApk(app.appName, app.packageName)}
                    className="p-1.5 border border-[#1f2023] hover:bg-cyan-500/15 hover:text-cyan-400 text-gray-400 hover:border-cyan-500/20 rounded-md cursor-pointer transition-all"
                    title="Extract apk installation file"
                  >
                    <DownloadCloud className="w-4 h-4" />
                  </button>

                  {/* Uninstall */}
                  {!app.isSystem && (
                    <button
                      onClick={() => triggerAppAction(app.packageName, 'uninstall')}
                      className="p-1.5 border border-[#1f2023] hover:bg-rose-500/15 hover:text-rose-400 text-gray-400 hover:border-rose-500/20 rounded-md cursor-pointer transition-all"
                      title="Uninstall App Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
