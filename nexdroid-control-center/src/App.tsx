import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import DeviceManager from './components/DeviceManager';
import Mirror from './components/Mirror';
import InstalledApps from './components/InstalledApps';
import FileManager from './components/FileManager';
import ScreenshotCenter from './components/ScreenshotCenter';
import RecordingCenter from './components/RecordingCenter';
import LogViewer from './components/LogViewer';
import DeveloperTools from './components/DeveloperTools';
import ADBConsole from './components/ADBConsole';
import SettingsView from './components/SettingsView';
import { useNexDroidStore } from './store';
import { 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon 
} from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    toasts, 
    removeToast, 
    fetchDevices, 
    fetchSettings, 
    addLog, 
    addMetricsSnapshot 
  } = useNexDroidStore();

  // 1. WebSocket synchronization and database fetching on mount
  useEffect(() => {
    fetchDevices();
    fetchSettings();

    // Setup active WebSocket updates channel
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log(`Connecting NexDroid status pipelines to Socket buffer: ${wsUrl}`);
    let ws = new WebSocket(wsUrl);

    const setupSocketListeners = (socket: WebSocket) => {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'device_stream') {
            // Append log row
            if (data.log) addLog(data.log);
            // Snapshot live metrics flutters
            if (data.metrics) {
              addMetricsSnapshot(data.metrics.cpu, data.metrics.ramUsed);
            }
          }
        } catch (e) {
          console.error('Socket message parse error', e);
        }
      };

      socket.onclose = () => {
        console.warn('NexDroid WebSocket channel disconnected. Initiating re-link sequence in 4s...');
        setTimeout(() => {
          if (socket.readyState === WebSocket.CLOSED) {
            const reconnectedSocket = new WebSocket(wsUrl);
            setupSocketListeners(reconnectedSocket);
          }
        }, 4000);
      };

      socket.onerror = (e) => {
        console.error('Active Socket channel error', e);
      };
    };

    setupSocketListeners(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // 2. Select corresponding tab viewport components
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Devices':
        return <DeviceManager />;
      case 'Mirror':
        return <Mirror />;
      case 'Apps':
        return <InstalledApps />;
      case 'Files':
        return <FileManager />;
      case 'Screenshots':
        return <ScreenshotCenter />;
      case 'Recordings':
        return <RecordingCenter />;
      case 'Logs':
        return <LogViewer />;
      case 'Developer Tools':
        return <DeveloperTools />;
      case 'ADB Console':
        return <ADBConsole />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  // Toast icons helper
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <XOctagon className="w-4 h-4 text-red-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getToastBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-950/20';
      case 'warning': return 'border-amber-500/20 bg-amber-950/20';
      case 'error': return 'border-red-500/20 bg-red-950/20';
      default: return 'border-cyan-500/20 bg-cyan-950/10';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-gray-100 font-sans antialiased select-none" id="nexdroid-root-portal">
      {/* 1. LEFT SIDEBAR SLIDER NAVIGATION RAIL */}
      <Sidebar />

      {/* 2. MAIN HUB DISPLAY CONTAINER */}
      <div className="flex-1 flex flex-col h-full min-w-0" id="main-portal-hub">
        
        {/* TOP STATUS CONTROL ACTIONS SUMMARY header */}
        <TopBar />

        {/* BROWSER VIEW STAGES */}
        <main className="flex-1 min-h-0 relative select-text">
          {renderTabContent()}
        </main>
      </div>

      {/********** FLOATING DYNAMIC SYSTEM TOASTS OVERLAY **********/}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-[340px] pointer-events-none"
        id="toasts-portal-container"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${getToastBorderColor(toast.type)}`}
            id={`system-toast-${toast.id}`}
          >
            {getToastIcon(toast.type)}
            
            <div className="flex-1 min-w-0">
              <strong className="text-xs font-semibold text-gray-100 block">{toast.title}</strong>
              <p className="text-[10px] text-gray-400 tracking-normal mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
