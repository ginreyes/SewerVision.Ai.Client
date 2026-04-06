"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  DollarSign, TrendingUp, AlertTriangle, Plus,
  PieChart, Loader2, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useUserBudgets, useAddExpense } from "@/hooks/useQueryHooks";
import { BudgetCard, CategoryBar, CAT_COLORS, STATUS_COLORS } from "@/components/user/budget-tracker";

export default function BudgetTracker() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { data, isLoading } = useUserBudgets(userId);
  const addExpense = useAddExpense();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: "", amount: "", description: "" });

  const projects = useMemo(() => Array.isArray(data) ? data : (data?.data || []), [data]);

  const [selected, setSelected] = useState(null);

  const selectedProject = useMemo(
    () => projects.find(p => (p._id || p.id) === selected) ?? projects[0] ?? null,
    [projects, selected]
  );

  // Auto-select first project when data arrives
  const effectiveSelected = selectedProject?.id ?? null;

  const stats = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const overBudget = projects.filter(p => p.spent > p.budget).length;
    const pctUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    return { totalBudget, totalSpent, overBudget, pctUsed };
  }, [projects]);

  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-sm text-gray-500">Per-project budget tracking with estimated vs actual costs</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          onClick={() => { setExpenseForm({ category: "", amount: "", description: "" }); setShowExpenseForm(true); }}>
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Budget", value: `$${(stats.totalBudget / 1000).toFixed(0)}k`, icon: DollarSign, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Total Spent", value: `$${(stats.totalSpent / 1000).toFixed(0)}k`, icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Budget Used", value: `${stats.pctUsed}%`, icon: PieChart, bg: stats.pctUsed > 90 ? "bg-red-50" : "bg-emerald-50", color: stats.pctUsed > 90 ? "text-red-600" : "text-emerald-600" },
          { label: "Over Budget", value: stats.overBudget, icon: AlertTriangle, bg: stats.overBudget > 0 ? "bg-red-50" : "bg-gray-50", color: stats.overBudget > 0 ? "text-red-600" : "text-gray-400" },
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

      {projects.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center text-gray-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects with budgets found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4">
          {/* Project list */}
          <div className="w-72 shrink-0 space-y-2">
            {projects.map(p => (
              <BudgetCard
                key={p.id}
                project={p}
                isSelected={effectiveSelected === p.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Project detail */}
          {selectedProject && (
            <div className="flex-1 min-w-0 space-y-3">
              <Card className="border-gray-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedProject.name}</h2>
                      <Badge variant="outline" className={`mt-1 ${STATUS_COLORS[selectedProject.status]}`}>
                        {selectedProject.status}
                      </Badge>
                    </div>
                    {selectedProject.spent > selectedProject.budget && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Over budget by ${(selectedProject.spent - selectedProject.budget).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Budget bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">
                        Spent: <strong>${selectedProject.spent.toLocaleString()}</strong>
                      </span>
                      <span className="text-gray-500">Budget: ${selectedProject.budget.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedProject.spent > selectedProject.budget ? "bg-red-500" : "bg-indigo-500"
                        }`}
                        style={{
                          width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Remaining: ${Math.max(0, selectedProject.budget - selectedProject.spent).toLocaleString()}
                    </p>
                  </div>

                  {/* Category breakdown */}
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Expense Categories
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(selectedProject.categories || {}).map(([cat, amt]) => (
                      <CategoryBar
                        key={cat}
                        category={cat}
                        amount={amt}
                        total={selectedProject.spent}
                        color={CAT_COLORS[cat] || "bg-gray-500"}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {selectedProject && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                Project: <span className="font-medium text-gray-700">{selectedProject.name}</span>
              </div>
            )}
            <div>
              <Label>Category</Label>
              <Select value={expenseForm.category} onValueChange={v => setExpenseForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  {["Labor", "Materials", "Equipment", "Travel", "Permits", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" min="0" step="0.01" value={expenseForm.amount}
                onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={expenseForm.description}
                onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Equipment rental for site A" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!expenseForm.category || !expenseForm.amount || !selectedProject || addExpense.isPending}
                onClick={() => {
                  addExpense.mutate({
                    budgetId: selectedProject._id || selectedProject.id,
                    category: expenseForm.category,
                    amount: parseFloat(expenseForm.amount),
                    description: expenseForm.description,
                  }, {
                    onSuccess: () => { showAlert("Expense added", "success"); setShowExpenseForm(false); },
                    onError: (e) => showAlert(e.message || "Failed to add expense", "error"),
                  });
                }}>
                {addExpense.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
