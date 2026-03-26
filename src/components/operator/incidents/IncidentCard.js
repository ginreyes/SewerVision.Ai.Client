import React from "react";
import { MapPin, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEVERITY_COLORS, STATUS_COLORS } from "./DataTypes";

const IncidentCard = React.memo(function IncidentCard({ incident }) {
  return (
    <Card className="border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[incident.severity] || ""}`}>
                {incident.severity}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[incident.status] || ""}`}>
                {incident.status?.replace("-", " ")}
              </Badge>
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                {incident.type}
              </span>
              {incident.notified && (
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" />Admin notified
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{incident.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{incident.description}</p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />{incident.location}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />{incident.date}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default IncidentCard;
