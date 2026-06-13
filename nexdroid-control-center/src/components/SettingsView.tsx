import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Cpu, 
  FolderLock, 
  Save,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Radio,
  Server,
  Terminal,
  RefreshCw,
  Sliders,
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';
import { useNexDroidStore } from '../store';

// Mock profiles for simulated devices to make the setup feel interactive
const SIMULATED_PROFILES = [
  { id: 'pixel9', name: 'Google Pixel 9 Pro', resolution: '1280 x 2856', api: 'Android 14 (API 34)', ram: '16 GB' },
  { id: 's24', name: 'Samsung Galaxy S24 Ultra', resolution: '1440 x 3120', api: 'Android 14 (API 34)', ram: '12 GB' },
  { id: 'op12', name: 'OnePlus 12', resolution: '1440 x 3168', api: 'Android 14 (API 34)', ram: '16 GB' },
  { id: 'generic', name: 'Generic Android Simulator', resolution: '1080 x 2400', api: 'Android 13 (API 33)', ram: '8 GB' },
];

export default function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    showToast,
    activeDevice,
    devices
  } = useNexDroidStore();

  const [mockEnabled, setMockEnabled] = useState(true);
  const [adbPath, setAdbPath] = useState('adb');
  const [refreshInterval, setRefreshInterval] = useState(1500);
  const [developerMode, setDeveloperMode] = useState(true);

  // High-fidelity active tabs for setting divisions
  const [activeSection, setActiveSection] = useState<'general' | 'connection' | 'simulate' | 'diagnostics'>('general');
  const [selectedProfile, setSelectedProfile] = useState('pixel9');
  
  // Interactive diagnostic states
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    if (settings) {
      setMockEnabled(settings.mockEnabled);
      setAdbPath(settings.adbPath);
      setRefreshInterval(settings.refreshInterval);
      setDeveloperMode(settings.developerMode);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      mockEnabled,
      adbPath,
      refreshInterval: parseInt(refreshInterval as any) || 1500,
      developerMode
    });
  };

  // Run a high fidelity interactive simulator diagnostic
  const runDiagnostics = () => {
    setTestingConnection(true);
    setDiagnosticLog(['[SYSTEM] Initializing system diagnostic scan...', '']);
    
    const steps = [
      { msg: 'Checking ADB socket server listener on port 5555...', delay: 400 },
      { msg: 'Evaluating active local environment paths...', delay: 800 },
      { msg: mockEnabled ? '[SIMULATOR] Active offline loopback: ONLINE. Active device records loaded.' : '[HARDWARE] Checking USB device connection pipelines...', delay: 1200 },
      { msg: `Evaluating telemetry polling intervals: Active threshold is (${refreshInterval}ms)...`, delay: 1700 },
      { msg: '[OK] Diagnostic complete! Core system operating within nominal limits.', delay: 2100 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setDiagnosticLog(prev => [...prev, step.msg]);
        if (step.msg.includes('[OK]')) {
          setTestingConnection(false);
          showToast('Diagnostics Succeeded', 'Core connection system operating within nominal parameters.', 'success');
        }
      }, step.delay);
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-zinc-100" id="settings-stage-portal">
      
      {/* HEADER SECTION */}
      <div className="pb-4 border-b border-[#1f2023] flex flex-col md:flex-row md:items-center justify-between gap-4" id="settings-header">
        <div>
          <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-[#1da1f2]" /> Console Configuration
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Configure ADB paths, change polling intervals, manage device simulators, and monitor connectivity.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#121215] p-1 rounded-lg border border-[#1f2023] text-xs">
          <button 
            type="button"
            onClick={() => setActiveSection('general')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeSection === 'general' ? 'bg-[#1da1f2] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            General Settings
          </button>
          <button 
            type="button"
            onClick={() => setActiveSection('connection')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeSection === 'connection' ? 'bg-[#1da1f2] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            ADB & Port Bridge
          </button>
          <button 
            type="button"
            onClick={() => setActiveSection('diagnostics')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeSection === 'diagnostics' ? 'bg-[#1da1f2] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Diagnostics Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-layout-grid">
        
        {/* LEFT COLUMN: ACTIVE FORM SETTINGS */}
        <div className="lg:col-span-2 space-y-6" id="settings-form-column">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {activeSection === 'general' && (
              <div className="space-y-6" id="settings-section-general">
                {/* 1. MOCK MODE TOGGLE CARD */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4 shadow-sm transition-all hover:border-[#1da1f2]/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#1da1f2] animate-pulse" />
                        <strong className="text-sm font-bold text-white block">Simulation / Offline Demo Mode</strong>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-1">
                        Accelerate preview experience by simulating device filesystems, real-time log pipelines, and terminal sockets cleanly inside your cloud sandbox without hardware requirements.
                      </p>
                    </div>
                    
                    {/* Twitter Blue Custom Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => setMockEnabled(!mockEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1da1f2]/20 ${
                        mockEnabled ? 'bg-[#1da1f2]' : 'bg-zinc-700'
                      }`}
                      aria-label="Toggle Mock Mode"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          mockEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {mockEnabled ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#1da1f2]/10 bg-[#1da1f2]/5 text-[11px] leading-relaxed text-sky-400">
                      <Lightbulb className="w-4.5 h-4.5 text-[#1da1f2] shrink-0 mt-0.5" />
                      <div>
                        <strong>Simulation engine active:</strong> NexDroid is broadcasting mock Dalvik virtual logs, generating file trees, and authorizing full diagnostic command loops automatically to keep your canvas 100% active.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 text-[11px] leading-relaxed text-amber-400">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Hardware link active:</strong> NexDroid will try to direct shell pipelines to the active USB daemon. Verify that your device displays authorized debugging settings.
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. LIVE PROFILE SELECTOR */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
                  <div className="border-b border-[#1f2023] pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4.5 h-4.5 text-[#1da1f2]" /> Simulated Profile Configuration
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Choose which core profile matrix is simulated while Mock Mode is enabled.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="profile-grid">
                    {SIMULATED_PROFILES.map((profile) => (
                      <div 
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfile(profile.id);
                          showToast('Profile Switched', `Active device specs set to ${profile.name}.`, 'info');
                        }}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all self-stretch flex flex-col justify-between ${
                          selectedProfile === profile.id 
                            ? 'border-[#1da1f2] bg-[#1da1f2]/5 shadow-sm' 
                            : 'border-[#1f2023] bg-[#0c0c0e]/80 hover:border-zinc-700 hover:bg-[#121215]'
                        }`}
                      >
                        <div>
                          <p className={`font-bold ${selectedProfile === profile.id ? 'text-[#1da1f2]' : 'text-zinc-200'}`}>
                            {profile.name}
                          </p>
                          <div className="grid grid-cols-2 gap-y-1.5 mt-2.5 font-mono text-[10px] text-zinc-400">
                            <div>
                              <span className="text-[9px] text-zinc-500 block">RESOLUTION</span>
                              {profile.resolution}
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 block">RAM SIZE</span>
                              {profile.ram}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#1f2023]/60 text-[9px] text-zinc-500 font-mono">
                          <span>{profile.api}</span>
                          {selectedProfile === profile.id && (
                            <span className="px-1.5 py-0.5 rounded bg-[#1da1f2] text-white font-bold text-[8px] uppercase">
                              Active Target
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. EXPERT UTILITIES */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <strong className="text-sm font-bold text-white block">NexDroid Expert Utilities Tools</strong>
                      <p className="text-[11px] text-zinc-400 font-medium">Activate extra command shortcuts, advanced script builders and recovery menu tools inside dashboard sub-panels.</p>
                    </div>
                    
                    {/* Twitter Blue Custom Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => setDeveloperMode(!developerMode)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1da1f2]/20 ${
                        developerMode ? 'bg-[#1da1f2]' : 'bg-zinc-700'
                      }`}
                      aria-label="Toggle Developer Mode"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          developerMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'connection' && (
              <div className="space-y-6" id="settings-section-connection">
                {/* CONNECTION HOST CARD */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
                  <div className="border-b border-[#1f2023] pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <FolderLock className="w-4.5 h-4.5 text-[#1da1f2]" /> Host ADB Connection Parameters
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Adjust environmental paths used to execute shell commands.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ADB executable path */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        ADB Executable Binary Path
                      </label>
                      <div className="relative">
                        <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="text"
                          value={adbPath}
                          onChange={(e) => setAdbPath(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-[#1f2023] bg-[#0c0c0f] text-white font-mono rounded-lg focus:outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] font-semibold text-xs"
                          id="settings-adb-path"
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 block leading-tight font-medium">By default, system queries the global environment variable path path.</span>
                    </div>

                    {/* Poll slider interval */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        WebSocket Refresh Metrics (ms)
                      </label>
                      <div className="relative">
                        <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="number"
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 1500)}
                          min="500"
                          max="5000"
                          className="w-full pl-9 pr-3 py-2 border border-[#1f2023] bg-[#0c0c0f] text-white font-mono rounded-lg focus:outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] font-semibold text-xs"
                          id="settings-refresh-interval"
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 block leading-tight font-medium">Control polling frequency for system charts and logs updater triggers.</span>
                    </div>
                  </div>
                </div>

                {/* ADVANCED BRIDGE RULES */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1"><Server className="w-4 h-4 text-[#1da1f2]" /> Advanced USB Wireless Bridging</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      NexDroid connects to host systems on port 5555. Toggle fallback bridging constraints if debugging fails on secondary USB connections.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-zinc-900/60 rounded-lg border border-[#1f2023] space-y-2 text-[11px] text-zinc-400">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-[#1da1f2]" /> Auto-pairing socket keys authorization</p>
                    <p>Allows automatically injecting certificates on Android runtime devices. Recommended to leave active.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'diagnostics' && (
              <div className="space-y-6" id="settings-section-diagnostics">
                {/* DIAGNOSTIC CONTAINER */}
                <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1f2023] pb-2">
                    <div>
                      <strong className="text-sm font-bold text-white block">Device Connection Inspector</strong>
                      <span className="text-[10px] text-zinc-400">Trigger test queries directly against current server parameters.</span>
                    </div>
                    <button
                      type="button"
                      onClick={runDiagnostics}
                      disabled={testingConnection}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1f2023] bg-[#0d0d0f] hover:border-[#1da1f2] hover:text-[#1da1f2] transition-colors font-bold text-[11px] text-zinc-300 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-[#1da1f2]' : ''}`} /> Run Inspection
                    </button>
                  </div>

                  {diagnosticLog.length > 0 ? (
                    <div className="p-4 bg-black rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1.5 max-h-48 overflow-y-auto select-text">
                      {diagnosticLog.map((logLine, idx) => (
                        <p key={idx} className={logLine.startsWith('[OK]') ? 'text-emerald-400 font-semibold' : logLine.startsWith('[SIMULATOR]') ? 'text-[#1da1f2]' : 'text-zinc-400'}>
                          {logLine}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500 font-medium text-xs border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                      <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      No diagnostics launched yet. Click the button above to trace variables.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON BAR */}
            <div className="pt-2 flex justify-between items-center" id="settings-actions">
              <span className="text-[10px] text-zinc-500 font-mono">NexDroid Control Console v2.5.0</span>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#1da1f2] hover:bg-[#1a8cd8] text-xs text-white font-bold rounded-lg cursor-pointer transition-all active:scale-95 shadow-md font-sans"
                id="settings-save-submit"
              >
                <Save className="w-4 h-4 text-white" /> Save Console Settings
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: QUICK DIAGNOSTICS & TELEMETRY SUMMARY */}
        <div className="space-y-6" id="settings-summary-column">
          {/* PROFILE SUMMARY */}
          <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5 pb-2.5 border-b border-[#1f2023]">
              <Database className="w-4 h-4 text-[#1da1f2]" /> Current Sandbox State
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Connection Engine</span>
                <span className="font-semibold text-[#1da1f2]">
                  {mockEnabled ? 'Simulated Loop' : 'Raw USB Local'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Target Core</span>
                <span className="font-semibold text-zinc-200">
                  {selectedProfile === 'pixel9' ? 'Google Pixel 9 Pro' : selectedProfile === 's24' ? 'Galaxy S24 Ultra' : selectedProfile === 'op12' ? 'OnePlus 12' : 'Generic Android'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Poll Speed</span>
                <span className="font-semibold text-zinc-200">{refreshInterval} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Expert Helpers</span>
                <span className={`font-semibold ${developerMode ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {developerMode ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>

          {/* TELEMETRY GUIDE */}
          <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4 text-xs select-text">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5 pb-2.5 border-b border-[#1f2023]">
              <Sparkles className="w-4 h-4 text-sky-400" /> Environment Tips
            </h3>

            <div className="space-y-3 leading-relaxed text-zinc-400 text-[11px]">
              <p>
                💡 Since this application runs in a isolated sandbox, enabling the <strong>Simulation Mode</strong> is strongly recommended to get functional UI components.
              </p>
              <p>
                🛠️ When you need to push physical apps, you can access the <strong>Developer Tools</strong> tab or <strong>ADB Console</strong> to sideload APKs and run commands easily.
              </p>
              <p>
                🌐 Metric channels use standard WebSockets. You can configure the refresh timers above if network latency is limited.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
