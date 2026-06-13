import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Pause, 
  Play, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  ArrowDown,
  CheckCircle,
  Hash
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { DeviceLog } from '../types';

export default function LogViewer() {
  const { 
    activeDevice, 
    logs, 
    clearLogs, 
    pausedLogs, 
    setPausedLogs, 
    showToast 
  } = useNexDroidStore();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'V' | 'D' | 'I' | 'W' | 'E'>('ALL');
  const [autoscroll, setAutoscroll] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoscroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoscroll]);

  const handleExportText = () => {
    if (logs.length === 0) {
      showToast('Error', 'No logcat lines to export', 'warning');
      return;
    }
    
    showToast('Compiling Export', 'Packing log chunks...', 'info');
    
    const rawText = logs
      .map(l => `[${l.timestamp}] ${l.pid}-${l.tid} / ${l.level} [${l.tag}]: ${l.message}`)
      .join('\n');
      
    const blob = new Blob([rawText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexDroid_Logcat_${activeDevice?.id || 'export'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('Logs Saved', 'Logcat text packet downloaded successfully.', 'success');
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (!search) return true;
    
    const query = search.toLowerCase();
    return log.message.toLowerCase().includes(query) || 
           log.tag.toLowerCase().includes(query) || 
           log.level.toLowerCase().includes(query);
  });

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <Terminal className="w-12 h-12 text-zinc-650 animate-pulse mb-3" />
        <p className="text-sm">Select active device to pipe logcat trace feeds.</p>
      </div>
    );
  }

  // Priority colors mapper
  const getLevelColor = (lvl: DeviceLog['level']) => {
    switch (lvl) {
      case 'E': return 'text-red-400 font-bold bg-red-950/20 border border-red-500/15';
      case 'W': return 'text-amber-400 font-bold bg-amber-950/20 border border-amber-500/15';
      case 'I': return 'text-emerald-400 bg-emerald-950/10 border border-emerald-500/10';
      case 'D': return 'text-cyan-400 bg-cyan-950/10 border border-cyan-500/10';
      default: return 'text-gray-400 bg-zinc-900 border border-zinc-700/60';
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] bg-[#09090b] text-white flex flex-col space-y-4" id="logcat-viewer-tab">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1f2023]" id="logcat-header">
        <div>
          <h1 className="font-display text-base font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1da1f2] animate-ping" /> Live Logcat Streamer
          </h1>
          <p className="text-[11px] text-gray-400">Track device trace metrics, intercept fatal exceptions, and parse custom app tags.</p>
        </div>

        {/* Action controllers bar */}
        <div className="flex items-center gap-2 flex-wrap" id="logcat-main-actions">
          {/* Pause stream */}
          <button
            onClick={() => setPausedLogs(!pausedLogs)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              pausedLogs 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                : 'border-[#1f2023] hover:border-amber-400 text-gray-300'
            }`}
          >
            {pausedLogs ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {pausedLogs ? 'Resume Stream' : 'Pause Stream'}
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-1.5 border border-[#1f2023] hover:bg-[#15151a] hover:text-white rounded-lg text-gray-400 cursor-pointer"
            title="Wipe screen records"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Export logs */}
          <button
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f2023] hover:bg-zinc-800 hover:text-white text-gray-300 text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Save Output
          </button>
        </div>
      </div>

      {/* FILTER SEARCH GRID TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-between" id="logcat-filter-row">
        {/* Search Input bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by PID, thread tag, exception label, string regex (e.g. fatal)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#1f2023] bg-[#121215]/50 text-white rounded-lg focus:outline-none focus:border-[#1da1f2] font-mono"
            id="logcat-text-search"
          />
        </div>

        {/* Priority Filter levels */}
        <div className="flex items-center gap-1 bg-[#121215]/80 p-1 border border-[#1f2023] rounded-lg text-[10px]" id="logcat-level-pills">
          {(['ALL', 'V', 'D', 'I', 'W', 'E'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                levelFilter === lvl 
                  ? lvl === 'E' ? 'bg-red-600 text-white' : lvl === 'W' ? 'bg-amber-600 text-white' : 'bg-[#1da1f2] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lvl === 'ALL' ? 'LogLevel: ALL' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/********** TERMINAL SCREEN STAGE **********/}
      <div className="flex-1 rounded-xl border border-[#1f2023] bg-[#09090b]/90 font-mono text-xs overflow-hidden flex flex-col select-text" id="logcat-viewport">
        {/* Output list panels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scroll-smooth" id="logcat-scroller-stage">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-650" id="logcat-empty-trace flex">
              <Hash className="w-8 h-8 text-zinc-700 animate-spin-reverse mb-2" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Piped trace channel is vacant. Stream pending.</p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 hover:bg-[#121215]/50 py-0.5 px-1 rounded transition-colors break-all"
                id={`logcat-line-${idx}`}
              >
                {/* Time badge */}
                <span className="text-gray-500 shrink-0 text-[10px] select-none">{log.timestamp}</span>
                
                {/* PID / TID */}
                <span className="text-zinc-600 shrink-0 text-[10px] select-none">{log.pid}-{log.tid}</span>

                {/* Level badge */}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 m-auto ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>

                {/* Tag label */}
                <span className="text-[#1da1f2] font-semibold shrink-0 select-none">/{log.tag}:</span>

                {/* Line message text */}
                <span className={`flex-1 text-[11px] ${
                  log.level === 'E' ? 'text-red-400 font-bold' : log.level === 'W' ? 'text-amber-300 font-semibold' : 'text-gray-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scrolling Footer indicator */}
        <div className="p-2 border-t border-[#1f2023] bg-[#0d0d0f] flex justify-between items-center text-[10px] text-gray-500" id="logcat-viewport-footer">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-zinc-400">Logged {filteredLogs.length} events matching query.</span>
          </div>

          <button
            onClick={() => setAutoscroll(!autoscroll)}
            className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer rounded border transition-all ${
              autoscroll 
                ? 'border-[#1da1f2]/10 bg-[#1da1f2]/5 text-[#1da1f2]' 
                : 'border-zinc-800 text-zinc-400'
            }`}
          >
            <ArrowDown className="w-3 h-3" /> Auto-Scroll
          </button>
        </div>
      </div>
    </div>
  );
}
