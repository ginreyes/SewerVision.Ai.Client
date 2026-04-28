'use client';

import { useState } from 'react';
import { FileText, Download, Image as ImageIcon, X } from 'lucide-react';

/**
 * Renders a row of attachment chips under a message. Image MIMEs become
 * thumbnails (click to lightbox); everything else becomes a download chip.
 *
 * The proxy URL on each attachment is relative (`/api/project-conversations/file/...`),
 * so we prefix it with NEXT_PUBLIC_BACKEND_URL when set.
 */
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const isImage = (m) => typeof m === 'string' && m.startsWith('image/');

function fmtBytes(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments }) {
  const [lightbox, setLightbox] = useState(null);
  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {attachments.map((a, i) => {
          const url = a.url?.startsWith('http') ? a.url : `${BACKEND}${a.url}`;
          if (isImage(a.mimetype)) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(url)}
                className="block rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors max-w-[200px]"
                title={a.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={a.filename} className="block max-h-40 object-cover" />
              </button>
            );
          }
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-rose-300 transition-colors max-w-[260px]"
              title={a.filename}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="text-xs text-gray-800 truncate flex-1">{a.filename}</span>
              <span className="text-[10px] text-gray-400 shrink-0">{fmtBytes(a.size)}</span>
              <Download className="w-3 h-3 text-gray-400 shrink-0" />
            </a>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain rounded" />
        </div>
      )}
    </>
  );
}
