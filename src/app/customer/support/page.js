'use client';

import React, { useState, useMemo } from 'react';
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  ChevronRight,
  Send,
  Loader2,
  ArrowLeft,
  User,
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
import {
  useSupportCustomerStats,
  useCreateSupportTicket,
  useSupportTicket,
  useAddTicketResponse,
} from '@/hooks/useQueryHooks';
import supportApi from '@/data/supportApi';

const STATUS_COLORS = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICONS = { open: AlertCircle, 'in-progress': Clock, resolved: CheckCircle, closed: XCircle };

const CATEGORIES = [
  { value: 'report', label: 'Report Issue' },
  { value: 'project', label: 'Project Inquiry' },
  { value: 'account', label: 'Account Help' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

/* ─── Ticket Detail View ─── */
function TicketDetailView({ ticketId, userId, onBack }) {
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState('');
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const responseMutation = useAddTicketResponse();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await responseMutation.mutateAsync({ ticketId, text: replyText.trim(), senderId: userId, senderRole: 'customer' });
      setReplyText('');
      showAlert('Reply sent', 'success');
    } catch (e) { showAlert(e.message, 'error'); }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>;
  if (!ticket) return <div className="text-center py-16 text-gray-500">Ticket not found</div>;

  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back to tickets</Button>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{ticket.subject}</h3>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge className={`${STATUS_COLORS[ticket.status]} text-xs`}><StatusIcon className="w-3 h-3 mr-1 inline" />{ticket.status}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{ticket.priority} priority</Badge>
            <span className="text-xs text-gray-400">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      {ticket.responses?.length > 0 && (
        <div className="space-y-3">
          {ticket.responses.map((resp, idx) => {
            const sender = resp.senderId;
            const senderName = sender?.first_name ? `${sender.first_name} ${sender.last_name || ''}` : 'Support';
            const isSupport = resp.senderRole !== 'customer';
            return (
              <Card key={idx} className={isSupport ? 'ml-6' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSupport ? 'bg-teal-100' : 'bg-emerald-100'}`}>
                      <User className={`w-3 h-3 ${isSupport ? 'text-teal-600' : 'text-emerald-600'}`} />
                    </div>
                    <span className="text-sm font-medium">{senderName}</span>
                    <Badge variant="outline" className="text-[10px]">{resp.senderRole}</Badge>
                    <span className="text-xs text-gray-400">{resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{resp.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply */}
      {ticket.status !== 'closed' && (
        <Card>
          <CardContent className="p-4">
            <Textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} className="mb-3" />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleReply} disabled={!replyText.trim() || responseMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {responseMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function CustomerSupportPage() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const { data: stats } = useSupportCustomerStats(userId, { refetchInterval: 30000 });
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const createMutation = useCreateSupportTicket();

  // Fetch tickets
  React.useEffect(() => {
    if (!userId) return;
    const fetchTickets = async () => {
      try {
        const res = await supportApi.getCustomerTickets(userId);
        const raw = res?.data ?? res;
        setTickets(Array.isArray(raw) ? raw : []);
      } catch (e) { console.error(e); }
      finally { setTicketsLoading(false); }
    };
    fetchTickets();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !category || !message.trim()) {
      showAlert('Please fill all fields', 'error');
      return;
    }
    try {
      await createMutation.mutateAsync({ subject: subject.trim(), category, message: message.trim(), customerId: userId });
      showAlert('Ticket submitted!', 'success');
      setSubject(''); setCategory(''); setMessage('');
      setActiveTab('tickets');
      // Refresh tickets
      const res = await supportApi.getCustomerTickets(userId);
      const raw = res?.data ?? res;
      setTickets(Array.isArray(raw) ? raw : []);
    } catch (e) { showAlert(e.message, 'error'); }
  };

  const statusCounts = useMemo(() => ({
    open: stats?.byStatus?.open || 0,
    inProgress: stats?.byStatus?.['in-progress'] || 0,
    resolved: stats?.byStatus?.resolved || 0,
    total: stats?.total || 0,
  }), [stats]);

  // Ticket detail view
  if (selectedTicketId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <TicketDetailView ticketId={selectedTicketId} userId={userId} onBack={() => setSelectedTicketId(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Support Center</h1>
            <p className="text-sm text-gray-500">Get help and track your support requests</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: statusCounts.open, color: 'text-amber-600', icon: AlertCircle },
          { label: 'In Progress', value: statusCounts.inProgress, color: 'text-blue-600', icon: Clock },
          { label: 'Resolved', value: statusCounts.resolved, color: 'text-emerald-600', icon: CheckCircle },
          { label: 'Total', value: statusCounts.total, color: 'text-gray-700', icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-5 h-5 ${s.color} opacity-40`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="new">New Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          {ticketsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border py-16">
              <EmptySewerComponent variant="no-tickets" title="No tickets yet" subtitle="Submit a support ticket to get help" size="md"
                action={{ label: "Create Ticket", onClick: () => setActiveTab('new') }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const StatusIcon = STATUS_ICONS[t.status] || AlertCircle;
                return (
                  <Card key={t._id} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicketId(t._id)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${STATUS_COLORS[t.status]} text-[10px]`}><StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />{t.status}</Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{t.category}</Badge>
                          <span className="text-[10px] text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
                          {t.responses?.length > 0 && <Badge variant="secondary" className="text-[10px]">{t.responses.length} replies</Badge>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submit a Support Ticket</CardTitle>
              <CardDescription>Describe your issue and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Subject <span className="text-red-500">*</span></Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Message <span className="text-red-500">*</span></Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} className="resize-none" />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
