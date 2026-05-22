"use client";

import React, { memo, useState, useRef, useMemo } from "react";
import { Check, CheckCheck, File, Download, Smile, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { avatarSrc, getAvatarColor, getInitials, API_URL } from "@/components/admin/constants";
import { api } from "@/lib/helper";
import { ROLE_BADGE_CLASSES, getRoleLabel } from "@/lib/roleThemes";
import ImageLightbox from "./ImageLightbox";

function resolveAttachmentUrl(url) {
  if (!url) return '';
  // If it's a relative API path, prefix with backend URL
  if (url.startsWith('/api/')) return `${API_URL}${url}`;
  return url;
}

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

/**
 * Shared ChatMessage bubble — Messenger-style with reactions, edit, delete, read receipts.
 */
const ChatMessage = memo(function ChatMessage({
  messageId,
  text,
  isMine,
  senderName,
  senderRole,
  senderId,
  currentUserId,
  timestamp,
  readAt,
  attachments,
  allConversationImages = [], // All images from the entire conversation for carousel
  reactions = [],
  edited,
  deleted,
  showAvatar = true,
  showName = false, // Render the sender's name + role above the first bubble in a cluster (group chats)
  isFirst,
  isLast,
  theme = "emerald",
  onEdit,
  onDelete,
  onReact,
  onRefresh,
}) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text || '');
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const actionRef = useRef(null);

  // Separate image and file attachments
  const imageAtts = useMemo(() => (attachments || []).filter(att =>
    att.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(att.filename || att.url || '')
  ), [attachments]);
  const fileAtts = useMemo(() => (attachments || []).filter(att =>
    !att.mimetype?.startsWith('image/') && !/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(att.filename || att.url || '')
  ), [attachments]);

  // Theme map — keep in sync with @/lib/roleThemes accent colors so the bubble
  // matches each role's primary palette.
  const THEME_BG = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500",
    teal: "bg-teal-500",
    amber: "bg-amber-500",
  };
  const THEME_REACTION_ACTIVE = {
    indigo: "bg-indigo-50 border-indigo-300",
    emerald: "bg-emerald-50 border-emerald-300",
    blue: "bg-blue-50 border-blue-300",
    rose: "bg-rose-50 border-rose-300",
    purple: "bg-purple-50 border-purple-300",
    teal: "bg-teal-50 border-teal-300",
    amber: "bg-amber-50 border-amber-300",
  };
  const THEME_RING = {
    indigo: "focus:ring-indigo-400",
    emerald: "focus:ring-emerald-400",
    blue: "focus:ring-blue-400",
    rose: "focus:ring-rose-400",
    purple: "focus:ring-purple-400",
    teal: "focus:ring-teal-400",
    amber: "focus:ring-amber-400",
  };
  const bg = isMine
    ? THEME_BG[theme] || THEME_BG.emerald
    : "bg-white border border-gray-200";
  const textColor = isMine ? "text-white" : "text-gray-800";
  const timeColor = "text-gray-400";
  const reactionActiveClass = THEME_REACTION_ACTIVE[theme] || THEME_REACTION_ACTIVE.emerald;
  const ringClass = THEME_RING[theme] || THEME_RING.emerald;

  const initials = getInitials(senderName || "?");
  const avatarColor = getAvatarColor(senderName || "?");
  const avatarUrl = senderId ? avatarSrc({ _id: senderId }) : null;

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // Edit/Delete/React: if a callback prop is provided, the parent owns the
  // mutation (e.g. project chat uses TanStack mutations). Falls back to the
  // hardcoded customer-conversations API for backwards compatibility with
  // the existing customer ChatBubble call sites.
  async function handleEdit() {
    if (!editText.trim() || !messageId) return;
    try {
      if (onEdit) {
        await onEdit(messageId, editText.trim());
      } else {
        await api(`/api/client-conversations/messages/${messageId}/edit`, 'PUT', { text: editText.trim(), senderId: currentUserId });
      }
      setEditing(false);
      if (onRefresh) onRefresh();
    } catch (e) { console.error('Edit failed:', e); }
  }

  async function handleDelete() {
    if (!messageId) return;
    try {
      if (onDelete) {
        await onDelete(messageId);
      } else {
        await api(`/api/client-conversations/messages/${messageId}`, 'DELETE', { senderId: currentUserId });
      }
      setShowActions(false);
      if (onRefresh) onRefresh();
    } catch (e) { console.error('Delete failed:', e); }
  }

  async function handleReact(emoji) {
    if (!messageId) return;
    try {
      if (onReact) {
        await onReact(messageId, emoji);
      } else {
        await api(`/api/client-conversations/messages/${messageId}/react`, 'POST', { emoji, userId: currentUserId });
      }
      setShowReactions(false);
      if (onRefresh) onRefresh();
    } catch (e) { console.error('React failed:', e); }
  }

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.userId);
    return acc;
  }, {});

  if (deleted) {
    return (
      <div className={`flex gap-1.5 ${isMine ? 'flex-row-reverse' : ''} ${isFirst ? 'mt-3' : 'mt-0.5'}`}>
        <div className="w-7 shrink-0" />
        <div className="px-3 py-1.5 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-gray-100">
          This message was removed
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-1.5 ${isMine ? 'flex-row-reverse' : ''} ${isFirst ? 'mt-3' : 'mt-0.5'} relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      {/* Avatar */}
      <div className="w-7 shrink-0 flex items-end">
        {showAvatar && !isMine && (
          <div className="relative">
            {avatarUrl && (
              <img src={avatarUrl} alt={senderName || ''} className="w-7 h-7 rounded-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            )}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarColor}`}
              style={{ display: avatarUrl ? 'none' : 'flex' }}>
              {initials}
            </div>
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%] relative`}>
        {/* Sender name + role label — only on the first bubble in a cluster
            for theirs (group chats). Hidden for own messages and for DMs. */}
        {showName && !isMine && isFirst && senderName && (
          <div className="flex items-center gap-1.5 mb-0.5 px-1">
            <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[160px]">
              {senderName}
            </span>
            {senderRole && (
              <span
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${ROLE_BADGE_CLASSES[senderRole] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
              >
                {getRoleLabel(senderRole)}
              </span>
            )}
          </div>
        )}
        {/* Editing mode */}
        {editing ? (
          <div className="flex items-center gap-1.5 w-full">
            <input value={editText} onChange={e => setEditText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false); }}
              className="flex-1 text-sm px-3 py-1.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              autoFocus />
            <button onClick={handleEdit} className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(false)} className="p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <>
            {/* Image attachments — photo grid collage */}
            {imageAtts.length > 0 && (
              <div className={`rounded-2xl overflow-hidden shadow-sm cursor-pointer ${
                imageAtts.length === 1 ? 'max-w-[260px]' :
                imageAtts.length === 2 ? 'max-w-[260px] grid grid-cols-2 gap-0.5' :
                imageAtts.length === 3 ? 'max-w-[260px] grid grid-cols-2 gap-0.5' :
                'max-w-[260px] grid grid-cols-2 gap-0.5'
              }`}>
                {imageAtts.slice(0, 4).map((att, i) => {
                  const fileUrl = resolveAttachmentUrl(att.url);
                  const isLast = i === 3 && imageAtts.length > 4;
                  // For 3 images: first one spans full width
                  const spanClass = imageAtts.length === 3 && i === 0 ? 'col-span-2' : '';
                  return (
                    <div key={i} className={`relative ${spanClass}`} onClick={() => setLightboxIdx(i)}>
                      <img src={fileUrl} alt={att.filename || 'image'}
                        className={`w-full object-cover hover:opacity-90 transition-opacity ${
                          imageAtts.length === 1 ? 'rounded-2xl max-h-[300px]' :
                          spanClass ? 'h-[140px]' : 'h-[130px]'
                        }`} />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">+{imageAtts.length - 4}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* File attachments */}
            {fileAtts.length > 0 && (
              <div className="space-y-1">
                {fileAtts.map((att, i) => {
                  const fileUrl = resolveAttachmentUrl(att.url);
                  return (
                    <a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-sm ${isMine ? `${bg} text-white` : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      <File className="w-4 h-4 shrink-0" />
                      <span className="truncate flex-1">{att.filename || 'File'}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Lightbox — uses all conversation images for full carousel */}
            {lightboxIdx >= 0 && (() => {
              // Find the clicked image's position in the full conversation image list
              const clickedUrl = imageAtts[lightboxIdx]?.url;
              const allImages = allConversationImages.length > 0 ? allConversationImages : imageAtts;
              const globalIdx = allImages.findIndex(img => img.url === clickedUrl);
              return (
                <ImageLightbox
                  images={allImages}
                  initialIndex={globalIdx >= 0 ? globalIdx : lightboxIdx}
                  onClose={() => setLightboxIdx(-1)}
                />
              );
            })()}

            {/* Text bubble — only if there's actual text */}
            {text && text.trim() && (
              <div className={`relative px-3 py-1.5 text-[13px] leading-relaxed shadow-sm ${bg} ${textColor} ${
                isMine
                  ? `rounded-[18px] ${isLast ? 'rounded-br-[4px]' : ''}`
                  : `rounded-[18px] ${isLast ? 'rounded-bl-[4px]' : ''}`
              }`}>
                {text}
                {edited && <span className={`text-[9px] ml-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>(edited)</span>}
              </div>
            )}

            {/* Hover action buttons — inline row beside message */}
            {showActions && (
              <div className={`flex items-center gap-0.5 ${isMine ? 'self-end flex-row-reverse' : 'self-start'}`} ref={actionRef}>
                <button onClick={(e) => { e.stopPropagation(); setShowReactions(p => !p); }}
                  className="p-1 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {isMine && (
                  <>
                    {text && text.trim() && (
                      <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditText(text); setShowActions(false); }}
                        className="p-1 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="p-1 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Quick reactions popup */}
            {showReactions && (
              <div className={`absolute ${isMine ? 'right-0' : 'left-0'} -top-10 flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1.5 py-1 shadow-lg z-10`}>
                {QUICK_REACTIONS.map(emoji => (
                  <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                    className="w-7 h-7 flex items-center justify-center text-base hover:bg-gray-100 rounded-full transition-transform hover:scale-125">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Reactions display */}
            {Object.keys(reactionGroups).length > 0 && (
              <div className={`flex items-center gap-0.5 mt-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                {Object.entries(reactionGroups).map(([emoji, users]) => (
                  <button key={emoji} onClick={() => handleReact(emoji)}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors ${
                      users.includes(currentUserId) ? reactionActiveClass : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                    <span>{emoji}</span>
                    {users.length > 1 && <span className="text-gray-500">{users.length}</span>}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Timestamp + read receipt */}
        {isLast && (
          <div className={`flex items-center gap-1 mt-0.5 mx-1 ${isMine ? '' : ''}`}>
            <span className={`text-[10px] ${timeColor}`}>{timeStr}</span>
            {isMine && (
              readAt
                ? <span className="text-[10px] text-blue-400 flex items-center gap-0.5"><CheckCheck className="w-3 h-3" />Seen</span>
                : <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Check className="w-3 h-3" />Sent</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * DateSeparator
 */
export function ChatDateSeparator({ date }) {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let label;
  if (d.toDateString() === now.toDateString()) label = "Today";
  else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
  else label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] text-gray-400 font-medium bg-white px-2 py-0.5 rounded-full">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default ChatMessage;
