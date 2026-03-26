"use client";

import React, { memo } from "react";
import { Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSeverityColor, getCategoryIcon, parseGrade } from "./DataTypes";

/**
 * DefectCard - list item for the defect library
 *
 * Features:
 * - Left severity color stripe
 * - Category icon
 * - Code badge, name, PACP code, grade badge
 * - Description preview (single line)
 * - Favorite toggle
 *
 * @param {{ defect: object, isSelected: boolean, onSelect: () => void, onToggleFavorite: (id: string) => void, isFavorite: boolean }} props
 */
const DefectCard = memo(function DefectCard({ defect, isSelected, onSelect, onToggleFavorite, isFavorite }) {
  const id = defect.id || defect._id;
  const gradeNum = parseGrade(defect.grade);
  const colors = getSeverityColor(gradeNum);
  const CategoryIcon = getCategoryIcon(defect.category);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`group w-full text-left flex items-stretch rounded-xl border transition-all overflow-hidden cursor-pointer ${
        isSelected
          ? "border-rose-300 bg-rose-50/60 shadow-sm"
          : "border-gray-200 bg-white hover:border-rose-200 hover:shadow-sm"
      }`}
    >
      {/* Severity color stripe */}
      <div className={`w-1.5 shrink-0 ${colors.stripe} rounded-l-xl`} />

      <div className="flex items-center gap-3 p-3 flex-1 min-w-0">
        {/* Category icon + code */}
        <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0 gap-0.5">
          <CategoryIcon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600 leading-none">{defect.code}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{defect.name || defect.description}</span>
            <Badge variant="outline" className="text-[10px] bg-gray-50 shrink-0">
              {defect.pacp || defect.code}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
            >
              Grade {gradeNum}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{defect.description}</p>
        </div>

        {/* Category tag */}
        <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 shrink-0 hidden sm:inline">
          {defect.category}
        </span>

        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(id);
          }}
          className={`shrink-0 p-1 rounded transition-colors ${
            isFavorite
              ? "text-amber-500 hover:text-amber-600"
              : "text-gray-300 hover:text-amber-400 opacity-0 group-hover:opacity-100"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Chevron */}
        <ChevronRight
          className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${
            isSelected ? "rotate-90" : ""
          }`}
        />
      </div>
    </div>
  );
});

DefectCard.displayName = "DefectCard";

export default DefectCard;
