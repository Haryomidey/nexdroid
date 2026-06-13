import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  Star, 
  Trash2, 
  Terminal, 
  RotateCw, 
  BookMarked,
  Plus,
  Send
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { DBCommand } from '../types';

export default function ADBConsole() {
  const { 
    activeDevice, 
    showToast 
  } = useNexDroidStore();

  const [commandText, setCommandText] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'NexDroid ADB Interactive Shell Terminal [v2.5]',
    'Connected. Type standard adb commands or select from saved list.',
    'Simulation interception is active if mock is switched on in settings.',
    '--------------------------------------------------------------------'
  ]);
  
  const [savedCommands, setSavedCommands] = useState<DBCommand[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [category, setCategory] = useState<'adb' | 'shell' | 'pm' | 'am'>('adb');
  const [running, setRunning] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchSavedCommands = async () => {
    try {
      const res = await fetch('/api/adb/saved');
      const data = await res.json();
      setSavedCommands(data);
    } catch {
      console.error('Failed to query saved commands list');
    }
  };

  useEffect(() => {
    fetchSavedCommands();
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const executeConsoleCommand = async () => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    setRunning(true);
    setTerminalLogs(prev => [...prev, `\u001b[32m$ ${trimmed}\u001b[0m`]);
    setCommandText('');

    try {
      const res = await fetch('/api/adb/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: trimmed,
          activeDeviceId: activeDevice?.id || 'NEX-9P-SIMULATOR'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTerminalLogs(prev => [...prev, data.output, '']);
      } else {
        setTerminalLogs(prev => [...prev, `\u001b[31mError: ${data.output}\u001b[0m`, '']);
      }
      fetchSavedCommands(); // Refresh history
    } catch {
      setTerminalLogs(prev => [...prev, `\u001b[31mError: Failed to reach adb socket bridge server.\u001b[0m`, '']);
    } finally {
      setRunning(false);
    }
  };

  const handleCreateFavorite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand) {
      showToast('Error', 'Command content cannot be empty', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/adb/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: customCommand,
          description: customDescription,
          category
        })
      });
      if (res.ok) {
        showToast('Bookmark Created', 'Command bookmarked successfully.', 'success');
        setCustomCommand('');
        setCustomDescription('');
        fetchSavedCommands();
      }
    } catch {
      showToast('Error', 'Failed to bookmark command.', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await fetch('/api/adb/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchSavedCommands();
      }
    } catch {
      console.error('Toggle favorite command API failed');
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      const res = await fetch('/api/adb/saved/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchSavedCommands();
        showToast('Resource Pruned', 'Command successfully purged.', 'success');
      }
    } catch {
      showToast('Error', 'Failed to prune database variable.', 'error');
    }
  };

  const handleFillCommandInput = (cmd: string) => {
    setCommandText(cmd);
    showToast('Input Synced', 'Transferred bookmarked script to terminal buffer.', 'info');
  };

  const triggerRawRun = (cmd: string) => {
    setCommandText(cmd);
    setTimeout(() => {
      setCommandText(cmd);
      executeConsoleCommand();
    }, 100);
  };

  const favoritesList = savedCommands.filter(c => c.isFavorite);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] bg-[#09090b] text-white flex flex-col space-y-4" id="adb-console-tab">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1f2023]" id="console-header">
        <div>
          <h1 className="font-display text-base font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-[#1da1f2]" /> Interactive ADB Shell
          </h1>
          <p className="text-[11px] text-gray-400">Directly communicate raw commands to android virtual or physical systems.</p>
        </div>
      </div>

      {/* THREE PANELS LAYOUT CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0" id="console-stage-container">
        
        {/* INTERACTIVE BLACK BOX TERMINAL */}
        <div className="lg:col-span-2 rounded-xl border border-[#1f2023] bg-[#0c0c0e] flex flex-col min-h-0" id="console-viewport">
          
          {/* Scrollable Console Output */}
          <div className="flex-1 overflow-y-auto p-4.5 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-slate-700 select-text" id="console-scroller">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="mb-1" id={`console-log-line-${idx}`}>
                {log}
              </div>
            ))}
            {running && (
              <div className="text-zinc-500 animate-pulse font-mono text-[10px]" id="terminal-execulating-indicator">
                $ executing task threads...
              </div>
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Interactive Shell Input bar */}
          <div className="p-2.5 border-t border-[#1f2023] bg-[#0c0c0e] flex gap-2.5 items-center" id="console-input-dock">
            <span className="font-mono text-sm text-[#1da1f2] select-none pl-2">$</span>
            <input 
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeConsoleCommand();
              }}
              placeholder="Type adb shell command... (e.g. adb shell dumpsys battery)"
              className="flex-1 font-mono text-xs border-none bg-transparent text-white focus:outline-none placeholder:text-zinc-600 focus:ring-0"
              id="raw-shell-cli-input"
            />
            <button
              onClick={executeConsoleCommand}
              className="p-1.5 px-3 rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] hover:text-white text-gray-100 flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
              id="submit-raw-cmd"
            >
              <Send className="w-3.5 h-3.5" /> Execute
            </button>
          </div>
        </div>

        {/* BOOKMARKS CONTROL COLUMN */}
        <div className="flex flex-col space-y-4 min-h-0" id="bookmarks-utility-rail">
          {/* Quick Creator Form info */}
          <div className="p-4 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-3 shrink-0">
            <h3 className="font-display font-semibold text-xs text-gray-200 flex items-center gap-1.5"><BookMarked className="w-4 h-4 text-cyan-400" /> Bookmark Command</h3>
            
            <form onSubmit={handleCreateFavorite} className="space-y-2.5 text-xs">
              <input 
                type="text"
                placeholder="Description (e.g. Get battery)"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#1f2023] bg-[#0c0c0e] rounded-md focus:outline-none"
                id="cmd-desc-input"
              />
              
              <input 
                type="text"
                placeholder="Command (e.g. adb shell getprop)"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#1f2023] bg-[#0c0c0e] rounded-md focus:outline-none font-mono text-[11px]"
                id="cmd-text-input"
              />

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-1 py-1.5 bg-[#1da1f2] hover:bg-[#1a8cd8] font-semibold text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Save Script
              </button>
            </form>
          </div>

          {/* Bookmarks Directory Scroller */}
          <div className="flex-1 border border-[#1f2023] bg-[#121215]/20 rounded-xl p-4 flex flex-col min-h-0" id="bookmarks-collection-list-scroller">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase pb-2 border-b border-[#1f2023] shrink-0 mb-3">
              Favorites Library ({favoritesList.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" id="console-favorites-list">
              {favoritesList.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 text-[11px]" id="no-favs-alert flex">
                  No starred console targets.
                </div>
              ) : (
                favoritesList.map((cmd) => (
                  <div 
                    key={cmd.id}
                    className="p-3 border border-[#1f2023] bg-[#121215]/40 hover:border-zinc-700/80 rounded-xl space-y-1.5 block text-xs"
                    id={`fav-scr-${cmd.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <strong className="text-zinc-200 text-xs font-semibold block">{cmd.description}</strong>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleToggleFavorite(cmd.id)}
                          className="text-amber-400 hover:text-zinc-400 shrink-0 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSaved(cmd.id)}
                          className="text-zinc-500 hover:text-red-400 shrink-0 cursor-pointer animate-fade-in"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <code className="text-[10px] font-mono text-[#1da1f2] block break-all truncate bg-zinc-950/40 p-1 rounded border border-zinc-900">{cmd.command}</code>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="uppercase text-[8px] bg-zinc-800 text-zinc-400 p-0.5 rounded font-bold px-1">{cmd.category}</span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleFillCommandInput(cmd.command)}
                          className="text-[#1da1f2] font-semibold hover:text-white"
                        >
                          Fill
                        </button>
                        <button 
                          onClick={() => triggerRawRun(cmd.command)}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-white hover:underline shrink-0"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
