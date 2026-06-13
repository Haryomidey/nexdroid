import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  Trash2, 
  Download, 
  Eye, 
  Clock, 
  Copy, 
  Maximize2,
  ListRestart
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { CaptureHistory } from '../types';

export default function ScreenshotCenter() {
  const { 
    activeDevice, 
    showToast 
  } = useNexDroidStore();

  const [screenshots, setScreenshots] = useState<CaptureHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePreview, setActivePreview] = useState<CaptureHistory | null>(null);

  const fetchScreenshots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/screenshots');
      const data = await res.json();
      setScreenshots(data);
    } catch {
      showToast('Error', 'Failed to read screenshots history database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenshots();
  }, [activeDevice?.id]);

  const captureNewScreenshot = async () => {
    if (!activeDevice) return;
    setLoading(true);
    showToast('Triggering Screen', 'Initializing frame grabber...', 'info');
    try {
      const res = await fetch('/api/actions/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDevice.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Capture Succeeded', 'Screenshot stored on host system disk.', 'success');
        fetchScreenshots();
      }
    } catch {
      showToast('Capture Refused', 'Camera frame buffering failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteScreenshot = async (id: string) => {
    try {
      const res = await fetch('/api/actions/screenshot/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Screenshot Cleared', 'Pruned image from disk.', 'success');
        fetchScreenshots();
        if (activePreview?.id === id) setActivePreview(null);
      }
    } catch {
      showToast('Error', 'Deletion failed.', 'error');
    }
  };

  const copyToClipboard = (base64: string) => {
    navigator.clipboard.writeText(base64);
    showToast('Clipboard Copied', 'Vector base64 image copied to system clipboard.', 'success');
  };

  const downloadLocalMock = (item: CaptureHistory) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Saved File', 'Image file write completed.', 'success');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="screenshot-hub-tab">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2023]" id="screenshots-header">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Screenshot Terminal</h1>
          <p className="text-xs text-gray-400">Trigger high-resolution screen captures, browse history logs, and download vector models.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchScreenshots}
            className="p-2 border border-[#1f2023] hover:text-white rounded-lg bg-[#121215] cursor-pointer"
            title="Reload Capture Log"
          >
            <ListRestart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={captureNewScreenshot}
            disabled={loading || !activeDevice}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1da1f2] hover:bg-[#1a8cd8] text-xs text-white font-semibold rounded-lg cursor-pointer"
          >
            <Camera className="w-4 h-4" /> Take Screen Frame
          </button>
        </div>
      </div>

      {/* GALLERIES LISTING */}
      {screenshots.length === 0 ? (
        <div className="p-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-[#121215]/20" id="screenshots-empty-card">
          <Camera className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-zinc-300">No screenshots taken yet</h3>
          <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            All screenshot captures from topbar controls or quick launchers are indexed in this library log.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="screenshots-grid-box">
          {screenshots.map((item) => (
            <div 
              key={item.id}
              className="group border border-[#1f2023] bg-[#121215] hover:border-gray-500 rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
              id={`screenshot-item-${item.id}`}
            >
              {/* IMAGE HOVER TRIGGER STAGE */}
              <div className="relative bg-[#0d0d10] aspect-[9/16] h-56 flex items-center justify-center border-b border-[#1f2023] overflow-hidden">
                <img 
                  src={item.url} 
                  alt="Captured screenshot"
                  className="max-h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Micro hovering actions */}
                <div className="absolute inset-x-0 bottom-0 bg-[#09090b]/80 backdrop-blur-sm p-3 flex justify-around opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setActivePreview(item)}
                    className="p-1 px-2 pointer rounded bg-zinc-800 text-white hover:bg-[#1da1f2] text-[10px] font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button 
                    onClick={() => downloadLocalMock(item)}
                    className="p-1 px-2 pointer rounded bg-zinc-800 text-white hover:bg-cyan-500 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>

              {/* DETAILS FOOTER */}
              <div className="p-3.5 space-y-2 text-xs">
                <p className="font-semibold text-gray-200 truncate">{item.filename}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-600" /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-mono bg-zinc-900 px-1 py-0.5 rounded border border-zinc-850 text-[#1da1f2] font-bold">{item.size || '320 KB'}</span>
                </div>
                
                <div className="pt-2 border-t border-[#1f2023] flex justify-between">
                  <button 
                    onClick={() => copyToClipboard(item.url)}
                    className="text-[10px] text-zinc-400 hover:text-[#1da1f2] flex items-center gap-1 cursor-pointer"
                    title="Copy Image URL/raw Base64 source"
                  >
                    <Copy className="w-3 h-3" /> Clipboard source
                  </button>
                  <button 
                    onClick={() => deleteScreenshot(item.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/********** FULL LIGHTBOX DIALOG MODAL **********/}
      {activePreview && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6"
          id="screenshot-lightbox-modal"
        >
          {/* Top operations */}
          <div className="w-full max-w-2xl flex justify-between items-center text-xs text-gray-400 mb-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div>
              <p className="font-bold text-white text-sm">{activePreview.filename}</p>
              <p className="font-mono text-[10px] mt-0.5">Capture Node: {activePreview.deviceId}</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => copyToClipboard(activePreview.url)} 
                className="px-3 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 text-white font-semibold cursor-pointer border border-zinc-750"
              >
                Copy Source
              </button>
              <button 
                onClick={() => downloadLocalMock(activePreview)} 
                className="px-3 py-1.5 rounded bg-[#1da1f2] hover:bg-[#1a8cd8] text-white font-semibold cursor-pointer"
              >
                Save Disk
              </button>
              <button 
                onClick={() => setActivePreview(null)} 
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-lg aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-[#1f2023]/60 p-2 flex items-center justify-center shadow-2xl relative">
            <img 
              src={activePreview.url} 
              alt="Expanded preview lightbox"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
