export interface AndroidDevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  androidVersion: string;
  batteryLevel: number;
  batteryTemp: number;
  cpuUsage: number;
  ramUsage: { total: number; used: number };
  storage: { total: number; used: number };
  connectionType: 'USB' | 'WiFi';
  status: 'authorized' | 'unauthorized' | 'offline' | 'disconnected';
  ipAddress?: string;
  serialNumber: string;
  screenDensity: string;
  sdkVersion: string;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  versionName: string;
  isSystem: boolean;
  size: string;
  status: 'running' | 'stopped';
}

export interface AndroidFile {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  modifiedTime: string;
  permissions: string;
}

export interface DBCommand {
  id: string;
  command: string;
  description: string;
  isFavorite: boolean;
  category: 'adb' | 'shell' | 'pm' | 'am' | 'fastboot';
}

export interface DeviceLog {
  timestamp: string;
  pid: number;
  tid: number;
  level: 'V' | 'D' | 'I' | 'W' | 'E';
  tag: string;
  message: string;
}

export interface CaptureHistory {
  id: string;
  deviceId: string;
  timestamp: string;
  type: 'screenshot' | 'recording';
  url: string; // base64 or relative server path
  size?: string;
  duration?: string; // for recordings
  filename: string;
}

export interface AppState {
  activeDeviceId: string | null;
  sidebarOpen: boolean;
  activeTab: string;
  searchQuery: string;
  isMirroringFs: boolean;
}
