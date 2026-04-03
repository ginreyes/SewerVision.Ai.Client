"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICE_STATUS_CONFIG } from "../constants";
import LatencyBar from "./LatencyBar";

export default function ServiceCard({ service }) {
  const cfg = SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.online;
  return (
    <Card className="border-gray-200">
      <CardContent className="p-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium text-gray-900">{service.name}</span>
                {service.description && <span className="text-[10px] text-gray-400 ml-2">{service.description}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{service.status}</Badge>
                <span className="text-[11px] text-gray-400">{service.uptime}% uptime</span>
              </div>
            </div>
            {service.latency > 0 && <LatencyBar ms={service.latency} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
