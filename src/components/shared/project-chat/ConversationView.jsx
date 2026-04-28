'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Smile, MoreHorizontal, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import {
  useFlattenedMessages,
  useSendProjectMessage,
  useLiveProjectChat,
  useMarkReadOnMount,
  useEditProjectMessage,
  useDeleteProjectMessage,
  useReactToProjectMessage,
  useUploadProjectAttachment,
} from '@/hooks/shared/useProjectChatHooks';
import MentionPicker from './MentionPicker';
import MessageReactions from './MessageReactions';
import AttachmentList from './AttachmentList';
import TemplateSuggestionStrip from './TemplateSuggestionStrip';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const senderLabel = (sender) => {
  if (!sender) return 'Unknown';
  const name = [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim();
  return name || sender.username || sender.email || 'Unknown';
};

const roleBadge = (role) => {
  if (!role) return null;
  const map = {
    admin: 'bg-violet-50 text-violet-700',
    user: 'bg-rose-50 text-rose-700',
    operator: 'bg-amber-50 text-amber-700',
    'qc-tech': 'bg-emerald-50 text-emerald-700',
    'qc-technician': 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${map[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};

/**
 * Render message text with @mentions highlighted. Mentions are tokens that
 * start with @ followed by [A-Za-z0-9_.-]{2,40}. We render them as inline
 * pills; non-mention text passes through verbatim.
 */
function renderTextWithMentions(text) {
  if (!text) return null;
  const parts = [];
  const regex = /(@[A-Za-z0-9_.-]{2,40})/g;
  let lastIdx = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={`t-${i++}`}>{text.slice(lastIdx, m.index)}</span>);
    }
    parts.push(
      <span
        key={`m-${i++}`}
        className="text-rose-700 bg-rose-100/60 rounded px-0.5 font-medium"
      >
        {m[0]}
      </span>
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(<span key={`t-${i++}`}>{text.slice(lastIdx)}</span>);
  return parts;
}

export default function ConversationView({ conversation, activeDetection }) {
  const { userData } = useUser();
  const conversationId = conversation?._id;

  const { messages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFlattenedMessages(conversationId);
  const sendMutation = useSendProjectMessage(conversationId, userData);
  const editMutation = useEditProjectMessage(conversationId);
  const deleteMutation = useDeleteProjectMessage(conversationId);
  const reactMutation = useReactToProjectMessage(conversationId);
  const uploadMutation = useUploadProjectAttachment();
  useLiveProjectChat(conversationId);
  useMarkReadOnMount(conversationId);

  // Composer state
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]); // [{url, filename, mimetype, size}]
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // @-mention picker state
  const [mentionQuery, setMentionQuery] = useState(null); // null | { text, startIdx }
  const [mentionActiveIdx, setMentionActiveIdx] = useState(0);

  // Suggestion-strip dismissed-this-session flag (per detection).
  const [dismissedSuggestionFor, setDismissedSuggestionFor] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollerRef = useRef(null);
  const bottomRef = useRef(null);

  // Scroll to bottom on new last-message id (not on prepended history).
  const lastIdRef = useRef(null);
  useEffect(() => {
    if (!messages.length) return;
    const lastId = messages[messages.length - 1]._id;
    if (lastIdRef.current !== lastId) {
      lastIdRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Build mention candidates from conversation participants, excluding self
  // and filtered by the active query. Declared BEFORE the early return below
  // because React hooks must run on every render in the same order.
  const mentionCandidates = useMemo(() => {
    if (!mentionQuery || !conversation) return [];
    const q = mentionQuery.text.toLowerCase();
    const seen = new Set();
    const out = [];
    for (const p of conversation.participants || []) {
      const u = p.userId;
      if (!u || !u._id) continue;
      const id = u._id.toString();
      if (seen.has(id)) continue;
      if (id === userData?._id) continue;
      const username = (u.username || '').toLowerCase();
      const fullName = `${u.first_name || ''}${u.last_name || ''}`.toLowerCase();
      if (q === '' || username.includes(q) || fullName.includes(q)) {
        seen.add(id);
        out.push(u);
      }
    }
    return out.slice(0, 6);
  }, [mentionQuery, conversation, userData]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        Pick a conversation to start chatting.
      </div>
    );
  }

  // Recompute @-mention query whenever the cursor or text changes.
  function handleDraftChange(e) {
    const value = e.target.value;
    setDraft(value);
    const cursor = e.target.selectionStart;
    // Walk back to find the most recent @ that's either at the start or after whitespace.
    const before = value.slice(0, cursor);
    const m = before.match(/(?:^|\s)@([A-Za-z0-9_.-]{0,40})$/);
    if (m) {
      setMentionQuery({ text: m[1], startIdx: cursor - m[1].length - 1 });
      setMentionActiveIdx(0);
    } else {
      setMentionQuery(null);
    }
  }

  function insertMention(user) {
    if (!mentionQuery) return;
    const before = draft.slice(0, mentionQuery.startIdx);
    const afterStart = mentionQuery.startIdx + 1 + mentionQuery.text.length; // skip @ + partial
    const after = draft.slice(afterStart);
    const insertion = `@${user.username || `${(user.first_name || '').toLowerCase()}${(user.last_name || '').toLowerCase()}`} `;
    const next = before + insertion + after;
    setDraft(next);
    setMentionQuery(null);
    // Restore focus + put caret right after insertion.
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const pos = (before + insertion).length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function handleKeyDown(e) {
    if (mentionQuery && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionActiveIdx((i) => Math.min(i + 1, mentionCandidates.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionCandidates[mentionActiveIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleAttachFiles(files) {
    if (!files?.length) return;
    const list = Array.from(files);
    for (const file of list) {
      try {
        const meta = await uploadMutation.mutateAsync(file);
        if (meta) {
          setPendingAttachments((prev) => [...prev, meta]);
        }
      } catch (err) {
        // Surface inline; the parent dialog/drawer doesn't have a toast wired
        // and the user can retry without losing draft text.
        console.error('attachment upload failed', err);
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
  }

  function removePendingAttachment(idx) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;
    sendMutation.mutate({
      text,
      attachments: pendingAttachments.map((a) => ({
        url: a.url,
        filename: a.filename,
        mimetype: a.mimetype,
        size: a.size,
      })),
    });
    setDraft('');
    setPendingAttachments([]);
    setMentionQuery(null);
  }

  function startEdit(msg) {
    setEditingId(msg._id);
    setEditingText(msg.text || '');
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingText('');
  }
  async function saveEdit() {
    if (!editingId || !editingText.trim()) {
      cancelEdit();
      return;
    }
    await editMutation.mutateAsync({ messageId: editingId, text: editingText.trim() });
    cancelEdit();
  }

  function confirmDelete(msg) {
    if (window.confirm('Delete this message? This cannot be undone.')) {
      deleteMutation.mutate(msg._id);
    }
  }

  function insertTemplate(template) {
    // Substitute placeholders. {{detectionType}}, {{severity}}, {{technicianName}},
    // {{date}}, {{projectName}}, {{pacpCode}} — best-effort, leaves unmatched
    // placeholders in place so the user can fill them in.
    const replacements = {
      '{{detectionType}}': activeDetection?.type || '',
      '{{severity}}': activeDetection?.severity || '',
      '{{pacpCode}}': activeDetection?.pacpCode || '',
      '{{technicianName}}': senderLabel(userData),
      '{{date}}': new Date().toLocaleDateString(),
      '{{projectName}}': conversation?.projectId?.name || '',
    };
    let body = template.body || '';
    for (const [k, v] of Object.entries(replacements)) {
      if (v) body = body.split(k).join(v);
    }
    setDraft((prev) => (prev ? `${prev}\n${body}` : body));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  // Group consecutive messages from the same sender within 5 minutes.
  const grouped = [];
  let lastDateLabel = null;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const dateLabel = formatDateLabel(m.createdAt);
    if (dateLabel !== lastDateLabel) {
      grouped.push({ kind: 'date', id: `date-${i}`, label: dateLabel });
      lastDateLabel = dateLabel;
    }
    const prev = messages[i - 1];
    const senderId = m.sender?._id || m.sender;
    const prevSenderId = prev?.sender?._id || prev?.sender;
    const sameSender = prev && prevSenderId === senderId;
    const close = prev && Math.abs(new Date(m.createdAt) - new Date(prev.createdAt)) < 5 * 60 * 1000;
    grouped.push({ kind: 'msg', message: m, isFirstInGroup: !sameSender || !close });
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <div className="text-sm font-semibold text-gray-900">
          {conversation.kind === 'group' ? 'Project Group Chat' : 'Direct Message'}
        </div>
        <div className="text-xs text-gray-500">
          {(conversation.participants || []).length} participant
          {(conversation.participants || []).length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {hasNextPage && (
          <div className="flex justify-center mb-2">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-rose-600 hover:text-rose-700 disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load older'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-xs text-gray-400 py-4">Loading messages…</div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-4">
            No messages yet. Say hi.
          </div>
        )}

        {grouped.map((g) => {
          if (g.kind === 'date') {
            return (
              <div key={g.id} className="text-center my-3">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {g.label}
                </span>
              </div>
            );
          }
          const m = g.message;
          const senderId = m.sender?._id || m.sender;
          const isMine = userData && (senderId === userData._id || senderId?.toString?.() === userData._id);
          const isEditing = editingId === m._id;
          return (
            <div
              key={m._id}
              className={`group/msg flex ${isMine ? 'justify-end' : 'justify-start'} ${
                g.isFirstInGroup ? 'mt-2' : 'mt-0.5'
              }`}
            >
              <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {g.isFirstInGroup && !isMine && (
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span className="text-xs font-medium text-gray-700">{senderLabel(m.sender)}</span>
                    {roleBadge(m.sender?.role)}
                  </div>
                )}

                <div className="flex items-end gap-1">
                  {/* Hover actions on the LEFT for mine, RIGHT for theirs */}
                  {isMine && !isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(m)}
                        className="p-1 rounded hover:bg-red-50 text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col">
                    {isEditing ? (
                      <div className={`rounded-2xl px-3 py-1.5 text-sm bg-amber-50 border border-amber-200`}>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={Math.min(6, editingText.split('\n').length)}
                          className="w-full bg-transparent outline-none text-gray-900 resize-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={editMutation.isPending}
                            className="text-[10px] font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-50"
                          >
                            {editMutation.isPending ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(m.text || '').trim() && (
                          <div
                            className={`rounded-2xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap ${
                              isMine
                                ? 'bg-rose-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            } ${m.pending ? 'opacity-60' : ''}`}
                          >
                            {renderTextWithMentions(m.text)}
                          </div>
                        )}
                        <AttachmentList attachments={m.attachments} />
                      </>
                    )}

                    {!isEditing && (
                      <MessageReactions
                        reactions={m.reactions || []}
                        currentUserId={userData?._id}
                        isMine={isMine}
                        onToggle={(emoji) => reactMutation.mutate({ messageId: m._id, emoji })}
                      />
                    )}

                    <div className={`text-[10px] text-gray-400 mt-0.5 px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                      {formatTime(m.createdAt)}
                      {m.edited && <span className="ml-1 italic">edited</span>}
                      {m.pending && <span className="ml-1 italic">sending…</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Detection-aware template suggestions (QC tech only — silently no-ops for other roles when no detection prop) */}
      {activeDetection && dismissedSuggestionFor !== activeDetection?._id && (
        <TemplateSuggestionStrip
          userId={userData?._id}
          detectionType={activeDetection?.type}
          severity={activeDetection?.severity}
          onInsert={insertTemplate}
          onDismiss={() => setDismissedSuggestionFor(activeDetection._id)}
        />
      )}

      {/* Pending attachments preview */}
      {pendingAttachments.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-2 flex flex-wrap gap-2 bg-gray-50">
          {pendingAttachments.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs">
              <span className="truncate max-w-[160px]">{a.filename}</span>
              <button
                type="button"
                onClick={() => removePendingAttachment(i)}
                className="text-gray-400 hover:text-red-500"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="border-t border-gray-200 p-3 flex gap-2 relative"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => {
            handleAttachFiles(e.target.files);
            e.target.value = ''; // allow re-selecting same file
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          title="Attach files"
        >
          {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a message… (Enter to send, Shift+Enter for newline, @ to mention)"
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          {mentionQuery && (
            <MentionPicker
              candidates={mentionCandidates}
              activeIndex={mentionActiveIdx}
              onSelect={insertMention}
              onClose={() => setMentionQuery(null)}
              anchorRef={textareaRef}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={(!draft.trim() && pendingAttachments.length === 0) || sendMutation.isPending}
          className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
