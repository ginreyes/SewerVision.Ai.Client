"use client";

import React from "react";
import {
  Send, Eye, Edit, Trash2, Globe, Pin, Loader2,
  Wrench, Sparkles, FileText, AlertTriangle, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ANNOUNCEMENT_TYPE_CONFIG, ALL_ROLES, ROLE_LABELS } from "../constants";

const TYPE_ICONS = {
  maintenance: Wrench,
  feature: Sparkles,
  policy: FileText,
  alert: AlertTriangle,
  general: Bell,
};

export default function AnnouncementList({ announcements, sending, onSend, onEdit, onDelete }) {
  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        <Bell className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">No announcements yet</p>
        <p className="text-xs mt-1">Create your first announcement to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map(a => {
        const typeConfig = ANNOUNCEMENT_TYPE_CONFIG[a.type] || ANNOUNCEMENT_TYPE_CONFIG.general;
        const TypeIcon = TYPE_ICONS[a.type] || Bell;
        return (
          <Card key={a._id} className={`border-gray-200 hover:shadow-sm transition-all ${a.pinned ? "border-l-4 border-l-rose-400" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                    <Badge variant="outline" className={`text-[10px] capitalize ${typeConfig.color}`}>{a.type}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${a.sent ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {a.sent ? `Sent ${a.sentAt ? new Date(a.sentAt).toLocaleDateString() : ""}` : "Draft"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {a.roles?.length === ALL_ROLES.length ? (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Globe className="w-3 h-3" />All roles</span>
                      ) : (
                        (a.roles || []).slice(0, 3).map(r => (
                          <span key={r} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{ROLE_LABELS[r] || r}</span>
                        ))
                      )}
                      {a.roles?.length > 3 && a.roles.length < ALL_ROLES.length && (
                        <span className="text-[10px] text-gray-400">+{a.roles.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{a.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{a.body}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {a.views > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5 mr-1"><Eye className="w-3 h-3" />{a.views}</span>}
                  {!a.sent && (
                    <Button size="sm" variant="outline" onClick={() => onSend(a._id)}
                      disabled={sending === a._id}
                      className="gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs">
                      {sending === a._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}Send
                    </Button>
                  )}
                  <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(a._id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
