"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard, DollarSign, Plus, Search,
  CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { CollectionRateBar, InvoiceTable, SEED_INVOICES } from "@/components/admin/billing";

export default function BillingInvoicing() {
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ customer: "", amount: "", tier: "Standard", due: "" });
  const [invoices, setInvoices] = useState(SEED_INVOICES);

  const filtered = useMemo(() => invoices.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.customer.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q);
    }
    return true;
  }), [invoices, statusFilter, search]);

  const stats = useMemo(() => ({
    total: invoices.reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
  }), [invoices]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Billing & Invoicing</h1>
            <p className="text-sm text-gray-500">Generate invoices, track payments, and manage subscription tiers</p>
          </div>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
          onClick={() => { setInvoiceForm({ customer: "", amount: "", tier: "Standard", due: "" }); setShowInvoiceForm(true); }}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Billed", value: `$${stats.total.toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50", icon: DollarSign },
          { label: "Collected", value: `$${stats.paid.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Pending", value: `$${stats.pending.toLocaleString()}`, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Overdue", value: `$${stats.overdue.toLocaleString()}`, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collection rate */}
      <CollectionRateBar stats={stats} />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        {["all", "paid", "pending", "overdue", "draft"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize transition-colors ${statusFilter === s ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <InvoiceTable invoices={filtered} />

      {/* New Invoice Dialog */}
      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Customer</Label>
              <Input value={invoiceForm.customer} onChange={e => setInvoiceForm(f => ({ ...f, customer: e.target.value }))}
                placeholder="e.g. Hydro Corp" className="mt-1" />
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" min="0" step="0.01" value={invoiceForm.amount}
                onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={invoiceForm.tier} onValueChange={v => setInvoiceForm(f => ({ ...f, tier: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Standard", "Professional", "Enterprise"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={invoiceForm.due}
                onChange={e => setInvoiceForm(f => ({ ...f, due: e.target.value }))}
                className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowInvoiceForm(false)}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={!invoiceForm.customer || !invoiceForm.amount}
                onClick={() => {
                  setInvoices(prev => [...prev, {
                    id: `INV-${String(prev.length + 48).padStart(4, '0')}`,
                    customer: invoiceForm.customer,
                    amount: parseFloat(invoiceForm.amount),
                    status: "draft",
                    date: new Date().toISOString().slice(0, 10),
                    due: invoiceForm.due || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                    tier: invoiceForm.tier,
                  }]);
                  showAlert("Invoice created as draft", "success");
                  setShowInvoiceForm(false);
                }}>
                Create Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
