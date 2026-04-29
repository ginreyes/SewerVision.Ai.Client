"use client";

import { memo, useState, useRef } from "react";
import { Image as ImageIcon, File, X, Send, Plus, Loader2 } from "lucide-react";

/**
 * AttachmentMenu — Messenger-style with multi-file preview gallery.
 * Supports multiple images and files with thumbnail previews before sending.
 */
const AttachmentMenu = memo(function AttachmentMenu({ onSendAttachment, theme = "emerald", disabled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [files, setFiles] = useState([]); // [{ file, url, type }]
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const THEME_BG = {
    indigo: "bg-indigo-500", emerald: "bg-emerald-500", blue: "bg-blue-500",
    rose: "bg-rose-500", purple: "bg-purple-500", teal: "bg-teal-500", amber: "bg-amber-500",
  };
  const THEME_COLOR = {
    indigo: "text-indigo-500", emerald: "text-emerald-500", blue: "text-blue-500",
    rose: "text-rose-500", purple: "text-purple-500", teal: "text-teal-500", amber: "text-amber-500",
  };
  const themeBg = THEME_BG[theme] || THEME_BG.emerald;
  const themeColor = THEME_COLOR[theme] || THEME_COLOR.emerald;

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setMenuOpen(false);

    const newFiles = selected.map(file => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      type: file.type.startsWith("image/") ? "image" : "file",
    }));

    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(idx) {
    setFiles(prev => {
      const removed = prev[idx];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function handleSend() {
    if (files.length === 0) return;
    // Send ALL files as a batch to be combined into one message
    onSendAttachment(files.map(f => f.file), files[0]?.type);
    clearAll();
  }

  function clearAll() {
    files.forEach(f => { if (f.url) URL.revokeObjectURL(f.url); });
    setFiles([]);
  }

  // Preview bar with thumbnails
  if (files.length > 0) {
    return (
      <div className="flex flex-col w-full">
        {/* Thumbnail gallery */}
        <div className="flex items-end gap-2 px-1 py-2 overflow-x-auto">
          {/* Add more button */}
          <button onClick={() => imageInputRef.current?.click()}
            className="w-14 h-14 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-gray-400" />
          </button>

          {files.map((f, idx) => (
            <div key={idx} className="relative shrink-0">
              {f.type === "image" ? (
                <img src={f.url} alt={f.file.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-1">
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="text-[8px] text-gray-500 truncate w-full text-center mt-0.5">{f.file.name.split('.').pop()}</span>
                </div>
              )}
              <button onClick={() => removeFile(idx)}
                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Hidden inputs for adding more */}
          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
        </div>

        {/* Send bar */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-gray-400 flex-1">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
          <button onClick={clearAll} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
          <button onClick={handleSend} disabled={disabled}
            className={`p-2 rounded-full ${themeBg} text-white hover:opacity-90 disabled:opacity-40 transition-colors shadow-sm`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
      <input type="file" ref={fileInputRef} className="hidden" accept="*/*" multiple onChange={handleFileSelect} />

      <button onClick={() => setMenuOpen(p => !p)}
        className={`p-2 rounded-full transition-colors shrink-0 ${menuOpen ? 'bg-gray-100' : 'hover:bg-gray-100'} ${themeColor}`}>
        {menuOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>

      {menuOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20 w-52">
          <button onClick={() => imageInputRef.current?.click()}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
            <div className={`w-7 h-7 rounded-full ${themeBg} text-white flex items-center justify-center`}>
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium">Attach photos</p>
              <p className="text-[10px] text-gray-400">Select multiple images</p>
            </div>
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <File className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium">Attach files</p>
              <p className="text-[10px] text-gray-400">PDF, DOC, XLS up to 25MB each</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
});

export default AttachmentMenu;
