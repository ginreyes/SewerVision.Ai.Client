"use client";

import React, { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus,
  Filter, PieChart, CheckCircle2, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROJECTS = [
  { id: "1", name: "Main St Sewer — Segment A", budget: 48000, spent: 31200, status: "active", categories: { Labour: 18000, Equipment: 8000, Materials: 3500, Travel: 1700 } },
  { id: "2", name: "Oak Avenue Junction", budget: 32000, spent: 32800, status: "over-budget", categories: { Labour: 19000, Equipment: 7500, Materials: 4000, Travel: 2300 } },
  { id: "3", name: "River Rd Culvert", budget: 55000, spent: 12000, status: "active", categories: { Labour: 7000, Equipment: 3000, Materials: 1500, Travel: 500 } },
  { id: "4", name: "Industrial Park Catchment", budget: 27000, spent: 26100, status: "active", categories: { Labour: 15000, Equipment: 6500, Materials: 3200, Travel: 1400 } },
  { id: "5", name: "Westfield Residential", budget: 19000, spent: 19000, status: "completed", categories: { Labour: 11000, Equipment: 4000, Materials: 2800, Travel: 1200 } },
];

const CAT_COLORS = { Labour: "bg-blue-500", Equipment: "bg-purple-500", Materials: "bg-amber-500", Travel: "bg-teal-500" };
const STATUS_COLORS = {
  active: "bg-blue-100 text-blue-700 border-blue-200",
  "over-budget": "bg-red-100 text-red-700 border-red-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function BudgetTracker() {
  const [selected, setSelected] = useState("1");
  const selectedProject = PROJECTS.find(p => p.id === selected);

  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent = PROJECTS.reduce((s, p) => s + p.spent, 0);
  const overBudget = PROJECTS.filter(p => p.spent > p.budget).length;
  const pctUsed = Math.round((totalSpent / totalBudget) * 100);

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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Budget", value: `$${(totalBudget/1000).toFixed(0)}k`, icon: DollarSign, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Total Spent", value: `$${(totalSpent/1000).toFixed(0)}k`, icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Budget Used", value: `${pctUsed}%`, icon: PieChart, bg: pctUsed > 90 ? "bg-red-50" : "bg-emerald-50", color: pctUsed > 90 ? "text-red-600" : "text-emerald-600" },
          { label: "Over Budget", value: overBudget, icon: AlertTriangle, bg: overBudget > 0 ? "bg-red-50" : "bg-gray-50", color: overBudget > 0 ? "text-red-600" : "text-gray-400" },
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

      <div className="flex gap-4">
        {/* Project list */}
        <div className="w-72 shrink-0 space-y-2">
          {PROJECTS.map(p => {
            const pct = Math.round((p.spent / p.budget) * 100);
            const over = p.spent > p.budget;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selected === p.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">{p.name}</p>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>${p.spent.toLocaleString()}</span>
                  <span className={over ? "text-red-600 font-medium" : ""}>{pct}% of ${p.budget.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Project detail */}
        {selectedProject && (
          <div className="flex-1 min-w-0 space-y-3">
            <Card className="border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{selectedProject.name}</h2>
                    <Badge variant="outline" className={`mt-1 ${STATUS_COLORS[selectedProject.status]}`}>{selectedProject.status}</Badge>
                  </div>
                  {selectedProject.spent > selectedProject.budget && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />Over budget by ${(selectedProject.spent - selectedProject.budget).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Budget bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Spent: <strong>${selectedProject.spent.toLocaleString()}</strong></span>
                    <span className="text-gray-500">Budget: ${selectedProject.budget.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${selectedProject.spent > selectedProject.budget ? "bg-red-500" : "bg-indigo-500"}`}
                      style={{ width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Remaining: ${Math.max(0, selectedProject.budget - selectedProject.spent).toLocaleString()}</p>
                </div>

                {/* Category breakdown */}
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Expense Categories</h3>
                <div className="space-y-2.5">
                  {Object.entries(selectedProject.categories).map(([cat, amt]) => {
                    const pct = Math.round((amt / selectedProject.spent) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${CAT_COLORS[cat]}`} />{cat}
                          </span>
                          <span className="text-gray-600">${amt.toLocaleString()} <span className="text-gray-400">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${CAT_COLORS[cat]}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
