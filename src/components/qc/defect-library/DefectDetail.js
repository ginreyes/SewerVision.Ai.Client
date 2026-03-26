"use client";

import React, { memo, useState } from "react";
import {
  Info, Eye, Shield, Pencil, ImageIcon, BarChart3, Link2, StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSeverityColor, parseGrade, GRADE_BAR_COLORS, GRADE_LABELS, getCategoryIcon } from "./DataTypes";

/**
 * Visual severity grade bar - a 5-segment horizontal bar with active grade highlighted
 */
function SeverityGradeBar({ grade }) {
  const gradeNum = parseGrade(grade);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Severity Level
        </span>
        <span className="text-[10px] font-medium text-gray-500">
          {GRADE_LABELS[gradeNum - 1] || "Unknown"}
        </span>
      </div>
      <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
        {GRADE_BAR_COLORS.map((color, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${
              i < gradeNum ? color : "bg-gray-100"
            } ${i === gradeNum - 1 ? "ring-1 ring-offset-1 ring-gray-300" : ""}`}
          />
        ))}
      </div>
      <div className="flex justify-between px-0.5">
        {[1, 2, 3, 4, 5].map((g) => (
          <span
            key={g}
            className={`text-[9px] ${
              g === gradeNum ? "font-bold text-gray-700" : "text-gray-300"
            }`}
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * DefectDetail - expanded detail panel for selected defect
 */
const DefectDetail = memo(function DefectDetail({
  defect,
  relatedDefects = [],
  onEdit,
  onSelectRelated,
  personalNote,
  onSaveNote,
}) {
  const [noteText, setNoteText] = useState(personalNote || "");
  const [noteEditing, setNoteEditing] = useState(false);
  const gradeNum = parseGrade(defect.grade);
  const colors = getSeverityColor(gradeNum);
  const CategoryIcon = getCategoryIcon(defect.category);

  const handleSaveNote = () => {
    onSaveNote?.(defect.id || defect._id, noteText);
    setNoteEditing(false);
  };

  return (
    <Card className="border-gray-200 sticky top-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <span className={`text-sm font-bold ${colors.text}`}>{defect.code}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {defect.name || defect.description}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className="text-[10px]">
                {defect.pacp || defect.code}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] ${colors.bg} ${colors.text} ${colors.border}`}
              >
                Grade {gradeNum}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-gray-50">
                <CategoryIcon className="w-2.5 h-2.5 mr-0.5" />
                {defect.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-7 w-7 text-gray-400 hover:text-rose-600"
            onClick={() => onEdit?.(defect)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Severity grade bar */}
        <SeverityGradeBar grade={defect.grade} />

        {/* Description */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Description
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">{defect.description}</p>
        </div>

        {/* Example */}
        {defect.example && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Example
            </p>
            <p className="text-xs text-gray-600 italic">{defect.example}</p>
          </div>
        )}

        {/* Image placeholder */}
        <div className="border border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/50">
          <ImageIcon className="w-6 h-6 text-gray-300 mb-1" />
          <p className="text-[10px] text-gray-400">Defect example image</p>
          <p className="text-[9px] text-gray-300">Coming soon</p>
        </div>

        {/* Recommended action */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Recommended Action
          </p>
          <p className="text-xs text-amber-800">
            {defect.action || defect.recommendedAction || "No action specified"}
          </p>
        </div>

        {/* Occurrence stats placeholder */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Occurrence Stats
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-300">--</p>
              <p className="text-[9px] text-gray-400">This month</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-300">--</p>
              <p className="text-[9px] text-gray-400">Avg/project</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-300">--</p>
              <p className="text-[9px] text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Personal notes */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <StickyNote className="w-3 h-3" />
            Personal Notes
          </p>
          {noteEditing ? (
            <div className="space-y-1.5">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your notes about this defect..."
                className="text-xs min-h-[60px] resize-none"
              />
              <div className="flex gap-1.5 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => {
                    setNoteText(personalNote || "");
                    setNoteEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-2 bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleSaveNote}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNoteEditing(true)}
              className="w-full text-left text-xs text-gray-400 italic border border-dashed border-gray-200 rounded-lg p-2 hover:border-rose-300 hover:text-gray-500 transition-colors"
            >
              {noteText || "Click to add notes..."}
            </button>
          )}
        </div>

        {/* Related defects */}
        {relatedDefects.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Related Defects
            </p>
            <div className="space-y-1">
              {relatedDefects.map((rd) => {
                const rdId = rd.id || rd._id;
                const rdGrade = parseGrade(rd.grade);
                const rdColors = getSeverityColor(rdGrade);
                return (
                  <button
                    key={rdId}
                    onClick={() => onSelectRelated?.(rdId)}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-colors text-left"
                  >
                    <div className={`w-1 h-6 rounded-full ${rdColors.stripe}`} />
                    <span className="text-[10px] font-bold text-gray-500">{rd.code}</span>
                    <span className="text-[10px] text-gray-600 flex-1 truncate">
                      {rd.name || rd.description}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${rdColors.bg} ${rdColors.text} ${rdColors.border}`}
                    >
                      G{rdGrade}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DefectDetail.displayName = "DefectDetail";

export default DefectDetail;
