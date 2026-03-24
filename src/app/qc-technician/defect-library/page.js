"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen, Search, AlertTriangle, Filter, ChevronRight, Eye,
  Tag, Shield, AlertCircle, Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEVERITY_COLORS = {
  "Grade 1": "bg-gray-100 text-gray-600 border-gray-200",
  "Grade 2": "bg-blue-100 text-blue-700 border-blue-200",
  "Grade 3": "bg-amber-100 text-amber-700 border-amber-200",
  "Grade 4": "bg-orange-100 text-orange-700 border-orange-200",
  "Grade 5": "bg-red-100 text-red-700 border-red-200",
};

const DEFECTS = [
  { id: "1", code: "FCS", name: "Fine Crack Spiral", pacp: "BC-S", grade: "Grade 2", category: "Cracks", description: "Spiral crack following the pipe axis. Indicates potential ground movement or pipe stress.", action: "Monitor and schedule follow-up inspection within 12 months.", example: "Hairline crack spiraling along pipe wall" },
  { id: "2", code: "FCC", name: "Fine Crack Circumferential", pacp: "BC-C", grade: "Grade 2", category: "Cracks", description: "Circumferential fine crack running perpendicular to the pipe axis.", action: "Monitor with annual inspection.", example: "Ring crack around pipe circumference" },
  { id: "3", code: "FCL", name: "Fine Crack Longitudinal", pacp: "BC-L", grade: "Grade 2", category: "Cracks", description: "Crack running parallel to the pipe axis along its length.", action: "Schedule structural assessment if >500mm length.", example: "Linear crack along pipe length" },
  { id: "4", code: "RI", name: "Root Intrusion", pacp: "RIM", grade: "Grade 3", category: "Roots", description: "Tree or plant roots penetrating through joints or cracks into the pipe interior.", action: "Root removal required. Inspect joint integrity.", example: "Root mass visible blocking 25-50% of pipe flow" },
  { id: "5", code: "RR", name: "Root Intrusion Major", pacp: "RIL", grade: "Grade 5", category: "Roots", description: "Major root intrusion blocking >50% of pipe cross-section.", action: "Immediate root cutting and CIPP lining required.", example: "Dense root mass filling pipe cross-section" },
  { id: "6", code: "JO", name: "Joint Offset", pacp: "JOM", grade: "Grade 3", category: "Joints", description: "Pipe joint has shifted from its original aligned position.", action: "Assess offset degree. Reline or point repair if >25mm.", example: "Visible step at pipe joint connection" },
  { id: "7", code: "DC", name: "Deformed Pipe", pacp: "DFV", grade: "Grade 4", category: "Structural", description: "Pipe cross-section has lost its circular shape due to external loading.", action: "Structural rehabilitation required within 6 months.", example: "Oval or collapsed pipe profile" },
  { id: "8", code: "IN", name: "Infiltration", pacp: "INI", grade: "Grade 2", category: "Infiltration", description: "Groundwater or soil entering pipe through cracks, joints, or holes.", action: "Seal infiltration points. Monitor flow rates.", example: "Active water flow entering pipe from wall" },
  { id: "9", code: "EX", name: "Exfiltration Risk", pacp: "EXF", grade: "Grade 4", category: "Structural", description: "Pipe contents leaking outward into surrounding soil.", action: "Emergency repair or bypass required.", example: "Wet soil visible through pipe defect" },
  { id: "10", code: "SD", name: "Surface Damage", pacp: "SDS", grade: "Grade 1", category: "Surface", description: "Minor surface deterioration not affecting pipe structure.", action: "Record and monitor. No immediate action required.", example: "Paint or coating wear on pipe interior" },
];

const CATEGORIES = ["All", "Cracks", "Roots", "Joints", "Structural", "Infiltration", "Surface"];

export default function DefectLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => DEFECTS.filter(d => {
    if (category !== "All" && d.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.pacp.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
    }
    return true;
  }), [search, category]);

  const selectedDefect = selected ? DEFECTS.find(d => d.id === selected) : null;

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
          {CATEGORIES.map(c => (
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
          {filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d.id === selected ? null : d.id)}
              className={`w-full text-left flex items-center gap-4 p-3.5 rounded-xl border transition-all ${selected === d.id ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200 hover:shadow-sm"}`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-600">{d.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{d.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-gray-50">{d.pacp}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[d.grade]}`}>{d.grade}</Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{d.description}</p>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 shrink-0">{d.category}</span>
              <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${selected === d.id ? "rotate-90" : ""}`} />
            </button>
          ))}
          {filtered.length === 0 && (
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
                      <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[selectedDefect.grade]}`}>{selectedDefect.grade}</Badge>
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
