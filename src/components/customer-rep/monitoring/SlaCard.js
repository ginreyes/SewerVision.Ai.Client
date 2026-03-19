"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function SlaCard({ title, value, unit, target, icon: Icon, color, gradient }) {
  return (
    <Card className={`border-0 shadow-sm ${gradient}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
            <p className={`text-3xl font-bold ${color} mt-1`}>
              {value}{unit && <span className="text-lg">{unit}</span>}
            </p>
            {target && <p className="text-xs text-gray-400 mt-1">Target: {target}</p>}
          </div>
          <div className="p-3 rounded-xl bg-white/80">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
