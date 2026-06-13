import { create } from 'zustand';
import { AndroidDevice, InstalledApp, AndroidFile, DeviceLog, CaptureHistory, DBCommand } from './types';

// System Toast notification style
export interface SystemToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface NexDroidStore {
  devices: AndroidDevice[];
  activeDevice: AndroidDevice | null;
  activeDeviceId: string | null;
  activeTab: string;
  sidebarOpen: boolean;
  toasts: SystemToast[];
  settings: {
    mockEnabled: boolean;
    adbPath: string;
    refreshInterval: number;
    developerMode: boolean;
  };
  
  // Realtime streaming metrics
  logs: DeviceLog[];
  pausedLogs: boolean;
  cpuHistory: { time: string; cpu: number; ram: number }[];
  currentCpu: number;
  currentRam: number;
  currentTemp: number;
  
  // Handlers
  setDevices: (devices: AndroidDevice[]) => void;
  setActiveDevice: (device: AndroidDevice | null) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  showToast: (title: string, message: string, type?: SystemToast['type']) => void;
  removeToast: (id: string) => void;
  updateSettings: (settings: Partial<NexDroidStore['settings']>) => void;
  
  // Streaming actions
  addLog: (log: DeviceLog) => void;
  clearLogs: () => void;
  setPausedLogs: (paused: boolean) => void;
  addMetricsSnapshot: (cpu: number, ramUsed: number) => void;
  
  // API Fetch Actions
  fetchDevices: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  selectDevice: (id: string) => void;
}

export const useNexDroidStore = create<NexDroidStore>((set, get) => ({
  devices: [],
  activeDevice: null,
  activeDeviceId: null,
  activeTab: 'Dashboard',
  sidebarOpen: true,
  toasts: [],
  settings: {
    mockEnabled: true,
    adbPath: 'adb',
    refreshInterval: 1500,
    developerMode: true,
  },
  
  logs: [],
  pausedLogs: false,
  cpuHistory: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, cpu: 15, ram: 42 })),
  currentCpu: 20,
  currentRam: 52,
  currentTemp: 34,

  setDevices: (devices) => set({ devices }),
  setActiveDevice: (device) => set({ 
    activeDevice: device,
    activeDeviceId: device ? device.id : null 
  }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  showToast: (title, message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const timestamp = new Date().toLocaleTimeString();
    const newToast: SystemToast = { id, title, message, type, timestamp };
    set((state) => ({ toasts: [...state.toasts, newToast].slice(-5) })); // Max 5 toasts
    
    // Auto remove toast
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  
  updateSettings: async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
        get().showToast('Settings Saved', 'Configurations updated successfully.', 'success');
      }
    } catch {
      get().showToast('Error', 'Failed to update backend configs.', 'error');
    }
  },

  addLog: (log) => {
    if (get().pausedLogs) return;
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 400) // Keep last 400 logs
    }));
  },
  
  clearLogs: () => set({ logs: [] }),
  setPausedLogs: (paused) => set({ pausedLogs: paused }),
  
  addMetricsSnapshot: (cpu, ramUsed) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    set((state) => {
      const history = [...state.cpuHistory, { time, cpu, ram: ramUsed }].slice(-20);
      return {
        cpuHistory: history,
        currentCpu: cpu,
        currentRam: Math.round((ramUsed / 16384) * 100), // percentage against 16GB
        currentTemp: +(34 + Math.sin(Date.now() / 20000) * 1.5).toFixed(1)
      };
    });
  },

  fetchDevices: async () => {
    try {
      const res = await fetch('/api/devices');
      const data: AndroidDevice[] = await res.json();
      set({ devices: data });
      
      const prevActiveId = get().activeDeviceId;
      if (data.length > 0) {
        const found = data.find((d) => d.id === prevActiveId) || data.find((d) => d.status === 'authorized') || data[0];
        set({ activeDevice: found, activeDeviceId: found.id });
      } else {
        set({ activeDevice: null, activeDeviceId: null });
      }
    } catch {
      console.error('Failed to query devices list API');
    }
  },

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      set({ settings: data });
    } catch {
      console.error('Failed to query settings list API');
    }
  },

  selectDevice: (id) => {
    const dev = get().devices.find((d) => d.id === id);
    if (dev) {
      set({ activeDevice: dev, activeDeviceId: dev.id });
      get().showToast('Device Selected', `Switched active dashboard view to ${dev.name}.`, 'info');
    }
  }
}));
