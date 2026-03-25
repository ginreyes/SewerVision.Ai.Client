"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen, Search, AlertTriangle, Filter, ChevronRight, Eye,
  Tag, Shield, AlertCircle, Info, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePacpDefects, usePacpCategories } from "@/hooks/useQueryHooks";

const SEVERITY_COLORS = {
  "Grade 1": "bg-gray-100 text-gray-600 border-gray-200",
  "Grade 2": "bg-blue-100 text-blue-700 border-blue-200",
  "Grade 3": "bg-amber-100 text-amber-700 border-amber-200",
  "Grade 4": "bg-orange-100 text-orange-700 border-orange-200",
  "Grade 5": "bg-red-100 text-red-700 border-red-200",
};

export default function DefectLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data: defectsData, isLoading } = usePacpDefects({
    category: category !== "All" ? category : undefined,
    search: search || undefined,
  });
  const { data: categoriesData = [] } = usePacpCategories();

  const defects = defectsData?.data || defectsData || [];
  const categories = ["All", ...(Array.isArray(categoriesData) ? categoriesData : [])];

  const selectedDefect = selected ? defects.find(d => d.id === selected || d._id === selected) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Defect Library</h1>
          <p className="text-sm text-gray-500">Reference catalog of all defect types with PACP codes, severity, and recommended actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name, code, PACP…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${category === c ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* List */}
        <div className="flex-1 space-y-2">
          {defects.map(d => {
            const id = d.id || d._id;
            return (
              <button key={id} onClick={() => setSelected(id === selected ? null : id)}
                className={`w-full text-left flex items-center gap-4 p-3.5 rounded-xl border transition-all ${selected === id ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200 hover:shadow-sm"}`}>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-600">{d.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{d.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-gray-50">{d.pacp}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[d.grade] || ""}`}>{d.grade}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{d.description}</p>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 shrink-0">{d.category}</span>
                <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${selected === id ? "rotate-90" : ""}`} />
              </button>
            );
          })}
          {defects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <BookOpen className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No defects found</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedDefect && (
          <div className="w-80 shrink-0">
            <Card className="border-gray-200 sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-rose-700">{selectedDefect.code}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{selectedDefect.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{selectedDefect.pacp}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[selectedDefect.grade] || ""}`}>{selectedDefect.grade}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Info className="w-3 h-3" />Description</p>
                    <p className="text-xs text-gray-700">{selectedDefect.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Eye className="w-3 h-3" />Example</p>
                    <p className="text-xs text-gray-600 italic">{selectedDefect.example}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1"><Shield className="w-3 h-3" />Recommended Action</p>
                    <p className="text-xs text-amber-800">{selectedDefect.action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
