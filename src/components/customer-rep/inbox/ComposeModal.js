"use client";

import React, { useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useSendMessage } from "@/hooks/useQueryHooks";
import { getUserName } from "./constants";

export default function ComposeModal({ userId, contacts, onClose, replyTo }) {
  const { showAlert } = useAlert();
  const sendMutation = useSendMessage();
  const [to, setTo] = useState(replyTo?.from?._id || "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody] = useState("");

  const handleSend = async () => {
    if (!to || !subject.trim() || !body.trim()) {
      showAlert("Please fill all fields", "error");
      return;
    }
    try {
      await sendMutation.mutateAsync({
        from: userId,
        to,
        subject: subject.trim(),
        body: body.trim(),
        parentMessageId: replyTo?._id,
      });
      showAlert("Message sent", "success");
      onClose();
    } catch (e) {
      showAlert(e.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
          <span className="font-semibold text-sm">{replyTo ? "Reply" : "New Message"}</span>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="To..." />
              </SelectTrigger>
              <SelectContent>
                {(contacts || []).filter((c) => c._id !== userId).map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {getUserName(c)} ({c.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9"
          />
          <Textarea
            placeholder="Write your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
