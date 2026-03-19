"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, subtitle, icon: Icon, color, gradient, onClick }) {
  return (
    <Card
      className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${gradient || ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-xl bg-white/80 shadow-sm">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
