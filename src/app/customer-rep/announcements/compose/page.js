"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Send, Loader2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useSupportAssignedTickets } from "@/hooks/useQueryHooks";
import { api } from "@/lib/helper";
import { AnnouncementFormModal } from "@/components/shared/announcements";

const ALLOWED_AUDIENCE_ROLES = ["customer", "customer-rep"];
const DEFAULT_FORM = {
  title: "",
  body: "",
  type: "general",
  roles: ["customer"],
  pinned: false,
};

function uniqueTagsFromTickets(tickets) {
  const set = new Set();
  for (const t of tickets || []) {
    (t.tags || []).forEach((tag) => tag && set.add(tag));
    if (t.category) set.add(t.category);
  }
  return Array.from(set).sort();
}

export default function CustomerRepAnnouncementsCompose() {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeTagFilter, setActiveTagFilter] = useState(null);

  const { data: ticketsRaw } = useSupportAssignedTickets(userId);
  const tickets = useMemo(() => {
    const raw = ticketsRaw;
    return Array.isArray(raw) ? raw : raw?.data || [];
  }, [ticketsRaw]);

  const ticketTags = useMemo(() => uniqueTagsFromTickets(tickets), [tickets]);

  const filteredTickets = useMemo(() => {
    if (!activeTagFilter) return tickets;
    return tickets.filter(
      (t) =>
        (t.tags || []).includes(activeTagFilter) || t.category === activeTagFilter
    );
  }, [tickets, activeTagFilter]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      api("/api/announcements/create", "POST", { ...form, createdBy: userId }),
    onSuccess: (res) => {
      if (res.ok) {
        showAlert("Announcement saved as draft", "success");
        setShowForm(false);
        setForm(DEFAULT_FORM);
        queryClient.invalidateQueries({ queryKey: ["customer-rep", "announcements"] });
      } else {
        showAlert(res.data?.message || "Failed to save", "error");
      }
    },
    onError: () => showAlert("Something went wrong", "error"),
  });

  function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      showAlert("Title and content required", "error");
      return;
    }
    if (form.roles.length === 0) {
      showAlert("Select at least one audience role", "error");
      return;
    }
    saveMutation.mutate();
  }

  function openCompose(tag) {
    setForm({
      ...DEFAULT_FORM,
      title: tag ? `Update on ${tag} tickets` : "",
      body: tag
        ? `Hi everyone, here's an update related to your ${tag} tickets:\n\n`
        : "",
    });
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Compose Announcement</h1>
            <p className="text-xs text-gray-500">
              Draft announcements for your customers and fellow support reps
            </p>
          </div>
        </div>
        <Button
          onClick={() => openCompose()}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-teal-500" />
            Filter assigned tickets by tag
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {ticketTags.length === 0 ? (
            <p className="text-xs text-gray-400">
              No tags found on your assigned tickets yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTagFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  activeTagFilter === null
                    ? "bg-teal-50 border-teal-300 text-teal-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-teal-200"
                }`}
              >
                All ({tickets.length})
              </button>
              {ticketTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    activeTagFilter === tag
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-teal-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Send className="w-4 h-4 text-teal-500" />
            {activeTagFilter
              ? `Tickets tagged "${activeTagFilter}" (${filteredTickets.length})`
              : `Your assigned tickets (${filteredTickets.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredTickets.length === 0 ? (
            <p className="text-xs text-gray-400">No tickets match this filter.</p>
          ) : (
            <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {filteredTickets.slice(0, 25).map((t) => (
                <li
                  key={t._id || t.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {t.subject || t.title || "Untitled ticket"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(t.tags || []).slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-white text-gray-500 border border-gray-200 text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {t.category && (
                        <Badge className="bg-teal-50 text-teal-600 border border-teal-100 text-[10px] px-1.5 py-0">
                          {t.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openCompose(t.category || (t.tags || [])[0])}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap"
                  >
                    Compose for tag
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AnnouncementFormModal
        open={showForm}
        editing={null}
        form={form}
        setForm={setForm}
        saving={saveMutation.isPending}
        onSave={handleSave}
        onClose={() => setShowForm(false)}
        allowedRoles={ALLOWED_AUDIENCE_ROLES}
      />

      {showForm && (
        <noscript />
      )}

      {!showForm && saveMutation.isPending && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-2.5 flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
          Saving…
        </div>
      )}
    </div>
  );
}
