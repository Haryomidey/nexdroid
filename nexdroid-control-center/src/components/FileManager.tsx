import React, { useEffect, useState, useRef } from 'react';
import { 
  FolderOpen, 
  File, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Plus, 
  DownloadCloud, 
  ChevronRight, 
  Clock, 
  HardDriveUpload,
  Upload,
  RotateCw
} from 'lucide-react';
import { useNexDroidStore } from '../store';
import { AndroidFile } from '../types';

export default function FileManager() {
  const { 
    activeDevice, 
    showToast 
  } = useNexDroidStore();

  const [currentPath, setCurrentPath] = useState('/sdcard');
  const [files, setFiles] = useState<AndroidFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drag-and-drop & Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadName, setUploadName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    if (!activeDevice) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/devices/${activeDevice.id}/files?path=${encodeURIComponent(currentPath)}`);
      const data = await res.json();
      setFiles(data);
    } catch {
      showToast('Error', 'Failed to retrieve storage directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeDevice?.id, currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const traverseBack = () => {
    if (currentPath === '/' || currentPath === '/sdcard') return;
    const parts = currentPath.split('/');
    parts.pop();
    const parent = parts.join('/') || '/';
    setCurrentPath(parent);
  };

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: 'Root', path: '/' }];
    let built = '';
    
    parts.forEach((p) => {
      built += `/${p}`;
      crumbs.push({ name: p, path: built });
    });
    
    return crumbs;
  };

  // Create folder folder
  const handleCreateFolder = async () => {
    const folderName = window.prompt('Enter folder name:');
    if (!folderName) return;

    const fullPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    showToast('Creating Folder', `Compiles Folder layout for ${folderName}...`, 'info');

    try {
      const res = await fetch(`/api/devices/${activeDevice!.id}/files/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mkdir', path: fullPath })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Folder Created', `${folderName} folder added.`, 'success');
        fetchFiles();
      }
    } catch {
      showToast('Error', 'Failed to compile folder.', 'error');
    }
  };

  // Rename action
  const handleRename = async (file: AndroidFile) => {
    const newName = window.prompt('Enter new filename:', file.name);
    if (!newName) return;

    try {
      const res = await fetch(`/api/devices/${activeDevice!.id}/files/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', path: file.path, newName })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Renamed Successful', `${file.name} changed to ${newName}.`, 'success');
        fetchFiles();
      }
    } catch {
      showToast('Error', 'Failed to update file identifier.', 'error');
    }
  };

  // Delete action
  const handleDelete = async (file: AndroidFile) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      const res = await fetch(`/api/devices/${activeDevice!.id}/files/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', path: file.path })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Resource Pruned', 'File deleted successfully.', 'success');
        fetchFiles();
      }
    } catch {
      showToast('Error', 'Deletions error occurred.', 'error');
    }
  };

  // File download simulation
  const handleDownload = (file: AndroidFile) => {
    showToast('Spooling File', `Down-buffering resource: ${file.name}...`, 'info');
    setTimeout(() => {
      const simulatedText = `NexDroid Extracted Payload: Name=${file.name}, Path=${file.path}, Size=${file.size}`;
      const blob = new Blob([simulatedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download Finished', `Exported ${file.name} to downloads directory.`, 'success');
    }, 1000);
  };

  // Local File uploads
  const processUploadedFile = (file: File) => {
    setUploadName(file.name);
    setUploadProgress(10);
    
    // Animate progress bar simulation
    const interval = setInterval(async () => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          
          // Post file metadata details to DB
          fetch(`/api/devices/${activeDevice!.id}/files/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parentPath: currentPath,
              fileName: file.name,
              size: file.size
            })
          }).then(() => {
            showToast('Upload Successful', `${file.name} written successfully to local directory.`, 'success');
            setUploadProgress(null);
            fetchFiles();
          });

          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-[#09090b] text-gray-500">
        <FolderOpen className="w-12 h-12 text-zinc-600 animate-bounce mb-3" />
        <p className="text-sm">Select active targets to view host systems explorer.</p>
      </div>
    );
  }

  // File size format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return 'Folder';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#09090b] text-white" id="files-explorer-tab">
      
      {/********** HEADER **********/}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2023]" id="files-header">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Device Files & Storage</h1>
          <p className="text-xs text-gray-400">Browse folders, rename variables, push local assets, or download recordings.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateFolder}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#1f2023] hover:border-[#1da1f2] text-xs text-[#1da1f2] font-semibold rounded-lg bg-[#121215] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Dir Create
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1da1f2] hover:bg-[#1a8cd8] text-xs text-white font-semibold rounded-lg cursor-pointer border border-[#1da1f2]/20"
          >
            <Upload className="w-3.5 h-3.5" /> File Upload
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
          />
        </div>
      </div>

      {/********** BREADCRUMBS AND CONTROLS **********/}
      <div className="flex items-center justify-between bg-[#121215]/80 p-3 rounded-xl border border-[#1f2023] text-xs" id="files-navigation-toolbar">
        <div className="flex items-center gap-2 overflow-x-auto shrink-0 max-w-full mr-4" id="breadcrumbs-slider">
          <button
            onClick={traverseBack}
            disabled={currentPath === '/' || currentPath === '/sdcard'}
            className="p-1 border border-zinc-800 rounded hover:bg-[#1a1a22] text-zinc-400 disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-1 font-medium text-zinc-300">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />}
                <button
                  onClick={() => handleNavigate(crumb.path)}
                  className="hover:text-white transition-all hover:underline"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <button onClick={fetchFiles} className="text-zinc-400 hover:text-white shrink-0 font-bold" title="Reload storage listings">
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/********** UPLOADING PROGRESS DISPLAY **********/}
      {uploadProgress !== null && (
        <div className="p-4 rounded-xl border border-[#1da1f2]/10 bg-[#1da1f2]/5 space-y-2 text-xs" id="active-upload-log-box">
          <div className="flex justify-between text-gray-200">
            <span className="flex items-center gap-2"><HardDriveUpload className="w-4 h-4 text-cyan-400 animate-bounce" /> Uploading: <strong>{uploadName}</strong></span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#18181c] h-1 rounded-full overflow-hidden">
            <div className="bg-[#1da1f2] h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/********** FILE TRAVERSAL DISPLAY GRID **********/}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border transition-all duration-300 ${
          isDragging 
            ? 'border-[#1da1f2] bg-[#1da1f2]/5 scale-[0.99]' 
            : 'border-[#1f2023] bg-[#121215]/50'
        }`}
        id="files-drag-boundary"
      >
        {isDragging ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-[#1da1f2] font-display">
            <HardDriveUpload className="w-12 h-12 text-[#1da1f2] animate-bounce mb-3" />
            <h3 className="font-bold text-base">Drop items here to upload!</h3>
            <p className="text-xs text-[#1da1f2] mt-1.5">NexDroid control push engine is active</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs font-semibold">Directory is vacant. Drag items here to upload logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-medium" id="files-table">
              <thead>
                <tr className="border-b border-[#1f2023] text-zinc-400 font-semibold bg-[#121215]/40">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Modified Date</th>
                  <th className="py-3 px-4">Allocated Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2023]/60">
                {files.map((file) => (
                  <tr 
                    key={file.path} 
                    className="hover:bg-[#121215]/80 group"
                    id={`file-row-${file.name.toLowerCase().replace(/[^\w]/g, '-')}`}
                  >
                    {/* Name column */}
                    <td className="py-3 px-4 font-semibold">
                      {file.isDir ? (
                        <button
                          onClick={() => handleNavigate(file.path)}
                          className="flex items-center gap-2.5 hover:underline text-[#1da1f2] text-left"
                        >
                          <FolderOpen className="w-4.5 h-4.5 shrink-0 text-cyan-400" />
                          <span>{file.name}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2.5 text-zinc-300">
                          <File className="w-4.5 h-4.5 shrink-0 text-zinc-500" />
                          <span>{file.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Date modified */}
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-600" /> {file.modifiedTime}</span>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {formatBytes(file.size)}
                    </td>

                    {/* File actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!file.isDir && (
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1 border border-[#1f2023] hover:bg-cyan-500/10 hover:text-cyan-400 rounded cursor-pointer transition-all"
                            title="Download file"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRename(file)}
                          className="p-1 border border-[#1f2023] hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] rounded cursor-pointer transition-all"
                          title="Rename file"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-1 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 rounded cursor-pointer transition-all"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
