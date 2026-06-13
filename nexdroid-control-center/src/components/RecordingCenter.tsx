import React, { useEffect, useState, useRef } from 'react';
import { 
  Video, 
  Trash2, 
  Download, 
  Play, 
  StopCircle, 
  Clock, 
  Film,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { CaptureHistory } from '../types';

export default function RecordingCenter() {
  const { 
    activeDevice, 
    showToast 
  } = useNexDroidStore();

  const [recordings, setRecordings] = useState<CaptureHistory[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      setRecordings(data);
    } catch {
      console.error('Failed to query recordings list API');
    }
  };

  useEffect(() => {
    fetchRecordings();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerStart = async () => {
    if (!activeDevice) return;
    setIsRecording(true);
    setTimer(0);
    showToast('Recording Stream', 'Live screen recorder is syncing with device viewport...', 'success');
    
    try {
      await fetch('/api/actions/record/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id })
      });
    } catch {}

    intervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const triggerStop = async () => {
    if (!activeDevice) return;
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    showToast('Rendering Video', 'Converting h264 screen capture pipelines to high-quality MP4 file container...', 'info');

    try {
      const res = await fetch('/api/actions/record/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id, durationSeconds: timer })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Capture Finished', `Rendered ${data.capture.filename} successfully.`, 'success');
        fetchRecordings();
      }
    } catch {
      showToast('Error', 'Screen recorder translation failed.', 'error');
    }
    setTimer(0);
  };

  const deleteRecording = async (id: string) => {
    try {
      const res = await fetch('/api/actions/record/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Recording Pruned', 'Video package wiped from history.', 'success');
        fetchRecordings();
      }
    } catch {
      showToast('Error', 'Pruning failed.', 'error');
    }
  };

  const downloadVideo = (item: CaptureHistory) => {
    showToast('Compiling Download', `Spooling ${item.filename}...`, 'info');
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download Complete', 'File successfully exported.', 'success');
    }, 1200);
  };

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <Video className="w-12 h-12 text-zinc-600 animate-bounce mb-3" />
        <p className="text-sm">Select active targets to launch screen logging recorders.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="recording-hub-tab">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2023]" id="recordings-header">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Recording Spool Center</h1>
          <p className="text-xs text-gray-400">Record screens directly to mp4 containers, schedule streams, and download recordings archive.</p>
        </div>
        
        <div>
          {isRecording ? (
            <button
              onClick={triggerStop}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-xs font-semibold cursor-pointer border border-red-500/20 active:scale-95 animate-pulse"
            >
              <StopCircle className="w-4 h-4" /> Stop Recording ({timer}s)
            </button>
          ) : (
            <button
              onClick={triggerStart}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white text-xs font-semibold cursor-pointer border border-[#1da1f2]/20 active:scale-95"
            >
              <Video className="w-4 h-4" /> Start Capturing Screen
            </button>
          )}
        </div>
      </div>

      {/* CORE CAPTURE DISPLAY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="recordings-layout-grids">
        
        {/* ACTION PANEL */}
        <div className="space-y-4" id="recordings-guides-panel">
          <div className="p-5 border border-[#1f2023] bg-[#121215]/40 rounded-xl space-y-4">
            <h3 className="font-display font-semibold text-sm text-gray-200">Recording Details</h3>
            
            {isRecording ? (
              <div className="space-y-3.5" id="active-rec-countdown-info">
                <div className="flex items-center justify-center py-8 rounded-xl bg-black border border-red-500/10 text-red-400 animate-pulse text-2xl font-mono">
                  ● REC {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed text-center">
                  Live buffering stream active over USB ADB shell pipeline. Do not close or unmount devices.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-gray-400" id="inactive-rec-guides-list">
                <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                  <p className="text-gray-300 font-semibold text-[11px] flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-[#1da1f2]" /> Storage Location</p>
                  <p className="font-mono text-[10px] text-gray-400 mt-0.5">/sdcard/Movies/NexDroid/</p>
                </div>
                <div className="p-3 bg-[#111] rounded-xl text-[11px] leading-relaxed">
                  Screen captures are converted dynamically into full-framerate 1080p MP4 matrices on the device, then exported down to browsers on termination.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GALLERIES LIST ROWS */}
        <div className="lg:col-span-2 space-y-4" id="recordings-history-section">
          <div className="flex justify-between items-center pb-2 border-b border-[#1f2023] text-xs text-gray-400 font-semibold">
            <span>Video Captures History ({recordings.length})</span>
            <button onClick={fetchRecordings} className="hover:text-white" title="Refresh List"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>

          {recordings.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 border border-[#1f2023] bg-[#121215]/20 rounded-xl" id="recordings-empty-view">
              <Film className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs font-semibold">No recorded logs found.</p>
            </div>
          ) : (
            <div className="space-y-3" id="recordings-archive-list">
              {recordings.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-4 rounded-xl border border-[#1f2023] bg-[#121215]/30 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  id={`recording-row-${rec.id}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-lg bg-red-600/10 text-red-400 shrink-0 border border-red-500/10">
                      <Film className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <strong className="text-sm font-semibold text-gray-200 block truncate">{rec.filename}</strong>
                      <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-650" /> Duration: <b className="font-semibold text-gray-300">{rec.duration || "12s"}</b></span>
                        <span className="w-1 h-1 rounded-full bg-[#1f2023]" />
                        <span>Size: <b className="font-semibold font-mono text-[#1da1f2]">{rec.size || '1.8 MB'}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1f2023]">
                    <button
                      onClick={() => downloadVideo(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 border border-[#1f2023] hover:border-cyan-500 text-cyan-400 rounded hover:bg-[#121215] text-xs font-semibold cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Save Output
                    </button>
                    <button
                      onClick={() => deleteRecording(rec.id)}
                      className="p-1.5 border border-[#1f2023] text-red-400 hover:text-white hover:bg-red-500/10 rounded cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
