'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Headphones, Plus, Clock, CheckCircle, AlertCircle, XCircle,
  MessageSquare, ChevronRight, Send, Loader2, ArrowLeft, User,
  Paperclip, X, FileText, Eye, Download, MessageSquareWarning,
  Ticket, LinkIcon, LayoutGrid, List,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import EmptySewerComponent from '@/components/shared/EmptySewerComponent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  useSupportCustomerStats,
  useCreateSupportTicket,
  useSupportTicket,
  useAddTicketResponse,
  useCustomerComplaints,
  useCreateCustomerComplaint,
  useComplaint,
} from '@/hooks/useQueryHooks';
import supportApi from '@/data/supportApi';
import complaintApi from '@/data/complaintApi';

// ── Utilities ──
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
function fileProxyUrl(filename) {
  if (!filename) return '';
  return `${BACKEND}/api/complaints/file?file=${encodeURIComponent(filename)}`;
}
function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Ticket constants ──
const TICKET_STATUS_COLORS = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};
const TICKET_STATUS_ICONS = { open: AlertCircle, 'in-progress': Clock, resolved: CheckCircle, closed: XCircle };
const TICKET_CATEGORIES = [
  { value: 'report', label: 'Report Issue' },
  { value: 'project', label: 'Project Inquiry' },
  { value: 'account', label: 'Account Help' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

// ── Complaint constants ──
const COMPLAINT_STATUS_COLORS = {
  new: 'bg-amber-100 text-amber-700 border-amber-200',
  investigating: 'bg-blue-100 text-blue-700 border-blue-200',
  'action-required': 'bg-orange-100 text-orange-700 border-orange-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dismissed: 'bg-gray-100 text-gray-600 border-gray-200',
};
const COMPLAINT_STATUS_LABELS = {
  new: 'Submitted', investigating: 'Under Review',
  'action-required': 'Action Required', resolved: 'Resolved', dismissed: 'Closed',
};
const COMPLAINT_STATUS_ICONS = {
  new: AlertCircle, investigating: Clock,
  'action-required': AlertCircle, resolved: CheckCircle, dismissed: XCircle,
};
const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700',
};
const COMPLAINT_CATEGORIES = [
  { value: 'service', label: 'Service Issue' }, { value: 'billing', label: 'Billing Problem' },
  { value: 'technical', label: 'Technical Issue' }, { value: 'delivery', label: 'Delivery Problem' },
  { value: 'quality', label: 'Quality Concern' }, { value: 'communication', label: 'Communication Issue' },
  { value: 'other', label: 'Other' },
];
const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low — Minor inconvenience' },
  { value: 'medium', label: 'Medium — Noticeable impact' },
  { value: 'high', label: 'High — Significant impact' },
  { value: 'critical', label: 'Critical — Urgent attention needed' },
];

/* ─── Shared attachment renderer ─── */
function AttachmentRow({ attachments, dark = false }) {
  if (!attachments?.length) return null;
  const images = attachments.filter(a => a.mimetype?.startsWith('image/'));
  const files = attachments.filter(a => !a.mimetype?.startsWith('image/'));
  return (
    <div className="mt-2 space-y-1.5">
      {images.length > 0 && (
        <div className={`grid gap-1.5 ${images.length === 1 ? 'grid-cols-1 max-w-[180px]' : 'grid-cols-2'}`}>
          {images.map((att, i) => (
            <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
              className="relative rounded-xl overflow-hidden group block aspect-square border border-black/10">
              <img src={fileProxyUrl(att.filename)} alt={att.originalname || att.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}
      {files.map((att, i) => (
        <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl group transition-colors ${dark ? 'bg-black/10 hover:bg-black/20 border border-black/10' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'}`}>
          <FileText className="w-4 h-4 shrink-0 opacity-70" />
          <span className="text-xs font-medium truncate flex-1">{att.originalname || att.filename}</span>
          {att.size ? <span className="text-[10px] opacity-60 shrink-0">{formatBytes(att.size)}</span> : null}
          <Download className="w-3 h-3 opacity-40 group-hover:opacity-90 shrink-0" />
        </a>
      ))}
    </div>
  );
}

/* ─── Ticket Detail View ─── */
function TicketDetailView({ ticketId, userId, userData, onBack }) {
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const responseMutation = useAddTicketResponse();

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - replyAttachments.length;
    if (remaining <= 0) { showAlert('Max 5 files per reply', 'error'); return; }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const results = await Promise.all(toUpload.map(async (f) => {
        const localPreview = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
        const result = await supportApi.uploadTicketAttachment(ticketId, f);
        return { ...result, localPreview };
      }));
      setReplyAttachments(prev => [...prev, ...results]);
    } catch (err) {
      showAlert(err.message || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [ticketId, replyAttachments, showAlert]);

  const handleReply = async () => {
    if (!replyText.trim() && replyAttachments.length === 0) return;
    try {
      await responseMutation.mutateAsync({
        ticketId,
        text: replyText.trim() || '📎 Attachment',
        senderId: userId,
        senderRole: 'customer',
        attachments: replyAttachments.map(({ url, filename, originalname, mimetype, size }) => ({ url, filename, originalname, mimetype, size })),
      });
      setReplyText('');
      setReplyAttachments([]);
      showAlert('Reply sent', 'success');
    } catch (e) { showAlert(e.message, 'error'); }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>;
  if (!ticket) return <div className="text-center py-16 text-gray-500">Ticket not found</div>;

  const StatusIcon = TICKET_STATUS_ICONS[ticket.status] || AlertCircle;
  const myName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username : 'You';
  const myAvatar = userData?.avatar;
  const myFallback = (myName.charAt(0) || 'Y').toUpperCase();

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Help Center
      </Button>
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{ticket.subject}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${TICKET_STATUS_COLORS[ticket.status]} text-xs gap-1`}><StatusIcon className="w-3 h-3" />{ticket.status}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{ticket.priority} priority</Badge>
                <span className="text-xs text-gray-400">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat area */}
      <div className="bg-gray-100 rounded-2xl px-4 py-5 space-y-3 min-h-[200px]">
        {/* Opening message — ME (right, teal) */}
        <div className="flex items-end gap-2 justify-end">
          <div className="max-w-[75%] flex flex-col items-end">
            <span className="text-[10px] text-gray-400 mb-1 mr-1">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</span>
            <div className="bg-emerald-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
            </div>
          </div>
          <UserAvatar src={myAvatar} fallback={myFallback} size="sm" />
        </div>

        {/* Responses */}
        {ticket.responses?.map((resp, idx) => {
          const sender = resp.senderId;
          const isSupport = resp.senderRole !== 'customer';
          const senderName = isSupport
            ? (sender?.first_name ? `${sender.first_name} ${sender.last_name || ''}`.trim() : 'Support')
            : myName;
          const avatarSrc = isSupport ? sender?.avatar : myAvatar;
          const avatarFallback = (senderName.charAt(0) || '?').toUpperCase();

          if (isSupport) {
            return (
              <div key={idx} className="flex items-end gap-2">
                <UserAvatar src={avatarSrc} fallback={avatarFallback} size="sm" />
                <div className="max-w-[75%]">
                  <span className="text-[10px] text-gray-400 mb-1 ml-1 block">{senderName} · {resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ''}</span>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{resp.text}</p>
                    <AttachmentRow attachments={resp.attachments} />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-end gap-2 justify-end">
              <div className="max-w-[75%] flex flex-col items-end">
                <span className="text-[10px] text-gray-400 mb-1 mr-1">{resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ''}</span>
                <div className="bg-emerald-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{resp.text}</p>
                  <AttachmentRow attachments={resp.attachments} dark />
                </div>
              </div>
              <UserAvatar src={myAvatar} fallback={myFallback} size="sm" />
            </div>
          );
        })}

        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-[10px] text-gray-400 px-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {ticket.status === 'resolved' ? 'Ticket resolved' : 'Ticket closed'}
            </span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        )}
      </div>

      {/* Reply box */}
      {ticket.status !== 'closed' && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            {replyAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {replyAttachments.map((att, i) => {
                  const isImg = att.mimetype?.startsWith('image/');
                  return (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
                      {isImg ? (
                        <img src={att.localPreview || fileProxyUrl(att.filename)} alt={att.originalname} className="w-7 h-7 object-cover rounded-lg" />
                      ) : (
                        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      )}
                      <span className="text-xs text-gray-600 truncate max-w-[80px]">{att.originalname || att.filename}</span>
                      <button type="button" onClick={() => setReplyAttachments(prev => prev.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-500 ml-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <Textarea
              placeholder="Write a reply… (Ctrl+Enter to send)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="resize-none border-gray-200 focus:border-emerald-400 focus:ring-emerald-500/20 rounded-xl text-sm mb-2"
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(); }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,video/mp4,video/quicktime" className="hidden" onChange={handleFileSelect} />
                <Button variant="ghost" size="sm" type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || replyAttachments.length >= 5}
                  className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 h-8 px-2 rounded-lg">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </Button>
                <span className="text-[10px] text-gray-400">JPG, PNG, PDF, MP4 · max 20MB</span>
              </div>
              <Button size="sm" onClick={handleReply}
                disabled={(!replyText.trim() && replyAttachments.length === 0) || responseMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl px-5">
                {responseMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Complaint Detail View ─── */
function ComplaintDetailView({ complaintId, onBack }) {
  const { data: complaint, isLoading } = useComplaint(complaintId);

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>;
  if (!complaint) return <div className="text-center py-16 text-gray-500">Complaint not found</div>;

  const StatusIcon = COMPLAINT_STATUS_ICONS[complaint.status] || AlertCircle;
  const linkedTicket = complaint.linkedTicketId;
  const attachments = complaint.attachments || [];

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Help Center
      </Button>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{complaint.title}</h3>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge className={`${COMPLAINT_STATUS_COLORS[complaint.status]} text-xs gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {COMPLAINT_STATUS_LABELS[complaint.status] || complaint.status}
                </Badge>
                <Badge variant="outline" className={`text-xs capitalize ${SEVERITY_COLORS[complaint.severity] || ''}`}>
                  {complaint.severity} severity
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">{complaint.category}</Badge>
                <span className="text-xs text-gray-400">{complaint.created_at ? new Date(complaint.created_at).toLocaleString() : ''}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
          </div>
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gray-50/60 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</span>
            <span className="ml-auto text-xs text-gray-400">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span>
          </div>
          <CardContent className="p-4">
            {attachments.filter(a => a.mimetype?.startsWith('image/')).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {attachments.filter(a => a.mimetype?.startsWith('image/')).map((att, i) => (
                  <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
                    className="group block relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                    <img src={fileProxyUrl(att.filename)} alt={att.originalname || att.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {attachments.filter(a => !a.mimetype?.startsWith('image/')).map((att, i) => (
                <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 group transition-colors">
                  <FileText className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-xs font-medium truncate flex-1">{att.originalname || att.filename}</span>
                  {att.size && <span className="text-[10px] text-gray-400">{formatBytes(att.size)}</span>}
                  <Download className="w-3 h-3 text-gray-400 group-hover:text-gray-700" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {linkedTicket && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Support Ticket Created</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-gray-700">
              <Ticket className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="flex-1 truncate">{linkedTicket.subject || 'Support ticket'}</span>
              {linkedTicket.status && <Badge variant="outline" className="text-[10px] capitalize shrink-0">{linkedTicket.status}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {complaint.status === 'resolved' && complaint.resolution && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-semibold text-emerald-700">Resolution</h4>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{complaint.resolution}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 text-xs">Category</span><p className="font-medium capitalize">{complaint.category}</p></div>
            <div><span className="text-gray-500 text-xs">Severity</span><p className="font-medium capitalize">{complaint.severity}</p></div>
            <div>
              <span className="text-gray-500 text-xs">Submitted</span>
              <p className="font-medium">{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Assigned To</span>
              <p className="font-medium">{complaint.assignedTo ? `${complaint.assignedTo.first_name || ''} ${complaint.assignedTo.last_name || ''}`.trim() || 'Support Team' : 'Pending'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Ticket list item ─── */
function TicketRow({ t, gridMode, onClick }) {
  const StatusIcon = TICKET_STATUS_ICONS[t.status] || AlertCircle;
  const hasAttachments = t.responses?.some(r => r.attachments?.length > 0);

  if (gridMode) {
    return (
      <Card className="border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-200 group" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <Badge className={`${TICKET_STATUS_COLORS[t.status]} text-[10px] shrink-0`}>
              <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />{t.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">{t.subject}</p>
          <p className="text-xs text-gray-500 capitalize mb-3">{t.category}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
            <div className="flex items-center gap-1.5">
              {t.responses?.length > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{t.responses.length}</span>}
              {hasAttachments && <Paperclip className="w-3 h-3" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <tr className="hover:bg-emerald-50/50 cursor-pointer transition-colors group" onClick={onClick}>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{t.subject}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`${TICKET_STATUS_COLORS[t.status]} text-[10px]`}><StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />{t.status}</Badge>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge variant="outline" className="text-[10px] capitalize">{t.category}</Badge>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {t.responses?.length > 0 && <Badge variant="secondary" className="text-[10px]">{t.responses.length} replies</Badge>}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </td>
    </tr>
  );
}

/* ─── Complaint list item ─── */
function ComplaintRow({ c, gridMode, onClick }) {
  const StatusIcon = COMPLAINT_STATUS_ICONS[c.status] || AlertCircle;
  const hasAttachments = c.attachments?.length > 0;

  if (gridMode) {
    return (
      <Card className="border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-200 group" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
            </div>
            <Badge className={`${COMPLAINT_STATUS_COLORS[c.status]} text-[10px] shrink-0`}>
              <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />{COMPLAINT_STATUS_LABELS[c.status] || c.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors">{c.title}</p>
          <p className="text-xs text-gray-500 capitalize mb-3">{c.category}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={`text-[9px] capitalize ${SEVERITY_COLORS[c.severity] || ''}`}>{c.severity}</Badge>
              {hasAttachments && <Paperclip className="w-3 h-3" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <tr className="hover:bg-amber-50/50 cursor-pointer transition-colors group" onClick={onClick}>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors">{c.title}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`${COMPLAINT_STATUS_COLORS[c.status]} text-[10px]`}><StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />{COMPLAINT_STATUS_LABELS[c.status] || c.status}</Badge>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge variant="outline" className={`text-[10px] capitalize ${SEVERITY_COLORS[c.severity] || ''}`}>{c.severity}</Badge>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {c.linkedTicketId && <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 hidden sm:flex"><Ticket className="w-2.5 h-2.5 mr-0.5" />Ticket</Badge>}
          {hasAttachments && <Badge variant="outline" className="text-[10px] text-gray-500 hidden sm:flex"><Paperclip className="w-2.5 h-2.5 mr-0.5" />{c.attachments.length}</Badge>}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Page ─── */
export default function HelpCenterPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('tickets');
  const [gridMode, setGridMode] = useState(false);

  // Detail view: null | { type: 'ticket', id } | { type: 'complaint', id }
  const [detailView, setDetailView] = useState(null);

  // ── Ticket form ──
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  // ── Complaint form ──
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cCategory, setCCategory] = useState('');
  const [cSeverity, setCSeverity] = useState('medium');
  const [cAttachments, setCAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Data ──
  const { data: ticketStats } = useSupportCustomerStats(userId, { refetchInterval: 30000 });
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const createTicketMutation = useCreateSupportTicket();
  const { data: complaintsRaw, isLoading: complaintsLoading, refetch: refetchComplaints } = useCustomerComplaints(userId, { refetchInterval: 30000 });
  const createComplaintMutation = useCreateCustomerComplaint();

  const complaints = useMemo(() => Array.isArray(complaintsRaw) ? complaintsRaw : [], [complaintsRaw]);

  React.useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await supportApi.getCustomerTickets(userId);
        const raw = res?.data ?? res;
        setTickets(Array.isArray(raw) ? raw : []);
      } catch (e) { console.error(e); }
      finally { setTicketsLoading(false); }
    })();
  }, [userId]);

  // ── Stats ──
  const stats = useMemo(() => {
    const openTickets = ticketStats?.byStatus?.open || 0;
    const inProgressTickets = ticketStats?.byStatus?.['in-progress'] || 0;
    const pendingComplaints = complaints.filter(c => c.status === 'new' || c.status === 'investigating').length;
    const resolvedAll = (ticketStats?.byStatus?.resolved || 0) + complaints.filter(c => c.status === 'resolved').length;
    const totalAll = (ticketStats?.total || 0) + complaints.length;
    return { openTickets, inProgressTickets, pendingComplaints, resolvedAll, totalAll };
  }, [ticketStats, complaints]);

  // ── Ticket submit ──
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketCategory || !ticketMessage.trim()) {
      showAlert('Please fill all fields', 'error'); return;
    }
    try {
      await createTicketMutation.mutateAsync({ subject: ticketSubject.trim(), category: ticketCategory, message: ticketMessage.trim(), customerId: userId });
      showAlert('Ticket submitted!', 'success');
      setTicketSubject(''); setTicketCategory(''); setTicketMessage('');
      setActiveTab('tickets');
      const res = await supportApi.getCustomerTickets(userId);
      const raw = res?.data ?? res;
      setTickets(Array.isArray(raw) ? raw : []);
    } catch (e) { showAlert(e.message, 'error'); }
  };

  // ── Complaint file upload ──
  const handleFileSelect = useCallback(async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;
    const remaining = 5 - cAttachments.length;
    if (remaining <= 0) { showAlert('Maximum 5 attachments allowed', 'error'); return; }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const results = await Promise.all(toUpload.map(async (f) => {
        const localPreview = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
        const result = await complaintApi.uploadAttachment(f);
        return { ...result, localPreview };
      }));
      setCAttachments(prev => [...prev, ...results]);
    } catch (e) {
      showAlert(e.message || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [cAttachments, showAlert]);

  // ── Complaint submit ──
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!cTitle.trim() || !cCategory || !cDescription.trim()) {
      showAlert('Please fill all required fields', 'error'); return;
    }
    try {
      await createComplaintMutation.mutateAsync({
        title: cTitle.trim(), description: cDescription.trim(), category: cCategory, severity: cSeverity,
        customerId: userId,
        customerName: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || userData?.username || 'Customer',
        customerEmail: userData?.email || '',
        customerPhone: userData?.phone_number || '',
        attachments: cAttachments,
      });
      showAlert('Complaint submitted successfully!', 'success');
      setCTitle(''); setCDescription(''); setCCategory(''); setCSeverity('medium'); setCAttachments([]);
      setActiveTab('complaints');
      refetchComplaints();
    } catch (e) { showAlert(e.message, 'error'); }
  };

  // ── Detail views ──
  if (detailView?.type === 'ticket') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <TicketDetailView ticketId={detailView.id} userId={userId} userData={userData} onBack={() => setDetailView(null)} />
      </div>
    );
  }
  if (detailView?.type === 'complaint') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ComplaintDetailView complaintId={detailView.id} onBack={() => setDetailView(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
            <p className="text-sm text-gray-500">Tickets, complaints, and support requests</p>
          </div>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 hidden sm:flex items-center gap-1.5"
          onClick={() => setActiveTab('new')}>
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Open Tickets', value: stats.openTickets, color: 'text-amber-600', icon: Ticket, bg: 'bg-amber-50', iconColor: 'text-amber-400' },
          { label: 'Pending Complaints', value: stats.pendingComplaints, color: 'text-orange-600', icon: MessageSquareWarning, bg: 'bg-orange-50', iconColor: 'text-orange-400' },
          { label: 'Resolved', value: stats.resolvedAll, color: 'text-emerald-600', icon: CheckCircle, bg: 'bg-emerald-50', iconColor: 'text-emerald-400' },
          { label: 'Total Requests', value: stats.totalAll, color: 'text-gray-700', icon: MessageSquare, bg: 'bg-gray-50', iconColor: 'text-gray-400' },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color} mt-0.5`}>{s.value}</p>
                </div>
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="tickets" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              My Tickets
              {tickets.length > 0 && <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-semibold">{tickets.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-white data-[state=active]:text-amber-700">
              <MessageSquareWarning className="w-3.5 h-3.5 mr-1.5" />
              My Complaints
              {complaints.length > 0 && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-semibold">{complaints.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Request
            </TabsTrigger>
          </TabsList>

          {(activeTab === 'tickets' || activeTab === 'complaints') && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setGridMode(false)}
                className={`p-1.5 rounded-md transition-colors ${!gridMode ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setGridMode(true)}
                className={`p-1.5 rounded-md transition-colors ${gridMode ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── My Tickets ── */}
        <TabsContent value="tickets" className="mt-4">
          {ticketsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border py-16">
              <EmptySewerComponent variant="no-tickets" title="No tickets yet" subtitle="Submit a support ticket to get help from our team" size="md"
                action={{ label: 'Create Ticket', onClick: () => setActiveTab('new') }} />
            </div>
          ) : gridMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tickets.map((t) => <TicketRow key={t._id} t={t} gridMode onClick={() => setDetailView({ type: 'ticket', id: t._id })} />)}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {tickets.map((t) => <TicketRow key={t._id} t={t} gridMode={false} onClick={() => setDetailView({ type: 'ticket', id: t._id })} />)}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── My Complaints ── */}
        <TabsContent value="complaints" className="mt-4">
          {complaintsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border py-16">
              <EmptySewerComponent variant="no-tickets" title="No complaints yet" subtitle="Submit a complaint and our team will investigate promptly" size="md"
                action={{ label: 'Submit Complaint', onClick: () => setActiveTab('new') }} />
            </div>
          ) : gridMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complaints.map((c) => <ComplaintRow key={c._id} c={c} gridMode onClick={() => setDetailView({ type: 'complaint', id: c._id })} />)}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Severity</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {complaints.map((c) => <ComplaintRow key={c._id} c={c} gridMode={false} onClick={() => setDetailView({ type: 'complaint', id: c._id })} />)}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── New Request ── */}
        <TabsContent value="new" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Support Ticket */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Support Ticket</CardTitle>
                    <CardDescription className="text-xs">Get help from our support team</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Subject <span className="text-red-500">*</span></Label>
                    <Input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Brief summary of your issue" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category <span className="text-red-500">*</span></Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select category…" /></SelectTrigger>
                      <SelectContent>
                        {TICKET_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Message <span className="text-red-500">*</span></Label>
                    <Textarea value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your issue in detail…" rows={4} className="resize-none text-sm" />
                  </div>
                  <Button type="submit" size="sm" disabled={createTicketMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {createTicketMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Complaint */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Submit Complaint</CardTitle>
                    <CardDescription className="text-xs">Raise a formal complaint for investigation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleComplaintSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title <span className="text-red-500">*</span></Label>
                    <Input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="Brief summary of your complaint" className="h-8 text-sm" maxLength={200} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Category <span className="text-red-500">*</span></Label>
                      <Select value={cCategory} onValueChange={setCCategory}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Category…" /></SelectTrigger>
                        <SelectContent>
                          {COMPLAINT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Severity</Label>
                      <Select value={cSeverity} onValueChange={setCSeverity}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                    <Textarea value={cDescription} onChange={(e) => setCDescription(e.target.value)}
                      placeholder="Describe your complaint in detail…" rows={4} className="resize-none text-sm" maxLength={3000} />
                  </div>
                  {/* Attachment zone */}
                  <div className="space-y-2">
                    {cAttachments.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {cAttachments.map((att, i) => {
                          const isImg = att.mimetype?.startsWith('image/');
                          return (
                            <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                              {isImg ? (
                                <img src={att.localPreview || fileProxyUrl(att.filename)} alt={att.originalname} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="text-[9px] text-gray-500 text-center truncate w-full">{att.originalname || att.filename}</span>
                                </div>
                              )}
                              <button type="button" onClick={() => setCAttachments(prev => prev.filter((_, j) => j !== i))}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          );
                        })}
                        {cAttachments.length < 5 && (
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-gray-400 hover:text-emerald-600">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    )}
                    {cAttachments.length === 0 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all">
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Paperclip className="w-4 h-4" /> Attach images or files (optional)</>}
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,video/mp4,video/quicktime" className="hidden" onChange={handleFileSelect} />
                  </div>
                  <Button type="submit" size="sm" disabled={createComplaintMutation.isPending || uploading} className="w-full bg-amber-600 hover:bg-amber-700">
                    {createComplaintMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                    Submit Complaint
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
