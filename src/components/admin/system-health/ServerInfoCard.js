"use client";

import React from "react";
import { Globe, Server, HardDrive, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ServerInfoCard({ resources }) {
  const uptime = resources?.uptime || {};
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2"><CardTitle className="text-xs">Server Info</CardTitle></CardHeader>
      <CardContent className="pt-0 space-y-2 text-xs">
        {resources?.platform && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1"><Globe className="w-3 h-3" />Platform</span>
            <span className="text-gray-800 font-medium">{resources.platform}</span>
          </div>
        )}
        {resources?.nodeVersion && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1"><Server className="w-3 h-3" />Node.js</span>
            <span className="text-gray-800 font-medium">{resources.nodeVersion}</span>
          </div>
        )}
        {resources?.hostname && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1"><HardDrive className="w-3 h-3" />Host</span>
            <span className="text-gray-800 font-medium truncate max-w-[140px]">{resources.hostname}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Uptime</span>
          <span className="text-gray-800 font-medium">{uptime.days || 0}d {uptime.hours || 0}h {uptime.minutes || 0}m</span>
        </div>
      </CardContent>
    </Card>
  );
}
