import React, { useEffect, useState, useRef } from 'react';
import { 
  Smartphone, 
  Maximize, 
  Camera, 
  Video, 
  Volume2, 
  VolumeX, 
  Sun, 
  Home, 
  Undo, 
  Power,
  RotateCw,
  Play,
  Square
} from 'lucide-react';
import { useNexDroidStore } from '../store';

export default function Mirror() {
  const { 
    activeDevice, 
    showToast,
    settings
  } = useNexDroidStore();

  const [screenState, setScreenState] = useState({
    currentApp: 'home',
    brightness: 80,
    volume: 50,
    wifiEnabled: true,
    gameScore: 0,
    browserUrl: 'https://google.com'
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1); // multiplier
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const screenRef = useRef<HTMLDivElement>(null);

  const fetchScreenState = async () => {
    if (!activeDevice) return;
    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/state`);
      const data = await res.json();
      setScreenState(data);
    } catch (e) {
      console.error('Failed to query screen state', e);
    }
  };

  useEffect(() => {
    fetchScreenState();
    const interval = setInterval(() => {
      fetchScreenState();
    }, 2000);
    return () => clearInterval(interval);
  }, [activeDevice?.id]);

  // Touch forwarding calculator
  const handleScreenClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeDevice || !screenRef.current) return;
    
    const rect = screenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Optimistic state updates
    if (screenState.currentApp === 'game') {
      setScreenState(prev => ({ ...prev, gameScore: prev.gameScore + 10 }));
    }

    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tap', x, y })
      });
      const data = await res.json();
      if (data.success) {
        setScreenState(data.state);
      }
    } catch {
      console.error('Failed to forward tap coordinates');
    }
  };

  const dispatchHardwareKey = async (key: string) => {
    if (!activeDevice) return;
    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'keypress', key })
      });
      const data = await res.json();
      if (data.success) {
        setScreenState(data.state);
        showToast('Hardkey Triggered', `Sent key-press signal [${key.toUpperCase()}]`, 'info');
      }
    } catch {
      showToast('Error', 'Keyboard injection failed', 'error');
    }
  };

  const handleAppLaunch = async (appName: "home" | "settings" | "game" | "browser") => {
    if (!activeDevice) return;
    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'app', app: appName })
      });
      const data = await res.json();
      if (data.success) {
        setScreenState(data.state);
      }
    } catch {
      console.error('Failed to route app mirror launcher');
    }
  };

  const takeScreenshotShort = async () => {
    if (!activeDevice) return;
    showToast('Screen Flash', 'Snubbing virtual frame rasterizer...', 'info');
    try {
      const res = await fetch('/api/actions/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Captured!', 'Image successfully added to screenshots drawer log.', 'success');
      }
    } catch {
      showToast('Error', 'Cap service failed.', 'error');
    }
  };

  const toggleRecordingShort = async () => {
    if (!activeDevice) return;
    
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      showToast('Compiling Capture', 'Flushing mp4 stream buffers to host Disk...', 'info');
      try {
        const res = await fetch('/api/actions/record/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: activeDevice.id, durationSeconds: recordTimer })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Recording Saved', `Video written successfully (${recordTimer}s).`, 'success');
        }
      } catch {
        showToast('Error', 'Failed to write recording.', 'error');
      }
      setRecordTimer(0);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordTimer(0);
      showToast('Recording Stream', 'Live mirroring screen log session active.', 'success');
      recordIntervalRef.current = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  const changeVolume = async (v: number) => {
    if (!activeDevice) return;
    const target = Math.max(0, Math.min(100, screenState.volume + v));
    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'volume', volume: target })
      });
      const data = await res.json();
      if (data.success) setScreenState(data.state);
    } catch {}
  };

  const changeBrightness = async (b: number) => {
    if (!activeDevice) return;
    const target = Math.max(0, Math.min(100, screenState.brightness + b));
    try {
      const res = await fetch(`/api/mirror/${activeDevice.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'brightness', brightness: target })
      });
      const data = await res.json();
      if (data.success) setScreenState(data.state);
    } catch {}
  };

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <Smartphone className="w-12 h-12 text-zinc-600 animate-bounce mb-3" />
        <p className="text-sm font-semibold">Select an active device to deploy screen stream.</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white flex flex-col xl:flex-row gap-6 items-center lg:items-stretch justify-center" id="mirroring-tab-view">
      
      {/* LEFT SIDE MIRROR GRAPHICAL STAGE */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-lg w-full">
        {/* Resize controller */}
        <div className="flex items-center gap-3 w-full justify-between pb-3 border-b border-[#1f2023] text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-gray-200">Mirroring Connection Est.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-400">
              1080 × 2400 (60 FPS)
            </span>
            <button
              onClick={() => { setScale(prev => prev === 1 ? 0.8 : prev === 0.8 ? 0.6 : 1); }}
              className="text-[#1da1f2] hover:text-white"
            >
              Scale: {Math.round(scale * 100)}%
            </button>
          </div>
        </div>

        {/* PHONE MOCKUP FRAME */}
        <div 
          className="relative rounded-[45px] p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-4 border-zinc-700/60 shadow-2xl transition-all duration-300 select-none"
          style={{ 
            width: `${375 * scale}px`, 
            height: `${750 * scale}px` 
          }}
          id="smartphone-viewport-mock"
        >
          {/********** SCREEN CONTAINER **********/}
          <div 
            ref={screenRef}
            onClick={handleScreenClick}
            className="w-full h-full rounded-[34px] overflow-hidden relative border border-black/80 flex flex-col bg-[#121214] cursor-crosshair group max-w-full"
            id="mirror-touchpoint-surface"
          >
            {/* Speaker Grill Notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 rounded-full bg-[#18181b] flex items-center justify-center z-50">
              <div className="w-12 h-1 bg-[#27272a] rounded" />
              <div className="w-2 h-2 rounded-full bg-[#27272a] ml-2" />
            </div>

            {/* SCREEN CONTENT CONDITIONAL VIEWPORT */}
            <div className="flex-1 flex flex-col p-4 pt-10 text-white select-none relative" style={{ opacity: screenState.brightness / 100 }}>
              
              {/* STATUS BAR */}
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-300 font-sans px-4 select-none mb-6">
                <span>04:18 PM</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#10b981]">● 5G LTE</span>
                  <div className="w-5 h-2.5 rounded border border-gray-400 p-[1px] flex">
                    <div className="bg-emerald-400 h-full rounded-xs" style={{ width: `${screenState.brightness}%` }} />
                  </div>
                </div>
              </div>

              {/*********** CURRENT VIEWS ***********/}
              {screenState.currentApp === 'home' ? (
                <div className="flex-1 flex flex-col justify-between">
                  {/* Home Greeting */}
                  <div className="text-center space-y-2 mt-8">
                    <h1 className="font-display text-4xl font-extralight tracking-tight text-white mb-2">04:18</h1>
                    <p className="text-xs text-gray-400 font-medium">Saturday, June 13</p>
                  </div>

                  {/* App Grid */}
                  <div className="grid grid-cols-3 gap-y-7 gap-x-4 px-1 pb-16">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAppLaunch('settings'); }}
                      className="flex flex-col items-center group/app gap-2 hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1da1f2] to-sky-600 flex items-center justify-center text-xl shadow-md cursor-pointer">
                        ⚙️
                      </div>
                      <span className="text-[10px] font-semibold text-gray-300 text-center">Settings</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAppLaunch('browser'); }}
                      className="flex flex-col items-center group/app gap-2 hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xl shadow-md cursor-pointer">
                        🌐
                      </div>
                      <span className="text-[10px] font-semibold text-gray-300 text-center">Chrome</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAppLaunch('game'); }}
                      className="flex flex-col items-center group/app gap-2 hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center text-xl shadow-md cursor-pointer">
                        🎮
                      </div>
                      <span className="text-[10px] font-semibold text-gray-300 text-center">Bricks</span>
                    </button>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/20 flex items-center justify-center text-xl shadow-sm">
                        🤖
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 text-center">Agent</span>
                    </div>
                  </div>
                </div>
              ) : screenState.currentApp === 'settings' ? (
                <div className="flex-1 flex flex-col text-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAppLaunch('home'); }} 
                      className="text-[#1da1f2] font-bold pr-2"
                    >
                      ←
                    </button>
                    <span className="font-bold text-sm">System Settings</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                      <p className="text-gray-400 text-[10px]">Wi-Fi Network</p>
                      <p className="font-semibold text-emerald-400">Connected: NexDroid_Studio_LAN</p>
                    </div>

                    <div className="p-3 bg-zinc-900/50 rounded-xl space-y-2">
                      <p className="text-gray-400 text-[10px]">Display and Sound</p>
                      <div className="flex justify-between">
                        <span>Brightness</span>
                        <span>{screenState.brightness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume</span>
                        <span>{screenState.volume}%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1.5">
                      <p className="text-[#1da1f2] font-bold text-[10px]">Developer Options</p>
                      <div className="flex justify-between">
                        <span>USB Debugging</span>
                        <span className="text-emerald-400">ON</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wireless Debug</span>
                        <span className="text-emerald-400">ON</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : screenState.currentApp === 'game' ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-xs">
                    <button onClick={(e) => { e.stopPropagation(); handleAppLaunch('home'); }} className="text-[#1da1f2] font-bold">← Home</button>
                    <span>Brick Breaker</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-black border border-zinc-800 p-4 space-y-4 my-4 relative">
                    <span className="text-pink-500 font-mono tracking-widest font-bold text-xs absolute top-2 right-3">PTS: {screenState.gameScore}</span>
                    
                    {/* Game Grid Drawing */}
                    <div className="grid grid-cols-4 gap-1.5 w-full max-w-[180px]">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={`h-4 rounded ${
                          i < 4 ? 'bg-pink-500' : 'bg-sky-500'
                        }`} />
                      ))}
                    </div>

                    <div className="relative w-full h-32">
                      {/* Interactive Bouncing Ball and Paddle */}
                      <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-white animate-bounce" />
                      <div className="absolute bottom-4 left-1/4 w-12 h-2 rounded-full bg-pink-500 animate-pulse" />
                    </div>

                    <span className="text-[10px] text-zinc-500 text-center select-none">
                      Tap screen to click blocks and increment high scores.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col text-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                    <button onClick={(e) => { e.stopPropagation(); handleAppLaunch('home'); }} className="text-[#1da1f2] font-bold">←</button>
                    <span className="font-semibold truncate text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-gray-400 w-full">https://android.com</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
                    <span>🌐</span>
                    <p className="font-bold text-zinc-400">Chrome Browser View</p>
                    <p className="text-[10px] max-w-[180px]">Fully connected via internal NexDroid developer loop.</p>
                  </div>
                </div>
              )}

              {/* FLOATING ANDROID BOTTOM NAV KEYS */}
              <div className="h-10 border-t border-zinc-800/80 flex items-center justify-around px-8 mt-auto text-zinc-500 text-xs" id="internal-android-navbar">
                <button onClick={(e) => { e.stopPropagation(); dispatchHardwareKey('back'); }} className="hover:text-white cursor-pointer select-none">
                  <Undo className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); dispatchHardwareKey('home'); }} className="hover:text-white cursor-pointer select-none">
                  <Home className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); dispatchHardwareKey('power'); }} className="hover:text-white cursor-pointer select-none">
                  <Power className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* RIGHT SIDE HARDWARE CONTROL CABINET */}
      <div className="w-full xl:w-72 space-y-4" id="mirror-management-cabinet">
        
        {/* VIDEO RECORDER TRACKER */}
        {isRecording && (
          <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 animate-pulse text-xs text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <strong className="font-semibold font-mono text-white">RECORDING PORT ACTIVE</strong>
            </div>
            <span className="font-mono">{recordTimer}s Elapsed</span>
          </div>
        )}

        <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pb-2 border-b border-[#1f2023]">
            Device Controllers
          </div>

          <div className="grid grid-cols-2 gap-2" id="host-shortcut-grid">
            <button
              onClick={takeScreenshotShort}
              className="flex items-center gap-2 px-3 py-2 border border-[#1f2023] hover:border-[#1da1f2] rounded-lg text-xs bg-[#121215] cursor-pointer text-gray-300 font-semibold"
            >
              <Camera className="w-4.5 h-4.5 text-cyan-400" /> Screenshot
            </button>

            <button
              onClick={toggleRecordingShort}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs cursor-pointer font-semibold ${
                isRecording 
                  ? 'border-red-500 bg-red-500/10 text-red-400' 
                  : 'border-[#1f2023] hover:border-red-500 hover:text-red-400 bg-[#121215]'
              }`}
            >
              <Video className="w-4.5 h-4.5" /> {isRecording ? "Stop Video" : "Record Video"}
            </button>
          </div>

          <div className="space-y-3" id="sound-brightness-adjustments">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-400" /> Brightness</span>
                <span className="font-mono">{screenState.brightness}%</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => changeBrightness(-15)} className="flex-1 py-1 hover:bg-[#1a1a20] border border-[#1f2023] rounded-md text-xs font-bold cursor-pointer">-15%</button>
                <button onClick={() => changeBrightness(15)} className="flex-1 py-1 hover:bg-[#1a1a20] border border-[#1f2023] rounded-md text-xs font-bold cursor-pointer">+15%</button>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-[#1da1f2]" /> Volume Balance</span>
                <span className="font-mono">{screenState.volume}%</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => changeVolume(-10)} className="flex-1 py-1 hover:bg-[#1a1a20] border border-[#1f2023] rounded-md text-xs font-bold cursor-pointer">-10%</button>
                <button onClick={() => changeVolume(10)} className="flex-1 py-1 hover:bg-[#1a1a20] border border-[#1f2023] rounded-md text-xs font-bold cursor-pointer">+10%</button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#1f2023] bg-[#121215]/20 text-xs leading-relaxed text-gray-400 space-y-2">
          <p className="font-semibold text-gray-300">💡 Dynamic Interactive Mirroring:</p>
          <p>
            Tapping inside the phone viewer compiles and forwards absolute coordinates to active adb shells. Toggle on "Retro Bricks" to play live in-mirror and test responsive rates!
          </p>
        </div>
      </div>
    </div>
  );
}
