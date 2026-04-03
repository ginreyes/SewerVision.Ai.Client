import React from "react";
import { Car, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, PRIORITY_COLORS } from "./DataTypes";

const SiteCard = React.memo(function SiteCard({ site, index, isSelected, onSelect }) {
  const cfg = STATUS_CONFIG[site.status] || STATUS_CONFIG.pending;

  return (
    <button
      onClick={() => onSelect(site.id)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-blue-300 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${
            site.status === "completed"
              ? "bg-emerald-500"
              : site.status === "in-progress"
              ? "bg-blue-500"
              : "bg-gray-400"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-xs font-semibold text-gray-900 truncate">{site.name}</p>
            <span className={`text-[10px] font-medium ${PRIORITY_COLORS[site.priority] || ""}`}>
              ●
            </span>
          </div>
          <p className="text-[11px] text-gray-400 truncate">{site.address}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
            <span className="flex items-center gap-0.5">
              <Car className="w-3 h-3" />
              {site.distance}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {site.eta}
            </span>
            <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
              {site.status}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
});

export default SiteCard;
