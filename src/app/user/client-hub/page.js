"use client";

import React, { useState, useRef } from "react";
import {
  MessageCircle, Send, Paperclip, Search, Plus, Building,
  CheckCheck, Clock, Circle, User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";

const CONVERSATIONS = [
  { id: "1", customer: "Hydro Corp", project: "PRJ-0087", avatar: "HC", color: "bg-blue-500", lastMsg: "Can we get an update on the Main St segment?", time: "10:23", unread: 2, online: true },
  { id: "2", customer: "City Council", project: "PRJ-0088", avatar: "CC", color: "bg-indigo-500", lastMsg: "The report has been approved. Thank you.", time: "Yesterday", unread: 0, online: false },
  { id: "3", customer: "Greenfield LLC", project: "PRJ-0089", avatar: "GL", color: "bg-emerald-500", lastMsg: "Please confirm the inspection date.", time: "Mar 23", unread: 1, online: false },
  { id: "4", customer: "Metro Water", project: "PRJ-0090", avatar: "MW", color: "bg-teal-500", lastMsg: "We need the final deliverables ASAP.", time: "Mar 22", unread: 0, online: true },
];

const MESSAGES = {
  "1": [
    { id: "m1", from: "customer", text: "Hi, can we get an update on the Main St segment progress?", time: "10:15" },
    { id: "m2", from: "me", text: "Hello! We're currently at 65% completion on Segment A. The inspection is expected to wrap up by end of week.", time: "10:18" },
    { id: "m3", from: "customer", text: "Great to hear. Will the QC review be done by Friday?", time: "10:20" },
    { id: "m4", from: "customer", text: "Can we get an update on the Main St segment?", time: "10:23" },
  ],
  "2": [
    { id: "m1", from: "me", text: "Hi, attaching the draft report for Oak Ave Junction for your review.", time: "Yesterday 14:00" },
    { id: "m2", from: "customer", text: "The report has been approved. Thank you.", time: "Yesterday 16:30" },
  ],
  "3": [
    { id: "m1", from: "customer", text: "Please confirm the inspection date.", time: "Mar 23" },
  ],
  "4": [
    { id: "m1", from: "customer", text: "We need the final deliverables ASAP.", time: "Mar 22" },
  ],
};

export default function ClientHub() {
  const { showAlert } = useAlert();
  const [selected, setSelected] = useState("1");
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const conv = CONVERSATIONS.find(c => c.id === selected);
  const convoMessages = messages[selected] || [];

  const filtered = CONVERSATIONS.filter(c => !search ||
    c.customer.toLowerCase().includes(search.toLowerCase()) ||
    c.project.toLowerCase().includes(search.toLowerCase()));

  function handleSend() {
    if (!input.trim()) return;
    setMessages(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), { id: `m${Date.now()}`, from: "me", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }],
    }));
    setInput("");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Communication Hub</h1>
          <p className="text-sm text-gray-500">Direct messaging with assigned customers per project</p>
        </div>
      </div>

      <div className="flex gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`w-full flex items-start gap-3 px-3 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selected === c.id ? "bg-indigo-50" : ""}`}>
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${c.color}`}>{c.avatar}</div>
                  {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{c.customer}</span>
                    <span className="text-[10px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-[10px] text-indigo-500 font-medium mb-0.5">{c.project}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{c.unread}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {conv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${conv.color}`}>{conv.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{conv.customer}</p>
                  <p className="text-[10px] text-gray-400">{conv.project} · {conv.online ? "Online" : "Offline"}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {convoMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                    {msg.from !== "me" && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 shrink-0 mt-auto ${conv.color}`}>{conv.avatar}</div>
                    )}
                    <div className={`max-w-xs px-3.5 py-2.5 rounded-2xl text-sm ${msg.from === "me" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-0.5 ${msg.from === "me" ? "text-indigo-200" : "text-gray-400"} text-right`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><Paperclip className="w-4 h-4" /></button>
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type a message…" className="flex-1 h-9 text-sm" />
                <Button onClick={handleSend} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <MessageCircle className="w-8 h-8 mr-2 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
