"use client";

import React from "react";
import { Star } from "lucide-react";

function StarScore({ score }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= stars ? "text-amber-400 fill-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const MemberCard = React.memo(function MemberCard({ member, rank, isSelected, onSelect }) {
  const m = member;

  return (
    <button
      onClick={() => onSelect(m.id)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-indigo-300 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-200"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.color}`}
          >
            {m.avatar}
          </div>
          {rank === 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
              1
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{m.name}</p>
          <p className="text-[10px] text-gray-400 capitalize">{m.role}</p>
        </div>
        <div className="text-right shrink-0">
          <p
            className={`text-xs font-bold ${
              m.trend?.startsWith("+") ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {m.trend}
          </p>
          <StarScore score={m.qualityScore} />
        </div>
      </div>
    </button>
  );
});

export default MemberCard;
