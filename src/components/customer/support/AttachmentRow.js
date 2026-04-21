'use client';

import React from 'react';
import { Eye, FileText, Download } from 'lucide-react';
import { BACKEND_URL } from '@/lib/config';

function fileProxyUrl(filename) {
  if (!filename) return '';
  return `${BACKEND_URL}/api/complaints/file?file=${encodeURIComponent(filename)}`;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentRow({ attachments, dark = false }) {
  if (!attachments?.length) return null;
  const images = attachments.filter((a) => a.mimetype?.startsWith('image/'));
  const files = attachments.filter((a) => !a.mimetype?.startsWith('image/'));
  return (
    <div className="mt-2 space-y-1.5">
      {images.length > 0 && (
        <div
          className={`grid gap-1.5 ${
            images.length === 1 ? 'grid-cols-1 max-w-[180px]' : 'grid-cols-2'
          }`}
        >
          {images.map((att, i) => (
            <a
              key={i}
              href={fileProxyUrl(att.filename)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative rounded-xl overflow-hidden group block aspect-square border border-black/10"
            >
              <img
                src={fileProxyUrl(att.filename)}
                alt={att.originalname || att.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}
      {files.map((att, i) => (
        <a
          key={i}
          href={fileProxyUrl(att.filename)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl group transition-colors ${
            dark
              ? 'bg-black/10 hover:bg-black/20 border border-black/10'
              : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0 opacity-70" />
          <span className="text-xs font-medium truncate flex-1">
            {att.originalname || att.filename}
          </span>
          {att.size ? (
            <span className="text-[10px] opacity-60 shrink-0">{formatBytes(att.size)}</span>
          ) : null}
          <Download className="w-3 h-3 opacity-40 group-hover:opacity-90 shrink-0" />
        </a>
      ))}
    </div>
  );
}

export { fileProxyUrl, formatBytes };
