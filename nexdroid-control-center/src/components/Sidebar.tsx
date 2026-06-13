import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  MonitorSmartphone, 
  AppWindow, 
  FolderOpen, 
  Camera, 
  Video, 
  Terminal, 
  Cpu, 
  Code2, 
  Settings, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Radio
} from 'lucide-react';
import { useNexDroidStore } from '../store';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Devices', icon: Smartphone },
  { name: 'Mirror', icon: MonitorSmartphone },
  { name: 'Apps', icon: AppWindow },
  { name: 'Files', icon: FolderOpen },
  { name: 'Screenshots', icon: Camera },
  { name: 'Recordings', icon: Video },
  { name: 'Logs', icon: Terminal },
  { name: 'Developer Tools', icon: Cpu },
  { name: 'ADB Console', icon: Code2 },
  { name: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    sidebarOpen, 
    setSidebarOpen, 
    activeDevice 
  } = useNexDroidStore();

  return (
    <aside 
      className={`relative flex flex-col h-screen bg-[#0d0d0f] border-r border-[#1f2023] transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
      id="sidebar-container"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#1f2023]" id="sidebar-logo-group">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#1da1f2] to-cyan-400 p-[1px]">
            <div className="flex items-center justify-center w-full h-full bg-[#0d0d0f] rounded-[7px]">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          {sidebarOpen && (
            <span 
              className="font-display font-medium text-base tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent truncate"
              id="sidebar-title-text"
            >
              NEXDROID
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#1e1e24] text-gray-400 hover:text-white transition-all cursor-pointer"
          id="sidebar-toggle-cmd"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto" id="sidebar-navigator-list">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              id={`sidebar-tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-[#1da1f2]/10 to-cyan-500/5 text-[#1da1f2] font-semibold border-l-2 border-[#1da1f2]' 
                  : 'text-gray-400 hover:text-white hover:bg-[#151518]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-all ${
                isActive ? 'text-[#1da1f2]' : 'text-gray-400 group-hover:text-[#1da1f2]'
              }`} />
              
              {sidebarOpen && <span className="truncate">{item.name}</span>}
              
              {/* Tooltip on collapse */}
              {!sidebarOpen && (
                <div className="absolute left-14 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-[#16161a] border border-[#27272a] text-white text-xs py-1.5 px-3 rounded-md shadow-xl transition-all whitespace-nowrap z-50 pointer-events-none">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Connected Device Mini Status */}
      <div className="p-3 border-t border-[#1f2023] bg-[#09090b]/50" id="sidebar-foot-card">
        {activeDevice ? (
          <div className="flex items-center gap-3">
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${
              activeDevice.status === 'authorized' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              <Smartphone className={`w-4 h-4 ${
                activeDevice.status === 'authorized' ? 'text-emerald-400' : 'text-red-400'
              }`} />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0d0d0f] ${
                activeDevice.status === 'authorized' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
            
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">{activeDevice.model}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  {activeDevice.status === 'authorized' ? 'Authorized Debug' : 'Keys Pending'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <Zap className="w-4 h-4 animate-pulse" />
            {sidebarOpen && <span className="text-xs font-medium">Scanning device...</span>}
          </div>
        )}
      </div>
    </aside>
  );
}
